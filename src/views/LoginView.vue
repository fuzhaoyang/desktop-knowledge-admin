<template>
  <div class="login-page">
    <div class="auth-bg3d" aria-hidden="true">
  <div class="auth-aurora"></div>
  <div class="auth-stars"></div>
  <svg class="auth-scene" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" focusable="false">
    <defs>
      <pattern id="authSlots" width="120" height="26" patternUnits="userSpaceOnUse">
        <rect class="rack-slot" x="10" y="6" width="100" height="14" rx="3"/>
      </pattern>
      <radialGradient id="authCore" cx="50%" cy="50%" r="50%">
        <stop class="core-a" offset="0%"/>
        <stop class="core-b" offset="100%"/>
      </radialGradient>
      <linearGradient id="authScan" x1="0" y1="0" x2="0" y2="1">
        <stop class="scan-a" offset="0%"/>
        <stop class="scan-b" offset="50%"/>
        <stop class="scan-c" offset="100%"/>
      </linearGradient>
    </defs>

    <!-- 左侧：服务器机柜阵列 -->
    <g class="auth-racks">
      <g transform="translate(80 300)">
        <rect class="rack-body" x="0" y="0" width="130" height="350" rx="12"/>
        <rect class="rack-face" x="0" y="0" width="130" height="350" rx="12" fill="url(#authSlots)"/>
        <rect class="rack-scan" style="--d:0s" x="6" y="-30" width="118" height="26" rx="6" fill="url(#authScan)"/>
        <rect class="rack-load" style="--d:0s" x="14" y="248" width="102" height="4" rx="2"/>
        <rect class="rack-load" style="--d:1.2s" x="14" y="262" width="102" height="4" rx="2"/>
        <circle class="rack-led" style="--d:0s" cx="118" cy="19" r="3"/>
        <circle class="rack-led" style="--d:.4s" cx="118" cy="71" r="3"/>
        <circle class="rack-led" style="--d:.9s" cx="118" cy="123" r="3"/>
        <circle class="rack-led" style="--d:1.3s" cx="118" cy="175" r="3"/>
        <circle class="rack-led" style="--d:.2s" cx="118" cy="227" r="3"/>
        <circle class="rack-led" style="--d:1.6s" cx="118" cy="279" r="3"/>
      </g>
      <g transform="translate(240 360)">
        <rect class="rack-body" x="0" y="0" width="130" height="350" rx="12"/>
        <rect class="rack-face" x="0" y="0" width="130" height="350" rx="12" fill="url(#authSlots)"/>
        <rect class="rack-scan" style="--d:2.2s" x="6" y="-30" width="118" height="26" rx="6" fill="url(#authScan)"/>
        <rect class="rack-load" style="--d:.6s" x="14" y="248" width="102" height="4" rx="2"/>
        <rect class="rack-load" style="--d:1.8s" x="14" y="262" width="102" height="4" rx="2"/>
        <circle class="rack-led" style="--d:.6s" cx="118" cy="19" r="3"/>
        <circle class="rack-led" style="--d:1.1s" cx="118" cy="71" r="3"/>
        <circle class="rack-led" style="--d:.3s" cx="118" cy="123" r="3"/>
        <circle class="rack-led" style="--d:1.8s" cx="118" cy="175" r="3"/>
        <circle class="rack-led" style="--d:.8s" cx="118" cy="227" r="3"/>
        <circle class="rack-led" style="--d:1.4s" cx="118" cy="279" r="3"/>
      </g>
    </g>

    <!-- 中间：数据流 + 输送光点（终点飞入 AI 大脑核心） -->
    <g class="auth-flows">
      <path class="flow" pathLength="100" d="M 380 420 C 700 420 1000 400 1180 400"/>
      <path class="flow" style="--d:.8s" pathLength="100" d="M 380 480 C 720 480 1000 420 1180 410"/>
      <path class="flow" style="--d:1.6s" pathLength="100" d="M 380 540 C 740 540 1000 440 1180 420"/>
      <path class="flow" style="--d:2.6s" pathLength="100" d="M 380 585 C 700 590 980 540 1180 470"/>
      <path class="flow-packet" pathLength="100" d="M 380 420 C 700 420 1000 400 1180 400"/>
      <path class="flow-packet" style="--d:2.8s" pathLength="100" d="M 380 585 C 700 590 980 540 1180 470"/>
      <path class="flow-packet" style="--d:1.1s" pathLength="100" d="M 380 480 C 720 480 1000 420 1180 410"/>
      <path class="flow-packet" style="--d:2.2s" pathLength="100" d="M 380 540 C 740 540 1000 440 1180 420"/>
      <text class="bin" style="--d:0s" x="430" y="412">011001</text>
      <text class="bin" style="--d:1.2s" x="630" y="468">10110</text>
      <text class="bin" style="--d:2.4s" x="830" y="522">0101</text>
      <text class="bin" style="--d:2s" x="600" y="580">11010</text>
    </g>

    <!-- 右侧：人头轮廓（面朝左）+ 脑神经网络 -->
    <g class="auth-head">
      <circle class="nn-core" cx="1180" cy="400" r="140" fill="url(#authCore)"/>
      <path class="head-outline" d="M 1190 258 C 1120 258 1060 300 1030 360 L 1022 382 C 1010 400 995 412 998 424 C 1002 436 1020 440 1030 446 C 1026 456 1034 462 1030 472 C 1046 500 1080 520 1100 540 C 1160 566 1230 560 1270 520 C 1330 460 1340 350 1270 300 C 1250 278 1220 258 1190 258 Z"/>
      <g class="brain">
        <path class="brain-outline" d="M 1090 400 C 1080 350 1110 320 1150 320 C 1170 300 1210 300 1230 318 C 1275 320 1300 350 1295 390 C 1310 410 1305 450 1275 465 C 1265 495 1230 505 1205 492 C 1175 505 1135 498 1120 470 C 1090 465 1075 430 1090 400 Z"/>
        <path class="brain-fold" d="M 1120 345 C 1140 370 1140 400 1122 420"/>
        <path class="brain-fold" d="M 1175 330 C 1195 365 1195 415 1175 450"/>
        <path class="brain-fold" d="M 1235 340 C 1255 370 1255 415 1237 445"/>
      </g>
      <g class="nn-edges">
        <line class="nn-edge" x1="1100" y1="345" x2="1180" y2="330"/><line class="nn-edge" x1="1100" y1="345" x2="1180" y2="400"/><line class="nn-edge" x1="1100" y1="345" x2="1180" y2="470"/>
        <line class="nn-edge" x1="1100" y1="400" x2="1180" y2="330"/><line class="nn-edge" x1="1100" y1="400" x2="1180" y2="400"/><line class="nn-edge" x1="1100" y1="400" x2="1180" y2="470"/>
        <line class="nn-edge" x1="1100" y1="455" x2="1180" y2="330"/><line class="nn-edge" x1="1100" y1="455" x2="1180" y2="400"/><line class="nn-edge" x1="1100" y1="455" x2="1180" y2="470"/>
        <line class="nn-edge" x1="1180" y1="330" x2="1260" y2="355"/><line class="nn-edge" x1="1180" y1="330" x2="1260" y2="405"/><line class="nn-edge" x1="1180" y1="330" x2="1260" y2="455"/>
        <line class="nn-edge" x1="1180" y1="400" x2="1260" y2="355"/><line class="nn-edge" x1="1180" y1="400" x2="1260" y2="405"/><line class="nn-edge" x1="1180" y1="400" x2="1260" y2="455"/>
        <line class="nn-edge" x1="1180" y1="470" x2="1260" y2="355"/><line class="nn-edge" x1="1180" y1="470" x2="1260" y2="405"/><line class="nn-edge" x1="1180" y1="470" x2="1260" y2="455"/>
      </g>
      <g class="nn-nodes">
        <circle class="nn-node" style="--d:0s" cx="1100" cy="345" r="7"/>
        <circle class="nn-node" style="--d:.5s" cx="1100" cy="400" r="7"/>
        <circle class="nn-node" style="--d:1s" cx="1100" cy="455" r="7"/>
        <circle class="nn-node" style="--d:.3s" cx="1180" cy="330" r="8"/>
        <circle class="nn-node" style="--d:.8s" cx="1180" cy="400" r="9"/>
        <circle class="nn-node" style="--d:1.3s" cx="1180" cy="470" r="8"/>
        <circle class="nn-node" style="--d:.6s" cx="1260" cy="355" r="7"/>
        <circle class="nn-node" style="--d:1.1s" cx="1260" cy="405" r="7"/>
        <circle class="nn-node" style="--d:1.6s" cx="1260" cy="455" r="7"/>
      </g>
      <!-- 神经信号：沿连线跑动的光点（双向） -->
      <g class="nn-signals">
        <path class="nn-signal" pathLength="100" d="M 1100 345 L 1180 400"/>
        <path class="nn-signal" style="--d:.9s" pathLength="100" d="M 1100 455 L 1180 330"/>
        <path class="nn-signal" style="--d:1.8s" pathLength="100" d="M 1180 400 L 1260 455"/>
        <path class="nn-signal" style="--d:2.7s" pathLength="100" d="M 1260 355 L 1180 400"/>
        <path class="nn-signal" style="--d:1.5s" pathLength="100" d="M 1180 470 L 1100 345"/>
        <path class="nn-signal" style="--d:.9s" pathLength="100" d="M 1100 455 L 1260 355"/>
      </g>
      <!-- 大脑核心：环绕轨道粒子 -->
      <g class="auth-orbit">
        <ellipse class="orbit-ring" cx="1180" cy="400" rx="200" ry="64"/>
        <ellipse class="orbit-ring orbit-ring-b" cx="1180" cy="400" rx="200" ry="64"/>
      </g>
      <!-- 数据流落点：核心外圈级联脉冲 -->
      <g class="auth-sync">
        <circle class="sync-ring" style="--d:0s" cx="1180" cy="400" r="26"/>
        <circle class="sync-ring" style="--d:1.1s" cx="1180" cy="400" r="26"/>
        <circle class="sync-ring" style="--d:2.2s" cx="1180" cy="400" r="26"/>
      </g>
    </g>

    <!-- 下方：拳头 + 食指指向人头（人机交互） -->
    <g class="auth-fist">
      <path class="beam" d="M 1118 682 L 1150 558"/>
      <path class="beam-packet" pathLength="100" d="M 1118 682 L 1150 558"/>
      <g class="auth-ripples">
        <circle class="auth-ripple" cx="1118" cy="690" r="10"/>
        <circle class="auth-ripple" style="--d:1.4s" cx="1118" cy="690" r="10"/>
      </g>
      <g class="auth-finger">
        <path class="finger" d="M 1105 700 C 1105 684 1132 684 1132 700 L 1132 802 C 1132 814 1105 814 1105 802 Z"/>
        <path class="finger-nail" d="M 1110 706 C 1114 700 1124 700 1128 706"/>
        <circle class="finger-tip" cx="1118" cy="690" r="6"/>
      </g>
      <path class="fist" d="M 1088 792 C 1072 804 1068 852 1084 870 C 1102 886 1200 886 1218 870 C 1234 852 1230 804 1214 792 C 1200 782 1102 782 1088 792 Z"/>
      <path class="fist-knuckle" d="M 1142 786 C 1146 776 1158 776 1162 786"/>
      <path class="fist-knuckle" d="M 1168 784 C 1172 774 1184 774 1188 784"/>
      <path class="fist-knuckle" d="M 1194 786 C 1198 776 1210 776 1214 786"/>
      <path class="fist-thumb" d="M 1088 800 C 1074 812 1076 842 1092 852"/>
    </g>
  </svg>
  <div class="auth-sweep"></div>
    </div>
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
  background: var(--bg);
}

