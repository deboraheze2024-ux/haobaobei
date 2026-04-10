# 正面管教成长陪伴系统 (Positive Parenting Companion)

## 项目概览

这是一个基于《正面管教》理念的成长陪伴系统，核心差异在于所有 AI 回答都以正面管教书籍为知识根基，结合孩子的具体档案给出个性化建议。

### 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **AI**: coze-coding-dev-sdk (流式输出)
- **存储**: localStorage (本地优先)

## 目录结构

```
src/
├── app/
│   ├── api/chat/route.ts    # AI 对话 API
│   ├── checkin/page.tsx     # 今日打卡
│   ├── chat/page.tsx        # AI 问答助手
│   ├── meeting/page.tsx      # 家庭会议
│   ├── phrases/page.tsx      # 话术速查库
│   ├── profile/page.tsx      # 成长档案
│   ├── layout.tsx           # 根布局
│   └── page.tsx             # 首页
├── components/              # 组件
├── lib/
│   ├── types.ts             # 类型定义
│   ├── knowledge-base.ts     # 正面管教知识库
│   ├── storage.ts           # localStorage 管理
│   └── context.tsx          # React Context
```

## 五大核心模块

### 1. 今日打卡 (`/checkin`)
- 早晨/日间/晚间三段任务
- 基于《正面管教》第7章的日常惯例表
- 进度追踪和可视化

### 2. 成长档案 (`/profile`)
- 情绪追踪（10种情绪类型 + 强度）
- 行为模式记录（基于"四个错误目的"理论）
- 近7天数据统计

### 3. AI 问答助手 (`/chat`)
- 基于118页正面管教内容的 RAG 知识库
- 流式输出（SSE 协议）
- 结合孩子档案的个性化建议
- 引用来源章节

### 4. 话术速查库 (`/phrases`)
- 20+ 实用话术卡片
- 按场景分类（赢得合作/启发式提问/情绪调节等）
- 搜索和收藏功能

### 5. 家庭会议 (`/meeting`)
- 完整6步流程：致谢→议题→头脑风暴→决策→娱乐计划→记录
- 历史会议归档

## 开发命令

```bash
pnpm install    # 安装依赖
pnpm dev       # 开发环境 (端口 5000)
pnpm build     # 构建生产版本
pnpm lint      # ESLint 检查
pnpm ts-check  # TypeScript 检查
```

## API 接口

### POST /api/chat
AI 对话接口，使用流式输出。

**请求体**:
```json
{
  "message": "孩子拒绝上学怎么办？",
  "childInfo": {
    "name": "小明",
    "currentStage": "小学低年级",
    "keyBehaviors": []
  },
  "conversationHistory": []
}
```

**响应**: SSE 流式数据

## 数据存储

- 使用 localStorage 存储所有数据
- key: `positive-parenting-app`
- 子 key: `_checkins`, `_emotions`, `_meetings`, `_chat`

## 知识库

- 位置: `src/lib/knowledge-base.ts`
- 内容: 《正面管教》10章节核心内容
- 包含话术模板、实用工具、错误目的分析等

## 注意事项

- AI API 仅在后端调用（API Route）
- 所有组件使用 'use client' 指令
- 避免 Hydration 问题：动态数据用 useEffect + useState
