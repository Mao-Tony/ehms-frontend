<template>
  <div class="login-container">
    <div class="login-left">
      <div class="login-brand">
        <h1 class="brand-title">EHMS</h1>
        <p class="brand-subtitle">安全生产管理系统</p>
      </div>
      <div class="login-features">
        <div class="feature-item">
          <el-icon><Check /></el-icon>
          <span>风险分级管控</span>
        </div>
        <div class="feature-item">
          <el-icon><Check /></el-icon>
          <span>隐患排查治理</span>
        </div>
        <div class="feature-item">
          <el-icon><Check /></el-icon>
          <span>作业票管理</span>
        </div>
        <div class="feature-item">
          <el-icon><Check /></el-icon>
          <span>应急指挥调度</span>
        </div>
      </div>
    </div>
    <div class="login-right">
      <div class="login-form-wrapper">
        <h2 class="form-title">用户登录</h2>
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @keyup.enter="handleLogin">
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          <el-form-item prop="captchaCode" v-if="captchaId">
            <el-input
              v-model="form.captchaCode"
              placeholder="请输入验证码"
              size="large"
              style="width: 60%"
              :prefix-icon="CircleCheck"
            />
            <img :src="captchaUrl" @click="refreshCaptcha" class="captcha-img" alt="验证码" />
          </el-form-item>
          <el-form-item>
            <div class="remember-wrapper">
              <el-checkbox v-model="form.remember">记住密码</el-checkbox>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="large" :loading="loading" @click="handleLogin" class="login-btn">
              登 录
            </el-button>
          </el-form-item>
          <el-form-item>
            <el-button size="large" @click="handleFeishuLogin" class="feishu-btn">
              <el-icon style="margin-right: 8px"><Link /></el-icon>
              飞书登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, CircleCheck, Check, Link } from '@element-plus/icons-vue'
import { authApi } from '@/api/modules/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref()
const loading = ref(false)
const captchaId = ref('')
const captchaUrl = ref('')

const form = reactive({
  username: localStorage.getItem('remember_username') || '',
  password: localStorage.getItem('remember_password') || '',
  captchaId: '',
  captchaCode: '',
  remember: !!localStorage.getItem('remember_username')
})

const validatePassword = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6位'))
  } else {
    callback()
  }
}

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, validator: validatePassword, trigger: 'blur' }]
}

async function handleLogin() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const res = await authApi.login({
      username: form.username,
      password: form.password,
      captchaId: form.captchaId,
      captchaCode: form.captchaCode
    })
    userStore.login(res.data)

    if (form.remember) {
      localStorage.setItem('remember_username', form.username)
      localStorage.setItem('remember_password', form.password)
    } else {
      localStorage.removeItem('remember_username')
      localStorage.removeItem('remember_password')
    }

    ElMessage.success('登录成功')

    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || '/dashboard')
  } catch (error: any) {
    if (error.response?.data?.needCaptcha) {
      captchaId.value = error.response.data.captchaId
      captchaUrl.value = `/api/v1/auth/captcha/${captchaId.value}`
    }
  } finally {
    loading.value = false
  }
}

async function handleFeishuLogin() {
  try {
    const res = await authApi.getCurrentUser()
    window.location.href = res.data as any
  } catch (error) {
    ElMessage.error('获取飞书登录链接失败')
  }
}

function refreshCaptcha() {
  if (captchaId.value) {
    captchaUrl.value = `/api/v1/auth/captcha/${captchaId.value}?t=${Date.now()}`
  }
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    router.push('/dashboard')
  }
})
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #0F2A4A 0%, #1a3a5c 100%);
}

.login-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px;
  color: white;

  .brand-title {
    font-size: 72px;
    font-weight: bold;
    margin: 0;
    letter-spacing: 8px;
    color: #1890FF;
  }

  .brand-subtitle {
    font-size: 28px;
    margin: 20px 0 60px;
    opacity: 0.9;
  }

  .login-features {
    .feature-item {
      display: flex;
      align-items: center;
      font-size: 18px;
      margin: 16px 0;
      opacity: 0.85;

      .el-icon {
        color: #1890FF;
        margin-right: 12px;
        font-size: 20px;
      }
    }
  }
}

.login-right {
  width: 500px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;

  .login-form-wrapper {
    width: 100%;
    max-width: 360px;

    .form-title {
      font-size: 28px;
      color: #1F2937;
      margin: 0 0 40px;
      text-align: center;
    }

    .captcha-img {
      height: 40px;
      margin-left: 16px;
      cursor: pointer;
      border-radius: 4px;
    }

    .remember-wrapper {
      width: 100%;
    }

    .login-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
    }

    .feishu-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
    }
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}
</style>
