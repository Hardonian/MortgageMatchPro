#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import { join, relative } from 'path'
import { fileURLToPath } from 'url'
import { gzipSync } from 'zlib'

const projectRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const nextDir = join(projectRoot, '.next')
const budgets = { clientWarn: 150 * 1024, clientFail: 200 * 1024, routeWarn: 150 * 1024, routeFail: 250 * 1024 }

function filesIn(directory) {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name)
    return entry.isDirectory() ? filesIn(fullPath) : [fullPath]
  })
}

function status(size, warn, fail) {
  if (size > fail) return 'error'
  if (size > warn) return 'warning'
  return 'ok'
}

function bytes(value) {
  return `${(value / 1024).toFixed(value > 1024 * 1024 ? 2 : 0)} KB`
}

function compressedSize(files) {
  return files.reduce((total, file) => total + gzipSync(readFileSync(file)).length, 0)
}

function main() {
  if (!existsSync(nextDir)) throw new Error('No .next build output found. Run npm run build first.')

  const manifest = JSON.parse(readFileSync(join(nextDir, 'build-manifest.json'), 'utf8'))
  const clientAssets = new Set([
    ...(manifest.pages['/'] || []),
    ...(manifest.pages['/_app'] || []),
  ].filter((asset) => asset.endsWith('.js')))
  const clientFiles = [...clientAssets].map((asset) => join(nextDir, asset)).filter(existsSync)
  const routeFiles = filesIn(join(nextDir, 'server', 'pages', 'api')).filter((file) => file.endsWith('.js'))
  const clientSize = compressedSize(clientFiles)
  const routes = Object.fromEntries(routeFiles.map((file) => {
    const compressedBytes = gzipSync(readFileSync(file)).length
    return [`/${relative(join(nextDir, 'server', 'pages'), file).replace(/\\/g, '/').replace(/\.js$/, '')}`, { bytes: compressedBytes, status: status(compressedBytes, budgets.routeWarn, budgets.routeFail) }]
  }))
  const report = {
    timestamp: new Date().toISOString(),
    client: { bytes: clientSize, files: clientFiles.length, status: status(clientSize, budgets.clientWarn, budgets.clientFail) },
    routes,
    errors: Object.entries(routes).filter(([, value]) => value.status === 'error').map(([route]) => route),
  }
  if (report.client.status === 'error') report.errors.unshift('client')

  writeFileSync(join(projectRoot, 'bundle-analysis-report.json'), `${JSON.stringify(report, null, 2)}\n`)
  console.log(`Initial client JavaScript (gzip): ${bytes(clientSize)} across ${clientFiles.length} files (${report.client.status}).`)
  console.log(`API route bundles: ${routeFiles.length}.`)
  if (report.errors.length) {
    console.error(`Bundle budget exceeded: ${report.errors.join(', ')}`)
    process.exitCode = 1
  }
}

main()
