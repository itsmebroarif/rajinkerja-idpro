<template>
  <div class="google-drive-vault-view container-fluid py-4 px-md-5">
    <!-- Header Title & OAuth Badge -->
    <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1 fw-bold">
            <i class="bi bi-google me-1"></i>Google Drive API Connected
          </span>
          <span class="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1">
            Scope: drive.file
          </span>
          <span v-if="authEmail" class="badge bg-light text-dark border rounded-pill px-2.5 py-1">
            {{ authEmail }}
          </span>
        </div>
        <h3 class="fw-black text-dark mb-1 d-flex align-items-center gap-2">
          Upload Gambar & Dokumen ke Google Drive
        </h3>
        <p class="text-muted small mb-0">
          Unggah berkas foto, struk kuitansi, proposal, dokumen PDF, dan spreadsheet langsung ke Google Drive terhubung ke akun Anda.
        </p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button 
          @click="authorizeDrive" 
          class="btn btn-outline-success rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 shadow-xs"
        >
          <i class="bi bi-shield-check"></i>
          <span>{{ hasDriveToken ? 'Izin Drive Aktif' : 'Otorisasi Ulang Drive' }}</span>
        </button>
        <button 
          @click="refreshFileList" 
          class="btn btn-light border rounded-pill px-3 py-2 text-dark fw-bold d-flex align-items-center gap-1.5 shadow-xs"
          :disabled="isRefreshing"
        >
          <i class="bi bi-arrow-clockwise" :class="{ 'spin-anim': isRefreshing }"></i>
          <span>Segarkan</span>
        </button>
      </div>
    </div>

    <!-- Alert Notifications -->
    <div v-if="alertMessage" class="alert alert-dismissible fade show rounded-3 shadow-xs mb-4" :class="alertSuccess ? 'alert-success border-success-subtle' : 'alert-danger border-danger-subtle'" role="alert">
      <div class="d-flex align-items-center gap-2">
        <i :class="alertSuccess ? 'bi bi-check-circle-fill text-success fs-5' : 'bi bi-exclamation-triangle-fill text-danger fs-5'"></i>
        <div>{{ alertMessage }}</div>
      </div>
      <button type="button" class="btn-close" @click="alertMessage = ''"></button>
    </div>

    <!-- Main Grid: Left Side = Upload Zone & Category, Right Side = Uploaded Drive Files -->
    <div class="row g-4">
      <!-- Upload Drop Zone Card -->
      <div class="col-lg-5">
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
          <h5 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <i class="bi bi-cloud-arrow-up-fill text-success"></i>
            Unggah Berkas Baru
          </h5>

          <!-- Form Details: Module & Description -->
          <div class="mb-3">
            <label class="form-label fw-bold small text-dark">Kategori / Modul Asal</label>
            <select v-model="uploadOptions.module" class="form-select border-2">
              <option value="general">Dokumen Umum (General)</option>
              <option value="finance_receipt">Struk & Kuitansi Keuangan / Reimbursement</option>
              <option value="invoice_pdf">Faktur & Berkas Invoice Klien</option>
              <option value="cv_portfolio">CV & Portofolio Kerja</option>
              <option value="project_specs">Spesifikasi Proyek / Dokumen Kerja</option>
              <option value="diary_photos">Foto Dokumentasi Diary & Jurnal</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold small text-dark">Deskripsi / Catatan Tambahan</label>
            <input 
              type="text" 
              v-model.trim="uploadOptions.description" 
              class="form-control" 
              placeholder="Contoh: Struk makan malam klien, revisi proposal v2" 
            />
          </div>

          <!-- Drag and Drop Box -->
          <div 
            class="upload-dropzone p-4 text-center rounded-4 border-2 border-dashed mb-3"
            :class="{ 'is-dragging': isDragging, 'has-file': !!selectedFile }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleFileDrop"
            @click="triggerFileInput"
          >
            <input 
              type="file" 
              ref="fileInputRef" 
              class="d-none" 
              @change="handleFileSelect"
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" 
            />

            <div v-if="!selectedFile">
              <div class="p-3 bg-success-subtle text-success rounded-circle d-inline-flex mb-2">
                <i class="bi bi-cloud-upload-fill fs-2"></i>
              </div>
              <h6 class="fw-bold text-dark mb-1">Tarik & Lepas File di Sini</h6>
              <p class="text-muted small mb-2">atau klik untuk memilih dari komputer / perangkat Anda</p>
              <span class="badge bg-light text-muted border px-2.5 py-1" style="font-size: 11px;">
                Mendukung Gambar (PNG/JPG/WEBP), PDF, Dokumen Word, Excel & Spreadsheet
              </span>
            </div>

            <div v-else class="selected-file-preview py-2">
              <i :class="getFileIcon(selectedFile.name, selectedFile.type)" class="fs-1 text-success mb-2 d-block"></i>
              <h6 class="fw-bold text-dark mb-1 text-truncate" :title="selectedFile.name">{{ selectedFile.name }}</h6>
              <div class="text-muted small mb-2">{{ formatFileSize(selectedFile.size) }} &bull; {{ selectedFile.type || 'Berkas' }}</div>
              
              <!-- Image thumbnail preview if image -->
              <div v-if="imagePreviewUrl" class="mb-3">
                <img :src="imagePreviewUrl" alt="Preview" class="img-thumbnail rounded-3 shadow-xs" style="max-height: 140px; object-fit: cover;" />
              </div>

              <div class="d-flex justify-content-center gap-2">
                <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3" @click.stop="clearSelectedFile">
                  <i class="bi bi-x me-1"></i>Ganti File
                </button>
              </div>
            </div>
          </div>

          <!-- Upload Progress Bar -->
          <div v-if="isUploading" class="mb-3">
            <div class="d-flex justify-content-between text-muted small mb-1">
              <span>Mengunggah ke Google Drive...</span>
              <span>Mohon tunggu</span>
            </div>
            <div class="progress" style="height: 8px;">
              <div class="progress-bar progress-bar-striped progress-bar-animated bg-success" style="width: 100%"></div>
            </div>
          </div>

          <!-- Upload Button -->
          <button 
            type="button" 
            class="btn btn-success w-100 py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
            :disabled="!selectedFile || isUploading"
            @click="startUpload"
          >
            <span v-if="isUploading" class="spinner-border spinner-border-sm" role="status"></span>
            <i v-else class="bi bi-google"></i>
            <span>{{ isUploading ? 'Sedang Mengunggah...' : 'Unggah Langsung ke Google Drive' }}</span>
          </button>
        </div>

        <!-- Drive Integration Guide Card -->
        <div class="card border-0 shadow-sm rounded-4 p-4 bg-light border">
          <h6 class="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
            <i class="bi bi-info-circle-fill text-primary"></i>
            Keamanan & Hak Akses Berkas
          </h6>
          <ul class="list-unstyled small text-muted mb-0 d-flex flex-column gap-2">
            <li class="d-flex align-items-start gap-2">
              <i class="bi bi-check2 text-success mt-0.5"></i>
              <span>File diunggah langsung menggunakan token akses Google Identity Services (GIS) resmi milik Anda.</span>
            </li>
            <li class="d-flex align-items-start gap-2">
              <i class="bi bi-check2 text-success mt-0.5"></i>
              <span>Scope <code>drive.file</code> memastikan aplikasi hanya memiliki akses terhadap berkas yang diunggah melalui aplikasi ini.</span>
            </li>
            <li class="d-flex align-items-start gap-2">
              <i class="bi bi-check2 text-success mt-0.5"></i>
              <span>Setiap berkas menghasilkan link tampilan resmi (<code>webViewLink</code>) yang dapat langsung dibuka di Google Drive.</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Right Column: List of Uploaded Drive Documents & Images -->
      <div class="col-lg-7">
        <div class="card border-0 shadow-sm rounded-4 p-4">
          <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3 pb-3 border-bottom">
            <div>
              <h5 class="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                <i class="bi bi-folder-check text-success"></i>
                Berkas Terunggah di Google Drive
              </h5>
              <p class="small text-muted mb-0">Total {{ driveFiles.length }} dokumen & gambar tersinkronisasi</p>
            </div>

            <!-- Filter search -->
            <div class="input-group input-group-sm" style="max-width: 220px;">
              <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
              <input type="text" v-model="fileSearch" class="form-control border-start-0" placeholder="Cari file..." />
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredFiles.length === 0" class="text-center py-5 px-3">
            <div class="p-3 bg-light rounded-circle d-inline-flex mb-3 text-muted">
              <i class="bi bi-folder2-open fs-1"></i>
            </div>
            <h6 class="fw-bold text-dark mb-1">Belum Ada Berkas yang Diunggah</h6>
            <p class="small text-muted mb-3" style="max-width: 360px; margin: 0 auto;">
              Gunakan formulir di sebelah kiri untuk mengunggah gambar struk, berkas nota, atau dokumen PDF pertama Anda ke Google Drive.
            </p>
            <button @click="triggerFileInput" class="btn btn-sm btn-outline-success rounded-pill fw-bold px-3 py-1.5">
              <i class="bi bi-plus-lg me-1"></i>Pilih Berkas Sekarang
            </button>
          </div>

          <!-- Files Grid / List -->
          <div v-else class="row g-3">
            <div class="col-12" v-for="item in filteredFiles" :key="item.docId || item.driveFileId">
              <div class="p-3 rounded-3 border bg-white file-item-card d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 hover-shadow">
                <div class="d-flex align-items-center gap-3 overflow-hidden">
                  <div class="file-icon-box p-2.5 rounded-3 bg-light text-center flex-shrink-0" style="width: 48px; height: 48px;">
                    <i :class="getFileIcon(item.name, item.mimeType)" class="fs-4 text-success"></i>
                  </div>
                  <div class="lh-1 text-truncate">
                    <h6 class="fw-bold text-dark mb-1 text-truncate" :title="item.name">
                      {{ item.name }}
                    </h6>
                    <div class="d-flex flex-wrap align-items-center gap-2 small text-muted">
                      <span class="badge bg-light text-dark border px-2 py-0.5" style="font-size: 10px;">{{ getModuleLabel(item.module) }}</span>
                      <span>&bull; {{ formatFileSize(item.size) }}</span>
                      <span>&bull; {{ formatDate(item.createdAt) }}</span>
                    </div>
                  </div>
                </div>

                <div class="d-flex align-items-center gap-1.5 flex-shrink-0 align-self-end align-self-sm-center">
                  <!-- Open in Google Drive Link -->
                  <a 
                    :href="item.webViewLink || `https://drive.google.com/file/d/${item.driveFileId}/view`" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-1"
                    title="Buka di Google Drive resmi"
                  >
                    <i class="bi bi-box-arrow-up-right"></i>
                    <span>Buka di Drive</span>
                  </a>

                  <!-- Delete Record -->
                  <button 
                    v-if="item.docId" 
                    @click="handleDeleteFile(item.docId, item.name)" 
                    class="btn btn-sm btn-outline-danger rounded-circle p-0 d-flex align-items-center justify-content-center"
                    style="width: 32px; height: 32px;"
                    title="Hapus riwayat berkas ini"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { 
  uploadFileToGoogleDrive, 
  getDriveFilesList, 
  deleteDriveFileRecord,
  getGoogleDriveAccessToken 
} from '../utils/googleDrive';
import { auth } from '../utils/firebase';

