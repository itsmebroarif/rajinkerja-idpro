<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- Header Banner -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border header-storage-banner">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
          <span class="badge bg-primary-subtle text-primary fw-bold px-3 py-1.5 rounded-pill">
            <i class="bi bi-hdd-stack-fill me-1"></i> LocalStorage & Cache Inspector
          </span>
          <span
            class="badge fw-bold px-3 py-1.5 rounded-pill"
            :class="storageInfo.isFull ? 'bg-danger text-white' : storageInfo.isWarning ? 'bg-warning text-dark' : 'bg-success-subtle text-success'"
          >
            <i class="bi" :class="storageInfo.isFull ? 'bi-x-octagon-fill' : storageInfo.isWarning ? 'bi-exclamation-triangle-fill' : 'bi-shield-check'"></i>
            {{ storageInfo.isFull ? 'Kapasitas Penuh (Simpan Terkunci)' : storageInfo.isWarning ? 'Kapasitas Mendekati Batas' : 'Penyimpanan Aman & Normal' }}
          </span>
        </div>
        <h2 class="fw-extrabold mb-1 text-dark">💾 Manajemen Storage & Kapasitas Memori Cache</h2>
        <p class="text-muted mb-0">Pantau penggunaan memori browser, kuota cache 5 GB diperluas, inspeksi JSON per modul di halaman terpisah, dan reset total data.</p>
      </div>

      <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-outline-primary fw-bold px-3 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2" @click="refreshStorage">
          <i class="bi bi-arrow-repeat" :class="{ 'spin-icon': isRefreshing }"></i>
          <span>Segarkan Data</span>
        </button>
        <button class="btn btn-success fw-bold px-3 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2 text-white" @click="exportAllDataBackup">
          <i class="bi bi-download"></i>
          <span>Backup JSON Semua Data</span>
        </button>
      </div>
    </div>

    <!-- Storage Full Alert Banner (When full or simulated) -->
    <div v-if="storageInfo.isFull" class="alert alert-danger rounded-4 shadow-sm border-2 border-danger p-4 mb-4" role="alert">
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-3">
          <div class="p-3 bg-danger text-white rounded-3 fs-3">
            <i class="bi bi-shield-slash-fill"></i>
          </div>
          <div>
            <h5 class="fw-bold text-danger mb-1">
              ⚠️ PERINGATAN: Local Storage Penuh! (Fitur Menyimpan Dinonaktifkan)
            </h5>
            <p class="small text-dark mb-0">
              Kapasitas memori Local Storage browser telah mencapai batas maksimal {{ storageInfo.isForcedFull ? '(Mode Simulasi Aktif)' : '' }}.
              Semua operasi penambahan catatan, tugas, transaksi, dan data baru <strong>dikunci sementara</strong> demi mencegah hilangnya data.
            </p>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2 flex-shrink-0">
          <button v-if="storageInfo.isForcedFull" class="btn btn-dark fw-bold px-3 py-2 rounded-3" @click="toggleSimulatedFull">
            Matikan Mode Simulasi Penuh
          </button>
          <button class="btn btn-danger fw-bold px-3 py-2 rounded-3" @click="quickCleanCache">
            <i class="bi bi-magic me-1"></i> Bersihkan Cache Sekarang
          </button>
        </div>
      </div>
    </div>

    <!-- METRIC CARDS -->
    <div class="row g-3 mb-4">
      <!-- Card 1: Penggunaan Kapasitas -->
      <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm rounded-4 bg-white p-3 h-100">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="small fw-bold text-muted text-uppercase tracking-wider">Total Digunakan</span>
            <span class="badge bg-primary-subtle text-primary fw-bold px-2 py-1 rounded-pill">
              Kuota ~5.00 GB
            </span>
          </div>
          <div class="d-flex align-items-baseline gap-2 mb-2">
            <h3 class="fw-extrabold text-dark mb-0">{{ storageInfo.totalMB }} <span class="fs-6 fw-normal text-muted">MB</span></h3>
            <span class="small text-muted">({{ storageInfo.totalKB.toLocaleString() }} KB)</span>
          </div>
          <!-- Progress Bar -->
          <div class="progress rounded-pill mb-2" style="height: 10px;">
            <div
              class="progress-bar rounded-pill"
              :class="storageInfo.isFull ? 'bg-danger' : storageInfo.isWarning ? 'bg-warning' : 'bg-primary'"
              role="progressbar"
              :style="{ width: Math.max(storageInfo.percentUsed, 1) + '%' }"
              :aria-valuenow="storageInfo.percentUsed"
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
          <div class="d-flex justify-content-between small text-muted">
            <span>{{ storageInfo.percentUsed }}% Terpakai</span>
            <span>Maks: 5,120 MB (5.00 GB)</span>
          </div>
        </div>
      </div>

      <!-- Card 2: Sisa Ruang Bebas -->
      <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm rounded-4 bg-white p-3 h-100">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="small fw-bold text-muted text-uppercase tracking-wider">Sisa Ruang Tersedia</span>
            <div class="p-2 rounded-circle bg-success-subtle text-success">
              <i class="bi bi-hdd-fill"></i>
            </div>
          </div>
          <h3 class="fw-extrabold text-dark mb-1">{{ storageInfo.remainingFormatted }}</h3>
          <p class="small text-muted mb-0">
            Kapasitas cache memory luas 5 GB tanpa pembatasan sempit.
          </p>
        </div>
      </div>

      <!-- Card 3: Status Proteksi Simpan -->
      <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm rounded-4 bg-white p-3 h-100">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="small fw-bold text-muted text-uppercase tracking-wider">Status Izin Simpan</span>
            <div class="p-2 rounded-circle" :class="storageInfo.isFull ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'">
              <i class="bi" :class="storageInfo.isFull ? 'bi-lock-fill' : 'bi-unlock-fill'"></i>
            </div>
          </div>
          <h4 class="fw-extrabold mb-1" :class="storageInfo.isFull ? 'text-danger' : 'text-success'">
            {{ storageInfo.isFull ? '🔒 TERKUNCI (FULL)' : '🔓 AKTIF & NORMAL' }}
          </h4>
          <p class="small text-muted mb-0">
            {{ storageInfo.isFull ? 'Menyimpan dicegah agar memori tidak error.' : 'Notes, tugas, dan data baru dapat disimpan bebas.' }}
          </p>
        </div>
      </div>

      <!-- Card 4: Total Kunci Terdaftar -->
      <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm rounded-4 bg-white p-3 h-100">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="small fw-bold text-muted text-uppercase tracking-wider">Total Kunci Data</span>
            <div class="p-2 rounded-circle bg-info-subtle text-info">
              <i class="bi bi-collection-fill"></i>
            </div>
          </div>
          <h3 class="fw-extrabold text-dark mb-1">{{ storageInfo.itemCount }} <span class="fs-6 fw-normal text-muted">Items</span></h3>
          <p class="small text-muted mb-0">
            Modul & variabel tersimpan di penyimpanan saat ini.
          </p>
        </div>
      </div>
    </div>

    <!-- DEDICATED TOTAL RESET & FACTORY RESET CARD -->
    <div class="card border border-2 border-danger shadow-sm rounded-4 bg-danger bg-opacity-10 p-4 mb-4">
      <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
        <div class="d-flex align-items-start gap-3">
          <div class="p-3 bg-danger text-white rounded-4 fs-2">
            <i class="bi bi-radioactive"></i>
          </div>
          <div>
            <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
              <h4 class="fw-extrabold text-danger mb-0">🔥 Reset Total Seluruh Data (Factory Reset)</h4>
              <span class="badge bg-danger text-white px-2.5 py-1 rounded-pill fw-bold">Penghapusan Total</span>
            </div>
            <p class="text-dark small mb-0" style="max-width: 780px;">
              Tombol ini akan <strong>mengosongkan seluruh memori Local Storage</strong> dan mereset state aplikasi ke kondisi bersih awal (Clean Slate).
              Menghapus seluruh daftar tugas (To-Do), proyek, catatan, scratchpad, jurnal harian, transaksi & RAB, profil, galeri foto, dan riwayat.
            </p>
          </div>
        </div>

        <div class="d-flex flex-wrap gap-2 flex-shrink-0 align-items-center">
          <button class="btn btn-secondary fw-semibold rounded-3 px-3 py-2 shadow-sm" @click="loadSampleDataForDemo">
            <i class="bi bi-box-seam me-1"></i> Muat Data Contoh (Demo)
          </button>
          <button class="btn btn-danger fw-bold rounded-3 px-4 py-2 shadow-sm d-flex align-items-center gap-2" @click="confirmTotalReset">
            <i class="bi bi-trash3-fill"></i>
            <span>Reset Total Aplikasi</span>
          </button>
        </div>
      </div>
    </div>

    <!-- QUICK ACTIONS & SIMULATOR CARD -->
    <div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
      <h5 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
        <i class="bi bi-tools text-primary"></i>
        <span>Alat Pembersihan Cepat & Pengujian Kuota</span>
      </h5>

      <div class="row g-3 align-items-center">
        <!-- Quick Cleaner -->
        <div class="col-md-6 col-lg-4">
          <div class="p-3 bg-light rounded-3 border h-100 d-flex flex-column justify-content-between">
            <div>
              <div class="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                <i class="bi bi-stars text-warning fs-5"></i>
                <span>Bersihkan Cache & Draft Sementara</span>
              </div>
              <p class="small text-muted mb-3">
                Menghapus draft catatan yang belum tersimpan, cache lama, dan skor game sementara tanpa menghapus catatan atau tugas utama Anda.
              </p>
            </div>
            <button class="btn btn-outline-primary btn-sm fw-bold w-100 rounded-3 py-2" @click="quickCleanCache">
              <i class="bi bi-trash3 me-1"></i> Jalankan Pembersihan Cache
            </button>
          </div>
        </div>

        <!-- Scratchpad Cleaner -->
        <div class="col-md-6 col-lg-4">
          <div class="p-3 bg-light rounded-3 border h-100 d-flex flex-column justify-content-between">
            <div>
              <div class="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                <i class="bi bi-sticky text-primary fs-5"></i>
                <span>Reset Quick Scratchpad</span>
              </div>
              <p class="small text-muted mb-3">
                Mengosongkan teks dan gambar coretan pada Quick Scratchpad jika berukuran terlalu besar.
              </p>
            </div>
            <button class="btn btn-outline-warning btn-sm fw-bold text-dark w-100 rounded-3 py-2" @click="clearScratchpadStorage">
              <i class="bi bi-eraser me-1"></i> Kosongkan Scratchpad
            </button>
          </div>
        </div>

        <!-- Full Storage Simulator Toggle -->
        <div class="col-md-12 col-lg-4">
          <div class="p-3 rounded-3 border h-100 d-flex flex-column justify-content-between" :class="storageInfo.isForcedFull ? 'bg-danger bg-opacity-10 border-danger' : 'bg-light'">
            <div>
              <div class="form-check form-switch d-flex justify-content-between align-items-center p-0 mb-2">
                <label class="form-check-label fw-bold text-dark mb-0" for="simulateFullSwitch">
                  🧪 Uji Coba: Simulasi Storage Penuh
                </label>
                <input
                  class="form-check-input fs-4 ms-2"
                  type="checkbox"
                  id="simulateFullSwitch"
                  :checked="storageInfo.isForcedFull"
                  @change="toggleSimulatedFull"
                  style="cursor: pointer;"
                />
              </div>
              <p class="small text-muted mb-3">
                Aktifkan opsi ini untuk mensimulasikan kondisi kuota penuh. Anda dapat menguji bahwa halaman <strong>Notes & Scratchpad</strong> serta halaman lain akan mengunci fungsi simpan dan memberi peringatan.
              </p>
            </div>
            <div class="small fw-semibold" :class="storageInfo.isForcedFull ? 'text-danger' : 'text-muted'">
              Status Simulasi: <strong>{{ storageInfo.isForcedFull ? 'MENYALA (Penyimpanan Dianggap Penuh)' : 'Mati (Kondisi Normal)' }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- DETAILED STORAGE BREAKDOWN TABLE -->
    <div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h5 class="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i class="bi bi-table text-primary"></i>
            <span>Rincian Penggunaan Berdasarkan Kunci Data</span>
          </h5>
          <p class="small text-muted mb-0">Klik <strong>Lihat JSON</strong> pada salah satu baris untuk membuka inspeksi data di halaman terpisah.</p>
        </div>

        <!-- Category Filter & Search -->
        <div class="d-flex flex-wrap align-items-center gap-2">
          <select class="form-select form-select-sm rounded-3 fw-semibold text-dark w-auto" v-model="selectedCategory">
            <option value="ALL">Semua Kategori ({{ storageInfo.items.length }})</option>
            <option v-for="cat in uniqueCategories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
          <div class="input-group input-group-sm w-auto">
            <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-search"></i></span>
            <input
              type="text"
              class="form-control bg-light border-start-0 ps-0"
              placeholder="Cari nama kunci..."
              v-model="searchKey"
            />
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light small text-uppercase text-muted">
            <tr>
              <th scope="col" style="width: 28%;">Modul & Kunci LocalStorage</th>
              <th scope="col" style="width: 18%;">Kategori</th>
              <th scope="col" style="width: 15%;">Ukuran Memori</th>
              <th scope="col" style="width: 12%;">% Penggunaan</th>
              <th scope="col" style="width: 11%;">Jumlah Data</th>
              <th scope="col" class="text-end" style="width: 16%;">Aksi & Pratinjau</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredItems" :key="item.key">
              <td>
                <div class="d-flex align-items-center gap-2.5">
                  <div class="p-2 rounded-3 bg-light border text-primary">
                    <i class="bi bi-database"></i>
                  </div>
                  <div>
                    <div class="fw-bold text-dark">{{ item.label }}</div>
                    <code class="small text-muted">{{ item.key }}</code>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge bg-light text-dark border px-2.5 py-1 rounded-pill fw-semibold">
                  {{ item.category }}
                </span>
              </td>
              <td>
                <div class="fw-bold text-dark">{{ item.formattedSize }}</div>
                <small class="text-muted font-monospace">({{ item.bytes.toLocaleString() }} bytes)</small>
              </td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div class="progress flex-grow-1 rounded-pill" style="height: 6px;">
                    <div
                      class="progress-bar bg-primary rounded-pill"
                      role="progressbar"
                      :style="{ width: Math.min(100, (item.bytes / (storageInfo.totalBytes || 1)) * 100) + '%' }"
                    ></div>
                  </div>
                  <span class="small font-monospace text-muted">
                    {{ ((item.bytes / (storageInfo.totalBytes || 1)) * 100).toFixed(1) }}%
                  </span>
                </div>
              </td>
              <td>
                <span class="small fw-semibold text-dark">
                  {{ item.itemCount !== null ? `${item.itemCount} ${item.isJson ? 'entri' : 'huruf'}` : '-' }}
                </span>
              </td>
              <td class="text-end text-nowrap">
                <!-- Direct link to dedicated JSON Viewer page -->
                <router-link
                  :to="'/storage/view/' + encodeURIComponent(item.key)"
                  class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 me-1 text-decoration-none fw-semibold d-inline-flex align-items-center gap-1.5"
                  title="Buka Pratinjau JSON di Halaman Terpisah"
                >
                  <i class="bi bi-code-slash"></i>
                  <span>Lihat JSON</span>
                </router-link>

                <!-- Dropdown for extra actions -->
                <div class="dropdown d-inline-block">
                  <button class="btn btn-sm btn-light border rounded-circle p-1.5" type="button" data-bs-toggle="dropdown" aria-label="Menu Aksi">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3">
                    <li>
                      <router-link :to="'/storage/view/' + encodeURIComponent(item.key)" class="dropdown-item d-flex align-items-center gap-2">
                        <i class="bi bi-box-arrow-up-right text-primary"></i>
                        <span>Buka Halaman JSON Terpisah</span>
                      </router-link>
                    </li>
                    <li>
                      <button class="dropdown-item d-flex align-items-center gap-2" @click="exportSingleKey(item)">
                        <i class="bi bi-download text-success"></i>
                        <span>Unduh File JSON</span>
                      </button>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                      <button class="dropdown-item text-danger d-flex align-items-center gap-2" @click="deleteSingleKey(item)">
                        <i class="bi bi-trash"></i>
                        <span>Kosongkan Kunci Ini</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </td>
            </tr>

            <tr v-if="filteredItems.length === 0">
              <td colspan="6" class="text-center py-5 text-muted">
                <i class="bi bi-inbox fs-1 d-block mb-2 text-secondary"></i>
                Tidak ada kunci penyimpanan yang cocok dengan pencarian Anda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import Swal from 'sweetalert2';
import {
  getLocalStorageUsage,
  setSimulatedStorageFull,
  safeRemoveItem,
  clearTemporaryCache,
  executeTotalReset
} from '../utils/storageManager';

export default {
  name: 'StorageView',
  setup() {
    const store = useStore();
    const storageInfo = ref(getLocalStorageUsage());
    const isRefreshing = ref(false);
    const searchKey = ref('');
    const selectedCategory = ref('ALL');

    const refreshStorage = () => {
      isRefreshing.value = true;
      storageInfo.value = getLocalStorageUsage();
      setTimeout(() => {
        isRefreshing.value = false;
      }, 350);
    };

    const uniqueCategories = computed(() => {
      const cats = new Set(storageInfo.value.items.map(i => i.category));
      return Array.from(cats);
    });

    const filteredItems = computed(() => {
      return storageInfo.value.items.filter(item => {
        const matchesCategory = selectedCategory.value === 'ALL' || item.category === selectedCategory.value;
        const q = searchKey.value.trim().toLowerCase();
        const matchesSearch = !q || item.key.toLowerCase().includes(q) || item.label.toLowerCase().includes(q);
        return matchesCategory && matchesSearch;
      });
    });

    const toggleSimulatedFull = () => {
      const next = !storageInfo.value.isForcedFull;
      setSimulatedStorageFull(next);
      refreshStorage();
      if (next) {
        Swal.fire({
          icon: 'warning',
          title: 'Mode Simulasi Penuh Aktif!',
          text: 'Penyimpanan Local Storage sekarang diset sebagai PENUH. Coba buka menu Notes & Scratchpad atau Todo List untuk melihat proteksi penguncian simpan.',
          confirmButtonColor: '#dc2626'
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Mode Simulasi Dimatikan',
          text: 'Kapasitas Local Storage kembali ke kondisi normal. Semua fungsi simpan telah terbuka kembali.',
          timer: 2000,
          showConfirmButton: false
        });
      }
    };

    const quickCleanCache = () => {
      const res = clearTemporaryCache();
      refreshStorage();
      Swal.fire({
        icon: 'success',
        title: 'Cache & Draft Dibersihkan!',
        text: `Berhasil mengosongkan ${res.clearedCount} item sementara dan membebaskan ${res.freedFormatted} memori browser.`,
        timer: 2500,
        showConfirmButton: false
      });
    };

    const clearScratchpadStorage = async () => {
      const confirm = await Swal.fire({
        title: 'Kosongkan Scratchpad?',
        text: 'Apakah Anda yakin ingin menghapus seluruh teks dan gambar coretan pada Quick Scratchpad? Data tidak dapat dikembalikan jika belum di-copy.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d97706',
        confirmButtonText: 'Ya, Kosongkan',
        cancelButtonText: 'Batal'
      });

      if (confirm.isConfirmed) {
        safeRemoveItem('rk_quick_scratchpad');
        refreshStorage();
        Swal.fire({
          icon: 'success',
          title: 'Scratchpad Dikosongkan',
          text: 'Quick Scratchpad telah dibersihkan dan memori berhasil dibebaskan.',
          timer: 2000,
          showConfirmButton: false
        });
      }
    };

    const exportSingleKey = (item) => {
      if (!item) return;
      const raw = localStorage.getItem(item.key) || '';
      const blob = new Blob([raw], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${item.key}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };

    const deleteSingleKey = async (item) => {
      const confirm = await Swal.fire({
        title: `Hapus Kunci "${item.label}"?`,
        text: `Data pada kunci "${item.key}" (${item.formattedSize}) akan dihapus dari penyimpanan browser. Tindakan ini tidak dapat dibatalkan.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'Ya, Hapus Data Ini',
        cancelButtonText: 'Batal'
      });

      if (confirm.isConfirmed) {
        safeRemoveItem(item.key);
        refreshStorage();
        Swal.fire({
          icon: 'success',
          title: 'Kunci Dihapus!',
          text: `Data ${item.label} telah dihapus dari LocalStorage.`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    };

    const confirmTotalReset = async () => {
      const step1 = await Swal.fire({
        title: 'Konfirmasi Reset Total?',
        html: `
          <p class="text-muted mb-2">Anda akan melakukan <strong>Reset Total Seluruh Data Aplikasi</strong>.</p>
          <div class="alert alert-danger text-start small mb-0">
            <i class="bi bi-exclamation-triangle-fill me-1"></i>
            Semua catatan, coretan scratchpad, to-do list, manajemen proyek, arus kas RAB, profil, dan galeri akan dihapus permanen dari browser.
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Lanjutkan ke Verifikasi',
        cancelButtonText: 'Batal'
      });

      if (!step1.isConfirmed) return;

      const step2 = await Swal.fire({
        title: 'Verifikasi Terakhir!',
        text: 'Ketik "RESET" dengan huruf kapital di bawah ini untuk memulai penghapusan total:',
        input: 'text',
        inputPlaceholder: 'Ketik RESET',
        icon: 'error',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'Ya, Reset Total Sekarang',
        cancelButtonText: 'Batal',
        preConfirm: (inputVal) => {
          if ((inputVal || '').trim().toUpperCase() !== 'RESET') {
            Swal.showValidationMessage('Ketik RESET dengan benar untuk melanjutkan.');
            return false;
          }
          return true;
        }
      });

      if (step2.isConfirmed) {
        executeTotalReset({ keepTheme: true });
        store.dispatch('clearAllData');
        refreshStorage();

        Swal.fire({
          icon: 'success',
          title: 'Reset Total Berhasil!',
          text: 'Seluruh data aplikasi dan memori cache telah dikosongkan ke setelan bersih awal.',
          confirmButtonColor: '#0284c7'
        });
      }
    };

    const loadSampleDataForDemo = async () => {
      const confirm = await Swal.fire({
        title: 'Muat Data Contoh (Demo)?',
        text: 'Ini akan mengisi aplikasi dengan sampel proyek, tugas, catatan, dan transaksi untuk kebutuhan demonstrasi.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#0284c7',
        confirmButtonText: 'Ya, Muat Data Contoh',
        cancelButtonText: 'Batal'
      });

      if (confirm.isConfirmed) {
        store.dispatch('loadSampleData');
        refreshStorage();
        Swal.fire({
          icon: 'success',
          title: 'Data Contoh Dimuat!',
          text: 'Data contoh telah berhasil disiapkan ke dalam memori.',
          timer: 2000,
          showConfirmButton: false
        });
      }
    };

    const exportAllDataBackup = () => {
      const allData = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) {
          try {
            allData[k] = JSON.parse(localStorage.getItem(k));
          } catch (e) {
            allData[k] = localStorage.getItem(k);
          }
        }
      }
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rajinkerja_full_storage_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };

    const handleStorageChange = () => {
      refreshStorage();
    };

    onMounted(() => {
      window.addEventListener('storage-quota-updated', handleStorageChange);
      window.addEventListener('storage-quota-full', handleStorageChange);
      refreshStorage();
    });

    onUnmounted(() => {
      window.removeEventListener('storage-quota-updated', handleStorageChange);
      window.removeEventListener('storage-quota-full', handleStorageChange);
    });

    return {
      storageInfo,
      isRefreshing,
      searchKey,
      selectedCategory,
      uniqueCategories,
      filteredItems,
      refreshStorage,
      toggleSimulatedFull,
      quickCleanCache,
      clearScratchpadStorage,
      exportSingleKey,
      deleteSingleKey,
      confirmTotalReset,
      loadSampleDataForDemo,
      exportAllDataBackup
    };
  }
};
</script>

<style scoped>
.spin-icon {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.header-storage-banner {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}
</style>
