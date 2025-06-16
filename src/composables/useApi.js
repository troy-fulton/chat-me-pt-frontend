// src/composables/useApi.js
import { ref } from 'vue'
import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL

export function useApi() {
  const loading = ref(false)
  const error = ref(null)

  const postPrompt = async (prompt, conversation_id) => {
    loading.value = true
    error.value = null
    try {
      const res = await axios.post(
        `${baseURL}/api/chat/?conversation_id=${conversation_id}`,
        { message: prompt },
        { withCredentials: true }
      )
      return res.data.response
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  return { postPrompt, loading, error }
}
