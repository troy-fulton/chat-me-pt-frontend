<script setup>
import { ref, watch, onMounted } from 'vue'
import ChatInput from './ChatInput.vue'
import ChatBubbleGroup from './ChatBubbleGroup.vue'
import axios from 'axios'

const prompt = ref("")
const messages = ref([])
const isMobile = ref(window.innerWidth <= 768)

const props = defineProps({
  conversationId: {
    type: [String, Number],
    default: null
  },
  sidebarOpen: {
    type: Boolean,
    default: true
  }
})

const baseUrl = import.meta.env.VITE_API_BASE_URL

function handleResize() {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  if (props.conversationId) loadMessages(props.conversationId)
  window.addEventListener('resize', handleResize)
})

watch(() => props.conversationId, (id) => {
  loadMessages(id)
}, { immediate: true })

async function ask() {
  if (!prompt.value.trim() || !props.conversationId) return
  const userMsg = { role: 'visitor', content: prompt.value }
  // Defensive: ensure messages.value is always an array
  if (!Array.isArray(messages.value)) messages.value = []
  messages.value.push(userMsg)
  const input = prompt.value
  prompt.value = ''
  try {
    const res = await axios.post(
      `${baseUrl}/api/chat/`,
      { message: input, conversation_id: props.conversationId },
      { withCredentials: true }
    )
    messages.value.push({ role: 'assistant', content: res.data.response })
  } catch (e) {
    messages.value.push({ role: 'system', content: 'Error contacting server.' })
  }
}


async function loadMessages(conversationId) {
  if (!conversationId) {
    messages.value = []
    return
  }
  try {
    const res = await axios.get(`${baseUrl}/api/chat?conversation_id=${encodeURIComponent(conversationId)}`, { withCredentials: true })
    if (res.status !== 200) throw new Error('Failed to load messages')
    const data = res.data
    messages.value = data.messages
  } catch (e) {
    messages.value = [{ role: 'system', content: 'Failed to load messages.' }]
  }
}
</script>

<template>
  <div :class="['chat-container min-h-screen', { shifted: sidebarOpen && !isMobile }]">
    <!-- Messages -->
    <div class="chat-messages flex-1 overflow-y-auto">
      <div
        v-for="(msg, i) in messages"
        :key="i"
        class="chat-message-row"
        :class="{
          'chat-message-row-user': msg.role === 'visitor',
          'chat-message-row-assistant': msg.role === 'assistant',
          'justify-center': msg.role === 'system'
        }"
      >
        <ChatBubbleGroup :msg="msg" />
      </div>
    </div>
    <!-- Input -->
    <div class="chat-input-wrapper sticky bottom-0 bg-inherit z-10">
      <ChatInput v-model="prompt" @send="ask" :rows="3" />
      <div class="chat-disclaimer text-gray-500 dark:text-gray-400 text-center text-sm mt-2 mb-2">
        Chat✨Me✨PT can make mistakes. Check important info.
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  transition: margin-left 0.3s cubic-bezier(0.4,0,0.2,1);
}
.shifted {
  margin-left: 16rem;
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
.chat-input-wrapper {
  width: 100%;
  padding: 0.5rem 1rem;
  margin-top: 1.5rem;
  margin-bottom: 5rem;
}
</style>
