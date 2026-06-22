<template>
  <section
    class="gateway-code-preview"
    :class="[
      `gateway-code-preview--${mode}`,
      animated ? 'is-animated' : 'is-static'
    ]"
    aria-label="Gateway IDE Workspace"
  >
    <div class="gateway-code-preview__topbar">
      <div class="gateway-code-preview__traffic" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="gateway-code-preview__title">Gateway IDE Workspace</div>
      <div class="gateway-code-preview__status">
        <span></span>
        live route
      </div>
    </div>

    <div class="gateway-code-preview__tabs">
      <span class="is-active">api-gateway.ts</span>
      <span v-if="isHomeMode">models.pool.json</span>
      <span>auth.guard.ts</span>
    </div>

    <div class="gateway-code-preview__body">
      <div class="gateway-code-preview__editor">
        <div
          v-for="line in visibleCodeLines"
          :key="line.no"
          class="gateway-code-preview__line"
          :class="{ 'is-hot': line.hot }"
        >
          <span class="gateway-code-preview__line-no">{{ line.no }}</span>
          <code v-html="line.html"></code>
          <span v-if="line.cursor" :class="previewCursorClass"></span>
        </div>
      </div>

      <div class="gateway-code-preview__side">
        <div class="gateway-code-preview__panel">
          <div class="gateway-code-preview__panel-title">request</div>
          <div class="gateway-code-preview__request">
            <span>POST</span>
            <strong>/v1/chat/completions</strong>
            <em>200</em>
          </div>
          <div class="gateway-code-preview__request-meta">
            <span>key: sk-live-sub2api</span>
            <span>cost: tracked</span>
          </div>
        </div>

        <div v-if="isHomeMode" class="gateway-code-preview__panel">
          <div class="gateway-code-preview__panel-title">model pool</div>
          <div class="gateway-code-preview__model-list">
            <div v-for="row in modelRows" :key="row.name">
              <span :data-state="row.state"></span>
              <strong>{{ row.name }}</strong>
              <em>{{ row.latency }}</em>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="gateway-code-preview__terminal">
      <div class="gateway-code-preview__terminal-title">terminal</div>
      <div class="gateway-code-preview__terminal-rows">
        <p v-for="row in visibleTerminalRows" :key="row">
          <span>$</span>
          {{ row }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  mode?: 'home' | 'auth'
  animated?: boolean
}>(), {
  mode: 'home',
  animated: true
})

interface CodeLine {
  no: string
  html: string
  hot: boolean
  cursor?: boolean
}

interface ModelRow {
  name: string
  latency: string
  state: 'ready' | 'standby'
}

const codeLines: CodeLine[] = [
  { no: '01', html: '<span class="token-key">const</span> route = <span class="token-string">"/v1/chat/completions"</span>', hot: false },
  { no: '02', html: '<span class="token-key">await</span> gateway.authenticate(apiKey)', hot: true },
  { no: '03', html: '<span class="token-key">const</span> upstream = pool.pick({ sticky: session.id })', hot: false },
  { no: '04', html: 'meter.track(tokens.input, tokens.output)', hot: false },
  { no: '05', html: '<span class="token-key">return</span> stream.from(upstream)', hot: true, cursor: true }
]

const authCodeLines: CodeLine[] = [
  { no: '01', html: '<span class="token-key">guard</span>.verify(email, password)', hot: true },
  { no: '02', html: 'session.issue({ scope: <span class="token-string">"dashboard"</span> })', hot: false },
  { no: '03', html: 'redirect.to(<span class="token-string">"/dashboard"</span>)', hot: false, cursor: true }
]

const terminalRows = [
  'pnpm gateway:route --provider auto',
  'auth ok, quota ledger attached',
  'claude -> healthy, gpt -> standby, gemini -> ready'
]

const authTerminalRows = [
  'auth guard waiting for credentials',
  'oauth providers synced',
  '2fa challenge available'
]

const modelRows: ModelRow[] = [
  { name: 'Claude', latency: '184ms', state: 'ready' },
  { name: 'GPT', latency: '211ms', state: 'standby' },
  { name: 'Gemini', latency: '196ms', state: 'ready' },
  { name: 'Antigravity', latency: 'queued', state: 'standby' }
]

const isHomeMode = computed(() => props.mode === 'home')
const visibleCodeLines = computed(() => (isHomeMode.value ? codeLines : authCodeLines))
const visibleTerminalRows = computed(() => (isHomeMode.value ? terminalRows : authTerminalRows))
const previewCursorClass = computed(() => [
  'gateway-code-preview__cursor',
  props.animated ? 'is-animated' : 'is-static'
])
const mode = computed(() => props.mode)
const animated = computed(() => props.animated)
</script>

