import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('useTheme', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('initializes from saved dark theme', async () => {
    localStorage.setItem('theme', 'dark')
    const { useTheme } = await import('../useTheme')

    const { initTheme, isDark, theme } = useTheme()
    initTheme()

    expect(theme.value).toBe('dark')
    expect(isDark.value).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('initializes from saved light theme', async () => {
    localStorage.setItem('theme', 'light')
    document.documentElement.classList.add('dark')
    const { useTheme } = await import('../useTheme')

    const { initTheme, isDark, theme } = useTheme()
    initTheme()

    expect(theme.value).toBe('light')
    expect(isDark.value).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('toggles theme and persists it', async () => {
    localStorage.setItem('theme', 'light')
    const { useTheme } = await import('../useTheme')

    const { initTheme, toggleTheme, isDark, theme } = useTheme()
    initTheme()
    toggleTheme()

    expect(theme.value).toBe('dark')
    expect(isDark.value).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('reflects an existing document dark class before explicit initialization', async () => {
    document.documentElement.classList.add('dark')
    const { useTheme } = await import('../useTheme')

    const { isDark, theme } = useTheme()

    expect(theme.value).toBe('dark')
    expect(isDark.value).toBe(true)
  })

  it('falls back to prefers-color-scheme when no saved theme exists', async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    })))
    const { useTheme } = await import('../useTheme')

    const { initTheme, theme } = useTheme()
    initTheme()

    expect(theme.value).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
