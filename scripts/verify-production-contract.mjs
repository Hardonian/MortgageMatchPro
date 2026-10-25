import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = process.cwd()
const proxySource = await readFile(resolve(root, 'proxy.page.ts'), 'utf8')
const specification = await readFile(resolve(root, 'DOCS/api/production-openapi.yaml'), 'utf8')

const allowlistBlock = proxySource.match(/const productionApiAllowlist\s*=\s*\[([\s\S]*?)\n\]/)
if (!allowlistBlock) throw new Error('Could not read productionApiAllowlist from proxy.page.ts')

const allowlistedRoutes = [...allowlistBlock[1].matchAll(/^\s*'([^']+)',/gm)].map((match) => match[1])
const documentedRoutes = [...specification.matchAll(/^\s{2}(\/api\/[^:]+):\s*$/gm)].map((match) => match[1])

const missingFromSpecification = allowlistedRoutes.filter((route) => !documentedRoutes.includes(route))
const undocumentedProductionRoutes = documentedRoutes.filter((route) => !allowlistedRoutes.includes(route))

if (missingFromSpecification.length || undocumentedProductionRoutes.length) {
  const messages = []
  if (missingFromSpecification.length) messages.push(`missing from OpenAPI: ${missingFromSpecification.join(', ')}`)
  if (undocumentedProductionRoutes.length) messages.push(`not allowlisted in production: ${undocumentedProductionRoutes.join(', ')}`)
  throw new Error(`Production API contract drift: ${messages.join('; ')}`)
}

console.log(`Production API contract verified for ${allowlistedRoutes.length} allowlisted routes.`)
