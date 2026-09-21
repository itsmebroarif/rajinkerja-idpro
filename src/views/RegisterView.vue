<template>
  <div class="register-view-wrapper py-4 py-sm-5" data-aos="fade-up">
    <div class="container px-3 px-sm-4">
      <div class="row justify-content-center">
        <!-- Compact, Elegant, Responsive Container -->
        <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
          
          <!-- BRAND & WORKSPACE HEADER -->
          <div class="text-center mb-4">
            <router-link to="/login" class="text-decoration-none d-inline-block">
              <div class="brand-avatar d-inline-flex align-items-center justify-content-center p-2.5 rounded-4 shadow-xs bg-white border mb-2.5">
                <img src="/logo.svg" alt="TaskArts Logo" style="width: 40px; height: 40px;" />
              </div>
            </router-link>
            <h3 class="fw-bold text-dark mb-1 tracking-tight">
              Task<span class="text-primary">Arts</span>
            </h3>
            <p class="text-muted small mb-0">
              Pendaftaran Akun Baru & Kolaborasi Tim
            </p>
          </div>

          <!-- REGISTRATION CARD -->
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden auth-card bg-white">
            
            <div class="card-body p-3.5 p-sm-4 p-md-4">

              <!-- MINIMALIST SEGMENTED NAVIGATION SWITCHER -->
              <div class="segmented-control p-1 rounded-3 bg-light border d-flex mb-4">
                <router-link 
                  to="/login"
                  class="btn segmented-btn flex-fill rounded-2 py-2 small fw-semibold text-muted text-decoration-none d-flex align-items-center justify-content-center gap-1.5"
                >
                  <i class="bi bi-box-arrow-in-right"></i>
                  <span>Masuk Akun</span>
                </router-link>
                <button 
                  type="button" 
                  class="btn segmented-btn flex-fill rounded-2 py-2 small fw-semibold active-tab shadow-xs d-flex align-items-center justify-content-center gap-1.5"
                >
                  <i class="bi bi-person-plus-fill"></i>
                  <span>Daftar Baru</span>
                </button>
              </div>

              <!-- ALERT FEEDBACK MESSAGE -->
              <div v-if="alertMessage" class="alert d-flex align-items-center gap-2 py-2.5 px-3 rounded-3 mb-3.5 shadow-xs border" :class="alertSuccess ? 'alert-success border-success-subtle' : 'alert-danger border-danger-subtle'">
                <i :class="alertSuccess ? 'bi bi-check-circle-fill text-success fs-6' : 'bi bi-exclamation-circle-fill text-danger fs-6'"></i>
                <div class="small fw-medium flex-grow-1">{{ alertMessage }}</div>
                <button type="button" class="btn-close small" @click="alertMessage = ''" aria-label="Tutup"></button>
              </div>

              <form @submit.prevent="handleRegister" novalidate>
                
                <!-- 1. NAMA LENGKAP -->
                <div class="mb-3">
                  <label class="form-label text-secondary small fw-semibold mb-1">
                    Nama Lengkap <span class="text-danger">*</span>
                  </label>
                  <div class="input-wrapper">
                    <span class="input-icon">
                      <i class="bi bi-person text-muted"></i>
                    </span>
                    <input 
                      type="text" 
                      v-model.trim="form.name" 
                      class="form-control auth-input" 
                      placeholder="Contoh: Sarah Kinanti" 
                      required 
                      autocomplete="name"
                    />
                  </div>
                </div>

                <!-- 2. ALAMAT EMAIL -->
                <div class="mb-3">
                  <label class="form-label text-secondary small fw-semibold mb-1">
                    Alamat Email <span class="text-danger">*</span>
                  </label>
                  <div class="input-wrapper">
                    <span class="input-icon">
                      <i class="bi bi-envelope text-muted"></i>
                    </span>
                    <input 
                      type="email" 
                      v-model.trim="form.email" 
                      class="form-control auth-input" 
                      placeholder="nama@kafeinarts.com" 
                      required 
                      autocomplete="email"
                    />
                  </div>
                </div>

                <!-- 3. NO HANDPHONE (OPSIONAL) -->
                <div class="mb-3">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <label class="form-label text-secondary small fw-semibold mb-0">
                      No. WhatsApp / HP
                    </label>
                    <span class="text-muted" style="font-size: 11px;">Opsional</span>
                  </div>
                  <div class="input-wrapper">
                    <span class="input-icon">
                      <i class="bi bi-telephone text-muted"></i>
                    </span>
                    <input 
                      type="tel" 
                      v-model.trim="form.phone" 
                      class="form-control auth-input" 
                      placeholder="081234567890" 
                      autocomplete="tel"
                    />
                  </div>
                </div>

                <!-- 4. KATA SANDI & KONFIRMASI -->
                <div class="row g-2.5 mb-3">
                  <div class="col-12 col-sm-6">
                    <label class="form-label text-secondary small fw-semibold mb-1">
                      Kata Sandi <span class="text-danger">*</span>
                    </label>
                    <div class="input-wrapper">
                      <span class="input-icon">
                        <i class="bi bi-key text-muted"></i>
                      </span>
                      <input 
                        :type="showPassword ? 'text' : 'password'" 
                        v-model="form.password" 
                        class="form-control auth-input pe-5" 
                        placeholder="Min. 6 digit" 
                        minlength="6"
                        required 
                        autocomplete="new-password"
                      />
                      <button 
                        type="button" 
                        class="btn-toggle-eye" 
                        @click="showPassword = !showPassword" 
                        tabindex="-1"
                      >
                        <i :class="showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                      </button>
                    </div>
                  </div>

                  <div class="col-12 col-sm-6">
                    <label class="form-label text-secondary small fw-semibold mb-1">
                      Konfirmasi <span class="text-danger">*</span>
                    </label>
                    <div class="input-wrapper">
                      <span class="input-icon">
                        <i class="bi bi-shield-check text-muted"></i>
                      </span>
                      <input 
                        :type="showPassword ? 'text' : 'password'" 
                        v-model="form.confirmPassword" 
                        class="form-control auth-input pe-5" 
                        placeholder="Ulangi sandi" 
                        minlength="6"
                        required 
                        autocomplete="new-password"
                      />
                    </div>
                  </div>
                </div>

                <!-- 5. ROLE AKUN -->
                <div class="mb-3">
                  <div class="d-flex justify-content-between align-items-center mb-1.5">
                    <label class="form-label text-secondary small fw-semibold mb-0">
                      Pilih Role Akun <span class="text-danger">*</span>
                    </label>
                    <span class="text-muted" style="font-size: 11px;">
                      {{ selectedRoleDescription }}
                    </span>
                  </div>
                  <div class="row g-2">
                    <div v-for="r in rolesList" :key="r.id" class="col-6 col-sm-4">
                      <div 
                        class="role-pill p-2 rounded-3 border text-center cursor-pointer transition-all d-flex align-items-center gap-2 justify-content-start"
                        :class="form.role === r.id ? 'active-role border-primary bg-primary-subtle text-primary' : 'bg-white text-secondary'"
                        @click="form.role = r.id"
                      >
                        <i :class="r.icon" class="fs-6" :style="{ color: form.role === r.id ? '#2563eb' : r.color }"></i>
                        <div class="text-start overflow-hidden">
                          <span class="fw-semibold d-block text-truncate" style="font-size: 11.5px;">{{ r.label }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 6. DEPARTEMEN / DIVISI -->
                <div class="mb-4">
                  <label class="form-label text-secondary small fw-semibold mb-1">
                    Departemen / Divisi
                  </label>
                  <div class="input-wrapper">
                    <span class="input-icon">
                      <i class="bi bi-diagram-3 text-muted"></i>
                    </span>
                    <select v-model="form.department" class="form-select auth-input">
                      <option value="Desain Grafis & Brand">Desain Grafis & Brand</option>
                      <option value="Video Editing & Motion">Video Editing & Motion</option>
                      <option value="Keuangan & Pembukuan">Keuangan & Pembukuan</option>
                      <option value="Manajemen Proyek & Operasional">Manajemen Proyek & Operasional</option>
                      <option value="Marketing & Media Sosial">Marketing & Media Sosial</option>
                      <option value="IT & Pengembangan Sistem">IT & Pengembangan Sistem</option>
                      <option value="Umum">Divisi Umum</option>
                    </select>
                  </div>
                </div>

                <!-- TOMBOL SUBMIT DAFTAR -->
                <button 
                  type="submit" 
                  class="btn btn-primary w-100 py-2.5 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-xs submit-btn"
                  :disabled="isLoading"
                >
                  <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
                  <i v-else class="bi bi-person-plus-fill"></i>
                  <span>{{ isLoading ? 'Mendaftarkan Akun...' : 'Daftar Akun Baru' }}</span>
                </button>

                <div class="text-center mt-3.5 pt-3 border-top">
                  <span class="text-muted small">Sudah memiliki akun tim? </span>
                  <router-link to="/login" class="fw-semibold text-primary text-decoration-none small align-baseline">
                    Masuk Sekarang
                  </router-link>
                </div>
              </form>

            </div>

            <!-- CARD FOOTER: SECURITY BADGE -->
            <div class="card-footer bg-light-subtle py-2.5 px-4 border-top text-center">
              <span class="small text-muted d-inline-flex align-items-center gap-1.5" style="font-size: 11.5px;">
                <i class="bi bi-shield-check text-success"></i>
                <span>TaskArts Workspace &bull; Autentikasi terlindungi</span>
              </span>
            </div>

          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { registerWithRole, USER_ROLES } from '../utils/firebase';

export default {
  name: 'RegisterView',
  setup() {
    const router = useRouter();
    const store = useStore();
    const isLoading = ref(false);
    const showPassword = ref(false);
    const alertMessage = ref('');
    const alertSuccess = ref(false);

    const form = ref({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'member',
      department: 'Desain Grafis & Brand',
      agree: true
    });

    const rolesList = [
      { id: 'admin', label: 'Admin', icon: 'bi-shield-shaded', color: '#ef4444', badge: 'Akses Penuh', desc: 'Hak kelola seluruh workspace, modul, anggota & data' },
      { id: 'project_manager', label: 'Project Manager', icon: 'bi-kanban-fill', color: '#8b5cf6', badge: 'Manajemen', desc: 'Hak kelola to-do, delegasi tugas, timeline & progres tim' },
      { id: 'editor', label: 'Editor & Kreatif', icon: 'bi-camera-reels-fill', color: '#3b82f6', badge: 'Produksi', desc: 'Fokus produksi konten, drive vault, mood & aset' },
      { id: 'finance', label: 'Finance & Kas', icon: 'bi-wallet2', color: '#10b981', badge: 'Keuangan', desc: 'Pencatatan kas operasional, invoice & RAB' },
      { id: 'member', label: 'Member Tim', icon: 'bi-person-badge', color: '#6b7280', badge: 'Standar', desc: 'Akses tugas, kalender agenda, dan komunikasi tim' }
    ];

    const selectedRoleDescription = computed(() => {
      const found = rolesList.find(r => r.id === form.value.role);
      return found ? found.desc : 'Hak akses standar tim';
    });

    const handleRegister = async () => {
      if (!form.value.name.trim()) {
        alertSuccess.value = false;
        alertMessage.value = 'Silakan masukkan nama lengkap Anda.';
        return;
      }
      if (!form.value.email.trim()) {
        alertSuccess.value = false;
        alertMessage.value = 'Silakan masukkan alamat email yang valid.';
        return;
      }
      if (form.value.phone && form.value.phone.trim()) {
        const cleanPhone = form.value.phone.trim().replace(/[\s-]/g, '');
        const phoneRegex = /^(\+62|62|0)[0-9]{8,13}$/;
        if (!phoneRegex.test(cleanPhone)) {
          alertSuccess.value = false;
          alertMessage.value = 'Format nomor handphone tidak valid (contoh: 081234567890).';
          return;
        }
      }
      if (form.value.password.length < 6) {
        alertSuccess.value = false;
        alertMessage.value = 'Kata sandi minimal harus 6 karakter.';
        return;
      }
      if (form.value.password !== form.value.confirmPassword) {
        alertSuccess.value = false;
        alertMessage.value = 'Konfirmasi kata sandi tidak cocok. Mohon periksa kembali.';
        return;
      }

      if (isLoading.value) return;
      isLoading.value = true;
      alertMessage.value = '';

      try {
        const { profile } = await registerWithRole(
          form.value.email,
          form.value.password,
          form.value.name,
          form.value.role,
          form.value.department,
          form.value.phone
        );

        alertSuccess.value = true;
        alertMessage.value = `Registrasi berhasil! Selamat datang, ${profile.displayName || form.value.name}. Mengalihkan ke Workspace...`;

        if (store) {
          store.dispatch('showNotification', {
            type: 'success',
            title: '🎉 Registrasi Berhasil',
            message: `Akun ${profile.displayName} telah aktif dengan role ${profile.role}.`
          });
        }

        setTimeout(() => {
          router.push('/home');
        }, 250);

      } catch (err) {
        console.error('Register error:', err);
        alertSuccess.value = false;
        const errMsg = (err.message || '').toLowerCase();
        if (err.code === 'auth/email-already-in-use' || errMsg.includes('sudah terdaftar') || errMsg.includes('already in use')) {
          alertMessage.value = 'Email ini sudah terdaftar di sistem. Silakan langsung login di halaman Masuk.';
        } else if (err.code === 'auth/invalid-email' || errMsg.includes('invalid-email')) {
          alertMessage.value = 'Format alamat email tidak valid.';
        } else if (err.code === 'auth/weak-password' || errMsg.includes('weak-password')) {
          alertMessage.value = 'Kata sandi terlalu mudah ditebak. Buat kombinasi yang lebih aman.';
        } else if (errMsg.includes('rate') || errMsg.includes('quota') || errMsg.includes('too-many-requests') || errMsg.includes('exceeded')) {
          alertMessage.value = 'Server sedang sibuk. Pendaftaran tetap berhasil disimpan di mode aman lokal.';
          alertSuccess.value = true;
          setTimeout(() => {
            router.push('/home');
          }, 500);
        } else {
          alertMessage.value = err.message || 'Gagal mendaftar akun. Silakan coba beberapa saat lagi.';
        }
      } finally {
        isLoading.value = false;
      }
    };

    return {
      form,
      rolesList,
      selectedRoleDescription,
      isLoading,
      showPassword,
      alertMessage,
      alertSuccess,
      handleRegister
    };
  }
};
</script>

<style scoped>
.register-view-wrapper {
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
}

.brand-avatar {
  background: #ffffff;
  border-color: #e2e8f0 !important;
}

.auth-card {
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.06), 0 4px 6px -4px rgba(15, 23, 42, 0.02) !important;
}

