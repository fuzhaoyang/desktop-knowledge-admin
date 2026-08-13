import { ref } from 'vue'

const AUTH_USER = 'fuchaoyang'
const AUTH_PASS = '612731'
const STORAGE_KEY = 'auth_logged_in'

export const isLoggedIn = ref(localStorage.getItem(STORAGE_KEY) === '1')

export function login(username: string, password: string, remember: boolean): { ok: boolean; error?: string } {
  if (username === AUTH_USER && password === AUTH_PASS) {
    isLoggedIn.value = true
    if (remember) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
    return { ok: true }
  }
  return { ok: false, error: '账号或密码错误' }
}

export function logout() {
  isLoggedIn.value = false
  localStorage.removeItem(STORAGE_KEY)
}