.login-page::before {
  content: '';
  position: absolute;
  inset: -30%;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(36% 40% at 24% 30%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%),
    radial-gradient(32% 36% at 78% 74%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 72%);
  filter: blur(28px);
}
.login-page::after {
  content: '';
  position: absolute;
  inset: -40px;
  z-index: 0;
  pointer-events: none;
  background:
    linear-gradient(var(--grid) 1px, transparent 1px) 0 0 / 30px 30px,
    linear-gradient(90deg, var(--grid) 1px, transparent 1px) 0 0 / 30px 30px;
  -webkit-mask-image: radial-gradient(130% 100% at 50% 42%, #000 42%, transparent 88%);
  mask-image: radial-gradient(130% 100% at 50% 42%, #000 42%, transparent 88%);
}

.auth-bg3d {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
  perspective: 1100px;
  transform-style: preserve-3d;
  --tilt-x: 1.2deg;
  --tilt-y: 1deg;
  animation: auth-stage 14s linear infinite;
}
@keyframes auth-stage {
  0%, 100% { transform: rotateX(var(--tilt-x)) rotateY(calc(var(--tilt-y) * -1)); }
  50% { transform: rotateX(calc(var(--tilt-x) * -1)) rotateY(var(--tilt-y)); }
}

.auth-aurora {
  position: absolute;
  inset: -30%;
  z-index: 0;
  pointer-events: none;
  opacity: .35;
  background:
    radial-gradient(42% 34% at 72% 22%, color-mix(in srgb, #7c5cff 26%, transparent), transparent 70%),
    radial-gradient(38% 30% at 24% 76%, color-mix(in srgb, #22d3ee 20%, transparent), transparent 72%),
    radial-gradient(50% 42% at 52% 52%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 75%);
  filter: blur(42px);
  transform: translateZ(-200px);
}
.auth-stars {
  position: absolute;
  inset: -50%;
  z-index: 0;
  pointer-events: none;
  opacity: .25;
  transform: translateZ(-120px);
  background-image:
    radial-gradient(1.6px 1.6px at 20% 30%, color-mix(in srgb, var(--text) 65%, transparent), transparent),
    radial-gradient(1.2px 1.2px at 70% 65%, color-mix(in srgb, var(--accent) 75%, transparent), transparent),
    radial-gradient(1.4px 1.4px at 45% 85%, color-mix(in srgb, var(--text) 55%, transparent), transparent),
    radial-gradient(1px 1px at 85% 15%, color-mix(in srgb, var(--text) 50%, transparent), transparent);
  background-size: 260px 260px, 200px 200px, 320px 320px, 180px 180px;
  animation: auth-twinkle 5s ease-in-out infinite;
}
@keyframes auth-twinkle { 0%, 100% { opacity: .4; } 50% { opacity: .7; } }

.auth-scene {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  opacity: .55;
  transform: translateZ(0);
}
.auth-scene .rack-body { fill: color-mix(in srgb, var(--panel) 62%, transparent); stroke: color-mix(in srgb, var(--accent) 28%, transparent); stroke-width: 1.5; }
.auth-scene .rack-slot { fill: color-mix(in srgb, var(--accent) 20%, transparent); }
.auth-scene .rack-led { fill: var(--ok); opacity: .25; animation: auth-led 3.6s ease-in-out infinite; animation-delay: var(--d, 0s); }
.auth-scene .nn-edge { stroke: color-mix(in srgb, var(--accent) 24%, transparent); stroke-width: 1; }
.auth-scene .nn-node { fill: var(--accent); opacity: .5; transform-box: fill-box; transform-origin: center; animation: auth-node 4.2s ease-in-out infinite; animation-delay: var(--d, 0s); }
.auth-scene .nn-core { transform-box: fill-box; transform-origin: center; animation: auth-core 6s ease-in-out infinite; }
.auth-scene .flow { fill: none; stroke: var(--accent); stroke-width: 2; stroke-linecap: round; stroke-dasharray: 6 14; opacity: .5; animation: auth-flow 3s linear infinite; animation-delay: var(--d, 0s); }
.auth-scene #authCore .core-a { stop-color: var(--accent); stop-opacity: .5; }
.auth-scene #authCore .core-b { stop-color: var(--accent); stop-opacity: 0; }
@keyframes auth-led { 0%, 100% { opacity: .2; } 50% { opacity: .95; } }
@keyframes auth-node { 0%, 100% { opacity: .3; transform: scale(.85); } 50% { opacity: .9; transform: scale(1.12); } }
@keyframes auth-core { 0%, 100% { opacity: .5; transform: scale(.95); } 50% { opacity: .9; transform: scale(1.06); } }
@keyframes auth-flow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -100; } }
@media (max-width: 900px) { .auth-scene { display: none; } }

.auth-scene .rack-scan { animation: auth-scan 4.5s ease-in-out infinite; animation-delay: var(--d, 0s); }
.auth-scene .brain-outline { fill: color-mix(in srgb, var(--accent) 6%, transparent); stroke: color-mix(in srgb, var(--accent) 34%, transparent); stroke-width: 1.5; }
.auth-scene .brain-fold { fill: none; stroke: color-mix(in srgb, var(--accent) 24%, transparent); stroke-width: 1.2; }
.auth-scene .finger { fill: color-mix(in srgb, var(--text) 10%, transparent); stroke: color-mix(in srgb, var(--accent) 32%, transparent); stroke-width: 1.5; }
.auth-scene .finger-nail { fill: none; stroke: color-mix(in srgb, var(--accent) 40%, transparent); stroke-width: 1.4; stroke-linecap: round; }
.auth-scene .finger-tip { fill: var(--accent); opacity: .7; animation: auth-node 3.4s ease-in-out infinite; }
.auth-scene .auth-ripple { fill: none; stroke: var(--accent); stroke-width: 1.5; opacity: 0; transform-box: fill-box; transform-origin: center; animation: auth-ripple 2.8s ease-out infinite; animation-delay: var(--d, 0s); }
.auth-scene .auth-fist { animation: auth-fist-float 5.5s ease-in-out infinite; }
.auth-scene .auth-finger { animation: auth-finger 5s ease-in-out infinite; }
@keyframes auth-fist-float { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-14px) scale(1.02); } }
.auth-scene #authScan .scan-a { stop-color: var(--accent); stop-opacity: 0; }
.auth-scene #authScan .scan-b { stop-color: var(--accent); stop-opacity: .55; }
.auth-scene #authScan .scan-c { stop-color: var(--accent); stop-opacity: 0; }
@keyframes auth-scan { 0% { transform: translateY(0); opacity: 0; } 12% { opacity: .9; } 88% { opacity: .9; } 100% { transform: translateY(380px); opacity: 0; } }
@keyframes auth-ripple { 0% { transform: scale(.35); opacity: .7; } 75%, 100% { transform: scale(3.4); opacity: 0; } }
@keyframes auth-finger { 0%, 100% { transform: translateY(6px); } 50% { transform: translateY(-6px); } }

.auth-scene .auth-racks { animation: auth-float 9s ease-in-out infinite; }
.auth-scene .flow-packet { fill: none; stroke: var(--accent); stroke-width: 4; stroke-linecap: round; stroke-dasharray: 1 99; opacity: .5; animation: auth-flow 3.6s linear infinite; animation-delay: var(--d, 0s); }
.auth-scene .auth-head { transform-box: fill-box; transform-origin: center; animation: auth-head-float 8s ease-in-out infinite; }
.auth-scene .head-outline { fill: color-mix(in srgb, var(--accent) 5%, transparent); stroke: color-mix(in srgb, var(--accent) 36%, transparent); stroke-width: 1.6; animation: auth-head-glow 7s ease-in-out infinite; }
.auth-scene .nn-signal { fill: none; stroke: var(--accent); stroke-width: 3; stroke-linecap: round; stroke-dasharray: 1 99; opacity: .5; animation: auth-flow 2.6s linear infinite; animation-delay: var(--d, 0s); }
.auth-scene .beam { stroke: var(--accent); stroke-width: 2; stroke-linecap: round; stroke-dasharray: 4 8; opacity: .2; animation: auth-beam 2.4s ease-in-out infinite; }
.auth-scene .beam-packet { fill: none; stroke: var(--accent); stroke-width: 3; stroke-linecap: round; stroke-dasharray: 1 99; opacity: .8; animation: auth-flow 2.2s linear infinite; }
.auth-scene .rack-load { fill: color-mix(in srgb, var(--ok) 50%, transparent); transform-box: fill-box; transform-origin: left center; animation: auth-load 3s ease-in-out infinite; animation-delay: var(--d, 0s); }
.auth-scene .bin { fill: color-mix(in srgb, var(--accent) 70%, transparent); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; opacity: 0; animation: auth-bin 3.4s linear infinite; animation-delay: var(--d, 0s); }
.auth-scene .sync-ring { fill: none; stroke: var(--accent); stroke-width: 1.5; opacity: 0; transform-box: fill-box; transform-origin: center; animation: auth-sync 3.3s ease-out infinite; animation-delay: var(--d, 0s); }
.auth-scene .fist { fill: color-mix(in srgb, var(--text) 10%, transparent); stroke: color-mix(in srgb, var(--accent) 32%, transparent); stroke-width: 1.5; }
.auth-scene .fist-knuckle, .auth-scene .fist-thumb { fill: none; stroke: color-mix(in srgb, var(--accent) 30%, transparent); stroke-width: 1.3; stroke-linecap: round; }
@keyframes auth-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes auth-head-float { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-8px) scale(1.01); } }
@keyframes auth-head-glow { 0%, 100% { stroke-opacity: .7; } 50% { stroke-opacity: 1; } }
@keyframes auth-beam { 0%, 100% { opacity: .12; } 50% { opacity: .7; } }
@keyframes auth-load { 0%, 100% { transform: scaleX(.15); opacity: .2; } 50% { transform: scaleX(1); opacity: .85; } }
@keyframes auth-bin { 0% { transform: translateX(0); opacity: 0; } 15% { opacity: .7; } 85% { opacity: .5; } 100% { transform: translateX(220px); opacity: 0; } }
@keyframes auth-sync { 0% { transform: scale(.4); opacity: 0; } 25% { opacity: .8; } 75%, 100% { transform: scale(2.4); opacity: 0; } }

