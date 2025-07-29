<script setup>
import { ref, watch, onMounted } from 'vue'
import ChatInput from './ChatInput.vue'
import ChatBubbleGroup from './ChatBubbleGroup.vue'
import AppHeader from './AppHeader.vue'
import axios from 'axios'
import '@/types/chat.js'
import AssistantWaitBubble from './AssistantWaitBubble.vue'

const prompt = ref("")
const messages = ref([])
const isMobile = ref(window.innerWidth <= 768)
const isAwaitingAssistant = ref(false)
const assistantWaitMessage = ref("")

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
const newConversation = ref(props.conversationId === null || props.conversationId === undefined)
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
  if (!newConversation.value) {
    console.log('Conversation ID changed:', id)
    loadMessages(id)
  } else {
    console.log('New conversation ID, no need to load messages.')
    // Do nothing
    newConversation.value = false
  }
}, { immediate: true })

async function ask() {
  if (!prompt.value.trim()) return
  const input = prompt.value
  prompt.value = ''
  let conversationId = props.conversationId

  assistantWaitMessage.value = ""
  isAwaitingAssistant.value = true

  addUserMessage(input)

  if (!conversationId) {
    conversationId = await startNewConversation()
    if (!conversationId) {
      isAwaitingAssistant.value = false
      assistantWaitMessage.value = ""
      return
    }
  }

  // Call documentQuery and update the message
  let docRes = null
  try {
    docRes = await documentQuery(input, conversationId)
    assistantWaitMessage.value = docRes ? "Searching for: " + docRes : ""
    console.log("Document query:", assistantWaitMessage.value)
  } catch (e) {
    handleError(e)
    isAwaitingAssistant.value = false
    assistantWaitMessage.value = ""
    return
  }

  try {
    const res = await sendMessage(input, conversationId, docRes)
    addAssistantMessage(res.data)
    isAwaitingAssistant.value = false
    assistantWaitMessage.value = ""
    refreshConversations()
    updateUsageBar()
  } catch (e) {
    handleError(e)
    isAwaitingAssistant.value = false
    assistantWaitMessage.value = ""
  }
}

async function startNewConversation() {
  try {
    const res = await axios.post(`${baseUrl}/api/conversations/`, {}, { withCredentials: true })
    const id = res.data.id || res.data.conversation_id
    newConversation.value = true
    emit('update:conversationId', id)
    return id
  } catch (e) {
    messages.value.push({ role: 'system', content: 'Failed to start a new conversation.' })
    return null
  }
}

function addUserMessage(content) {
  if (!Array.isArray(messages.value)) messages.value = []
  messages.value.push({ role: 'visitor', content })
}

async function sendMessage(message, conversationId, docRes) {
  return axios.post(
    `${baseUrl}/api/chat/`,
    { message, conversation_id: conversationId, document_query: docRes },
    { withCredentials: true }
  )
}

function addAssistantMessage(data) {
  messages.value.push({ role: 'assistant', content: data.response, sources: data.sources || [] })
}

function refreshConversations() {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('refresh-conversations')
    window.dispatchEvent(event)
  }
}

function handleError(e) {
  let errorMsg = 'Error contacting server.'
  if (e.response) {
    errorMsg = `Error: ${e.response.status}\n${typeof e.response.data === 'string' ? e.response.data : JSON.stringify(e.response.data)}`
  } else if (e.request) {
    errorMsg = 'No response received from server. Status code: ' + (e.request.status || 'unknown')
  } else if (e.message) {
    errorMsg = e.message
  }
  messages.value.push({ role: 'system', content: errorMsg })
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

async function documentQuery(message, conversationId) {
  const res = await axios.post(
    `${baseUrl}/api/document_query/`,
    { message: message, conversation_id: conversationId },
    { withCredentials: true }
  )
  return res.data.document_query
}

// Helper to update usage bar in ConversationList (was AppHeader)
function updateUsageBar() {
  // Find the ConversationList instance and call fetchUsage if possible
  if (window.__conversationListFetchUsage) {
    window.__conversationListFetchUsage()
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
      <AssistantWaitBubble v-if="isAwaitingAssistant" :message="assistantWaitMessage || ''" />
    </div>
    <!-- Input -->
    <div class="chat-input-wrapper sticky bottom-0 bg-inherit z-10">
      <ChatInput v-model="prompt" @send="ask" :rows="3" />
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
  padding-bottom: 0 !important;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 40rem;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  align-items: center;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  box-sizing: border-box;
}
.chat-message-row {
  display: flex;
  width: 100%;
}
@media (max-width: 640px) {
  .chat-messages {
    max-width: 100vw;
    width: 100vw;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-top: 4rem;
    padding-bottom: 0 !important;
  }
  .chat-message-row {
    width: 90%;
  }
}
.chat-messages::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
.chat-message-row-user {
  justify-content: flex-end;
}
.chat-message-row-assistant {
  justify-content: flex-start;
}
.chat-input-wrapper {
  width: 100%;
  background: var(--color-background, #fff);
}
.dark .chat-input-wrapper {
  background: #101828;
}
</style>
