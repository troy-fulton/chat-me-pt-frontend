<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'

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

// Suggested prompts cycling logic
const prompts = [
  "What does Troy do?",
  "Tell me about Troy's work experience.",
  "What programming languages does Troy know?",
  "Does Troy have any pets?",
  "What experience does Troy have with LLMs?",
  "What is Troy's GitHub?",
]
const placeholder = ref(prompts[0])
const animating = ref(false)
let promptIndex = 0
let promptInterval = null

const startPromptCycle = () => {
  promptInterval = setInterval(() => {
    animating.value = true
    setTimeout(() => {
      promptIndex = (promptIndex + 1) % prompts.length
      placeholder.value = prompts[promptIndex]
      animating.value = false
    }, 350) // animation duration
  }, 5000)
}

onMounted(() => {
  startPromptCycle()
})

onUnmounted(() => {
  if (promptInterval) clearInterval(promptInterval)
})
</script>

<template>
  <div class="chat-input-row">
    <div class="chat-input-wrapper" style="position: relative; width: 100%;">
      <div class="placeholder-anim-wrapper">
        <textarea
          ref="textarea"
          :value="modelValue"
          @input="onInput"
          :rows="rows"
          :placeholder="''"
          class="chat-input overflow-hidden resize-none bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100"
          style="width: 100%;"
        ></textarea>
        <transition name="slide-up" mode="out-in">
          <div v-if="!modelValue" :key="placeholder" class="placeholder-anim-text">{{ placeholder }}</div>
        </transition>
      </div>
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
.placeholder-anim-wrapper {
  position: relative;
}
.placeholder-anim-text {
  position: absolute;
  left: 0.75rem;
  top: 0.5rem;
  color: #94a3b8;
  font-size: 1rem;
  pointer-events: none;
  transition: none;
  z-index: 2;
  background: transparent;
}
.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 0.35s cubic-bezier(.4,0,.2,1), opacity 0.35s;
}
.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}
.slide-up-enter-to {
  transform: translateY(0);
  opacity: 1;
}
.slide-up-leave-from {
  transform: translateY(0);
  opacity: 1;
}
.slide-up-leave-to {
  transform: translateY(-100%);
  opacity: 0;
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