.auth-sweep {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 22%;
  z-index: 2;
  pointer-events: none;
  opacity: 0;
  transform: translateZ(140px);
  background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--accent) 26%, transparent) 50%, transparent);
  filter: blur(2px);
  --sweep-peak: .3;
  animation: auth-sweep 7s ease-in-out infinite;
}
.auth-scene .auth-orbit { transform-box: fill-box; transform-origin: center; }
.auth-scene .orbit-ring { fill: none; stroke: color-mix(in srgb, var(--accent) 22%, transparent); stroke-width: 1.4; stroke-dasharray: 3 22; stroke-linecap: round; transform-box: fill-box; transform-origin: center; animation: auth-orbit 16s linear infinite; }
.auth-scene .orbit-ring-b { animation-direction: reverse; animation-duration: 11s; opacity: .5; }
@keyframes auth-orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes auth-sweep { 0%, 14% { transform: translateZ(140px) translateY(-90%); opacity: 0; } 25% { opacity: var(--sweep-peak); } 55% { transform: translateZ(140px) translateY(520%); opacity: calc(var(--sweep-peak) * .5); } 68%, 100% { transform: translateZ(140px) translateY(520%); opacity: 0; } }
.login-card {
  position: relative;
  z-index: 2;
  width: 340px;
  padding: 40px;
  background: var(--panel);
  border-radius: 12px;
  box-shadow: var(--shadow-card);
  transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.45s ease;
}
.login-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-pop);
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
  color: var(--text);
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
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text);
  background: var(--panel);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.login-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent);
}
.remember-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--muted);
  cursor: pointer;
  user-select: none;
}
.remember-row input { cursor: pointer; }
.login-btn {
  height: 40px;
  margin-top: 6px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}
.login-btn:hover { background: var(--accent-hover); }
.login-btn:active { transform: scale(0.97); }
.login-error {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--bad);
  text-align: center;
}
:root[data-theme="dark"] .auth-bg3d { --tilt-x: 2.5deg; --tilt-y: 2deg; }
:root[data-theme="dark"] .auth-aurora { opacity: .8; }
:root[data-theme="dark"] .auth-stars { opacity: .55; }
:root[data-theme="dark"] .auth-scene { opacity: .9; }
:root[data-theme="dark"] .auth-sweep { --sweep-peak: .55; }
</style>
