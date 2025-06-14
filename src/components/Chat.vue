<script setup>
import { ref } from 'vue'
import ChatHeader from './ChatHeader.vue'
import { useApi } from '@/composables/useApi.js'
const { postPrompt } = useApi()

const prompt = ref("")
const messages = ref([])
const baseUrl = import.meta.env.VITE_API_BASE_URL
const textarea = ref(null)

const autoResize = () => {
  const el = textarea.value
  if (el) {
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }
}

const resetTextarea = () => {
  const el = textarea.value
  if (el) {
    el.style.height = 'auto'
  }
}

async function ask() {
  if (!prompt.value.trim()) return
  const userMsg = { role: "user", content: prompt.value }
  messages.value.push(userMsg)
  prompt.value = ""
  resetTextarea()

  try {
    const data = await postPrompt(prompt.value)
    const reply = data?.content?.[0]?.text || "No response."
    messages.value.push({ role: "assistant", content: reply })
  } catch (e) {
    messages.value.push({ role: "system", content: "Error contacting server." })
  }
}
</script>

<template>
  <div class="chat-container min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
    <!-- Header -->
    <ChatHeader />
    <!-- Messages -->
    <div class="chat-messages">
      <div
        v-for="(msg, i) in messages"
        :key="i"
        class="chat-message-row"
        :class="{
          'chat-message-row-user': msg.role === 'user',
          'chat-message-row-assistant': msg.role === 'assistant',
          'justify-center': msg.role === 'system'
        }"
      >
        <div class="chat-message-bubble-group">
            <!-- System message: red bubble, centered, no avatar -->
            <template v-if="msg.role === 'system'">
              <div
                class="error-message-bubble bg-gray-800 text-gray-100 mx-auto flex justify-center"
                style="border-radius: 1.5rem; border-bottom-left-radius: 1.5rem; border-bottom-right-radius: 1.5rem;"
              >
                <span v-for="(line, idx) in msg.content.split('\n')" :key="idx">
                  {{ line }}<br v-if="idx < msg.content.split('\n').length - 1" />
                </span>
              </div>
            </template>
            <!-- Assistant message: left, avatar -->
            <template v-else-if="msg.role === 'assistant'">
              <div class="chat-avatar bg-green-500 dark:bg-green-600">
                <span>🤖</span>
              </div>
              <div
                class="chat-message-bubble chat-message-bubble-assistant bg-white text-gray-900 border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              >
                <span v-for="(line, idx) in msg.content.split('\n')" :key="idx">
                  {{ line }}<br v-if="idx < msg.content.split('\n').length - 1" />
                </span>
              </div>
              </template>
              <!-- User message: right, avatar -->
              <template v-else>
              <div
                class="chat-message-bubble chat-message-bubble-user bg-blue-500 text-white dark:bg-blue-600"
              >
                <span v-for="(line, idx) in msg.content.split('\n')" :key="idx">
                  {{ line }}<br v-if="idx < msg.content.split('\n').length - 1" />
                </span>
              </div>
              <div class="chat-avatar bg-blue-500 dark:bg-blue-600">
                <span>🧑</span>
              </div>
            </template>
        </div>
      </div>
    </div>
    <!-- Input -->
    <div class="chat-input-row">
      <textarea
        v-model="prompt"
        ref="textarea"
        @input="autoResize"
        rows="1"
        placeholder="Ask anything"
        class="chat-input overflow-hidden resize-none bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100"
        @keydown.enter.exact.prevent="ask"
      ></textarea>
    </div>
    <div class="chat-disclaimer">
      Chat✨Me✨PT can make mistakes. Check important info.
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-left: 25%;
  margin-right: 25%;
}
.chat-message-row {
  display: flex;
}
.chat-message-row-user {
  justify-content: flex-end;
}
.chat-message-row-assistant {
  justify-content: flex-start;
}
.chat-message-bubble-group {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  max-width: 36rem;
}
.chat-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #fff;
}
.chat-message-bubble {
  padding: 0.5rem 1rem;
  border-radius: 1.5rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  word-break: break-word;
}
.error-message-bubble {
  padding: 0.5rem 1rem;
  border-radius: 1.5rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
  font-weight: 500;
  max-width: 28rem;
  text-align: center;
}
.chat-message-bubble-user {
  border-bottom-right-radius: 0;
}
.chat-message-bubble-assistant {
  border-bottom-left-radius: 0;
}
.chat-input-row {
  padding: 1rem;
  display: flex;
  gap: 0.5rem;
  margin-left: 10%;
  margin-right: 10%;
}
.chat-input {
  flex: 1;
  resize: none;
  border-radius: 0.5rem;
  padding: 0.5rem;
  outline: none;
  transition: box-shadow 0.2s, border-color 0.2s;
  color: inherit;
  margin-left: 25%;
  margin-right: 25%;
  max-height: calc(1.5em * 5);
  line-height: 1.5;
}
.chat-input:focus {
  box-shadow: 0 0 0 2px #2563eb33;
  border-color: #2563eb;
}
.chat-disclaimer {
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.875rem;
}
</style>
