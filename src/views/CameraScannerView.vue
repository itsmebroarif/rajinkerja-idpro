<template>
  <div class="camera-scanner-view container-fluid p-0 max-w-100 overflow-x-hidden">
    <!-- Header Page Banner -->
    <div class="card border-0 bg-gradient-dark text-white rounded-4 shadow-sm p-3 p-md-4 mb-4" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-3">
          <div class="bg-primary bg-opacity-25 rounded-3 p-3 d-flex align-items-center justify-content-center text-primary" style="width: 52px; height: 52px;">
            <i class="bi bi-camera-fill fs-3"></i>
          </div>
          <div>
            <div class="d-flex align-items-center gap-2">
              <h4 class="fw-extrabold mb-0 text-white">Kamera Dokumen & Scan</h4>
              <span class="badge bg-success rounded-pill px-2.5 py-1 small fw-bold">Live Camera</span>
            </div>
            <p class="text-slate-300 small mb-0 mt-1">Pindai berkas, nota, atau dokumen penting kantor dengan kamera perangkat Anda secara langsung.</p>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2">
          <router-link to="/notes" class="btn btn-sm btn-outline-light rounded-pill px-3 py-2 fw-semibold">
            <i class="bi bi-journal-text me-1"></i> Ke Notes & Scratchpad
          </router-link>
        </div>
      </div>
    </div>

    <!-- Camera Error / Permission Banner -->
    <div v-if="cameraError" class="alert alert-warning border-warning rounded-4 p-4 mb-4 shadow-sm">
      <div class="d-flex align-items-start gap-3">
        <i class="bi bi-exclamation-triangle-fill fs-3 text-warning"></i>
        <div>
          <h6 class="fw-bold text-dark mb-1">Akses Kamera Perangkat Terbatas / Ditolak</h6>
          <p class="small text-secondary mb-3">{{ cameraError }}</p>
          <div class="d-flex flex-wrap gap-2">
            <button @click="startCamera" class="btn btn-sm btn-warning rounded-pill fw-bold">
              <i class="bi bi-arrow-clockwise me-1"></i> Coba Akses Ulang Kamera
            </button>
            <label class="btn btn-sm btn-outline-dark rounded-pill fw-semibold cursor-pointer">
              <i class="bi bi-upload me-1"></i> Upload Foto dari Galeri HP
              <input type="file" accept="image/*" class="d-none" @change="handleFileUpload" />
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <!-- Left Column: Camera Viewfinder / Capture Control -->
      <div class="col-12 col-lg-7">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-dark position-relative">
          <!-- Video Stream Container -->
          <div class="camera-viewport position-relative bg-black d-flex align-items-center justify-content-center" style="min-height: 380px; max-height: 520px; overflow: hidden;">
            <video 
              ref="videoRef" 
              autoplay 
              playsinline 
              muted 
              class="w-100 h-100 object-fit-cover"
              :class="{ 'mirror-flip': facingMode === 'user' }"
            ></video>

            <!-- Guide Overlay Grid -->
            <div class="document-guide-overlay position-absolute top-0 start-0 w-100 h-100 pointer-events-none d-flex align-items-center justify-content-center p-4">
              <div class="doc-frame border border-2 border-primary border-opacity-75 rounded-4 w-100 h-100 position-relative shadow-lg">
                <div class="corner-tl border-top border-start border-4 border-primary position-absolute" style="top: -2px; left: -2px; width: 24px; height: 24px;"></div>
                <div class="corner-tr border-top border-end border-4 border-primary position-absolute" style="top: -2px; right: -2px; width: 24px; height: 24px;"></div>
                <div class="corner-bl border-bottom border-start border-4 border-primary position-absolute" style="bottom: -2px; left: -2px; width: 24px; height: 24px;"></div>
                <div class="corner-br border-bottom border-end border-4 border-primary position-absolute" style="bottom: -2px; right: -2px; width: 24px; height: 24px;"></div>
                
                <div class="position-absolute top-50 start-50 translate-middle text-center text-white opacity-75">
                  <span class="badge bg-black bg-opacity-60 px-3 py-1.5 rounded-pill text-white fw-medium small">
                    Posisikan Dokumen di Dalam Bingkai
                  </span>
                </div>
              </div>
            </div>

            <!-- Loading Spinner -->
            <div v-if="isStartingCamera" class="position-absolute top-0 start-0 w-100 h-100 bg-black bg-opacity-75 d-flex flex-column align-items-center justify-content-center text-white">
              <div class="spinner-border text-primary mb-2" role="status"></div>
              <span class="small font-mono">Menyiapkan Kamera Perangkat...</span>
            </div>
          </div>

          <!-- Camera Controls Toolbar -->
          <div class="p-3 bg-dark text-white border-top border-secondary border-opacity-25 d-flex align-items-center justify-content-between gap-2 flex-wrap">
            <div class="d-flex align-items-center gap-2">
              <button @click="toggleCameraFacing" class="btn btn-sm btn-outline-light rounded-pill px-3" title="Ganti Kamera Depan/Belakang">
                <i class="bi bi-camera-reels me-1"></i> {{ facingMode === 'environment' ? 'Kamera Belakang' : 'Kamera Depan' }}
              </button>
            </div>

            <button @click="capturePhoto" class="btn btn-primary rounded-circle shadow p-0 d-flex align-items-center justify-content-center btn-shutter" style="width: 58px; height: 58px;" title="Ambil Foto Dokumen">
              <i class="bi bi-circle-fill fs-3 text-white"></i>
            </button>

            <div class="d-flex align-items-center gap-2">
              <label class="btn btn-sm btn-outline-light rounded-pill px-3 cursor-pointer mb-0">
                <i class="bi bi-image me-1"></i> Galeri
                <input type="file" accept="image/*" class="d-none" @change="handleFileUpload" />
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Document Review & Processing -->
      <div class="col-12 col-lg-5">
        <div class="card border-0 shadow-sm rounded-4 p-4 h-100 d-flex flex-column justify-content-between bg-white">
          <div>
            <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <h5 class="fw-bold mb-0 text-dark">Hasil Pindaian Dokumen</h5>
              <span v-if="capturedImage" class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1 fw-bold">Siap Disimpan</span>
            </div>

            <!-- Image Canvas / Preview -->
            <div v-if="capturedImage" class="mb-3">
              <div class="doc-preview-wrapper position-relative rounded-3 overflow-hidden border shadow-sm mb-3 bg-light d-flex align-items-center justify-content-center" style="min-height: 240px; max-height: 320px;">
                <img :src="capturedImage" alt="Document Preview" class="img-fluid object-fit-contain w-100 h-100" :style="filterStyle" />
              </div>

              <!-- Filter Controls -->
              <label class="form-label fw-bold text-dark small mb-2">Filter Hasil Pindaian:</label>
              <div class="d-flex flex-wrap gap-1.5 mb-3">
                <button 
                  v-for="f in filterOptions" 
                  :key="f.id" 
                  @click="activeFilter = f.id" 
                  :class="['btn', 'btn-xs', activeFilter === f.id ? 'btn-primary' : 'btn-outline-secondary', 'rounded-pill', 'px-3', 'py-1', 'small']"
                >
                  {{ f.name }}
                </button>
              </div>

              <!-- Document Metadata Inputs -->
              <div class="mb-3">
                <label class="form-label fw-bold text-dark small mb-1">Judul Dokumen / Nota:</label>
                <input type="text" v-model="docTitle" class="form-control form-control-sm rounded-3" placeholder="Contoh: Nota Pembelian Alat Kantor Budi" />
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold text-dark small mb-1">Catatan Tambahan:</label>
                <textarea v-model="docNotes" class="form-control form-control-sm rounded-3" rows="2" placeholder="Detail keterangan transaksi, supplier, atau nomor faktur..."></textarea>
              </div>
            </div>

            <!-- Empty State Placeholder -->
            <div v-else class="text-center py-5 text-muted my-auto">
              <i class="bi bi-camera-video fs-1 d-block mb-3 opacity-50 text-secondary"></i>
              <h6 class="fw-bold text-dark mb-1">Belum Ada Foto Terambil</h6>
              <p class="small text-secondary mb-0 max-w-sm mx-auto">Arahkan kamera ke berkas fisik Anda lalu tekan tombol jepret merah untuk memindai dokumen.</p>
            </div>
          </div>

            <!-- Action Save Buttons -->
          <div v-if="capturedImage" class="pt-3 border-top d-flex flex-column gap-2">
            <button @click="saveToNotes" class="btn btn-primary rounded-pill fw-bold w-100 py-2.5 d-flex align-items-center justify-content-center gap-2 shadow-xs">
              <i class="bi bi-journal-plus fs-5"></i> Simpan ke Notes & Scratchpad
            </button>

            <!-- Upload Direct to Google Drive -->
            <button @click="uploadToDrive" :disabled="isDriveUploading" class="btn btn-success rounded-pill fw-bold w-100 py-2 d-flex align-items-center justify-content-center gap-2 shadow-xs">
              <span v-if="isDriveUploading" class="spinner-border spinner-border-sm" role="status"></span>
              <i v-else class="bi bi-google"></i>
              <span>{{ isDriveUploading ? 'Mengunggah ke Drive...' : 'Unggah Dokumen ke Google Drive' }}</span>
            </button>

            <div class="d-flex gap-2">
              <button @click="downloadImage" class="btn btn-outline-secondary rounded-pill fw-semibold flex-fill py-2 d-flex align-items-center justify-content-center gap-1 small">
                <i class="bi bi-download"></i> Unduh Foto (PNG)
              </button>
              <button @click="downloadPdf" :disabled="isPdfLoading" class="btn btn-outline-dark rounded-pill fw-semibold flex-fill py-2 d-flex align-items-center justify-content-center gap-1.5 small">
                <span v-if="isPdfLoading" class="spinner-border spinner-border-sm text-danger" role="status"></span>
                <i v-else class="bi bi-file-earmark-pdf text-danger"></i>
                <span>{{ isPdfLoading ? 'Menyiapkan...' : 'Buka PDF di Tab Baru' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden Canvas for Snapshot Capture -->
    <canvas ref="canvasRef" class="d-none"></canvas>

    <!-- Recent Scanned Gallery -->
    <div class="card border-0 shadow-sm rounded-4 p-4 mt-4 bg-white">
      <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-images text-primary fs-5"></i>
          <h5 class="fw-bold mb-0 text-dark">Galeri Dokumen Terpindai</h5>
        </div>
        <span class="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 fw-bold">{{ recentScans.length }} Berkas</span>
      </div>

      <div v-if="recentScans.length > 0" class="row g-3">
        <div v-for="(scan, idx) in recentScans" :key="idx" class="col-6 col-sm-4 col-md-3">
          <div class="card border-0 shadow-sm rounded-3 overflow-hidden h-100 bg-light hover-shadow">
            <div class="ratio ratio-4x3 bg-black">
              <img :src="scan.image" :alt="scan.title" class="object-fit-cover w-100 h-100" />
            </div>
            <div class="p-2.5">
              <div class="fw-bold text-truncate text-dark small">{{ scan.title }}</div>
              <small class="text-muted d-block opacity-75" style="font-size: 10px;">{{ scan.date }}</small>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-4 text-muted small">
        Belum ada riwayat dokumen yang dipindai dalam sesi ini.
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { sendOnDeviceNotification } from '../utils/notification';
import { openPdfBlobInNewTab } from '../utils/pdfTabOpener';
import { uploadFileToGoogleDrive } from '../utils/googleDrive';
import { auth } from '../utils/firebase';
import jsPDF from 'jspdf';

export default {
  name: 'CameraScannerView',
  setup() {
    const store = useStore();
    const videoRef = ref(null);
    const canvasRef = ref(null);
    
    const mediaStream = ref(null);
    const facingMode = ref('environment'); // 'environment' or 'user'
    const cameraError = ref('');
    const isStartingCamera = ref(false);

    const capturedImage = ref(null);
    const activeFilter = ref('document'); // 'normal', 'document', 'grayscale', 'high_contrast'
    const docTitle = ref('Scan Dokumen - ' + new Date().toLocaleDateString('id-ID'));
    const docNotes = ref('');

    const recentScans = ref([]);

    const filterOptions = [
      { id: 'normal', name: 'Original' },
      { id: 'document', name: 'Enhance Doc' },
      { id: 'grayscale', name: 'Grayscale' },
      { id: 'high_contrast', name: 'B&W Kontras' }
    ];

    const filterStyle = computed(() => {
      switch (activeFilter.value) {
        case 'document':
          return 'filter: contrast(125%) brightness(108%) saturate(110%);';
        case 'grayscale':
          return 'filter: grayscale(100%) contrast(115%);';
        case 'high_contrast':
          return 'filter: grayscale(100%) contrast(180%) brightness(90%);';
        default:
          return 'filter: none;';
      }
    });

    const startCamera = async () => {
      stopCamera();
      cameraError.value = '';
      isStartingCamera.value = true;

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Fitur kamera tidak didukung di browser atau perangkat Anda.');
        }

        const constraints = {
          video: {
            facingMode: { ideal: facingMode.value },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        mediaStream.value = stream;

        if (videoRef.value) {
          videoRef.value.srcObject = stream;
        }
      } catch (err) {
        console.error('Camera error:', err);
        cameraError.value = err.message || 'Gagal mengakses kamera. Mohon izinkan izin kamera di browser HP Anda.';
      } finally {
        isStartingCamera.value = false;
      }
    };

    const stopCamera = () => {
      if (mediaStream.value) {
        mediaStream.value.getTracks().forEach(track => track.stop());
        mediaStream.value = null;
      }
    };

    const toggleCameraFacing = () => {
      facingMode.value = facingMode.value === 'environment' ? 'user' : 'environment';
      startCamera();
    };

    const capturePhoto = () => {
      if (!videoRef.value || !canvasRef.value) return;

      const video = videoRef.value;
      const canvas = canvasRef.value;

      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      const ctx = canvas.getContext('2d');
      if (facingMode.value === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      capturedImage.value = canvas.toDataURL('image/png');

      sendOnDeviceNotification('📷 Dokumen Berhasil Dipindai!', {
        body: 'Foto pindaian dokumen siap disimpan atau diexport ke PDF.',
        type: 'success',
        icon: 'bi-camera-fill'
      });
    };

    const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        capturedImage.value = event.target.result;
        sendOnDeviceNotification('🖼️ Berkas Terpilih dari Galeri', {
          body: file.name,
          type: 'info'
        });
      };
      reader.readAsDataURL(file);
    };

    const saveToNotes = () => {
      if (!capturedImage.value) return;

      const title = docTitle.value || 'Dokumen Scan Kamera';
      const content = `${docNotes.value}\n\n![Pindaian Dokumen](${capturedImage.value})`;

      store.dispatch('addNote', {
        title: title,
        content: content,
        color: '#eff6ff',
        tags: ['ScanDokumen', 'Kamera']
      });

      recentScans.value.unshift({
        title: title,
        image: capturedImage.value,
        date: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      });

      sendOnDeviceNotification('📝 Dokumen Tersimpan di Scratchpad', {
        body: `Dokumen "${title}" telah ditambahkan ke Sticky Notes.`,
        type: 'success',
        icon: 'bi-journal-check'
      });
    };

    const downloadImage = () => {
      if (!capturedImage.value) return;
      const a = document.createElement('a');
      a.href = capturedImage.value;
      a.download = `${docTitle.value.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
      a.click();
    };

    const isPdfLoading = ref(false);
    const isDriveUploading = ref(false);

    const dataURItoBlob = (dataURI) => {
      const byteString = atob(dataURI.split(',')[1]);
      const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
    };

    const uploadToDrive = async () => {
      if (!capturedImage.value || isDriveUploading.value) return;
      isDriveUploading.value = true;
      try {
        const blob = dataURItoBlob(capturedImage.value);
        const fileName = `${docTitle.value.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'scan_dokumen'}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        const userId = auth.currentUser?.uid || 'anonymous';
        const result = await uploadFileToGoogleDrive(file, userId, {
          title: docTitle.value || 'Pindaian Kamera',
          notes: docNotes.value || '',
          source: 'camera_scanner'
        });

        store.dispatch('showNotification', {
          type: 'success',
          title: '☁️ Terunggah ke Google Drive',
          message: `Berkas "${result.name}" berhasil disimpan di Google Drive.`
        });
      } catch (err) {
        console.error('Upload Drive error:', err);
        store.dispatch('showNotification', {
          type: 'danger',
          title: 'Gagal Unggah Drive',
          message: err.message || 'Terjadi kendala saat mengunggah ke Google Drive.'
        });
      } finally {
        isDriveUploading.value = false;
      }
    };

    const downloadPdf = () => {
      if (!capturedImage.value || isPdfLoading.value) return;
      isPdfLoading.value = true;

      setTimeout(() => {
        try {
          const pdf = new jsPDF('p', 'mm', 'a4');
          const imgProps = pdf.getImageProperties(capturedImage.value);
          const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

          pdf.setFontSize(16);
          pdf.text(docTitle.value, 10, 15);
          pdf.setFontSize(10);
          pdf.text(`Dipindai via TaskArts Camera Scanner - ${new Date().toLocaleString('id-ID')}`, 10, 22);

          pdf.addImage(capturedImage.value, 'PNG', 10, 28, pdfWidth, Math.min(pdfHeight, 240));

          if (docNotes.value) {
            pdf.setFontSize(10);
            pdf.text(`Catatan: ${docNotes.value}`, 10, 28 + Math.min(pdfHeight, 240) + 10);
          }

          const pdfBlob = pdf.output('blob');
          openPdfBlobInNewTab(pdfBlob, docTitle.value || 'Dokumen_Pindaian');

          sendOnDeviceNotification('📄 Dokumen PDF Terbuka', {
            body: 'Berkas PDF pindaian berhasil dibuka pada tab baru.',
            type: 'success'
          });
        } catch (e) {
          console.error('PDF export error:', e);
        } finally {
          isPdfLoading.value = false;
        }
      }, 400);
    };

    onMounted(() => {
      startCamera();
    });

    onUnmounted(() => {
      stopCamera();
    });

    return {
      videoRef,
      canvasRef,
      facingMode,
      cameraError,
      isStartingCamera,
      capturedImage,
      activeFilter,
      filterOptions,
      filterStyle,
      docTitle,
      docNotes,
      recentScans,
      startCamera,
      toggleCameraFacing,
      capturePhoto,
      handleFileUpload,
      saveToNotes,
      downloadImage,
      isPdfLoading,
      downloadPdf,
      isDriveUploading,
      uploadToDrive
    };
  }
};
</script>

<style scoped>
.btn-shutter {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.btn-shutter:active {
  transform: scale(0.92);
}
.mirror-flip {
  transform: scaleX(-1);
}
.btn-xs {
  font-size: 11px;
  padding: 2px 8px;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
