// 本地存储管理器
import {
  ChildProfile,
  CheckInRecord,
  EmotionRecord,
  FamilyMeeting,
  ChatMessage,
  GrowthGoal,
  AppSettings,
  ParentingNote,
  ReflectionRecord,
  LearningRecord,
  ImportantExperience,
} from './types';
import {
  defaultTaskTemplates,
  defaultPhraseCards,
  defaultChildProfile,
} from './knowledge-base';

const STORAGE_KEY = 'positive-parenting-app';

// 默认设置
const defaultSettings: AppSettings = {
  childProfiles: [defaultChildProfile],
  activeChildId: defaultChildProfile.id,
  taskTemplates: defaultTaskTemplates,
  phraseCards: defaultPhraseCards,
  knowledgeBase: [],
};

export const storage = {
  // 获取所有设置
  getSettings(): AppSettings {
    if (typeof window === 'undefined') return defaultSettings;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      this.saveSettings(defaultSettings);
      return defaultSettings;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return defaultSettings;
    }
  },

  // 保存设置
  saveSettings(settings: AppSettings): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  },

  // 获取孩子档案
  getChildProfiles(): ChildProfile[] {
    return this.getSettings().childProfiles;
  },

  // 获取当前激活的孩子
  getActiveChild(): ChildProfile | null {
    const settings = this.getSettings();
    const activeId = settings.activeChildId;
    return settings.childProfiles.find((c) => c.id === activeId) || null;
  },

  // 设置当前孩子
  setActiveChild(childId: string): void {
    const settings = this.getSettings();
    settings.activeChildId = childId;
    this.saveSettings(settings);
  },

  // 添加孩子
  addChildProfile(child: ChildProfile): void {
    const settings = this.getSettings();
    settings.childProfiles.push(child);
    this.saveSettings(settings);
  },

  // 更新孩子档案
  updateChildProfile(child: ChildProfile): void {
    const settings = this.getSettings();
    const index = settings.childProfiles.findIndex((c) => c.id === child.id);
    if (index !== -1) {
      settings.childProfiles[index] = child;
      this.saveSettings(settings);
    }
  },

  // 获取打卡记录
  getCheckInRecords(): CheckInRecord[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`${STORAGE_KEY}_checkins`);
    return stored ? JSON.parse(stored) : [];
  },

  // 保存打卡记录
  saveCheckInRecord(record: CheckInRecord): void {
    if (typeof window === 'undefined') return;
    const records = this.getCheckInRecords();
    const index = records.findIndex(
      (r) => r.date === record.date && r.period === record.period
    );
    if (index !== -1) {
      records[index] = record;
    } else {
      records.push(record);
    }
    localStorage.setItem(`${STORAGE_KEY}_checkins`, JSON.stringify(records));
  },

  // 获取今日打卡记录
  getTodayCheckIn(): CheckInRecord[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getCheckInRecords().filter((r) => r.date === today);
  },

  // 获取情绪记录
  getEmotionRecords(): EmotionRecord[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`${STORAGE_KEY}_emotions`);
    return stored ? JSON.parse(stored) : [];
  },

  // 保存情绪记录
  saveEmotionRecord(record: EmotionRecord): void {
    if (typeof window === 'undefined') return;
    const records = this.getEmotionRecords();
    records.push(record);
    localStorage.setItem(`${STORAGE_KEY}_emotions`, JSON.stringify(records));
  },

  // 获取近7天情绪记录
  getRecentEmotions(days: number = 7): EmotionRecord[] {
    const records = this.getEmotionRecords();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return records.filter((r) => new Date(r.date) >= cutoff);
  },

  // 获取家庭会议
  getFamilyMeetings(): FamilyMeeting[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`${STORAGE_KEY}_meetings`);
    return stored ? JSON.parse(stored) : [];
  },

  // 保存家庭会议
  saveFamilyMeeting(meeting: FamilyMeeting): void {
    if (typeof window === 'undefined') return;
    const meetings = this.getFamilyMeetings();
    const index = meetings.findIndex((m) => m.id === meeting.id);
    if (index !== -1) {
      meetings[index] = meeting;
    } else {
      meetings.push(meeting);
    }
    localStorage.setItem(`${STORAGE_KEY}_meetings`, JSON.stringify(meetings));
  },

  // 获取聊天记录
  getChatMessages(): ChatMessage[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`${STORAGE_KEY}_chat`);
    return stored ? JSON.parse(stored) : [];
  },

  // 保存聊天消息
  saveChatMessage(message: ChatMessage): void {
    if (typeof window === 'undefined') return;
    const messages = this.getChatMessages();
    messages.push(message);
    // 只保留最近50条
    const trimmed = messages.slice(-50);
    localStorage.setItem(`${STORAGE_KEY}_chat`, JSON.stringify(trimmed));
  },

  // 清空聊天
  clearChat(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`${STORAGE_KEY}_chat`);
  },

  // ========== 目标管理 ==========

  // 获取成长目标
  getGrowthGoals(childId?: string): GrowthGoal[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`${STORAGE_KEY}_goals`);
    if (!stored) return [];
    const goals = JSON.parse(stored);
    if (childId) {
      return goals.filter((g: GrowthGoal) => g.childId === childId);
    }
    return goals;
  },

  // 保存成长目标
  saveGrowthGoal(goal: GrowthGoal): void {
    if (typeof window === 'undefined') return;
    const goals = this.getGrowthGoals();
    const index = goals.findIndex((g) => g.id === goal.id);
    if (index !== -1) {
      goals[index] = goal;
    } else {
      goals.push(goal);
    }
    localStorage.setItem(`${STORAGE_KEY}_goals`, JSON.stringify(goals));
  },

  // 删除成长目标
  deleteGrowthGoal(goalId: string): void {
    if (typeof window === 'undefined') return;
    const goals = this.getGrowthGoals().filter((g) => g.id !== goalId);
    localStorage.setItem(`${STORAGE_KEY}_goals`, JSON.stringify(goals));
  },

  // 获取活跃目标
  getActiveGoals(childId: string): GrowthGoal[] {
    return this.getGrowthGoals(childId).filter(
      (g) => g.status === 'active'
    );
  },

  // ============================================
  // 父母园地 - 陪伴笔记
  // ============================================

  getParentingNotes(): ParentingNote[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`${STORAGE_KEY}_parentingNotes`);
    return stored ? JSON.parse(stored) : [];
  },

  saveParentingNote(note: ParentingNote): void {
    if (typeof window === 'undefined') return;
    const notes = this.getParentingNotes();
    const index = notes.findIndex((n) => n.id === note.id);
    if (index >= 0) {
      notes[index] = note;
    } else {
      notes.push(note);
    }
    localStorage.setItem(`${STORAGE_KEY}_parentingNotes`, JSON.stringify(notes));
  },

  deleteParentingNote(noteId: string): void {
    if (typeof window === 'undefined') return;
    const notes = this.getParentingNotes().filter((n) => n.id !== noteId);
    localStorage.setItem(`${STORAGE_KEY}_parentingNotes`, JSON.stringify(notes));
  },

  // ============================================
  // 父母园地 - 复盘记录
  // ============================================

  getReflectionRecords(): ReflectionRecord[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`${STORAGE_KEY}_reflectionRecords`);
    return stored ? JSON.parse(stored) : [];
  },

  saveReflectionRecord(record: ReflectionRecord): void {
    if (typeof window === 'undefined') return;
    const records = this.getReflectionRecords();
    const index = records.findIndex((r) => r.id === record.id);
    if (index >= 0) {
      records[index] = record;
    } else {
      records.push(record);
    }
    localStorage.setItem(`${STORAGE_KEY}_reflectionRecords`, JSON.stringify(records));
  },

  deleteReflectionRecord(recordId: string): void {
    if (typeof window === 'undefined') return;
    const records = this.getReflectionRecords().filter((r) => r.id !== recordId);
    localStorage.setItem(`${STORAGE_KEY}_reflectionRecords`, JSON.stringify(records));
  },

  // ============================================
  // 父母园地 - 学习成长记录
  // ============================================

  getLearningRecords(): LearningRecord[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`${STORAGE_KEY}_learningRecords`);
    return stored ? JSON.parse(stored) : [];
  },

  saveLearningRecord(record: LearningRecord): void {
    if (typeof window === 'undefined') return;
    const records = this.getLearningRecords();
    const index = records.findIndex((r) => r.id === record.id);
    if (index >= 0) {
      records[index] = record;
    } else {
      records.push(record);
    }
    localStorage.setItem(`${STORAGE_KEY}_learningRecords`, JSON.stringify(records));
  },

  deleteLearningRecord(recordId: string): void {
    if (typeof window === 'undefined') return;
    const records = this.getLearningRecords().filter((r) => r.id !== recordId);
    localStorage.setItem(`${STORAGE_KEY}_learningRecords`, JSON.stringify(records));
  },

  // ============================================
  // 父母园地 - 重要经验
  // ============================================

  getImportantExperiences(): ImportantExperience[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`${STORAGE_KEY}_importantExperiences`);
    return stored ? JSON.parse(stored) : [];
  },

  saveImportantExperience(experience: ImportantExperience): void {
    if (typeof window === 'undefined') return;
    const experiences = this.getImportantExperiences();
    const index = experiences.findIndex((e) => e.id === experience.id);
    if (index >= 0) {
      experiences[index] = experience;
    } else {
      experiences.push(experience);
    }
    localStorage.setItem(`${STORAGE_KEY}_importantExperiences`, JSON.stringify(experiences));
  },

  deleteImportantExperience(id: string): void {
    if (typeof window === 'undefined') return;
    const experiences = this.getImportantExperiences().filter((e) => e.id !== id);
    localStorage.setItem(`${STORAGE_KEY}_importantExperiences`, JSON.stringify(experiences));
  },
};
