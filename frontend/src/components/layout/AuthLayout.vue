<template>
  <div
    v-if="!isGatewayVariant"
    class="relative flex min-h-screen items-center justify-center overflow-hidden p-4"
  >
    <!-- Background -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950"
    ></div>

    <!-- Decorative Elements -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <!-- Gradient Orbs -->
      <div
        class="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary-400/20 blur-3xl"
      ></div>
      <div
        class="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary-500/15 blur-3xl"
      ></div>
      <div
        class="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-300/10 blur-3xl"
      ></div>

      <!-- Grid Pattern -->
      <div
        class="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"
      ></div>
    </div>

    <!-- Content Container -->
    <div class="relative z-10 w-full max-w-md">
      <!-- Logo/Brand -->
      <div class="mb-8 text-center">
        <!-- Custom Logo or Default Logo -->
        <template v-if="settingsLoaded">
          <div
            class="mb-4 inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl shadow-lg shadow-primary-500/30"
          >
            <img :src="siteLogo || '/logo.png'" alt="Logo" class="h-full w-full object-contain" />
          </div>
          <h1 class="text-gradient mb-2 text-3xl font-bold">
            {{ siteName }}
          </h1>
          <p class="text-sm text-gray-500 dark:text-dark-400">
            {{ siteSubtitle }}
          </p>
        </template>
      </div>

      <!-- Card Container -->
      <div class="card-glass rounded-2xl p-8 shadow-glass">
        <slot />
      </div>

      <!-- Footer Links -->
      <div class="mt-6 text-center text-sm">
        <slot name="footer" />
      </div>

      <!-- Copyright -->
      <div class="mt-8 text-center text-xs text-gray-400 dark:text-dark-500">
        &copy; {{ currentYear }} {{ siteName }}. All rights reserved.
      </div>
    </div>
  </div>

  <div v-else class="auth-gateway-shell min-h-screen">
    <div class="auth-gateway-grid" aria-hidden="true"></div>

    <header class="relative z-10 px-4 py-4 sm:px-6 lg:px-8">
      <nav class="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
        <router-link to="/" class="auth-gateway-brand">
          <span class="auth-gateway-logo">
            <img :src="siteLogo || '/logo.png'" alt="Logo" class="h-full w-full object-contain" />
          </span>
          <span class="min-w-0">
            <span class="auth-gateway-kicker">AI API Gateway</span>
            <span class="auth-gateway-name">{{ siteName }}</span>
          </span>
        </router-link>

        <div class="auth-gateway-status">
          <span class="auth-gateway-status-dot"></span>
          <span>ONLINE</span>
        </div>
      </nav>
    </header>

    <main class="relative z-10 px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-14 lg:pt-10">
      <div class="auth-gateway-content mx-auto grid w-full max-w-7xl gap-6">
        <section class="auth-ide-workspace">
          <div class="auth-gateway-eyebrow">
            <span></span>
            <strong>secure entry</strong>
          </div>

          <h1>{{ siteName }}</h1>
          <p>{{ siteSubtitle }}</p>

          <GatewayCodePreview mode="auth" class="auth-login-console" />
        </section>

        <section class="auth-gateway-panel">
          <div class="auth-gateway-panel-bar">
            <span></span>
            <strong>login terminal</strong>
          </div>

          <div class="auth-gateway-card">
            <slot />
          </div>

          <div class="mt-5 text-center text-sm">
            <slot name="footer" />
          </div>
        </section>
      </div>

      <div class="auth-gateway-copyright">
        &copy; {{ currentYear }} {{ siteName }}. All rights reserved.
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAppStore } from '@/stores'
import GatewayCodePreview from '@/components/home/GatewayCodePreview.vue'
import { sanitizeUrl } from '@/utils/url'

const props = withDefaults(defineProps<{
  variant?: 'classic' | 'gateway'
}>(), {
  variant: 'classic'
})

const appStore = useAppStore()

