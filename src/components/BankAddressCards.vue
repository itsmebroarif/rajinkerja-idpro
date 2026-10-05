<template>
  <div class="bank-address-container p-3 p-md-4 rounded-4 bg-white shadow-sm border">
    <!-- Header Section -->
    <div class="text-center mb-4">
      <div class="d-inline-flex align-items-center justify-content-center gap-2 mb-1">
        <span class="fs-2">💝</span>
        <h2 class="fw-black text-dark tracking-wide mb-0 text-uppercase" style="font-size: 1.75rem; letter-spacing: 1px;">
          BANK ADDRESS
        </h2>
      </div>
      <p class="text-muted small fw-bold text-uppercase mb-0" style="letter-spacing: 0.5px;">
        ALAMAT BANK & E-WALLET YANG DIMILIKI ARIF PERMANA PUTRASURYANA
      </p>
    </div>

    <!-- 4 Bank & E-Wallet Cards Grid -->
    <div class="row g-3 g-md-4 mb-4">
      <!-- 1. BANK BSI -->
      <div class="col-12 col-md-6">
        <div class="bank-card p-3.5 p-md-4 rounded-4 border-2 border-emerald bg-white h-100 position-relative transition-all shadow-xs">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div class="d-flex align-items-center gap-2">
              <span class="fs-4">🏢</span>
              <h5 class="fw-bold text-emerald mb-0">Bank BSI</h5>
            </div>
            <span class="badge bg-emerald-badge text-white px-2.5 py-1 rounded-pill small fw-bold">
              Bank Transfer
            </span>
          </div>

          <div class="mb-3">
            <div class="d-flex align-items-center justify-content-between">
              <div class="display-digits fw-black text-dark font-monospace" style="font-size: 1.45rem; letter-spacing: 1px;">
                7367026237
              </div>
              <button 
                class="btn btn-sm btn-outline-success rounded-pill px-3 fw-bold d-flex align-items-center gap-1 shadow-xs"
                @click="copyText('7367026237', 'Nomor Rekening Bank BSI')"
                title="Salin Nomor Rekening"
              >
                <i :class="copiedKey === '7367026237' ? 'bi bi-check-lg text-success' : 'bi bi-clipboard'"></i>
                <span>{{ copiedKey === '7367026237' ? 'Tersalin!' : 'Salin' }}</span>
              </button>
            </div>
          </div>

          <div class="account-owner-info text-secondary small lh-sm">
            <div class="fw-bold text-dark">a.n. ARIF PERMANA PUTRASURYAN</div>
            <div class="text-muted">(ARIF PERMANA PUTRASURYANA)</div>
          </div>
        </div>
      </div>

      <!-- 2. OVO -->
      <div class="col-12 col-md-6">
        <div class="bank-card p-3.5 p-md-4 rounded-4 border border-slate-200 bg-white h-100 position-relative transition-all shadow-xs">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div class="d-flex align-items-center gap-2">
              <span class="color-dot bg-purple"></span>
              <h5 class="fw-bold text-dark mb-0">OVO</h5>
            </div>
            <span class="badge bg-dark-slate text-white px-2.5 py-1 rounded-pill small fw-bold">
              E-Wallet
            </span>
          </div>

          <div class="mb-3">
            <div class="d-flex align-items-center justify-content-between">
              <div class="display-digits fw-black text-dark font-monospace" style="font-size: 1.45rem; letter-spacing: 1px;">
                0895343226354
              </div>
              <button 
                class="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold d-flex align-items-center gap-1 shadow-xs"
                @click="copyText('0895343226354', 'Nomor OVO')"
                title="Salin Nomor OVO"
              >
                <i :class="copiedKey === '0895343226354_ovo' ? 'bi bi-check-lg text-success' : 'bi bi-clipboard'"></i>
                <span>{{ copiedKey === '0895343226354_ovo' ? 'Tersalin!' : 'Salin' }}</span>
              </button>
            </div>
          </div>

          <div class="account-owner-info text-secondary small lh-sm">
            <div class="fw-bold text-dark">a.n. Arif PERMANA PUTRASURYANA</div>
          </div>
        </div>
      </div>

      <!-- 3. DANA -->
      <div class="col-12 col-md-6">
        <div class="bank-card p-3.5 p-md-4 rounded-4 border border-slate-200 bg-white h-100 position-relative transition-all shadow-xs">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div class="d-flex align-items-center gap-2">
              <span class="color-dot bg-blue"></span>
              <h5 class="fw-bold text-dark mb-0">DANA</h5>
            </div>
            <span class="badge bg-purple text-white px-2.5 py-1 rounded-pill small fw-bold">
              E-Wallet
            </span>
          </div>

          <div class="mb-3">
            <div class="d-flex align-items-center justify-content-between">
              <div class="display-digits fw-black text-dark font-monospace" style="font-size: 1.45rem; letter-spacing: 1px;">
                0895343226354
              </div>
              <button 
                class="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold d-flex align-items-center gap-1 shadow-xs"
                @click="copyText('0895343226354', 'Nomor DANA', '0895343226354_dana')"
                title="Salin Nomor DANA"
              >
                <i :class="copiedKey === '0895343226354_dana' ? 'bi bi-check-lg text-success' : 'bi bi-clipboard'"></i>
                <span>{{ copiedKey === '0895343226354_dana' ? 'Tersalin!' : 'Salin' }}</span>
              </button>
            </div>
          </div>

          <div class="account-owner-info text-secondary small lh-sm">
            <div class="fw-bold text-dark">a.n. Arif PERMANA PUTRASURYANA</div>
          </div>
        </div>
      </div>

      <!-- 4. GoPay -->
      <div class="col-12 col-md-6">
        <div class="bank-card p-3.5 p-md-4 rounded-4 border border-slate-200 bg-white h-100 position-relative transition-all shadow-xs">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div class="d-flex align-items-center gap-2">
              <span class="color-dot bg-green"></span>
              <h5 class="fw-bold text-dark mb-0">GoPay</h5>
            </div>
            <span class="badge bg-green text-white px-2.5 py-1 rounded-pill small fw-bold">
              E-Wallet
            </span>
          </div>

          <div class="mb-3">
            <div class="d-flex align-items-center justify-content-between">
              <div class="display-digits fw-black text-dark font-monospace" style="font-size: 1.45rem; letter-spacing: 1px;">
                0895343226354
              </div>
              <button 
                class="btn btn-sm btn-outline-success rounded-pill px-3 fw-bold d-flex align-items-center gap-1 shadow-xs"
                @click="copyText('0895343226354', 'Nomor GoPay', '0895343226354_gopay')"
                title="Salin Nomor GoPay"
              >
                <i :class="copiedKey === '0895343226354_gopay' ? 'bi bi-check-lg text-success' : 'bi bi-clipboard'"></i>
                <span>{{ copiedKey === '0895343226354_gopay' ? 'Tersalin!' : 'Salin' }}</span>
              </button>
            </div>
          </div>

          <div class="account-owner-info text-secondary small lh-sm">
            <div class="fw-bold text-dark">a.n. GP-0895343226354 (Arif PERMANA PUTRASURYANA)</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Thank You Notice Box -->
    <div class="thank-you-box p-3.5 rounded-4 border bg-amber-light mb-3">
      <div class="d-flex align-items-start gap-2.5">
        <span class="fs-4 lh-1">🙏</span>
        <div>
          <h6 class="fw-extrabold text-amber-dark mb-1">Terima Kasih</h6>
          <p class="small text-amber-dark fw-bold mb-0 text-uppercase" style="letter-spacing: 0.3px; font-size: 11.5px;">
            SIMPAN CARD INI DENGAN CARA SCREENSHOT JIKA SUATU SAAT NANTI DIBUTUHKAN
          </p>
        </div>
      </div>
    </div>

    <!-- Interactive Actions Bar -->
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-2 border-top">
      <div class="d-flex flex-wrap gap-2">
        <button 
          class="btn btn-sm btn-dark rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5 shadow-xs"
          @click="copyAllBankInfo"
        >
          <i class="bi bi-clipboard-check-fill text-warning"></i>
          <span>Salin Semua Alamat Bank</span>
        </button>

        <a 
          :href="whatsappConfirmUrl" 
          target="_blank" 
          class="btn btn-sm btn-success rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5 shadow-xs"
        >
          <i class="bi bi-whatsapp"></i>
          <span>Konfirmasi Dukungan via WA</span>
        </a>
      </div>

      <a 
        href="https://trakteer.id/itsmebroarif/tip?open=true" 
        target="_blank" 
        class="btn btn-sm btn-outline-danger rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5 shadow-xs"
      >
        <i class="bi bi-cup-hot-fill text-danger"></i>
        <span>Trakteer Online</span>
      </a>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import Swal from 'sweetalert2';

