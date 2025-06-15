<script setup>
const props = defineProps({
  msg: { type: Object, required: true }
})
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
