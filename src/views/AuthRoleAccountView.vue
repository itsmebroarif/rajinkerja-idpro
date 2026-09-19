<template>
  <div class="auth-role-account-view container-fluid py-4 px-md-5">
    <!-- Top Header Banner -->
    <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1 fw-bold">
            <i class="bi bi-shield-lock-fill me-1"></i>Firebase Auth & Roles
          </span>
          <span v-if="currentUser" class="badge rounded-pill" :class="userRoleBadgeClass">
            <i class="bi bi-person-badge-fill me-1"></i>Role: {{ userRoleLabel }}
          </span>
          <span v-else class="badge bg-secondary-subtle text-secondary rounded-pill px-2.5 py-1">
            Belum Masuk (Mode Tamu)
          </span>
        </div>
        <h3 class="fw-black text-dark mb-1 d-flex align-items-center gap-2">
          Akun, Penentuan Role & Sinkronisasi Cloud
        </h3>
        <p class="text-muted small mb-0">
          Sistem autentikasi resmi Firebase (Login/Register), penentuan Role Akun pengguna, penyimpanan data cloud terintegrasi, dan sinkronisasi Google Drive.
        </p>
      </div>

      <!-- Quick Action Buttons -->
      <div class="d-flex align-items-center gap-2">
        <router-link to="/drive-vault" class="btn btn-outline-success rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1.5 shadow-xs">
          <i class="bi bi-google text-success"></i>
          <span>Drive Upload Vault</span>
        </router-link>
        <button v-if="currentUser" @click="handleLogout" class="btn btn-outline-danger rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1.5 shadow-xs">
          <i class="bi bi-box-arrow-right"></i>
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </div>

    <!-- Alert / Toast Messages -->
    <div v-if="alertMessage" class="alert alert-dismissible fade show rounded-3 shadow-xs mb-4" :class="alertSuccess ? 'alert-success border-success-subtle' : 'alert-danger border-danger-subtle'" role="alert">
      <div class="d-flex align-items-center gap-2">
        <i :class="alertSuccess ? 'bi bi-check-circle-fill text-success fs-5' : 'bi bi-exclamation-triangle-fill text-danger fs-5'"></i>
        <div>{{ alertMessage }}</div>
      </div>
      <button type="button" class="btn-close" @click="alertMessage = ''"></button>
    </div>

    <!-- NOT LOGGED IN: LOGIN & REGISTER TABS -->
    <div v-if="!currentUser" class="row justify-content-center py-2">
      <div class="col-12 col-md-8 col-lg-6 col-xl-5">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden auth-card">
          <!-- Card Header Navigation -->
          <div class="card-header bg-white border-bottom p-0">
            <ul class="nav nav-tabs nav-fill border-0 fw-bold auth-tab-nav">
              <li class="nav-item">
                <a 
                  class="nav-link py-3 border-0 rounded-0" 
                  :class="{ active: authTab === 'login' }" 
                  href="#" 
                  @click.prevent="authTab = 'login'"
                >
                  <i class="bi bi-box-arrow-in-right me-1.5 text-primary"></i>Masuk (Login)
                </a>
              </li>
              <li class="nav-item">
                <a 
                  class="nav-link py-3 border-0 rounded-0" 
                  :class="{ active: authTab === 'register' }" 
                  href="#" 
                  @click.prevent="authTab = 'register'"
                >
                  <i class="bi bi-person-plus-fill me-1.5 text-success"></i>Daftar Akun Baru (Register)
                </a>
              </li>
            </ul>
          </div>

          <div class="card-body p-4 p-md-5">
            <!-- Google Login Quick Option -->
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
                <span class="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">atau dengan email</span>
              </div>
            </div>

            <!-- LOGIN FORM -->
            <form v-if="authTab === 'login'" @submit.prevent="handleEmailLogin">
              <div class="mb-3">
                <label class="form-label fw-bold small text-dark">Alamat Email <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0"><i class="bi bi-envelope text-muted"></i></span>
                  <input 
                    type="email" 
                    v-model.trim="loginForm.email" 
                    class="form-control border-start-0" 
                    placeholder="nama@perusahaan.com" 
                    required 
                    autocomplete="email"
                  />
                </div>
              </div>

              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <label class="form-label fw-bold small text-dark mb-0">Password <span class="text-danger">*</span></label>
                  <a href="#" @click.prevent="alertMessage = 'Silakan hubungi administrator sistem untuk mereset kata sandi.'; alertSuccess = true;" class="small text-decoration-none text-muted">Lupa password?</a>
                </div>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0"><i class="bi bi-key text-muted"></i></span>
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    v-model="loginForm.password" 
                    class="form-control border-start-0 border-end-0" 
                    placeholder="Minimal 6 karakter" 
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
                class="btn btn-primary w-100 py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
                <i v-else class="bi bi-box-arrow-in-right"></i>
                <span>{{ isLoading ? 'Sedang Masuk...' : 'Masuk ke Akun' }}</span>
              </button>
            </form>

            <!-- REGISTER FORM (DENGAN PENENTUAN ROLE AKUN) -->
            <form v-else @submit.prevent="handleRegister">
              <div class="mb-3">
                <label class="form-label fw-bold small text-dark">Nama Lengkap / Panggilan <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0"><i class="bi bi-person text-muted"></i></span>
                  <input 
                    type="text" 
                    v-model.trim="registerForm.name" 
                    class="form-control border-start-0" 
                    placeholder="Contoh: Arif Permana" 
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
                    placeholder="nama@perusahaan.com" 
                    required 
                    autocomplete="email"
                  />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold small text-dark">Kata Sandi (Password) <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0"><i class="bi bi-lock text-muted"></i></span>
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    v-model="registerForm.password" 
                    class="form-control border-start-0 border-end-0" 
                    placeholder="Minimal 6 karakter" 
                    minlength="6"
                    required 
                    autocomplete="new-password"
                  />
                  <button type="button" class="btn btn-outline-secondary border-start-0" @click="showPassword = !showPassword">
                    <i :class="showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                  </button>
                </div>
              </div>

              <!-- PENENTUAN ROLE AKUN -->
              <div class="mb-3">
                <label class="form-label fw-bold small text-dark d-flex align-items-center justify-content-between">
                  <span>Penentuan Role Akun <span class="text-danger">*</span></span>
                  <span class="badge bg-light text-dark border px-2 py-0.5" style="font-size: 11px;">RBAC Security</span>
                </label>
                <select v-model="registerForm.role" class="form-select border-2" required>
                  <option v-for="r in availableRoles" :key="r.id" :value="r.id">
                    {{ r.label }} — {{ r.desc }}
                  </option>
                </select>
                <div class="form-text small">Role menentukan tingkat hak akses modul (Admin, Manager, Member, Freelancer, atau Klien).</div>
              </div>

              <div class="mb-4">
                <label class="form-label fw-bold small text-dark">Departemen / Divisi</label>
                <input 
                  type="text" 
                  v-model.trim="registerForm.department" 
                  class="form-control" 
                  placeholder="Contoh: Teknologi & Desain / Keuangan / Operasional" 
                />
              </div>

              <button 
                type="submit" 
                class="btn btn-success w-100 py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
                <i v-else class="bi bi-person-check-fill"></i>
                <span>{{ isLoading ? 'Mendaftarkan Akun...' : 'Daftar Akun & Tetapkan Role' }}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- LOGGED IN USER PROFILE & ROLE MANAGEMENT DASHBOARD -->
    <div v-else class="row g-4">
      <!-- Left Column: User Profile Card & Role Switcher -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
          <div class="text-center pb-3 border-bottom mb-3">
            <div class="avatar-large mx-auto mb-3 shadow-sm bg-primary text-white d-flex align-items-center justify-content-center rounded-circle fs-2 fw-black" style="width: 80px; height: 80px;">
              <span v-if="!userProfile?.photoURL">{{ (userProfile?.displayName || currentUser.email || 'U')[0].toUpperCase() }}</span>
              <img v-else :src="userProfile.photoURL" class="w-100 h-100 rounded-circle object-fit-cover" alt="Avatar" />
            </div>
            <h5 class="fw-bold text-dark mb-1">{{ userProfile?.displayName || 'Pengguna TaskArts' }}</h5>
            <div class="text-muted small mb-2">{{ currentUser.email }}</div>
            <span class="badge rounded-pill px-3 py-1.5 fw-bold" :class="userRoleBadgeClass">
              <i class="bi bi-shield-check me-1"></i>Role: {{ userRoleLabel }}
            </span>
          </div>

          <div class="small mb-3">
            <div class="d-flex justify-content-between py-1.5 border-bottom">
              <span class="text-muted">User ID:</span>
              <span class="font-monospace text-truncate text-end" style="max-width: 170px;" :title="currentUser.uid">{{ currentUser.uid }}</span>
            </div>
            <div class="d-flex justify-content-between py-1.5 border-bottom">
              <span class="text-muted">Departemen:</span>
              <span class="fw-semibold text-dark">{{ userProfile?.department || 'Umum' }}</span>
            </div>
            <div class="d-flex justify-content-between py-1.5 border-bottom">
              <span class="text-muted">Status Akun:</span>
              <span class="badge bg-success-subtle text-success">Aktif & Terverifikasi</span>
            </div>
            <div class="d-flex justify-content-between py-1.5">
              <span class="text-muted">Terdaftar:</span>
              <span class="text-muted">{{ formatDate(userProfile?.createdAt) }}</span>
            </div>
          </div>

          <!-- Ubah Role Akun Pengguna -->
          <div class="p-3 bg-light rounded-3 border mb-3">
            <label class="form-label fw-bold small text-dark mb-1 d-flex align-items-center justify-content-between">
              <span>Ubah Role Akun Anda</span>
              <i class="bi bi-sliders text-primary"></i>
            </label>
            <div class="d-flex gap-2">
              <select v-model="selectedNewRole" class="form-select form-select-sm">
                <option v-for="r in availableRoles" :key="r.id" :value="r.id">
                  {{ r.label }}
                </option>
              </select>
              <button @click="handleUpdateRole" :disabled="isUpdatingRole || selectedNewRole === userProfile?.role" class="btn btn-sm btn-primary fw-bold text-nowrap">
                <span v-if="isUpdatingRole" class="spinner-border spinner-border-sm"></span>
                <span v-else>Simpan</span>
              </button>
            </div>
            <div class="form-text small mt-1" style="font-size: 11px;">
              Ubah role untuk menguji tampilan dan kewenangan sistem RBAC.
            </div>
          </div>

          <button @click="handleLogout" class="btn btn-outline-danger w-100 rounded-3 fw-bold py-2">
            <i class="bi bi-box-arrow-right me-1.5"></i>Keluar dari Sesi Ini
          </button>
        </div>

        <!-- Google Drive Cloud Connection Status Card -->
        <div class="card border-0 shadow-sm rounded-4 p-4">
          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="p-2.5 bg-success-subtle rounded-3 text-success">
              <i class="bi bi-google fs-4"></i>
            </div>
            <div>
              <h6 class="fw-bold text-dark mb-0">Integrasi Google Drive</h6>
              <small class="text-muted">OAuth 2.0 Scope Terhubung</small>
            </div>
          </div>
          <p class="small text-muted mb-3">
            Upload file, struk, dokumen proposal, PDF invoice, dan gambar langsung ke Google Drive Anda secara aman dengan hak akses akun Anda.
          </p>
          <router-link to="/drive-vault" class="btn btn-success w-100 rounded-pill fw-bold py-2 d-flex align-items-center justify-content-center gap-2 shadow-xs">
            <i class="bi bi-cloud-arrow-up-fill"></i>
            <span>Buka Google Drive Vault & Upload</span>
          </router-link>
        </div>
      </div>

      <!-- Right Column: Firestore Data Store & Sync Manager -->
      <div class="col-lg-8">
        <!-- Cloud Store Data Synchronizer -->
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
          <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3 pb-3 border-bottom">
            <div>
              <h5 class="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                <i class="bi bi-cloud-arrow-up-fill text-primary"></i>
                Penyimpanan & Sinkronisasi Data Firestore
              </h5>
              <p class="small text-muted mb-0">Simpan atau pulihkan data modul aplikasi Anda ke database cloud Firestore terisolasi per akun.</p>
            </div>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1">
              Cloud Database: Active
            </span>
          </div>

          <div class="row g-3">
            <div class="col-md-6" v-for="syncItem in syncDataOptions" :key="syncItem.key">
              <div class="p-3 bg-light rounded-3 border h-100 d-flex flex-column justify-content-between">
                <div>
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <div class="d-flex align-items-center gap-2">
                      <i :class="syncItem.icon" class="fs-5" :style="{ color: syncItem.color }"></i>
                      <strong class="text-dark">{{ syncItem.title }}</strong>
                    </div>
                    <span class="badge bg-white text-muted border px-2 py-0.5 small">{{ syncItem.count }} data</span>
                  </div>
                  <p class="text-muted small mb-3">{{ syncItem.desc }}</p>
                </div>

                <div class="d-flex gap-2">
                  <button 
                    @click="backupStoreToFirestore(syncItem.key, syncItem.title)" 
                    :disabled="syncingKey === syncItem.key"
                    class="btn btn-sm btn-primary flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-1.5"
                  >
                    <span v-if="syncingKey === syncItem.key" class="spinner-border spinner-border-sm"></span>
                    <i v-else class="bi bi-cloud-upload"></i>
                    <span>Simpan ke Cloud</span>
                  </button>
                  <button 
                    @click="restoreStoreFromFirestore(syncItem.key, syncItem.title)" 
                    :disabled="syncingKey === syncItem.key"
                    class="btn btn-sm btn-outline-secondary fw-bold"
                    title="Muat data dari Cloud Firestore"
                  >
                    <i class="bi bi-cloud-download"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Bulk Sync All Button -->
          <div class="mt-4 pt-3 border-top d-flex flex-wrap gap-2 justify-content-between align-items-center">
            <div class="small text-muted">
              <i class="bi bi-info-circle me-1"></i>Data disimpan di koleksi Firestore <code>users/{{ currentUser.uid }}/data/</code>
            </div>
            <button @click="backupAllToCloud" :disabled="isSyncingAll" class="btn btn-primary rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 shadow-xs">
              <span v-if="isSyncingAll" class="spinner-border spinner-border-sm"></span>
              <i v-else class="bi bi-cloud-check-fill"></i>
              <span>{{ isSyncingAll ? 'Menyinkronkan Semua Data...' : 'Simpan Semua Modul ke Cloud' }}</span>
            </button>
          </div>
        </div>

        <!-- Role Permissions Matrix Info -->
        <div class="card border-0 shadow-sm rounded-4 p-4">
          <h5 class="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
            <i class="bi bi-diagram-3-fill text-indigo"></i>
            Matriks Hak Akses Berdasarkan Role Akun
          </h5>
          <p class="small text-muted mb-3">Tabel perizinan modul berdasarkan role pengguna saat ini:</p>

          <div class="table-responsive">
            <table class="table table-hover align-middle small mb-0">
              <thead class="table-light">
                <tr>
                  <th>Role Pengguna</th>
                  <th>Tugas & Proyek</th>
                  <th>Keuangan & RAB</th>
                  <th>Google Drive Upload</th>
                  <th>Admin & RBAC</th>
                </tr>
              </thead>
              <tbody>
                <tr :class="{ 'table-primary fw-bold': userProfile?.role === 'admin' }">
                  <td>
                    <span class="badge bg-danger text-white">Administrator</span>
                  </td>
                  <td><i class="bi bi-check-circle-fill text-success"></i> Akses Penuh</td>
                  <td><i class="bi bi-check-circle-fill text-success"></i> Akses Penuh & Laporan</td>
                  <td><i class="bi bi-check-circle-fill text-success"></i> Tanpa Batas</td>
                  <td><i class="bi bi-check-circle-fill text-success"></i> Kelola Role Semua User</td>
                </tr>
                <tr :class="{ 'table-primary fw-bold': userProfile?.role === 'manager' }">
                  <td>
                    <span class="badge bg-warning text-dark">Manager</span>
                  </td>
                  <td><i class="bi bi-check-circle-fill text-success"></i> Kelola & Delegasi</td>
                  <td><i class="bi bi-check-circle-fill text-success"></i> Input, Approve & Monitor</td>
                  <td><i class="bi bi-check-circle-fill text-success"></i> Dokumen Tim</td>
                  <td><i class="bi bi-dash text-muted"></i> Hanya Tim Sendiri</td>
                </tr>
                <tr :class="{ 'table-primary fw-bold': userProfile?.role === 'member' }">
                  <td>
                    <span class="badge bg-primary text-white">Team Member</span>
                  </td>
                  <td><i class="bi bi-check-circle-fill text-success"></i> Tugas Ditugaskan</td>
                  <td><i class="bi bi-check-circle-fill text-success"></i> Klaim Pengeluaran</td>
                  <td><i class="bi bi-check-circle-fill text-success"></i> File Lampiran</td>
                  <td><i class="bi bi-x text-muted"></i> Tidak Ada</td>
                </tr>
                <tr :class="{ 'table-primary fw-bold': userProfile?.role === 'freelancer' }">
                  <td>
                    <span class="badge bg-info text-dark">Freelancer</span>
                  </td>
                  <td><i class="bi bi-check-circle-fill text-success"></i> Proyek Pribadi & CV</td>
                  <td><i class="bi bi-check-circle-fill text-success"></i> Tagihan Invoice Klien</td>
                  <td><i class="bi bi-check-circle-fill text-success"></i> Portofolio & Aset</td>
                  <td><i class="bi bi-x text-muted"></i> Tidak Ada</td>
                </tr>
                <tr :class="{ 'table-primary fw-bold': userProfile?.role === 'client' }">
                  <td>
                    <span class="badge bg-secondary text-white">Klien</span>
                  </td>
                  <td><i class="bi bi-eye-fill text-primary"></i> Hanya Tinjau Progres</td>
                  <td><i class="bi bi-eye-fill text-primary"></i> Hanya Lihat Invoice</td>
                  <td><i class="bi bi-eye-fill text-primary"></i> Unduh Berkas Hasil</td>
                  <td><i class="bi bi-x text-muted"></i> Tidak Ada</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { 
  auth, 
  USER_ROLES, 
  registerWithRole, 
  loginWithEmail, 
  loginWithGoogle, 
  logoutUser, 
  updateUserRole,
  saveUserDataStore,
  loadUserDataStore,
  syncUserProfile 
} from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default {
  name: 'AuthRoleAccountView',
  setup() {
    const store = useStore();
    const currentUser = ref(auth.currentUser);
    const userProfile = ref(null);
    const authTab = ref('login');
    const isLoading = ref(false);
    const showPassword = ref(false);
    const alertMessage = ref('');
    const alertSuccess = ref(true);
    const availableRoles = USER_ROLES;

    const selectedNewRole = ref('member');
    const isUpdatingRole = ref(false);
    const syncingKey = ref('');
    const isSyncingAll = ref(false);

    // Form states
    const loginForm = ref({
      email: '',
      password: ''
    });

    const registerForm = ref({
      name: '',
      email: '',
      password: '',
      role: 'member',
      department: 'Teknologi'
    });

    const userRoleLabel = computed(() => {
      const r = availableRoles.find(x => x.id === (userProfile.value?.role || 'member'));
      return r ? r.label : 'Member';
    });

    const userRoleBadgeClass = computed(() => {
      const r = availableRoles.find(x => x.id === (userProfile.value?.role || 'member'));
      return r ? r.badgeClass : 'bg-primary text-white';
    });

    const syncDataOptions = computed(() => [
      { key: 'tasks', title: 'Tugas & To-Do List', icon: 'bi-check2-square', color: '#2563eb', desc: 'Daftar semua tugas Kanban, Eisenhower, dan deadline.', count: store.state.tasks?.length || 0 },
      { key: 'projects', title: 'Proyek Klien', icon: 'bi-kanban', color: '#8b5cf6', desc: 'Detail kontrak proyek klien dan progres kerja.', count: store.state.projects?.length || 0 },
      { key: 'finance', title: 'Transaksi Keuangan & Kas', icon: 'bi-wallet2', color: '#10b981', desc: 'Pencatatan uang masuk dan keluar.', count: store.state.transactions?.length || 0 },
      { key: 'invoices', title: 'Tagihan & Faktur Invoice', icon: 'bi-receipt', color: '#f59e0b', desc: 'Daftar invoice, penerima, dan nominal.', count: store.state.invoices?.length || 0 },
      { key: 'contacts', title: 'Buku Kontak & Klien', icon: 'bi-person-lines-fill', color: '#06b6d4', desc: 'Daftar klien, vendor, dan kontak WhatsApp.', count: store.state.contacts?.length || 0 },
      { key: 'rabItems', title: 'Rencana Anggaran Biaya (RAB)', icon: 'bi-calculator-fill', color: '#ec4899', desc: 'Pos anggaran, realisasi, dan selisih pengeluaran.', count: store.state.rabItems?.length || 0 }
    ]);

    const formatDate = (dateStr) => {
      if (!dateStr) return '-';
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
      } catch {
        return dateStr;
      }
    };

    onMounted(() => {
      onAuthStateChanged(auth, async (user) => {
        currentUser.value = user;
        if (user) {
          try {
            const profile = await syncUserProfile(user);
            userProfile.value = profile;
            selectedNewRole.value = profile.role || 'member';
          } catch (e) {
            console.error('Error fetching user profile:', e);
          }
        } else {
          userProfile.value = null;
        }
      });
    });

    const handleEmailLogin = async () => {
      isLoading.value = true;
      alertMessage.value = '';
      try {
        const { user, profile } = await loginWithEmail(loginForm.value.email, loginForm.value.password);
        currentUser.value = user;
        userProfile.value = profile;
        alertSuccess.value = true;
        alertMessage.value = `Berhasil masuk sebagai ${profile.displayName || user.email} (Role: ${profile.role})!`;
      } catch (err) {
        alertSuccess.value = false;
        alertMessage.value = `Gagal masuk: ${err.message}`;
      } finally {
        isLoading.value = false;
      }
    };

    const handleGoogleLogin = async () => {
      isLoading.value = true;
      alertMessage.value = '';
      try {
        const { user, profile } = await loginWithGoogle();
        currentUser.value = user;
        userProfile.value = profile;
        alertSuccess.value = true;
        alertMessage.value = `Berhasil masuk dengan Google sebagai ${profile.displayName || user.email}!`;
      } catch (err) {
        alertSuccess.value = false;
        alertMessage.value = `Gagal masuk dengan Google: ${err.message}`;
      } finally {
        isLoading.value = false;
      }
    };

    const handleRegister = async () => {
      isLoading.value = true;
      alertMessage.value = '';
      try {
        const { user, profile } = await registerWithRole(
          registerForm.value.email,
          registerForm.value.password,
          registerForm.value.name,
          registerForm.value.role,
          registerForm.value.department
        );
        currentUser.value = user;
        userProfile.value = profile;
        alertSuccess.value = true;
        alertMessage.value = `Pendaftaran berhasil! Akun Anda aktif dengan role: ${profile.role}.`;
      } catch (err) {
        alertSuccess.value = false;
        alertMessage.value = `Pendaftaran gagal: ${err.message}`;
      } finally {
        isLoading.value = false;
      }
    };

    const handleLogout = async () => {
      try {
        await logoutUser();
        currentUser.value = null;
        userProfile.value = null;
        alertSuccess.value = true;
        alertMessage.value = 'Anda telah keluar dari akun.';
      } catch (err) {
        alertSuccess.value = false;
        alertMessage.value = err.message;
      }
    };

    const handleUpdateRole = async () => {
      if (!currentUser.value) return;
      isUpdatingRole.value = true;
      try {
        await updateUserRole(currentUser.value.uid, selectedNewRole.value);
        if (userProfile.value) {
          userProfile.value.role = selectedNewRole.value;
        }
        alertSuccess.value = true;
        alertMessage.value = `Role akun berhasil diubah menjadi "${selectedNewRole.value}"!`;
      } catch (err) {
        alertSuccess.value = false;
        alertMessage.value = `Gagal memperbarui role: ${err.message}`;
      } finally {
        isUpdatingRole.value = false;
      }
    };

    const backupStoreToFirestore = async (key, title) => {
      if (!currentUser.value) return;
      syncingKey.value = key;
      try {
        const payload = store.state[key] || [];
        await saveUserDataStore(currentUser.value.uid, key, payload);
        alertSuccess.value = true;
        alertMessage.value = `Berhasil menyimpan data ${title} (${payload.length} item) ke Cloud Firestore!`;
      } catch (err) {
        alertSuccess.value = false;
        alertMessage.value = `Gagal sinkronisasi ${title}: ${err.message}`;
      } finally {
        syncingKey.value = '';
      }
    };

    const restoreStoreFromFirestore = async (key, title) => {
      if (!currentUser.value) return;
      syncingKey.value = key;
      try {
        const cloudData = await loadUserDataStore(currentUser.value.uid, key);
        if (cloudData && Array.isArray(cloudData)) {
          // Commit to Vuex
          store.commit(`set_${key}`, cloudData);
          alertSuccess.value = true;
          alertMessage.value = `Berhasil memuat ${cloudData.length} item ${title} dari Cloud Firestore!`;
        } else {
          alertSuccess.value = false;
          alertMessage.value = `Tidak ada cadangan cloud untuk ${title} pada akun ini.`;
        }
      } catch (err) {
        alertSuccess.value = false;
        alertMessage.value = `Gagal memuat ${title}: ${err.message}`;
      } finally {
        syncingKey.value = '';
      }
    };

    const backupAllToCloud = async () => {
      if (!currentUser.value) return;
      isSyncingAll.value = true;
      try {
        for (const item of syncDataOptions.value) {
          const payload = store.state[item.key] || [];
          await saveUserDataStore(currentUser.value.uid, item.key, payload);
        }
        alertSuccess.value = true;
        alertMessage.value = 'Semua data modul (Tugas, Proyek, Kas, Invoice, Kontak, RAB) berhasil disimpan ke Cloud Firestore!';
      } catch (err) {
        alertSuccess.value = false;
        alertMessage.value = `Gagal mencadangkan semua data: ${err.message}`;
      } finally {
        isSyncingAll.value = false;
      }
    };

    return {
      currentUser,
      userProfile,
      authTab,
      isLoading,
      showPassword,
      alertMessage,
      alertSuccess,
      availableRoles,
      selectedNewRole,
      isUpdatingRole,
      syncingKey,
      isSyncingAll,
      loginForm,
      registerForm,
      userRoleLabel,
      userRoleBadgeClass,
      syncDataOptions,
      formatDate,
      handleEmailLogin,
      handleGoogleLogin,
      handleRegister,
      handleLogout,
      handleUpdateRole,
      backupStoreToFirestore,
      restoreStoreFromFirestore,
      backupAllToCloud
    };
  }
};
</script>

<style scoped>
.auth-card {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}
.auth-tab-nav .nav-link {
  color: #64748b;
  font-size: 14px;
  background-color: #f8fafc;
  border-bottom: 2px solid transparent !important;
  transition: all 0.2s ease;
}
.auth-tab-nav .nav-link.active {
  color: #0f172a;
  background-color: #ffffff;
  border-bottom: 2px solid var(--primary-color, #2563eb) !important;
}
.hover-scale {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-scale:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>
