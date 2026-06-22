<template>
  <AuthLayout variant="gateway">
    <div class="login-gateway-form">
      <!-- Title -->
      <div class="login-gateway-heading text-center">
        <div class="login-gateway-kicker">secure gateway</div>
        <h2>
          {{ t('auth.welcomeBack') }}
        </h2>
        <p>
          {{ t('auth.signInToAccount') }}
        </p>
      </div>
      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="login-gateway-fields">
        <!-- Email Input -->
        <div class="login-gateway-field">
          <label for="email" class="login-gateway-label">
            {{ t('auth.emailLabel') }}
          </label>
          <div class="login-gateway-input-shell">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Icon name="mail" size="md" class="login-gateway-input-icon" />
            </div>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              autofocus
              autocomplete="email"
              :disabled="authActionDisabled"
              class="input login-gateway-input pl-11"
              :class="{ 'input-error': errors.email }"
              :placeholder="t('auth.emailPlaceholder')"
            />
          </div>
        </div>

        <!-- Password Input -->
        <div class="login-gateway-field">
          <label for="password" class="login-gateway-label">
            {{ t('auth.passwordLabel') }}
          </label>
          <div class="login-gateway-input-shell">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Icon name="lock" size="md" class="login-gateway-input-icon" />
            </div>
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              :disabled="authActionDisabled"
              class="input login-gateway-input pl-11 pr-11"
              :class="{ 'input-error': errors.password }"
              :placeholder="t('auth.passwordPlaceholder')"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              :disabled="authActionDisabled"
              class="login-gateway-password-toggle"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              <Icon v-if="showPassword" name="eyeOff" size="md" />
              <Icon v-else name="eye" size="md" />
            </button>
          </div>
          <div class="login-gateway-field-meta">
            <span></span>
            <router-link
              v-if="passwordResetEnabled && !backendModeEnabled"
              to="/forgot-password"
              class="login-gateway-link"
            >
              {{ t('auth.forgotPassword') }}
            </router-link>
          </div>
        </div>

        <!-- Turnstile Widget -->
        <div v-if="turnstileEnabled && turnstileSiteKey" class="login-gateway-verification">
          <TurnstileWidget
            ref="turnstileRef"
            :site-key="turnstileSiteKey"
            @verify="onTurnstileVerify"
            @expire="onTurnstileExpire"
            @error="onTurnstileError"
          />
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="authActionDisabled || (turnstileEnabled && !turnstileToken)"
          class="btn btn-primary w-full login-gateway-submit"
        >
          <svg
            v-if="isLoading"
            class="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <Icon v-else name="login" size="md" class="mr-2" />
          {{ isLoading ? t('auth.signingIn') : t('auth.signIn') }}
        </button>

        <LoginAgreementPrompt
          v-if="loginAgreementEnabled"
          :accepted="agreementAccepted"
          :documents="loginAgreementDocuments"
          :mode="loginAgreementMode"
          :updated-at="loginAgreementUpdatedAt"
          :visible="showAgreementModal"
          @accept="acceptLoginAgreement"
          @reject="rejectLoginAgreement"
          @open="showAgreementModal = true"
        />

        <div v-if="showOAuthLogin" class="login-gateway-oauth">
          <div class="login-gateway-divider">
            <div></div>
            <span>
              {{ t('auth.oauthOrContinue') }}
            </span>
            <div></div>
          </div>

          <EmailOAuthButtons
            :disabled="authActionDisabled"
            :github-enabled="githubOAuthEnabled"
            :google-enabled="googleOAuthEnabled"
            :show-divider="false"
          />

          <LinuxDoOAuthSection
            v-if="linuxdoOAuthEnabled"
            :disabled="authActionDisabled"
            :show-divider="false"
          />
          <DingTalkOAuthSection
            v-if="dingtalkOAuthEnabled"
            :disabled="authActionDisabled"
            :show-divider="false"
          />
          <WechatOAuthSection
            v-if="wechatOAuthEnabled"
            :disabled="authActionDisabled"
            :show-divider="false"
          />
          <OidcOAuthSection
            v-if="oidcOAuthEnabled"
            :disabled="authActionDisabled"
            :provider-name="oidcOAuthProviderName"
            :show-divider="false"
          />
        </div>
      </form>
    </div>

    <!-- Footer -->
    <template v-if="!backendModeEnabled" #footer>
      <p class="login-gateway-footer">
        {{ t('auth.dontHaveAccount') }}
        <router-link
          to="/register"
          class="login-gateway-footer-link"
        >
          {{ t('auth.signUp') }}
        </router-link>
      </p>
    </template>
  </AuthLayout>

  <!-- 2FA Modal -->
  <TotpLoginModal
    v-if="show2FAModal"
    ref="totpModalRef"
    :temp-token="totpTempToken"
    :user-email-masked="totpUserEmailMasked"
    @verify="handle2FAVerify"
    @cancel="handle2FACancel"
  />
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { AuthLayout } from '@/components/layout'
import LinuxDoOAuthSection from '@/components/auth/LinuxDoOAuthSection.vue'
import DingTalkOAuthSection from '@/components/auth/DingTalkOAuthSection.vue'
import OidcOAuthSection from '@/components/auth/OidcOAuthSection.vue'
import WechatOAuthSection from '@/components/auth/WechatOAuthSection.vue'
import EmailOAuthButtons from '@/components/auth/EmailOAuthButtons.vue'
import LoginAgreementPrompt from '@/components/auth/LoginAgreementPrompt.vue'
import TotpLoginModal from '@/components/auth/TotpLoginModal.vue'
import Icon from '@/components/icons/Icon.vue'
import TurnstileWidget from '@/components/TurnstileWidget.vue'
import { useAuthStore, useAppStore } from '@/stores'
import { getPublicSettings, isTotp2FARequired, isWeChatWebOAuthEnabled } from '@/api/auth'
import type { LoginAgreementDocument, TotpLoginResponse } from '@/types'
import { extractI18nErrorMessage } from '@/utils/apiError'
import { clearAllAffiliateReferralCodes } from '@/utils/oauthAffiliate'

