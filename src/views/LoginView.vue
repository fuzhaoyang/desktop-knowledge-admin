<template>
  <div class="login-page" ref="pageRef" @mousemove="onMouseMove">
    <div class="bg-blob blob-1" :style="parallaxStyle(0)" />
    <div class="bg-blob blob-2" :style="parallaxStyle(1)" />
    <div class="bg-blob blob-3" :style="parallaxStyle(2)" />
    <div class="login-card" :class="{ 'card-leaving': leaving }">
      <h1 class="login-title">CodeNav 管理 登录</h1>
      <form class="login-form" @submit.prevent="onSubmit">
        <input
          v-model="username"
          class="login-input"
          type="text"
          placeholder="账号"
          autocomplete="username"
          @keydown.enter.prevent="onSubmit"
        />
        <input
          v-model="password"
          class="login-input"
          type="password"
          placeholder="密码"
          autocomplete="current-password"
          @keydown.enter.prevent="onSubmit"
        />
        <label class="remember-row">
          <input v-model="remember" type="checkbox" /> 记住我
        </label>
        <button class="login-btn" type="submit">{{ submitting ? '登录中…' : '登 录' }}</button>
        <p v-if="error" class="login-error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { login } from '../auth'

const username = ref('')
const password = ref('')
const remember = ref(false)
const submitting = ref(false)
const error = ref('')
const leaving = ref(false)
const pageRef = ref<HTMLElement | null>(null)

const mouse = { x: 0, y: 0 }
const parallax = ref({ x: 0, y: 0 })

const factors = [20, 14, 28]

function parallaxStyle(i: number) {
  const f = factors[i]
  return { transform: `translate(${parallax.value.x * f}px, ${parallax.value.y * f}px)` }
}

function onMouseMove(e: MouseEvent) {
  const el = pageRef.value
  if (!el) return
  const r = el.getBoundingClientRect()
  mouse.x = (e.clientX - r.left) / r.width - 0.5
  mouse.y = (e.clientY - r.top) / r.height - 0.5
  parallax.value = { x: mouse.x, y: mouse.y }
}

function onSubmit() {
  if (submitting.value) return
  submitting.value = true
  error.value = ''
  const result = login(username.value.trim(), password.value, remember.value)
  if (result.ok) {
    leaving.value = true
  } else {
    error.value = result.error || '登录失败'
    password.value = ''
    submitting.value = false
  }
}
</script>

<style scoped>
.login-page {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f5f7fd;
}
.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.75;
  pointer-events: none;
  will-change: transform;
  transition: transform 0.6s ease-out;
}
.blob-1 {
  width: 360px; height: 360px;
  background: var(--tag-bg, #1677ff);
  top: -60px; left: -60px;
  animation: drift1 24s ease-in-out infinite alternate;
}
.blob-2 {
  width: 320px; height: 320px;
  background: #722ed1;
  bottom: -80px; right: -40px;
  animation: drift2 28s ease-in-out infinite alternate;
}
.blob-3 {
  width: 280px; height: 280px;
  background: #36cfc9;
  top: 40%; left: 55%;
  animation: drift3 22s ease-in-out infinite alternate;
}
@keyframes drift1 {
  from { transform: translate(0, 0) scale(1); }
  to   { transform: translate(60px, 80px) scale(1.15); }
}
@keyframes drift2 {
  from { transform: translate(0, 0) scale(1); }
  to   { transform: translate(-50px, -60px) scale(1.1); }
}
@keyframes drift3 {
  from { transform: translate(0, 0) scale(1); }
  to   { transform: translate(-80px, 40px) scale(1.2); }
}
@media (prefers-reduced-motion: reduce) {
  .bg-blob { animation: none; transition: none; }
}
.login-card {
  position: relative;
  z-index: 1;
  width: 340px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.45s ease;
}
.login-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(22,119,255,0.15);
}
.login-card.card-leaving {
  opacity: 0;
  transform: scale(0.94);
  pointer-events: none;
}
.login-title {
  margin: 0 0 28px;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  text-align: center;
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.login-input {
  height: 40px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  font-size: 14px;
  color: #303133;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.login-input:focus {
  outline: none;
  border-color: var(--tag-bg, #1677ff);
  box-shadow: 0 0 0 3px rgba(22,119,255,0.12);
}
.remember-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  user-select: none;
}
.remember-row input { cursor: pointer; }
.login-btn {
  height: 40px;
  margin-top: 6px;
  border: none;
  border-radius: 8px;
  background: var(--tag-bg, #1677ff);
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}
.login-btn:hover { background: #095ed9; }
.login-btn:active { transform: scale(0.97); }
.login-error {
  margin: 4px 0 0;
  font-size: 13px;
  color: #e8494e;
  text-align: center;
}
</style>
