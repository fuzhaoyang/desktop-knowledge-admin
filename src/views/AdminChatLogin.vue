<template>
  <div class="admin-login">
    <div class="login-box">
      <h2>{{ $t('chat.loginTitle') }}</h2>
      <input
        v-model="code"
        type="password"
        :placeholder="$t('chat.loginPlaceholder')"
        @keydown.enter="verify"
      />
      <button @click="verify">{{ $t('chat.loginButton') }}</button>
      <p v-if="err" class="err">{{ err }}</p>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'AdminChatLogin',
  async serverPrefetch() {
    return {
      title: '前端小阳仔_客服登录',
      meta: {
        keywords: '前端小阳仔,人工客服,客服登录',
        description: '人工客服后台登录页面。',
        tag: '前端文章',
        url: 'https://code-nav.top/admin/chat/login',
        type: 'article',
        published_time: '2026-07-31T00:00:00',
        modified_time: new Date(),
        imgUrl: ''
      }
    };
  }
};
</script>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import i18n from '@/language';

const router = useRouter();
const code = ref('');
const err = ref('');

function verify() {
  if (code.value === '612731') {
    sessionStorage.setItem('admin_chat_verified', '1');
    router.push('/admin/chat');
  } else {
    err.value = i18n.global.t('chat.loginError');
  }
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
}
.login-box {
  background: #fff;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  width: 320px;
  text-align: center;
}
.login-box h2 {
  margin: 0 0 24px;
  color: #1677ff;
}
.login-box input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  margin-bottom: 16px;
}
.login-box button {
  width: 100%;
  padding: 10px;
  background: #1677ff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}
.login-box button:hover {
  opacity: 0.9;
}
.err {
  color: #ff4d4f;
  font-size: 13px;
  margin: 12px 0 0;
}
</style>
