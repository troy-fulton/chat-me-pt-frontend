<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: String,
  rows: {
    type: Number,
    default: 1
  }
})
const emit = defineEmits(['update:modelValue', 'send'])
const textarea = ref(null)

const autoResize = () => {
  const el = textarea.value
  if (el) {
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }
}

watch(() => props.modelValue, async () => {
  await nextTick()
  autoResize()
})

autoResize()

function onInput(e) {
  emit('update:modelValue', e.target.value)
  autoResize()
}

function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    emit('send')
  }
}
</script>

<template>
  <div class="chat-input-row">
    <textarea
      ref="textarea"
      :value="modelValue"
      @input="onInput"
      @keydown="onKeydown"
      :rows="rows"
      placeholder="Ask anything"
      class="chat-input overflow-hidden resize-none bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100"
    ></textarea>
  </div>
  <div class="chat-disclaimer text-gray-500 dark:text-gray-400 text-center text-sm mt-2 mb-2">
    Chat✨Me✨PT can make mistakes. Check important info.
  </div>
</template>

<style scoped>
.chat-input-row {
  padding: 1rem;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}
.chat-input {
  flex: 1;
  resize: none;
  border-radius: 0.5rem;
  padding: 0.5rem;
  outline: none;
  transition: box-shadow 0.2s, border-color 0.2s;
  color: inherit;
  max-height: calc(1.5em * 5);
  line-height: 1.5;
  max-width: 40rem; /* Use rem for max width, not percent or px */
  width: 100%;      /* Always take full width of parent */
  box-sizing: border-box;
}
.chat-input:focus {
  box-shadow: 0 0 0 2px #2563eb33;
  border-color: #2563eb;
}
@media (max-width: 640px) {
  .chat-input-row {
    padding: 0.5rem;
  }
  .chat-input {
    max-width: 100vw;
  }
}
</style>
