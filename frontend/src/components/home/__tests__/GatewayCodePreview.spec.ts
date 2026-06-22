import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const componentPath = resolve(dirname(fileURLToPath(import.meta.url)), '../GatewayCodePreview.vue')
const componentSource = existsSync(componentPath) ? readFileSync(componentPath, 'utf8') : ''

describe('GatewayCodePreview source contract', () => {
  it('defines the home/auth modes and animated prop defaults', () => {
    expect(existsSync(componentPath)).toBe(true)
    expect(componentSource).toContain("mode?: 'home' | 'auth'")
    expect(componentSource).toContain("mode: 'home'")
    expect(componentSource).toContain('animated: true')
  })

  it('renders a fuller home IDE and a compact auth console', () => {
    expect(componentSource).toContain('gateway-code-preview--home')
    expect(componentSource).toContain('gateway-code-preview--auth')
    expect(componentSource).toContain('v-if="isHomeMode"')
    expect(componentSource).toContain('api-gateway.ts')
    expect(componentSource).toContain('auth.guard.ts')
    expect(componentSource).toContain('terminalRows')
    expect(componentSource).toContain('modelRows')
  })

  it('can disable animation classes for reduced motion or tests', () => {
    expect(componentSource).toContain("animated ? 'is-animated' : 'is-static'")
    expect(componentSource).toContain('previewCursorClass')
    expect(componentSource).toContain('@media (prefers-reduced-motion: reduce)')
  })
})