export default {
  name: 'GoogleDriveVaultView',
  setup() {
    const fileInputRef = ref(null);
    const selectedFile = ref(null);
    const imagePreviewUrl = ref(null);
    const isDragging = ref(false);
    const isUploading = ref(false);
    const isRefreshing = ref(false);
    const hasDriveToken = ref(false);
    const alertMessage = ref('');
    const alertSuccess = ref(true);
    const fileSearch = ref('');
    const driveFiles = ref([]);

    const uploadOptions = ref({
      module: 'general',
      description: ''
    });

    const authEmail = computed(() => {
      return auth.currentUser ? auth.currentUser.email : '';
    });

    const filteredFiles = computed(() => {
      const q = fileSearch.value.trim().toLowerCase();
      if (!q) return driveFiles.value;
      return driveFiles.value.filter(f => 
        (f.name && f.name.toLowerCase().includes(q)) ||
        (f.module && f.module.toLowerCase().includes(q))
      );
    });

    const triggerFileInput = () => {
      if (fileInputRef.value) {
        fileInputRef.value.click();
      }
    };

    const handleFileSelect = (event) => {
      const file = event.target.files?.[0];
      if (file) {
        processSelectedFile(file);
      }
    };

    const handleFileDrop = (event) => {
      isDragging.value = false;
      const file = event.dataTransfer?.files?.[0];
      if (file) {
        processSelectedFile(file);
      }
    };

    const processSelectedFile = (file) => {
      selectedFile.value = file;
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreviewUrl.value = e.target?.result;
        };
        reader.readAsDataURL(file);
      } else {
        imagePreviewUrl.value = null;
      }
    };

    const clearSelectedFile = () => {
      selectedFile.value = null;
      imagePreviewUrl.value = null;
      if (fileInputRef.value) {
        fileInputRef.value.value = '';
      }
    };

    const authorizeDrive = async () => {
      try {
        await getGoogleDriveAccessToken(true);
        hasDriveToken.value = true;
        alertSuccess.value = true;
        alertMessage.value = 'Otorisasi Google Drive berhasil! Akses telah aktif.';
      } catch (err) {
        alertSuccess.value = false;
        alertMessage.value = `Gagal otorisasi Google Drive: ${err.message}`;
      }
    };

    const startUpload = async () => {
      if (!selectedFile.value) return;
      isUploading.value = true;
      alertMessage.value = '';
      try {
        const driveData = await uploadFileToGoogleDrive(selectedFile.value, {
          module: uploadOptions.value.module,
          description: uploadOptions.value.description
        });
        hasDriveToken.value = true;
        alertSuccess.value = true;
        alertMessage.value = `Berkas "${driveData.name}" berhasil diunggah ke Google Drive!`;
        clearSelectedFile();
        await refreshFileList();
      } catch (err) {
        alertSuccess.value = false;
        alertMessage.value = `Gagal mengunggah ke Google Drive: ${err.message}`;
      } finally {
        isUploading.value = false;
      }
    };

    const refreshFileList = async () => {
      isRefreshing.value = true;
      try {
        const list = await getDriveFilesList();
        driveFiles.value = list;
      } catch (err) {
        console.error('Failed to load drive files:', err);
      } finally {
        isRefreshing.value = false;
      }
    };

    const handleDeleteFile = async (docId, fileName) => {
      if (!confirm(`Hapus catatan riwayat "${fileName}" dari daftar aplikasi? (Berkas di Google Drive Anda tetap aman tersimpan)`)) {
        return;
      }
      try {
        await deleteDriveFileRecord(docId);
        driveFiles.value = driveFiles.value.filter(f => f.docId !== docId);
        alertSuccess.value = true;
        alertMessage.value = `Riwayat berkas "${fileName}" berhasil dihapus.`;
      } catch (err) {
        alertSuccess.value = false;
        alertMessage.value = `Gagal menghapus riwayat: ${err.message}`;
      }
    };

    const formatFileSize = (bytes) => {
      if (!bytes || bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '-';
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      } catch {
        return dateStr;
      }
    };

    const getFileIcon = (name = '', type = '') => {
      const lower = name.toLowerCase();
      if (type.startsWith('image/') || lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp')) {
        return 'bi bi-file-earmark-image-fill';
      }
      if (lower.endsWith('.pdf') || type.includes('pdf')) {
        return 'bi bi-file-earmark-pdf-fill';
      }
      if (lower.endsWith('.xls') || lower.endsWith('.xlsx') || lower.endsWith('.csv')) {
        return 'bi bi-file-earmark-spreadsheet-fill';
      }
      if (lower.endsWith('.doc') || lower.endsWith('.docx')) {
        return 'bi bi-file-earmark-word-fill';
      }
      return 'bi bi-file-earmark-text-fill';
    };

    const getModuleLabel = (module) => {
      const map = {
        general: 'Dokumen Umum',
        finance_receipt: 'Struk & Nota',
        invoice_pdf: 'Faktur Invoice',
        cv_portfolio: 'CV & Portofolio',
        project_specs: 'Proyek',
        diary_photos: 'Foto Diary'
      };
      return map[module] || 'Dokumen';
    };

    onMounted(async () => {
      await refreshFileList();
    });

    return {
      fileInputRef,
      selectedFile,
      imagePreviewUrl,
      isDragging,
      isUploading,
      isRefreshing,
      hasDriveToken,
      alertMessage,
      alertSuccess,
      fileSearch,
      driveFiles,
      filteredFiles,
      uploadOptions,
      authEmail,
      triggerFileInput,
      handleFileSelect,
      handleFileDrop,
      clearSelectedFile,
      authorizeDrive,
      startUpload,
      refreshFileList,
      handleDeleteFile,
      formatFileSize,
      formatDate,
      getFileIcon,
      getModuleLabel
    };
  }
};
</script>

<style scoped>
.upload-dropzone {
  border: 2px dashed #cbd5e1;
  background-color: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
}
.upload-dropzone:hover,
.upload-dropzone.is-dragging {
  border-color: #10b981;
  background-color: #f0fdf4;
}
.upload-dropzone.has-file {
  border-color: #10b981;
  background-color: #f0fdf4;
}
.spin-anim {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.hover-shadow {
  transition: box-shadow 0.2s ease;
}
.hover-shadow:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}
</style>
