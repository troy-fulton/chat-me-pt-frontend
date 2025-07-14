<template>
  <div class="chat-message-row chat-message-row-assistant">
    <ChatBubbleGroup :msg="{ role: 'assistant', content: message || '', sources: [] }" is-typing :key="key" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import ChatBubbleGroup from './ChatBubbleGroup.vue'
const props = defineProps({
  message: {
    type: String,
    default: ''
  }
})
const key = ref(props.message)
watch(() => props.message, (val) => {
  key.value = val
})
</script>

<style scoped>
/* You can add custom styles here if needed */
</style>
