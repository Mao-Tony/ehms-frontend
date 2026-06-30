# EHMS 安全生产管理系统前端

## 项目简介
EHMS（Enterprise Hazard Management System）安全生产管理系统PC管理端，基于 Vue 3 + TypeScript + Vite 6 + Element Plus 构建。

## 技术栈
- Vue 3.4 + TypeScript 5.4 + Vite 6
- Element Plus 2.6 + SCSS
- Pinia 2.1 + Vue Router 4.3
- Axios + ECharts 5.5

## 开发规范

### 目录结构
```
src/
├── api/               # API 接口
│   ├── modules/       # 按模块划分的接口
│   ├── request.ts     # Axios 封装
│   └── types.ts       # 类型定义
├── assets/            # 静态资源
├── components/        # 公共组件
│   └── common/        # 通用组件
├── router/            # 路由配置
├── stores/            # Pinia 状态管理
├── styles/            # 全局样式
├── utils/             # 工具函数
└── views/             # 页面视图
    └── [module]/      # 按模块划分的页面
```

### API 规范
- 基础路径：`/api/v1`
- 请求拦截器自动注入 Token
- 响应拦截器统一处理错误

### 命名规范
- 组件名：PascalCase
- 文件名：kebab-case
- CSS 类名：kebab-case

## 开发
```bash
npm install
npm run dev
```

## 构建
```bash
npm run build
```