const { t } = useI18n()
const LOGIN_AGREEMENT_STORAGE_KEY = 'sub2api_login_agreement_consent'

// ==================== Router & Stores ====================

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

// ==================== State ====================

const isLoading = ref<boolean>(false)
const errorMessage = ref<string>('')
const showPassword = ref<boolean>(false)
const publicSettingsLoaded = ref<boolean>(false)

// Public settings
const turnstileEnabled = ref<boolean>(false)
const turnstileSiteKey = ref<string>('')
const linuxdoOAuthEnabled = ref<boolean>(false)
const dingtalkOAuthEnabled = ref<boolean>(false)
const wechatOAuthEnabled = ref<boolean>(false)
const backendModeEnabled = ref<boolean>(false)
const oidcOAuthEnabled = ref<boolean>(false)
const oidcOAuthProviderName = ref<string>('OIDC')
const githubOAuthEnabled = ref<boolean>(false)
const googleOAuthEnabled = ref<boolean>(false)
const passwordResetEnabled = ref<boolean>(false)
const loginAgreementEnabled = ref<boolean>(false)
const loginAgreementMode = ref<'modal' | 'checkbox' | string>('modal')
const loginAgreementUpdatedAt = ref<string>('')
const loginAgreementRevision = ref<string>('')
const loginAgreementDocuments = ref<LoginAgreementDocument[]>([])
const agreementAccepted = ref<boolean>(false)
const showAgreementModal = ref<boolean>(false)

// Turnstile
const turnstileRef = ref<InstanceType<typeof TurnstileWidget> | null>(null)
const turnstileToken = ref<string>('')

// 2FA state
const show2FAModal = ref<boolean>(false)
const totpTempToken = ref<string>('')
const totpUserEmailMasked = ref<string>('')
const totpModalRef = ref<InstanceType<typeof TotpLoginModal> | null>(null)

const formData = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: '',
  turnstile: ''
})

const validationToastMessage = computed(
  () => errors.email || errors.password || errors.turnstile || ''
)

const agreementGateActive = computed(
  () => loginAgreementEnabled.value && !agreementAccepted.value
)

const authActionDisabled = computed(
  () => isLoading.value || !publicSettingsLoaded.value || agreementGateActive.value
)

