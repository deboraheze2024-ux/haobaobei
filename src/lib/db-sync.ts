/**
 * 数据同步模块
 * 将 localStorage 数据同步到 Supabase 数据库
 */
import * as dbOps from '@/storage/database/db-operations';
import {
  ChildProfile,
  CheckInRecord,
  EmotionRecord,
  FamilyMeeting,
  ChatMessage,
  GrowthGoal,
  ParentingNote,
  ReflectionRecord,
  LearningRecord,
  ImportantExperience,
  TaskTemplate,
  PhraseCard,
} from '@/lib/types';
import { storage } from '@/lib/storage';
import { defaultTaskTemplates, defaultPhraseCards, defaultChildProfile } from '@/lib/knowledge-base';

// 检查数据库是否可用
let isDatabaseAvailable = false;

export async function checkDatabaseAvailability(): Promise<boolean> {
  try {
    await dbOps.getChildProfiles();
    isDatabaseAvailable = true;
    return true;
  } catch (error) {
    console.warn('Database not available, falling back to localStorage:', error);
    isDatabaseAvailable = false;
    return false;
  }
}

export function isDbAvailable(): boolean {
  return isDatabaseAvailable;
}

// ============================================
// 数据类型转换工具
// ============================================

// 数据库记录转应用类型
function dbToChildProfile(dbRecord: any): ChildProfile {
  return {
    id: dbRecord.id,
    name: dbRecord.name,
    birthDate: dbRecord.birth_date,
    gender: dbRecord.gender,
    avatar: dbRecord.avatar,
    nickname: dbRecord.nickname,
    personality: dbRecord.personality,
    strengths: dbRecord.strengths,
    challenges: dbRecord.challenges,
    interests: dbRecord.interests,
    currentStage: dbRecord.current_stage,
    keyBehaviors: dbRecord.key_behaviors,
    notes: dbRecord.notes,
    createdAt: dbRecord.created_at,
    updatedAt: dbRecord.updated_at,
  };
}

function dbToCheckInRecord(dbRecord: any): CheckInRecord {
  return {
    id: dbRecord.id,
    date: dbRecord.date,
    period: dbRecord.period,
    tasks: dbRecord.tasks,
    completedAt: dbRecord.completed_at,
    notes: dbRecord.notes,
  };
}

function dbToEmotionRecord(dbRecord: any): EmotionRecord {
  return {
    id: dbRecord.id,
    childId: dbRecord.child_id,
    date: dbRecord.date,
    time: dbRecord.time,
    emotion: dbRecord.emotion,
    intensity: dbRecord.intensity,
    trigger: dbRecord.trigger,
    behavior: dbRecord.behavior,
    parentResponse: dbRecord.parent_response,
    result: dbRecord.result,
    notes: dbRecord.notes,
  };
}

function dbToFamilyMeeting(dbRecord: any): FamilyMeeting {
  return {
    id: dbRecord.id,
    date: dbRecord.date,
    status: dbRecord.status,
    attendees: dbRecord.attendees,
    agenda: dbRecord.agenda,
    gratitudeList: dbRecord.gratitude_list,
    brainstorms: dbRecord.brainstorms,
    decisions: dbRecord.decisions,
    funPlan: dbRecord.fun_plan,
    notes: dbRecord.notes,
    createdAt: dbRecord.created_at,
  };
}

function dbToChatMessage(dbRecord: any): ChatMessage {
  return {
    id: dbRecord.id,
    role: dbRecord.role,
    content: dbRecord.content,
    timestamp: dbRecord.created_at,
    references: dbRecord.references,
  };
}