export default {
  name: 'BankAddressCards',
  setup() {
    const copiedKey = ref(null);

    const copyText = (text, label, keyOverride = null) => {
      const key = keyOverride || text;
      navigator.clipboard.writeText(text).then(() => {
        copiedKey.value = key;
        setTimeout(() => {
          if (copiedKey.value === key) {
            copiedKey.value = null;
          }
        }, 2200);

        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });

        Toast.fire({
          icon: 'success',
          title: `${label} berhasil disalin!`,
          text: text
        });
      }).catch(() => {
        // fallback
        prompt('Salin teks secara manual:', text);
      });
    };

    const copyAllBankInfo = () => {
      const fullText = `💝 BANK ADDRESS & DUKUNG DEV (ARIF PERMANA PUTRASURYANA)
----------------------------------------
1. Bank BSI (Bank Transfer)
   No. Rekening: 7367026237
   a.n. ARIF PERMANA PUTRASURYAN (ARIF PERMANA PUTRASURYANA)

2. OVO (E-Wallet)
   No. HP: 0895343226354
   a.n. Arif PERMANA PUTRASURYANA

3. DANA (E-Wallet)
   No. HP: 0895343226354
   a.n. Arif PERMANA PUTRASURYANA

4. GoPay (E-Wallet)
   No. HP: 0895343226354
   a.n. GP-0895343226354 (Arif PERMANA PUTRASURYANA)
----------------------------------------
Terima kasih atas apresiasi dan dukungannya untuk pengembang TaskArts!`;

      navigator.clipboard.writeText(fullText).then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Semua Rekening Berhasil Disalin!',
          text: 'Rincian rekening BSI, OVO, DANA, dan GoPay telah disalin ke clipboard.',
          timer: 2500,
          showConfirmButton: false
        });
      });
    };

    const whatsappConfirmUrl = computed(() => {
      const msg = `Halo Mas Arif (Developer TaskArts), saya ingin konfirmasi bahwa saya telah mengirimkan dukungan donasi via Bank / E-Wallet. Terima kasih atas aplikasi hebat ini! 🙏`;
      return `https://wa.me/62895343226354?text=${encodeURIComponent(msg)}`;
    });

    return {
      copiedKey,
      copyText,
      copyAllBankInfo,
      whatsappConfirmUrl
    };
  }
};
</script>

<style scoped>
.fw-black {
  font-weight: 900;
}

.shadow-xs {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.border-emerald {
  border: 1.8px solid #10b981 !important;
}

.text-emerald {
  color: #059669 !important;
}

.bg-emerald-badge {
  background-color: #10b981 !important;
}

.bg-dark-slate {
  background-color: #1e293b !important;
}

.color-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-block;
}

.bg-purple {
  background-color: #7c3aed !important;
}

.bg-blue {
  background-color: #0284c7 !important;
}

.bg-green {
  background-color: #16a34a !important;
}

.bg-amber-light {
  background-color: #fefce8 !important;
  border-color: #fef08a !important;
}

.text-amber-dark {
  color: #854d0e !important;
}

.bank-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.bank-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08) !important;
}

.display-digits {
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}
</style>
