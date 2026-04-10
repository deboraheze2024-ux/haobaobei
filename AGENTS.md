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
- **存储**: Supabase PostgreSQL 数据库 + localStorage 降级

## 目录结构

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts           # AI 对话 API
│   │   ├── goals/breakdown/route.ts # AI 目标拆解 API
│   │   ├── upload/route.ts          # 图片上传 API
│   │   └── db-query/route.ts        # 数据库查询 API
│   ├── checkin/page.tsx             # 今日打卡
│   ├── chat/page.tsx                # AI 问答助手
│   ├── goals/page.tsx               # 成长目标管理
│   ├── meeting/page.tsx             # 家庭会议
│   ├── parenting/page.tsx           # 父母园地
│   ├── phrases/page.tsx             # 话术速查库
│   ├── profile/page.tsx             # 成长档案
│   ├── settings/page.tsx            # 陪伴对象管理
│   ├── layout.tsx                   # 根布局
│   └── page.tsx                    # 首页
├── components/                      # 组件
│   └── main-nav.tsx                # 主导航
├── lib/
│   ├── types.ts                    # 类型定义
│   ├── knowledge-base.ts           # 正面管教知识库 (50+条目)
│   ├── storage.ts                 # localStorage 管理
│   ├── context.tsx                 # React Context
│   └── db-sync.ts                  # 数据库同步模块
└── storage/
    └── database/
        ├── shared/
        │   └── schema.ts           # 数据库 Schema 定义
        ├── migrations/             # 数据库迁移文件
        ├── supabase-client.ts      # Supabase 客户端
        └── db-operations.ts        # 数据库 CRUD 操作
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
- 30+ 实用话术卡片
- 按场景分类（赢得合作/启发式提问/情绪调节/正向引导/日常互动）
- 搜索和收藏功能
- 支持自定义添加话术

### 5. 家庭会议 (`/meeting`)
- 完整6步流程：致谢→议题→头脑风暴→决策→娱乐计划→记录
- 交互式会议引导界面
- 历史会议归档和回顾

### 6. 父母园地 (`/parenting`)
- **陪伴笔记**：随时记录育儿心得，支持置顶和标签
- **复盘记录表**：发生了什么→想法→感受→行动→结果→分析→收获（文字+图片）
- **学习与成长记录**：记录书籍/课程/文章学习，支持行动计划
- **重要经验**：分类管理（成功经验/挑战应对/突破时刻/深刻教训/实用技巧），支持标星标注

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

### POST /api/goals/breakdown
AI 目标拆解接口，将成长目标分解为具体可执行的节点。

**请求体**:
```json
{
  "goalTitle": "培养孩子独立性",
  "goalDescription": "希望孩子能自己整理房间",
  "childInfo": {
    "name": "小明",
    "currentStage": "小学低年级",
    "personality": "活泼好动"
  }
}
```

**响应**: 包含目标节点、建议话术、相关知识点的结构化数据

### POST /api/db-query
数据库查询接口，用于客户端访问 Supabase 数据库。

**请求体**:
```json
{
  "table": "child_profiles",
  "operation": "select",
  "filters": { "id": "xxx" },
  "order": { "column": "created_at", "ascending": false },
  "limit": 10,
  "single": false
}
```

**operation** 支持: `select`, `insert`, `update`, `delete`

## 数据存储

- **主存储**: Supabase PostgreSQL 数据库
  - 14 张数据表（用户表、会话表、孩子档案、打卡记录、情绪记录、家庭会议、成长目标、聊天记录、话术卡片、任务模板、陪伴笔记、复盘记录、学习记录、重要经验、应用设置）
  - 所有表启用了 RLS 策略，支持用户数据隔离
  - **用户系统**：支持注册、登录、会话管理
- **降级存储**: localStorage（当数据库不可用时使用）
- **数据同步**: `db-sync.ts` 模块负责数据库和 localStorage 之间的数据同步
- **环境变量**: Supabase 配置存储在 `.env` 文件中

## 用户系统

### API 接口

#### POST /api/auth
用户认证接口，支持注册、登录、登出等操作。

**请求体**:
```json
{
  "action": "register | login | logout | verify | update-profile | get-profile",
  "email": "user@example.com",
  "password": "password123",
  "name": "用户名（可选）"
}
```

**响应**:
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "用户名"
  },
  "token": "session-token"
}
```

## 知识库

- 位置: `src/lib/knowledge-base.ts`
- 内容: 《正面管教》10章节核心内容
- 包含话术模板、实用工具、错误目的分析等

## UI 设计规范

### 视觉风格
- **温馨柔和**：使用粉色、玫瑰色、紫色作为主色调
- **渐变背景**：卡片和组件使用柔和的渐变效果
- **圆角设计**：所有卡片使用 `rounded-2xl` 圆角
- **阴影层次**：组件使用柔和的彩色阴影

### 色彩系统
| 用途 | 颜色 |
|------|------|
| 打卡 | amber/orange |
| 目标 | violet/purple |
| 档案 | pink/rose |
| 问答 | blue/indigo |
| 话术 | teal/emerald |
| 会议 | cyan/blue |

### 组件规范
- Logo: 带有"正"字的渐变圆形图标
- 导航: 白色背景 + 粉色边框 + 毛玻璃效果
- 卡片: 白色/渐变背景 + 圆角 + 柔和阴影
- 按钮: 渐变色 + 彩色阴影

## 注意事项

- AI API 仅在后端调用（API Route）
- 所有组件使用 'use client' 指令
- 避免 Hydration 问题：动态数据用 useEffect + useState
