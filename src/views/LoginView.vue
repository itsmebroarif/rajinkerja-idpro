<template>
  <div class="login-view-wrapper py-4 py-sm-5" data-aos="fade-up">
    <div class="container px-3 px-sm-4">
      <div class="row justify-content-center">
        <!-- Optimized Container Width: Compact, Elegant, Perfectly Proportioned -->
        <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
          
          <!-- BRAND & WORKSPACE HEADER -->
          <div class="text-center mb-4">
            <div class="brand-avatar d-inline-flex align-items-center justify-content-center p-2.5 rounded-4 shadow-xs bg-white border mb-2.5">
              <img src="/logo.svg" alt="TaskArts Logo" style="width: 40px; height: 40px;" />
            </div>
            <h3 class="fw-bold text-dark mb-1 tracking-tight">
              Task<span class="text-primary">Arts</span>
            </h3>
            <p class="text-muted small mb-0">
              Workspace Manajemen Proyek & Produktivitas Tim
            </p>
          </div>

          <!-- ACTIVE SESSION BANNER (IF ALREADY LOGGED IN) -->
          <div v-if="currentUser" class="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden auth-card">
            <div class="card-body p-4 text-center">
              <div class="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 shadow-xs" 
                   :class="isHostUser ? 'bg-dark text-warning' : 'bg-primary text-white'"
                   style="width: 60px; height: 60px;">
                <i v-if="isHostUser" class="bi bi-crown-fill fs-3 text-warning"></i>
                <span v-else class="fs-3 fw-bold">{{ (currentUser.displayName || currentUser.email || 'U')[0].toUpperCase() }}</span>
              </div>

              <div class="d-flex align-items-center justify-content-center gap-2 mb-1 flex-wrap">
                <h5 class="fw-bold text-dark mb-0">{{ currentUser.displayName || 'Pengguna Aktif' }}</h5>
                <span class="badge rounded-pill px-2.5 py-1 fw-semibold" :class="isHostUser ? 'bg-dark text-warning border border-warning' : 'bg-primary-subtle text-primary border border-primary-subtle'">
                  <i :class="isHostUser ? 'bi bi-crown-fill me-1' : 'bi bi-shield-check me-1'"></i>{{ isHostUser ? 'Host Project' : userRoleLabel }}
                </span>
              </div>
              <div class="text-muted small mb-3">{{ currentUser.email || 'arif_kafeinarts@kafeinarts.com' }}</div>

              <div class="p-3 bg-light rounded-3 border mb-3 text-start small">
                <div class="d-flex align-items-center justify-content-between text-muted mb-1.5">
                  <span>Status Sesi:</span>
                  <span class="badge bg-success-subtle text-success fw-semibold">Terautentikasi</span>
                </div>
                <div class="d-flex align-items-center justify-content-between text-muted mb-1.5">
                  <span>Hak Akses:</span>
                  <span class="fw-medium text-dark">{{ isHostUser ? 'Akses Penuh (Host)' : userRoleLabel }}</span>
                </div>
                <div class="d-flex align-items-center justify-content-between text-muted">
                  <span>Departemen:</span>
                  <span class="fw-medium text-dark">{{ currentUser.department || (isHostUser ? 'Host & Workspace Owner' : 'Umum') }}</span>
                </div>
              </div>

              <div class="d-flex flex-column gap-2">
                <button @click="goToDashboard" class="btn btn-primary rounded-3 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-xs w-100">
                  <i class="bi bi-grid-1x2-fill"></i>
                  <span>Buka Dashboard Workspace</span>
                </button>
                <div class="d-flex gap-2">
                  <router-link to="/auth" class="btn btn-outline-secondary rounded-3 py-2 fw-semibold d-flex align-items-center justify-content-center gap-1.5 flex-fill small">
                    <i class="bi bi-gear-fill"></i>
                    <span>Kelola Akun</span>
                  </router-link>
                  <button @click="handleLogout" class="btn btn-outline-danger rounded-3 py-2 fw-semibold d-flex align-items-center justify-content-center gap-1.5 flex-fill small">
                    <i class="bi bi-box-arrow-right"></i>
                    <span>Keluar Akun</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- NOT LOGGED IN / AUTH FORM CARD -->
          <div v-else class="card border-0 shadow-sm rounded-4 overflow-hidden auth-card bg-white">
            
            <div class="card-body p-3.5 p-sm-4 p-md-4">

              <!-- MINIMALIST SEGMENTED TAB SWITCHER -->
              <div class="segmented-control p-1 rounded-3 bg-light border d-flex mb-4">
                <button 
                  type="button" 
                  class="btn segmented-btn flex-fill rounded-2 py-2 small fw-semibold transition-all"
                  :class="activeTab === 'team_login' ? 'active-tab shadow-xs' : 'text-muted'"
                  @click="activeTab = 'team_login'; alertMessage = ''"
                >
                  <i class="bi bi-box-arrow-in-right me-1.5"></i>
                  <span>Masuk Akun</span>
                </button>
                <button 
                  type="button" 
                  class="btn segmented-btn flex-fill rounded-2 py-2 small fw-semibold transition-all"
                  :class="activeTab === 'register' ? 'active-tab shadow-xs' : 'text-muted'"
                  @click="activeTab = 'register'; alertMessage = ''"
                >
                  <i class="bi bi-person-plus-fill me-1.5"></i>
                  <span>Daftar Baru</span>
                </button>
              </div>

              <!-- ALERT FEEDBACK MESSAGE -->
              <div v-if="alertMessage" class="alert d-flex align-items-center gap-2 py-2.5 px-3 rounded-3 mb-3.5 shadow-xs border" :class="alertSuccess ? 'alert-success border-success-subtle' : 'alert-danger border-danger-subtle'">
                <i :class="alertSuccess ? 'bi bi-check-circle-fill text-success fs-6' : 'bi bi-exclamation-circle-fill text-danger fs-6'"></i>
                <div class="small fw-medium flex-grow-1">{{ alertMessage }}</div>
                <button type="button" class="btn-close small" @click="alertMessage = ''" aria-label="Tutup"></button>
              </div>

              <!-- ========================================================
                   TAB 1: LOGIN MANUAL AKUN TIM
                   ======================================================== -->
              <div v-if="activeTab === 'team_login'">
                <form @submit.prevent="handleEmailLogin" novalidate>
                  
                  <!-- Email / Username -->
                  <div class="mb-3">
                    <label class="form-label text-secondary small fw-semibold mb-1">
                      Email atau Username
                    </label>
                    <div class="input-wrapper">
                      <span class="input-icon">
                        <i class="bi bi-envelope text-muted"></i>
                      </span>
                      <input 
                        type="text" 
                        v-model.trim="loginForm.email" 
                        class="form-control auth-input" 
                        placeholder="nama@kafeinarts.com atau username" 
                        required 
                        autocomplete="username"
                      />
                    </div>
                  </div>

                  <!-- Password -->
                  <div class="mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <label class="form-label text-secondary small fw-semibold mb-0">
                        Kata Sandi
                      </label>
                    </div>
                    <div class="input-wrapper">
                      <span class="input-icon">
                        <i class="bi bi-key text-muted"></i>
                      </span>
                      <input 
                        :type="showPassword ? 'text' : 'password'" 
                        v-model="loginForm.password" 
                        class="form-control auth-input pe-5" 
                        placeholder="Masukkan kata sandi" 
                        required 
                        autocomplete="current-password"
                      />
                      <button 
                        type="button" 
                        class="btn-toggle-eye" 
                        @click="showPassword = !showPassword"
                        tabindex="-1"
                        :title="showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'"
                      >
                        <i :class="showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Tombol Masuk -->
                  <button 
                    type="submit" 
                    class="btn btn-primary w-100 py-2.5 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-xs submit-btn"
                    :disabled="isLoading"
                  >
                    <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
                    <i v-else class="bi bi-box-arrow-in-right"></i>
                    <span>{{ isLoading ? 'Sedang Masuk...' : 'Masuk ke Akun' }}</span>
                  </button>

                  <div class="text-center mt-3.5 pt-3 border-top">
                    <span class="text-muted small">Belum memiliki akun tim? </span>
                    <button 
                      type="button" 
                      @click="activeTab = 'register'; alertMessage = ''" 
                      class="btn btn-link p-0 fw-semibold text-primary text-decoration-none small align-baseline"
                    >
                      Daftar Baru di sini
                    </button>
                  </div>
                </form>
              </div>

              <!-- ========================================================
                   TAB 2: DAFTAR AKUN BARU MANUAL (REGISTER)
                   ======================================================== -->
              <div v-else-if="activeTab === 'register'">
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
                        v-model.trim="registerForm.name" 
                        class="form-control auth-input" 
                        :class="{ 'is-invalid': regErrors.name }"
                        placeholder="Contoh: Rian Anggara" 
                        @input="clearRegError('name')"
                        required 
                        autocomplete="name"
                      />
                    </div>
                    <div v-if="regErrors.name" class="text-danger small mt-1">
                      <i class="bi bi-exclamation-circle-fill me-1"></i>{{ regErrors.name }}
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
                        v-model.trim="registerForm.email" 
                        class="form-control auth-input" 
                        :class="{ 'is-invalid': regErrors.email }"
                        placeholder="nama@kafeinarts.com" 
                        @input="clearRegError('email')"
                        required 
                        autocomplete="email"
                      />
                    </div>
                    <div v-if="regErrors.email" class="text-danger small mt-1">
                      <i class="bi bi-exclamation-circle-fill me-1"></i>{{ regErrors.email }}
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
                        v-model.trim="registerForm.phone" 
                        class="form-control auth-input" 
                        :class="{ 'is-invalid': regErrors.phone }"
                        placeholder="081234567890" 
                        @input="clearRegError('phone')"
                        autocomplete="tel"
                      />
                    </div>
                    <div v-if="regErrors.phone" class="text-danger small mt-1">
                      <i class="bi bi-exclamation-circle-fill me-1"></i>{{ regErrors.phone }}
                    </div>
                  </div>

                  <!-- 4. KATA SANDI & KONFIRMASI (RESPONSIVE GRID) -->
                  <div class="row g-2.5 mb-3">
                    <!-- Kata Sandi -->
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
                          v-model="registerForm.password" 
                          class="form-control auth-input pe-5" 
                          :class="{ 'is-invalid': regErrors.password }"
                          placeholder="Min. 6 digit" 
                          minlength="6"
                          @input="clearRegError('password'); checkPasswordMatch()"
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
                      <div v-if="regErrors.password" class="text-danger small mt-1">
                        <i class="bi bi-exclamation-circle-fill me-1"></i>{{ regErrors.password }}
                      </div>
                    </div>

                    <!-- Konfirmasi Kata Sandi -->
                    <div class="col-12 col-sm-6">
                      <label class="form-label text-secondary small fw-semibold mb-1">
                        Konfirmasi <span class="text-danger">*</span>
                      </label>
                      <div class="input-wrapper">
                        <span class="input-icon">
                          <i class="bi bi-shield-check text-muted"></i>
                        </span>
                        <input 
                          :type="showConfirmPassword ? 'text' : 'password'" 
                          v-model="registerForm.confirmPassword" 
                          class="form-control auth-input pe-5" 
                          :class="{ 'is-invalid': regErrors.confirmPassword }"
                          placeholder="Ulangi sandi" 
                          @input="clearRegError('confirmPassword'); checkPasswordMatch()"
                          required 
                          autocomplete="new-password"
                        />
                        <button 
                          type="button" 
                          class="btn-toggle-eye" 
                          @click="showConfirmPassword = !showConfirmPassword" 
                          tabindex="-1"
                        >
                          <i :class="showConfirmPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                        </button>
                      </div>
                      <div v-if="regErrors.confirmPassword" class="text-danger small mt-1">
                        <i class="bi bi-exclamation-circle-fill me-1"></i>{{ regErrors.confirmPassword }}
                      </div>
                    </div>

                    <!-- Password Strength Bar -->
                    <div v-if="registerForm.password" class="col-12 mt-1">
                      <div class="progress" style="height: 3px;">
                        <div 
                          class="progress-bar transition-all" 
                          :class="passwordStrength.class" 
                          :style="{ width: `${passwordStrength.percent}%` }"
                        ></div>
                      </div>
                      <div class="d-flex justify-content-between align-items-center mt-1">
                        <span class="text-muted" style="font-size: 10.5px;">Kekuatan sandi:</span>
                        <span class="fw-semibold" :class="passwordStrength.textClass" style="font-size: 10.5px;">{{ passwordStrength.text }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- 5. OPSI ROLE (CLEAN COMPACT SELECTOR) -->
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
                      <div v-for="r in registerRoleOptions" :key="r.id" class="col-6 col-sm-4">
                        <div 
                          class="role-pill p-2 rounded-3 border text-center cursor-pointer transition-all d-flex align-items-center gap-2 justify-content-start"
                          :class="registerForm.role === r.id ? 'active-role border-primary bg-primary-subtle text-primary' : 'bg-white text-secondary'"
                          @click="registerForm.role = r.id; clearRegError('role')"
                        >
                          <i :class="r.icon" class="fs-6" :style="{ color: registerForm.role === r.id ? '#2563eb' : r.color }"></i>
                          <div class="text-start overflow-hidden">
                            <span class="fw-semibold d-block text-truncate" style="font-size: 11.5px;">{{ r.label }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-if="regErrors.role" class="text-danger small mt-1">
                      <i class="bi bi-exclamation-circle-fill me-1"></i>{{ regErrors.role }}
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
                      <select v-model="registerForm.department" class="form-select auth-input">
                        <option value="Kreatif & Desain">Kreatif & Desain</option>
                        <option value="Video Editing & Motion">Video Editing & Motion</option>
                        <option value="Keuangan & Pembukuan">Keuangan & Pembukuan</option>
                        <option value="Manajemen Proyek & Operasional">Manajemen Proyek & Operasional</option>
                        <option value="Marketing & Media Sosial">Marketing & Media Sosial</option>
                        <option value="Teknologi & IT">Teknologi & IT</option>
                        <option value="Umum">Divisi Umum</option>
                      </select>
                    </div>
                  </div>

                  <!-- TOMBOL SUBMIT PENDAFTARAN -->
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
                    <button 
                      type="button" 
                      @click="activeTab = 'team_login'; alertMessage = ''" 
                      class="btn btn-link p-0 fw-semibold text-primary text-decoration-none small align-baseline"
                    >
                      Masuk ke Akun
                    </button>
                  </div>
                </form>
              </div>

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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  auth,
  USER_ROLES,
  loginAsHostProject,
  getHostSession,
  getUserSession,
  loginWithEmail,
  registerWithRole,
  logoutUser
} from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter();
    const activeTab = ref('team_login');
    const isLoading = ref(false);
    const showPassword = ref(false);
    const alertMessage = ref('');
    const alertSuccess = ref(false);

    const currentUser = ref(null);
    const availableRoles = ref(USER_ROLES);

    // Host Gate Form (arif_kafeinarts | admin123)
    const hostForm = ref({
      username: 'arif_kafeinarts',
      password: 'admin123'
    });

    // Team Login Form
    const loginForm = ref({
      email: '',
      password: ''
    });

    const showConfirmPassword = ref(false);
    const regErrors = ref({});

    // Registration Form
    const registerForm = ref({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'member',
      department: 'Kreatif & Desain'
    });

    const registerRoleOptions = [
      { id: 'admin', label: 'Admin', icon: 'bi-shield-shaded', color: '#ef4444', badge: 'Akses Penuh', desc: 'Hak kelola seluruh workspace, anggota, role dan sistem' },
      { id: 'manager', label: 'Project Manager', icon: 'bi-kanban-fill', color: '#8b5cf6', badge: 'Manajemen', desc: 'Kelola alur tugas, to-do, delegasi tim & progres proyek' },
      { id: 'editor', label: 'Editor & Kreatif', icon: 'bi-camera-reels-fill', color: '#3b82f6', badge: 'Produksi', desc: 'Fokus produksi konten, aset desain, mood & Drive vault' },
      { id: 'finance', label: 'Finance & Kas', icon: 'bi-wallet2', color: '#10b981', badge: 'Keuangan', desc: 'Kelola kas operasional, invoice & RAB proyek' },
      { id: 'member', label: 'Member Tim', icon: 'bi-person-badge', color: '#6366f1', badge: 'Standar Tim', desc: 'Akses kalender, kolaborasi tugas harian & agenda tim' },
      { id: 'client', label: 'Klien (Tinjauan)', icon: 'bi-eye-fill', color: '#64748b', badge: 'Tinjauan', desc: 'Tinjau perkembangan proyek dan status tagihan invoice' }
    ];

    const selectedRoleDescription = computed(() => {
      const found = registerRoleOptions.find(r => r.id === registerForm.value.role);
      return found ? `${found.label} — ${found.desc}` : 'Akses standar tim';
    });

    const isValidEmail = (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    };

    const clearRegError = (field) => {
      if (regErrors.value[field]) {
        delete regErrors.value[field];
      }
    };

    const checkPasswordMatch = () => {
      if (registerForm.value.confirmPassword && registerForm.value.password !== registerForm.value.confirmPassword) {
        regErrors.value.confirmPassword = 'Konfirmasi kata sandi belum cocok.';
      } else if (registerForm.value.confirmPassword && registerForm.value.password === registerForm.value.confirmPassword) {
        delete regErrors.value.confirmPassword;
      }
    };

    const passwordStrength = computed(() => {
      const p = registerForm.value.password || '';
      if (!p) return { text: '', percent: 0, class: 'bg-secondary', textClass: 'text-muted' };
      if (p.length < 6) return { text: 'Terlalu Pendek (min 6)', percent: 25, class: 'bg-danger', textClass: 'text-danger' };
      const hasLetters = /[a-zA-Z]/.test(p);
      const hasNumbers = /[0-9]/.test(p);
      const hasSpecial = /[^a-zA-Z0-9]/.test(p);
      if (p.length >= 8 && hasLetters && hasNumbers && hasSpecial) {
        return { text: 'Sangat Kuat', percent: 100, class: 'bg-success', textClass: 'text-success' };
      }
      if (p.length >= 6 && hasLetters && hasNumbers) {
        return { text: 'Sedang / Cukup Kuat', percent: 70, class: 'bg-info', textClass: 'text-info' };
      }
      return { text: 'Standar (min 6)', percent: 45, class: 'bg-warning', textClass: 'text-warning' };
    });

    const validateRegisterForm = () => {
      const errors = {};
      
      // 1. Nama Lengkap
      if (!registerForm.value.name || !registerForm.value.name.trim()) {
        errors.name = 'Nama lengkap wajib diisi.';
      } else if (registerForm.value.name.trim().length < 2) {
        errors.name = 'Nama lengkap minimal 2 karakter.';
      }

      // 2. Alamat Email
      if (!registerForm.value.email || !registerForm.value.email.trim()) {
        errors.email = 'Alamat email wajib diisi.';
      } else if (!isValidEmail(registerForm.value.email.trim())) {
        errors.email = 'Format email tidak valid (contoh: user@kafeinarts.com).';
      }

      // 3. No Handphone (Opsional)
      if (registerForm.value.phone && registerForm.value.phone.trim()) {
        const cleanPhone = registerForm.value.phone.trim().replace(/[\s-]/g, '');
        const phoneRegex = /^(\+62|62|0)[0-9]{8,13}$/;
        if (!phoneRegex.test(cleanPhone)) {
          errors.phone = 'Format no handphone tidak valid (contoh: 081234567890).';
        }
      }

      // 4. Kata Sandi
      if (!registerForm.value.password) {
        errors.password = 'Kata sandi wajib diisi.';
      } else if (registerForm.value.password.length < 6) {
        errors.password = 'Kata sandi minimal harus 6 karakter.';
      }

      // 5. Konfirmasi Kata Sandi
      if (!registerForm.value.confirmPassword) {
        errors.confirmPassword = 'Konfirmasi kata sandi wajib diisi.';
      } else if (registerForm.value.confirmPassword !== registerForm.value.password) {
        errors.confirmPassword = 'Konfirmasi kata sandi tidak cocok.';
      }

      // 6. Opsi Role
      if (!registerForm.value.role) {
        errors.role = 'Silakan pilih salah satu peran (role) akun.';
      }

      regErrors.value = errors;
      return Object.keys(errors).length === 0;
    };

    const isHostUser = computed(() => {
      if (!currentUser.value) return false;
      if (currentUser.value.isHostProject || currentUser.value.role === 'host') return true;
      if (currentUser.value.uid === 'host_arif_kafeinarts') return true;
      if (currentUser.value.email === 'arif_kafeinarts@kafeinarts.com' || currentUser.value.username === 'arif_kafeinarts') return true;
      return false;
    });

    const userRoleLabel = computed(() => {
      if (isHostUser.value) return 'Host Project (Super Master)';
      const r = availableRoles.value.find(x => x.id === (currentUser.value?.role || 'member'));
      return r ? r.label : 'Member';
    });

    const fillHostCredentials = () => {
      activeTab.value = 'host_gate';
      hostForm.value.username = 'arif_kafeinarts';
      hostForm.value.password = 'admin123';
      alertMessage.value = 'Kredensial Host diisi otomatis (arif_kafeinarts | admin123). Silakan tekan tombol Masuk!';
      alertSuccess.value = true;
    };

    const refreshActiveSession = () => {
      const host = getHostSession();
      if (host) {
        currentUser.value = host;
        return;
      }
      const customUser = getUserSession();
      if (customUser) {
        currentUser.value = customUser;
        return;
      }
      if (auth.currentUser) {
        currentUser.value = {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0],
          role: 'member'
        };
      } else {
        currentUser.value = null;
      }
    };

    const goToDashboard = () => {
      router.push('/home');
    };

    const handleHostLogin = async () => {
      isLoading.value = true;
      alertMessage.value = '';
      try {
        const { profile } = await loginAsHostProject(hostForm.value.username, hostForm.value.password);
        currentUser.value = profile;
        alertSuccess.value = true;
        alertMessage.value = `Selamat datang, ${profile.displayName}! Mengarahkan ke Dashboard...`;
        setTimeout(() => {
          router.push('/home');
        }, 200);
      } catch (err) {
        alertSuccess.value = false;
        alertMessage.value = err.message || 'Gagal masuk sebagai Host Project.';
      } finally {
        isLoading.value = false;
      }
    };

    const handleEmailLogin = async () => {
      isLoading.value = true;
      alertMessage.value = '';
      try {
        const { profile, user } = await loginWithEmail(loginForm.value.email, loginForm.value.password);
        currentUser.value = profile || user;
        alertSuccess.value = true;
        alertMessage.value = `Berhasil masuk sebagai ${profile.displayName || user.email}! Mengarahkan ke Dashboard...`;
        setTimeout(() => {
          router.push('/home');
        }, 200);
      } catch (err) {
        alertSuccess.value = false;
        alertMessage.value = err.message || 'Gagal masuk. Periksa email/username dan kata sandi Anda.';
      } finally {
        isLoading.value = false;
      }
    };

    const handleRegister = async () => {
      if (isLoading.value) return; // Prevent double clicks
      alertMessage.value = '';
      if (!validateRegisterForm()) {
        alertSuccess.value = false;
        alertMessage.value = 'Mohon periksa kolom formulir pendaftaran yang ditandai merah.';
        return;
      }

      isLoading.value = true;
      try {
        const { profile, user } = await registerWithRole(
          registerForm.value.email,
          registerForm.value.password,
          registerForm.value.name,
          registerForm.value.role,
          registerForm.value.department,
          registerForm.value.phone
        );
        currentUser.value = profile || user;
        alertSuccess.value = true;
        alertMessage.value = `Akun berhasil didaftarkan sebagai ${profile.role || 'Member'}! Mengarahkan ke Dashboard...`;
        setTimeout(() => {
          router.push('/home');
        }, 300);
      } catch (err) {
        alertSuccess.value = false;
        const errMsg = (err.message || '').toLowerCase();
        if (err.code === 'auth/email-already-in-use' || errMsg.includes('sudah terdaftar') || errMsg.includes('already in use')) {
          regErrors.value.email = 'Email ini sudah terdaftar. Silakan gunakan tab Masuk Akun Tim.';
          alertMessage.value = 'Email sudah terdaftar di sistem. Silakan langsung login di tab Masuk.';
        } else if (err.code === 'auth/invalid-email' || errMsg.includes('invalid-email')) {
          regErrors.value.email = 'Format alamat email tidak valid.';
          alertMessage.value = 'Format alamat email tidak valid.';
        } else if (err.code === 'auth/weak-password' || errMsg.includes('weak-password')) {
          regErrors.value.password = 'Kata sandi terlalu mudah ditebak. Gunakan kombinasi lebih aman.';
          alertMessage.value = 'Kata sandi terlalu lemah (minimal 6 karakter).';
        } else if (errMsg.includes('rate') || errMsg.includes('quota') || errMsg.includes('too-many-requests') || errMsg.includes('exceeded')) {
          alertMessage.value = 'Server sedang sibuk. Pendaftaran tetap berhasil disimpan di mode aman lokal.';
          alertSuccess.value = true;
          setTimeout(() => {
            router.push('/home');
          }, 600);
        } else {
          alertMessage.value = err.message || 'Gagal mendaftarkan akun baru.';
        }
      } finally {
        isLoading.value = false;
      }
    };

    const handleLogout = async () => {
      try {
        await logoutUser();
        currentUser.value = null;
        alertSuccess.value = true;
        alertMessage.value = 'Anda telah keluar dari akun.';
      } catch (err) {
        alertSuccess.value = false;
        alertMessage.value = err.message;
      }
    };

    onMounted(() => {
      refreshActiveSession();
      window.addEventListener('taskarts-auth-changed', refreshActiveSession);
      onAuthStateChanged(auth, () => {
        refreshActiveSession();
      });
    });

    return {
      activeTab,
      isLoading,
      showPassword,
      showConfirmPassword,
      alertMessage,
      alertSuccess,
      currentUser,
      isHostUser,
      userRoleLabel,
      availableRoles,
      registerRoleOptions,
      selectedRoleDescription,
      hostForm,
      loginForm,
      registerForm,
      regErrors,
      passwordStrength,
      isValidEmail,
      clearRegError,
      checkPasswordMatch,
      fillHostCredentials,
      goToDashboard,
      handleHostLogin,
      handleEmailLogin,
      handleRegister,
      handleLogout
    };
  }
};
</script>

<style scoped>
.login-view-wrapper {
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

.auth-input.is-invalid {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
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
  .login-view-wrapper {
    min-height: auto;
    padding-top: 1.5rem !important;
    padding-bottom: 2rem !important;
  }

  .auth-card .card-body {
    padding: 1.25rem 1rem !important;
  }

  .auth-input {
    height: 44px; /* Ensure 44px mobile touch target */
    font-size: 14px; /* Prevents iOS auto-zoom on input focus */
  }

  .submit-btn {
    height: 46px;
  }
}
</style>