function dbToGrowthGoal(dbRecord: any): GrowthGoal {
  return {
    id: dbRecord.id,
    childId: dbRecord.child_id,
    title: dbRecord.title,
    description: dbRecord.description,
    category: dbRecord.category,
    status: dbRecord.status,
    priority: dbRecord.priority,
    progress: dbRecord.progress,
    nodes: dbRecord.nodes,
    startDate: dbRecord.start_date,
    targetEndDate: dbRecord.target_end_date,
    actualEndDate: dbRecord.actual_end_date,
    totalDuration: dbRecord.total_duration,
    createdAt: dbRecord.created_at,
    updatedAt: dbRecord.updated_at,
    completedAt: dbRecord.completed_at,
  };
}

function dbToParentingNote(dbRecord: any): ParentingNote {
  return {
    id: dbRecord.id,
    childId: dbRecord.child_id,
    title: dbRecord.title,
    content: dbRecord.content,
    tags: dbRecord.tags,
    isPinned: dbRecord.is_pinned,
    createdAt: dbRecord.created_at,
    updatedAt: dbRecord.updated_at,
  };
}

function dbToReflectionRecord(dbRecord: any): ReflectionRecord {
  return {
    id: dbRecord.id,
    childId: dbRecord.child_id,
    title: dbRecord.title,
    date: dbRecord.date,
    situation: dbRecord.situation,
    thoughts: dbRecord.thoughts,
    feelings: dbRecord.feelings,
    actions: dbRecord.actions,
    result: dbRecord.result,
    analysis: dbRecord.analysis,
    learnings: dbRecord.learnings,
    images: dbRecord.images,
    tags: dbRecord.tags,
    createdAt: dbRecord.created_at,
    updatedAt: dbRecord.updated_at,
  };
}

function dbToLearningRecord(dbRecord: any): LearningRecord {
  return {
    id: dbRecord.id,
    childId: dbRecord.child_id,
    title: dbRecord.title,
    source: dbRecord.source,
    sourceName: dbRecord.source_name,
    date: dbRecord.date,
    summary: dbRecord.summary,
    insights: dbRecord.insights,
    application: dbRecord.application,
    actionPlan: dbRecord.action_plan,
    images: dbRecord.images,
    tags: dbRecord.tags,
    createdAt: dbRecord.created_at,
    updatedAt: dbRecord.updated_at,
  };
}

function dbToImportantExperience(dbRecord: any): ImportantExperience {
  return {
    id: dbRecord.id,
    childId: dbRecord.child_id,
    title: dbRecord.title,
    content: dbRecord.content,
    category: dbRecord.category,
    isStarred: dbRecord.is_starred,
    highlight: dbRecord.highlight,
    relatedNotes: dbRecord.related_notes,
    relatedReflections: dbRecord.related_reflections,
    images: dbRecord.images,
    tags: dbRecord.tags,
    createdAt: dbRecord.created_at,
    updatedAt: dbRecord.updated_at,
  };
}

// 应用类型转数据库记录
function profileToDb(profile: ChildProfile) {
  return {
    id: profile.id,
    name: profile.name,
    birthDate: profile.birthDate,
    gender: profile.gender,
    avatar: profile.avatar,
    nickname: profile.nickname,
    personality: profile.personality,
    strengths: profile.strengths,
    challenges: profile.challenges,
    interests: profile.interests,
    currentStage: profile.currentStage,
    keyBehaviors: profile.keyBehaviors,
    notes: profile.notes,
  };
}

// ============================================
// 数据加载 - 从数据库或 localStorage
// ============================================

