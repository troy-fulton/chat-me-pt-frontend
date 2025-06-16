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
</script>

<template>
  <div>
    <AppHeader />
    <div v-if="showWelcome">
      <Welcome @done="onWelcomeDone" />
    </div>
    <div v-else class="main-layout flex h-[calc(100vh-4rem)]">
      <ConversationList @select="onSelectConversation" @update:collapsed="onSidebarCollapse" />
      <div class="flex-1 min-w-0">
        <Chat :conversation-id="selectedConversation" :sidebar-open="!sidebarCollapsed" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.flex {
  display: flex;
}
.h-\[calc\(100vh-4rem\)\] {
  height: calc(100vh - 4rem);
}
.flex-1 {
  flex: 1 1 0%;
}
.min-w-0 {
  min-width: 0;
}
</style>