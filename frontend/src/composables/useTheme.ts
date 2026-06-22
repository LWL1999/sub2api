import { computed, readonly, ref } from 'vue'

export type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'theme'

function prefersDark(): boolean {
  return typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
}

function readDocumentTheme(): Theme | null {
  if (typeof document === 'undefined') return null
  return document.documentElement.classList.contains('dark') ? 'dark' : null
}

function applyTheme(nextTheme: Theme): void {
  theme.value = nextTheme

  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
  }
}

function readSavedTheme(): Theme | null {
  if (typeof localStorage === 'undefined') return null

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : null
}

function readInitialTheme(): Theme {
  return readSavedTheme() ?? readDocumentTheme() ?? 'light'
}

const theme = ref<Theme>(readInitialTheme())

export function initTheme(): void {
  applyTheme(readSavedTheme() ?? readDocumentTheme() ?? (prefersDark() ? 'dark' : 'light'))
}

export function setTheme(nextTheme: Theme): void {
  applyTheme(nextTheme)

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  }
}

export function toggleTheme(): void {
  setTheme(theme.value === 'dark' ? 'light' : 'dark')
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== THEME_STORAGE_KEY) return
    if (event.newValue === 'dark' || event.newValue === 'light') {
      applyTheme(event.newValue)
    }
  })
}

export function useTheme() {
  return {
    theme: readonly(theme),
    isDark: computed(() => theme.value === 'dark'),
    initTheme,
    setTheme,
    toggleTheme
  }
}
