<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'

const emit = defineEmits(['select', 'update:collapsed'])
const baseUrl = import.meta.env.VITE_API_BASE_URL
const conversations = ref([])
const collapsed = ref(false)
const loading = ref(false)
const error = ref('')
const usage = ref(null)
const usageLoading = ref(false)
const usageError = ref('')

// Mobile detection
const isMobile = ref(window.innerWidth <= 768)

function handleResize() {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    collapsed.value = true
  }
}

onMounted(() => {
  fetchConversations()
  fetchUsage()
  window.addEventListener('resize', handleResize)
  // Initial collapse if mobile
  if (isMobile.value) collapsed.value = true
  // Listen for refresh-conversations event from Chat.vue
  window.addEventListener('refresh-conversations', fetchConversations)
  window.addEventListener('refresh-conversations', fetchUsage)
})

watch(isMobile, (val) => {
  if (val) collapsed.value = true
})

watch(collapsed, (val) => {
  emit('update:collapsed', val)
})

async function fetchConversations() {
  loading.value = true
  error.value = ''
  try {
    const res = await axios.get(`${baseUrl}/api/conversations`, { withCredentials: true })
    conversations.value = res.data.conversations
  } catch (e) {
    error.value = 'Failed to load conversations.'
  } finally {
    loading.value = false
  }
}

async function fetchUsage() {
  usageLoading.value = true
  usageError.value = ''
  try {
    const res = await fetch(`${baseUrl}/api/visitor_usage`, { credentials: 'include' })
    if (!res.ok) throw new Error('Failed to fetch usage')
    const data = await res.json()
    if (data.hourly_limit > 0) {
      usage.value = {
        used: data.hourly_limit - data.remaining_tokens,
        limit: data.hourly_limit,
        percent: 100 * (1 - data.remaining_tokens / data.hourly_limit)
      }
    } else {
      usage.value = null
    }
  } catch {
    usage.value = null
    usageError.value = 'Failed to load usage.'
  } finally {
    usageLoading.value = false
  }
}

async function createConversation() {
  loading.value = true
  error.value = ''
  try {
    const res = await axios.post(`${baseUrl}/api/conversations/`, {}, { withCredentials: true })
    await fetchConversations()
    // Automatically select the new conversation
    const newId = res.data.id || res.data.conversation_id
    if (newId) {
      emit('select', newId)
      if (isMobile.value) collapsed.value = true
    }
  } catch (e) {
    error.value = 'Failed to create conversation.'
  } finally {
    loading.value = false
  }
}

function selectConversation(id) {
  emit('select', id)
}

// Expose fetchConversations for parent to call
defineExpose({ fetchConversations })
</script>

<template>
  <div>
    <!-- Sandwich button always in the same position, toggles sidebar -->
    <button
      @click="collapsed = !collapsed"
      class="sidebar-toggle p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-300 mt-2 ml-2 fixed top-2 left-2 z-30 shadow bg-zinc-100 dark:bg-zinc-800"
      title="Toggle sidebar"
      style="font-size:2rem;line-height:2rem;"
    >
      ☰
    </button>
    <!-- Sidebar drawer, only visible when not collapsed -->
    <transition name="sidebar-fade">
      <div
        v-if="!collapsed"
        :class=" [
          'sidebar-root h-full flex flex-col transition-all duration-200 fixed top-0 left-0',
          isMobile ? 'z-40' : 'z-20',
          'w-64 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-300 shadow-lg'
        ]"
        style="height:100vh;"
      >
        <div style="height:4rem;"></div> <!-- Spacer for sandwich button -->
        <!-- Usage Progress Bar -->
        <div class="px-4 mb-2 w-full">
          <div v-if="usageLoading" class="text-xs text-gray-400">Loading usage...</div>
          <div v-else-if="usageError" class="text-xs text-red-400">{{ usageError }}</div>
          <div v-else-if="usage" class="w-full">
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs text-gray-500 dark:text-gray-400">Hourly Token Limit</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ Math.round(usage.percent) }}%</span>
            </div>
            <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded">
              <div
                class="h-2 bg-blue-500 dark:bg-blue-400 rounded"
                :style="{ width: usage.percent + '%' }"
              ></div>
            </div>
          </div>
        </div>
        <div class="sidebar-header flex flex-col items-start px-3 py-2 w-full">
          <button @click="createConversation" :disabled="loading" class="sidebar-plus flex items-center gap-2 p-1 rounded w-full hover:bg-zinc-200 dark:hover:bg-zinc-700 text-blue-600 dark:text-blue-400 mb-2" title="New Conversation">
            <span class="text-xl">📝</span>
            <span class="text-zinc-800 dark:text-zinc-100 text-sm font-normal">New Chat</span>
          </button>
          <span class="sidebar-title font-semibold ml-2 mb-2">Chats</span>
        </div>
        <!-- End Usage Progress Bar -->
        <div class="sidebar-list flex-1 overflow-y-auto">
          <div v-if="loading" class="sidebar-loading p-4 text-zinc-500 dark:text-zinc-400">Loading...</div>
          <div v-else-if="error" class="sidebar-error p-4 text-red-500 dark:text-red-400">{{ error }}</div>
          <ul>
            <transition-group name="conv-fade" tag="ul">
              <li v-for="conv in conversations" :key="conv.id">
                <button
                  @click="selectConversation(conv.id); if (isMobile) collapsed = true"
                  :class=" [
                    'sidebar-item w-full text-left px-4 py-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100',
                    conv.id === $attrs['selected-conversation-id'] ? 'bg-blue-100 dark:bg-zinc-700 font-bold' : ''
                  ]"
                >
                  {{ conv.title || 'Untitled' }}
                </button>
              </li>
            </transition-group>
          </ul>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.sidebar-root {
  height: 100vh;
  min-height: 100vh;
  top: 0;
  left: 0;
  z-index: 20;
}
.h-full {
  height: 100%;
}
.flex {
  display: flex;
}
.flex-col {
  flex-direction: column;
}
.transition-all {
  transition-property: all;
}
.duration-200 {
  transition-duration: 200ms;
}
.w-14 {
  width: 3.5rem;
}
.w-64 {
  width: 16rem;
}
.flex-1 {
  flex: 1 1 0%;
}
.overflow-y-auto {
  overflow-y: auto;
}
.p-1 {
  padding: 0.25rem;
}
.p-4 {
  padding: 1rem;
}
.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}
.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}
.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
.ml-auto {
  margin-left: auto;
}
.mr-2 {
  margin-right: 0.5rem;
}
.rounded {
  border-radius: 0.25rem;
}
.font-semibold {
  font-weight: 600;
}
.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}
.text-left {
  text-align: left;
}
.ml-2 {
  margin-left: 0.5rem;
}
.mt-2 {
  margin-top: 0.5rem;
}
.mb-2 {
  margin-bottom: 0.5rem;
}
.gap-2 {
  gap: 0.5rem;
}
/* Sidebar fade in/out */
.sidebar-fade-enter-active, .sidebar-fade-leave-active {
  transition: opacity 0.25s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1);
}
.sidebar-fade-enter-from, .sidebar-fade-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}
.sidebar-fade-enter-to, .sidebar-fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}
/* Conversation list item fade/slide */
.conv-fade-enter-active, .conv-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
}
.conv-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}
.conv-fade-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.conv-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.conv-fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}
</style>
