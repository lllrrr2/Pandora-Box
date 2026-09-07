<template>
  <div
      ref="el"
      class="fake-input"
      :class="{
        focused: recording,
        disabled: disabled
      }"
      tabindex="0"
      @click="start"
      @keydown.prevent.stop="onKeydown"
      @keyup.prevent.stop="onKeyup"
      @blur="stop"
  >
    <span v-if="display">{{ display }}</span>
    <span v-else class="placeholder"></span>

    <!-- 光标 -->
    <span v-if="recording" class="caret"></span>
  </div>
</template>

<script setup>
import {ref, watch} from 'vue'

/* ================= props / emits ================= */
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:modelValue', // v-model
  'change',
])

/* ================= state ================= */
const el = ref(null)
const recording = ref(false)
const keys = new Set()

const display = ref(props.modelValue)
const lastEmitted = ref(props.modelValue)

/* ================= sync from parent ================= */
watch(
    () => props.modelValue,
    (value) => {
      if (value !== display.value) {
        display.value = value
        lastEmitted.value = value
      }
    }
)

/* ================= events ================= */
function start() {
  if (props.disabled) {
    return
  }
  recording.value = true
  keys.clear()
  el.value.focus()
}

function stop() {
  recording.value = false
  keys.clear()
}

function onKeydown(e) {
  if (!recording.value) return
  if (e.key === 'Escape') {
    return
  }

  const key = normalize(e)
  if (!key) return

  keys.add(key)
  display.value = format(keys)
}

function onKeyup() {
  if (!recording.value) return

  const value = format(keys)

  if (value && value !== lastEmitted.value) {
    lastEmitted.value = value
    emit('update:modelValue', value)
    emit('change', value)
  }

  stop()
}

/* ================= utils ================= */

function normalize(e) {
  if (e.key === 'Control') return 'Ctrl'
  if (e.key === 'Meta') return 'Cmd'
  if (e.key === 'Alt') return 'Alt'
  if (e.key === 'Shift') return 'Shift'
  if (e.key === ' ') return 'Space'
  if (e.key.length === 1) return e.key.toUpperCase()
  return e.key
}

function format(set) {
  const order = ['Cmd', 'Ctrl', 'Alt', 'Shift']
  const mods = order.filter(k => set.has(k))
  const main = [...set].filter(k => !order.includes(k))
  return [...mods, ...main].join('+')
}
</script>

<style scoped>
.fake-input {
  min-width: 150px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 2px solid var(--text-color);
  cursor: text;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.placeholder {
  color: var(--text-color);
}

.caret {
  width: 1px;
  height: 1em;
  background: var(--text-color);
  animation: blink 1s steps(1) infinite;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

.fake-input.disabled {
  color: var(--text-color);
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
