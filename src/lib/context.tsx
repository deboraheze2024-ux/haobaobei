'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ChildProfile,
  CheckInRecord,
  EmotionRecord,
  FamilyMeeting,
  ChatMessage,
  TaskTemplate,
  PhraseCard,
  GrowthGoal,
  GoalNode,
  ParentingNote,
  ReflectionRecord,
  LearningRecord,
  ImportantExperience,
} from './types';
import { storage } from './storage';
import {
  defaultTaskTemplates,
  defaultPhraseCards,
  defaultChildProfile,
} from './knowledge-base';

interface AppState {
  // 孩子档案
  activeChild: ChildProfile | null;
  childProfiles: ChildProfile[];
  setActiveChild: (childId: string) => void;
  updateChildProfile: (child: ChildProfile) => void;
  addChildProfile: (child: ChildProfile) => void;
  deleteChildProfile: (childId: string) => void;

  // 打卡
  todayCheckIns: CheckInRecord[];
  taskTemplates: TaskTemplate[];
  saveCheckIn: (record: CheckInRecord) => void;

  // 情绪记录
  emotionRecords: EmotionRecord[];
  recentEmotions: EmotionRecord[];
  saveEmotion: (record: EmotionRecord) => void;

  // 家庭会议
  familyMeetings: FamilyMeeting[];
  saveMeeting: (meeting: FamilyMeeting) => void;
  deleteMeeting: (meetingId: string) => void;

  // 聊天
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;

  // 话术
  phraseCards: PhraseCard[];
  toggleFavorite: (cardId: string) => void;
  addPhraseCard: (card: PhraseCard) => void;
  deletePhraseCard: (cardId: string) => void;

  // 目标管理
  growthGoals: GrowthGoal[];
  activeGoals: GrowthGoal[];
  saveGoal: (goal: GrowthGoal) => void;
  deleteGoal: (goalId: string) => void;
  updateGoalNode: (goalId: string, nodeId: string, updates: Partial<GoalNode>) => void;
  updateGoalSubTask: (goalId: string, nodeId: string, subTaskId: string, updates: Partial<{completed: boolean; notes?: string}>) => void;
  addGoalSubTask: (goalId: string, nodeId: string, title: string) => void;
  deleteGoalSubTask: (goalId: string, nodeId: string, subTaskId: string) => void;
  linkNodeToCheckIn: (goalId: string, nodeId: string, period: 'morning' | 'afternoon' | 'evening', taskTitle: string) => void;
  unlinkNodeFromCheckIn: (goalId: string, nodeId: string) => void;

  // 父母园地
  parentingNotes: ParentingNote[];
  saveParentingNote: (note: ParentingNote) => void;
  deleteParentingNote: (noteId: string) => void;
  toggleNotePin: (noteId: string) => void;

  reflectionRecords: ReflectionRecord[];
  saveReflectionRecord: (record: ReflectionRecord) => void;
  deleteReflectionRecord: (recordId: string) => void;

  learningRecords: LearningRecord[];
  saveLearningRecord: (record: LearningRecord) => void;
  deleteLearningRecord: (recordId: string) => void;

  importantExperiences: ImportantExperience[];
  saveImportantExperience: (experience: ImportantExperience) => void;
  deleteImportantExperience: (id: string) => void;
  toggleExperienceStar: (id: string) => void;

