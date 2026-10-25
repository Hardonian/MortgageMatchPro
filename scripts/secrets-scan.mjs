#!/usr/bin/env node

import { execFileSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join, relative } from 'path'
import { fileURLToPath } from 'url'

const projectRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const reportPath = join(projectRoot, 'secrets-scan-report.json')
const textExtensions = new Set(['.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx', '.json', '.yml', '.yaml', '.env'])
const ignoredDirectories = new Set(['node_modules', '.git', '.next', 'coverage', 'playwright-report', 'test-results'])

// High-confidence patterns only. The scanner never writes matched values to its report.
const patterns = [
  { name: 'OpenAI API key', severity: 'critical', expression: /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/g },
  { name: 'Stripe secret key', severity: 'critical', expression: /\bsk_(?:live|test)_[A-Za-z0-9]{24,}\b/g },
  { name: 'Stripe webhook secret', severity: 'high', expression: /\bwhsec_[A-Za-z0-9]{24,}\b/g },
  { name: 'GitHub token', severity: 'critical', expression: /\b(?:ghp|gho|ghs)_[A-Za-z0-9]{30,}\b|\bgithub_pat_[A-Za-z0-9_]{40,}\b/g },
  { name: 'AWS access key', severity: 'critical', expression: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g },
  { name: 'private key', severity: 'critical', expression: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/g },
  { name: 'database connection string with credentials', severity: 'critical', expression: /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s:'"/]+:[^\s@'"/]+@[^\s'"/]+/gi },
  { name: 'Redis connection string with credentials', severity: 'high', expression: /\bredis:\/\/[^\s:'"/]+:[^\s@'"/]+@[^\s'"/]+/gi },
]

function isCandidate(file) {
  const segments = file.split(/[\\/]/)
  if (segments.some((segment) => ignoredDirectories.has(segment))) return false
  return textExtensions.has(file.slice(file.lastIndexOf('.')))
}

function trackedFiles() {
  const output = execFileSync('git', ['ls-files', '-z'], { cwd: projectRoot, encoding: 'utf8' })
  return output.split('\0').filter(Boolean).filter(isCandidate)
}

function lineAt(source, index) {
  return source.slice(0, index).split('\n').length
}

function isNonSecretExample(value, line) {
  return /placeholder|example|your[_-]?|changeme|dummy|postgres:postgres@localhost/i.test(value)
    || /\$\{|\$\{\{|process\.env|BEGIN .*PRIVATE KEY-----\/g/.test(line)
}

function scanFile(file) {
  const absolutePath = join(projectRoot, file)
  if (!existsSync(absolutePath)) return []

  const source = readFileSync(absolutePath, 'utf8')
  const findings = []
  for (const { name, severity, expression } of patterns) {
    for (const match of source.matchAll(expression)) {
      const value = match[0]
      const lineNumber = lineAt(source, match.index ?? 0)
      const line = source.split('\n')[lineNumber - 1] ?? ''
      if (isNonSecretExample(value, line)) continue
      findings.push({ file, line: lineNumber, type: name, severity })
    }
  }
  return findings
}

function main() {
  const findings = trackedFiles().flatMap(scanFile)
  const report = {
    timestamp: new Date().toISOString(),
    scannedFiles: trackedFiles().length,
    totalFindings: findings.length,
    critical: findings.filter(({ severity }) => severity === 'critical').length,
    high: findings.filter(({ severity }) => severity === 'high').length,
    findings,
    note: 'Values are deliberately redacted. GitHub secret scanning remains the control for repository history.',
  }

  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
  console.log(`Scanned ${report.scannedFiles} tracked text files.`)
  console.log(`Critical: ${report.critical}; high: ${report.high}.`)
  for (const finding of findings) console.log(`${finding.severity}: ${finding.type} in ${finding.file}:${finding.line}`)

  if (report.critical || report.high) process.exitCode = 1
}

main()
