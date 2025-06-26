<script setup>
import { ref } from 'vue'
import '@/types/chat.js'

const props = defineProps({
  /** @type {ChatMessage} */
  msg: { type: Object, required: true }
})

const showAllSources = ref(false)
const sourcesBaseUrl = import.meta.env.VITE_SOURCES_BASE_URL

function toggleSources() {
  showAllSources.value = !showAllSources.value
}

function getSourceUrl(src) {
  return sourcesBaseUrl ? new URL(src, sourcesBaseUrl).toString() : src
}
</script>

<template>
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
      <div class="chat-message-bubble chat-message-bubble-assistant bg-white text-gray-900 border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
        <span v-for="(line, idx) in msg.content.split('\n')" :key="idx">
          {{ line }}<br v-if="idx < msg.content.split('\n').length - 1" />
        </span>
        <!-- Sources section -->
        <div v-if="msg.sources && msg.sources.length" class="mt-2">
          <div class="text-xs text-gray-500 dark:text-gray-400 font-medium">Sources:</div>
          <ul>
            <li>
              <a :href="getSourceUrl(msg.sources[0])" target="_blank" rel="noopener" class="text-blue-600 dark:text-blue-400 underline break-all">{{ msg.sources[0] }}</a>
            </li>
            <template v-if="msg.sources.length > 1">
              <li v-if="showAllSources" v-for="(src, i) in msg.sources.slice(1)" :key="i + 1">
                <a :href="getSourceUrl(src)" target="_blank" rel="noopener" class="text-blue-600 dark:text-blue-400 underline break-all">{{ src }}</a>
              </li>
              <li>
                <button v-if="!showAllSources" @click="toggleSources" class="text-xs text-blue-500 dark:text-blue-300 mt-1">+{{ msg.sources.length - 1 }} more</button>
                <button v-else @click="toggleSources" class="text-xs text-blue-500 dark:text-blue-300 mt-1">Show less</button>
              </li>
            </template>
          </ul>
        </div>
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
</template>

<style scoped>
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
</style>