const siteName = computed(() => appStore.siteName || 'Sub2API')
const siteLogo = computed(() => sanitizeUrl(appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const siteSubtitle = computed(() => appStore.cachedPublicSettings?.site_subtitle || 'Subscription to API Conversion Platform')
const settingsLoaded = computed(() => appStore.publicSettingsLoaded)
const isGatewayVariant = computed(() => props.variant === 'gateway')

const currentYear = computed(() => new Date().getFullYear())

onMounted(() => {
  appStore.fetchPublicSettings()
})
</script>

<style scoped>
.text-gradient {
  @apply bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent;
}

.auth-gateway-shell {
  --auth-bg: #f9fafb;
  --auth-grid: rgba(20, 184, 166, 0.055);
  --auth-text: #374151;
  --auth-strong: #111827;
  --auth-muted: #6b7280;
  --auth-surface: rgba(255, 255, 255, 0.9);
  --auth-surface-strong: #ffffff;
  --auth-border: rgba(17, 24, 39, 0.1);
  --auth-border-strong: rgba(17, 24, 39, 0.18);
  --auth-accent: #14b8a6;
  --auth-accent-strong: #0f766e;
  --auth-accent-muted: rgba(20, 184, 166, 0.1);
  --auth-shadow: 0 18px 46px rgba(15, 23, 42, 0.12);
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(180deg, var(--auth-bg), #eef2f7);
  color: var(--auth-text);
}

.dark .auth-gateway-shell {
  --auth-bg: #020617;
  --auth-grid: rgba(20, 184, 166, 0.06);
  --auth-text: #cbd5e1;
  --auth-strong: #f8fafc;
  --auth-muted: #94a3b8;
  --auth-surface: rgba(15, 23, 42, 0.88);
  --auth-surface-strong: #0f172a;
  --auth-border: rgba(148, 163, 184, 0.16);
  --auth-border-strong: rgba(148, 163, 184, 0.28);
  --auth-accent: #2dd4bf;
  --auth-accent-strong: #5eead4;
  --auth-accent-muted: rgba(45, 212, 191, 0.12);
  --auth-shadow: 0 22px 56px rgba(0, 0, 0, 0.34);
  background:
    linear-gradient(180deg, #020617, #0f172a);
}

.auth-gateway-grid {
  pointer-events: none;
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--auth-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--auth-grid) 1px, transparent 1px);
  background-size: 52px 52px;
  mask-image: linear-gradient(to bottom, black, transparent 85%);
}

.auth-gateway-brand {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 0.75rem;
  color: var(--auth-strong);
}

.auth-gateway-logo {
  display: inline-flex;
  height: 2.5rem;
  width: 2.5rem;
  flex: none;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--auth-border-strong);
  border-radius: 0.375rem;
  background: var(--auth-surface-strong);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

.auth-gateway-kicker,
.auth-gateway-name {
  display: block;
}

.auth-gateway-kicker {
  color: var(--auth-accent-strong);
  font-size: 0.6875rem;
  font-weight: 800;
  line-height: 1.1;
  text-transform: uppercase;
}

.auth-gateway-name {
  max-width: 14rem;
  overflow: hidden;
  color: var(--auth-strong);
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.auth-gateway-status {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid var(--auth-border);
  border-radius: 0.375rem;
  background: var(--auth-surface);
  padding: 0.55rem 0.7rem;
  color: var(--auth-muted);
  font-size: 0.72rem;
  font-weight: 800;
}

.auth-gateway-status-dot {
  height: 0.5rem;
  width: 0.5rem;
  border-radius: 999px;
  background: var(--auth-accent);
  box-shadow: 0 0 0 4px var(--auth-accent-muted);
}

.auth-gateway-content {
  grid-template-columns: minmax(0, 1fr) minmax(22rem, 28rem);
  align-items: center;
  min-height: min(760px, calc(100vh - 11rem));
}

.auth-ide-workspace {
  max-width: 42rem;
  min-width: 0;
}

.auth-gateway-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.4rem;
  color: var(--auth-accent-strong);
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
}

.auth-gateway-eyebrow span {
  height: 0.65rem;
  width: 0.65rem;
  border-radius: 0.125rem;
  background: var(--auth-accent);
}

.auth-ide-workspace h1 {
  max-width: 38rem;
  overflow-wrap: anywhere;
  color: var(--auth-strong);
  font-size: clamp(3.6rem, 7vw, 5.1rem);
  font-weight: 900;
  line-height: 0.92;
}

.auth-ide-workspace p {
  margin-top: 1.25rem;
  max-width: 36rem;
  color: var(--auth-muted);
  font-size: 1rem;
  line-height: 1.8;
}

.auth-login-console {
  margin-top: 2rem;
  max-width: 38rem;
}

.auth-gateway-panel {
  width: min(100%, 28rem);
  min-width: 0;
  justify-self: end;
  border: 1px solid var(--auth-border-strong);
  border-radius: 0.5rem;
  background: var(--auth-surface-strong);
  box-shadow: var(--auth-shadow);
  padding: 0.7rem;
}

.auth-gateway-panel-bar {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  border-bottom: 1px solid var(--auth-border);
  padding: 0.3rem 0.25rem 0.85rem;
  color: var(--auth-muted);
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.auth-gateway-panel-bar span {
  height: 0.55rem;
  width: 0.55rem;
  border-radius: 999px;
  background: var(--auth-accent);
}

.auth-gateway-card {
  padding: 1.75rem 1.35rem 1.1rem;
}

.auth-gateway-copyright {
  margin: 2rem auto 0;
  max-width: 80rem;
  color: var(--auth-muted);
  font-size: 0.75rem;
  text-align: center;
}

@media (max-width: 1023px) {
  .auth-gateway-content {
    grid-template-columns: 1fr;
    align-items: start;
    min-height: 0;
  }

  .auth-ide-workspace {
    width: min(100%, 32rem);
    max-width: none;
    max-height: 20rem;
    margin: 0 auto;
    overflow: hidden;
    opacity: 0.94;
  }

  .auth-gateway-eyebrow {
    margin-bottom: 0.75rem;
  }

  .auth-ide-workspace h1 {
    font-size: 2.45rem;
    line-height: 1;
  }

  .auth-ide-workspace p {
    margin-top: 0.65rem;
    font-size: 0.9rem;
    line-height: 1.65;
  }

  .auth-login-console {
    margin-top: 1rem;
  }

  .auth-gateway-panel {
    order: -1;
    justify-self: stretch;
    width: 100%;
    max-width: 32rem;
    margin: 0 auto;
  }
}

@media (max-width: 640px) {
  .auth-ide-workspace h1 {
    font-size: 2.1rem;
  }

  .auth-gateway-card {
    padding: 1.4rem 0.8rem 0.9rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-gateway-shell *,
  .auth-gateway-shell *::before,
  .auth-gateway-shell *::after {
    animation: none !important;
    transition: none !important;
  }
}
</style>