const showOAuthLogin = computed(
  () =>
    !backendModeEnabled.value &&
    (linuxdoOAuthEnabled.value ||
      dingtalkOAuthEnabled.value ||
      wechatOAuthEnabled.value ||
      oidcOAuthEnabled.value ||
      githubOAuthEnabled.value ||
      googleOAuthEnabled.value)
)

watch(validationToastMessage, (value, previousValue) => {
  if (value && value !== previousValue) {
    appStore.showError(value)
  }
})

// ==================== Lifecycle ====================

onMounted(async () => {
  const expiredFlag = sessionStorage.getItem('auth_expired')
  if (expiredFlag) {
    sessionStorage.removeItem('auth_expired')
    const message = t('auth.reloginRequired')
    errorMessage.value = message
    appStore.showWarning(message)
  }

  try {
    const settings = await getPublicSettings()
    turnstileEnabled.value = settings.turnstile_enabled
    turnstileSiteKey.value = settings.turnstile_site_key || ''
    linuxdoOAuthEnabled.value = settings.linuxdo_oauth_enabled
    dingtalkOAuthEnabled.value = settings.dingtalk_oauth_enabled ?? false
    wechatOAuthEnabled.value = isWeChatWebOAuthEnabled(settings)
    backendModeEnabled.value = settings.backend_mode_enabled
    oidcOAuthEnabled.value = settings.oidc_oauth_enabled
    oidcOAuthProviderName.value = settings.oidc_oauth_provider_name || 'OIDC'
    githubOAuthEnabled.value = settings.github_oauth_enabled
    googleOAuthEnabled.value = settings.google_oauth_enabled
    backendModeEnabled.value = settings.backend_mode_enabled
    passwordResetEnabled.value = settings.password_reset_enabled
    applyLoginAgreementSettings(settings)
  } catch (error) {
    console.error('Failed to load public settings:', error)
    loginAgreementEnabled.value = false
    agreementAccepted.value = true
  } finally {
    publicSettingsLoaded.value = true
  }
})

// ==================== Login Agreement ====================

function applyLoginAgreementSettings(settings: {
  login_agreement_enabled?: boolean
  login_agreement_mode?: string
  login_agreement_updated_at?: string
  login_agreement_revision?: string
  login_agreement_documents?: LoginAgreementDocument[]
}): void {
  const documents = Array.isArray(settings.login_agreement_documents)
    ? settings.login_agreement_documents.filter((doc) => doc.title?.trim())
    : []
  loginAgreementDocuments.value = documents
  loginAgreementEnabled.value = settings.login_agreement_enabled === true && documents.length > 0
  loginAgreementMode.value = settings.login_agreement_mode === 'checkbox' ? 'checkbox' : 'modal'
  loginAgreementUpdatedAt.value = settings.login_agreement_updated_at || ''
  loginAgreementRevision.value =
    settings.login_agreement_revision ||
    `${loginAgreementUpdatedAt.value}:${documents.map((doc) => `${doc.id}:${doc.title}`).join('|')}`

  agreementAccepted.value = !loginAgreementEnabled.value || hasAcceptedLoginAgreement(loginAgreementRevision.value)
  showAgreementModal.value =
    loginAgreementEnabled.value && !agreementAccepted.value && loginAgreementMode.value !== 'checkbox'
}

function hasAcceptedLoginAgreement(revision: string): boolean {
  if (!revision) {
    return false
  }
  try {
    const raw = localStorage.getItem(LOGIN_AGREEMENT_STORAGE_KEY)
    if (!raw) {
      return false
    }
    const parsed = JSON.parse(raw) as { revision?: string }
    return parsed.revision === revision
  } catch {
    return false
  }
}

function acceptLoginAgreement(): void {
  if (loginAgreementRevision.value) {
    localStorage.setItem(
      LOGIN_AGREEMENT_STORAGE_KEY,
      JSON.stringify({
        revision: loginAgreementRevision.value,
        accepted_at: new Date().toISOString()
      })
    )
  }
  agreementAccepted.value = true
  showAgreementModal.value = false
}