export async function loadAllData() {
  const available = await checkDatabaseAvailability();
  
  if (available) {
    try {
      // 从数据库加载数据
      const [
        dbChildProfiles,
        dbTodayCheckIns,
        dbEmotionRecords,
        dbFamilyMeetings,
        dbChatMessages,
        dbGrowthGoals,
        dbParentingNotes,
        dbReflectionRecords,
        dbLearningRecords,
        dbImportantExperiences,
        dbPhraseCards,
      ] = await Promise.all([
        dbOps.getChildProfiles(),
        dbOps.getTodayCheckIn(),
        dbOps.getEmotionRecords(),
        dbOps.getFamilyMeetings(),
        dbOps.getChatMessages(),
        dbOps.getGrowthGoals(),
        dbOps.getParentingNotes(),
        dbOps.getReflectionRecords(),
        dbOps.getLearningRecords(),
        dbOps.getImportantExperiences(),
        dbOps.getPhraseCards(),
      ]);

      // 转换数据格式
      return {
        childProfiles: dbChildProfiles.map(dbToChildProfile),
        todayCheckIns: dbTodayCheckIns.map(dbToCheckInRecord),
        emotionRecords: dbEmotionRecords.map(dbToEmotionRecord),
        recentEmotions: dbEmotionRecords
          .filter((r) => {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - 7);
            return new Date(r.date) >= cutoff;
          })
          .map(dbToEmotionRecord),
        familyMeetings: dbFamilyMeetings.map(dbToFamilyMeeting),
        chatMessages: dbChatMessages.map(dbToChatMessage),
        growthGoals: dbGrowthGoals.map(dbToGrowthGoal),
        parentingNotes: dbParentingNotes.map(dbToParentingNote),
        reflectionRecords: dbReflectionRecords.map(dbToReflectionRecord),
        learningRecords: dbLearningRecords.map(dbToLearningRecord),
        importantExperiences: dbImportantExperiences.map(dbToImportantExperience),
        phraseCards: dbPhraseCards.length > 0 
          ? dbPhraseCards.map((c: any) => ({
              id: c.id,
              category: c.category,
              title: c.title,
              content: c.content,
              situation: c.situation,
              sourceChapter: c.source_chapter,
              isFavorite: c.is_favorite,
              tags: c.tags,
            }))
          : defaultPhraseCards,
      };
    } catch (error) {
      console.error('Failed to load from database, falling back to localStorage:', error);
      return loadFromLocalStorage();
    }
  }
  
  return loadFromLocalStorage();
}

function loadFromLocalStorage() {
  const settings = storage.getSettings();
  
  return {
    childProfiles: settings.childProfiles,
    todayCheckIns: storage.getTodayCheckIn(),
    emotionRecords: storage.getEmotionRecords(),
    recentEmotions: storage.getRecentEmotions(),
    familyMeetings: storage.getFamilyMeetings(),
    chatMessages: storage.getChatMessages(),
    growthGoals: storage.getGrowthGoals(),
    parentingNotes: storage.getParentingNotes(),
    reflectionRecords: storage.getReflectionRecords(),
    learningRecords: storage.getLearningRecords(),
    importantExperiences: storage.getImportantExperiences(),
    phraseCards: settings.phraseCards.length > 0 ? settings.phraseCards : defaultPhraseCards,
  };
}

// ============================================
// 数据保存 - 同时保存到数据库和 localStorage
// ============================================

export async function saveChildProfile(profile: ChildProfile) {
  // 保存到 localStorage
  storage.updateChildProfile(profile);
  
  if (isDatabaseAvailable) {
    try {
      await dbOps.updateChildProfile(profile.id, profileToDb(profile));
    } catch (error) {
      console.error('Failed to sync to database:', error);
    }
  }
}

export async function addChildProfile(profile: ChildProfile) {
  // 保存到 localStorage
  storage.addChildProfile(profile);
  
  if (isDatabaseAvailable) {
    try {
      await dbOps.createChildProfile(profileToDb(profile));
    } catch (error) {
      console.error('Failed to sync to database:', error);
    }
  }
}

export async function removeChildProfile(childId: string) {
  // 从 localStorage 删除
  const settings = storage.getSettings();
  settings.childProfiles = settings.childProfiles.filter((c) => c.id !== childId);
  storage.saveSettings(settings);
  
  if (isDatabaseAvailable) {
    try {
      await dbOps.deleteChildProfile(childId);
    } catch (error) {
      console.error('Failed to sync to database:', error);
    }
  }
}