<style scoped>
.gateway-code-preview {
  --preview-bg: var(--ui-surface-strong, var(--auth-surface-strong, oklch(99% 0.006 210)));
  --preview-panel: var(--ui-surface, var(--auth-surface, oklch(96% 0.007 210)));
  --preview-panel-strong: var(--ui-surface-muted, var(--auth-surface, oklch(93% 0.008 210)));
  --preview-text: var(--ui-text, var(--auth-text, oklch(34% 0.018 230)));
  --preview-strong: var(--ui-text-strong, var(--auth-strong, oklch(18% 0.02 230)));
  --preview-muted: var(--ui-text-muted, var(--auth-muted, oklch(51% 0.02 230)));
  --preview-border: var(--ui-border, var(--auth-border, oklch(84% 0.015 220)));
  --preview-border-strong: var(--ui-border-strong, var(--auth-border-strong, oklch(76% 0.018 220)));
  --preview-accent: var(--ui-accent, var(--auth-accent, oklch(64% 0.13 190)));
  --preview-accent-strong: var(--ui-accent-strong, var(--auth-accent-strong, oklch(52% 0.13 190)));
  --preview-success: var(--ui-success, oklch(57% 0.16 155));
  display: grid;
  max-width: 100%;
  overflow: hidden;
  border: 1px solid var(--preview-border-strong);
  border-radius: 0.5rem;
  background: var(--preview-bg);
  box-shadow: var(--ui-shadow-panel, var(--auth-shadow, 0 18px 44px rgba(15, 23, 42, 0.12)));
  color: var(--preview-text);
}

.gateway-code-preview,
.gateway-code-preview code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.gateway-code-preview--home {
  min-height: 0;
}

.gateway-code-preview__topbar,
.gateway-code-preview__tabs,
.gateway-code-preview__terminal {
  border-bottom: 1px solid var(--preview-border);
}

.gateway-code-preview__topbar {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  min-height: 2.65rem;
  padding: 0 0.75rem;
  background: var(--preview-panel-strong);
}

.gateway-code-preview__traffic {
  display: flex;
  gap: 0.35rem;
}

.gateway-code-preview__traffic span {
  width: 0.55rem;
  height: 0.55rem;
  border: 1px solid var(--preview-border-strong);
  border-radius: 999px;
  background: var(--preview-panel);
}

.gateway-code-preview__traffic span:first-child {
  background: oklch(65% 0.18 28);
}

.gateway-code-preview__traffic span:nth-child(2) {
  background: oklch(78% 0.15 85);
}

.gateway-code-preview__traffic span:last-child {
  background: var(--preview-success);
}

.gateway-code-preview__title,
.gateway-code-preview__status,
.gateway-code-preview__tabs span,
.gateway-code-preview__panel-title,
.gateway-code-preview__terminal-title {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.gateway-code-preview__title {
  min-width: 0;
  overflow: hidden;
  color: var(--preview-strong);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gateway-code-preview__status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--preview-muted);
}

.gateway-code-preview__status span {
  width: 0.48rem;
  height: 0.48rem;
  border-radius: 999px;
  background: var(--preview-success);
}

.gateway-code-preview.is-animated .gateway-code-preview__status span {
  animation: gateway-pulse 1.8s ease-out infinite;
}

.gateway-code-preview__tabs {
  display: flex;
  min-width: 0;
  overflow-x: auto;
  background: var(--preview-panel);
}

.gateway-code-preview__tabs span {
  flex: none;
  border-right: 1px solid var(--preview-border);
  padding: 0.62rem 0.8rem;
  color: var(--preview-muted);
}

.gateway-code-preview__tabs span.is-active {
  background: var(--preview-bg);
  color: var(--preview-accent-strong);
}

.gateway-code-preview__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 13.5rem;
  min-height: 19rem;
}

.gateway-code-preview--auth .gateway-code-preview__body {
  grid-template-columns: 1fr;
  min-height: auto;
}

.gateway-code-preview__editor {
  display: grid;
  align-content: start;
  gap: 0.1rem;
  padding: 1rem 0;
}

.gateway-code-preview__line {
  display: grid;
  grid-template-columns: 2.4rem minmax(0, 1fr) auto;
  align-items: center;
  min-height: 2.15rem;
  padding: 0 0.9rem 0 0.65rem;
  border-left: 2px solid transparent;
  color: var(--preview-text);
  font-size: 0.78rem;
}

.gateway-code-preview__line.is-hot {
  border-left-color: var(--preview-accent);
  background: color-mix(in oklch, var(--preview-accent) 9%, transparent);
}

