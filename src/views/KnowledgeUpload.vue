<template>
  <div class="knowledge-upload">
    <div class="page-top">{{ $t('knowledgeMgr') }}</div>
    <a-row>
      <a-col :span="24">
        <article class="upload-content">
          <h2>{{ $t('knowledgeUpload') }}</h2>
          <p>{{ $t('knowledgeUploadDesc') }}</p>

          <div v-if="activeTab === 'file'">
            <div class="upload-area" @dragover.prevent @drop.prevent="onDrop" @click="triggerUpload">
              <UploadOutlined class="upload-icon" />
              <p>{{ $t('knowledgeDrag') }}</p>
              <p class="hint">支持 .txt / .md / .pdf / .docx / .doc / .xlsx / .csv / .tsv / .pptx 格式</p>
              <input ref="fileInput" type="file" accept=".txt,.md,.pdf,.docx,.doc,.xlsx,.csv,.tsv,.pptx" style="display:none" @change="onFileSelected" />
            </div>

            <div v-if="uploading" class="status uploading">{{ $t('knowledgeUploading') }}</div>
          </div>

          <div v-if="activeTab === 'text'" class="text-input-area">
            <textarea v-model="textContent" class="text-input" placeholder="请输入文本内容，AI将基于这些内容回答你的问题..." rows="8"></textarea>
            <div class="char-count">{{ textContent.length }} 字</div>
            <div class="secret-row">
              <label>验证码：</label>
              <input v-model="textSecretKey" type="password" class="secret-input" placeholder="请输入验证码" @keydown.enter="submitText" />
              <button class="submit-btn" :disabled="!textContent.trim() || !textSecretKey || textSubmitting" @click="submitText">{{ textSubmitting ? '提交中...' : '提交' }}</button>
            </div>
          </div>

          <div v-if="activeTab === 'url'" class="text-input-area">
            <div class="sub-tabs">
              <span :class="['sub-tab', { active: crawlMode === 'single' }]" @click="crawlMode = 'single'">单页爬取</span>
              <span :class="['sub-tab', { active: crawlMode === 'menu' }]" @click="crawlMode = 'menu'">菜单爬取</span>
            </div>

            <div v-if="crawlMode === 'single'">
              <input v-model="crawlUrl" class="text-input" style="height:auto;padding:10px 14px" placeholder="输入网页链接，系统将自动抓取内容并存入知识库..." @keydown.enter="submitCrawl" />
              <div class="secret-row">
                <label>验证码：</label>
                <input v-model="crawlSecretKey" type="password" class="secret-input" placeholder="请输入验证码" @keydown.enter="submitCrawl" />
                <button class="submit-btn" :disabled="!crawlUrl.trim() || !crawlSecretKey || crawlSubmitting" @click="submitCrawl">{{ crawlSubmitting ? '爬取中...' : '提交' }}</button>
              </div>
              <div v-if="result" :class="['status', result.success ? 'success' : 'error']">
                {{ result.message }}
              </div>
            </div>

            <div v-if="crawlMode === 'menu'">
              <input v-model="menuCrawlUrl" class="text-input" style="height:auto;padding:10px 14px" placeholder="输入网站首页链接，系统将自动识别菜单并爬取所有菜单页面..." @keydown.enter="submitMenuCrawl" />
              <div class="secret-row">
                <label>验证码：</label>
                <input v-model="menuCrawlSecretKey" type="password" class="secret-input" placeholder="请输入验证码" @keydown.enter="submitMenuCrawl" />
                <button class="submit-btn" :disabled="!menuCrawlUrl.trim() || !menuCrawlSecretKey || menuCrawlSubmitting" @click="submitMenuCrawl">{{ menuCrawlSubmitting ? '爬取中...' : '提交' }}</button>
              </div>
              <div v-if="menuCrawlResult" :class="['status', menuCrawlResult.success ? 'success' : 'error']">
                {{ menuCrawlResult.message }}
              </div>
              <div v-if="menuCrawlResult?.pages?.length" class="menu-crawl-pages">
                <div class="menu-crawl-title">已爬取页面：</div>
                <div v-for="p in menuCrawlResult.pages" :key="p.url" class="menu-crawl-page">
                  <LinkOutlined /> {{ p.title }} <span class="chunk-badge">{{ p.chunks }} 切片</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="result" :class="['status', result.success ? 'success' : 'error']">
            {{ result.message }}
          </div>

          <div v-if="activeTab === 'stats'">
            <div class="stats-row" v-if="stats">
              <div class="stat-card">
                <div class="stat-value">{{ stats.total_entries }}</div>
                <div class="stat-label">{{ $t('knowledgeManageTotal') }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ stats.total_chunks }}</div>
                <div class="stat-label">{{ $t('knowledgeManageChunks') }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ stats.file_count }}</div>
                <div class="stat-label">{{ $t('knowledgeManageFileCount') }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ stats.text_count }}</div>
                <div class="stat-label">{{ $t('knowledgeManageTextCount') }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ stats.crawl_count || 0 }}</div>
                <div class="stat-label">URL爬取</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ stats.synced_articles }}</div>
                <div class="stat-label">同步文章</div>
              </div>
            </div>

            <div class="toolbar">
              <a-input-search
                v-model:value="searchText"
                :placeholder="$t('knowledgeManageSearch')"
                style="width: 300px"
                @search="loadEntries(1)"
              />
              <a-button v-if="selectedRowKeys.length > 0" type="primary" danger @click="showBatchDeleteModal">
                批量删除 ({{ selectedRowKeys.length }})
              </a-button>
              <a-button danger @click="showClearAllModal" style="margin-left: 8px">一键清除所有文章</a-button>
              <a-button @click="confirmSync" :loading="syncLoading" style="margin-left: 8px">{{ $t('knowledgeSyncData') }}</a-button>
            </div>

            <a-table
              :dataSource="entries"
              :columns="columns"
              :pagination="pagination"
              :loading="loading"
              rowKey="id"
              :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
              @change="handleTableChange"
              @expand="handleExpand"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'type'">
                  <FileOutlined v-if="record.type === 'file'" style="color:#1677ff" />
                  <EditOutlined v-else-if="record.type === 'text'" style="color:#52c41a" />
                  <LinkOutlined v-else-if="record.type === 'crawl'" style="color:#722ed1" />
                  <BookOutlined v-else style="color:#faad14" />
                  {{ record.type === 'file' ? '文件' : record.type === 'text' ? '文本' : record.type === 'crawl' ? '爬取' : '同步' }}
                </template>
                <template v-if="column.key === 'action'">
                  <a-button type="link" danger @click="showDeleteModal(record)">{{ $t('knowledgeManageDelete') }}</a-button>
                </template>
                <template v-if="column.key === 'uploaded_at'">
                  {{ record.uploaded_at || '—' }}
                </template>
              </template>
              <template #expandedRowRender="{ record }">
                <div v-if="record._chunks" class="chunk-list">
                  <div v-for="chunk in record._chunks" :key="chunk.id" class="chunk-item">
                    <span class="chunk-index">#{{ chunk.chunk_index + 1 }}</span>
                    <span class="chunk-content">{{ chunk.content }}</span>
                  </div>
                </div>
                <div v-else class="chunk-loading">加载中...</div>
              </template>
            </a-table>

            <a-modal
            v-model:visible="deleteModalVisible"
            :title="isBatchDelete ? '批量删除确认' : '验证码确认'"
            @ok="confirmDelete"
            :confirmLoading="deleteLoading"
          >
            <p>{{ isBatchDelete ? '确定批量删除选中的 ' + selectedRowKeys.length + ' 个条目吗？' : $t('knowledgeManageDeleteConfirm') }}</p>
            <a-input-password
              v-model:value="deleteSecretKey"
              placeholder="请输入验证码"
              @keydown.enter="confirmDelete"
            />
          </a-modal>

            <a-modal v-model:visible="clearAllModalVisible" title="一键清除所有文章" @ok="confirmClearAll" :confirmLoading="clearAllLoading">
              <p>确定要清除所有文章吗？此操作将删除所有向量数据和条目记录，不可撤销。</p>
              <a-input-password v-model:value="clearAllSecretKey" placeholder="请输入验证码" @keydown.enter="confirmClearAll" />
            </a-modal>
          </div>

          <div v-if="activeTab === 'failures'" class="failures-tab">
            <div class="toolbar">
              <span style="font-size:14px;color:#909399">最近 {{ failures.length }} 次同步失败记录</span>
              <a-button @click="loadFailures" :loading="failuresLoading">刷新</a-button>
            </div>
            <a-table
              v-if="failures.length"
              :dataSource="failures"
              :columns="failureColumns"
              :pagination="{ pageSize: 10 }"
              rowKey="time"
              size="middle"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'message' && record.detail">
                  <a-tooltip :title="record.detail">
                    <span class="detail-link">{{ record.message }}</span>
                  </a-tooltip>
                </template>
              </template>
            </a-table>
            <div v-else class="empty-state">
              <CheckCircleOutlined style="font-size:48px;color:#52c41a" />
              <p>暂无同步失败记录</p>
            </div>
          </div>

          <div v-if="activeTab === 'files'" class="files-tab">
            <div class="toolbar">
              <span style="font-size:14px;color:#909399">共 {{ fileList.length }} 个文件</span>
              <a-button @click="loadFileList" :loading="fileListLoading">刷新</a-button>
            </div>
            <a-table
              :dataSource="fileList"
              :columns="fileColumns"
              :pagination="{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }"
              rowKey="filename"
              size="middle"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'size'">
                  {{ formatSize(record.size) }}
                </template>
                <template v-if="column.key === 'status'">
                  <a-tag :color="record.status === 'processed' ? 'green' : record.status === 'error' ? 'red' : 'orange'">
                    {{ record.status === 'processed' ? '已处理' : record.status === 'error' ? '失败' : '待处理' }}
                  </a-tag>
                </template>
                <template v-if="column.key === 'action'">
                  <a-button v-if="record.status === 'error'" type="link" @click="retryFile(record)">重新同步</a-button>
                  <a-button type="link" danger @click="showFileDeleteModal(record)">删除</a-button>
                </template>
              </template>
            </a-table>

            <a-modal
              v-model:visible="fileDeleteModalVisible"
              title="删除文件确认"
              @ok="confirmFileDelete"
              :confirmLoading="fileDeleteLoading"
            >
              <p>确定删除文件 <strong>{{ deletingFile?.filename }}</strong> 吗？<br/>将同时删除物理文件、向量数据和条目记录。</p>
              <a-input-password
                v-model:value="fileDeleteSecretKey"
                placeholder="请输入验证码"
                @keydown.enter="confirmFileDelete"
              />
