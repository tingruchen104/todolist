import { ref, watch, onMounted } from 'vue'

const STORAGE_KEY = 'todolist_dark_mode'

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
const isDark = ref(localStorage.getItem(STORAGE_KEY) === null
  ? prefersDark.matches
  : localStorage.getItem(STORAGE_KEY) === 'true'
)

function apply(dark) {
  document.documentElement.classList.toggle('dark', dark)
}

apply(isDark.value)

watch(isDark, (val) => {
  apply(val)
  localStorage.setItem(STORAGE_KEY, String(val))
})

prefersDark.addEventListener('change', (e) => {
  if (localStorage.getItem(STORAGE_KEY) === null) {
    isDark.value = e.matches
  }
})

export function useDarkMode() {
  function toggle() {
    isDark.value = !isDark.value
  }
  return { isDark, toggle }
}
