<script setup>
import { ref } from 'vue'
import Welcome from './components/Welcome.vue'
import Chat from './components/Chat.vue'
import AppHeader from './components/AppHeader.vue'

const showWelcome = ref(true)

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