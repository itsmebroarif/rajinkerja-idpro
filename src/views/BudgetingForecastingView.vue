<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- Top Shared Header Navigation -->
    <FinanceNavHeader
      title="4. Penganggaran & Perencanaan (Budgeting & Forecasting)"
      subtitle="Tetapkan batas anggaran (budget limit) per departemen dengan sistem peringatan otomatis (threshold alerts) dan proyeksi tren arus kas masa depan."
    />

    <!-- Main Navigation Sub-tabs -->
    <div class="card border-0 shadow-sm rounded-4 bg-white mb-4 p-2 no-print">
      <ul class="nav nav-pills nav-fill gap-2" role="tablist">
        <li class="nav-item">
          <button
            class="nav-link rounded-3 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2"
            :class="{ active: activeTab === 'budget' }"
            @click="activeTab = 'budget'"
          >
            <i class="bi bi-pie-chart-fill"></i>
            <span>Alokasi Anggaran per Departemen</span>
            <span class="badge bg-danger text-white rounded-pill small" v-if="overBudgetCount > 0">
              {{ overBudgetCount }} Over Budget
            </span>
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link rounded-3 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2"
            :class="{ active: activeTab === 'forecasting' }"
            @click="activeTab = 'forecasting'"
          >
            <i class="bi bi-graph-up-arrow"></i>
            <span>Proyeksi Keuangan & Tren (Forecasting)</span>
          </button>
        </li>
      </ul>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 1: ALOKASI ANGGARAN PER DEPARTEMEN                                    -->
    <!-- ========================================================================= -->
    <div v-show="activeTab === 'budget'">
      <!-- Metrik Anggaran -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-primary">
            <span class="text-muted small fw-semibold">Total Pagu Anggaran (Ceiling)</span>
            <h4 class="fw-bold mb-1 text-dark">{{ formatRupiah(totalBudgetCumulative) }}</h4>
            <div class="small text-muted">{{ budgetsList.length }} Departemen Terdaftar</div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-info">
            <span class="text-muted small fw-semibold">Realisasi Penyerapan Anggaran</span>
            <h4 class="fw-bold mb-1 text-dark">{{ formatRupiah(totalSpentCumulative) }}</h4>
            <div class="small text-muted">Rata-rata Penyerapan: <strong>{{ overallAbsorptionRate }}%</strong></div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-warning">
            <span class="text-muted small fw-semibold">Peringatan Ambang Batas (Alert)</span>
            <h4 class="fw-bold mb-1 text-warning">{{ thresholdWarningCount }} Departemen</h4>
            <div class="small text-warning"><i class="bi bi-exclamation-triangle-fill me-1"></i>Penyerapan &gt; 80%</div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-4 border-success">
            <span class="text-muted small fw-semibold">Sisa Cadangan Anggaran</span>
            <h4 class="fw-bold mb-1 text-success">{{ formatRupiah(remainingBudgetCumulative) }}</h4>
            <div class="small text-success"><i class="bi bi-shield-check me-1"></i>Aman Hingga Akhir Periode</div>
          </div>
        </div>
      </div>

      <!-- Action Toolbar -->
      <div class="card border-0 shadow-sm rounded-4 bg-white p-3 mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h6 class="fw-bold text-dark mb-0">Pengaturan Plafon & Ambang Peringatan Departemen</h6>
            <div class="small text-muted">Sistem otomatis memicu peringatan saat pengeluaran mendekati atau melampaui batas.</div>
          </div>

          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-primary btn-sm px-3 rounded-pill fw-semibold shadow-xs" @click="openAddBudgetModal">
              <i class="bi bi-plus-circle-fill me-1"></i> Tetapkan Alokasi Anggaran
            </button>
            <button class="btn btn-outline-success btn-sm px-3 rounded-pill fw-semibold" @click="exportBudgetExcel">
              <i class="bi bi-file-earmark-excel-fill text-success me-1"></i> Ekspor Anggaran
            </button>
          </div>
        </div>
      </div>

      <!-- Budgets Progress Grid -->
      <div class="row g-3 mb-4">
        <div v-for="b in budgetsList" :key="b.id" class="col-12 col-lg-6">
          <div class="card border-0 shadow-sm rounded-4 bg-white p-4 h-100 border-top border-4" :class="getBudgetBorderClass(b)">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span class="badge bg-light text-secondary border mb-1">{{ b.period }}</span>
                <h5 class="fw-bold text-dark mb-0">{{ b.department }}</h5>
                <div class="small text-muted" v-if="b.notes">{{ b.notes }}</div>
              </div>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-secondary" @click="editBudget(b)" title="Edit Anggaran">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-outline-danger" @click="deleteBudget(b.id)" title="Hapus">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>

            <!-- Spending Progress Bar -->
            <div class="my-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="small fw-semibold text-muted">Tingkat Penyerapan:</span>
                <span class="fw-bold small" :class="getBudgetProgressTextClass(b)">
                  {{ getPercent(b) }}% Terpakai (Ambang Peringatan: {{ b.alertThresholdPercent }}%)
                </span>
              </div>
              <div class="progress rounded-pill" style="height: 10px;">
                <div
                  class="progress-bar rounded-pill"
                  :class="getBudgetProgressBarClass(b)"
                  :style="{ width: Math.min(getPercent(b), 100) + '%' }"
                ></div>
              </div>
            </div>

            <!-- Financial Values Detail -->
            <div class="row g-2 pt-2 border-top">
              <div class="col-6">
                <div class="small text-muted">Plafon Anggaran:</div>
                <div class="fw-bold text-dark">{{ formatRupiah(b.budgetCeiling) }}</div>
              </div>
              <div class="col-6 text-end">
                <div class="small text-muted">Realisasi Pengeluaran:</div>
                <div class="fw-bold text-danger">{{ formatRupiah(b.spentAmount) }}</div>
              </div>
            </div>

            <!-- Alert Notification Status -->
            <div class="mt-3 p-2 rounded-3 small d-flex align-items-center justify-content-between" :class="getBudgetAlertBgClass(b)">
              <div class="d-flex align-items-center gap-1.5">
                <i :class="getBudgetAlertIconClass(b)"></i>
                <span class="fw-semibold">{{ getBudgetAlertMessage(b) }}</span>
              </div>
              <span v-if="b.notifyHead" class="badge bg-white text-dark border" style="font-size: 11px;">
                <i class="bi bi-envelope me-1"></i> Auto-Email Aktif
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 2: PROYEKSI KEUANGAN (FINANCIAL FORECASTING)                           -->
    <!-- ========================================================================= -->
    <div v-show="activeTab === 'forecasting'">
      <!-- Forecast Configuration Panel -->
      <div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-bottom pb-3 mb-3">
          <div>
            <h5 class="fw-bold text-dark mb-1">
              <i class="bi bi-graph-up-arrow text-primary me-1"></i> Model Proyeksi Arus Kas & Skenario Bisnis
            </h5>
            <p class="text-muted small mb-0">
              Analisis prediktif menggunakan data tren historis untuk memperkirakan posisi likuiditas 6 bulan ke depan guna mengantisipasi defisit atau merencanakan investasi modal.
            </p>
          </div>
          <button class="btn btn-outline-primary btn-sm rounded-pill px-3" @click="saveForecastSettings">
            <i class="bi bi-save me-1"></i> Simpan Parameter Model
          </button>
        </div>

        <!-- Forecasting Parameters Form (CRUD) -->
        <div class="row g-3 p-3 bg-light bg-opacity-50 rounded-4 border mb-4">
          <div class="col-md-3">
            <label class="form-label small fw-bold text-dark">Target Pertumbuhan Pemasukan (% / Bulan)</label>
            <div class="input-group input-group-sm">
              <input type="number" class="form-control" v-model.number="forecastConfig.projectedMonthlyGrowthRate" step="0.5" />
              <span class="input-group-text bg-white">%</span>
            </div>
          </div>

          <div class="col-md-3">
            <label class="form-label small fw-bold text-dark">Estimasi Inflasi Biaya OPEX (% / Bulan)</label>
            <div class="input-group input-group-sm">
              <input type="number" class="form-control" v-model.number="forecastConfig.projectedMonthlyInflationCost" step="0.5" />
              <span class="input-group-text bg-white">%</span>
            </div>
          </div>

          <div class="col-md-3">
            <label class="form-label small fw-bold text-dark">Pilihan Skenario Proyeksi</label>
            <div class="d-flex gap-2 mt-1">
              <div class="form-check">
                <input class="form-check-input" type="radio" id="scenOpt" value="Optimis" v-model="forecastConfig.scenario" />
                <label class="form-check-label small" for="scenOpt">Optimis</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" id="scenReal" value="Realistis" v-model="forecastConfig.scenario" />
                <label class="form-check-label small fw-bold text-primary" for="scenReal">Realistis</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" id="scenKons" value="Konservatif" v-model="forecastConfig.scenario" />
                <label class="form-check-label small" for="scenKons">Konservatif</label>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <label class="form-label small fw-bold text-dark">Rencana Belanja Modal (Capex)</label>
            <div class="form-check mb-1">
              <input class="form-check-input" type="checkbox" id="checkCapex" v-model="forecastConfig.includeCapex" />
              <label class="form-check-label small" for="checkCapex">Sertakan Capex Investasi</label>
            </div>
            <input
              type="number"
              class="form-control form-control-sm"
              v-model.number="forecastConfig.capexAmount"
              :disabled="!forecastConfig.includeCapex"
              placeholder="35000000"
            />
          </div>
        </div>

        <!-- 6-Month Projected Cash Flow Table -->
        <h6 class="fw-bold text-dark mb-3">Tabel Hasil Proyeksi Arus Kas 6 Bulan ke Depan</h6>
        <div class="table-responsive">
          <table class="table table-bordered table-hover align-middle mb-0">
            <thead class="table-light text-muted small text-uppercase">
              <tr>
                <th>Bulan Proyeksi</th>
                <th class="text-end">Proyeksi Pemasukan (Inflow)</th>
                <th class="text-end">Proyeksi Beban Operasional</th>
                <th class="text-end">Alokasi Capex Investasi</th>
                <th class="text-end">Net Arus Kas Bulanan</th>
                <th class="text-end">Estimasi Saldo Kas Akhir</th>
                <th>Status Likuiditas</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in projectedMonths" :key="row.monthName">
                <td class="fw-bold text-dark">{{ row.monthName }}</td>
                <td class="text-end text-success fw-semibold">{{ formatRupiah(row.projectedInflow) }}</td>
                <td class="text-end text-danger fw-semibold">{{ formatRupiah(row.projectedOutflow) }}</td>
                <td class="text-end text-muted">{{ formatRupiah(row.capex) }}</td>
                <td class="text-end fw-bold" :class="row.netCashFlow >= 0 ? 'text-primary' : 'text-danger'">
                  {{ row.netCashFlow >= 0 ? '+' : '' }}{{ formatRupiah(row.netCashFlow) }}
                </td>
                <td class="text-end fw-bold text-dark">{{ formatRupiah(row.endingCash) }}</td>
                <td>
                  <span class="badge bg-success-subtle text-success border border-success border-opacity-25 rounded-pill px-2.5 py-1" v-if="row.endingCash > 300000000">
                    <i class="bi bi-shield-check me-1"></i> Sangat Surplus
                  </span>
                  <span class="badge bg-warning-subtle text-warning border border-warning border-opacity-25 rounded-pill px-2.5 py-1" v-else-if="row.endingCash > 100000000">
                    <i class="bi bi-check-circle me-1"></i> Stabil
                  </span>
                  <span class="badge bg-danger text-white rounded-pill px-2.5 py-1" v-else>
                    <i class="bi bi-exclamation-triangle me-1"></i> Waspada Defisit
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL: FORM ALOKASI ANGGARAN (CRUD)                                       -->
    <!-- ========================================================================= -->
    <div class="modal fade" id="modalBudget" tabindex="-1" aria-hidden="true" ref="modalBudgetRef">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header border-bottom px-4 py-3">
            <h5 class="modal-title fw-bold text-dark">
              <i class="bi bi-sliders text-primary me-1"></i>
              {{ isEditingBudget ? 'Edit Alokasi Anggaran Departemen' : 'Tetapkan Alokasi Anggaran Departemen Baru' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="saveBudget">
            <div class="modal-body p-4">
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Nama Departemen / Divisi <span class="text-danger">*</span></label>
                  <select class="form-select" v-model="formBudget.department" required>
                    <option value="" disabled>Pilih Departemen...</option>
                    <option value="Teknologi & Produk (IT)">Teknologi & Produk (IT)</option>
                    <option value="Penjualan & Pemasaran (Sales/Mkt)">Penjualan & Pemasaran (Sales/Mkt)</option>
                    <option value="Operasional & General Affairs (GA)">Operasional & General Affairs (GA)</option>
                    <option value="Sumber Daya Manusia (HRD)">Sumber Daya Manusia (HRD)</option>
                    <option value="Keuangan & Legal (Finance)">Keuangan & Legal (Finance)</option>
                    <option value="Riset & Pengembangan (R&D)">Riset & Pengembangan (R&D)</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Periode Anggaran <span class="text-danger">*</span></label>
                  <select class="form-select" v-model="formBudget.period" required>
                    <option value="Q3 2026">Kuartal III 2026 (Q3)</option>
                    <option value="Q4 2026">Kuartal IV 2026 (Q4)</option>
                    <option value="Tahunan 2026">Tahun Penuh 2026</option>
                    <option value="Tahunan 2027">Tahun Penuh 2027</option>
                  </select>
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Batas Plafon Anggaran (IDR) <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text bg-light fw-bold">Rp</span>
                    <input type="number" class="form-control" v-model.number="formBudget.budgetCeiling" min="1000000" step="500000" placeholder="Contoh: 100000000" required />
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Realisasi Terpakai Saat Ini (IDR)</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light fw-bold">Rp</span>
                    <input type="number" class="form-control" v-model.number="formBudget.spentAmount" min="0" step="500000" placeholder="Contoh: 0" />
                  </div>
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Ambang Peringatan Alert (%) <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <input type="number" class="form-control" v-model.number="formBudget.alertThresholdPercent" min="50" max="99" placeholder="Contoh: 80" required />
                    <span class="input-group-text bg-white">%</span>
                  </div>
                  <div class="form-text small">Peringatan otomatis muncul saat penyerapan mencapai batas ini.</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold small text-dark">Email Kepala Departemen (Head of Dept)</label>
                  <input type="email" class="form-control" v-model.trim="formBudget.headEmail" placeholder="head.dept@perusahaan.com" />
                </div>
              </div>

              <!-- Checkbox Notify -->
              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="checkNotifyHead" v-model="formBudget.notifyHead" />
                <label class="form-check-label small fw-semibold" for="checkNotifyHead">
                  Kirimkan notifikasi peringatan email otomatis ke Kepala Departemen jika pengeluaran &gt;= ambang batas
                </label>
              </div>

              <!-- Textarea Catatan -->
              <div class="mb-2">
                <label class="form-label fw-bold small text-dark">Kebijakan Penggunaan Anggaran & Catatan Divisi</label>
                <textarea class="form-control" rows="2" v-model.trim="formBudget.notes" placeholder="Aturan penyerapan pos biaya dan prioritas..."></textarea>
              </div>
            </div>
            <div class="modal-footer border-top px-4 py-3 bg-light">
              <button type="button" class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Batal</button>
              <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold">Simpan Anggaran</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import FinanceNavHeader from '../components/FinanceNavHeader.vue';

const getBsModal = (el) => {
  if (typeof window !== 'undefined' && window.bootstrap && window.bootstrap.Modal) {
    return window.bootstrap.Modal.getInstance(el) || new window.bootstrap.Modal(el);
  }
  return { show() {}, hide() {} };
};
import {
  STORAGE_KEYS,
  safeGet,
  safeSet,
  formatRupiah,
  logAuditTrail,
  initFinanceSeedData
} from '../utils/financeSystemStore';

export default {
  name: 'BudgetingForecastingView',
  components: {
    FinanceNavHeader
  },
  setup() {
    const activeTab = ref('budget');

    const budgetsList = ref([]);
    const forecastConfig = ref({
      projectedMonthlyGrowthRate: 0,
      projectedMonthlyInflationCost: 0,
      scenario: 'Realistis',
      includeCapex: false,
      capexAmount: 0,
      forecastMonths: 6
    });

    const modalBudgetRef = ref(null);
    let bsModalBudget = null;

    const isEditingBudget = ref(false);
    const editingBudgetId = ref(null);
    const formBudget = ref({
      department: '',
      period: 'Q3 2026',
      budgetCeiling: null,
      spentAmount: null,
      alertThresholdPercent: 80,
      notifyHead: true,
      headEmail: '',
      notes: ''
    });

    const loadData = () => {
      initFinanceSeedData();
      budgetsList.value = safeGet(STORAGE_KEYS.BUDGETS, []);
      forecastConfig.value = safeGet(STORAGE_KEYS.FORECASTS, {
        projectedMonthlyGrowthRate: 0,
        projectedMonthlyInflationCost: 0,
        scenario: 'Realistis',
        includeCapex: false,
        capexAmount: 0,
        forecastMonths: 6
      });
    };

    // Cumulative stats
    const totalBudgetCumulative = computed(() => budgetsList.value.reduce((s, b) => s + Number(b.budgetCeiling || 0), 0));
    const totalSpentCumulative = computed(() => budgetsList.value.reduce((s, b) => s + Number(b.spentAmount || 0), 0));
    const remainingBudgetCumulative = computed(() => totalBudgetCumulative.value - totalSpentCumulative.value);
    const overallAbsorptionRate = computed(() => {
      if (totalBudgetCumulative.value === 0) return 0;
      return Math.round((totalSpentCumulative.value / totalBudgetCumulative.value) * 100);
    });

    const thresholdWarningCount = computed(() => {
      return budgetsList.value.filter(b => {
        const pct = (b.spentAmount / b.budgetCeiling) * 100;
        return pct >= b.alertThresholdPercent && pct < 100;
      }).length;
    });

    const overBudgetCount = computed(() => {
      return budgetsList.value.filter(b => b.spentAmount > b.budgetCeiling).length;
    });

    const getPercent = (b) => {
      if (!b.budgetCeiling) return 0;
      return Math.round((b.spentAmount / b.budgetCeiling) * 100);
    };

    const getBudgetBorderClass = (b) => {
      const pct = getPercent(b);
      if (pct >= 100) return 'border-danger';
      if (pct >= b.alertThresholdPercent) return 'border-warning';
      return 'border-success';
    };

    const getBudgetProgressTextClass = (b) => {
      const pct = getPercent(b);
      if (pct >= 100) return 'text-danger';
      if (pct >= b.alertThresholdPercent) return 'text-warning';
      return 'text-success';
    };

    const getBudgetProgressBarClass = (b) => {
      const pct = getPercent(b);
      if (pct >= 100) return 'bg-danger';
      if (pct >= b.alertThresholdPercent) return 'bg-warning';
      return 'bg-success';
    };

    const getBudgetAlertBgClass = (b) => {
      const pct = getPercent(b);
      if (pct >= 100) return 'bg-danger-subtle text-danger border border-danger border-opacity-25';
      if (pct >= b.alertThresholdPercent) return 'bg-warning-subtle text-warning-emphasis border border-warning border-opacity-25';
      return 'bg-success-subtle text-success border border-success border-opacity-25';
    };

    const getBudgetAlertIconClass = (b) => {
      const pct = getPercent(b);
      if (pct >= 100) return 'bi bi-exclamation-octagon-fill text-danger';
      if (pct >= b.alertThresholdPercent) return 'bi bi-exclamation-triangle-fill text-warning';
      return 'bi bi-check-circle-fill text-success';
    };

    const getBudgetAlertMessage = (b) => {
      const pct = getPercent(b);
      if (pct >= 100) return 'BAHAYA: Realisasi melebihi pagu anggaran!';
      if (pct >= b.alertThresholdPercent) return 'PERINGATAN: Pengeluaran mendekati batas ambang!';
      return 'STATUS AMAN: Penyerapan anggaran berjalan normal.';
    };

    // Modal budget actions
    const openAddBudgetModal = () => {
      isEditingBudget.value = false;
      editingBudgetId.value = null;
      formBudget.value = {
        department: '',
        period: 'Q3 2026',
        budgetCeiling: null,
        spentAmount: null,
        alertThresholdPercent: 80,
        notifyHead: true,
        headEmail: '',
        notes: ''
      };
      if (!bsModalBudget && modalBudgetRef.value) {
        bsModalBudget = getBsModal(modalBudgetRef.value);
      }
      if (bsModalBudget) bsModalBudget.show();
    };

    const editBudget = (b) => {
      isEditingBudget.value = true;
      editingBudgetId.value = b.id;
      formBudget.value = { ...b };
      if (!bsModalBudget && modalBudgetRef.value) {
        bsModalBudget = getBsModal(modalBudgetRef.value);
      }
      if (bsModalBudget) bsModalBudget.show();
    };

    const saveBudget = () => {
      if (!formBudget.value.department || !formBudget.value.budgetCeiling) {
        Swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Semua field wajib harus diisi.' });
        return;
      }
      const list = [...budgetsList.value];
      if (isEditingBudget.value) {
        const idx = list.findIndex(b => b.id === editingBudgetId.value);
        if (idx !== -1) {
          list[idx] = { ...formBudget.value, id: editingBudgetId.value };
          logAuditTrail({
            module: 'Anggaran & Perencanaan',
            action: 'UPDATE',
            details: `Menyesuaikan alokasi anggaran ${formBudget.value.department} (${formatRupiah(formBudget.value.budgetCeiling)})`
          });
        }
      } else {
        const newId = 'BDG-' + Date.now().toString().slice(-4);
        list.unshift({ ...formBudget.value, id: newId });
        logAuditTrail({
          module: 'Anggaran & Perencanaan',
          action: 'CREATE',
          details: `Menetapkan anggaran baru untuk ${formBudget.value.department} senilai ${formatRupiah(formBudget.value.budgetCeiling)}`
        });
      }
      budgetsList.value = list;
      safeSet(STORAGE_KEYS.BUDGETS, list);
      if (bsModalBudget) bsModalBudget.hide();
      Swal.fire({ icon: 'success', title: 'Alokasi Anggaran Disimpan', timer: 1500, showConfirmButton: false });
    };

    const deleteBudget = (id) => {
      Swal.fire({
        title: 'Hapus Alokasi Anggaran?',
        text: 'Departemen ini tidak akan memiliki batas anggaran aktif.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus'
      }).then(res => {
        if (res.isConfirmed) {
          budgetsList.value = budgetsList.value.filter(b => b.id !== id);
          safeSet(STORAGE_KEYS.BUDGETS, budgetsList.value);
          logAuditTrail({ module: 'Anggaran & Perencanaan', action: 'DELETE', details: `Menghapus anggaran ${id}` });
          Swal.fire({ icon: 'success', title: 'Anggaran Dihapus', timer: 1200, showConfirmButton: false });
        }
      });
    };

    // Forecasting projected rows calculation
    const projectedMonths = computed(() => {
      const months = ['Oktober 2026', 'November 2026', 'Desember 2026', 'Januari 2027', 'Februari 2027', 'Maret 2027'];
      let baseInflow = 120000000;
      let baseOutflow = 75000000;
      let runningCash = 412500000; // current cash position

      const growthRate = (forecastConfig.value.projectedMonthlyGrowthRate || 5) / 100;
      const inflationRate = (forecastConfig.value.projectedMonthlyInflationCost || 2.5) / 100;
      const scenarioMultiplier = forecastConfig.value.scenario === 'Optimis' ? 1.15 : (forecastConfig.value.scenario === 'Konservatif' ? 0.85 : 1.0);

      return months.map((m, idx) => {
        const inflow = Math.round(baseInflow * Math.pow(1 + growthRate * scenarioMultiplier, idx + 1));
        const outflow = Math.round(baseOutflow * Math.pow(1 + inflationRate, idx + 1));
        const capex = (forecastConfig.value.includeCapex && idx === 1) ? forecastConfig.value.capexAmount : 0;
        const net = inflow - outflow - capex;
        runningCash += net;

        return {
          monthName: m,
          projectedInflow: inflow,
          projectedOutflow: outflow,
          capex: capex,
          netCashFlow: net,
          endingCash: runningCash
        };
      });
    });

    const saveForecastSettings = () => {
      safeSet(STORAGE_KEYS.FORECASTS, forecastConfig.value);
      logAuditTrail({
        module: 'Forecasting Keuangan',
        action: 'UPDATE_MODEL',
        details: `Memperbarui parameter model forecasting: Skenario ${forecastConfig.value.scenario}, Target Growth +${forecastConfig.value.projectedMonthlyGrowthRate}%`
      });
      Swal.fire({
        icon: 'success',
        title: 'Model Diperbarui',
        text: 'Parameter proyeksi arus kas masa depan berhasil disimpan.',
        timer: 1500,
        showConfirmButton: false
      });
    };

    const exportBudgetExcel = () => {
      const data = budgetsList.value.map(b => ({
        'Departemen': b.department,
        'Periode': b.period,
        'Plafon Anggaran (IDR)': b.budgetCeiling,
        'Realisasi Pengeluaran (IDR)': b.spentAmount,
        'Sisa Anggaran': b.budgetCeiling - b.spentAmount,
        'Persentase Terpakai': `${getPercent(b)}%`,
        'Ambang Peringatan': `${b.alertThresholdPercent}%`,
        'Status Alert': getBudgetAlertMessage(b),
        'Email Kepala Dept': b.headEmail || '-'
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Anggaran Departemen');
      XLSX.writeFile(wb, `Alokasi_Anggaran_Departemen_${new Date().toISOString().substring(0, 10)}.xlsx`);
    };

    onMounted(() => {
      loadData();
    });

    return {
      activeTab,
      budgetsList,
      forecastConfig,
      totalBudgetCumulative,
      totalSpentCumulative,
      remainingBudgetCumulative,
      overallAbsorptionRate,
      thresholdWarningCount,
      overBudgetCount,
      modalBudgetRef,
      formBudget,
      isEditingBudget,
      projectedMonths,
      getPercent,
      getBudgetBorderClass,
      getBudgetProgressTextClass,
      getBudgetProgressBarClass,
      getBudgetAlertBgClass,
      getBudgetAlertIconClass,
      getBudgetAlertMessage,
      openAddBudgetModal,
      editBudget,
      saveBudget,
      deleteBudget,
      saveForecastSettings,
      exportBudgetExcel,
      formatRupiah
    };
  }
};
</script>