function rejectLoginAgreement(): void {
  localStorage.removeItem(LOGIN_AGREEMENT_STORAGE_KEY)
  agreementAccepted.value = false
  showAgreementModal.value = false
  appStore.showWarning('未同意最新条款前，无法输入账号密码或使用快捷登录。')
}

// ==================== Turnstile Handlers ====================

function onTurnstileVerify(token: string): void {
  turnstileToken.value = token
  errors.turnstile = ''
}

function onTurnstileExpire(): void {
  turnstileToken.value = ''
  errors.turnstile = t('auth.turnstileExpired')
}

function onTurnstileError(): void {
  turnstileToken.value = ''
  errors.turnstile = t('auth.turnstileFailed')
}

// ==================== Validation ====================

function validateForm(): boolean {
  // Reset errors
  errors.email = ''
  errors.password = ''
  errors.turnstile = ''

  let isValid = true

  if (agreementGateActive.value) {
    appStore.showWarning('请先阅读并同意最新条款后再登录。')
    if (loginAgreementMode.value !== 'checkbox') {
      showAgreementModal.value = true
    }
    return false
  }

  // Email validation
  if (!formData.email.trim()) {
    errors.email = t('auth.emailRequired')
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = t('auth.invalidEmail')
    isValid = false
  }

  // Password validation
  if (!formData.password) {
    errors.password = t('auth.passwordRequired')
    isValid = false
  } else if (formData.password.length < 6) {
    errors.password = t('auth.passwordMinLength')
    isValid = false
  }

  // Turnstile validation
  if (turnstileEnabled.value && !turnstileToken.value) {
    errors.turnstile = t('auth.completeVerification')
    isValid = false
  }

  return isValid
}

// ==================== Form Handlers ====================

async function handleLogin(): Promise<void> {
  // Clear previous error
  errorMessage.value = ''

  // Validate form
  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    // Call auth store login
    const response = await authStore.login({
      email: formData.email,
      password: formData.password,
      turnstile_token: turnstileEnabled.value ? turnstileToken.value : undefined
    })

    // Check if 2FA is required
    if (isTotp2FARequired(response)) {
      const totpResponse = response as TotpLoginResponse
      totpTempToken.value = totpResponse.temp_token || ''
      totpUserEmailMasked.value = totpResponse.user_email_masked || ''
      show2FAModal.value = true
      isLoading.value = false
      return
    }

    // Show success toast
    clearAllAffiliateReferralCodes()
    appStore.showSuccess(t('auth.loginSuccess'))

    // Redirect to dashboard or intended route
    const redirectTo = (router.currentRoute.value.query.redirect as string) || '/dashboard'
    await router.push(redirectTo)
  } catch (error: unknown) {
    // Reset Turnstile on error
    if (turnstileRef.value) {
      turnstileRef.value.reset()
      turnstileToken.value = ''
    }

    errorMessage.value = extractI18nErrorMessage(error, t, 'auth.errors', t('auth.loginFailed'))

    // Also show error toast
    appStore.showError(errorMessage.value)
  } finally {
    isLoading.value = false
  }
}

// ==================== 2FA Handlers ====================

async function handle2FAVerify(code: string): Promise<void> {
  if (totpModalRef.value) {
    totpModalRef.value.setVerifying(true)
  }

  try {
    await authStore.login2FA(totpTempToken.value, code)

    // Close modal and show success
    show2FAModal.value = false
    clearAllAffiliateReferralCodes()
    appStore.showSuccess(t('auth.loginSuccess'))

    // Redirect to dashboard or intended route
    const redirectTo = (router.currentRoute.value.query.redirect as string) || '/dashboard'
    await router.push(redirectTo)
  } catch (error: unknown) {
    const err = error as { message?: string; response?: { data?: { message?: string } } }
    const message = err.response?.data?.message || err.message || t('profile.totp.loginFailed')

    if (totpModalRef.value) {
      totpModalRef.value.setError(message)
      totpModalRef.value.setVerifying(false)
    }
  }
}

function handle2FACancel(): void {
  show2FAModal.value = false
  totpTempToken.value = ''
  totpUserEmailMasked.value = ''
}
</script>

