<template>
  <div class="knowledge-upload">
    <div class="page-top">{{ $t('knowledgeMgr') }}</div>
    <a-row>
      <a-col :span="24">
        <article class="upload-content">
          <h2>{{ $t('knowledgeUpload') }}</h2>
          <p>{{ $t('knowledgeUploadDesc') }}</p>

          <div class="tabs">
            <span :class="['tab', { active: activeTab === 'file' }]" @click="activeTab = 'file'">{{ $t('knowledgeManageFileCount') }}</span>
            <span :class="['tab', { active: activeTab === 'text' }]" @click="activeTab = 'text'">{{ $t('knowledgeManageTextCount') }}</span>
            <span :class="['tab', { active: activeTab === 'url' }]" @click="activeTab = 'url'">URL爬取</span>
            <span :class="['tab', { active: activeTab === 'stats' }]" @click="activeTab = 'stats'">{{ $t('knowledgeManageStats') }}</span>
            <span :class="['tab', { active: activeTab === 'failures' }]" @click="activeTab = 'failures'">同步失败</span>
            <span :class="['tab', { active: activeTab === 'files' }]" @click="activeTab = 'files'">文件目录</span>
          </div>

          <div v-if="activeTab === 'file'">
            <div v-if="!uploadedFileId" class="upload-area" @dragover.prevent @drop.prevent="onDrop" @click="triggerUpload">
              <UploadOutlined class="upload-icon" />
              <p>{{ $t('knowledgeDrag') }}</p>
              <p class="hint">支持 .txt / .md / .pdf / .docx 格式</p>
              <input ref="fileInput" type="file" accept=".txt,.md,.pdf,.docx,.doc" style="display:none" @change="onFileSelected" />
            </div>

            <div v-if="uploading" class="status uploading">{{ $t('knowledgeUploading') }}</div>

            <div v-if="uploadedFileId" class="verify-area">
              <div class="file-info">已上传文件：{{ uploadedFileName }}</div>
              <div class="secret-row">
                <label>验证码：</label>
                <input v-model="secretKey" type="password" class="secret-input" placeholder="请输入验证码" @keydown.enter="submitVerify" />
                <button class="submit-btn" :disabled="!secretKey || verifying" @click="submitVerify">{{ verifying ? '验证中...' : '提交' }}</button>
              </div>
            </div>
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
              <a-select
                :value="currentModel"
                style="width: 260px; margin-left: 8px"
                @change="showModelSwitchModal"
              >
                <a-select-option v-for="m in availableModels" :key="m" :value="m">{{ m }}</a-select-option>
              </a-select>
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

            <a-modal v-model:visible="modelSwitchModalVisible" title="切换模型" @ok="confirmSwitchModel" :confirmLoading="modelSwitchLoading">
              <p>确定切换到 {{ pendingModel }} ？</p>
              <a-input-password v-model:value="modelSwitchSecretKey" placeholder="请输入验证码" @keydown.enter="confirmSwitchModel" />
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
                <li><CheckCircleOutlined /> 支持 .txt / .md / .pdf / .docx / .doc 格式</li>
                <li><CheckCircleOutlined /> 文件上传后，页面会显示文件名，输入验证码后点击"提交"</li>
                <li><CheckCircleOutlined /> 系统自动提取文件内容并切片存入向量数据库，提交成功后显示切片数量</li>
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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';

