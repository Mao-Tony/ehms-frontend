<template>
  <div class="document-versions">
    <div class="page-header">
      <h2>文档版本管理</h2>
      <div class="header-actions">
        <el-select v-model="selectedDocId" placeholder="选择文档" filterable style="width: 320px;" @change="loadVersions">
          <el-option v-for="d in documents" :key="d.docId" :label="`${d.docCode || ''} ${d.docTitle}`" :value="d.docId" />
        </el-select>
        <el-button type="primary" :icon="Plus" :disabled="!selectedDocId" @click="openCreate">新建版本</el-button>
        <el-button :icon="Refresh" @click="loadVersions" :disabled="!selectedDocId">刷新</el-button>
      </div>
    </div>

    <el-card>
      <el-table :data="versions" v-loading="loading" border stripe>
        <el-table-column prop="version" label="版本号" width="120" />
        <el-table-column prop="docTitle" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="docType" label="类型" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishDate" label="发布日期" width="140" />
        <el-table-column prop="effectiveDate" label="生效日期" width="140" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="viewDetail(row)">查看</el-button>
            <el-button v-if="row.fileUrl" size="small" type="success" link @click="downloadFile(row.fileUrl)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="createDialog" title="新建版本" width="600px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="版本号" prop="version">
          <el-input v-model="form.version" placeholder="如 v1.1" />
        </el-form-item>
        <el-form-item label="文档标题" prop="docTitle">
          <el-input v-model="form.docTitle" />
        </el-form-item>
        <el-form-item label="文档类型">
          <el-input v-model="form.docType" placeholder="如 制度/标准/手册" />
        </el-form-item>
        <el-form-item label="文档编号">
          <el-input v-model="form.docCode" />
        </el-form-item>
        <el-form-item label="发布日期">
          <el-date-picker v-model="form.publishDate" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="生效日期">
          <el-date-picker v-model="form.effectiveDate" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="文件URL">
          <el-input v-model="form.fileUrl" placeholder="上传后填入文件URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="onSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { Plus, Refresh } from "@element-plus/icons-vue"
import { ElMessage, type FormInstance } from "element-plus"
import { complianceApi } from "@/api/modules/compliance"

const documents = ref<any[]>([])
const versions = ref<any[]>([])
const selectedDocId = ref<number | null>(null)
const loading = ref(false)
const submitting = ref(false)
const createDialog = ref(false)
const formRef = ref<FormInstance>()

const form = reactive<any>({
  version: "",
  docTitle: "",
  docType: "",
  docCode: "",
  publishDate: "",
  effectiveDate: "",
  fileUrl: "",
})

const rules = {
  version: [{ required: true, message: "请输入版本号", trigger: "blur" }],
  docTitle: [{ required: true, message: "请输入文档标题", trigger: "blur" }],
}

const statusTag = (s: string): any => {
  const map: Record<string, string> = {
    draft: "info", published: "success", expired: "danger", archived: "",
  }
  return map[s] || ""
}

const loadDocuments = async () => {
  try {
    const res: any = await complianceApi.listDocuments({ page: 1, pageSize: 100 } as any)
    documents.value = res.data?.items || res.data?.list || []
    if (documents.value.length > 0 && !selectedDocId.value) {
      selectedDocId.value = documents.value[0].docId
      loadVersions()
    }
  } catch (e: any) {
    ElMessage.error("加载文档列表失败: " + (e?.message || e))
  }
}

const loadVersions = async () => {
  if (!selectedDocId.value) return
  loading.value = true
  try {
    const res: any = await complianceApi.getDocumentVersions(selectedDocId.value)
    versions.value = res.data?.items || res.data || []
  } catch (e: any) {
    ElMessage.error("加载版本失败: " + (e?.message || e))
    versions.value = []
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(form, {
    version: "", docTitle: "", docType: "", docCode: "",
    publishDate: "", effectiveDate: "", fileUrl: "",
  })
}

const openCreate = () => {
  resetForm()
  createDialog.value = true
}

const onSubmit = async () => {
  if (!formRef.value || !selectedDocId.value) return
  await formRef.value.validate(async valid => {
    if (!valid) return
    submitting.value = true
    try {
      await complianceApi.createDocumentVersion(selectedDocId.value!, { ...form } as any)
      ElMessage.success("创建成功")
      createDialog.value = false
      loadVersions()
    } catch (e: any) {
      ElMessage.error("创建失败: " + (e?.message || e))
    } finally {
      submitting.value = false
    }
  })
}

const viewDetail = (row: any) => {
  ElMessage.info(`查看 ${row.version} 详情（接入详情页后跳转）`)
}

const downloadFile = (url: string) => {
  window.open(url, "_blank")
}

onMounted(() => loadDocuments())
</script>

<style scoped>
.document-versions { padding: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.page-header h2 { margin: 0; font-size: 20px; }
.header-actions { display: flex; gap: 12px; flex-wrap: wrap; }
</style>
