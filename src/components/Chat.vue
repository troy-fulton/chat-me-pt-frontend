<script setup>
import { ref, watch, onMounted } from 'vue'
import ChatInput from './ChatInput.vue'
import ChatBubbleGroup from './ChatBubbleGroup.vue'
import AppHeader from './AppHeader.vue'
import axios from 'axios'
import '@/types/chat.js'

const prompt = ref("")
const messages = ref([])
const isMobile = ref(window.innerWidth <= 768)
const isAwaitingAssistant = ref(false)

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
const conversationIdIsNull = ref(props.conversationId === null || props.conversationId === undefined)
const emit = defineEmits(['update:conversationId'])

const baseUrl = import.meta.env.VITE_API_BASE_URL

function handleResize() {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  if (props.conversationId) loadMessages(props.conversationId)
  window.addEventListener('resize', handleResize)
})

watch(() => props.conversationId, (id) => {
  if (!conversationIdIsNull.value) {
    console.log('Conversation ID changed:', id)
    loadMessages(id)
  } else {
    console.log('No conversation ID provided, clearing messages.')
    // Do nothing
    conversationIdIsNull.value = true
  }
}, { immediate: true })

async function ask() {
  if (!prompt.value.trim()) return
  const userMsg = { role: 'visitor', content: prompt.value }
  // Defensive: ensure messages.value is always an array
  const input = prompt.value
  prompt.value = ''
  let conversationId = props.conversationId
  console.log('Asking:', input, 'Conversation ID:', conversationId)
  // If no conversationId, create a new conversation first
  if (!conversationId) {
    try {
      const res = await axios.post(`${baseUrl}/api/conversations/`, {}, { withCredentials: true })
      conversationId = res.data.id || res.data.conversation_id
      emit('update:conversationId', conversationId)
    } catch (e) {
      messages.value.push({ role: 'system', content: 'Failed to start a new conversation.' })
      return
    }
  }
  if (!Array.isArray(messages.value)) messages.value = []
  console.log('Current messages:', messages.value)
  messages.value.push(userMsg)
  isAwaitingAssistant.value = true
  try {
    const res = await axios.post(
      `${baseUrl}/api/chat/`,
      { message: input, conversation_id: conversationId },
      { withCredentials: true }
    )
    console.log('Response:', res.data)
    messages.value.push({ role: 'assistant', content: res.data.response, sources: res.data.sources || [] })
    isAwaitingAssistant.value = false
    // Refresh conversation names in sidebar after each visitor message
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('refresh-conversations')
      window.dispatchEvent(event)
      updateUsageBar()
    }
  } catch (e) {
    let errorMsg = 'Error contacting server.'
    if (e.response) {
      errorMsg = `Error: ${e.response.status}\n${typeof e.response.data === 'string' ? e.response.data : JSON.stringify(e.response.data)}`
    } else if (e.request) {
      errorMsg = 'No response received from server. Status code: ' + (e.request.status || 'unknown')
    } else if (e.message) {
      errorMsg = e.message
    }
    messages.value.push({ role: 'system', content: errorMsg })
    isAwaitingAssistant.value = false
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
  <div :class="['chat-container', { shifted: sidebarOpen && !isMobile }]">
    <AppHeader />
    <!-- Messages -->
    <div class="chat-messages flex-1 overflow-y-auto">
      <div
        v-for="(msg, i) in messages.slice(messages.findIndex(m => m.role === 'visitor'))"
        :key="i + messages.findIndex(m => m.role === 'visitor')"
        class="chat-message-row"
        :class="{
          'chat-message-row-user': msg.role === 'visitor',
          'chat-message-row-assistant': msg.role === 'assistant',
          'justify-center': msg.role === 'system'
        }"
      >
        <ChatBubbleGroup :msg="msg" />
      </div>
      <div v-if="isAwaitingAssistant" class="chat-message-row chat-message-row-assistant">
        <ChatBubbleGroup :msg="{ role: 'assistant', content: '...', sources: [] }" is-typing />
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
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}
.chat-messages::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
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
}
</style>
