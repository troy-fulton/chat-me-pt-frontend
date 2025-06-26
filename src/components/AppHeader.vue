<script setup>
import { ref, onMounted } from 'vue'
import ThemeToggle from './ThemeToggle.vue'

const baseUrl = import.meta.env.VITE_API_BASE_URL
const usagePercent = ref(null)
const usageRaw = ref({ remaining_tokens: 0, hourly_limit: 0 })

async function fetchUsage() {
  try {
    const res = await fetch(`${baseUrl}/api/visitor_usage`, { credentials: 'include' })
    if (!res.ok) throw new Error('Failed to fetch usage')
    const data = await res.json()
    usageRaw.value = data
    if (data.hourly_limit > 0) {
      usagePercent.value = 100 * (1 - data.remaining_tokens / data.hourly_limit)
    } else {
      usagePercent.value = null
    }
  } catch {
    usagePercent.value = null
  }
}

onMounted(() => {
  fetchUsage()
  // Expose fetchUsage globally for Chat.vue to call after each message
  window.__appHeaderFetchUsage = fetchUsage
})
</script>

<template>
  <div class="app-header">
    <span class="chat-title text-blue-600 dark:text-blue-300">
       Chat✨Me✨PT
    </span>
    <div v-if="usagePercent !== null" class="usage-bar-container flex flex-col items-end gap-1 mr-2" style="min-width:80px;max-width:160px;">
      <span class="text-xs text-gray-500 dark:text-gray-300 w-full text-right">Hourly Token Limit</span>
      <div class="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded">
        <div class="absolute left-0 top-0 h-2 rounded bg-blue-500 dark:bg-blue-400 transition-all" :style="{ width: usagePercent + '%' }"></div>
      </div>
      <span class="text-xs text-gray-500 dark:text-gray-300">{{ Math.round(usagePercent) }}%</span>
    </div>
    <ThemeToggle />
  </div>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 1rem;
  position: sticky;
  top: 0;
  background: inherit;
}

.chat-title {
  font-size: 2rem;
  font-weight: bold;
  margin: 0 auto;
  flex: 1;
  text-align: center;
}

.app-header-animate {
  transition: background 0.3s, color 0.3s;
}

.usage-bar-container {
  min-width: 80px;
  max-width: 160px;
}
</style>