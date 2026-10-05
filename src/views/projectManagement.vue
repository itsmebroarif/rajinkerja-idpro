<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- Header Banner -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="badge bg-info-subtle text-info fw-semibold px-3 py-1.5 rounded-pill">Projects & Workflows</span>
          <span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 fw-bold px-2.5 py-1.5 rounded-pill small">By Kafeinarts</span>
        </div>
        <h2 class="fw-bold mb-1 text-dark">Project Workspace</h2>
        <p class="text-muted mb-0">Pantau progres pengerjaan proyek, nilai kontrak, deadline, dan buat invoice langsung.</p>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-outline-success px-3 py-2 rounded-3 fw-semibold" @click="exportToExcel">
          <i class="bi bi-file-earmark-excel-fill me-1 text-success"></i> Export Excel
        </button>
        <button
          class="btn btn-primary px-4 py-2 rounded-3 fw-semibold d-flex align-items-center gap-2 shadow-sm"
          @click="toggleShowForm"
        >
          <i :class="showForm ? 'bi bi-x-lg' : 'bi bi-folder-plus'" class="fs-5"></i>
          <span>{{ showForm ? 'Tutup Form' : 'Tambah / Bulk Proyek' }}</span>
        </button>
      </div>
    </div>

    <!-- Inline Form Panel (Single / Bulk Input) -->
    <div v-if="showForm" class="card border-0 shadow-lg rounded-4 mb-4 bg-white border-start border-4 border-primary">
      <div class="card-header bg-transparent border-bottom p-4 d-flex justify-content-between align-items-center">
        <div class="btn-group" role="group">
          <button
            class="btn btn-sm px-3 py-1 fw-semibold"
            :class="formTab === 'single' ? 'btn-primary' : 'btn-outline-primary'"
            @click="formTab = 'single'"
          >
            <i class="bi bi-pencil-square me-1"></i> Input Tunggal {{ isEditing ? '(Edit)' : '' }}
          </button>
          <button
            v-if="!isEditing"
            class="btn btn-sm px-3 py-1 fw-semibold"
            :class="formTab === 'bulk' ? 'btn-primary' : 'btn-outline-primary'"
            @click="formTab = 'bulk'"
          >
            <i class="bi bi-stack me-1"></i> Bulk Input (Banyak Proyek)
          </button>
        </div>
        <button type="button" class="btn-close" @click="showForm = false"></button>
      </div>

      <div class="card-body p-4">
        <!-- SINGLE FORM -->
        <form v-if="formTab === 'single'" @submit.prevent="saveProject">
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label fw-semibold">Judul Proyek <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control"
                :class="{ 'is-invalid': formErrors.projectTitle }"
                v-model="form.projectTitle"
                placeholder="Contoh: Redesign E-Commerce UI/UX"
              />
              <div class="invalid-feedback" v-if="formErrors.projectTitle">{{ formErrors.projectTitle }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Nama Klien / Perusahaan</label>
              <input type="text" class="form-control" v-model="form.clientName" placeholder="Contoh: PT Teknologi Nusantara" />
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Nilai Kontrak (Rp)</label>
              <input
                type="number"
                class="form-control"
                :class="{ 'is-invalid': formErrors.rate }"
                v-model.number="form.rate"
                placeholder="15000000"
              />
              <div class="invalid-feedback" v-if="formErrors.rate">{{ formErrors.rate }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Target Deadline <span class="text-danger">*</span></label>
              <input
                type="date"
                class="form-control"
                :class="{ 'is-invalid': formErrors.deadline }"
                v-model="form.deadline"
              />
              <div class="invalid-feedback" v-if="formErrors.deadline">{{ formErrors.deadline }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Status Proyek</label>
              <select class="form-select" v-model="form.status">
                <option value="In Progress">In Progress (Berjalan)</option>
                <option value="Backlog">Backlog / Antrean</option>
                <option value="On Hold">On Hold (Ditahan)</option>
                <option value="Completed">Completed (Selesai)</option>
              </select>
            </div>

            <div class="col-12">
              <label class="form-label fw-semibold">Persentase Progres (%)</label>
              <input type="range" class="form-range" min="0" max="100" v-model.number="form.progress" />
              <div class="text-center fw-bold text-primary">{{ form.progress }}% Selesai</div>
            </div>

            <div class="col-12">
              <label class="form-label fw-semibold">Deskripsi / Ruang Lingkup Proyek</label>
              <textarea class="form-control" rows="2" v-model="form.description" placeholder="Penjelasan milestone & requirement..."></textarea>
            </div>

            <div class="col-12 text-end pt-3 border-top">
              <button type="button" class="btn btn-light px-4 me-2 rounded-3" @click="showForm = false">Batal</button>
              <button type="submit" class="btn btn-primary px-4 rounded-3 fw-semibold">
                {{ isEditing ? 'Simpan Perubahan' : 'Tambah Proyek' }}
              </button>
            </div>
          </div>
        </form>

        <!-- BULK FORM -->
        <form v-else @submit.prevent="saveBulkProjects">
          <div class="row g-3">
            <div class="col-12">
              <div class="alert alert-info py-2 small mb-2">
                Format per baris: <strong>Judul Proyek, Nama Klien, Nilai Kontrak (Nomor)</strong> (Atau tulis judul saja per baris).
              </div>
              <label class="form-label fw-semibold">Daftar Proyek (Satu per baris) <span class="text-danger">*</span></label>
              <textarea
                class="form-control font-monospace"
                rows="5"
                placeholder="Redesign Web E-Commerce, PT Teknologi Nusantara, 15000000&#10;Vue 3 Dashboard Component, Global Tech, 18000000"
                v-model="bulkText"
                :class="{ 'is-invalid': bulkError }"
              ></textarea>
              <div class="invalid-feedback" v-if="bulkError">{{ bulkError }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Deadline Default</label>
              <input type="date" class="form-control" v-model="bulkDefault.deadline" />
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Status Default</label>
              <select class="form-select" v-model="bulkDefault.status">
                <option value="In Progress">In Progress</option>
                <option value="Backlog">Backlog</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div class="col-12 text-end pt-3 border-top">
              <button type="button" class="btn btn-light px-4 me-2 rounded-3" @click="showForm = false">Batal</button>
              <button type="submit" class="btn btn-success px-4 rounded-3 fw-semibold">
                Simpan Semua Proyek (Bulk)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="card border-0 shadow-sm rounded-4 mb-4 bg-white">
      <div class="card-body p-3">
        <div class="row g-2 align-items-center">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control bg-light border-start-0 py-2" placeholder="Cari judul proyek atau nama klien..." v-model="searchQuery" />
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select bg-light py-2" v-model="filterStatus">
              <option value="">Semua Status Proyek</option>
              <option value="In Progress">In Progress (Berjalan)</option>
              <option value="Backlog">Backlog / Antrean</option>
              <option value="On Hold">On Hold (Ditahan)</option>
              <option value="Completed">Completed (Selesai)</option>
            </select>
          </div>
          <div class="col-md-3 text-end">
            <button class="btn btn-outline-secondary w-100 py-2 rounded-3" @click="resetFilters">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Reset Filter
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Action Toolbar -->
    <div v-if="selectedIds.length > 0" class="alert alert-primary d-flex justify-content-between align-items-center rounded-4 shadow-sm mb-4 py-2 px-3">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-check2-square fs-5"></i>
        <span class="fw-bold">{{ selectedIds.length }} proyek terpilih</span>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-danger rounded-pill px-3" @click="bulkDelete">
          <i class="bi bi-trash-fill me-1"></i> Hapus Terpilih
        </button>
        <button class="btn btn-sm btn-light rounded-pill px-3" @click="selectedIds = []">
          Batal Pilih
        </button>
      </div>
    </div>

    <!-- Projects Grid -->
    <div class="row g-3 mb-4" v-if="filteredProjects.length > 0">
      <div v-for="p in filteredProjects" :key="p.id" class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-white hover-card p-4 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div class="d-flex align-items-center gap-2">
                <input type="checkbox" class="form-check-input" :value="p.id" v-model="selectedIds" />
                <span :class="getStatusClass(p.status)" class="badge px-3 py-1 rounded-pill small">
                  {{ p.status || 'In Progress' }}
                </span>
              </div>
              <span class="fw-bold text-success">{{ formatCurrency(p.rate) }}</span>
            </div>

            <h5 class="fw-bold text-dark mb-1">{{ p.projectTitle }}</h5>
            <small class="text-primary fw-semibold d-block mb-3">
              <i class="bi bi-person-badge me-1"></i>{{ p.clientName || 'Klien Umum' }}
            </small>

            <p class="small text-muted mb-3" v-if="p.description">{{ p.description }}</p>

            <!-- Progress Bar -->
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center small mb-1">
                <span class="text-muted fw-semibold">Progres Pengerjaan</span>
                <span class="fw-bold text-dark">{{ p.progress || 0 }}%</span>
              </div>
              <div class="progress rounded-pill" style="height: 8px;">
                <div class="progress-bar bg-primary" :style="{ width: (p.progress || 0) + '%' }"></div>
              </div>
            </div>

            <div class="small text-secondary mb-2">
              <i class="bi bi-calendar-event me-1 text-danger"></i>
              Target Deadline: <strong>{{ formatDate(p.deadline) }}</strong>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="pt-3 border-top d-flex justify-content-between align-items-center">
            <button class="btn btn-sm btn-outline-primary rounded-pill px-3" @click="createInvoiceForProject(p)">
              <i class="bi bi-receipt me-1"></i> Buat Invoice
            </button>

            <div class="d-flex gap-1">
              <button class="btn btn-sm btn-light text-primary rounded-circle" @click="editProject(p)" title="Edit">
                <i class="bi bi-pencil-fill"></i>
              </button>
              <button class="btn btn-sm btn-light text-danger rounded-circle" @click="deleteProject(p.id)" title="Hapus">
                <i class="bi bi-trash-fill"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-5 bg-white rounded-4 shadow-sm border my-4">
      <i class="bi bi-folder-x display-1 text-muted opacity-50"></i>
      <h4 class="fw-bold mt-3 text-dark">Tidak Ada Proyek Ditemukan</h4>
      <p class="text-muted">Mulai tambahkan proyek freelance Anda untuk memantau progres dan nilai kontrak.</p>
      <button class="btn btn-primary rounded-3 px-4 py-2 mt-2" @click="openAddModal">
        <i class="bi bi-folder-plus me-1"></i> Tambah Proyek Sekarang
      </button>
    </div>

    <!-- Toast Notification -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1090;">
      <div v-if="toast.show" class="toast align-items-center text-white bg-success border-0 show shadow-lg rounded-3" role="alert">
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i class="bi bi-check-circle-fill fs-5"></i>
            <span>{{ toast.message }}</span>
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="toast.show = false"></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

export default {
  name: 'ProjectManagement',
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();

    const searchQuery = ref('');
    const filterStatus = ref('');
    const showForm = ref(false);
    const formTab = ref('single');
    const isEditing = ref(false);
    const editingId = ref(null);
    const selectedIds = ref([]);

    const toast = ref({ show: false, message: '' });

    const form = ref({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      projectTitle: '',
      deadline: new Date().toISOString().split('T')[0],
      rate: 0,
      status: 'In Progress',
      progress: 0,
      description: ''
    });

    const formErrors = ref({});
    const bulkText = ref('');
    const bulkError = ref('');
    const bulkDefault = ref({
      deadline: new Date().toISOString().split('T')[0],
      status: 'In Progress'
    });

    const projects = computed(() => store.getters.getProjects);

    const filteredProjects = computed(() => {
      return projects.value.filter(p => {
        const query = searchQuery.value.toLowerCase();
        const matchesQuery =
          !query ||
          p.projectTitle.toLowerCase().includes(query) ||
          (p.clientName && p.clientName.toLowerCase().includes(query));

        const matchesStatus = !filterStatus.value || p.status === filterStatus.value;

        return matchesQuery && matchesStatus;
      });
    });

    const showToastMsg = (msg) => {
      toast.value.message = msg;
      toast.value.show = true;
      setTimeout(() => (toast.value.show = false), 3000);
    };

    onMounted(() => {
      if (route.query.clientName) {
        openAddModal();
        form.value.clientName = route.query.clientName || '';
        form.value.clientEmail = route.query.clientEmail || '';
        form.value.clientPhone = route.query.clientPhone || '';
      }
    });

    const toggleShowForm = () => {
      if (showForm.value) {
        showForm.value = false;
      } else {
        openAddModal();
      }
    };

    const openAddModal = () => {
      isEditing.value = false;
      editingId.value = null;
      formErrors.value = {};
      form.value = {
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        projectTitle: '',
        deadline: new Date().toISOString().split('T')[0],
        rate: 0,
        status: 'In Progress',
        progress: 0,
        description: ''
      };
      formTab.value = 'single';
      showForm.value = true;
    };

    const editProject = (p) => {
      isEditing.value = true;
      editingId.value = p.id;
      formErrors.value = {};
      form.value = { ...p };
      formTab.value = 'single';
      showForm.value = true;
    };

    const saveProject = () => {
      formErrors.value = {};
      if (!form.value.projectTitle || !form.value.projectTitle.trim()) {
        formErrors.value.projectTitle = 'Judul proyek wajib diisi!';
        return;
      }
      if (!form.value.deadline) {
        formErrors.value.deadline = 'Target deadline wajib diisi!';
        return;
      }
      if (form.value.rate < 0) {
        formErrors.value.rate = 'Nilai kontrak tidak boleh negatif!';
        return;
      }

      if (isEditing.value) {
        store.dispatch('updateProject', { ...form.value, id: editingId.value });
        showToastMsg('Proyek berhasil diperbarui!');
      } else {
        store.dispatch('addProject', form.value);
        showToastMsg('Proyek baru berhasil ditambahkan!');
      }
      showForm.value = false;
    };

    const saveBulkProjects = () => {
      bulkError.value = '';
      if (!bulkText.value || !bulkText.value.trim()) {
        bulkError.value = 'Tuliskan minimal 1 judul proyek!';
        return;
      }

      const lines = bulkText.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const listToAdd = lines.map(line => {
        const parts = line.split(',').map(p => p.trim());
        return {
          projectTitle: parts[0] || 'Proyek Baru',
          clientName: parts[1] || 'Klien Umum',
          rate: Number(parts[2]) || 0,
          deadline: bulkDefault.value.deadline,
          status: bulkDefault.value.status,
          progress: 0,
          description: ''
        };
      });

      store.dispatch('addProjectsBulk', listToAdd);
      showToastMsg(`Berhasil menambahkan ${listToAdd.length} proyek secara bulk!`);
      bulkText.value = '';
      showForm.value = false;
    };

    const deleteProject = (id) => {
      Swal.fire({
        title: 'Hapus Proyek?',
        text: 'Apakah Anda yakin ingin menghapus proyek ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          store.dispatch('deleteProject', id);
          showToastMsg('Proyek dihapus.');
        }
      });
    };

    const bulkDelete = () => {
      if (selectedIds.value.length === 0) return;
      Swal.fire({
        title: 'Hapus Masal Proyek?',
        text: `Hapus ${selectedIds.value.length} proyek terpilih?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Hapus Semua',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          store.dispatch('deleteProjectsBulk', selectedIds.value);
          showToastMsg(`${selectedIds.value.length} proyek berhasil dihapus.`);
          selectedIds.value = [];
        }
      });
    };

    const createInvoiceForProject = (p) => {
      router.push({
        path: '/invoices',
        query: {
          clientName: p.clientName,
          clientEmail: p.clientEmail,
          projectTitle: p.projectTitle,
          amount: p.rate
        }
      });
    };

    const resetFilters = () => {
      searchQuery.value = '';
      filterStatus.value = '';
    };

    const getStatusClass = (status) => {
      switch (status) {
        case 'Completed':
          return 'bg-success text-white';
        case 'In Progress':
          return 'bg-primary text-white';
        case 'On Hold':
          return 'bg-warning text-dark';
        case 'Backlog':
          return 'bg-secondary text-white';
        default:
          return 'bg-light text-dark border';
      }
    };

    const formatCurrency = (amount) => {
      if (!amount) return 'Rp 0';
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '-';
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      } catch (e) {
        return dateStr;
      }
    };

    const exportToExcel = () => {
      const exportData = projects.value.map((p, idx) => ({
        No: idx + 1,
        JudulProyek: p.projectTitle,
        NamaKlien: p.clientName || 'Klien Umum',
        NilaiKontrak: p.rate || 0,
        Status: p.status || 'In Progress',
        ProgresPercent: (p.progress || 0) + '%',
        Deadline: p.deadline,
        Deskripsi: p.description || '-'
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Proyek');
      XLSX.writeFile(workbook, 'daftar_proyek_freelance.xlsx');
      showToastMsg('File Excel daftar proyek berhasil diunduh!');
    };

    return {
      searchQuery,
      filterStatus,
      showForm,
      formTab,
      isEditing,
      form,
      formErrors,
      bulkText,
      bulkError,
      bulkDefault,
      selectedIds,
      projects,
      filteredProjects,
      toast,
      toggleShowForm,
      openAddModal,
      editProject,
      saveProject,
      saveBulkProjects,
      deleteProject,
      bulkDelete,
      createInvoiceForProject,
      resetFilters,
      getStatusClass,
      formatCurrency,
      formatDate,
      exportToExcel
    };
  }
};
</script>

<style scoped>
.hover-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.hover-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08) !important;
}
</style>