  // 加载状态
  isLoading: boolean;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [activeChild, setActiveChildState] = useState<ChildProfile | null>(null);
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [todayCheckIns, setTodayCheckIns] = useState<CheckInRecord[]>([]);
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>(defaultTaskTemplates);
  const [emotionRecords, setEmotionRecords] = useState<EmotionRecord[]>([]);
  const [recentEmotions, setRecentEmotions] = useState<EmotionRecord[]>([]);
  const [familyMeetings, setFamilyMeetings] = useState<FamilyMeeting[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [phraseCards, setPhraseCards] = useState<PhraseCard[]>(defaultPhraseCards);
  const [growthGoals, setGrowthGoals] = useState<GrowthGoal[]>([]);
  const [activeGoals, setActiveGoals] = useState<GrowthGoal[]>([]);

  // 父母园地状态
  const [parentingNotes, setParentingNotes] = useState<ParentingNote[]>([]);
  const [reflectionRecords, setReflectionRecords] = useState<ReflectionRecord[]>([]);
  const [learningRecords, setLearningRecords] = useState<LearningRecord[]>([]);
  const [importantExperiences, setImportantExperiences] = useState<ImportantExperience[]>([]);

  // 初始化数据
  useEffect(() => {
    const loadData = () => {
      try {
        const settings = storage.getSettings();

        setChildProfiles(settings.childProfiles);
        setActiveChildState(settings.activeChildId
          ? settings.childProfiles.find((c) => c.id === settings.activeChildId) || null
          : null
        );
        setTaskTemplates(settings.taskTemplates.length > 0 ? settings.taskTemplates : defaultTaskTemplates);
        setPhraseCards(settings.phraseCards.length > 0 ? settings.phraseCards : defaultPhraseCards);
        setTodayCheckIns(storage.getTodayCheckIn());
        setEmotionRecords(storage.getEmotionRecords());
        setRecentEmotions(storage.getRecentEmotions());
        setFamilyMeetings(storage.getFamilyMeetings());
        setChatMessages(storage.getChatMessages());
        
        // 加载目标
        const allGoals = storage.getGrowthGoals();
        setGrowthGoals(allGoals);
        setActiveGoals(allGoals.filter((g) => g.status === 'active'));

        // 加载父母园地数据
        setParentingNotes(storage.getParentingNotes());
        setReflectionRecords(storage.getReflectionRecords());
        setLearningRecords(storage.getLearningRecords());
        setImportantExperiences(storage.getImportantExperiences());
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const setActiveChild = (childId: string) => {
    storage.setActiveChild(childId);
    const child = childProfiles.find((c) => c.id === childId) || null;
    setActiveChildState(child);
    // 更新活跃目标
    setActiveGoals(storage.getActiveGoals(childId));
  };

  const updateChildProfile = (child: ChildProfile) => {
    storage.updateChildProfile(child);
    setChildProfiles((prev) =>
      prev.map((c) => (c.id === child.id ? child : c))
    );
    if (activeChild?.id === child.id) {
      setActiveChildState(child);
    }
  };

  const addChildProfile = (child: ChildProfile) => {
    storage.addChildProfile(child);
    setChildProfiles((prev) => [...prev, child]);
  };

  const deleteChildProfile = (childId: string) => {
    const settings = storage.getSettings();
    const updatedProfiles = settings.childProfiles.filter((c) => c.id !== childId);
    settings.childProfiles = updatedProfiles;
    if (settings.activeChildId === childId && updatedProfiles.length > 0) {
      settings.activeChildId = updatedProfiles[0].id;
      setActiveChildState(updatedProfiles[0]);
    }
    storage.saveSettings(settings);
    setChildProfiles(updatedProfiles);
    if (settings.activeChildId === childId) {
      setActiveChildState(null);
    }
  };

  const saveCheckIn = (record: CheckInRecord) => {
    storage.saveCheckInRecord(record);
    const today = new Date().toISOString().split('T')[0];
    if (record.date === today) {
      setTodayCheckIns((prev) => {
        const index = prev.findIndex(
          (r) => r.period === record.period
        );
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = record;
          return updated;
        }
        return [...prev, record];
      });
    }
  };

  const saveEmotion = (record: EmotionRecord) => {
    storage.saveEmotionRecord(record);
    setEmotionRecords((prev) => [...prev, record]);
    setRecentEmotions(storage.getRecentEmotions());
  };

  const saveMeeting = (meeting: FamilyMeeting) => {
    storage.saveFamilyMeeting(meeting);
    setFamilyMeetings((prev) => {
      const index = prev.findIndex((m) => m.id === meeting.id);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = meeting;
        return updated;
      }
      return [...prev, meeting];
    });
  };

  const deleteMeeting = (meetingId: string) => {
    setFamilyMeetings((prev) => prev.filter((m) => m.id !== meetingId));
  };

  const addChatMessage = (message: ChatMessage) => {
    storage.saveChatMessage(message);
    setChatMessages((prev) => {
      const updated = [...prev, message];
      return updated.slice(-50);
    });
  };

  const clearChat = () => {
    storage.clearChat();
    setChatMessages([]);
  };

  const toggleFavorite = (cardId: string) => {
    setPhraseCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, isFavorite: !card.isFavorite } : card
      )
    );
  };

