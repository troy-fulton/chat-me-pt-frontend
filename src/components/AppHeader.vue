<script setup>
import ThemeToggle from './ThemeToggle.vue'
</script>

<template>
  <div class="app-header">
    <span class="chat-title text-blue-600 dark:text-blue-300">
       Chat✨Me✨PT
    </span>
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
  z-index: 50;
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
</style>