.gateway-code-preview.is-animated .gateway-code-preview__line.is-hot {
  animation: gateway-line-scan 5.6s ease-out infinite;
}

.gateway-code-preview__line-no {
  color: var(--preview-muted);
  font-size: 0.7rem;
}

.gateway-code-preview__line code {
  min-width: 0;
  overflow: hidden;
  color: var(--preview-strong);
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.token-key) {
  color: var(--preview-accent-strong);
  font-weight: 800;
}

:deep(.token-string) {
  color: var(--preview-success);
}

.gateway-code-preview__cursor {
  width: 0.5rem;
  height: 1.1rem;
  background: var(--preview-accent);
}

.gateway-code-preview__cursor.is-animated {
  animation: gateway-cursor 1.2s steps(1) infinite;
}

.gateway-code-preview__side {
  display: grid;
  align-content: start;
  gap: 0.75rem;
  border-left: 1px solid var(--preview-border);
  padding: 0.85rem;
  background: var(--preview-panel);
}

.gateway-code-preview--auth .gateway-code-preview__side {
  display: none;
}

.gateway-code-preview__panel {
  border: 1px solid var(--preview-border);
  border-radius: 0.375rem;
  background: var(--preview-bg);
}

.gateway-code-preview__panel-title {
  border-bottom: 1px solid var(--preview-border);
  padding: 0.55rem 0.65rem;
  color: var(--preview-muted);
}

.gateway-code-preview__request {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.55rem;
  padding: 0.65rem;
  font-size: 0.75rem;
}

.gateway-code-preview__request span,
.gateway-code-preview__request em {
  color: var(--preview-accent-strong);
  font-style: normal;
  font-weight: 800;
}

.gateway-code-preview__request strong {
  min-width: 0;
  overflow: hidden;
  color: var(--preview-strong);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gateway-code-preview__request-meta {
  display: grid;
  gap: 0.35rem;
  border-top: 1px solid var(--preview-border);
  padding: 0.65rem;
  color: var(--preview-muted);
  font-size: 0.68rem;
}

.gateway-code-preview__model-list {
  display: grid;
}

.gateway-code-preview__model-list div {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid var(--preview-border);
  padding: 0.55rem 0.65rem;
  font-size: 0.72rem;
}

.gateway-code-preview__model-list div:last-child {
  border-bottom: 0;
}

.gateway-code-preview__model-list span {
  width: 0.48rem;
  height: 0.48rem;
  border-radius: 999px;
  background: var(--preview-muted);
}

.gateway-code-preview__model-list span[data-state='ready'] {
  background: var(--preview-success);
}

.gateway-code-preview__model-list strong {
  min-width: 0;
  overflow: hidden;
  color: var(--preview-strong);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gateway-code-preview__model-list em {
  color: var(--preview-muted);
  font-style: normal;
}

.gateway-code-preview__terminal {
  border-top: 1px solid var(--preview-border);
  border-bottom: 0;
  background: oklch(17% 0.025 235);
}

.gateway-code-preview__terminal-title {
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  padding: 0.55rem 0.75rem;
  color: oklch(72% 0.04 220);
}

.gateway-code-preview__terminal-rows {
  display: grid;
  gap: 0.35rem;
  padding: 0.75rem;
}

.gateway-code-preview__terminal p {
  margin: 0;
  color: oklch(84% 0.04 190);
  font-size: 0.72rem;
  line-height: 1.55;
}

.gateway-code-preview__terminal p span {
  color: var(--preview-accent);
}

.gateway-code-preview--auth .gateway-code-preview__terminal p:nth-child(n + 3) {
  display: none;
}

@keyframes gateway-cursor {
  50% {
    opacity: 0;
  }
}

@keyframes gateway-pulse {
  0% {
    box-shadow: 0 0 0 0 color-mix(in oklch, var(--preview-success) 30%, transparent);
  }
  70% {
    box-shadow: 0 0 0 5px transparent;
  }
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
}

@keyframes gateway-line-scan {
  0%,
  100% {
    background: color-mix(in oklch, var(--preview-accent) 6%, transparent);
  }
  45% {
    background: color-mix(in oklch, var(--preview-accent) 10%, transparent);
  }
}

@media (max-width: 767px) {
  .gateway-code-preview__body {
    grid-template-columns: 1fr;
  }

  .gateway-code-preview__side {
    border-top: 1px solid var(--preview-border);
    border-left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gateway-code-preview *,
  .gateway-code-preview *::before,
  .gateway-code-preview *::after {
    animation: none !important;
    transition: none !important;
  }
}
</style>
