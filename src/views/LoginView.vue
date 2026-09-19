<template>
  <div class="login-view-wrapper py-4 py-md-5" data-aos="fade-up">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-md-10 col-lg-8 col-xl-7">
          
          <!-- BRAND & WORKSPACE HEADER -->
          <div class="text-center mb-4">
            <div class="d-inline-flex align-items-center justify-content-center p-3 rounded-4 shadow-sm bg-white border mb-3">
              <img src="/logo.svg" alt="TaskArts Logo" style="width: 48px; height: 48px;" />
            </div>
            <h2 class="fw-black text-dark mb-1 d-flex align-items-center justify-content-center gap-2">
              <span>Task<span class="text-primary">Arts</span></span>
              <span class="badge bg-warning text-dark fs-7 px-2.5 py-1 rounded-pill fw-bold">By Kafeinarts</span>
            </h2>
            <p class="text-muted small mb-0">
              Workspace Terpadu Manajemen Proyek, Arus Kas & Produktivitas Tim
            </p>
          </div>

          <!-- ACTIVE SESSION BANNER (IF ALREADY LOGGED IN) -->
          <div v-if="currentUser" class="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden" :class="isHostUser ? 'border-top border-4 border-warning' : 'border-top border-4 border-primary'">
            <div class="card-body p-4 text-center">
              <div class="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 shadow-xs" 
                   :class="isHostUser ? 'bg-dark text-warning' : 'bg-primary text-white'"
                   style="width: 68px; height: 68px;">
                <i v-if="isHostUser" class="bi bi-crown-fill fs-2 text-warning"></i>
                <span v-else class="fs-2 fw-black">{{ (currentUser.displayName || currentUser.email || 'U')[0].toUpperCase() }}</span>
              </div>

              <div class="d-flex align-items-center justify-content-center gap-2 mb-1">
                <h5 class="fw-bold text-dark mb-0">{{ currentUser.displayName || 'Pengguna Aktif' }}</h5>
                <span class="badge rounded-pill px-2.5 py-1 fw-bold" :class="isHostUser ? 'bg-dark text-warning border border-warning' : 'bg-primary-subtle text-primary border border-primary-subtle'">
                  <i :class="isHostUser ? 'bi bi-crown-fill me-1' : 'bi bi-shield-check me-1'"></i>{{ isHostUser ? 'Host Project (Super Master)' : userRoleLabel }}
                </span>
              </div>
              <div class="text-muted font-monospace small mb-3">{{ currentUser.email || 'arif_kafeinarts@kafeinarts.com' }}</div>

              <div class="p-3 bg-light rounded-3 border mb-3 text-start small">
                <div class="d-flex align-items-center justify-content-between text-muted mb-1">
                  <span>Status Sesi:</span>
                  <span class="badge bg-success-subtle text-success fw-bold">Terautentikasi & Siap</span>
                </div>
                <div class="d-flex align-items-center justify-content-between text-muted mb-1">
                  <span>Hak Akses:</span>
                  <span class="fw-semibold text-dark">{{ isHostUser ? '👑 Akses Penuh 100% + Buat Akun' : 'Sesuai Role (' + userRoleLabel + ')' }}</span>
                </div>
                <div class="d-flex align-items-center justify-content-between text-muted">
                  <span>Departemen:</span>
                  <span class="fw-semibold text-dark">{{ currentUser.department || (isHostUser ? 'Host & Workspace Owner' : 'Umum') }}</span>
                </div>
              </div>

              <div class="d-flex flex-column flex-sm-row gap-2 justify-content-center">
                <button @click="goToDashboard" class="btn btn-primary rounded-pill px-4 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-xs flex-grow-1">
                  <i class="bi bi-grid-1x2-fill"></i>
                  <span>Lanjutkan ke Dashboard Workspace</span>
                </button>
                <router-link to="/auth" class="btn btn-outline-secondary rounded-pill px-3 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-1.5">
                  <i class="bi bi-gear-fill"></i>
                  <span>Kelola Akun</span>
                </router-link>
                <button @click="handleLogout" class="btn btn-outline-danger rounded-pill px-3 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-1.5">
                  <i class="bi bi-box-arrow-right"></i>
                  <span>Ganti Akun</span>
                </button>
              </div>
            </div>
          </div>

          <!-- NOT LOGGED IN / SWITCH ACCOUNT FORM CARD -->
          <div v-else class="card border-0 shadow-sm rounded-4 overflow-hidden auth-card">
            
            <!-- CARD TABS NAVIGATION -->
            <div class="card-header bg-white border-bottom p-0">
              <ul class="nav nav-tabs nav-fill border-0 fw-bold small">
                <!-- TAB 1: GERBANG HOST PROJECT (DEFAULT) -->
                <li class="nav-item">
                  <button 
                    class="nav-link py-3 border-0 rounded-0 d-flex align-items-center justify-content-center gap-1.5 w-100" 
                    :class="{ active: activeTab === 'host_gate', 'text-dark': activeTab === 'host_gate' }" 
                    type="button" 
                    @click="activeTab = 'host_gate'"
                  >
                    <i class="bi bi-crown-fill text-warning"></i>
                    <span>👑 Gerbang Host Project</span>
                  </button>
                </li>
                <!-- TAB 2: LOGIN AKUN TIM -->
                <li class="nav-item">
                  <button 
                    class="nav-link py-3 border-0 rounded-0 d-flex align-items-center justify-content-center gap-1.5 w-100" 
                    :class="{ active: activeTab === 'team_login', 'text-primary': activeTab === 'team_login' }" 
                    type="button" 
                    @click="activeTab = 'team_login'"
                  >
                    <i class="bi bi-box-arrow-in-right text-primary"></i>
                    <span>Masuk Akun Tim</span>
                  </button>
                </li>
                <!-- TAB 3: REGISTER BARU (LINK KE HALAMAN REGISTER) -->
                <li class="nav-item">
                  <router-link 
                    to="/register" 
                    class="nav-link py-3 border-0 rounded-0 d-flex align-items-center justify-content-center gap-1.5 w-100 text-success text-decoration-none"
                  >
                    <i class="bi bi-person-plus-fill text-success"></i>
                    <span>Daftar Baru</span>
                  </router-link>
                </li>
              </ul>
            </div>

            <div class="card-body p-4 p-md-5">

              <!-- ALERT FEEDBACK MESSAGE -->
              <div v-if="alertMessage" class="alert d-flex align-items-center gap-2 py-2.5 px-3 rounded-3 mb-4 shadow-xs" :class="alertSuccess ? 'alert-success border-success-subtle' : 'alert-danger border-danger-subtle'">
                <i :class="alertSuccess ? 'bi bi-check-circle-fill text-success fs-5' : 'bi bi-exclamation-triangle-fill text-danger fs-5'"></i>
                <div class="small fw-semibold flex-grow-1">{{ alertMessage }}</div>
                <button type="button" class="btn-close small" @click="alertMessage = ''"></button>
              </div>

              <!-- ========================================================
                   TAB 1: GERBANG HOST PROJECT (arif_kafeinarts | admin123)
                   ======================================================== -->
              <div v-if="activeTab === 'host_gate'">
                <!-- Highlight Banner -->
                <div class="p-3 bg-dark text-white rounded-4 mb-4 border border-warning shadow-xs">
                  <div class="d-flex align-items-center gap-3">
                    <div class="bg-warning text-dark rounded-circle p-2 d-flex align-items-center justify-content-center fs-3 fw-black flex-shrink-0" style="width: 48px; height: 48px;">
                      <i class="bi bi-crown-fill"></i>
                    </div>
                    <div>
                      <div class="d-flex align-items-center gap-2">
                        <h6 class="fw-black text-warning mb-0">Gerbang Otoritas Host Project</h6>
                        <span class="badge bg-warning text-dark fw-bold" style="font-size: 10px;">Super Master</span>
                      </div>
                      <p class="text-white-50 small mb-0 mt-1">
                        Kredensial khusus: <code>arif_kafeinarts</code> | <code>admin123</code>. Memiliki <strong>seluruh akses 100%</strong> dan hak penuh <strong>membuatkan akun</strong> pengguna tim.
                      </p>
                    </div>
                  </div>
                </div>

                <form @submit.prevent="handleHostLogin">
                  <div class="mb-3">
                    <label class="form-label fw-bold small text-dark">Username Host <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0"><i class="bi bi-person-badge-fill text-warning"></i></span>
                      <input 
                        type="text" 
                        v-model.trim="hostForm.username" 
                        class="form-control border-start-0" 
                        placeholder="arif_kafeinarts" 
                        required 
                        autocomplete="username"
                      />
                    </div>
                    <div class="form-text small">Username Host: <code>arif_kafeinarts</code></div>
                  </div>

                  <div class="mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <label class="form-label fw-bold small text-dark mb-0">Password Host <span class="text-danger">*</span></label>
                      <button type="button" @click="fillHostCredentials" class="btn btn-link btn-sm p-0 text-decoration-none small text-primary fw-bold">
                        <i class="bi bi-lightning-charge-fill me-1 text-warning"></i>Isi Cepat (arif_kafeinarts | admin123)
                      </button>
                    </div>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0"><i class="bi bi-key-fill text-muted"></i></span>
                      <input 
                        :type="showPassword ? 'text' : 'password'" 
                        v-model="hostForm.password" 
                        class="form-control border-start-0 border-end-0" 
                        placeholder="admin123" 
                        required 
                        autocomplete="current-password"
                      />
                      <button type="button" class="btn btn-outline-secondary border-start-0" @click="showPassword = !showPassword">
                        <i :class="showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    class="btn btn-dark text-warning border border-warning w-100 py-2.5 rounded-3 fw-black d-flex align-items-center justify-content-center gap-2 shadow-sm mb-3"
                    :disabled="isLoading"
                  >
                    <span v-if="isLoading" class="spinner-border spinner-border-sm text-warning" role="status"></span>
                    <i v-else class="bi bi-shield-check fs-5"></i>
                    <span>{{ isLoading ? 'Memverifikasi Host Project...' : 'Buka Gerbang & Masuk sebagai Host Project' }}</span>
                  </button>

                  <div class="p-3 bg-light rounded-3 border small">
                    <div class="fw-bold text-dark mb-1"><i class="bi bi-stars text-warning me-1"></i>Hak Akses Host Project:</div>
                    <ul class="list-unstyled mb-0 text-muted ps-1">
                      <li class="mb-1"><i class="bi bi-check2-circle text-success me-1"></i><strong>Seluruh Akses 100%:</strong> Akses tanpa batas ke Keuangan, RAB, Invoice, Tugas & Drive.</li>
                      <li><i class="bi bi-check2-circle text-success me-1"></i><strong>Pembuat Akun:</strong> Dapat membuatkan akun dan menentukan role untuk seluruh anggota tim atau klien.</li>
                    </ul>
                  </div>
                </form>
              </div>

              <!-- ========================================================
                   TAB 2: LOGIN AKUN TIM & KARYAWAN
                   ======================================================== -->
              <div v-else-if="activeTab === 'team_login'">
                <!-- Google Quick Sign In -->
                <div class="mb-4">
                  <button 
                    type="button" 
                    @click="handleGoogleLogin" 
                    :disabled="isLoading" 
                    class="btn btn-light border w-100 py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-xs hover-scale"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Masuk Cepat dengan Akun Google</span>
                  </button>

                  <div class="position-relative my-4 text-center">
                    <hr class="border-secondary-subtle">
                    <span class="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">atau dengan email / username akun tim</span>
                  </div>
                </div>

                <form @submit.prevent="handleEmailLogin">
                  <div class="mb-3">
                    <label class="form-label fw-bold small text-dark">Email atau Username Akun <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0"><i class="bi bi-envelope text-muted"></i></span>
                      <input 
                        type="text" 
                        v-model.trim="loginForm.email" 
                        class="form-control border-start-0" 
                        placeholder="nama@kafeinarts.com atau username" 
                        required 
                        autocomplete="username"
                      />
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="form-label fw-bold small text-dark">Kata Sandi <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0"><i class="bi bi-key text-muted"></i></span>
                      <input 
                        :type="showPassword ? 'text' : 'password'" 
                        v-model="loginForm.password" 
                        class="form-control border-start-0 border-end-0" 
                        placeholder="Masukkan kata sandi" 
                        required 
                        autocomplete="current-password"
                      />
                      <button type="button" class="btn btn-outline-secondary border-start-0" @click="showPassword = !showPassword">
                        <i :class="showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    class="btn btn-primary w-100 py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-xs mb-3"
                    :disabled="isLoading"
                  >
                    <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
                    <i v-else class="bi bi-box-arrow-in-right"></i>
                    <span>{{ isLoading ? 'Sedang Masuk...' : 'Masuk ke Akun Tim' }}</span>
                  </button>

                  <div class="position-relative my-3 text-center">
                    <hr class="text-muted opacity-25" />
                    <span class="position-absolute top-50 start-50 translate-middle px-3 bg-white text-muted small">atau masuk dengan</span>
                  </div>

                  <button 
                    type="button" 
                    @click="handleGoogleLogin" 
                    class="btn btn-outline-secondary w-100 py-2.5 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-xs mb-3"
                    :disabled="isLoading"
                  >
                    <svg class="me-1" width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Masuk Cepat dengan Google</span>
                  </button>

                  <div class="text-center mt-3 pt-2 border-top">
                    <span class="text-muted small">Belum memiliki akun tim? </span>
                    <router-link to="/register" class="fw-bold text-primary text-decoration-none small">
                      Daftar Akun Baru Sekarang <i class="bi bi-arrow-right"></i>
                    </router-link>
                  </div>
                </form>
              </div>

              <!-- ========================================================
                   TAB 3: DAFTAR AKUN BARU (REGISTER)
                   ======================================================== -->
              <div v-else-if="activeTab === 'register'">
                <form @submit.prevent="handleRegister">
                  <div class="mb-3">
                    <label class="form-label fw-bold small text-dark">Nama Lengkap / Panggilan <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0"><i class="bi bi-person text-muted"></i></span>
                      <input 
                        type="text" 
                        v-model.trim="registerForm.name" 
                        class="form-control border-start-0" 
                        placeholder="Contoh: Rian Designer" 
                        required 
                      />
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label fw-bold small text-dark">Alamat Email <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0"><i class="bi bi-envelope text-muted"></i></span>
                      <input 
                        type="email" 
                        v-model.trim="registerForm.email" 
                        class="form-control border-start-0" 
                        placeholder="contoh@kafeinarts.com" 
                        required 
                      />
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label fw-bold small text-dark">Kata Sandi (Minimal 6 karakter) <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0"><i class="bi bi-key text-muted"></i></span>
                      <input 
                        :type="showPassword ? 'text' : 'password'" 
                        v-model="registerForm.password" 
                        class="form-control border-start-0 border-end-0" 
                        placeholder="Buat kata sandi aman" 
                        minlength="6"
                        required 
                      />
                      <button type="button" class="btn btn-outline-secondary border-start-0" @click="showPassword = !showPassword">
                        <i :class="showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                      </button>
                    </div>
                  </div>

                  <div class="row g-2 mb-4">
                    <div class="col-sm-6">
                      <label class="form-label fw-bold small text-dark">Pilih Role Akun <span class="text-danger">*</span></label>
                      <select v-model="registerForm.role" class="form-select">
                        <option v-for="r in availableRoles" :key="r.id" :value="r.id">
                          {{ r.label }}
                        </option>
                      </select>
                    </div>
                    <div class="col-sm-6">
                      <label class="form-label fw-bold small text-dark">Departemen / Divisi</label>
                      <input 
                        type="text" 
                        v-model.trim="registerForm.department" 
                        class="form-control" 
                        placeholder="Contoh: Kreatif & Desain" 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    class="btn btn-success w-100 py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-xs"
                    :disabled="isLoading"
                  >
                    <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
                    <i v-else class="bi bi-person-plus-fill"></i>
                    <span>{{ isLoading ? 'Mendaftarkan Akun...' : 'Daftar Akun Baru' }}</span>
                  </button>
                </form>
              </div>

            </div>

            <!-- CARD FOOTER: FAST DEMO GUIDE & WORKSPACE INFO -->
            <div class="card-footer bg-light p-3 border-top d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2 text-center text-sm-start">
              <div class="small text-muted">
                <i class="bi bi-info-circle me-1 text-primary"></i>
                Host Utama: <code>arif_kafeinarts</code> | Sandi: <code>admin123</code>
              </div>
              <button @click="fillHostCredentials" class="btn btn-sm btn-outline-dark fw-bold rounded-pill px-3 py-1">
                <i class="bi bi-lightning-charge-fill text-warning me-1"></i>Tes Host Cepat
              </button>
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
  loginWithGoogle,
  registerWithRole,
  logoutUser
} from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter();
    const activeTab = ref('host_gate');
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

    // Registration Form
    const registerForm = ref({
      name: '',
      email: '',
      password: '',
      role: 'member',
      department: 'Teknologi & Desain'
    });

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

    const handleGoogleLogin = async () => {
      isLoading.value = true;
      alertMessage.value = '';
      try {
        const { profile, user } = await loginWithGoogle();
        currentUser.value = profile || user;
        alertSuccess.value = true;
        alertMessage.value = 'Berhasil masuk dengan Google! Mengarahkan ke Dashboard...';
        setTimeout(() => {
          router.push('/home');
        }, 200);
      } catch (err) {
        alertSuccess.value = false;
        alertMessage.value = err.message || 'Gagal masuk dengan Google.';
      } finally {
        isLoading.value = false;
      }
    };

    const handleRegister = async () => {
      isLoading.value = true;
      alertMessage.value = '';
      try {
        const { profile, user } = await registerWithRole(
          registerForm.value.email,
          registerForm.value.password,
          registerForm.value.name,
          registerForm.value.role,
          registerForm.value.department
        );
        currentUser.value = profile || user;
        alertSuccess.value = true;
        alertMessage.value = `Akun berhasil didaftarkan dengan role ${profile.role}! Mengarahkan ke Dashboard...`;
        setTimeout(() => {
          router.push('/home');
        }, 200);
      } catch (err) {
        alertSuccess.value = false;
        alertMessage.value = err.message || 'Gagal mendaftarkan akun baru.';
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
      alertMessage,
      alertSuccess,
      currentUser,
      isHostUser,
      userRoleLabel,
      availableRoles,
      hostForm,
      loginForm,
      registerForm,
      fillHostCredentials,
      goToDashboard,
      handleHostLogin,
      handleEmailLogin,
      handleGoogleLogin,
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

.auth-card {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05) !important;
}

.nav-tabs .nav-link {
  color: #64748b;
  background-color: #f8fafc;
  border-bottom: 2px solid transparent !important;
  transition: all 0.2s ease;
}

.nav-tabs .nav-link.active {
  background-color: #ffffff;
  border-bottom: 2px solid #2563eb !important;
}

.hover-scale {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-scale:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}
</style>