const API_BASE = 'https://code-nav.top'
import { UploadOutlined, InfoCircleOutlined, EditOutlined, BulbOutlined, CheckCircleOutlined, FileOutlined, BookOutlined, LinkOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

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
  setup() {
    const activeTab = ref('file');
    const fileInput = ref<HTMLInputElement | null>(null);
    const uploading = ref(false);
    const verifying = ref(false);
    const result = ref<{ success: boolean; message: string } | null>(null);
    const secretKey = ref('');
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
    const currentModel = ref('');
    const availableModels = ref<string[]>([]);
    const pendingModel = ref('');
    const modelSwitchModalVisible = ref(false);
    const modelSwitchSecretKey = ref('');
    const modelSwitchLoading = ref(false);

    onMounted(() => {
      loadStats();
      loadEntries();
      loadModel();
    });

    watch(activeTab, (tab) => {
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

    async function uploadFile(file: File) {
      const formData = new FormData();
      formData.append('file', file);
      uploading.value = true;
      result.value = null;
      try {
        const res = await fetch(API_BASE + '/api/aiuploadfile', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) {
          result.value = { success: false, message: data.detail || '上传失败' };
        } else {
          uploadedFileId.value = data.file_id;
          uploadedFileName.value = data.filename;
          result.value = { success: true, message: data.message };
        }
      } catch {
        result.value = { success: false, message: '上传失败：网络错误' };
      } finally {
        uploading.value = false;
      }
    }

    async function submitVerify() {
      if (!secretKey.value || !uploadedFileId.value) return;
      verifying.value = true;
      result.value = null;
      try {
        const formData = new FormData();
        formData.append('file_id', uploadedFileId.value);
        formData.append('secret_key', secretKey.value);
        const res = await fetch(API_BASE + '/api/aiuploadfile/verify', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) {
          result.value = { success: false, message: data.detail || '验证失败' };
        } else {
          result.value = data;
          uploadedFileId.value = '';
          uploadedFileName.value = '';
          secretKey.value = '';
        }
      } catch {
        result.value = { success: false, message: '验证失败：网络错误' };
      } finally {
        verifying.value = false;
      }
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

    async function loadModel() {
      try {
        const res = await fetch(API_BASE + '/api/model');
        const data = await res.json();
        currentModel.value = data.model;
        availableModels.value = data.available;
      } catch {
        // ignore
      }
    }

    function showModelSwitchModal(value: string) {
      pendingModel.value = value;
      modelSwitchSecretKey.value = '';
      modelSwitchModalVisible.value = true;
    }

    async function confirmSwitchModel() {
      if (!modelSwitchSecretKey.value) return;
      modelSwitchLoading.value = true;
      try {
        const formData = new FormData();
        formData.append('model', pendingModel.value);
        formData.append('secret_key', modelSwitchSecretKey.value);
        const res = await fetch(API_BASE + '/api/model', { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          currentModel.value = data.model;
          modelSwitchModalVisible.value = false;
          modelSwitchSecretKey.value = '';
          message.success(`已切换到 ${data.model}`);
        } else {
          const data = await res.json();
          message.error(data.detail || '切换失败');
        }
      } catch {
        message.error('切换失败：网络错误');
      } finally {
        modelSwitchLoading.value = false;
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

    return { activeTab, fileInput, uploading, verifying, result, secretKey, uploadedFileId, uploadedFileName, triggerUpload, onFileSelected, onDrop, submitVerify, textContent, textSecretKey, textSubmitting, submitText, crawlUrl, crawlSecretKey, crawlSubmitting, crawlMode, submitCrawl, menuCrawlUrl, menuCrawlSecretKey, menuCrawlSubmitting, menuCrawlResult, submitMenuCrawl, stats, entries, loading, searchText, pagination, columns, loadEntries, handleTableChange, handleExpand, deleteEntry, showDeleteModal, showBatchDeleteModal, confirmDelete, deleteModalVisible, deleteSecretKey, deleteLoading, selectedRowKeys, onSelectChange, isBatchDelete, failures, failuresLoading, failureColumns, loadFailures, fileList, fileListLoading, fileColumns, loadFileList, formatSize, showFileDeleteModal, confirmFileDelete, fileDeleteModalVisible, fileDeleteSecretKey, fileDeleteLoading, deletingFile, retryFile, showClearAllModal, confirmClearAll, clearAllModalVisible, clearAllSecretKey, clearAllLoading, currentModel, availableModels, pendingModel, modelSwitchModalVisible, modelSwitchSecretKey, modelSwitchLoading, showModelSwitchModal, confirmSwitchModel };
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
.tabs {
  display: flex;
  gap: 0;
  margin-bottom: 20px;
  border-bottom: 2px solid #e8e8e8;
}
.tab {
  padding: 10px 24px;
  cursor: pointer;
  font-size: 15px;
  color: #666;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.2s, border-color 0.2s;
}
.tab:hover {
  color: #1677ff;
}
.tab.active {
  color: #1677ff;
  border-bottom-color: #1677ff;
  font-weight: 600;
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
</style>