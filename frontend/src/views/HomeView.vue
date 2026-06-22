<template>
  <div v-if="homeContent" class="min-h-screen">
    <iframe
      v-if="isHomeContentUrl"
      :src="homeContent.trim()"
      class="h-screen w-full border-0"
      allowfullscreen
    ></iframe>
    <div v-else v-html="homeContent"></div>
  </div>

  <div v-else class="home-command-shell min-h-screen">
    <header class="home-topbar relative z-10 px-4 py-4 sm:px-6 lg:px-8">
      <nav class="home-topbar-inner mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="home-logo-box flex h-10 w-10 items-center justify-center overflow-hidden rounded">
            <img :src="siteLogo || '/logo.png'" alt="Logo" class="h-full w-full object-contain" />
          </div>
          <div class="hidden min-w-0 sm:block">
            <div class="home-brand-kicker text-[11px] uppercase">
              AI API Gateway
            </div>
            <div class="home-brand-name truncate text-sm font-semibold">
              {{ siteName }}
            </div>
          </div>
        </div>

        <div class="home-topbar-actions flex items-center gap-2 sm:gap-3">
          <LocaleSwitcher />

          <a
            v-if="docUrl"
            :href="docUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="home-icon-button"
            :title="t('home.viewDocs')"
          >
            <Icon name="book" size="md" />
          </a>

          <button
            @click="toggleTheme"
            class="home-icon-button"
            :title="isDark ? t('home.switchToLight') : t('home.switchToDark')"
          >
            <Icon v-if="isDark" name="sun" size="md" />
            <Icon v-else name="moon" size="md" />
          </button>

          <router-link
            v-if="isAuthenticated"
            :to="dashboardPath"
            class="home-cta-button"
          >
            <span class="home-user-avatar">{{ userInitial }}</span>
            <span class="hidden text-xs font-semibold sm:inline">{{ t('home.dashboard') }}</span>
            <Icon name="arrowRight" size="sm" class="home-action-icon" />
          </router-link>
          <router-link
            v-else
            to="/login"
            class="home-cta-button home-cta-button-login"
          >
            {{ t('home.login') }}
          </router-link>
        </div>
      </nav>
    </header>

    <main class="relative z-10 px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-14 lg:pt-10">
      <div class="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section class="home-dispatch-grid">
          <div class="home-hero-copy">
            <div class="home-eyebrow">
              <span class="home-eyebrow-dot"></span>
              <span>{{ t('home.tags.subscriptionToApi') }}</span>
            </div>

            <h1 class="home-title">
              {{ siteName }}
            </h1>

            <p class="home-subtitle">
              {{ siteSubtitle }}
            </p>

            <div class="home-hero-actions">
              <router-link
                :to="isAuthenticated ? dashboardPath : '/login'"
                class="btn btn-primary home-main-action"
              >
                {{ isAuthenticated ? t('home.goToDashboard') : t('home.getStarted') }}
                <Icon name="arrowRight" size="md" :stroke-width="2" />
              </router-link>
              <a
                v-if="docUrl"
                :href="docUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-secondary home-secondary-action"
              >
                <Icon name="book" size="sm" />
                <span>{{ t('home.docs') }}</span>
              </a>
            </div>

            <div class="home-status-rail" aria-label="Gateway capability summary">
              <div class="home-status-row">
                <span>01</span>
                <strong>{{ t('home.features.unifiedGateway') }}</strong>
                <em>/v1 compatible</em>
              </div>
              <div class="home-status-row">
                <span>02</span>
                <strong>{{ t('home.tags.stickySession') }}</strong>
                <em>session lock</em>
              </div>
              <div class="home-status-row">
                <span>03</span>
                <strong>{{ t('home.tags.realtimeBilling') }}</strong>
                <em>usage ledger</em>
              </div>
            </div>
          </div>

          <div class="home-ide-workspace" aria-label="Gateway IDE Workspace">
            <GatewayCodePreview mode="home" />
          </div>
        </section>

        <section class="home-route-table" aria-label="Gateway routing table">
          <div class="home-route-table__header">
            <span>stage</span>
            <span>operation</span>
            <span>runtime</span>
            <span>state</span>
          </div>
          <div class="home-route-table__row">
            <span>01</span>
            <strong>{{ t('home.features.unifiedGateway') }}</strong>
            <p>{{ t('home.features.unifiedGatewayDesc') }}</p>
            <em>/v1 compatible</em>
          </div>
          <div class="home-route-table__row">
            <span>02</span>
            <strong>{{ t('home.features.multiAccount') }}</strong>
            <p>{{ t('home.features.multiAccountDesc') }}</p>
            <em>pool ready</em>
          </div>
          <div class="home-route-table__row">
            <span>03</span>
            <strong>{{ t('home.features.balanceQuota') }}</strong>
            <p>{{ t('home.features.balanceQuotaDesc') }}</p>
            <em>metered</em>
          </div>
        </section>

        <section class="home-model-pool">
          <div class="home-section-heading">
            <h2>{{ t('home.providers.title') }}</h2>
            <p>{{ t('home.providers.description') }}</p>
          </div>

          <div class="home-provider-grid">
            <div class="home-provider-chip">
              <span class="home-provider-name">{{ t('home.providers.claude') }}</span>
              <span class="home-provider-badge">{{ t('home.providers.supported') }}</span>
            </div>
            <div class="home-provider-chip">
              <span class="home-provider-name">GPT</span>
              <span class="home-provider-badge">{{ t('home.providers.supported') }}</span>
            </div>
            <div class="home-provider-chip">
              <span class="home-provider-name">{{ t('home.providers.gemini') }}</span>
              <span class="home-provider-badge">{{ t('home.providers.supported') }}</span>
            </div>
            <div class="home-provider-chip">
              <span class="home-provider-name">{{ t('home.providers.antigravity') }}</span>
              <span class="home-provider-badge">{{ t('home.providers.supported') }}</span>
            </div>
            <div class="home-provider-chip home-provider-chip-muted">
              <span class="home-provider-name">{{ t('home.providers.more') }}</span>
              <span class="home-provider-badge home-provider-badge-muted">
                {{ t('home.providers.soon') }}
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>

    <footer class="home-footer relative z-10 px-4 pb-8 pt-2 sm:px-6 lg:px-8">
      <div class="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 border-t border-primary-300/10 pt-5 text-center sm:flex-row sm:text-left">
        <p class="home-footer-text text-sm">
          &copy; {{ currentYear }} {{ siteName }}. {{ t('home.footer.allRightsReserved') }}
        </p>
        <div class="flex items-center gap-4">
          <a
            v-if="docUrl"
            :href="docUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="home-footer-link text-sm transition-colors"
          >
            {{ t('home.docs') }}
          </a>
          <a
            :href="githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="home-footer-link text-sm transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore, useAppStore } from '@/stores'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import GatewayCodePreview from '@/components/home/GatewayCodePreview.vue'
