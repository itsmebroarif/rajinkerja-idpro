<template>
  <div v-if="modelValue" class="modal-backdrop-dukung" @click.self="closeModal">
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dukung-dialog">
      <div class="modal-content border-0 rounded-4 shadow-lg overflow-hidden bg-white">
        <!-- Modal Top Bar -->
        <div class="modal-header border-bottom px-4 py-3 bg-light d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center gap-2">
            <span class="fs-4">💝</span>
            <div>
              <h5 class="modal-title fw-bold text-dark mb-0">Dukung Pengembang (Support Developer)</h5>
              <small class="text-muted">Apresiasi pengembangan fitur & server TaskArts</small>
            </div>
          </div>
          <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
        </div>

        <!-- Modal Body with BankAddressCards -->
        <div class="modal-body p-3 p-md-4">
          <BankAddressCards />
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer border-top bg-light px-4 py-2.5 d-flex justify-content-between align-items-center">
          <span class="small text-muted">
            <i class="bi bi-heart-fill text-danger me-1"></i> Dibuat dengan cinta oleh Arif Permana Putrasuryana
          </span>
          <button type="button" class="btn btn-secondary rounded-pill px-4 fw-semibold" @click="closeModal">
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BankAddressCards from './BankAddressCards.vue';

export default {
  name: 'DukungDevModal',
  components: {
    BankAddressCards
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const closeModal = () => {
      emit('update:modelValue', false);
    };

    return {
      closeModal
    };
  }
};
</script>

<style scoped>
.modal-backdrop-dukung {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  z-index: 2100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow-y: auto;
}

.modal-dukung-dialog {
  width: 100%;
  max-width: 800px;
  margin: auto;
  animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalPop {
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
