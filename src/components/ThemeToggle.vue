<template>
  <button @click="toggle" class="p-2 rounded bg-gray-300 dark:bg-gray-700">
    {{ isDark ? '☀️' : '🌙' }}
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isDark = ref(false)

function applyTheme() {
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

function toggle() {
  isDark.value = !isDark.value
  applyTheme()
}

onMounted(() => {
  // Load saved theme or use system preference
  const saved = localStorage.getItem('theme')
  if (saved) {
    isDark.value = saved === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme()
})
</script>