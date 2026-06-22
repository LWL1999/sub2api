import { readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const testDir = dirname(fileURLToPath(import.meta.url))
const authLayoutSource = readFileSync(resolve(testDir, '../AuthLayout.vue'), 'utf8')
const authViewsDir = resolve(testDir, '../../../views/auth')
const loginViewSource = readFileSync(resolve(authViewsDir, 'LoginView.vue'), 'utf8')

describe('AuthLayout gateway variant', () => {
  it('keeps the classic auth shell as the default variant', () => {
    expect(authLayoutSource).toContain("variant?: 'classic' | 'gateway'")
    expect(authLayoutSource).toContain("variant: 'classic'")
    expect(authLayoutSource).toContain('isGatewayVariant')
  })

  it('uses the gateway variant only on the login view', () => {
    expect(loginViewSource).toContain('<AuthLayout variant="gateway">')

    const otherAuthViews = readdirSync(authViewsDir)
      .filter((fileName) => fileName.endsWith('View.vue') && fileName !== 'LoginView.vue')

    for (const fileName of otherAuthViews) {
      const source = readFileSync(resolve(authViewsDir, fileName), 'utf8')
      expect(source, fileName).not.toContain('variant="gateway"')
    }
  })

  it('uses the compact IDE preview in the gateway auth shell', () => {
    expect(authLayoutSource).toContain("import GatewayCodePreview from '@/components/home/GatewayCodePreview.vue'")
    expect(authLayoutSource).toContain('<GatewayCodePreview mode="auth"')
    expect(authLayoutSource).toContain('auth-ide-workspace')
    expect(authLayoutSource).toContain('auth-login-console')
  })

  it('prioritizes the login panel before decorative gateway context on smaller screens', () => {
    expect(authLayoutSource).toContain('.auth-gateway-panel')
    expect(authLayoutSource).toContain('@media (max-width: 1023px)')
    expect(authLayoutSource).toContain('order: -1;')
    expect(authLayoutSource).toContain('.auth-ide-workspace')
    expect(authLayoutSource).toContain('max-height')
  })

  it('lets the login form opt into restrained gateway terminal styling without changing auth logic', () => {
    expect(loginViewSource).toContain('login-gateway-form')
    expect(loginViewSource).toContain('login-gateway-field')
    expect(loginViewSource).toContain('login-gateway-submit')
    expect(loginViewSource).toContain('authActionDisabled')
    expect(loginViewSource).toContain('handleLogin')
  })
})
