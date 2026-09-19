<template>
  <Teleport to="body">
    <transition name="logout-modal-fade">
      <div 
        v-if="modelValue" 
        class="logout-modal-backdrop d-flex align-items-center justify-content-center p-3"
        @click.self="handleCancel"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
      >
        <transition name="logout-modal-pop" appear>
          <div class="logout-modal-card position-relative overflow-hidden shadow-2xl">
            <!-- Ambient Decorative Top Glowing Beam -->
            <div class="modal-ambient-glow" aria-hidden="true"></div>

            <!-- Mobile Drag Indicator Bar -->
            <div class="d-md-none text-center pt-2.5 pb-1 cursor-pointer" @click="handleCancel">
              <span class="mobile-drag-pill"></span>
            </div>

            <!-- Modal Close Button (Top Right) -->
            <button 
              type="button" 
              class="btn-close-custom position-absolute top-0 end-0 m-3 d-flex align-items-center justify-content-center rounded-circle border-0"
              @click="handleCancel"
              aria-label="Tutup dialog"
              title="Batal dan tutup (Esc)"
              :disabled="isLoggingOut"
            >
              <i class="bi bi-x-lg"></i>
            </button>

            <div class="p-4 p-sm-4.5 text-center">
              <!-- Hero Glowing Icon -->
              <div class="logout-icon-halo-wrapper mx-auto mb-3">
                <div class="logout-icon-halo-pulse"></div>
                <div class="logout-icon-center d-flex align-items-center justify-content-center shadow-md">
                  <i class="bi bi-box-arrow-right logout-hero-icon"></i>
                </div>
              </div>

              <!-- Headings -->
              <h5 id="logout-modal-title" class="fw-bold modal-heading mb-1.5">
                Konfirmasi Keluar Sesi
              </h5>
              <p class="modal-subheading mb-3.5 mx-auto" style="max-width: 320px;">
                Apakah Anda yakin ingin mengakhiri sesi aktif dan keluar dari workspace?
              </p>

              <!-- Current User Profile Snapshot Card -->
              <div class="user-session-preview-card p-3 rounded-4 mb-3.5 text-start border d-flex align-items-center gap-3">
                <!-- Avatar with pulsing status indicator -->
                <div class="position-relative flex-shrink-0">
                  <div class="user-avatar-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-xs">
                    {{ userInitial }}
                  </div>
                  <span class="status-indicator-dot position-absolute" title="Sesi Aktif"></span>
                </div>

                <!-- User Details -->
                <div class="overflow-hidden flex-grow-1">
                  <div class="d-flex align-items-center gap-2 mb-0.5 flex-wrap">
                    <span class="fw-bold user-name-text text-truncate">
                      {{ userName }}
                    </span>
                    <span :class="['role-badge-pill', roleBadgeClass]">
                      <i :class="roleIconClass" class="me-1"></i>{{ userRoleDisplay }}
                    </span>
                  </div>
                  <div class="user-email-text text-truncate small">
                    {{ userEmail }}
                  </div>
                </div>
              </div>

              <!-- Data Safety Assurance Note -->
              <div class="security-assurance-box rounded-3 p-2.5 mb-4 text-start d-flex align-items-start gap-2.5">
                <div class="assurance-icon-box flex-shrink-0 mt-0.5">
                  <i class="bi bi-shield-check text-success fs-5"></i>
                </div>
                <div class="lh-sm">
                  <span class="d-block fw-semibold assurance-title mb-0.5">Progres & Data Anda Aman</span>
                  <small class="assurance-desc d-block">
                    Semua task, catatan, dan konfigurasi tersimpan otomatis di penyimpanan lokal/cloud. Anda dapat login kembali sewaktu-waktu.
                  </small>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="d-flex align-items-center gap-2.5 justify-content-end">
                <button 
                  type="button" 
                  class="btn btn-cancel-logout rounded-pill px-4 py-2 fw-semibold w-100 flex-grow-1"
                  @click="handleCancel"
                  :disabled="isLoggingOut"
                >
                  Tetap di Sini
                </button>
                <button 
                  type="button" 
                  class="btn btn-confirm-logout rounded-pill px-4 py-2 fw-bold w-100 flex-grow-1 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  @click="handleConfirm"
                  :disabled="isLoggingOut"
                >
                  <template v-if="!isLoggingOut">
                    <i class="bi bi-box-arrow-right"></i>
                    <span>Ya, Keluar Akun</span>
                  </template>
                  <template v-else>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Menutup Sesi...</span>
                  </template>
                </button>
              </div>
            </div>

            <!-- Subtle Bottom Micro-Footer -->
            <div class="modal-micro-footer text-center py-2 px-3 border-top">
              <span class="micro-footer-text">
                <i class="bi bi-lock-fill me-1"></i>TaskArts Workspace Security Engine
              </span>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';