<style scoped>
.login-gateway-form {
  --login-text: var(--auth-text, #374151);
  --login-strong: var(--auth-strong, #111827);
  --login-muted: var(--auth-muted, #6b7280);
  --login-surface: var(--auth-surface, rgba(255, 255, 255, 0.9));
  --login-surface-strong: var(--auth-surface-strong, #ffffff);
  --login-border: var(--auth-border, rgba(17, 24, 39, 0.1));
  --login-border-strong: var(--auth-border-strong, rgba(17, 24, 39, 0.18));
  --login-accent: var(--auth-accent, #14b8a6);
  --login-accent-strong: var(--auth-accent-strong, #0f766e);
  --login-accent-muted: var(--auth-accent-muted, rgba(20, 184, 166, 0.1));
  display: grid;
  gap: 1.35rem;
  color: var(--login-text);
}

.login-gateway-heading {
  display: grid;
  gap: 0.45rem;
}

.login-gateway-kicker {
  color: var(--login-accent-strong);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.login-gateway-heading h2 {
  margin: 0;
  color: var(--login-strong);
  font-size: 1.55rem;
  font-weight: 820;
  line-height: 1.18;
}

.login-gateway-heading p {
  margin: 0;
  color: var(--login-muted);
  font-size: 0.9rem;
  line-height: 1.65;
}

.login-gateway-fields {
  display: grid;
  gap: 1rem;
}

.login-gateway-field {
  display: grid;
  gap: 0.45rem;
}

.login-gateway-label {
  color: var(--login-strong);
  font-size: 0.78rem;
  font-weight: 760;
}

.login-gateway-input-shell {
  position: relative;
}

.login-gateway-input-icon {
  color: var(--login-muted);
}

.login-gateway-input {
  min-height: 2.9rem;
  border-radius: 0.5rem;
  border-color: var(--login-border-strong);
  background: var(--login-surface);
  color: var(--login-strong);
  box-shadow: none;
}

.login-gateway-input:focus {
  border-color: var(--login-accent);
  box-shadow: 0 0 0 3px var(--login-accent-muted);
}

.login-gateway-password-toggle {
  position: absolute;
  inset-block: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding-right: 0.875rem;
  color: var(--login-muted);
  transition: color 0.16s ease;
}

.login-gateway-password-toggle:hover {
  color: var(--login-strong);
}

.login-gateway-password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.login-gateway-field-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 1.2rem;
}

.login-gateway-link,
.login-gateway-footer-link {
  color: var(--login-accent-strong);
  font-size: 0.82rem;
  font-weight: 720;
  transition: color 0.16s ease;
}

.login-gateway-link:hover,
.login-gateway-footer-link:hover {
  color: var(--login-accent);
}

.login-gateway-verification {
  overflow: hidden;
  border-radius: 0.5rem;
}

.login-gateway-submit {
  min-height: 2.95rem;
  border-radius: 0.5rem;
  background: var(--login-accent-strong);
  box-shadow: none;
  font-weight: 780;
}

.login-gateway-submit:hover:not(:disabled) {
  background: var(--login-accent);
  box-shadow: none;
}

.login-gateway-oauth {
  display: grid;
  gap: 0.85rem;
  padding-top: 0.15rem;
}

.login-gateway-divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.login-gateway-divider div {
  height: 1px;
  flex: 1;
  background: var(--login-border);
}

.login-gateway-divider span {
  color: var(--login-muted);
  font-size: 0.7rem;
  font-weight: 740;
  text-transform: uppercase;
}

.login-gateway-oauth :deep(.btn-secondary),
.login-gateway-oauth :deep(button),
.login-gateway-oauth :deep(a) {
  border-radius: 0.5rem;
}

.login-gateway-oauth :deep(.btn-secondary) {
  border-color: var(--login-border-strong);
  background: var(--login-surface);
  color: var(--login-strong);
  box-shadow: none;
}

.login-gateway-oauth :deep(.btn-secondary:hover:not(:disabled)) {
  border-color: var(--login-accent);
  background: var(--login-accent-muted);
}

.login-gateway-footer {
  color: var(--auth-muted, #6b7280);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {
  .login-gateway-form *,
  .login-gateway-form *::before,
  .login-gateway-form *::after {
    transition: none !important;
  }
}
</style>
