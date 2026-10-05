<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- PAGE 1: MAIN MONTHLY CALENDAR VIEW -->
    <div v-if="pageMode === 'calendar'">
      <!-- Header Banner -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge bg-warning-subtle text-warning-emphasis fw-semibold px-3 py-2 rounded-pill">Agenda & Reminders</span>
          </div>
          <h2 class="fw-bold mb-1 text-dark">📅 Calendar, Timed Events & Reminders</h2>
          <p class="text-muted mb-0">Kelola agenda meeting jam, pengingat, deadline proyek, dan tanggal jatuh tempo invoice.</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-secondary px-3 rounded-3" @click="changeMonth(-1)"><i class="bi bi-chevron-left"></i></button>
          <span class="fw-bold fs-5 text-dark px-2 min-w-160 text-center">{{ monthYearLabel }}</span>
          <button class="btn btn-outline-secondary px-3 rounded-3" @click="changeMonth(1)"><i class="bi bi-chevron-right"></i></button>
          <button class="btn btn-primary px-3 py-2 rounded-3 fw-semibold ms-2" @click="openAddEventForm()">
            <i class="bi bi-calendar-plus me-1"></i> Tambah Event
          </button>
        </div>
      </div>

      <!-- Calendar Legend Bar -->
      <div class="d-flex flex-wrap align-items-center gap-3 bg-white p-3 rounded-4 shadow-sm border mb-3">
        <span class="small fw-bold text-muted me-2">Kategori Event:</span>
        <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1"><i class="bi bi-clock-fill me-1"></i>Timed Event / Meeting</span>
        <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1"><i class="bi bi-check2-square me-1"></i>Deadline Task</span>
        <span class="badge bg-info-subtle text-info-emphasis border border-info-subtle px-2 py-1"><i class="bi bi-folder me-1"></i>Deadline Proyek</span>
        <span class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1"><i class="bi bi-receipt me-1"></i>Jatuh Tempo Invoice</span>
      </div>

      <!-- Calendar Grid -->
      <div class="card border-0 shadow-sm rounded-4 bg-white p-4">
        <!-- Days Header -->
        <div class="calendar-grid-header text-center fw-bold text-muted small mb-2 border-bottom pb-2">
          <div v-for="day in weekDays" :key="day" class="p-1">{{ day }}</div>
        </div>

        <!-- Days Cells -->
        <div class="calendar-grid-body">
          <div
            v-for="(cell, idx) in calendarCells"
            :key="idx"
            class="calendar-cell p-2 border rounded-3 cursor-pointer cell-hover"
            :class="[
              cell.currentMonth ? 'cell-active' : 'cell-inactive opacity-50',
              cell.isToday ? 'border-primary border-2 shadow-sm' : ''
            ]"
            @click="openDayDetail(cell)"
          >
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="small fw-bold" :class="cell.isToday ? 'text-primary fs-6' : (cell.currentMonth ? 'text-dark' : 'text-muted opacity-50')">
                {{ cell.dayNum }}
              </span>
              <span v-if="cell.isToday" class="badge bg-primary style-mini">HARI INI</span>
            </div>

            <!-- Items on this date -->
            <div class="d-flex flex-column gap-1 overflow-hidden">
              <!-- Timed Events -->
              <div
                v-for="e in getEventsForDate(cell.dateStr)"
                :key="e.id"
                class="p-1 rounded bg-primary-subtle text-primary fw-semibold style-event d-flex align-items-center justify-content-between"
              >
                <span class="text-truncate"><i class="bi bi-clock-fill me-1"></i>{{ e.startTime }} {{ e.title }}</span>
                <span v-if="e.reminder && e.reminder !== 'None'" class="badge bg-primary text-white p-0 px-1 style-mini ms-1" title="Reminder set">🔔</span>
              </div>

              <!-- Tasks -->
              <div v-for="t in getTasksForDate(cell.dateStr)" :key="t.id" class="p-1 rounded bg-warning-subtle text-warning-emphasis style-event text-truncate">
                <i class="bi bi-check2-square me-1"></i>{{ t.name }}
              </div>

              <!-- Projects -->
              <div v-for="p in getProjectsForDate(cell.dateStr)" :key="p.id" class="p-1 rounded bg-info-subtle text-info-emphasis style-event text-truncate">
                <i class="bi bi-folder me-1"></i>{{ p.projectTitle }}
              </div>

              <!-- Invoices -->
              <div v-for="inv in getInvoicesForDate(cell.dateStr)" :key="inv.id" class="p-1 rounded bg-danger-subtle text-danger style-event text-truncate">
                <i class="bi bi-receipt me-1"></i>{{ inv.invoiceNumber }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- In-Page Panel Detail Tanggal & Form Agenda (No Modal Overlay) -->
    <div v-if="showDayDetailModal" id="dayDetailPanel" class="card border-0 shadow rounded-4 bg-white p-4 my-4 animate-scale">
      <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
        <div>
          <span class="badge bg-primary-subtle text-primary fw-bold px-3 py-1 rounded-pill mb-1">
            <i class="bi bi-calendar-event me-1"></i> Detail Agenda Tanggal
          </span>
          <h4 class="fw-bold text-dark mb-0" v-if="selectedCell">{{ formatFullDate(selectedCell.dateStr) }}</h4>
        </div>
        <button class="btn-close" @click="showDayDetailModal = false" title="Tutup Detail Tanggal"></button>
      </div>

      <div v-if="selectedCell">
        <div class="d-flex justify-content-between align-items-center bg-light p-3 rounded-3 mb-3 border">
          <span class="fw-bold text-dark small"><i class="bi bi-clock-fill text-primary me-1"></i> {{ getEventsForDate(selectedCell.dateStr).length }} Event Terjadwal</span>
          <button class="btn btn-sm btn-primary rounded-pill px-3 fw-bold" @click="openAddEventModal(selectedCell.dateStr)">
            <i class="bi bi-plus-lg me-1"></i> Tambah Agenda
          </button>
        </div>

        <!-- List of events -->
        <div v-if="getEventsForDate(selectedCell.dateStr).length > 0" class="d-flex flex-column gap-2 mb-3">
          <div v-for="e in getEventsForDate(selectedCell.dateStr)" :key="e.id" class="p-3 bg-white border rounded-3 shadow-sm d-flex justify-content-between align-items-center">
            <div>
              <span class="badge bg-primary text-white me-2">{{ e.startTime || 'All Day' }}</span>
              <strong class="text-dark">{{ e.title }}</strong>
              <small class="text-muted d-block" v-if="e.notes">{{ e.notes }}</small>
            </div>
            <div class="d-flex gap-1">
              <button class="btn btn-sm btn-outline-primary rounded-circle p-1" @click="editEvent(e)"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-outline-danger rounded-circle p-1" @click="deleteEvent(e.id)"><i class="bi bi-trash"></i></button>
            </div>
          </div>
        </div>

        <!-- Tasks & Projects on this day -->
        <div v-if="getTasksForDate(selectedCell.dateStr).length > 0" class="p-3 bg-warning-subtle text-warning-emphasis rounded-3 border mb-3 small">
          <strong>📋 Deadline Task:</strong>
          <ul class="mb-0 ps-3">
            <li v-for="t in getTasksForDate(selectedCell.dateStr)" :key="t.id">{{ t.name }}</li>
          </ul>
        </div>
      </div>

      <div class="d-flex justify-content-end border-top pt-3">
        <button class="btn btn-secondary rounded-pill px-4" @click="showDayDetailModal = false">Tutup Detail</button>
      </div>
    </div>

    <!-- PAGE 3: ADD / EDIT EVENT FORM FULL NEW PAGE VIEW (HALAMAN BARU) -->
    <div v-else-if="pageMode === 'event-form'">
      <div class="bg-white p-4 rounded-4 shadow-sm border mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div class="d-flex align-items-center gap-3">
            <button class="btn btn-outline-secondary rounded-3 px-3 py-2 fw-bold d-flex align-items-center gap-2" @click="cancelEventForm">
              <i class="bi bi-arrow-left fs-5"></i>
              <span>Kembali ke Kalender</span>
            </button>
            <div class="border-start ps-3">
              <span class="badge bg-primary-subtle text-primary fw-bold px-3 py-1 rounded-pill mb-1">
                <i class="bi bi-pencil-square me-1"></i> Form Halaman Baru
              </span>
              <h3 class="fw-extrabold text-dark mb-0">{{ isEditingEvent ? 'Edit Agenda Meeting' : 'Buat Event / Agenda Baru' }}</h3>
              <p class="text-muted small mb-0" v-if="eventForm.date">Tanggal Dipilih: <strong>{{ formatFullDate(eventForm.date) }}</strong></p>
            </div>
          </div>

          <button v-if="eventForm.date && (getEventsForDate(eventForm.date).length > 0 || getTasksForDate(eventForm.date).length > 0)" class="btn btn-outline-primary rounded-3 px-3 py-2 fw-bold" @click="pageMode = 'day-detail'">
            <i class="bi bi-calendar-week me-1"></i> Lihat Agenda Tanggal Ini ({{ getEventsForDate(eventForm.date).length }})
          </button>
        </div>
      </div>

      <div class="row g-4">
        <!-- Main Form -->
        <div :class="eventForm.date && (getEventsForDate(eventForm.date).length > 0 || getTasksForDate(eventForm.date).length > 0) ? 'col-lg-8' : 'col-12'">
          <div class="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5">
            <form @submit.prevent="saveEvent" class="row g-4">
              <div class="col-md-8">
                <label class="form-label fw-bold text-dark fs-6">Judul Agenda / Meeting <span class="text-danger">*</span></label>
                <input type="text" class="form-control form-control-lg border-2 fs-5 rounded-3 fw-bold" v-model="eventForm.title" placeholder="Contoh: Demo Project Klien Q3" required />
              </div>

              <div class="col-md-4">
                <label class="form-label fw-bold text-dark fs-6">Tanggal Agenda <span class="text-danger">*</span></label>
                <input type="date" class="form-control form-control-lg border-2 rounded-3" v-model="eventForm.date" required />
              </div>

              <div class="col-md-6">
                <label class="form-label fw-bold text-dark small">Jam Mulai</label>
                <input type="time" class="form-control form-control-lg border-2 rounded-3" v-model="eventForm.startTime" />
              </div>

              <div class="col-md-6">
                <label class="form-label fw-bold text-dark small">Jam Selesai</label>
                <input type="time" class="form-control form-control-lg border-2 rounded-3" v-model="eventForm.endTime" />
              </div>

              <div class="col-md-6">
                <label class="form-label fw-bold text-dark small">Kategori Agenda</label>
                <select class="form-select form-select-lg border-2 rounded-3" v-model="eventForm.category">
                  <option value="Meeting">Meeting / Client Call</option>
                  <option value="Milestone">Milestone Proyek</option>
                  <option value="Reminder">Pengingat Penting</option>
                  <option value="Personal">Personal / Rutinitas</option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-bold text-dark small">Pengingat / Reminder</label>
                <select class="form-select form-select-lg border-2 rounded-3" v-model="eventForm.reminder">
                  <option value="None">Tanpa Pengingat</option>
                  <option value="15m">15 Menit Sebelum</option>
                  <option value="30m">30 Menit Sebelum</option>
                  <option value="1h">1 Jam Sebelum</option>
                  <option value="1d">1 Hari Sebelum</option>
                </select>
              </div>

              <div class="col-12">
                <label class="form-label fw-bold text-dark small">Catatan / Detail Agenda</label>
                <textarea class="form-control border-2 rounded-3 p-3" rows="4" v-model="eventForm.notes" placeholder="Lokasi, link Zoom, agenda pembahasan, atau catatan pendukung..."></textarea>
              </div>

              <div class="col-12 d-flex justify-content-end gap-3 pt-4 border-top">
                <button type="button" class="btn btn-light rounded-3 px-4 py-2.5 fw-semibold border" @click="cancelEventForm">Batal</button>
                <button type="submit" class="btn btn-primary rounded-3 px-5 py-2.5 fw-bold shadow-sm d-flex align-items-center gap-2 fs-6">
                  <i class="bi bi-check-circle-fill"></i>
                  <span>Simpan Agenda Meeting</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Sidebar list if events exist on this date -->
        <div v-if="eventForm.date && (getEventsForDate(eventForm.date).length > 0 || getTasksForDate(eventForm.date).length > 0)" class="col-lg-4">
          <div class="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
            <h6 class="fw-bold text-dark border-bottom pb-3 mb-3 d-flex align-items-center justify-content-between">
              <span><i class="bi bi-calendar2-check text-primary me-2"></i>Agenda Pada Tanggal Ini</span>
              <span class="badge bg-primary-subtle text-primary">{{ getEventsForDate(eventForm.date).length }} Event</span>
            </h6>

            <div class="d-flex flex-column gap-2 overflow-auto" style="max-height: 420px;">
              <div v-for="e in getEventsForDate(eventForm.date)" :key="e.id" class="p-3 bg-light rounded-3 border">
                <div class="d-flex align-items-center justify-content-between mb-1">
                  <span class="badge bg-primary style-mini"><i class="bi bi-clock me-1"></i>{{ e.startTime }}</span>
                  <span class="badge bg-secondary style-mini">{{ e.category }}</span>
                </div>
                <div class="fw-bold text-dark small mb-1">{{ e.title }}</div>
                <div class="text-muted style-mini" v-if="e.notes">{{ e.notes }}</div>
              </div>

              <div v-for="t in getTasksForDate(eventForm.date)" :key="t.id" class="p-3 bg-warning-subtle rounded-3 border border-warning-subtle">
                <span class="badge bg-warning text-dark style-mini mb-1">Deadline Task</span>
                <div class="fw-bold text-dark small">{{ t.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sleek Toast Notification -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1090;">
      <div v-if="toast.show" class="toast align-items-center text-white bg-dark border-0 show shadow-lg rounded-3" role="alert">
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i class="bi bi-check-circle-fill text-success fs-5"></i>
            <span>{{ toast.message }}</span>
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="toast.show = false"></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'CalendarView',
  setup() {
    const store = useStore();
    const currentDate = ref(new Date());

    // Page modes: 'calendar' (main grid view), 'day-detail' (detail date page), 'event-form' (add/edit form page)
    const pageMode = ref('calendar');
    const selectedCell = ref(null);
    const showDayDetailModal = ref(false);
    const isEditingEvent = ref(false);
    const editingEventId = ref(null);

    const openDayDetail = (cell) => {
      selectedCell.value = cell;
      showDayDetailModal.value = true;
    };

    const openAddEventModal = (dateStr) => {
      showDayDetailModal.value = false;
      openAddEventForm(dateStr);
    };

    const toast = ref({ show: false, message: '' });

    const showToast = (msg) => {
      toast.value.message = msg;
      toast.value.show = true;
      setTimeout(() => (toast.value.show = false), 3000);
    };

    const eventForm = ref({
      title: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      category: 'Meeting',
      reminder: '30m',
      notes: ''
    });

    const weekDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const monthYearLabel = computed(() => {
      return currentDate.value.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    });

    const changeMonth = (delta) => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + delta, 1);
    };

    const tasks = computed(() => store.getters.getTasks);
    const projects = computed(() => store.getters.getProjects);
    const invoices = computed(() => store.getters.getInvoices);
    const events = computed(() => store.getters.getEvents);

    const openAddEventForm = (dateStr = null) => {
      isEditingEvent.value = false;
      editingEventId.value = null;
      eventForm.value = {
        title: '',
        date: dateStr || (selectedCell.value ? selectedCell.value.dateStr : new Date().toISOString().split('T')[0]),
        startTime: '09:00',
        endTime: '10:00',
        category: 'Meeting',
        reminder: '30m',
        notes: ''
      };
      pageMode.value = 'event-form';
    };

    const editEvent = (ev) => {
      isEditingEvent.value = true;
      editingEventId.value = ev.id;
      eventForm.value = { ...ev };
      pageMode.value = 'event-form';
    };

    const saveEvent = () => {
      if (!eventForm.value.title || !eventForm.value.title.trim()) {
        showToast('Judul agenda tidak boleh kosong.');
        return;
      }

      if (isEditingEvent.value) {
        store.dispatch('updateEvent', { ...eventForm.value, id: editingEventId.value });
        showToast('Agenda berhasil diperbarui!');
      } else {
        store.dispatch('addEvent', eventForm.value);
        showToast('Agenda baru berhasil ditambahkan!');
      }

      if (selectedCell.value) {
        pageMode.value = 'day-detail';
      } else {
        pageMode.value = 'calendar';
      }
    };

    const cancelEventForm = () => {
      if (selectedCell.value) {
        pageMode.value = 'day-detail';
      } else {
        pageMode.value = 'calendar';
      }
    };

    const deleteEvent = (id) => {
      store.dispatch('deleteEvent', id);
      showToast('Agenda dihapus.');
    };

    const goToMainCalendar = () => {
      pageMode.value = 'calendar';
      selectedCell.value = null;
    };

    const calendarCells = computed(() => {
      const year = currentDate.value.getFullYear();
      const month = currentDate.value.getMonth();

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const cells = [];
      const startDayOfWeek = firstDay.getDay();

      // Prev month padding
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const d = new Date(year, month - 1, prevMonthLastDay - i);
        cells.push({
          dayNum: d.getDate(),
          dateStr: d.toISOString().split('T')[0],
          currentMonth: false,
          isToday: false
        });
      }

      // Current month
      const todayStr = new Date().toISOString().split('T')[0];
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const d = new Date(year, month, day);
        const dateStr = d.toISOString().split('T')[0];
        cells.push({
          dayNum: day,
          dateStr: dateStr,
          currentMonth: true,
          isToday: dateStr === todayStr
        });
      }

      // Remaining cells to complete grid
      const totalSoFar = cells.length;
      const needed = 35 - totalSoFar > 0 ? 35 - totalSoFar : (42 - totalSoFar > 0 ? 42 - totalSoFar : 0);
      for (let i = 1; i <= needed; i++) {
        const d = new Date(year, month + 1, i);
        cells.push({
          dayNum: d.getDate(),
          dateStr: d.toISOString().split('T')[0],
          currentMonth: false,
          isToday: false
        });
      }

      return cells;
    });

    const getEventsForDate = (dateStr) => {
      return events.value.filter(e => e.date === dateStr);
    };

    const getTasksForDate = (dateStr) => {
      return tasks.value.filter(t => t.deadline === dateStr);
    };

    const getProjectsForDate = (dateStr) => {
      return projects.value.filter(p => p.deadline === dateStr);
    };

    const getInvoicesForDate = (dateStr) => {
      return invoices.value.filter(i => i.dueDate === dateStr);
    };

    const toggleTask = (id) => {
      store.dispatch('toggleTask', id);
    };

    const formatFullDate = (dateStr) => {
      if (!dateStr) return '-';
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      } catch (e) {
        return dateStr;
      }
    };

    return {
      weekDays,
      monthYearLabel,
      changeMonth,
      calendarCells,
      getEventsForDate,
      getTasksForDate,
      getProjectsForDate,
      getInvoicesForDate,
      pageMode,
      selectedCell,
      showDayDetailModal,
      openAddEventModal,
      isEditingEvent,
      eventForm,
      toast,
      openAddEventForm,
      editEvent,
      saveEvent,
      cancelEventForm,
      deleteEvent,
      openDayDetail,
      goToMainCalendar,
      toggleTask,
      formatFullDate
    };
  }
};
</script>

<style scoped>
.calendar-grid-header,
.calendar-grid-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.calendar-cell {
  min-height: 110px;
  transition: all 0.2s ease;
}

.cell-active {
  background-color: var(--bg-surface, #ffffff);
}

.cell-inactive {
  background-color: var(--bg-app, #f8fafc);
}

.cell-hover:hover {
  border-color: var(--primary-color) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.style-event {
  font-size: 11px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.style-mini {
  font-size: 9px;
}

.cursor-pointer {
  cursor: pointer;
}

.min-w-160 {
  min-width: 160px;
}
</style>