export default {
  name: 'LogoutConfirmModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    currentUser: {
      type: Object,
      default: null
    },
    userRole: {
      type: String,
      default: 'Tamu'
    }
  },
  emits: ['update:modelValue', 'confirm'],
  setup(props, { emit }) {
    const isLoggingOut = ref(false);

    const userName = computed(() => {
      if (!props.currentUser) return 'Akun Tamu';
      return props.currentUser.displayName || props.currentUser.email || 'Pengguna TaskArts';
    });

    const userEmail = computed(() => {
      if (!props.currentUser) return 'Belum terautentikasi';
      return props.currentUser.email || (props.currentUser.isHostProject ? 'arif_kafeinarts@kafeinarts.com' : 'Pengguna Aktif');
    });

    const userInitial = computed(() => {
      const name = userName.value;
      return (name && name[0] ? name[0] : 'U').toUpperCase();
    });

    const isHost = computed(() => {
      return props.currentUser?.isHostProject || props.userRole?.includes('Host') || props.currentUser?.email?.includes('kafeinarts');
    });

    const userRoleDisplay = computed(() => {
      if (isHost.value) return '👑 Host Project';
      return props.userRole || 'Member Tim';
    });

    const roleBadgeClass = computed(() => {
      if (isHost.value) return 'badge-host';
      const r = (props.userRole || '').toLowerCase();
      if (r.includes('admin')) return 'badge-admin';
      if (r.includes('manager')) return 'badge-manager';
      if (r.includes('editor')) return 'badge-editor';
      return 'badge-member';
    });

    const roleIconClass = computed(() => {
      if (isHost.value) return 'bi-award-fill';
      const r = (props.userRole || '').toLowerCase();
      if (r.includes('admin')) return 'bi-shield-shaded';
      if (r.includes('manager')) return 'bi-kanban';
      return 'bi-person-badge';
    });

    const handleCancel = () => {
      if (isLoggingOut.value) return;
      emit('update:modelValue', false);
    };

    const handleConfirm = () => {
      if (isLoggingOut.value) return;
      isLoggingOut.value = true;
      // Emit confirm with a snappy visual response
      setTimeout(() => {
        emit('confirm');
        isLoggingOut.value = false;
      }, 350);
    };

    // Keyboard navigation: ESC to close
    const handleKeydown = (e) => {
      if (props.modelValue && e.key === 'Escape' && !isLoggingOut.value) {
        handleCancel();
      }
    };

    onMounted(() => {
      window.addEventListener('keydown', handleKeydown);
    });

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeydown);
    });

    return {
      isLoggingOut,
      userName,
      userEmail,
      userInitial,
      isHost,
      userRoleDisplay,
      roleBadgeClass,
      roleIconClass,
      handleCancel,
      handleConfirm
    };
  }
};
</script>

<style scoped>
/* Backdrop */
.logout-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 15, 29, 0.72);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 999999;
}

/* Modal Card */
.logout-modal-card {
  width: 100%;
  max-width: 440px;
  background-color: var(--bg-surface, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.05);
  animation: modal-enter 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  color: var(--text-main, #0f172a);
}

/* Top Ambient Beam */
.modal-ambient-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #f43f5e 0%, #ef4444 35%, #f97316 70%, #ec4899 100%);
}