  const addPhraseCard = (card: PhraseCard) => {
    setPhraseCards((prev) => [...prev, card]);
  };

  const deletePhraseCard = (cardId: string) => {
    setPhraseCards((prev) => prev.filter((card) => card.id !== cardId));
  };

  const saveGoal = (goal: GrowthGoal) => {
    storage.saveGrowthGoal(goal);
    setGrowthGoals((prev) => {
      const index = prev.findIndex((g) => g.id === goal.id);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = goal;
        return updated;
      }
      return [...prev, goal];
    });
    if (goal.status === 'active') {
      setActiveGoals((prev) => {
        const index = prev.findIndex((g) => g.id === goal.id);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = goal;
          return updated;
        }
        return [...prev, goal];
      });
    }
  };

  const deleteGoal = (goalId: string) => {
    storage.deleteGrowthGoal(goalId);
    setGrowthGoals((prev) => prev.filter((g) => g.id !== goalId));
    setActiveGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  const updateGoalNode = (goalId: string, nodeId: string, updates: Partial<GoalNode>) => {
    const goal = growthGoals.find((g) => g.id === goalId);
    if (!goal) return;

    const updatedNodes = goal.nodes.map((node) =>
      node.id === nodeId ? { ...node, ...updates } : node
    );

    // 计算新的进度
    const completedCount = updatedNodes.filter((n) => n.status === 'completed').length;
    const progress = updatedNodes.length > 0 
      ? Math.round((completedCount / updatedNodes.length) * 100) 
      : 0;

    const updatedGoal: GrowthGoal = {
      ...goal,
      nodes: updatedNodes,
      progress,
      status: progress === 100 ? 'completed' : goal.status,
      completedAt: progress === 100 ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };

    saveGoal(updatedGoal);
  };

  const updateGoalSubTask = (goalId: string, nodeId: string, subTaskId: string, updates: Partial<{completed: boolean; notes?: string}>) => {
    const goal = growthGoals.find((g) => g.id === goalId);
    if (!goal) return;

    const updatedNodes = goal.nodes.map((node) => {
      if (node.id !== nodeId) return node;
      const updatedSubTasks = node.subTasks?.map((st) =>
        st.id === subTaskId ? { ...st, ...updates, completedAt: updates.completed ? new Date().toISOString() : undefined } : st
      ) || [];

      // 计算节点进度
      const completedSubTasks = updatedSubTasks.filter((st) => st.completed).length;
      const nodeProgress = updatedSubTasks.length > 0
        ? Math.round((completedSubTasks / updatedSubTasks.length) * 100)
        : node.progress;
      const nodeStatus = nodeProgress === 100 ? 'completed' : nodeProgress > 0 ? 'in_progress' : node.status;

      return {
        ...node,
        subTasks: updatedSubTasks,
        progress: nodeProgress,
        status: nodeStatus,
        completedAt: nodeStatus === 'completed' ? new Date().toISOString() : undefined,
      };
    });

    // 计算目标进度
    const completedCount = updatedNodes.filter((n) => n.status === 'completed').length;
    const progress = updatedNodes.length > 0
      ? Math.round((completedCount / updatedNodes.length) * 100)
      : 0;

    const updatedGoal: GrowthGoal = {
      ...goal,
      nodes: updatedNodes,
      progress,
      status: progress === 100 ? 'completed' : goal.status,
      completedAt: progress === 100 ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };

    saveGoal(updatedGoal);
  };

  const addGoalSubTask = (goalId: string, nodeId: string, title: string) => {
    const goal = growthGoals.find((g) => g.id === goalId);
    if (!goal) return;

    const updatedNodes = goal.nodes.map((node) => {
      if (node.id !== nodeId) return node;
      const newSubTask = {
        id: `subtask-${Date.now()}`,
        title,
        completed: false,
      };
      return {
        ...node,
        subTasks: [...(node.subTasks || []), newSubTask],
        status: 'in_progress' as const,
      };
    });

    const updatedGoal: GrowthGoal = {
      ...goal,
      nodes: updatedNodes,
      updatedAt: new Date().toISOString(),
    };

    saveGoal(updatedGoal);
  };

  const deleteGoalSubTask = (goalId: string, nodeId: string, subTaskId: string) => {
    const goal = growthGoals.find((g) => g.id === goalId);
    if (!goal) return;

    const updatedNodes = goal.nodes.map((node) => {
      if (node.id !== nodeId) return node;
      const updatedSubTasks = node.subTasks?.filter((st) => st.id !== subTaskId) || [];

      const completedCount = updatedSubTasks.filter((st) => st.completed).length;
      const nodeProgress = updatedSubTasks.length > 0
        ? Math.round((completedCount / updatedSubTasks.length) * 100)
        : node.progress;
      const nodeStatus: 'completed' | 'pending' | 'in_progress' = nodeProgress === 100 ? 'completed' : nodeProgress > 0 ? 'in_progress' : 'pending';

      return {
        ...node,
        subTasks: updatedSubTasks,
        progress: nodeProgress,
        status: nodeStatus,
        completedAt: nodeStatus === 'completed' ? new Date().toISOString() : undefined,
      };
    });

    // 计算目标进度
    const completedCount = updatedNodes.filter((n) => n.status === 'completed').length;
    const progress = updatedNodes.length > 0
      ? Math.round((completedCount / updatedNodes.length) * 100)
      : 0;

    const updatedGoal: GrowthGoal = {
      ...goal,
      nodes: updatedNodes,
      progress,
      status: progress === 100 ? 'completed' : goal.status,
      completedAt: progress === 100 ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };

    saveGoal(updatedGoal);
  };

  const linkNodeToCheckIn = (goalId: string, nodeId: string, period: 'morning' | 'afternoon' | 'evening', taskTitle: string) => {
    const goal = growthGoals.find((g) => g.id === goalId);
    if (!goal) return;

    const updatedNodes = goal.nodes.map((node) => {
      if (node.id !== nodeId) return node;
      return {
        ...node,
        linkedCheckIn: true,
        checkInPeriod: period,
        checkInTaskId: `checkin-goal-${nodeId}`,
        reminderEnabled: true,
        reminderNote: taskTitle,
        status: 'in_progress' as const,
      };
    });

    // 同时添加到今日打卡
    const today = new Date().toISOString().split('T')[0];
    const checkInTask = {
      id: `checkin-goal-${nodeId}`,
      title: taskTitle,
      description: `目标: ${goal.title}`,
      completed: false,
    };

    const existingCheckIn = todayCheckIns.find((c) => c.period === period && c.date === today);
    if (existingCheckIn) {
      const hasTask = existingCheckIn.tasks.some((t) => t.id === checkInTask.id);
      if (!hasTask) {
        saveCheckIn({
          ...existingCheckIn,
          tasks: [...existingCheckIn.tasks, checkInTask],
        });
      }
    } else {
      saveCheckIn({
        id: `${today}-${period}`,
        date: today,
        period,
        tasks: [checkInTask],
      });
    }

    const updatedGoal: GrowthGoal = {
      ...goal,
      nodes: updatedNodes,
      updatedAt: new Date().toISOString(),
    };

    saveGoal(updatedGoal);
  };

  const unlinkNodeFromCheckIn = (goalId: string, nodeId: string) => {
    const goal = growthGoals.find((g) => g.id === goalId);
    if (!goal) return;

    const updatedNodes = goal.nodes.map((node) => {
      if (node.id !== nodeId) return node;
      return {
        ...node,
        linkedCheckIn: false,
        checkInPeriod: undefined,
        checkInTaskId: undefined,
        reminderEnabled: false,
        reminderNote: undefined,
      };
    });

    const updatedGoal: GrowthGoal = {
      ...goal,
      nodes: updatedNodes,
      updatedAt: new Date().toISOString(),
    };

    saveGoal(updatedGoal);
  };

  // ============================================
  // 父母园地 - 陪伴笔记
  // ============================================

  const saveParentingNote = (note: ParentingNote) => {
    const updatedNote = {
      ...note,
      updatedAt: new Date().toISOString(),
    };
    storage.saveParentingNote(updatedNote);
    setParentingNotes((prev) => {
      const index = prev.findIndex((n) => n.id === note.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = updatedNote;
        return updated;
      }
      return [...prev, updatedNote];
    });
  };

  const deleteParentingNote = (noteId: string) => {
    storage.deleteParentingNote(noteId);
    setParentingNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  const toggleNotePin = (noteId: string) => {
    const note = parentingNotes.find((n) => n.id === noteId);
    if (note) {
      saveParentingNote({ ...note, isPinned: !note.isPinned });
    }
  };

  // ============================================
  // 父母园地 - 复盘记录
  // ============================================

  const saveReflectionRecord = (record: ReflectionRecord) => {
    const updatedRecord = {
      ...record,
      updatedAt: new Date().toISOString(),
    };
    storage.saveReflectionRecord(updatedRecord);
    setReflectionRecords((prev) => {
      const index = prev.findIndex((r) => r.id === record.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = updatedRecord;
        return updated;
      }
      return [...prev, updatedRecord];
    });
  };

  const deleteReflectionRecord = (recordId: string) => {
    storage.deleteReflectionRecord(recordId);
    setReflectionRecords((prev) => prev.filter((r) => r.id !== recordId));
  };

  // ============================================
  // 父母园地 - 学习成长记录
  // ============================================

  const saveLearningRecord = (record: LearningRecord) => {
    const updatedRecord = {
      ...record,
      updatedAt: new Date().toISOString(),
    };
    storage.saveLearningRecord(updatedRecord);
    setLearningRecords((prev) => {
      const index = prev.findIndex((r) => r.id === record.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = updatedRecord;
        return updated;
      }
      return [...prev, updatedRecord];
    });
  };

  const deleteLearningRecord = (recordId: string) => {
    storage.deleteLearningRecord(recordId);
    setLearningRecords((prev) => prev.filter((r) => r.id !== recordId));
  };

  // ============================================
  // 父母园地 - 重要经验
  // ============================================

  const saveImportantExperience = (experience: ImportantExperience) => {
    const updatedExperience = {
      ...experience,
      updatedAt: new Date().toISOString(),
    };
    storage.saveImportantExperience(updatedExperience);
    setImportantExperiences((prev) => {
      const index = prev.findIndex((e) => e.id === experience.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = updatedExperience;
        return updated;
      }
      return [...prev, updatedExperience];
    });
  };

  const deleteImportantExperience = (id: string) => {
    storage.deleteImportantExperience(id);
    setImportantExperiences((prev) => prev.filter((e) => e.id !== id));
  };

  const toggleExperienceStar = (id: string) => {
    const experience = importantExperiences.find((e) => e.id === id);
    if (experience) {
      saveImportantExperience({ ...experience, isStarred: !experience.isStarred });
    }
  };

  const value: AppState = {
    activeChild,
    childProfiles,
    setActiveChild,
    updateChildProfile,
    addChildProfile,
    deleteChildProfile,
    todayCheckIns,
    taskTemplates,
    saveCheckIn,
    emotionRecords,
    recentEmotions,
    saveEmotion,
    familyMeetings,
    saveMeeting,
    deleteMeeting,
    chatMessages,
    addChatMessage,
    clearChat,
    phraseCards,
    toggleFavorite,
    addPhraseCard,
    deletePhraseCard,
    growthGoals,
    activeGoals,
    saveGoal,
    deleteGoal,
    updateGoalNode,
    updateGoalSubTask,
    addGoalSubTask,
    deleteGoalSubTask,
    linkNodeToCheckIn,
    unlinkNodeFromCheckIn,
    // 父母园地
    parentingNotes,
    saveParentingNote,
    deleteParentingNote,
    toggleNotePin,
    reflectionRecords,
    saveReflectionRecord,
    deleteReflectionRecord,
    learningRecords,
    saveLearningRecord,
    deleteLearningRecord,
    importantExperiences,
    saveImportantExperience,
    deleteImportantExperience,
    toggleExperienceStar,
    isLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