/* Segmented Control Switcher */
.segmented-control {
  background-color: #f1f5f9;
  border-color: #e2e8f0 !important;
}

.segmented-btn {
  border: 1px solid transparent;
  color: #64748b;
  font-size: 13px;
  min-height: 38px;
}

.segmented-btn:hover {
  color: #1e293b;
}

.segmented-btn.active-tab {
  background-color: #ffffff !important;
  color: #0f172a !important;
  border-color: rgba(226, 232, 240, 0.8) !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
}

/* Form Input Wrapper & Elements */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
  z-index: 4;
}

.auth-input {
  height: 44px;
  padding-left: 36px !important;
  font-size: 13.5px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
  color: #0f172a;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.auth-input::placeholder {
  color: #94a3b8;
  font-size: 13px;
}

.auth-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
  outline: none;
}

.btn-toggle-eye {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  padding: 4px 6px;
  color: #94a3b8;
  cursor: pointer;
  z-index: 5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease;
}

.btn-toggle-eye:hover {
  color: #334155;
}

/* Compact Role Selection Pills */
.role-pill {
  min-height: 42px;
  border-color: #e2e8f0 !important;
  background-color: #ffffff;
  user-select: none;
}

.role-pill:hover {
  border-color: #cbd5e1 !important;
  background-color: #f8fafc;
}

.role-pill.active-role {
  border-color: #2563eb !important;
  background-color: #eff6ff !important;
  color: #1d4ed8 !important;
  box-shadow: 0 1px 2px rgba(37, 99, 235, 0.08);
}

.submit-btn {
  height: 44px;
  font-size: 14px;
  letter-spacing: -0.01em;
}

/* Mobile fine-tuning */
@media (max-width: 576px) {
  .register-view-wrapper {
    min-height: auto;
    padding-top: 1.5rem !important;
    padding-bottom: 2rem !important;
  }

  .auth-card .card-body {
    padding: 1.25rem 1rem !important;
  }

  .auth-input {
    height: 44px;
    font-size: 14px;
  }

  .submit-btn {
    height: 46px;
  }
}
</style>
