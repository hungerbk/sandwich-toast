import { readdirSync, readFileSync, statSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const assets = resolve(root, 'src/lib/assets')
const imageBytes = readdirSync(assets)
  .filter(name => name.endsWith('.webp'))
  .reduce((total, name) => total + statSync(resolve(assets, name)).size, 0)

// #40에서 정한 예산. ESM/CJS는 대체 형식이므로 합산하지 않는다.
let exceeded = false
function check(label, actual, limit) {
  const ok = actual <= limit
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: ${actual.toLocaleString('en-US')} / ${limit.toLocaleString('en-US')} bytes`)
  if (!ok) exceeded = true
}
check('WebP total', imageBytes, 90_000)
for (const [name, limit] of [['sandwich-toast.es.js', 145_000], ['sandwich-toast.cjs', 140_000]]) {
  const content = readFileSync(resolve(root, 'dist', name))
  check(name, content.length, limit)
  check(`${name} gzip`, gzipSync(content).length, 100_000)
}
if (exceeded) process.exitCode = 1
