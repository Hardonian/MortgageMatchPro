#!/usr/bin/env node

const http = require('http')
const https = require('https')
const { writeFileSync } = require('fs')
const { join } = require('path')

function request(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http
    const startedAt = Date.now()
    const req = client.get(url, { timeout: 5000 }, (res) => {
      let body = ''
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => resolve({ status: res.statusCode, body, latency: Date.now() - startedAt }))
    })
    req.on('timeout', () => req.destroy(new Error('Request timed out')))
    req.on('error', reject)
  })
}

async function check(name, url, validate) {
  try {
    const result = await request(url)
    const success = result.status === 200 && validate(result.body)
    console.log(`${success ? 'PASS' : 'FAIL'} ${name} (${result.latency}ms)`)
    return { success, status: result.status, latency: result.latency }
  } catch (error) {
    console.log(`FAIL ${name}: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function main() {
  const baseUrl = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '')
  const checks = {
    home: await check('home', baseUrl, (body) => body.includes('MortgageMatch')),
    health: await check('health', `${baseUrl}/api/health`, (body) => JSON.parse(body).status === 'ok'),
    readiness: await check('readiness', `${baseUrl}/api/healthz`, (body) => JSON.parse(body).status === 'ok'),
  }
  const report = { timestamp: new Date().toISOString(), target: baseUrl, checks }
  writeFileSync(join(process.cwd(), 'health-check-report.json'), `${JSON.stringify(report, null, 2)}\n`)
  if (Object.values(checks).some((check) => !check.success)) process.exitCode = 1
}

main()
