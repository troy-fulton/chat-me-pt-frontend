<script setup>
import axios from 'axios'
import { ref, watch, onMounted } from 'vue'

const emit = defineEmits(['done'])

const baseUrl = import.meta.env.VITE_API_BASE_URL
const name = ref('')
const interests = ref([])
const company = ref('')
const loading = ref(false)
const submitted = ref(false)
const error = ref('')

const interestOptions = [
  { label: "Troy's professional life", value: 'professional' },
  { label: "Troy's personal life", value: 'personal' }
]

async function submitForm() {
  loading.value = true
  error.value = ''
  try {
    
    await axios.post(`${baseUrl}/api/welcome/`, {
      name: name.value,
      interests: interests.value.join(','),
      company: company.value
    }, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    })
    submitted.value = true
  } catch (e) {
    error.value = 'Submission failed. Please try again.'
  } finally {
    loading.value = false
  }
}

function skip() {
  submitted.value = true
}

watch(submitted, (val) => {
  if (val) emit('done')
})

onMounted(async () => {
  try {
    const res = await axios.get(`${baseUrl}/api/welcome/`, {
      withCredentials: true
    })
    if (res.data && res.data.visitor_exists) {
      emit('done')
    }
  } catch (e) {
    // Optionally handle error, but don't block the welcome screen
  }
})
</script>

<template>
  <div class="welcome-container bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
    <h1 class="welcome-title text-blue-600 dark:text-blue-400">Welcome to Chat✨Me✨PT</h1>
    <p class="welcome-description text-zinc-600 dark:text-zinc-300">
      Your AI-powered chat assistant. Ask me anything!
    </p>
    <form v-if="!submitted" @submit.prevent="submitForm" class="welcome-form">
      <div class="welcome-field">
        <label class="welcome-label text-zinc-900 dark:text-zinc-100">What's your name?</label>
        <input v-model="name" class="welcome-input bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700" placeholder="Your name" />
      </div>
      <div class="welcome-field">
        <label class="welcome-label text-zinc-900 dark:text-zinc-100">What are you interested in?</label>
        <div class="welcome-checkbox-group">
          <label v-for="opt in interestOptions" :key="opt.value" class="welcome-checkbox-label text-zinc-700 dark:text-zinc-200">
            <input type="checkbox" :value="opt.value" v-model="interests" class="welcome-checkbox accent-blue-600 dark:accent-blue-400" />
            {{ opt.label }}
          </label>
        </div>
      </div>
      <div class="welcome-field">
        <label class="welcome-label text-zinc-900 dark:text-zinc-100">What organization do you represent, if any?</label>
        <input v-model="company" class="welcome-input bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700" placeholder="Organization (optional)" />
      </div>
      <div class="welcome-actions">
        <button type="submit" :disabled="loading" class="welcome-submit bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-400">{{ loading ? 'Submitting...' : 'Submit' }}</button>
        <button type="button" @click="skip" class="welcome-skip text-zinc-500 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">Skip</button>
      </div>
      <div v-if="error" class="welcome-error text-red-600 dark:text-red-400">{{ error }}</div>
    </form>
    <div v-else class="welcome-success text-green-500 dark:text-green-400">
      Thank you! Your information has been submitted or skipped.
    </div>
  </div>
</template>

<style scoped>
.welcome-container {
  max-width: 28rem;
  margin: 3rem auto 0 auto;
  padding: 2.5rem 2rem 2rem 2rem;
  border-radius: 1.25rem;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08), 0 1.5px 4px 0 rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.welcome-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  letter-spacing: -1px;
  text-align: center;
}
.welcome-description {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  text-align: center;
}
.welcome-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.welcome-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.welcome-label {
  font-weight: 600;
  margin-bottom: 0.25rem;
}
.welcome-input {
  padding: 0.6rem 1rem;
  border-width: 1.5px;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border 0.2s, box-shadow 0.2s;
}
.welcome-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px #2563eb33;
}
.welcome-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.welcome-checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}
.welcome-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}
.welcome-submit {
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}
.welcome-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.welcome-skip {
  background: none;
  border: none;
  font-size: 0.95rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0.5rem 0.75rem;
  border-radius: 0.3rem;
  transition: background 0.2s;
}
.welcome-error {
  text-align: center;
  margin-top: 0.5rem;
}
.welcome-success {
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 2rem;
}
</style>
