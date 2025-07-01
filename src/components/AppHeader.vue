<script setup>
import { ref, onMounted } from 'vue'
import ThemeToggle from './ThemeToggle.vue'
</script>

<template>
  <div class="app-header dark:">
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
  background: var(--color-background, #fff);
  z-index: 10;
}

.dark .app-header {
  background: #101828;
}

.chat-title {
  font-size: 2rem;
  font-weight: bold;
  margin: 0 auto;
  flex: 1;
  text-align: center;
}

.app-header-animate {
  transition: background 0.2s, color 0.2s;
}
</style>