import Icon from '@/components/icons/Icon.vue'
import { useTheme } from '@/composables/useTheme'

const { t } = useI18n()

const authStore = useAuthStore()
const appStore = useAppStore()

const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'Sub2API')
const siteLogo = computed(() => appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '')
const siteSubtitle = computed(() => appStore.cachedPublicSettings?.site_subtitle || 'AI API Gateway Platform')
const docUrl = computed(() => appStore.cachedPublicSettings?.doc_url || appStore.docUrl || '')
const homeContent = computed(() => appStore.cachedPublicSettings?.home_content || '')
const { isDark, toggleTheme } = useTheme()

const isHomeContentUrl = computed(() => {
  const content = homeContent.value.trim()
  return content.startsWith('http://') || content.startsWith('https://')
})

const githubUrl = 'https://github.com/Wei-Shaw/sub2api'

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)
const dashboardPath = computed(() => (isAdmin.value ? '/admin/dashboard' : '/dashboard'))
const userInitial = computed(() => {
  const user = authStore.user
  if (!user?.email) return ''
  return user.email.charAt(0).toUpperCase()
})
const currentYear = computed(() => new Date().getFullYear())

onMounted(() => {
  authStore.checkAuth()

  if (!appStore.publicSettingsLoaded) {
    appStore.fetchPublicSettings()
  }
})
</script>