export async function saveCheckIn(record: CheckInRecord) {
  // 保存到 localStorage
  storage.saveCheckInRecord(record);
  
  if (isDatabaseAvailable) {
    try {
      await dbOps.saveCheckInRecord({
        date: record.date,
        period: record.period,
        tasks: record.tasks,
        completedAt: record.completedAt,
        notes: record.notes,
      });
    } catch (error) {
      console.error('Failed to sync to database:', error);
    }
  }
}

export async function saveEmotionRecord(record: EmotionRecord) {
  // 保存到 localStorage
  storage.saveEmotionRecord(record);
  
  if (isDatabaseAvailable) {
    try {
      await dbOps.createEmotionRecord({
        childId: record.childId,
        date: record.date,
        time: record.time,
        emotion: record.emotion,
        intensity: record.intensity,
        trigger: record.trigger,
        behavior: record.behavior,
        parentResponse: record.parentResponse,
        result: record.result,
        notes: record.notes,
      });
    } catch (error) {
      console.error('Failed to sync to database:', error);
    }
  }
}

export async function saveMeeting(meeting: FamilyMeeting) {
  // 保存到 localStorage
  storage.saveFamilyMeeting(meeting);
  
  if (isDatabaseAvailable) {
    try {
      await dbOps.saveFamilyMeeting({
        id: meeting.id,
        date: meeting.date,
        status: meeting.status,
        attendees: meeting.attendees,
        agenda: meeting.agenda,
        gratitudeList: meeting.gratitudeList,
        brainstorms: meeting.brainstorms,
        decisions: meeting.decisions,
        funPlan: meeting.funPlan,
        notes: meeting.notes,
      });
    } catch (error) {
      console.error('Failed to sync to database:', error);
    }
  }
}

export async function removeMeeting(meetingId: string) {
  // 从 localStorage 删除
  const meetings = storage.getFamilyMeetings().filter((m) => m.id !== meetingId);
  localStorage.setItem('positive-parenting-app_meetings', JSON.stringify(meetings));
  
  if (isDatabaseAvailable) {
    try {
      await dbOps.deleteFamilyMeeting(meetingId);
    } catch (error) {
      console.error('Failed to sync to database:', error);
    }
  }
}

export async function saveChatMessage(message: ChatMessage) {
  // 保存到 localStorage
  storage.saveChatMessage(message);
  
  if (isDatabaseAvailable) {
    try {
      await dbOps.saveChatMessage({
        role: message.role,
        content: message.content,
        references: message.references,
      });
    } catch (error) {
      console.error('Failed to sync to database:', error);
    }
  }
}

export async function clearChat() {
  // 清空 localStorage
  storage.clearChat();
  
  if (isDatabaseAvailable) {
    try {
      // 获取所有消息并删除
      const messages = await dbOps.getChatMessages();
      for (const msg of messages) {
        await dbOps.clearChatMessages();
        break; // 只执行一次删除
      }
    } catch (error) {
      console.error('Failed to sync to database:', error);
    }
  }
}

export async function saveGrowthGoal(goal: GrowthGoal) {
  // 保存到 localStorage
  storage.saveGrowthGoal(goal);
  
  if (isDatabaseAvailable) {
    try {
      await dbOps.saveGrowthGoal({
        id: goal.id,
        childId: goal.childId,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        status: goal.status,
        priority: goal.priority,
        progress: goal.progress,
        nodes: goal.nodes,
        startDate: goal.startDate,
        targetEndDate: goal.targetEndDate,
        actualEndDate: goal.actualEndDate,
        totalDuration: goal.totalDuration,
        completedAt: goal.completedAt,
      });
    } catch (error) {
      console.error('Failed to sync to database:', error);
    }
  }
}

