<template>
  <div class="ai-vectors">
    <div class="page-header">
      <h2>AI 向量库管理</h2>
      <div class="header-actions">
        <el-input v-model="searchKeyword" placeholder="向量语义搜索" clearable style="width: 320px;" @keyup.enter="onSearch" />
        <el-button type="primary" :icon="Search" @click="onSearch">搜索</el-button>
        <el-button type="success" :icon="Plus" @click="openCreate">新增向量</el-button>
        <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
      </div>
    </div>

    <el-card>
      <div v-if="searchMode" class="search-banner">
        <el-icon><Search /></el-icon>
        <span>搜索模式（语义召回）— 关键词："{{ lastKeyword }}"</span>
      </div>
      <el-table :data="vectors" v-loading="loading" border stripe>
        <el-table-column prop="vectorId" label="ID" width="100" />
        <el-table-column prop="content" label="内容" min-width="280" show-overflow-tooltip />
        <el-table-column prop="docType" label="类型" width="120" />
        <el-table-column prop="docRefId" label="关联ID" width="100" />
        <el-table-column v-if="searchMode" prop="score" label="相似度" width="100">
          <template #default="{ row }">
            <el-progress :percentage="Math.round((row.score || 0) * 100)" :stroke-width="10" />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="danger" link @click="deleteVector(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增向量" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="内容" required>
          <el-input v-model="form.content" type="textarea" :rows="6" placeholder="待向量化的文本内容" />
        </el-form-item>
        <el-form-item label="业务类型" required>
          <el-input v-model="form.bizType" placeholder="如 hazard/permit/training" />
        </el-form-item>
        <el-form-item label="业务ID">
          <el-input-number v-model="form.bizId" :min="0" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="onSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { Plus, Refresh, Search } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { aiApi } from "@/api/modules/ai"

const vectors = ref<any[]>([])
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const searchKeyword = ref("")
const lastKeyword = ref("")
const searchMode = ref(false)

const form = reactive<any>({ content: "", bizType: "", bizId: 0 })

const formatDateTime = (s?: string) => (s ? s.replace("T", " ").substring(0, 16) : "-")

const loadVectors = async () => {
  loading.value = true
  searchMode.value = false
  try {
    // 后端无独立 list 端点，使用空 query 走 search 获取
    const res: any = await aiApi.searchVectors({ query: "", topK: 50 } as any)
    vectors.value = res?.data?.items || res?.data?.list || res?.data?.results || res?.data || []
  } catch (e: any) {
    ElMessage.error("加载向量失败: " + (e?.message || e))
    vectors.value = []
  } finally {
    loading.value = false
  }
}

const onSearch = async () => {
  if (!searchKeyword.value.trim()) {
    resetSearch()
    return
  }
  loading.value = true
  searchMode.value = true
  lastKeyword.value = searchKeyword.value
  try {
    const res: any = await aiApi.searchVectors({ query: searchKeyword.value, topK: 20 } as any)
    vectors.value = res.data?.results || res.data?.items || res.data || []
  } catch (e: any) {
    ElMessage.error("搜索失败: " + (e?.message || e))
    vectors.value = []
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchKeyword.value = ""
  lastKeyword.value = ""
  loadVectors()
}

const openCreate = () => {
  form.content = ""
  form.bizType = ""
  form.bizId = 0
  dialogVisible.value = true
}

const onSubmit = async () => {
  if (!form.content?.trim()) {
    ElMessage.warning("请输入向量内容")
    return
  }
  if (!form.bizType?.trim()) {
    ElMessage.warning("请输入业务类型")
    return
  }
  submitting.value = true
  try {
    await aiApi.createVector({
      biz_type: form.bizType,
      biz_id: form.bizId,
      content: form.content,
    } as any)
    ElMessage.success("创建成功")
    dialogVisible.value = false
    loadVectors()
  } catch (e: any) {
    ElMessage.error("创建失败: " + (e?.message || e))
  } finally {
    submitting.value = false
  }
}

const deleteVector = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定删除向量 #${row.vectorId} 吗？`, "删除确认", { type: "warning" })
    await aiApi.deleteVector(row.vectorId)
    ElMessage.success("删除成功")
    loadVectors()
  } catch (e: any) {
    if (e === "cancel") return
    ElMessage.error("删除失败: " + (e?.message || e))
  }
}

onMounted(() => loadVectors())
</script>

<style scoped>
.ai-vectors { padding: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.page-header h2 { margin: 0; font-size: 20px; }
.header-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.search-banner { background: #f0f9eb; color: #67c23a; padding: 8px 12px; border-radius: 4px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
</style>
