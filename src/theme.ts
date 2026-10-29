import { ref } from 'vue'

const KEY = 'theme'

export const theme = ref<'light' | 'dark'>(localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light')

document.documentElement.dataset.theme = theme.value

let darkStyle: HTMLStyleElement | null = null

async function applyDarkCss(on: boolean) {
  if (on) {
    if (!darkStyle) {
      const { default: css } = await import('ant-design-vue/dist/antd.dark.css?inline')
      darkStyle = document.createElement('style')
      darkStyle.dataset.antdDark = ''
      darkStyle.textContent = css
      document.head.appendChild(darkStyle)
    }
  } else if (darkStyle) {
    darkStyle.remove()
    darkStyle = null
  }
}

export function setTheme(next: 'light' | 'dark') {
  theme.value = next
  document.documentElement.dataset.theme = next
  localStorage.setItem(KEY, next)
  applyDarkCss(next === 'dark')
}

export function toggleTheme() {
  setTheme(theme.value === 'dark' ? 'light' : 'dark')
}

export const themeReady = applyDarkCss(theme.value === 'dark')
