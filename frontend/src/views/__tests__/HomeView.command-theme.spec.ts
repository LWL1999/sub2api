import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const viewPath = resolve(dirname(fileURLToPath(import.meta.url)), '../HomeView.vue')
const viewSource = readFileSync(viewPath, 'utf8')

describe('HomeView command theme integration', () => {
  it('keeps custom home content ahead of the redesigned default home shell', () => {
    const customContentIndex = viewSource.indexOf('v-if="homeContent"')
    const defaultShellIndex = viewSource.indexOf('home-command-shell')

    expect(customContentIndex).toBeGreaterThanOrEqual(0)
    expect(defaultShellIndex).toBeGreaterThanOrEqual(0)
    expect(customContentIndex).toBeLessThan(defaultShellIndex)
  })

  it('uses the IDE gateway workspace instead of the old route exchange panel', () => {
    expect(viewSource).not.toContain("import OrbCommandBackground from '@/components/home/OrbCommandBackground.vue'")
    expect(viewSource).not.toContain('<OrbCommandBackground')
    expect(viewSource).not.toContain('interactive')
    expect(viewSource).not.toContain('home-orb-float')
    expect(viewSource).not.toContain('home-gateway-panel')
    expect(viewSource).not.toContain('home-route-line')
    expect(viewSource).toContain('home-command-shell')
    expect(viewSource).toContain("import GatewayCodePreview from '@/components/home/GatewayCodePreview.vue'")
    expect(viewSource).toContain('<GatewayCodePreview mode="home"')
    expect(viewSource).toContain('home-ide-workspace')
    expect(viewSource).toContain('Gateway IDE Workspace')
    expect(viewSource).toContain('home-route-table')
    expect(viewSource).toContain('home-model-pool')
  })

  it('uses the shared theme composable instead of local theme state', () => {
    expect(viewSource).toContain("import { useTheme } from '@/composables/useTheme'")
    expect(viewSource).toContain('const { isDark, toggleTheme } = useTheme()')
    expect(viewSource).not.toContain("localStorage.setItem('theme'")
    expect(viewSource).not.toContain("classList.toggle('dark'")
  })

  it('keeps the enterprise gateway shell restrained and responsive', () => {
    expect(viewSource).toContain('home-command-shell')
    expect(viewSource).toContain('home-route-table')
    expect(viewSource).toContain('home-provider-name')
    expect(viewSource).toContain('text-overflow: ellipsis')
    expect(viewSource).toContain('@media (prefers-reduced-motion: reduce)')
    expect(viewSource).not.toContain('blur-3xl')
    expect(viewSource).not.toContain('home-orb')
  })
})
