<template>
  <div class="register-view-wrapper py-4 py-md-5" data-aos="fade-up">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-md-10 col-lg-8 col-xl-7">
          
          <!-- BRAND & WORKSPACE HEADER -->
          <div class="text-center mb-4">
            <router-link to="/login" class="text-decoration-none d-inline-block">
              <div class="d-inline-flex align-items-center justify-content-center p-3 rounded-4 shadow-sm bg-white border mb-3 brand-logo-box">
                <img src="/logo.svg" alt="TaskArts Logo" style="width: 46px; height: 46px;" />
              </div>
            </router-link>
            <h2 class="fw-black text-dark mb-1 d-flex align-items-center justify-content-center gap-2">
              <span>Task<span class="text-primary">Arts</span></span>
              <span class="badge bg-warning text-dark fs-7 px-2.5 py-1 rounded-pill fw-bold">By Kafeinarts</span>
            </h2>
            <p class="text-muted small mb-0">
              Pendaftaran Akun Pengguna Baru & Kolaborasi Tim Workspace
            </p>
          </div>

          <!-- REGISTRATION CARD -->
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden auth-card bg-surface">
            
            <!-- CARD HEADER / TABS -->
            <div class="card-header bg-white border-bottom p-0">
              <div class="d-flex">
                <div class="w-50 text-center py-3 border-bottom border-3 border-primary bg-light-subtle text-primary fw-bold small d-flex align-items-center justify-content-center gap-1.5">
                  <i class="bi bi-person-plus-fill"></i>
                  <span>Daftar Akun Baru</span>
                </div>
                <router-link 
                  to="/login" 
                  class="w-50 text-center py-3 text-muted text-decoration-none fw-semibold small d-flex align-items-center justify-content-center gap-1.5 hover-primary"
                >
                  <i class="bi bi-box-arrow-in-right"></i>
                  <span>Sudah Ada Akun? Masuk</span>
                </router-link>
              </div>
            </div>

            <div class="card-body p-4 p-md-5">

              <!-- ALERT FEEDBACK MESSAGE -->
              <div v-if="alertMessage" class="alert d-flex align-items-center gap-2 py-2.5 px-3 rounded-3 mb-4 shadow-xs" :class="alertSuccess ? 'alert-success border-success-subtle' : 'alert-danger border-danger-subtle'">
                <i :class="alertSuccess ? 'bi bi-check-circle-fill text-success fs-5' : 'bi bi-exclamation-triangle-fill text-danger fs-5'"></i>
                <div class="small fw-semibold flex-grow-1">{{ alertMessage }}</div>
                <button type="button" class="btn-close small" @click="alertMessage = ''"></button>
              </div>

              <form @submit.prevent="handleRegister">
                <!-- NAMA LENGKAP -->
                <div class="mb-3">
                  <label class="form-label fw-bold small text-dark mb-1">
                    Nama Lengkap / Display Name <span class="text-danger">*</span>
                  </label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0 text-muted">
                      <i class="bi bi-person-fill"></i>
                    </span>
                    <input 
                      type="text" 
                      v-model.trim="form.name" 
                      class="form-control border-start-0" 
                      placeholder="Contoh: Sarah Kinanti" 
                      required 
                      autocomplete="name"
                    />
                  </div>
                </div>

                <!-- ALAMAT EMAIL -->
                <div class="mb-3">
                  <label class="form-label fw-bold small text-dark mb-1">
                    Alamat Email <span class="text-danger">*</span>
                  </label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0 text-muted">
                      <i class="bi bi-envelope-fill"></i>
                    </span>
                    <input 
                      type="email" 
                      v-model.trim="form.email" 
                      class="form-control border-start-0" 
                      placeholder="nama@kafeinarts.com atau email aktif" 
                      required 
                      autocomplete="email"
                    />
                  </div>
                  <div class="form-text small text-muted">Email ini akan digunakan untuk login ke workspace.</div>
                </div>

                <!-- KATA SANDI & KONFIRMASI -->
                <div class="row g-3 mb-3">
                  <div class="col-12 col-md-6">
                    <label class="form-label fw-bold small text-dark mb-1">
                      Kata Sandi <span class="text-danger">*</span>
                    </label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0 text-muted">
                        <i class="bi bi-key-fill"></i>
                      </span>
                      <input 
                        :type="showPassword ? 'text' : 'password'" 
                        v-model="form.password" 
                        class="form-control border-start-0 border-end-0" 
                        placeholder="Minimal 6 karakter" 
                        minlength="6"
                        required 
                        autocomplete="new-password"
                      />
                      <button type="button" class="btn btn-outline-secondary border-start-0" @click="showPassword = !showPassword" tabindex="-1">
                        <i :class="showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                      </button>
                    </div>
                  </div>

                  <div class="col-12 col-md-6">
                    <label class="form-label fw-bold small text-dark mb-1">
                      Konfirmasi Sandi <span class="text-danger">*</span>
                    </label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0 text-muted">
                        <i class="bi bi-shield-lock-fill"></i>
                      </span>
                      <input 
                        :type="showPassword ? 'text' : 'password'" 
                        v-model="form.confirmPassword" 
                        class="form-control border-start-0 border-end-0" 
                        placeholder="Ulangi kata sandi" 
                        minlength="6"
                        required 
                        autocomplete="new-password"
                      />
                      <span class="input-group-text bg-light border-start-0" v-if="form.confirmPassword">
                        <i v-if="form.password === form.confirmPassword" class="bi bi-check-circle-fill text-success"></i>
                        <i v-else class="bi bi-x-circle-fill text-danger"></i>
                      </span>
                    </div>
                  </div>
                </div>

                <!-- ROLE AKUN (PERAN) -->
                <div class="mb-3">
                  <label class="form-label fw-bold small text-dark mb-1 d-flex align-items-center justify-content-between">
                    <span>Pilih Peran Akun (Role Akses) <span class="text-danger">*</span></span>
                    <span class="badge bg-primary-subtle text-primary fw-semibold" style="font-size: 11px;">
                      {{ selectedRoleDescription }}
                    </span>
                  </label>
                  <div class="row g-2">
                    <div v-for="r in rolesList" :key="r.id" class="col-6 col-sm-4">
                      <div 
                        class="p-2.5 rounded-3 border role-select-card cursor-pointer text-center transition-all h-100 d-flex flex-column align-items-center justify-content-center"
                        :class="form.role === r.id ? 'border-primary bg-primary-subtle text-primary shadow-xs' : 'bg-light-subtle text-dark hover-border-primary'"
                        @click="form.role = r.id"
                      >
                        <i :class="r.icon" class="fs-5 mb-1" :style="{ color: form.role === r.id ? 'var(--primary-color)' : r.color }"></i>
                        <span class="fw-bold d-block" style="font-size: 12px;">{{ r.label }}</span>
                        <small class="text-muted text-truncate w-100" style="font-size: 10px;">{{ r.badge }}</small>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- DEPARTEMEN / DIVISI -->
                <div class="mb-4">
                  <label class="form-label fw-bold small text-dark mb-1">
                    Departemen / Divisi Kerja
                  </label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0 text-muted">
                      <i class="bi bi-diagram-3-fill"></i>
                    </span>
                    <select v-model="form.department" class="form-select border-start-0">
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

                <!-- PERSETUJUAN KETENTUAN -->
                <div class="mb-4 form-check text-start">
                  <input type="checkbox" class="form-check-input" id="termsAgree" v-model="form.agree" required />
                  <label class="form-check-label small text-muted user-select-none" for="termsAgree">
                    Saya menyetujui seluruh ketentuan privasi dan standar kolaborasi TaskArts Workspace Kafeinarts.
                  </label>
                </div>

                <!-- TOMBOL SUBMIT DAFTAR -->
                <button 
                  type="submit" 
                  class="btn btn-primary w-100 py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-xs mb-3"
                  :disabled="isLoading || !form.agree"
                >
                  <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
                  <i v-else class="bi bi-person-plus-fill fs-5"></i>
                  <span>{{ isLoading ? 'Mendaftarkan Akun Anda...' : 'Daftar Akun Baru Sekarang' }}</span>
                </button>

                <!-- ALTERNATIVE LOGIN / REGISTER DENGAN GOOGLE -->
                <div class="position-relative my-4 text-center">
                  <hr class="text-muted opacity-25" />
                  <span class="position-absolute top-50 start-50 translate-middle px-3 bg-white text-muted small fw-semibold">
                    atau daftar dengan
                  </span>
                </div>

                <button 
                  type="button" 
                  @click="handleGoogleRegister" 
                  class="btn btn-outline-secondary w-100 py-2.5 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-xs mb-2"
                  :disabled="isLoading"
                >
                  <svg class="me-1" width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Daftar / Masuk Cepat dengan Akun Google</span>
                </button>
              </form>

            </div>

            <!-- CARD FOOTER: LINK KE LOGIN -->
            <div class="card-footer bg-light p-3 border-top d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2 text-center text-sm-start">
              <div class="small text-muted">
                Sudah memiliki akun terdaftar?
              </div>
              <router-link to="/login" class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1.5 fw-bold text-decoration-none">
                <i class="bi bi-box-arrow-in-right me-1"></i>Masuk ke Akun Anda
              </router-link>
            </div>

          </div>

          <!-- BOTTOM SECURITY & HOST NOTE -->
          <div class="text-center mt-3 text-muted small">
            <i class="bi bi-shield-lock-fill text-success me-1"></i>
            Data pendaftaran diamankan secara lokal & Firebase Firestore.
            <router-link to="/login" class="text-decoration-none ms-1 text-primary fw-semibold">
              Buka Gerbang Host Project
            </router-link>
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
import { registerWithRole, loginWithGoogle, USER_ROLES } from '../utils/firebase';

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

      isLoading.value = true;
      alertMessage.value = '';

      try {
        const { profile } = await registerWithRole(
          form.value.email,
          form.value.password,
          form.value.name,
          form.value.role,
          form.value.department
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
        if (err.code === 'auth/email-already-in-use') {
          alertMessage.value = 'Email ini sudah terdaftar di sistem. Silakan langsung login di halaman Masuk.';
        } else if (err.code === 'auth/invalid-email') {
          alertMessage.value = 'Format alamat email tidak valid.';
        } else if (err.code === 'auth/weak-password') {
          alertMessage.value = 'Kata sandi terlalu mudah ditebak. Buat kombinasi yang lebih aman.';
        } else {
          alertMessage.value = err.message || 'Gagal mendaftar akun. Silakan coba beberapa saat lagi.';
        }
      } finally {
        isLoading.value = false;
      }
    };

    const handleGoogleRegister = async () => {
      isLoading.value = true;
      alertMessage.value = '';
      try {
        const { profile, user } = await loginWithGoogle();
        alertSuccess.value = true;
        alertMessage.value = `Berhasil terhubung dengan Google! Mengalihkan ke Workspace...`;
        if (store) {
          store.dispatch('showNotification', {
            type: 'success',
            title: '🎉 Berhasil Masuk',
            message: `Terhubung sebagai ${profile?.displayName || user?.displayName || 'Pengguna'}.`
          });
        }
        setTimeout(() => {
          router.push('/home');
        }, 250);
      } catch (err) {
        alertSuccess.value = false;
        alertMessage.value = err.message || 'Pendaftaran dengan Google dibatalkan atau terkendala.';
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
      handleRegister,
      handleGoogleRegister
    };
  }
};
</script>

<style scoped>
.register-view-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background-color: var(--bg-app, #f8fafc);
}

.brand-logo-box {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.brand-logo-box:hover {
  transform: scale(1.05);
}

.auth-card {
  border: 1px solid var(--sidebar-divider, #e2e8f0) !important;
}

.role-select-card {
  border-width: 1.5px !important;
  cursor: pointer;
  user-select: none;
}
.role-select-card:hover {
  transform: translateY(-1px);
}
.hover-border-primary:hover {
  border-color: var(--primary-color, #2563eb) !important;
}

.hover-primary:hover {
  color: var(--primary-color, #2563eb) !important;
}
</style>