</a-modal>

            </div>

          <div v-if="activeTab !== 'stats' && activeTab !== 'failures' && activeTab !== 'files'" class="how-to">
            <h3><InfoCircleOutlined /> {{ $t('knowledgeHowTo') }}</h3>

            <div v-if="activeTab === 'file'" class="method">
              <h4><UploadOutlined /> 文件上传</h4>
              <ul>
                <li><CheckCircleOutlined /> 在"文件上传"标签页下，拖拽文件到虚线区域，或点击该区域选择文件</li>
                <li><CheckCircleOutlined /> 支持 .txt / .md / .pdf / .docx / .doc / .xlsx / .csv / .tsv / .pptx 格式</li>
                <li><CheckCircleOutlined /> 上传后自动进行文档质检，通过后点击"提交入库"</li>
                <li><CheckCircleOutlined /> 未通过可"帮我修复"，或选择"仍要上传"强制入库</li>
              </ul>
            </div>

            <div v-if="activeTab === 'text'" class="method">
              <h4><EditOutlined /> 文本输入</h4>
              <ul>
                <li><CheckCircleOutlined /> 切换到"文本输入"标签页</li>
                <li><CheckCircleOutlined /> 在文本框中输入任意文字内容（笔记、文章片段、知识要点等）</li>
                <li><CheckCircleOutlined /> 输入验证码后点击"提交"</li>
                <li><CheckCircleOutlined /> 系统将文本内容切片存入向量数据库，提交成功后显示切片数量</li>
              </ul>
            </div>

            <div v-if="activeTab === 'url'" class="method">
              <h4><LinkOutlined /> URL爬取</h4>
              <ul>
                <li><CheckCircleOutlined /> 切换到"URL爬取"标签页</li>
                <li><CheckCircleOutlined /> 输入目标网页的完整链接（如 https://example.com/article）</li>
                <li><CheckCircleOutlined /> 输入验证码后点击"提交"</li>
                <li><CheckCircleOutlined /> 系统自动抓取网页正文内容，切片后存入向量数据库</li>
              </ul>
            </div>

            <div class="usage">
              <h4><BulbOutlined /> 使用场景</h4>
              <ul>
                <li><CheckCircleOutlined /> 将博客文章、技术文档、学习笔记等资料上传到知识库</li>
                <li><CheckCircleOutlined /> AI助手在聊天时会自动检索知识库中的相关内容来回答问题</li>
              </ul>
            </div>
          </div>
        </article>
      </a-col>
    </a-row>

    <!-- 文档质检评分弹窗 -->
    <div v-if="scoreModalVisible" class="score-modal-mask">
      <div class="score-modal" :style="scoreModalStyle" @mousedown="startScoreDrag">
        <button class="score-close" @click="closeScoreModal">×</button>
        <h4 class="score-title">📋 {{ $t('knowledgeScoreTitle') }}<span v-if="uploadedFileName" class="score-filename"> · {{ uploadedFileName }}</span></h4>
        <div v-if="!scoreResult" class="score-analyzing">
          <a-progress type="circle" :percent="scoreAnim" :width="120" :stroke-color="progressColor" />
          <p class="score-tip">{{ scoreStage || $t('knowledgeScoreAnalyzing') }}</p>
        </div>
        <div v-else>
          <div class="score-result-head" :class="scoreClass">
            <span class="score-big">{{ scoreResult.total_score }}</span><span class="score-slash">/100</span>
            <span class="score-badge">{{ scoreBadgeText }}</span>
          </div>
          <div class="score-dims">
            <div v-for="(label, key) in scoreDimLabels" :key="key" class="score-dim">
              <span>{{ label }}</span>
              <div class="score-bar"><div class="score-bar-fill" :style="{ width: (scoreResult.dimensions?.[key] || 0) + '%' }"></div></div>
              <b>{{ scoreResult.dimensions?.[key] || 0 }}</b>
            </div>
          </div>
          <div v-if="scoreResult.issues?.length" class="score-issues">
            <div v-for="(iss, i) in scoreResult.issues" :key="i" class="score-issue">• {{ iss }}</div>
          </div>
          <div v-if="scoreResult.suggestion" class="score-suggestion">💡 {{ scoreResult.suggestion }}</div>
          <div v-if="scoreResult.score_failed" class="score-fail">❌ {{ $t('knowledgeScoreServiceFailed') }}</div>
          <div v-if="fixedResult && !fixedResult.is_passed" class="score-fail">{{ $t('knowledgeScoreFixedNotPassed', { score: fixedResult.total_score }) }}</div>
          <div class="score-actions">
            <button v-if="scoreResult.is_passed && !scoreResult.score_failed && !fixedResult" class="btn-submit" :disabled="verifying" @click="submitVerify()"><span v-if="verifying" class="btn-spinner"></span>{{ verifying ? $t('knowledgeScoreSubmitting') : $t('knowledgeScoreSubmit') }}</button>
            <button v-if="scoreResult && !scoreResult.is_passed && !scoreResult.score_failed && !fixedResult" class="btn-fix" :disabled="fixing" @click="startFix"><span v-if="fixing" class="btn-spinner"></span>{{ fixing ? $t('knowledgeScoreFixing') : $t('knowledgeScoreFix') }}</button>
            <template v-if="fixedResult">
              <div class="score-actions fix-actions">
                <button class="btn-view" @click="compareVisible = true">👁 {{ $t('knowledgeScoreViewCompare') }}</button>
                <button v-if="fixedResult.is_passed" class="btn-submit" :disabled="verifying" @click="submitVerify(true)"><span v-if="verifying" class="btn-spinner"></span>{{ verifying ? $t('knowledgeScoreSubmitting') : $t('knowledgeScoreUploadFixed') }}</button>
              </div>
            </template>
            <button v-if="scoreResult && !scoreResult.is_passed && !verifying && uploadedFileId && !scoreExpired" class="btn-force" :disabled="verifying" @click="forceUpload">{{ $t('knowledgeScoreForce') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 原文 vs 修复版对比弹窗 -->
    <div v-if="compareVisible" class="score-modal-mask">
      <div class="score-modal compare-modal">
        <button class="score-close" @click="compareVisible = false">×</button>
        <h4 class="score-title">📊 {{ $t('knowledgeScoreCompareTitle') }}</h4>
        <div class="fix-compare">
          <div class="fix-col"><div class="fix-col-title">{{ $t('knowledgeScoreOriginal') }}</div><pre class="fix-text">{{ originalContent }}</pre></div>
          <div class="fix-col"><div class="fix-col-title">{{ $t('knowledgeScoreFixed') }}</div><pre class="fix-text">{{ fixedContent }}</pre></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, computed } from 'vue';

const API_BASE = 'https://code-nav.top'
const WS_BASE = 'wss://code-nav.top'
import { UploadOutlined, InfoCircleOutlined, EditOutlined, BulbOutlined, CheckCircleOutlined, FileOutlined, BookOutlined, LinkOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';

const meta = {
  title: '知识库管理_前端小阳仔',
  meta: {
    keywords: '知识库,AI,文档上传,向量数据库',
    description: '上传文档到知识库，AI助手将基于上传的内容回答你的问题'
  }
};

export default defineComponent({
  name: 'KnowledgeUpload',
  components: { UploadOutlined, InfoCircleOutlined, EditOutlined, BulbOutlined, CheckCircleOutlined, FileOutlined, BookOutlined, LinkOutlined },
  props: { activeTab: { type: String, required: true } },
  setup(props) {
    const { t } = useI18n();
    const fileInput = ref<HTMLInputElement | null>(null);
    const uploading = ref(false);
    const verifying = ref(false);
    const result = ref<{ success: boolean; message: string } | null>(null);
    const uploadedFileId = ref('');
    const uploadedFileName = ref('');

    const textContent = ref('');
    const textSecretKey = ref('');
    const textSubmitting = ref(false);

    const crawlUrl = ref('');
    const crawlSecretKey = ref('');
    const crawlSubmitting = ref(false);
    const crawlMode = ref('single');

    const menuCrawlUrl = ref('');
    const menuCrawlSecretKey = ref('');
    const menuCrawlSubmitting = ref(false);
    const menuCrawlResult = ref<{ success: boolean; message: string; pages?: { url: string; title: string; chunks: number }[] } | null>(null);

    const stats = ref<Record<string, number> | null>(null);
    const entries = ref<Record<string, unknown>[]>([]);
    const loading = ref(false);
    const searchText = ref('');
    const pagination = ref({ current: 1, pageSize: 20, total: 0 });
    const deleteModalVisible = ref(false);
    const deleteSecretKey = ref('');
    const deleteLoading = ref(false);
    const deletingEntryId = ref('');
    const isBatchDelete = ref(false);
    const selectedRowKeys = ref<string[]>([]);
    const columns = [
      { title: '名称', dataIndex: 'name', key: 'name' },
      { title: '类型', dataIndex: 'type', key: 'type' },
      { title: '上传时间', dataIndex: 'uploaded_at', key: 'uploaded_at' },
      { title: '切片数', dataIndex: 'chunk_count', key: 'chunk_count' },
      { title: '操作', key: 'action' }
    ];
    const failures = ref<{ time: string; type: string; message: string; detail?: string }[]>([]);
    const failuresLoading = ref(false);
    const failureColumns = [
      { title: '时间', dataIndex: 'time', key: 'time', width: 200 },
      { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
      { title: '错误信息', dataIndex: 'message', key: 'message' }
    ];
    const fileList = ref<{ filename: string; size: number; mtime: string; status: string; exists: boolean }[]>([]);
    const fileListLoading = ref(false);
    const fileColumns = [
      { title: '文件名', dataIndex: 'filename', key: 'filename' },
      { title: '大小', dataIndex: 'size', key: 'size', width: 100 },
      { title: '修改时间', dataIndex: 'mtime', key: 'mtime', width: 200 },
      { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
      { title: '操作', key: 'action', width: 80 }
    ];
    const fileDeleteModalVisible = ref(false);
    const fileDeleteSecretKey = ref('');
    const fileDeleteLoading = ref(false);
    const deletingFile = ref<{ filename: string } | null>(null);
    const clearAllModalVisible = ref(false);
    const clearAllSecretKey = ref('');
    const clearAllLoading = ref(false);
    const syncLoading = ref(false);

    const scoreModalVisible = ref(false);
    const scoreAnim = ref(0);
    const scoreStage = ref('');
    const scoreResult = ref<null | { total_score: number; is_passed: boolean; vetoed?: boolean; score_failed?: boolean; dimensions?: Record<string, number>; issues?: string[]; suggestion?: string }>(null);
    const scoreExpired = ref(false);
    const fixing = ref(false);
    const fixedResult = ref<null | { total_score: number; is_passed: boolean }>(null);
    const fixedContent = ref('');
    const originalContent = ref('');
    const compareVisible = ref(false);
    const scoreTimer = ref<ReturnType<typeof setInterval> | null>(null);
    const scoreDrag = ref({ moved: false, dragging: false, x: 0, y: 0, left: 0, top: 0 });
    const scoreModalStyle = computed(() => {
      const d = scoreDrag.value;
      return d.moved ? { position: 'fixed' as const, left: d.left + 'px', top: d.top + 'px', margin: 0 } : {};
    });
    const scoreDimLabels = computed<Record<string, string>>(() => ({
      content_quality: t('knowledgeScoreDimContent'),
      ai_readiness: t('knowledgeScoreDimAi'),
      language_quality: t('knowledgeScoreDimLanguage'),
      compliance: t('knowledgeScoreDimCompliance')
    }));
    const scoreClass = computed(() => {
      const s = scoreResult.value?.total_score ?? 0;
      return s >= 85 ? 'score-green' : s >= 70 ? 'score-yellow' : 'score-red';
    });
    const progressColor = computed(() => {
      const p = scoreAnim.value;
      if (p >= 95) return '#52c41a';
      if (p >= 40) return '#faad14';
      return '#1677ff';
    });
    const scoreBadgeText = computed(() => {
      const s = scoreResult.value?.total_score ?? 0;
      return s >= 85 ? t('knowledgeScoreBadgeExcellent') : s >= 70 ? t('knowledgeScoreBadgePass') : t('knowledgeScoreBadgeFail');
    });

    let scoreWs: WebSocket | null = null;
    let scoreReconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let scorePollTimer: ReturnType<typeof setInterval> | null = null;
    let scoreDeadline = 0;
    let scoreTerminal = false;

    function closeScoreWs() {
      if (!scoreWs) return;
      scoreWs.onopen = null;
      scoreWs.onmessage = null;
      scoreWs.onerror = null;
      scoreWs.onclose = null;
      try { scoreWs.close(); } catch {}
      scoreWs = null;
    }

    function clearScoreNet() {
      if (scoreReconnectTimer) {
        clearTimeout(scoreReconnectTimer);
        scoreReconnectTimer = null;
      }
      if (scorePollTimer) {
        clearInterval(scorePollTimer);
        scorePollTimer = null;
      }
      closeScoreWs();
    }

    function stopScoreNet() {
      scoreTerminal = true;
      clearScoreNet();
    }

    function resetScoreNet() {
      stopScoreNet();
      scoreTerminal = false;
      scoreDeadline = Date.now() + 3 * 60 * 1000;
    }

    function startScoreDrag(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, textarea, select, .ant-progress, .score-actions, .score-dims, .score-issues, .score-result-head, .score-analyzing')) return;
      const el = target.closest('.score-modal') as HTMLElement | null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      scoreDrag.value = { moved: true, dragging: true, x: e.clientX, y: e.clientY, left: rect.left, top: rect.top };
      document.addEventListener('mousemove', onScoreDragMove);
      document.addEventListener('mouseup', endScoreDrag);
      e.preventDefault();
    }
    function onScoreDragMove(e: MouseEvent) {
      const d = scoreDrag.value;
      if (!d.dragging) return;
      d.left = Math.max(0, d.left + e.clientX - d.x);
      d.top = Math.max(0, d.top + e.clientY - d.y);
      d.x = e.clientX;
      d.y = e.clientY;
    }
    function endScoreDrag() {
      scoreDrag.value.dragging = false;
      document.removeEventListener('mousemove', onScoreDragMove);
      document.removeEventListener('mouseup', endScoreDrag);
    }

    function stopScoreAnim() {
      if (scoreTimer.value) {
        clearInterval(scoreTimer.value);
        scoreTimer.value = null;
      }
      scoreAnim.value = 100;
    }

    function closeScoreModal() {
      stopScoreNet();
      stopScoreAnim();
      scoreModalVisible.value = false;
      scoreResult.value = null;
      scoreStage.value = '';
      scoreExpired.value = false;
      fixedResult.value = null;
      fixing.value = false;
      fixedContent.value = '';
      originalContent.value = '';
      compareVisible.value = false;
      uploadedFileId.value = '';
      uploadedFileName.value = '';
      result.value = null;
    }

    function applyScore(score: typeof scoreResult.value) {
      stopScoreAnim();
      scoreResult.value = score;
    }

    function failScore(issues: string[], suggestion: string) {
      applyScore({ total_score: 0, is_passed: false, score_failed: true, issues, suggestion });
      stopScoreNet();
    }

    function handleScoreMessage(raw: string) {
      let d: {
        status?: string;
        percent?: number;
        stage?: string;
        score?: typeof scoreResult.value;
        fixed_content?: string;
        original_content?: string;
      };
      try { d = JSON.parse(raw); } catch { return; }
      if (d.status === 'progress') {
        scoreAnim.value = Math.max(scoreAnim.value, d.percent || 0);
        scoreStage.value = d.stage || scoreStage.value;
      } else if (d.status === 'fix_done') {
        fixing.value = false;
        fixedResult.value = d.score || null;
        fixedContent.value = d.fixed_content || '';
        originalContent.value = d.original_content || '';
        if (d.score) applyScore(d.score);
        else failScore([t('knowledgeScoreServiceFailed')], '');
        stopScoreNet();
      } else if (d.status === 'done') {
        if (d.score) applyScore(d.score);
        else failScore([t('knowledgeScoreServiceFailed')], '');
        stopScoreNet();
      }
    }

    function pollScoreStatus(fileId: string) {
      if (scorePollTimer || fixing.value) return;
      scorePollTimer = setInterval(async () => {
        if (scoreTerminal || !uploadedFileId.value) return;
        if (Date.now() > scoreDeadline) {
          failScore([t('knowledgeScoreTimeout')], t('knowledgeScoreTimeoutTip'));
          scoreExpired.value = true;
          return;
        }
        try {
          const res = await fetch(API_BASE + '/api/aiuploadfile/score-status?file_id=' + encodeURIComponent(fileId));
          const data = await res.json();
          if (data.status === 'done' && data.score) {
            applyScore(data.score);
            stopScoreNet();
          } else if (data.status === 'expired') {
            scoreExpired.value = true;
            failScore([t('knowledgeScoreExpired')], t('knowledgeScoreExpiredTip'));
          }
        } catch {}
      }, 2000);
    }

    function scheduleScoreReconnect(fileId: string) {
      if (scoreTerminal || !uploadedFileId.value) return;
      if (Date.now() > scoreDeadline) {
        scoreExpired.value = true;
        failScore([t('knowledgeScoreTimeout')], t('knowledgeScoreTimeoutTip'));
        return;
      }
      if (!fixing.value) pollScoreStatus(fileId);
      if (scoreReconnectTimer) return;
      scoreReconnectTimer = setTimeout(() => {
        scoreReconnectTimer = null;
        connectScoreWs(fileId);
      }, 2000);
    }

    function connectScoreWs(fileId: string) {
      if (scoreTerminal || !uploadedFileId.value) return;
      closeScoreWs();
      const ws = new WebSocket(WS_BASE + '/ws/doc-score');
      scoreWs = ws;
      ws.onopen = () => {
        if (scorePollTimer) {
          clearInterval(scorePollTimer);
          scorePollTimer = null;
        }
        ws.send(JSON.stringify({ file_id: fileId }));
      };
      ws.onmessage = (e) => handleScoreMessage(String(e.data));
      ws.onerror = () => {
        try { ws.close(); } catch {}
      };
      ws.onclose = () => {
        if (scoreTerminal || !uploadedFileId.value) return;
        scheduleScoreReconnect(fileId);
      };
    }

    async function uploadFile(file: File) {
      const formData = new FormData();
      formData.append('file', file);
      uploading.value = true;
      result.value = null;
      scoreResult.value = null;
      scoreExpired.value = false;
      fixedResult.value = null;
      scoreModalVisible.value = true;
      scoreAnim.value = 0;
      scoreStage.value = '';
      resetScoreNet();
      try {
        const res = await fetch(API_BASE + '/api/aiuploadfile', { method: 'POST', body: formData });
        const data = await res.json();
        if (!scoreModalVisible.value) return;
        if (!res.ok) {
          failScore([data.detail || t('knowledgeUploadFailed')], '');
          result.value = { success: false, message: data.detail || t('knowledgeUploadFailed') };
        } else {
          uploadedFileId.value = data.file_id;
          uploadedFileName.value = data.filename;
          connectScoreWs(data.file_id);
        }
      } catch {
        if (!scoreModalVisible.value) return;
        failScore([t('knowledgeUploadNetworkError')], '');
        result.value = { success: false, message: t('knowledgeUploadNetworkError') };
      } finally {
        uploading.value = false;
      }
    }

    async function startFix() {
      if (!uploadedFileId.value || fixing.value) return;
      fixing.value = true;
      fixedResult.value = null;
      scoreResult.value = null;
      scoreExpired.value = false;
      scoreStage.value = '';
      scoreAnim.value = 0;
      resetScoreNet();
      try {
        const fd = new FormData();
        fd.append('file_id', uploadedFileId.value);
        const res = await fetch(API_BASE + '/api/aiuploadfile/fix', { method: 'POST', body: fd });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || '');
        }
        connectScoreWs(uploadedFileId.value);
      } catch (e) {
        fixing.value = false;
        stopScoreNet();
        failScore([e instanceof Error && e.message ? e.message : t('knowledgeScoreServiceFailed')], '');
      }
    }

    async function submitVerify(ack = false, useFixed = false) {
      if (!uploadedFileId.value) return;
      verifying.value = true;
      result.value = null;
      try {
        const formData = new FormData();
        formData.append('file_id', uploadedFileId.value);
        if (ack) formData.append('score_ack', '1');
        if (useFixed) formData.append('fixed', '1');
        if (fixedResult.value) formData.append('fixed', '1');
        const res = await fetch(API_BASE + '/api/aiuploadfile/verify', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) {
          if (data.detail && data.detail.includes('已存在')) {
            message.error(data.detail);
          } else {
            result.value = { success: false, message: data.detail || t('knowledgeVerifyFailed') };
          }
        } else {
          result.value = data;
          uploadedFileId.value = '';
          message.success(t('knowledgeUploadSuccess'));
          loadStats();
          loadEntries();
          setTimeout(closeScoreModal, 1000);
        }
      } catch {
        result.value = { success: false, message: t('knowledgeVerifyNetworkError') };
      } finally {
        verifying.value = false;
      }
    }

    function forceUpload() {
      Modal.confirm({
        title: t('knowledgeScoreForceTitle'),
        content: t('knowledgeScoreForceContent'),
        okText: t('knowledgeScoreForceOk'),
        okType: 'danger',
        cancelText: t('knowledgeScoreCancel'),
        onOk: () => submitVerify(true)
      });
    }

    onMounted(() => {
      loadStats();
      loadEntries();
    });

    watch(() => props.activeTab, (tab) => {
      if (tab === 'stats') {
        loadStats();
        loadEntries();
      } else if (tab === 'failures') {
        loadFailures();
      } else if (tab === 'files') {
        loadFileList();
      }
    });

    function triggerUpload() {
      if (!uploadedFileId.value) fileInput.value?.click();
    }

    async function submitText() {
      if (!textContent.value.trim() || !textSecretKey.value) return;
      textSubmitting.value = true;
      result.value = null;
      try {
        const formData = new FormData();
        formData.append('content', textContent.value);
        formData.append('secret_key', textSecretKey.value);
        const res = await fetch(API_BASE + '/api/aiuploadtext', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) {
          result.value = { success: false, message: data.detail || '提交失败' };
        } else {
          result.value = data;
          textContent.value = '';
          textSecretKey.value = '';
          loadStats();
          loadEntries();
        }
      } catch {
        result.value = { success: false, message: '提交失败：网络错误' };
      } finally {
        textSubmitting.value = false;
      }
    }

    async function submitCrawl() {
      if (!crawlUrl.value.trim() || !crawlSecretKey.value) return;
      crawlSubmitting.value = true;
      result.value = null;
      try {
        const formData = new FormData();
        formData.append('url', crawlUrl.value);
        formData.append('secret_key', crawlSecretKey.value);
        const res = await fetch(API_BASE + '/api/crawl', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) {
          result.value = { success: false, message: data.detail || '爬取失败' };
        } else {
          result.value = data;
          crawlUrl.value = '';
          crawlSecretKey.value = '';
          loadStats();
          loadEntries();
        }
      } catch {
        result.value = { success: false, message: '爬取失败：网络错误' };
      } finally {
        crawlSubmitting.value = false;
      }
    }

    async function submitMenuCrawl() {
      if (!menuCrawlUrl.value.trim() || !menuCrawlSecretKey.value) return;
      menuCrawlSubmitting.value = true;
      menuCrawlResult.value = null;
      try {
        const formData = new FormData();
        formData.append('url', menuCrawlUrl.value);
        formData.append('secret_key', menuCrawlSecretKey.value);
        const res = await fetch(API_BASE + '/api/crawl/menu', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) {
          menuCrawlResult.value = { success: false, message: data.detail || '爬取失败' };
        } else {
          menuCrawlResult.value = data;
          menuCrawlUrl.value = '';
          menuCrawlSecretKey.value = '';
          loadStats();
          loadEntries();
        }
      } catch {
        menuCrawlResult.value = { success: false, message: '爬取失败：网络错误' };
      } finally {
        menuCrawlSubmitting.value = false;
      }
    }

    async function loadStats() {
      try {
        const res = await fetch(API_BASE + '/api/knowledge/stats');
        stats.value = await res.json();
      } catch {}
    }

    async function loadEntries(page = 1) {
      loading.value = true;
      try {
        const params = new URLSearchParams({
          page: String(page),
          page_size: String(pagination.value.pageSize),
          search: searchText.value
        });
        const res = await fetch(API_BASE + '/api/knowledge/entries?' + params);
        const data = await res.json();
        entries.value = data.entries;
        pagination.value.total = data.total;
        pagination.value.current = data.page;
      } catch {} finally {
        loading.value = false;
      }
    }

    async function loadFailures() {
      failuresLoading.value = true;
      try {
        const res = await fetch(API_BASE + '/api/sync/failures');
        const data = await res.json();
        failures.value = data.failures;
      } catch {} finally {
        failuresLoading.value = false;
      }
    }

    async function loadFileList() {
      fileListLoading.value = true;
      try {
        const res = await fetch(API_BASE + '/api/file-update/files');
        const data = await res.json();
        fileList.value = data.files || [];
      } catch {} finally {
        fileListLoading.value = false;
      }
    }

    function formatSize(bytes: number): string {
      if (bytes === 0) return '—';
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    }

    function showFileDeleteModal(record: { filename: string }) {
      deletingFile.value = record;
      fileDeleteSecretKey.value = '';
      fileDeleteModalVisible.value = true;
    }

    async function confirmFileDelete() {
      if (!fileDeleteSecretKey.value || !deletingFile.value) return;
      fileDeleteLoading.value = true;
      try {
        const params = new URLSearchParams({
          filename: deletingFile.value.filename,
          secret_key: fileDeleteSecretKey.value
        });
        const res = await fetch(API_BASE + '/api/file-update/files?' + params, { method: 'DELETE' });
        if (res.ok) {
          fileDeleteModalVisible.value = false;
          fileDeleteSecretKey.value = '';
          deletingFile.value = null;
          loadFileList();
        } else {
          const data = await res.json();
          message.error(data.detail || '删除失败');
        }
      } catch {
        message.error('删除失败：网络错误');
      } finally {
        fileDeleteLoading.value = false;
      }
    }

    function showClearAllModal() {
      clearAllSecretKey.value = '';
      clearAllModalVisible.value = true;
    }

    async function confirmClearAll() {
      if (!clearAllSecretKey.value) return;
      clearAllLoading.value = true;
      try {
        const formData = new FormData();
        formData.append('secret_key', clearAllSecretKey.value);
        const res = await fetch(API_BASE + '/api/knowledge/clear-all', { method: 'POST', body: formData });
        if (res.ok) {
          clearAllModalVisible.value = false;
          clearAllSecretKey.value = '';
          message.success('已清除所有文章');
          loadStats();
          loadEntries();
        } else {
          const data = await res.json();
          message.error(data.detail || '清除失败');
        }
      } catch {
        message.error('清除失败：网络错误');
      } finally {
        clearAllLoading.value = false;
      }
    }

    async function confirmSync() {
      syncLoading.value = true;
      try {
        const res = await fetch(API_BASE + '/api/sync', { method: 'POST' });
        const data = await res.json();
        if (res.ok && data.success) {
          message.success(data.message || t('knowledgeSyncSuccess'));
        } else {
          message.error(data.message || t('knowledgeSyncFailed'));
        }
        loadStats();
        loadEntries();
      } catch {
        message.error(t('knowledgeSyncNetworkError'));
      } finally {
        syncLoading.value = false;
      }
    }

    async function retryFile(record: { filename: string }) {
      try {
        const res = await fetch(API_BASE + '/api/file-update/retry?filename=' + encodeURIComponent(record.filename), {
          method: 'POST'
        });
        const data = await res.json();
        if (data.success) {
          loadFileList();
        } else {
          message.error('重新同步失败: ' + (data.error || '未知错误'));
          loadFileList();
        }
      } catch {
        message.error('重新同步失败：网络错误');
      }
    }

    async function handleTableChange(pag: { current: number; pageSize: number; total: number }) {
      pagination.value.current = pag.current;
      loadEntries(pag.current);
    }

    async function handleExpand(expanded: boolean, record: Record<string, unknown>) {
      if (!expanded || record._chunks) return;
      try {
        const res = await fetch(API_BASE + '/api/knowledge/entries/' + record.id);
        if (res.ok) {
          const data = await res.json();
          record._chunks = data.chunks;
        }
      } catch {}
    }

    async function deleteEntry(id: string) {
      deleteLoading.value = true;
      try {
        const res = await fetch(API_BASE + '/api/knowledge/entries/' + id + '?secret_key=' + encodeURIComponent(deleteSecretKey.value), { method: 'DELETE' });
        if (res.ok) {
          deleteModalVisible.value = false;
          deleteSecretKey.value = '';
          loadEntries(pagination.value.current);
          loadStats();
        } else {
          const data = await res.json();
          message.error(data.detail || '删除失败');
        }
      } catch {
        message.error('删除失败：网络错误');
      } finally {
        deleteLoading.value = false;
      }
    }

    function showDeleteModal(record: Record<string, unknown>) {
      isBatchDelete.value = false;
      deletingEntryId.value = record.id as string;
      deleteSecretKey.value = '';
      deleteModalVisible.value = true;
    }

    function showBatchDeleteModal() {
      isBatchDelete.value = true;
      deleteSecretKey.value = '';
      deleteModalVisible.value = true;
    }

    function onSelectChange(keys: string[]) {
      selectedRowKeys.value = keys;
    }

    function confirmDelete() {
      if (!deleteSecretKey.value) return;
      if (isBatchDelete.value) {
        batchDelete();
      } else {
        deleteEntry(deletingEntryId.value);
      }
    }

    async function batchDelete() {
      deleteLoading.value = true;
      try {
        const formData = new FormData();
        for (const id of selectedRowKeys.value) {
          formData.append('entry_ids', id);
        }
        formData.append('secret_key', deleteSecretKey.value);
        const res = await fetch(API_BASE + '/api/knowledge/entries/batch-delete', { method: 'POST', body: formData });
        if (res.ok) {
          deleteModalVisible.value = false;
          deleteSecretKey.value = '';
          selectedRowKeys.value = [];
          loadEntries(pagination.value.current);
          loadStats();
        } else {
          const data = await res.json();
          message.error(data.detail || '批量删除失败');
        }
      } catch {
        message.error('批量删除失败：网络错误');
      } finally {
        deleteLoading.value = false;
      }
    }

    function onFileSelected(e: Event) {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) uploadFile(file);
    }

    function onDrop(e: DragEvent) {
      const file = e.dataTransfer?.files?.[0];
      if (file) uploadFile(file);
    }

    return { activeTab: computed(() => props.activeTab), fileInput, uploading, verifying, result, uploadedFileId, uploadedFileName, triggerUpload, onFileSelected, onDrop, submitVerify, forceUpload, startFix, scoreModalVisible, scoreAnim, scoreStage, scoreResult, scoreExpired, scoreClass, progressColor, scoreBadgeText, scoreDimLabels, scoreModalStyle, startScoreDrag, closeScoreModal, fixing, fixedResult, fixedContent, originalContent, compareVisible, textContent, textSecretKey, textSubmitting, submitText, crawlUrl, crawlSecretKey, crawlSubmitting, crawlMode, submitCrawl, menuCrawlUrl, menuCrawlSecretKey, menuCrawlSubmitting, menuCrawlResult, submitMenuCrawl, stats, entries, loading, searchText, pagination, columns, loadEntries, handleTableChange, handleExpand, deleteEntry, showDeleteModal, showBatchDeleteModal, confirmDelete, deleteModalVisible, deleteSecretKey, deleteLoading, selectedRowKeys, onSelectChange, isBatchDelete, failures, failuresLoading, failureColumns, loadFailures, fileList, fileListLoading, fileColumns, loadFileList, formatSize, showFileDeleteModal, confirmFileDelete, fileDeleteModalVisible, fileDeleteSecretKey, fileDeleteLoading, deletingFile, retryFile, showClearAllModal, confirmClearAll, clearAllModalVisible, clearAllSecretKey, clearAllLoading, confirmSync, syncLoading };
  }
});
</script>

<style lang="less" scoped>
.knowledge-upload {
  min-height: 600px;
  margin-top: 20px;
}
.page-top {
  text-align: center;
  padding: 63px 0;
  font-size: 30px;
  color: #fdeb1b;
  border-radius: 5px;
  background: url(https://code-nav.top/statics/img/webinfo/tooltopbg.jpg);
  background-size: cover;
}
.upload-content {
  background: #fff;
  padding: 20px 60px;
  margin-top: 15px;
  border-radius: 5px;

  h2 {
    margin: 25px 0;
    line-height: 24px;
    position: relative;
    font-size: 1.4em;
    color: #303133;
  }
  p {
    line-height: 26px;
    margin-bottom: 18px;
    font-size: 15px;
    font-family: "Microsoft YaHei";
    color: #606266;
    text-align: left;
  }
}
.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  margin: 20px 0;
}
.upload-area:hover {
  border-color: #1677ff;
  background: rgba(22,119,255,0.02);
}
.upload-icon {
  font-size: 48px;
  color: #1677ff;
  margin-bottom: 12px;
}
.upload-area p {
  color: #666;
  margin: 4px 0;
  text-align: center;
}
.hint {
  font-size: 12px;
  color: #999;
}
.secret-area {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 0;
}
.secret-area label {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
}
.secret-input {
  flex: 1;
  max-width: 300px;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.secret-input:focus {
  border-color: #1677ff;
}
.verify-area {
  margin: 20px 0;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}
.file-info {
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;
  word-break: break-all;
}
.text-input-area {
  margin: 20px 0;
}
.sub-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}
.sub-tab {
  padding: 6px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.2s, border-color 0.2s;
}
.sub-tab:hover {
  color: #1677ff;
}
.sub-tab.active {
  color: #1677ff;
  border-bottom-color: #1677ff;
  font-weight: 600;
}
.menu-crawl-pages {
  margin-top: 16px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 8px;
}
.menu-crawl-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}
.menu-crawl-page {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
  padding: 4px 0;
}
.chunk-badge {
  font-size: 12px;
  color: #1677ff;
  background: #e6f4ff;
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: auto;
}
.text-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.text-input:focus {
  border-color: #1677ff;
}
.char-count {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin: 6px 0 12px;
}
.secret-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}
.secret-row label {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
}
.secret-row .secret-input {
  flex: 1;
  max-width: 200px;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.secret-row .secret-input:focus {
  border-color: #1677ff;
}
.submit-btn {
  padding: 8px 20px;
  background: #1677ff;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}
.submit-btn:hover {
  background: #4096ff;
}
.submit-btn:disabled {
  background: #a0c4ff;
  cursor: not-allowed;
}
.status {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
}
.status.uploading {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #1890ff;
}
.status.success {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #52c41a;
}
.status.error {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
}
.how-to {
  margin-top: 32px;
  padding: 24px 28px;
  background: #fafafa;
  border-radius: 8px;

  h3 {
    font-size: 16px;
    margin-bottom: 16px;
    color: #303133;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  h4 {
    font-size: 15px;
    color: #303133;
    margin: 14px 0 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0 0 8px 0;
  }

  li {
    font-size: 14px;
    color: #606266;
    line-height: 26px;
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-bottom: 2px;
  }

  .anticon {
    color: #1677ff;
    flex-shrink: 0;
    margin-top: 4px;
  }
}
.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}
.stat-card {
  flex: 1;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}
.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #1677ff;
}
.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}
.toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 30px;
  margin-bottom: 16px;
}
.chunk-list {
  padding: 8px 0;
}
.chunk-item {
  display: flex;
  gap: 8px;
  padding: 6px 12px;
  font-size: 13px;
  color: #606266;
  border-bottom: 1px solid #f5f5f5;
}
.chunk-item:last-child {
  border-bottom: none;
}
.chunk-index {
  color: #1677ff;
  font-weight: 600;
  white-space: nowrap;
  min-width: 24px;
}
.chunk-content {
  line-height: 1.6;
}
.chunk-loading {
  padding: 12px;
  color: #999;
  text-align: center;
}
.empty-state {
  text-align: center;
  padding: 80px 0;
  color: #909399;
}
.empty-state p {
  margin-top: 12px;
  font-size: 14px;
  text-align: center;
}
.failures-tab {
  margin: 20px 0;
}
.detail-link {
  cursor: pointer;
  text-decoration: underline;
  text-decoration-style: dotted;
  color: #1677ff;
}
.files-tab {
  margin: 20px 0;
}
.score-modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.score-modal { position: relative; cursor: move; width: 420px; max-height: 80vh; overflow-y: auto; background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 8px 30px rgba(0,0,0,.2); }
.score-modal button, .score-modal a, .score-modal input, .score-modal select, .score-modal .ant-progress, .score-modal .score-actions, .score-modal .score-dims, .score-modal .score-issues { cursor: auto; }
.score-modal .score-bar { cursor: default; }
.score-close { position: absolute; top: 8px; right: 12px; border: none; background: none; font-size: 20px; color: #999; cursor: pointer; line-height: 1; }
.score-close:hover { color: #333; }
.score-title { margin: 0 0 16px; font-size: 18px; text-align: center; cursor: move; user-select: none; }
.score-analyzing { text-align: center; padding: 16px 0; }
.score-tip { margin-top: 14px; color: #666; }
.score-result-head { text-align: center; margin: 8px 0 14px; }
.score-big { font-size: 40px; font-weight: 700; }
.score-slash { color: #999; font-size: 16px; }
.score-badge { display: inline-block; margin-left: 8px; padding: 2px 10px; border-radius: 10px; font-size: 13px; color: #fff; vertical-align: middle; }
.score-green .score-big { color: #52c41a; } .score-green .score-badge { background: #52c41a; }
.score-yellow .score-big { color: #faad14; } .score-yellow .score-badge { background: #faad14; }
.score-red .score-big { color: #f5222d; } .score-red .score-badge { background: #f5222d; }
.score-dims { margin: 10px 0; }
.score-dim { display: flex; align-items: center; gap: 8px; margin: 6px 0; font-size: 13px; color: #555; }
.score-dim .score-bar { flex: 1; height: 6px; background: #eee; border-radius: 3px; overflow: hidden; }
.score-dim .score-bar-fill { height: 100%; background: #1677ff; border-radius: 3px; transition: width .4s; }
.score-dim b { width: 28px; text-align: right; }
.score-issues { background: #fff7e6; border-radius: 8px; padding: 10px 12px; color: #ad6800; font-size: 13px; margin: 8px 0; }
.score-suggestion { background: #e6f7ff; border-radius: 8px; padding: 10px 12px; color: #0050b3; font-size: 13px; margin: 8px 0; }
.score-fail { background: #fff1f0; border-radius: 8px; padding: 10px 12px; color: #cf1322; font-size: 13px; margin: 8px 0; }
.score-actions { display: flex; align-items: center; gap: 10px; justify-content: flex-end; margin-top: 16px; }
.score-actions button { padding: 6px 16px; height: 32px; box-sizing: border-box; border-radius: 6px; border: none; cursor: pointer; font-size: 14px; }
.btn-spinner { display: inline-block; width: 14px; height: 14px; margin-right: 6px; border: 2px solid rgba(255,255,255,.35); border-top-color: #fff; border-radius: 50%; animation: btn-spin .7s linear infinite; vertical-align: -2px; }
@keyframes btn-spin { to { transform: rotate(360deg); } }
.btn-view { background: #722ed1; color: #fff; }
.btn-fix { background: #faad14; color: #fff; margin-top: 16px; }
.btn-submit { background: #52c41a; color: #fff; margin-top: 16px; }
.btn-force { background: #909399; color: #fff; margin-top: 16px; }
.compare-modal { width: 1500px; max-width: 95vw; max-height: 1000px; }
.fix-compare { display: flex; gap: 10px; margin: 10px 0; }
.fix-col { flex: 1; min-width: 0; }
.fix-col-title { font-size: 12px; color: #888; margin-bottom: 4px; }
.fix-text { max-height: 600px; overflow: auto; background: #fafafa; border: 1px solid #eee; border-radius: 6px; padding: 8px; font-size: 12px; white-space: pre-wrap; word-break: break-all; }
.fix-actions { justify-content: flex-start; margin-top: 0; }
</style>