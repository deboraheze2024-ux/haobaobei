// 孩子档案
export interface ChildProfile {
  id: string;
  name: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  avatar?: string;
  nickname?: string; // 昵称
  personality?: string; // 性格特点
  strengths?: string[]; // 优点/长处
  challenges?: string[]; // 挑战/需要改进的地方
  interests?: string[]; // 兴趣爱好
  currentStage: '幼儿园' | '小学低年级' | '小学高年级' | '初中' | '高中';
  keyBehaviors: KeyBehavior[];
  notes?: string; // 备注
  createdAt: string;
  updatedAt: string;
}

// 成长目标
export interface GrowthGoal {
  id: string;
  childId: string;
  title: string; // 目标标题
  description: string; // 目标描述
  category: GoalCategory;
  status: 'active' | 'completed' | 'paused';
  priority: 'high' | 'medium' | 'low';
  progress: number; // 0-100
  nodes: GoalNode[]; // 拆解的节点
  startDate?: string; // 开始日期
  targetEndDate?: string; // 目标完成日期
  actualEndDate?: string; // 实际完成日期
  totalDuration?: number; // 预计天数
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type GoalCategory = 
  | '情绪管理'
  | '行为习惯'
  | '社交能力'
  | '学习习惯'
  | '自信心'
  | '责任感'
  | '自律能力'
  | '其他';

export interface GoalNode {
  id: string;
  goalId: string;
  title: string; // 节点标题
  description: string; // 节点描述
  status: 'pending' | 'in_progress' | 'completed';
  progress: number; // 0-100
  order: number; // 顺序
  relatedPhrases?: string[]; // 相关话术
  relatedKnowledge?: string; // 相关的正面管教知识点
  completedAt?: string;
  notes?: string; // 进展记录
  // 时间计划
  startDate?: string; // 开始日期
  endDate?: string; // 截止日期
  estimatedDays?: number; // 预计天数
  // 可执行任务
  subTasks?: GoalSubTask[]; // 子任务
  // 打卡关联
  linkedCheckIn?: boolean; // 是否关联打卡
  checkInTaskId?: string; // 关联的打卡任务ID
  checkInPeriod?: 'morning' | 'afternoon' | 'evening'; // 打卡时段
  // 每日提醒
  reminderEnabled?: boolean;
  reminderNote?: string; // 提醒说明
}

export interface GoalSubTask {
  id: string;
  title: string; // 任务标题
  completed: boolean;
  completedAt?: string;
  notes?: string; // 执行备注
}

export interface KeyBehavior {
  id: string;
  type: '课堂消极' | '主动开口' | '情绪崩溃' | '其他';
  description: string;
  triggers: string[];
  parentResponse: string;
  effect: '有效' | '部分有效' | '无效';
  createdAt: string;
}

// 打卡记录
export interface CheckInRecord {
  id: string;
  date: string;
  period: 'morning' | 'afternoon' | 'evening';
  tasks: CheckInTask[];
  completedAt?: string;
  notes?: string;
}

export interface CheckInTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
}

// 日常任务模板
export interface TaskTemplate {
  id: string;
  period: 'morning' | 'afternoon' | 'evening';
  title: string;
  description: string;
  icon?: string;
}

// 情绪记录
export interface EmotionRecord {
  id: string;
  childId: string;
  date: string;
  time: string;
  emotion: EmotionType;
  intensity: 1 | 2 | 3 | 4 | 5;
  trigger?: string;
  behavior?: string;
  parentResponse?: string;
  result?: '改善' | '维持' | '恶化';
  notes?: string;
}

export type EmotionType =
  | '开心'
  | '平静'
  | '焦虑'
  | '沮丧'
  | '愤怒'
  | '恐惧'
  | '惊讶'
  | '悲伤'
  | '疲惫'
  | '兴奋';

// 家庭会议
export interface FamilyMeeting {
  id: string;
  date: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  attendees: string[];
  agenda: MeetingAgenda[];
  gratitudeList: string[];
  brainstorms: BrainstormItem[];
  decisions: Decision[];
  funPlan?: string;
  notes?: string;
  createdAt: string;
}

export interface MeetingAgenda {
  id: string;
  topic: string;
  proposer: string;
  status: 'pending' | 'discussed' | 'decided';
  result?: string;
}

export interface BrainstormItem {
  id: string;
  agendaId: string;
  suggestion: string;
  proposer: string;
}

export interface Decision {
  id: string;
  agendaId: string;
  content: string;
  agreedBy: string[];
}

// 话术卡片
export interface PhraseCard {
  id: string;
  category: PhraseCategory;
  title: string;
  content: string;
  situation?: string;
  sourceChapter?: string;
  isFavorite: boolean;
  tags: string[];
}

export type PhraseCategory =
  | '赢得合作'
  | '启发式提问'
  | '积极暂停'
  | '情绪调节'
  | '错误目的'
  | '日常惯例'
  | '家庭会议'
  | '鼓励话语';

// AI 对话
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  references?: KnowledgeReference[];
}

export interface KnowledgeReference {
  chapter: string;
  page: string;
  content: string;
}

// 知识库条目
export interface KnowledgeEntry {
  id: string;
  chapter: string;
  chapterName: string;
  section: string;
  page: string;
  content: string;
  tags: string[];
}

// 设置
export interface AppSettings {
  childProfiles: ChildProfile[];
  activeChildId?: string;
  taskTemplates: TaskTemplate[];
  phraseCards: PhraseCard[];
  knowledgeBase: KnowledgeEntry[];
}

// ============================================
// 父母园地 - 陪伴笔记、复盘记录、学习成长、重要经验
// ============================================

// 陪伴笔记
export interface ParentingNote {
  id: string;
  childId?: string; // 可选关联的孩子
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean; // 是否置顶
  createdAt: string;
  updatedAt: string;
}

// 复盘记录
export interface ReflectionRecord {
  id: string;
  childId?: string;
  title: string;
  date: string;
  // 复盘内容
  situation: string; // 发生了什么
  thoughts: string; // 当时的想法
  feelings: string; // 当时的感受
  actions: string; // 采取了什么行动
  result: string; // 结果如何
  // 分析
  analysis: string; // 分析原因
  learnings: string; // 学到了什么
  // 图片
  images: string[]; // 图片URL数组
  // 标签
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// 学习与成长记录
export interface LearningRecord {
  id: string;
  childId?: string;
  title: string;
  source: 'book' | 'course' | 'article' | 'experience' | 'other';
  sourceName?: string; // 如书名、文章标题
  date: string;
  // 内容
  summary: string; // 学习摘要
  insights: string; // 核心洞察
  application: string; // 如何应用
  actionPlan: string; // 行动计划
  // 图片
  images: string[];
  // 标签
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// 重要经验
export interface ImportantExperience {
  id: string;
  childId?: string;
  title: string;
  content: string;
  category: 'success' | 'challenge' | 'breakthrough' | 'lesson' | 'tip';
  // 标注
  isStarred: boolean; // 是否标星
  highlight: string; // 高亮金句
  // 相关
  relatedNotes?: string[]; // 关联的陪伴笔记ID
  relatedReflections?: string[]; // 关联的复盘记录ID
  // 图片
  images: string[]; // 图片 keys
  // 标签
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type ExperienceCategory = 'success' | 'challenge' | 'breakthrough' | 'lesson' | 'tip';
