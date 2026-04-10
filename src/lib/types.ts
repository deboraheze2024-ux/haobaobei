// 孩子档案
export interface ChildProfile {
  id: string;
  name: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  avatar?: string;
  currentStage: '幼儿园' | '小学低年级' | '小学高年级' | '初中' | '高中';
  keyBehaviors: KeyBehavior[];
  createdAt: string;
  updatedAt: string;
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
