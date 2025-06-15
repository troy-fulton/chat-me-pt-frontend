<script setup>
import { ref } from 'vue'
import ChatHeader from './ChatHeader.vue'
import ChatInput from './ChatInput.vue'
import ChatBubbleGroup from './ChatBubbleGroup.vue'
import { useApi } from '@/composables/useApi.js'
const { postPrompt } = useApi()

const prompt = ref("")
const messages = ref([])

async function ask() {
  if (!prompt.value.trim()) return
  const userMsg = { role: "user", content: prompt.value }
  messages.value.push(userMsg)
  prompt.value = ""
  try {
    const data = await postPrompt(userMsg.content)
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
        <ChatBubbleGroup :msg="msg" />
      </div>
    </div>
    <!-- Input -->
    <ChatInput v-model="prompt" @send="ask" />
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
.chat-disclaimer {
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.875rem;
}
</style>
