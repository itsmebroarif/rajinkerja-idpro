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
      <div class="col-12 col-md-9 col-lg-7 col-xl-6">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden auth-card">
          <!-- Card Header Navigation -->
          <div class="card-header bg-white border-bottom p-0">
            <ul class="nav nav-tabs nav-fill border-0 fw-bold auth-tab-nav">
              <li class="nav-item">
                <a 
                  class="nav-link py-3 border-0 rounded-0 d-flex align-items-center justify-content-center gap-1.5" 
                  :class="{ active: authTab === 'host_gate' }" 
                  href="#" 
                  @click.prevent="authTab = 'host_gate'"
                >
                  <i class="bi bi-crown-fill text-warning"></i>
                  <span>👑 Gerbang Host Project</span>
                </a>
              </li>
              <li class="nav-item">
                <a 
                  class="nav-link py-3 border-0 rounded-0 d-flex align-items-center justify-content-center gap-1.5" 
                  :class="{ active: authTab === 'login' }" 
                  href="#" 
                  @click.prevent="authTab = 'login'"
                >
                  <i class="bi bi-box-arrow-in-right text-primary"></i>
                  <span>Masuk Akun Tim</span>
                </a>
              </li>
              <li class="nav-item">
                <a 
                  class="nav-link py-3 border-0 rounded-0 d-flex align-items-center justify-content-center gap-1.5" 
                  :class="{ active: authTab === 'register' }" 
                  href="#" 
                  @click.prevent="authTab = 'register'"
                >
                  <i class="bi bi-person-plus-fill text-success"></i>
                  <span>Daftar Baru</span>
                </a>
              </li>
            </ul>
          </div>

          <div class="card-body p-4 p-md-5">
            <!-- TAB 1: GERBANG UTAMA HOST PROJECT (arif_kafeinarts | admin123) -->
            <div v-if="authTab === 'host_gate'" class="mb-2">
              <div class="p-3 bg-dark text-white rounded-4 mb-4 border border-warning-subtle shadow-xs">
                <div class="d-flex align-items-center gap-3">
                  <div class="bg-warning text-dark rounded-circle p-2.5 d-flex align-items-center justify-content-center fs-4 fw-black flex-shrink-0" style="width: 48px; height: 48px;">
                    <i class="bi bi-crown-fill"></i>
                  </div>
                  <div>
                    <div class="d-flex align-items-center gap-2">
                      <h6 class="fw-black text-warning mb-0">Gerbang Otoritas Host Project</h6>
                      <span class="badge bg-warning text-dark fw-bold" style="font-size: 10px;">Super Master</span>
                    </div>
                    <small class="text-white-50 d-block mt-0.5">
                      Kredensial khusus: <code>arif_kafeinarts</code> | <code>admin123</code>. Memiliki <strong>seluruh akses 100%</strong> dan wewenang penuh <strong>membuatkan akun</strong> bagi anggota tim.
                    </small>
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
                  <span>{{ isLoading ? 'Memverifikasi Host...' : 'Buka Gerbang & Masuk sebagai Host Project' }}</span>
                </button>

                <div class="p-3 bg-light rounded-3 border small">
                  <div class="fw-bold text-dark mb-1"><i class="bi bi-stars text-warning me-1"></i>Hak Akses Host Project:</div>
                  <ul class="list-unstyled mb-0 text-muted ps-1">
                    <li class="mb-1"><i class="bi bi-check2-circle text-success me-1"></i><strong>Seluruh Akses:</strong> Akses 100% penuh ke Keuangan, RAB, Invoice, Tugas & Drive.</li>
                    <li><i class="bi bi-check2-circle text-success me-1"></i><strong>Pembuat Akun:</strong> Bisa membuatkan akun dan mengatur role untuk seluruh anggota tim atau klien.</li>
                  </ul>
                </div>
              </form>
            </div>

            <!-- TAB 2: MASUK AKUN REGULER / TIM -->
            <div v-else-if="authTab === 'login'">
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
                  <span class="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">atau dengan email / username akun buatan host</span>
                </div>
              </div>

              <!-- LOGIN FORM -->
              <form @submit.prevent="handleEmailLogin">
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
            </div>

            <!-- TAB 3: REGISTER FORM MANDIRI (DENGAN PENENTUAN ROLE AKUN) -->
            <form v-else-if="authTab === 'register'" @submit.prevent="handleRegister">
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
      <!-- Top Host Notification Banner if Host -->
      <div v-if="isHostUser" class="col-12">
        <div class="p-3 bg-dark text-white rounded-4 border border-warning shadow-sm d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
          <div class="d-flex align-items-center gap-3">
            <div class="bg-warning text-dark rounded-circle p-2.5 d-flex align-items-center justify-content-center fs-3 fw-black flex-shrink-0" style="width: 52px; height: 52px;">
              <i class="bi bi-crown-fill"></i>
            </div>
            <div>
              <div class="d-flex align-items-center gap-2">
                <h5 class="fw-black text-warning mb-0">AKUN HOST PROJECT AKTIF (arif_kafeinarts)</h5>
                <span class="badge bg-warning text-dark fw-bold">Super Admin / Host</span>
              </div>
              <p class="text-white-50 small mb-0 mt-0.5">
                Anda masuk sebagai pemilik proyek. Anda memiliki <strong>seluruh akses tanpa batas</strong> ke semua modul, keuangan, data cloud, dan memiliki hak istimewa <strong>membuatkan akun</strong> pengguna baru di bawah ini.
              </p>
            </div>
          </div>
          <button @click="showAccountCreateForm = !showAccountCreateForm" class="btn btn-warning text-dark fw-black rounded-pill px-3.5 py-2 d-flex align-items-center gap-1.5 shadow-xs flex-shrink-0">
            <i :class="showAccountCreateForm ? 'bi bi-dash-circle-fill' : 'bi bi-person-plus-fill'"></i>
            <span>{{ showAccountCreateForm ? 'Tutup Form Akun' : '+ Buatkan Akun Baru' }}</span>
          </button>
        </div>
      </div>

      <!-- Left Column: User Profile Card & Role Switcher -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4" :class="{ 'border-top border-4 border-warning': isHostUser }">
          <div class="text-center pb-3 border-bottom mb-3">
            <div 
              class="avatar-large mx-auto mb-3 shadow-sm d-flex align-items-center justify-content-center rounded-circle fs-2 fw-black" 
              :class="isHostUser ? 'bg-dark text-warning border border-2 border-warning' : 'bg-primary text-white'"
              style="width: 80px; height: 80px;"
            >
              <i v-if="isHostUser" class="bi bi-crown-fill fs-1 text-warning"></i>
              <span v-else-if="!userProfile?.photoURL">{{ (userProfile?.displayName || currentUser.email || 'U')[0].toUpperCase() }}</span>
              <img v-else :src="userProfile.photoURL" class="w-100 h-100 rounded-circle object-fit-cover" alt="Avatar" />
            </div>
            <h5 class="fw-bold text-dark mb-1">{{ userProfile?.displayName || (isHostUser ? 'Arif Kafeinarts (Host Project)' : 'Pengguna TaskArts') }}</h5>
            <div class="text-muted small mb-2">{{ currentUser.email || 'arif_kafeinarts@kafeinarts.com' }}</div>
            <span class="badge rounded-pill px-3 py-1.5 fw-bold" :class="isHostUser ? 'bg-dark text-warning border border-warning' : userRoleBadgeClass">
              <i :class="isHostUser ? 'bi bi-crown-fill me-1' : 'bi bi-shield-check me-1'"></i>Role: {{ isHostUser ? 'Host Project (Super Admin)' : userRoleLabel }}
            </span>
          </div>

          <div class="small mb-3">
            <div class="d-flex justify-content-between py-1.5 border-bottom">
              <span class="text-muted">User ID:</span>
              <span class="font-monospace text-truncate text-end" style="max-width: 170px;" :title="currentUser.uid">{{ currentUser.uid }}</span>
            </div>
            <div class="d-flex justify-content-between py-1.5 border-bottom">
              <span class="text-muted">Departemen:</span>
              <span class="fw-semibold text-dark">{{ isHostUser ? 'Host & Workspace Owner' : (userProfile?.department || 'Umum') }}</span>
            </div>
            <div class="d-flex justify-content-between py-1.5 border-bottom">
              <span class="text-muted">Status Akun:</span>
              <span class="badge" :class="isHostUser ? 'bg-warning text-dark fw-bold' : 'bg-success-subtle text-success'">
                {{ isHostUser ? '👑 Host Project (Akses Penuh)' : 'Aktif & Terverifikasi' }}
              </span>
            </div>
            <div class="d-flex justify-content-between py-1.5">
              <span class="text-muted">Terdaftar:</span>
              <span class="text-muted">{{ formatDate(userProfile?.createdAt) }}</span>
            </div>
          </div>

          <!-- Hak Istimewa Host Project Highlight Box -->
          <div v-if="isHostUser" class="p-3 bg-dark text-white rounded-3 mb-3 border border-warning-subtle small">
            <div class="fw-bold text-warning mb-1.5"><i class="bi bi-shield-fill-check me-1"></i>Hak Akses Host Project:</div>
            <div class="text-white-50 mb-1"><i class="bi bi-check-circle-fill text-success me-1"></i>Akses 100% Seluruh Modul</div>
            <div class="text-white-50 mb-1"><i class="bi bi-check-circle-fill text-success me-1"></i>Wewenang Buat Akun Anggota Tim</div>
            <div class="text-white-50"><i class="bi bi-check-circle-fill text-success me-1"></i>Kelola Database & Google Drive Penuh</div>
          </div>

          <!-- Ubah Role Akun Pengguna -->
          <div class="p-3 bg-light rounded-3 border mb-3">
            <label class="form-label fw-bold small text-dark mb-1 d-flex align-items-center justify-content-between">
              <span>Ubah Role Akun</span>
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
              Ubah role untuk menguji perizinan sistem RBAC.
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

      <!-- Right Column: Host Account Creator & Firestore Data Store -->
      <div class="col-lg-8">
        <!-- HOST PROJECT: USER ACCOUNT CREATOR & DIRECTORY -->
        <div v-if="isHostUser" class="card border-0 shadow-sm rounded-4 p-4 mb-4 border-top border-4 border-warning">
          <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3 pb-3 border-bottom">
            <div>
              <div class="d-flex align-items-center gap-2 mb-1">
                <span class="badge bg-dark text-warning border border-warning rounded-pill px-3 py-1 fw-bold">
                  <i class="bi bi-crown-fill me-1"></i>Otoritas Host Project
                </span>
                <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1">
                  Fitur Pembuat Akun Aktif
                </span>
              </div>
              <h5 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <i class="bi bi-person-lines-fill text-primary"></i>
                Pembuat Akun & Manajemen Anggota Tim
              </h5>
              <p class="small text-muted mb-0">Sebagai Host Project, Anda dapat membuatkan akun langsung untuk anggota tim, manajer, atau klien.</p>
            </div>
            <button @click="showAccountCreateForm = !showAccountCreateForm" class="btn btn-sm btn-primary rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5 shadow-xs">
              <i :class="showAccountCreateForm ? 'bi bi-dash-circle-fill' : 'bi bi-person-plus-fill'"></i>
              <span>{{ showAccountCreateForm ? 'Sembunyikan Form' : '+ Buatkan Akun' }}</span>
            </button>
          </div>

          <!-- FORMULIR BUAT AKUN OLEH HOST -->
          <div v-if="showAccountCreateForm" class="p-3.5 bg-light rounded-4 border mb-4">
            <h6 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <i class="bi bi-person-plus-fill text-primary"></i>
              Formulir Pendaftaran Akun Baru oleh Host
            </h6>

            <form @submit.prevent="handleCreateAccountByHost">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Nama Lengkap Pengguna <span class="text-danger">*</span></label>
                  <input type="text" v-model.trim="newAccountForm.name" class="form-control" placeholder="Contoh: Budi Pratama" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Alamat Email / Username Login <span class="text-danger">*</span></label>
                  <input type="email" v-model.trim="newAccountForm.email" class="form-control" placeholder="budi@kafeinarts.com" required />
                </div>
                <div class="col-md-6">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <label class="form-label fw-bold small text-dark mb-0">Kata Sandi Awal <span class="text-danger">*</span></label>
                    <button type="button" @click="generateRandomPassword" class="btn btn-link btn-sm p-0 text-decoration-none small text-primary">
                      <i class="bi bi-shuffle me-1"></i>Acak Sandi
                    </button>
                  </div>
                  <input type="text" v-model.trim="newAccountForm.password" class="form-control font-monospace" placeholder="Minimal 6 karakter" required minlength="6" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Tetapkan Role Akun <span class="text-danger">*</span></label>
                  <select v-model="newAccountForm.role" class="form-select" required>
                    <option v-for="r in availableRoles" :key="r.id" :value="r.id">
                      {{ r.label }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Departemen / Divisi</label>
                  <input type="text" v-model.trim="newAccountForm.department" class="form-control" placeholder="Contoh: Teknologi & Desain / Keuangan" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Catatan / Hak Akses Tambahan</label>
                  <input type="text" v-model.trim="newAccountForm.notes" class="form-control" placeholder="Contoh: Akses proyek Q3, freelancer kontrak 3 bulan" />
                </div>
              </div>

              <div class="mt-3 pt-3 border-top d-flex justify-content-end gap-2">
                <button type="button" @click="showAccountCreateForm = false" class="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1.5 fw-semibold">
                  Batal
                </button>
                <button type="submit" :disabled="isCreatingAccount" class="btn btn-sm btn-success rounded-pill px-4 py-1.5 fw-bold d-flex align-items-center gap-2 shadow-xs">
                  <span v-if="isCreatingAccount" class="spinner-border spinner-border-sm"></span>
                  <i v-else class="bi bi-check-circle-fill"></i>
                  <span>{{ isCreatingAccount ? 'Mendaftarkan Akun...' : 'Buatkan & Aktifkan Akun Ini' }}</span>
                </button>
              </div>
            </form>
          </div>

          <!-- DAFTAR AKUN YANG DIBUATKAN HOST -->
          <div class="border rounded-3 overflow-hidden">
            <div class="p-3 bg-light border-bottom d-flex align-items-center justify-content-between">
              <div class="fw-bold text-dark d-flex align-items-center gap-2">
                <i class="bi bi-people-fill text-indigo"></i>
                Daftar Akun Pengguna Terdaftar ({{ createdAccountsList.length }})
              </div>
              <small class="text-muted">Host dapat mengedit role, menyalin kredensial, atau menghapus akun.</small>
            </div>

            <div v-if="createdAccountsList.length === 0" class="p-4 text-center text-muted">
              <i class="bi bi-person-x fs-1 d-block mb-2 text-secondary opacity-50"></i>
              Belum ada akun yang dibuatkan oleh Host. Klik tombol <strong>"+ Buatkan Akun"</strong> di atas untuk membuat akun bagi anggota tim atau klien.
            </div>

            <div v-else class="table-responsive">
              <table class="table table-hover align-middle small mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Pengguna & Email</th>
                    <th>Password Awal</th>
                    <th>Role Akun</th>
                    <th>Departemen</th>
                    <th>Dibuat</th>
                    <th class="text-end">Aksi Host</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="acc in createdAccountsList" :key="acc.uid">
                    <td>
                      <div class="fw-bold text-dark">{{ acc.displayName }}</div>
                      <div class="text-muted font-monospace small">{{ acc.email }}</div>
                    </td>
                    <td>
                      <span class="font-monospace px-2 py-0.5 bg-light rounded border">{{ acc.initialPassword || '******' }}</span>
                    </td>
                    <td>
                      <select :value="acc.role" @change="handleUpdateCreatedAccountRole(acc.uid, $event.target.value)" class="form-select form-select-sm" style="max-width: 170px;">
                        <option v-for="r in availableRoles" :key="r.id" :value="r.id">{{ r.label }}</option>
                      </select>
                    </td>
                    <td>
                      <span class="badge bg-secondary-subtle text-secondary">{{ acc.department || 'Umum' }}</span>
                    </td>
                    <td>
                      <span class="text-muted">{{ formatDate(acc.createdAt) }}</span>
                    </td>
                    <td class="text-end">
                      <div class="d-flex justify-content-end gap-1.5">
                        <button @click="copyAccountCredentials(acc)" class="btn btn-sm btn-outline-primary" title="Salin Kredensial untuk Pengguna">
                          <i class="bi bi-clipboard-check"></i> Salin Info
                        </button>
                        <button @click="handleDeleteCreatedAccount(acc.uid)" class="btn btn-sm btn-outline-danger" title="Hapus Akun">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

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
  syncUserProfile,
  loginAsHostProject,
  getHostSession,
  getUserSession,
  createAccountByHost,
  getStoredCreatedAccounts,
  deleteAccountByHost,
  updateAccountRoleByHost
} from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default {
  name: 'AuthRoleAccountView',
  setup() {
    const store = useStore();
    const currentUser = ref(auth.currentUser);
    const userProfile = ref(null);
    const authTab = ref('host_gate');
    const isLoading = ref(false);
    const showPassword = ref(false);
    const alertMessage = ref('');
    const alertSuccess = ref(true);
    const availableRoles = USER_ROLES;

    const selectedNewRole = ref('member');
    const isUpdatingRole = ref(false);
    const syncingKey = ref('');
    const isSyncingAll = ref(false);

    // Host Gate Form (arif_kafeinarts | admin123)
    const hostForm = ref({
      username: 'arif_kafeinarts',
      password: 'admin123'
    });

    // Host Account Creator State
    const showAccountCreateForm = ref(true);
    const isCreatingAccount = ref(false);
    const createdAccountsList = ref([]);

    const newAccountForm = ref({
      name: '',
      email: '',
      password: 'user' + Math.floor(100 + Math.random() * 900) + '!',
      role: 'member',
      department: 'Teknologi & Desain',
      notes: ''
    });

    // Form states for login and register
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

    const isHostUser = computed(() => {
      if (userProfile.value?.isHostProject || userProfile.value?.role === 'host') return true;
      if (currentUser.value?.uid === 'host_arif_kafeinarts') return true;
      if (currentUser.value?.email === 'arif_kafeinarts@kafeinarts.com' || currentUser.value?.username === 'arif_kafeinarts') return true;
      return false;
    });

    const userRoleLabel = computed(() => {
      if (isHostUser.value) return 'Host Project (Super Admin)';
      const r = availableRoles.find(x => x.id === (userProfile.value?.role || 'member'));
      return r ? r.label : 'Member';
    });

    const userRoleBadgeClass = computed(() => {
      if (isHostUser.value) return 'bg-dark text-warning border border-warning';
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

    const fillHostCredentials = () => {
      hostForm.value.username = 'arif_kafeinarts';
      hostForm.value.password = 'admin123';
    };

    const handleHostLogin = async () => {
      isLoading.value = true;
      alertMessage.value = '';
      try {
        const { user, profile } = await loginAsHostProject(hostForm.value.username, hostForm.value.password);
        currentUser.value = user;
        userProfile.value = profile;
        createdAccountsList.value = getStoredCreatedAccounts();
        alertSuccess.value = true;
        alertMessage.value = `Selamat datang, ${profile.displayName}! Anda berhasil masuk sebagai Host Project dengan hak akses 100% dan wewenang pembuatan akun.`;
      } catch (err) {
        alertSuccess.value = false;
        alertMessage.value = err.message || 'Gagal masuk sebagai Host Project.';
      } finally {
        isLoading.value = false;
      }
    };

    const generateRandomPassword = () => {
      const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$';
      let pass = '';
      for (let i = 0; i < 8; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      newAccountForm.value.password = pass;
    };

    const handleCreateAccountByHost = async () => {
      if (!newAccountForm.value.name || !newAccountForm.value.email || !newAccountForm.value.password) {
        alertSuccess.value = false;
        alertMessage.value = 'Harap lengkapi nama, email, dan password untuk akun baru.';
        return;
      }
      isCreatingAccount.value = true;
      alertMessage.value = '';
      try {
        const created = await createAccountByHost(newAccountForm.value);
        createdAccountsList.value = getStoredCreatedAccounts();
        alertSuccess.value = true;
        alertMessage.value = `Akun untuk "${created.displayName}" (${created.email}) dengan role ${created.role} berhasil dibuatkan oleh Host Project! Pengguna dapat langsung masuk dengan email dan password tersebut.`;
        // Generate new random pass for next account
        newAccountForm.value = {
          name: '',
          email: '',
          password: 'user' + Math.floor(100 + Math.random() * 900) + '!',
          role: 'member',
          department: 'Teknologi & Desain',
          notes: ''
        };
      } catch (err) {
        alertSuccess.value = false;
        alertMessage.value = `Gagal membuat akun: ${err.message}`;
      } finally {
        isCreatingAccount.value = false;
      }
    };

    const copyAccountCredentials = (acc) => {
      const text = `Halo ${acc.displayName},\nBerikut kredensial login Kafeinarts Anda:\nEmail / Username: ${acc.email}\nPassword: ${acc.initialPassword || '******'}\nRole: ${acc.role}\nDepartemen: ${acc.department || 'Umum'}\n\nSilakan masuk melalui aplikasi TaskArts Kafeinarts Workspace.`;
      navigator.clipboard.writeText(text).then(() => {
        alertSuccess.value = true;
        alertMessage.value = `Kredensial login untuk ${acc.displayName} berhasil disalin ke clipboard!`;
      }).catch(() => {
        alertSuccess.value = true;
        alertMessage.value = `Info Akun: Email: ${acc.email} | Password: ${acc.initialPassword}`;
      });
    };

    const handleDeleteCreatedAccount = async (uid) => {
      if (confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
        createdAccountsList.value = await deleteAccountByHost(uid);
        alertSuccess.value = true;
        alertMessage.value = 'Akun berhasil dihapus oleh Host Project.';
      }
    };

    const handleUpdateCreatedAccountRole = async (uid, newRole) => {
      createdAccountsList.value = await updateAccountRoleByHost(uid, newRole);
      alertSuccess.value = true;
      alertMessage.value = `Role akun berhasil diubah menjadi ${newRole}.`;
    };

    const refreshActiveSession = () => {
      createdAccountsList.value = getStoredCreatedAccounts();
      const host = getHostSession();
      if (host) {
        currentUser.value = host;
        userProfile.value = host;
        selectedNewRole.value = 'host';
        return;
      }
      const customUser = getUserSession();
      if (customUser) {
        currentUser.value = customUser;
        userProfile.value = customUser;
        selectedNewRole.value = customUser.role || 'member';
        return;
      }
    };

    onMounted(() => {
      refreshActiveSession();

      // Listen for custom auth event
      window.addEventListener('taskarts-auth-changed', refreshActiveSession);

      onAuthStateChanged(auth, async (user) => {
        // If Host or Custom session is active, do not overwrite with null
        const host = getHostSession();
        const customUser = getUserSession();
        if (host) {
          currentUser.value = host;
          userProfile.value = host;
          return;
        }
        if (customUser) {
          currentUser.value = customUser;
          userProfile.value = customUser;
          return;
        }

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
        createdAccountsList.value = getStoredCreatedAccounts();
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
        authTab.value = 'host_gate';
        alertSuccess.value = true;
        alertMessage.value = 'Anda telah keluar dari sesi.';
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
      isHostUser,
      hostForm,
      showAccountCreateForm,
      isCreatingAccount,
      createdAccountsList,
      newAccountForm,
      loginForm,
      registerForm,
      userRoleLabel,
      userRoleBadgeClass,
      syncDataOptions,
      formatDate,
      fillHostCredentials,
      handleHostLogin,
      generateRandomPassword,
      handleCreateAccountByHost,
      copyAccountCredentials,
      handleDeleteCreatedAccount,
      handleUpdateCreatedAccountRole,
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
