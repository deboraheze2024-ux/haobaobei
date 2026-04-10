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

  // 聊天
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;

  // 话术
  phraseCards: PhraseCard[];
  toggleFavorite: (cardId: string) => void;

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

  const value: AppState = {
    activeChild,
    childProfiles,
    setActiveChild,
    updateChildProfile,
    todayCheckIns,
    taskTemplates,
    saveCheckIn,
    emotionRecords,
    recentEmotions,
    saveEmotion,
    familyMeetings,
    saveMeeting,
    chatMessages,
    addChatMessage,
    clearChat,
    phraseCards,
    toggleFavorite,
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
