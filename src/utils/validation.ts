export const validatePassword = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6位'))
  } else if (value.length > 20) {
    callback(new Error('密码长度不能超过20位'))
  } else {
    callback()
  }
}

export const validatePhone = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback()
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

export const validateEmail = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback()
  } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(value)) {
    callback(new Error('请输入正确的邮箱'))
  } else {
    callback()
  }
}

export const validateIdCard = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback()
  } else if (!/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(value)) {
    callback(new Error('请输入正确的身份证号'))
  } else {
    callback()
  }
}

export const validateCode = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback()
  } else if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    callback(new Error('编码只能包含字母、数字、下划线和短横线'))
  } else {
    callback()
  }
}

export const validateUrl = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback()
  } else if (!/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(value)) {
    callback(new Error('请输入正确的URL'))
  } else {
    callback()
  }
}

export const validatePositiveInteger = (rule: any, value: any, callback: any) => {
  if (!value && value !== 0) {
    callback()
  } else if (!/^[1-9]\d*$/.test(value) && value !== 0) {
    callback(new Error('请输入正整数'))
  } else {
    callback()
  }
}
