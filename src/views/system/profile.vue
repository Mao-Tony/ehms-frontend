<template>
  <div class="user-profile">
    <div class="page-header">
      <h2>个人资料</h2>
      <el-button :icon="Refresh" @click="loadMe">刷新</el-button>
    </div>

    <el-row :gutter="16">
      <el-col :span="10">
        <el-card>
          <template #header><span>基本信息</span></template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户ID">{{ user.userId || "-" }}</el-descriptions-item>
            <el-descriptions-item label="用户名">{{ user.username || "-" }}</el-descriptions-item>
            <el-descriptions-item label="姓名">{{ user.realName || user.name || "-" }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ user.phone || "-" }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ user.email || "-" }}</el-descriptions-item>
            <el-descriptions-item label="部门">{{ user.deptName || user.deptId || "-" }}</el-descriptions-item>
            <el-descriptions-item label="角色">
              <el-tag v-for="r in (user.roles || [])" :key="r" type="primary" style="margin-right: 4px;">{{ r }}</el-tag>
              <span v-if="!user.roles?.length">-</span>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="user.status === 'active' ? 'success' : 'info'">{{ user.status || "active" }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      <el-col :span="14">
        <el-card>
          <template #header><span>修改密码</span></template>
          <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="120px" style="max-width: 480px;">
            <el-form-item label="原密码" prop="oldPassword">
              <el-input v-model="pwdForm.oldPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="pwdForm.newPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input v-model="pwdForm.confirmPassword" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="submitting" @click="onChangePassword">保存修改</el-button>
              <el-button @click="resetPwdForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { Refresh } from "@element-plus/icons-vue"
import { ElMessage, type FormInstance, type FormRules } from "element-plus"
import { authApi } from "@/api/modules/auth"

const user = ref<any>({})
const pwdFormRef = ref<FormInstance>()
const submitting = ref(false)

const pwdForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
})

const pwdRules: FormRules = {
  oldPassword: [{ required: true, message: "请输入原密码", trigger: "blur" }],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "密码至少6位", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    {
      validator: (_rule, value, callback) => {
        if (value !== pwdForm.newPassword) callback(new Error("两次密码不一致"))
        else callback()
      },
      trigger: "blur",
    },
  ],
}

const loadMe = async () => {
  try {
    const res: any = await authApi.getCurrentUser()
    user.value = res.data || res || {}
  } catch (e: any) {
    ElMessage.error("加载用户信息失败: " + (e?.message || e))
  }
}

const resetPwdForm = () => {
  pwdFormRef.value?.resetFields()
}

const onChangePassword = async () => {
  if (!pwdFormRef.value) return
  await pwdFormRef.value.validate(async valid => {
    if (!valid) return
    submitting.value = true
    try {
      await authApi.changePassword({
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword,
      })
      ElMessage.success("密码修改成功")
      resetPwdForm()
    } catch (e: any) {
      ElMessage.error("密码修改失败: " + (e?.message || e))
    } finally {
      submitting.value = false
    }
  })
}

onMounted(() => loadMe())
</script>

<style scoped>
.user-profile { padding: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { margin: 0; font-size: 20px; }
</style>
