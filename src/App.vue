<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Welcome from './components/Welcome.vue'
import Chat from './components/Chat.vue'
import AppHeader from './components/AppHeader.vue'

const showWelcome = ref(false)
const baseUrl = import.meta.env.VITE_API_BASE_URL

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
</script>

<template>
  <div>
    <AppHeader />
    <Welcome v-if="showWelcome" @done="onWelcomeDone" />
    <Chat v-else />
  </div>
</template>