export async function removeGrowthGoal(goalId: string) {
  // 从 localStorage 删除
  storage.deleteGrowthGoal(goalId);
  
  if (isDatabaseAvailable) {
    try {
      await dbOps.deleteGrowthGoal(goalId);
    } catch (error) {
      console.error('Failed to sync to database:', error);
    }
  }
}

export async function saveParentingNote(note: ParentingNote) {
  // 保存到 localStorage
  storage.saveParentingNote(note);
  
  if (isDatabaseAvailable) {
    try {
      await dbOps.saveParentingNote({
        id: note.id,
        childId: note.childId,
        title: note.title,
        content: note.content,
        tags: note.tags,
        isPinned: note.isPinned,
      });
    } catch (error) {
      console.error('Failed to sync to database:', error);
    }
  }
}

export async function removeParentingNote(noteId: string) {
  // 从 localStorage 删除
  storage.deleteParentingNote(noteId);
  
  if (isDatabaseAvailable) {
    try {
      await dbOps.deleteParentingNote(noteId);
    } catch (error) {
      console.error('Failed to sync to database:', error);
    }
  }
}

export async function saveReflectionRecord(record: ReflectionRecord) {
  // 保存到 localStorage
  storage.saveReflectionRecord(record);
  
  if (isDatabaseAvailable) {
    try {
      await dbOps.saveReflectionRecord({
        id: record.id,
        childId: record.childId,
        title: record.title,
        date: record.date,
        situation: record.situation,
        thoughts: record.thoughts,
        feelings: record.feelings,
        actions: record.actions,
        result: record.result,
        analysis: record.analysis,
        learnings: record.learnings,
        images: record.images,
        tags: record.tags,
      });
    } catch (error) {
      console.error('Failed to sync to database:', error);
    }
  }
}

export async function removeReflectionRecord(recordId: string) {
  // 从 localStorage 删除
  storage.deleteReflectionRecord(recordId);
  
  if (isDatabaseAvailable) {
    try {
      await dbOps.deleteReflectionRecord(recordId);
    } catch (error) {
      console.error('Failed to sync to database:', error);
    }
  }
}

export async function saveLearningRecord(record: LearningRecord) {
  // 保存到 localStorage
  storage.saveLearningRecord(record);
  
  if (isDatabaseAvailable) {
    try {
      await dbOps.saveLearningRecord({
        id: record.id,
        childId: record.childId,
        title: record.title,
        source: record.source,
        sourceName: record.sourceName,
        date: record.date,
        summary: record.summary,
        insights: record.insights,
        application: record.application,
        actionPlan: record.actionPlan,
        images: record.images,
        tags: record.tags,
      });
    } catch (error) {
      console.error('Failed to sync to database:', error);
    }
  }
}

export async function removeLearningRecord(recordId: string) {
  // 从 localStorage 删除
  storage.deleteLearningRecord(recordId);
  
  if (isDatabaseAvailable) {
    try {
      await dbOps.deleteLearningRecord(recordId);
    } catch (error) {
      console.error('Failed to sync to database:', error);
    }
  }
}

export async function saveImportantExperience(experience: ImportantExperience) {
  // 保存到 localStorage
  storage.saveImportantExperience(experience);
  
  if (isDatabaseAvailable) {
    try {
      await dbOps.saveImportantExperience({
        id: experience.id,
        childId: experience.childId,
        title: experience.title,
        content: experience.content,
        category: experience.category,
        isStarred: experience.isStarred,
        highlight: experience.highlight,
        relatedNotes: experience.relatedNotes,
        relatedReflections: experience.relatedReflections,
        images: experience.images,
        tags: experience.tags,
      });
    } catch (error) {
      console.error('Failed to sync to database:', error);
    }
  }
}

export async function removeImportantExperience(id: string) {
  // 从 localStorage 删除
  storage.deleteImportantExperience(id);
  
  if (isDatabaseAvailable) {
    try {
      await dbOps.deleteImportantExperience(id);
    } catch (error) {
      console.error('Failed to sync to database:', error);
    }
  }
}
