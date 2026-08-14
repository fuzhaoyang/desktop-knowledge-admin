<template>
  <div class="admin-chat">
    <aside
      class="sidebar"
      :class="{ 'mobile-show': isMobile && sidebarVisible, 'mobile-hide': isMobile && !sidebarVisible }"
    >
      <div class="sidebar-header">
        <h3>{{ $t('chat.sessionList') }}</h3>
        <button class="refresh-btn" :title="$t('chat.refresh')" @click="loadSessions">
          <ReloadOutlined />
        </button>
      </div>
      <div class="session-list">
        <div
          v-for="s in sessions"
          :key="s.session_id"
          class="session-item"
          :class="{ active: currentSession === s.session_id }"
          @click="selectSession(s.session_id)"
        >
          <div class="session-info">
            <div class="session-id">{{ s.session_id.slice(0, 8) }}</div>
            <div class="session-status" :class="s.status">
              {{ s.status === 'waiting' ? $t('chat.statusWaiting') : $t('chat.statusChatting') }}
            </div>
          </div>
          <div class="session-last">{{ lastPreview(s) }}</div>
        </div>
        <div v-if="!sessions.length" class="empty">{{ $t('chat.emptySessions') }}</div>
      </div>
    </aside>

    <div v-if="isMobile && sidebarVisible" class="sidebar-mask" @click="sidebarVisible = false"></div>

    <section class="chat-area">
      <div class="chat-header">
        <div class="header-left">
          <button v-if="isMobile" class="hamburger-btn" :title="$t('chat.sessionList')" @click="sidebarVisible = true">
            <MenuOutlined />
          </button>
          <CustomerServiceOutlined class="header-icon" />
          <span>{{ $t('chat.adminTitle') }}</span>
        </div>
        <div class="header-center">
          <span class="header-user">{{ currentSession ? '用户 ' + currentSession.slice(0, 8) : $t('chat.waitingConnect') }}</span>
        </div>
        <div class="header-actions">
          <button v-if="currentSession" class="end-btn" @click="endSession">{{ $t('chat.endSession') }}</button>
        </div>
      </div>
      <div ref="msgsRef" class="msg-list">
        <div
          v-for="(m, i) in currentMessages"
          :key="i"
          class="msg"
          :class="m.role"
        >
          <div class="avatar">
            <UserOutlined v-if="m.role === 'user'" />
            <CustomerServiceOutlined v-else-if="m.role === 'admin'" />
            <InfoCircleOutlined v-else />
          </div>
          <div class="bubble">{{ m.content }}</div>
        </div>
      </div>
      <div v-if="currentSession" class="input-area">
        <div class="input-toolbar">
          <div class="emoji-wrapper">
            <button class="toolbar-btn" :title="$t('chat.emoji')" @click="emojiPickerOpen = !emojiPickerOpen">
              <SmileOutlined />
            </button>
            <div v-if="emojiPickerOpen" class="emoji-panel" @click.stop>
              <div class="emoji-grid">
                <span
                  v-for="emoji in emojiList"
                  :key="emoji"
                  class="emoji-item"
                  @click="insertEmoji(emoji)"
                >{{ emoji }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="input-container">
          <textarea
            ref="inputRef"
            v-model="inputText"
            class="chat-input"
            :placeholder="$t('chat.adminInputPlaceholder')"
            :maxlength="5000"
            rows="1"
            @keydown="onInputKeydown"
            @input="autoResize"
          ></textarea>
          <div class="input-actions">
            <span class="char-count">{{ inputText.length }}/5000</span>
            <button
              class="send-btn"
              :disabled="!inputText.trim()"
              :title="$t('chat.send')"
              @click="send"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a1 1 0 00-1.38 1.21L4.5 12l-2.48 7.19a1 1 0 001.38 1.21z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
export default {
  name: 'AdminChat',
  async serverPrefetch() {
    return {
      title: '前端小阳仔_人工客服后台',
      meta: {
        keywords: '前端小阳仔,人工客服,在线客服',
        description: '人工客服后台管理系统，实时处理用户咨询请求。',
        tag: '前端文章',
        url: 'https://code-nav.top/admin/chat',
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
import { ref, onMounted, onUnmounted, nextTick, onBeforeUnmount } from 'vue';
import {
  MenuOutlined,
  ReloadOutlined,
  UserOutlined,
  CustomerServiceOutlined,
  InfoCircleOutlined,
  SmileOutlined
} from '@ant-design/icons-vue';
import i18n from '@/language';

const API_BASE = 'https://code-nav.top'
const WS_BASE = 'wss://code-nav.top'

interface SessionMessage {
  role: string;
  content: string;
  ts?: number;
}

interface ChatSession {
  session_id: string;
  status: string;
  messages: SessionMessage[];
}

const sessions = ref<ChatSession[]>([]);
const currentSession = ref('');
const currentMessages = ref<SessionMessage[]>([]);
const inputText = ref('');
const msgsRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLTextAreaElement | null>(null);
const isMobile = ref(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
const sidebarVisible = ref(false);
const verified = ref(typeof window !== 'undefined' ? !!sessionStorage.getItem('admin_chat_verified') : false);
const emojiPickerOpen = ref(false);

const emojiList = [
  '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '😘', '🥰', '😗',
  '🙂', '🤗', '🤩', '🤔', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫',
  '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '😖', '😞', '😟',
  '😤', '😢', '😭', '😦', '😧', '😨', '😬', '😰', '😱', '😳', '🤪', '😵', '😡', '😠', '🤬', '😷',
  '🤒', '🤕', '🤢', '🤮', '🥳', '🥺', '😎', '🤓', '🤠', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘',
  '👏', '🙌', '🙏', '💪', '🔥', '✨', '🎉', '🎊', '💯', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤'
];

function insertEmoji(emoji: string) {
  const el = inputRef.value;
  if (!el) return;
  const start = el.selectionStart ?? inputText.value.length;
  const end = el.selectionEnd ?? inputText.value.length;
  inputText.value = inputText.value.slice(0, start) + emoji + inputText.value.slice(end);
  nextTick(() => {
    el.focus();
    const pos = start + emoji.length;
    el.setSelectionRange(pos, pos);
  });
}

function onDocClick(e: MouseEvent) {
  const wrapper = (e.target as HTMLElement).closest('.emoji-wrapper');
  if (!wrapper) emojiPickerOpen.value = false;
}
let ws: WebSocket | null = null;

function checkScreenWidth() {
  isMobile.value = window.innerWidth <= 768;
  if (!isMobile.value) {
    sidebarVisible.value = false;
  }
}

async function loadSessions() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/sessions?secret_key=612731`);
    const data = await res.json();
    sessions.value = data.sessions || [];
  } catch {
    // ignore
  }
}

function lastPreview(s: ChatSession): string {
  const msgs = s.messages || [];
  const last = msgs[msgs.length - 1];
  if (!last) return '';
  return (last.content || '').slice(0, 30);
}

function selectSession(sid: string) {
  currentSession.value = sid;
  currentMessages.value = [];
  sidebarVisible.value = false;
  connectAdmin(sid);
}

function connectAdmin(sid: string) {
  if (ws) ws.close();
  ws = new WebSocket(`${WS_BASE}/ws/admin`);
  ws.onopen = () => {
    ws?.send(JSON.stringify({ secret_key: '612731', session_id: sid }));
  };
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === 'history') {
      currentMessages.value = data.messages || [];
      nextTick(scrollBottom);
    } else if (data.type === 'human_msg') {
      currentMessages.value.push({ role: data.role, content: data.content });
      nextTick(scrollBottom);
    } else if (data.type === 'human_end') {
      currentMessages.value.push({ role: 'system', content: i18n.global.t('chat.userEndedSession') });
    }
  };
  ws.onclose = () => {
    ws = null;
  };
}

function scrollBottom() {
  if (msgsRef.value) msgsRef.value.scrollTop = msgsRef.value.scrollHeight;
}

function onInputKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send();
  }
}

function autoResize() {
  const el = inputRef.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function send() {
  const text = inputText.value.trim();
  if (!text || !ws || ws.readyState !== WebSocket.OPEN) return;
  currentMessages.value.push({ role: 'admin', content: text });
  ws.send(JSON.stringify({ type: 'human_msg', content: text }));
  inputText.value = '';
  nextTick(() => {
    autoResize();
    scrollBottom();
    inputRef.value?.focus();
  });
}

function endSession() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'human_end' }));
  }
  currentSession.value = '';
  loadSessions();
}

function activateSessionFromQuery() {
  const params = new URLSearchParams(location.search);
  const sid = params.get('session');
  if (sid) {
    selectSession(sid);
  }
}

let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  checkScreenWidth();
  window.addEventListener('resize', checkScreenWidth);
  document.addEventListener('click', onDocClick);
  if (verified.value) {
    activateSessionFromQuery();
  }
  loadSessions();
  timer = setInterval(loadSessions, 10000);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreenWidth);
  document.removeEventListener('click', onDocClick);
});

onUnmounted(() => {
  ws?.close();
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.admin-chat {
  display: flex;
  height: 100%;
  background: #f5f7fd;
  overflow: hidden;
}
.sidebar {
  width: 300px;
  background: #fff;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
  color: #303133;
}
.sidebar-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}
.refresh-btn {
  background: transparent;
  border: none;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 14px;
  color: #909399;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background 0.2s, color 0.2s;
}
.refresh-btn:hover {
  background: #f5f7fd;
  color: var(--tag-bg, #1677ff);
}
.session-list {
  flex: 1;
  overflow-y: auto;
}
.session-item {
  padding: 14px 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.2s;
}
.session-item:hover {
  background: #f5f7fd;
}
.session-item.active {
  background: rgba(22,119,255,0.06);
  border-left: 3px solid var(--tag-bg, #1677ff);
}
.session-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.session-id {
  font-weight: 600;
  font-size: 13px;
  color: #303133;
}
.session-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
}
.session-status.waiting {
  background: #fffbe6;
  color: #d48806;
}
.session-status.chatting {
  background: #f6ffed;
  color: #389e0d;
}
.session-last {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.empty {
  text-align: center;
  color: #999;
  padding: 40px 0;
  font-size: 14px;
}
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  color: #303133;
  font-weight: 600;
  position: relative;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.header-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.header-user {
  font-size: 12px;
  font-weight: 400;
  opacity: 0.5;
  animation: modelFade 3s ease-in-out infinite;
  white-space: nowrap;
}
@keyframes modelFade {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.9; }
}
.header-icon {
  font-size: 18px;
  color: var(--tag-bg, #1677ff);
}
.hamburger-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #606266;
  padding: 0;
  display: flex;
  align-items: center;
  opacity: 0.85;
  transition: opacity 0.2s;
}
.hamburger-btn:hover {
  opacity: 1;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
.end-btn {
  background: transparent;
  color: #e8494e;
  border: 1px solid #fde2e2;
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.end-btn:hover {
  background: #e8494e;
  color: #fff;
  border-color: #e8494e;
}
.msg-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;
  background: #f5f7fd;
}
.msg {
  margin-bottom: 16px;
  display: flex;
  gap: 10px;
  animation: msg-in 0.3s ease-out;
}
@keyframes msg-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.msg.admin {
  flex-direction: row-reverse;
}
.msg .avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
}
.msg.user .avatar {
  background: #f0f0f0;
  color: #909399;
}
.msg.admin .avatar {
  background: var(--tag-bg, #1677ff);
  color: #fff;
}
.msg.system .avatar {
  background: #f5f5f5;
  color: #bbb;
}
.msg .bubble {
  max-width: 65%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}
.msg.user .bubble {
  background: #fff;
  color: #303133;
  border: 1px solid #f0f0f0;
  border-bottom-left-radius: 4px;
}
.msg.admin .bubble {
  background: var(--tag-bg, #1677ff);
  color: #fff;
  border-bottom-right-radius: 4px;
}
.msg.system .bubble {
  background: transparent;
  color: #bbb;
  font-style: italic;
}
.input-area {
  background: #fff;
  border-top: 1px solid #f0f0f0;
}
.input-toolbar {
  display: flex;
  align-items: center;
  padding: 6px 16px 0;
}
.toolbar-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #595959;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}
.toolbar-btn:hover {
  color: #1677ff;
  background: rgba(0,0,0,0.04);
}
.emoji-wrapper {
  position: relative;
}
.emoji-panel {
  position: absolute;
  bottom: 100%;
  left: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  padding: 8px;
  z-index: 100;
  margin-bottom: 4px;
}
.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
  max-height: 240px;
  overflow-y: auto;
  width: 280px;
  scrollbar-width: none;
}
.emoji-grid::-webkit-scrollbar {
  display: none;
}
.emoji-item {
  font-size: 20px;
  cursor: pointer;
  text-align: center;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.15s;
}
.emoji-item:hover {
  background: rgba(0,0,0,0.06);
}
.input-container {
  position: relative;
  padding: 0 16px;
}
.chat-input {
  width: 100%;
  border: none;
  padding: 12px 110px 12px 0;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
  min-height: 100px;
  background: transparent;
}
.input-actions {
  position: absolute;
  bottom: 8px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.char-count {
  font-size: 11px;
  color: #bbb;
  white-space: nowrap;
}
.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--tag-bg, #1677ff);
  color: #fff;
  transition: all 0.2s;
  padding: 0;
}
.send-btn:hover:not(:disabled) {
  opacity: 0.85;
  transform: scale(1.05);
}
.send-btn:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}
.send-btn svg {
  width: 18px;
  height: 18px;
}
.sidebar-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.45);
  z-index: 99;
}
@media (max-width: 768px) {
  .admin-chat {
    position: relative;
  }
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 80%;
    max-width: 300px;
    z-index: 100;
  }
  .sidebar.mobile-hide {
    transform: translateX(-100%);
  }
  .chat-header {
    padding: 12px 16px;
  }
  .msg-list {
    padding: 12px;
  }
  .msg .bubble {
    max-width: 75%;
    font-size: 13px;
  }
  .msg .avatar {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
  .input-container {
    padding: 0 12px;
  }
  .chat-input {
    font-size: 16px;
    padding: 10px 100px 10px 0;
    min-height: 100px;
    max-height: 200px;
  }
}
</style>
