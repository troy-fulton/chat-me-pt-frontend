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
</script>

<template>
  <div class="chat-input-row">
    <div class="chat-input-wrapper" style="position: relative; width: 100%;">
      <textarea
        ref="textarea"
        :value="modelValue"
        @input="onInput"
        :rows="rows"
        placeholder="Ask anything"
        class="chat-input overflow-hidden resize-none bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100"
        style="width: 100%;"
      ></textarea>
      <button
        class="chat-send-btn"
        @click="emit('send')"
        aria-label="Send message"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" style="display: block; margin: auto; transform: rotate(180deg);">
          <circle cx="12" cy="12" r="12" fill="#2563eb" />
          <polyline points="12,6 12,18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          <polyline points="7,13 12,18 17,13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        </svg>
      </button>
    </div>
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
.chat-input-wrapper {
  position: relative;
  width: 100%;
  max-width: 40rem;
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
  width: 100%;
  box-sizing: border-box;
}
.chat-send-btn {
  position: absolute;
  bottom: 0.9rem;
  right: 0.5rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  cursor: pointer;
}
.chat-send-btn:active {
  background: #1741a6;
}
@media (max-width: 640px) {
  .chat-input-row {
    padding: 0.5rem;
  }
  .chat-input-wrapper {
    max-width: 100vw;
  }
  .chat-input {
    max-width: 100vw;
  }
  .chat-send-btn {
    bottom: 0.9rem;
    right: 0.5rem;
  }
}
</style>
