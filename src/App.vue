<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Welcome from './components/Welcome.vue'
import Chat from './components/Chat.vue'
import AppHeader from './components/AppHeader.vue'
import ConversationList from './components/ConversationList.vue'

const showWelcome = ref(false)
const baseUrl = import.meta.env.VITE_API_BASE_URL
const selectedConversation = ref(null)
const sidebarCollapsed = ref(false)
const conversationListRef = ref(null)

async function checkVisitor() {
  try {
    const res = await axios.get(`${baseUrl}/api/welcome/`, { withCredentials: true })
    if (res.data && res.data.visitor_exists) {
      showWelcome.value = false
    }
    else {
      showWelcome.value = true
    }
  } catch (e) {
    // Optionally handle error, but don't block the welcome screen
  }
}

onMounted(checkVisitor)

function onWelcomeDone() {
  showWelcome.value = false
}

function onSelectConversation(id) {
  selectedConversation.value = id
}

function onSidebarCollapse(state) {
  sidebarCollapsed.value = state
}

function onUpdateConversationId(id) {
  selectedConversation.value = id
  // If ConversationList is present, refresh its conversations
  // Use a ref to ConversationList and call a method to refresh
  if (conversationListRef.value && conversationListRef.value.fetchConversations) {
    conversationListRef.value.fetchConversations()
  }
}
</script>

<template>
  <div>
    <div v-if="showWelcome">
      <AppHeader />
      <Welcome @done="onWelcomeDone" />
    </div>
    <div v-else>
      <ConversationList
        ref="conversationListRef"
        @select="onSelectConversation"
        @update:collapsed="onSidebarCollapse"
        :selected-conversation-id="selectedConversation"
      />
      <div>
        <Chat :conversation-id="selectedConversation" :sidebar-open="!sidebarCollapsed" @update:conversationId="onUpdateConversationId" />
      </div>
    </div>
  </div>
</template>