<style scoped>
.home-command-shell {
  --ui-page-bg: #f9fafb;
  --ui-page-grid: rgba(20, 184, 166, 0.055);
  --ui-text: #374151;
  --ui-text-strong: #111827;
  --ui-text-muted: #6b7280;
  --ui-surface: rgba(255, 255, 255, 0.88);
  --ui-surface-strong: #ffffff;
  --ui-surface-muted: #f3f4f6;
  --ui-border: rgba(203, 213, 225, 0.82);
  --ui-border-strong: #cbd5e1;
  --ui-accent: #14b8a6;
  --ui-accent-strong: #0d9488;
  --ui-accent-muted: rgba(204, 251, 241, 0.82);
  --ui-success: #059669;
  --ui-shadow-subtle: 0 1px 2px rgba(15, 23, 42, 0.06);
  --ui-shadow-panel: 0 18px 44px rgba(15, 23, 42, 0.12);
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background:
    linear-gradient(var(--ui-page-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--ui-page-grid) 1px, transparent 1px),
    var(--ui-page-bg);
  background-size: 48px 48px, 48px 48px, auto;
  color: var(--ui-text);
}

.dark .home-command-shell {
  --ui-page-bg: #020617;
  --ui-page-grid: rgba(20, 184, 166, 0.06);
  --ui-text: #cbd5e1;
  --ui-text-strong: #f8fafc;
  --ui-text-muted: #94a3b8;
  --ui-surface: rgba(15, 23, 42, 0.9);
  --ui-surface-strong: #0f172a;
  --ui-surface-muted: #1e293b;
  --ui-border: rgba(51, 65, 85, 0.86);
  --ui-border-strong: #475569;
  --ui-accent: #14b8a6;
  --ui-accent-strong: #5eead4;
  --ui-accent-muted: rgba(20, 184, 166, 0.16);
  --ui-success: #34d399;
  --ui-shadow-subtle: 0 1px 2px rgba(0, 0, 0, 0.22);
  --ui-shadow-panel: 0 18px 44px rgba(0, 0, 0, 0.32);
}

.home-topbar-inner {
  border: 1px solid var(--ui-border);
  border-radius: 0.375rem;
  background: var(--ui-surface-strong);
  box-shadow: var(--ui-shadow-subtle);
  padding: 0.625rem 0.75rem;
}

.home-topbar-actions {
  margin-left: auto;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.home-logo-box {
  border: 1px solid var(--ui-border-strong);
  background: var(--ui-surface);
}

.home-brand-kicker {
  color: var(--ui-accent);
}

.home-brand-name {
  overflow-wrap: anywhere;
  color: var(--ui-text-strong);
}

.home-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 0.375rem;
  border: 1px solid var(--ui-border);
  background: var(--ui-surface);
  color: var(--ui-text);
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    color 0.15s ease;
}

.home-icon-button:hover {
  border-color: var(--ui-border-strong);
  background: var(--ui-surface-muted);
  color: var(--ui-text-strong);
}

.home-cta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid var(--ui-border-strong);
  background: var(--ui-surface);
  padding: 0.55rem 0.8rem;
  color: var(--ui-text-strong);
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.home-cta-button:hover {
  border-color: var(--ui-accent);
  background: var(--ui-accent-muted);
}

.home-action-icon {
  color: var(--ui-accent-strong);
}

.home-cta-button-login {
  padding: 0.55rem 0.95rem;
  font-size: 0.875rem;
  font-weight: 700;
}

.home-user-avatar {
  display: inline-flex;
  height: 1.55rem;
  width: 1.55rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  background: var(--ui-accent-muted);
  color: var(--ui-accent-strong);
  font-size: 0.7rem;
  font-weight: 800;
}

.home-dispatch-grid {
  display: grid;
  gap: 1.5rem;
  min-height: min(650px, calc(100vh - 12rem));
}

.home-hero-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
}

.home-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  width: fit-content;
  border-radius: 0.375rem;
  border: 1px solid var(--ui-border);
  background: var(--ui-surface);
  padding: 0.45rem 0.75rem;
  color: var(--ui-accent);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.home-eyebrow-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  background: var(--ui-success);
}

.home-title {
  max-width: 12ch;
  margin: 0;
  color: var(--ui-text-strong);
  font-size: 3.15rem;
  font-weight: 840;
  line-height: 0.96;
  letter-spacing: 0;
}

.home-subtitle {
  max-width: 54ch;
  margin: 0;
  color: var(--ui-text-muted);
  font-size: 1rem;
  line-height: 1.75;
}

.home-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.home-main-action,
.home-secondary-action {
  min-height: 2.875rem;
}

.home-status-rail {
  display: grid;
  max-width: 38rem;
  border: 1px solid var(--ui-border);
  border-radius: 0.375rem;
  background: var(--ui-surface);
  overflow: hidden;
}

