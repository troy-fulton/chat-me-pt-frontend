<script setup>
import ThemeToggle from './ThemeToggle.vue'
</script>

<template>
  <div class="chat-header chat-header-animate">
    <span class="chat-title text-blue-600 dark:text-blue-300">
       Chat✨Me✨PT
    </span>
    <ThemeToggle />
  </div>
</template>

<style scoped>
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 1rem;
}

.chat-title {
  font-size: 2rem;
  font-weight: bold;
}

.chat-header-animate {
  transition: background 0.3s, color 0.3s;
}
</style>