/* Close Button */
.btn-close-custom {
  width: 34px;
  height: 34px;
  background: var(--bg-hover, rgba(0, 0, 0, 0.05));
  color: var(--text-sub, #64748b);
  transition: all 0.2s ease;
  font-size: 13px;
  z-index: 10;
}
.btn-close-custom:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  transform: rotate(90deg);
}

/* Hero Glowing Icon with Pulsing Halo */
.logout-icon-halo-wrapper {
  position: relative;
  width: 74px;
  height: 74px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-icon-halo-pulse {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, rgba(239, 68, 68, 0.02) 70%, transparent 100%);
  animation: halo-pulse 2.4s infinite ease-in-out;
}

.logout-icon-center {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
  color: #ffffff;
  position: relative;
  z-index: 2;
  box-shadow: 0 8px 18px rgba(239, 68, 68, 0.4);
}

.logout-hero-icon {
  font-size: 22px;
  margin-left: 2px;
  transition: transform 0.2s ease;
}

.logout-modal-card:hover .logout-hero-icon {
  transform: translateX(2px);
}

/* Headings */
.modal-heading {
  font-size: 1.15rem;
  color: var(--text-main, #0f172a);
  letter-spacing: -0.01em;
}

.modal-subheading {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-sub, #64748b);
}

/* Current User Profile Snapshot Card */
.user-session-preview-card {
  background-color: var(--bg-hover, #f8fafc);
  border-color: var(--border-color, #e2e8f0) !important;
  transition: border-color 0.2s ease;
}

.user-avatar-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color, #2563eb) 0%, #6366f1 100%);
  font-size: 17px;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
}

.status-indicator-dot {
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #22c55e;
  border: 2.5px solid var(--bg-surface, #ffffff);
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.7);
}

.user-name-text {
  font-size: 13.5px;
  color: var(--text-main, #0f172a);
}

.user-email-text {
  font-size: 11.5px;
  color: var(--text-sub, #64748b);
}

/* Role Badges */
.role-badge-pill {
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  letter-spacing: 0.02em;
}

.badge-host {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.2) 100%);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.4);
}

.badge-admin {
  background: rgba(99, 102, 241, 0.12);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.badge-manager {
  background: rgba(14, 165, 233, 0.12);
  color: #0ea5e9;
  border: 1px solid rgba(14, 165, 233, 0.3);
}

.badge-member {
  background: rgba(100, 116, 139, 0.12);
  color: #64748b;
  border: 1px solid rgba(100, 116, 139, 0.25);
}

/* Dark mode adjustment for host badge */
:deep(.dark-theme) .badge-host,
.dark-mode .badge-host {
  color: #fbbf24;
}

/* Security Assurance Box */
.security-assurance-box {
  background: rgba(34, 197, 94, 0.06);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.assurance-title {
  font-size: 11.5px;
  color: var(--text-main, #0f172a);
}

.assurance-desc {
  font-size: 11px;
  line-height: 1.4;
  color: var(--text-sub, #64748b);
}

/* Action Buttons */
.btn-cancel-logout {
  background: var(--bg-hover, #f1f5f9);
  color: var(--text-main, #334155);
  border: 1px solid var(--border-color, #cbd5e1);
  font-size: 13px;
  transition: all 0.2s ease;
}

.btn-cancel-logout:hover:not(:disabled) {
  background: var(--border-color, #e2e8f0);
  color: var(--text-main, #0f172a);
  transform: translateY(-1px);
}

.btn-confirm-logout {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
  color: #ffffff;
  border: none;
  font-size: 13px;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
  transition: all 0.2s ease;
}

.btn-confirm-logout:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  box-shadow: 0 6px 18px rgba(239, 68, 68, 0.5);
  transform: translateY(-1.5px);
  color: #ffffff;
}

.btn-confirm-logout:active:not(:disabled) {
  transform: translateY(0);
}

/* Micro Footer */
.modal-micro-footer {
  background-color: var(--bg-hover, #f8fafc);
  border-color: var(--border-color, #e2e8f0) !important;
}

.micro-footer-text {
  font-size: 10.5px;
  color: var(--text-sub, #94a3b8);
  font-weight: 500;
  letter-spacing: 0.02em;
}

/* Mobile Drag Pill */
.mobile-drag-pill {
  display: inline-block;
  width: 36px;
  height: 4px;
  border-radius: 9999px;
  background-color: var(--border-color, #cbd5e1);
}

/* Dark Mode & OLED Theme Overrides via :global */
:global(body.dark-mode) .logout-modal-card,
:global(body.dark-theme) .logout-modal-card {
  background-color: #131b2e;
  border-color: #1e293b;
  color: #f1f5f9;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08);
}

:global(body.oled-theme) .logout-modal-card {
  background-color: #000000;
  border-color: #27272a;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.12);
}

:global(body.dark-mode) .modal-heading,
:global(body.dark-theme) .modal-heading {
  color: #f8fafc;
}

:global(body.dark-mode) .modal-subheading,
:global(body.dark-theme) .modal-subheading {
  color: #94a3b8;
}

:global(body.dark-mode) .user-session-preview-card,
:global(body.dark-theme) .user-session-preview-card {
  background-color: #1a233a;
  border-color: #273553 !important;
}

:global(body.oled-theme) .user-session-preview-card {
  background-color: #0d0d0d;
  border-color: #27272a !important;
}

:global(body.dark-mode) .user-name-text,
:global(body.dark-theme) .user-name-text {
  color: #f8fafc;
}

:global(body.dark-mode) .user-email-text,
:global(body.dark-theme) .user-email-text {
  color: #94a3b8;
}

:global(body.dark-mode) .status-indicator-dot,
:global(body.dark-theme) .status-indicator-dot {
  border-color: #1a233a;
}

:global(body.oled-theme) .status-indicator-dot {
  border-color: #0d0d0d;
}

:global(body.dark-mode) .security-assurance-box,
:global(body.dark-theme) .security-assurance-box {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
}

:global(body.dark-mode) .assurance-title,
:global(body.dark-theme) .assurance-title {
  color: #86efac;
}

:global(body.dark-mode) .assurance-desc,
:global(body.dark-theme) .assurance-desc {
  color: #cbd5e1;
}

:global(body.dark-mode) .btn-cancel-logout,
:global(body.dark-theme) .btn-cancel-logout {
  background: #1e293b;
  color: #e2e8f0;
  border-color: #334155;
}

:global(body.dark-mode) .btn-cancel-logout:hover:not(:disabled),
:global(body.dark-theme) .btn-cancel-logout:hover:not(:disabled) {
  background: #273553;
  color: #ffffff;
  border-color: #475569;
}

:global(body.oled-theme) .btn-cancel-logout {
  background: #18181b;
  color: #f4f4f5;
  border-color: #27272a;
}

:global(body.dark-mode) .btn-close-custom,
:global(body.dark-theme) .btn-close-custom {
  background: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
}

:global(body.dark-mode) .btn-close-custom:hover,
:global(body.dark-theme) .btn-close-custom:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

:global(body.dark-mode) .modal-micro-footer,
:global(body.dark-theme) .modal-micro-footer {
  background-color: #0f172a;
  border-color: #1e293b !important;
}

:global(body.oled-theme) .modal-micro-footer {
  background-color: #000000;
  border-color: #27272a !important;
}

:global(body.dark-mode) .micro-footer-text,
:global(body.dark-theme) .micro-footer-text {
  color: #64748b;
}

/* Animations & Transitions */
@keyframes halo-pulse {
  0% {
    transform: scale(0.92);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.15);
    opacity: 1;
  }
  100% {
    transform: scale(0.92);
    opacity: 0.6;
  }
}

@keyframes modal-enter {
  0% {
    transform: scale(0.92) translateY(10px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.logout-modal-fade-enter-active,
.logout-modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.logout-modal-fade-enter-from,
.logout-modal-fade-leave-to {
  opacity: 0;
}
</style>