.home-status-row {
  display: grid;
  grid-template-columns: 2.75rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid var(--ui-border);
  padding: 0.75rem 0.875rem;
}

.home-status-row:last-child {
  border-bottom: 0;
}

.home-status-row span,
.home-status-row em {
  color: var(--ui-text-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.72rem;
  font-style: normal;
}

.home-status-row strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--ui-text-strong);
  font-size: 0.875rem;
  font-weight: 760;
}

.home-ide-workspace {
  align-self: center;
  width: min(100%, 42rem);
}

.home-route-table {
  display: grid;
  border: 1px solid var(--ui-border);
  border-radius: 0.375rem;
  background: var(--ui-surface);
  overflow: hidden;
}

.home-route-table__header,
.home-route-table__row {
  display: grid;
  grid-template-columns: minmax(3rem, 0.24fr) minmax(10rem, 0.7fr) minmax(0, 1.4fr) minmax(7rem, 0.42fr);
  gap: 1rem;
  align-items: start;
  border-bottom: 1px solid var(--ui-border);
}

.home-route-table__header {
  background: var(--ui-surface-muted);
  padding: 0.7rem 1rem;
  color: var(--ui-text-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
}

.home-route-table__row {
  padding: 1rem;
}

.home-route-table__row:last-child {
  border-bottom: 0;
}

.home-route-table__row span,
.home-route-table__row em {
  color: var(--ui-accent-strong);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.73rem;
  font-style: normal;
  font-weight: 780;
  text-transform: uppercase;
}

.home-route-table__row strong {
  margin: 0;
  color: var(--ui-text-strong);
  font-size: 0.92rem;
  font-weight: 780;
}

.home-route-table__row p {
  margin: 0;
  color: var(--ui-text-muted);
  font-size: 0.88rem;
  line-height: 1.65;
}

.home-model-pool {
  display: grid;
  gap: 1rem;
}

.home-section-heading h2 {
  margin: 0;
  color: var(--ui-text-strong);
  font-size: 1.25rem;
  font-weight: 820;
}

.home-section-heading p {
  margin: 0.45rem 0 0;
  max-width: 58ch;
  color: var(--ui-text-muted);
  font-size: 0.92rem;
  line-height: 1.7;
}

.home-provider-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  border: 1px solid var(--ui-border);
  border-radius: 0.375rem;
  background: var(--ui-surface);
  overflow: hidden;
}

.home-provider-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  min-width: 0;
  border-right: 1px solid var(--ui-border);
  padding: 0.8rem 0.85rem;
}

.home-provider-chip:last-child {
  border-right: 0;
}

.home-provider-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow-wrap: anywhere;
  color: var(--ui-text-strong);
  font-size: 0.92rem;
  font-weight: 750;
}

.home-provider-badge {
  border-radius: 0.25rem;
  background: var(--ui-accent-muted);
  color: var(--ui-accent-strong);
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.22rem 0.45rem;
  text-transform: uppercase;
  letter-spacing: 0;
}

.home-provider-badge-muted {
  background: var(--ui-surface-muted);
  color: var(--ui-text-muted);
}

.home-footer-text,
.home-footer-link {
  color: var(--ui-text-muted);
}

.home-footer-link:hover {
  color: var(--ui-text-strong);
}

@media (max-width: 639px) {
  .home-title {
    font-size: 3rem;
  }

  .home-status-row,
  .home-route-table__header,
  .home-route-table__row {
    grid-template-columns: 1fr;
    gap: 0.35rem;
  }

  .home-provider-grid {
    grid-template-columns: 1fr;
  }

  .home-provider-chip {
    border-right: 0;
  }

  .home-provider-chip {
    border-bottom: 1px solid var(--ui-border);
  }

  .home-provider-chip:last-child {
    border-bottom: 0;
  }
}

@media (min-width: 768px) {
  .home-title {
    font-size: 4.55rem;
  }

  .home-subtitle {
    font-size: 1.125rem;
  }

  .home-dispatch-grid {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    align-items: center;
  }
}

@media (min-width: 1024px) {
  .home-title {
    font-size: 5.15rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-command-shell *,
  .home-command-shell *::before,
  .home-command-shell *::after {
    animation: none !important;
    transition: none !important;
  }
}
</style>
