'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import MainNav from '@/components/main-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import {
  BookHeart,
  StickyNote,
  RefreshCw,
  GraduationCap,
  Star,
  Plus,
  Search,
  Pin,
  PinOff,
  Trash2,
  Edit3,
  Calendar,
  Quote,
  Lightbulb,
  Trophy,
  AlertTriangle,
  Zap,
  ThumbsUp,
  FileText,
} from 'lucide-react';
import { ParentingNote, ReflectionRecord, LearningRecord, ImportantExperience, ExperienceCategory } from '@/lib/types';

// 经验类别配置
const experienceCategoryConfig: Record<ExperienceCategory, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string }> = {
  success: { label: '成功经验', icon: Trophy, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  challenge: { label: '挑战应对', icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  breakthrough: { label: '突破时刻', icon: Zap, color: 'text-violet-600', bgColor: 'bg-violet-50' },
  lesson: { label: '深刻教训', icon: Lightbulb, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  tip: { label: '实用技巧', icon: ThumbsUp, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
};

// 学习来源配置
const learningSourceConfig = {
  book: { label: '书籍', icon: BookHeart },
  course: { label: '课程', icon: GraduationCap },
  article: { label: '文章', icon: FileText },
  experience: { label: '实践经验', icon: RefreshCw },
  other: { label: '其他', icon: Lightbulb },
};

export default function ParentingPage() {
  const {
    activeChild,
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
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>('notes');
  const [searchQuery, setSearchQuery] = useState('');

  // 笔记相关状态
  const [noteDialog, setNoteDialog] = useState<ParentingNote | null>(null);
  const [noteForm, setNoteForm] = useState({ title: '', content: '', tags: '' });

  // 复盘相关状态
  const [reflectionDialog, setReflectionDialog] = useState<ReflectionRecord | null>(null);
  const [reflectionForm, setReflectionForm] = useState({
    title: '', date: format(new Date(), 'yyyy-MM-dd'),
    situation: '', thoughts: '', feelings: '', actions: '', result: '',
    analysis: '', learnings: '', images: '', tags: '',
  });

  // 学习记录相关状态
  const [learningDialog, setLearningDialog] = useState<LearningRecord | null>(null);
  const [learningForm, setLearningForm] = useState({
    title: '', source: 'book' as const, sourceName: '', date: format(new Date(), 'yyyy-MM-dd'),
    summary: '', insights: '', application: '', actionPlan: '', images: '', tags: '',
  });

  // 重要经验相关状态
  const [experienceDialog, setExperienceDialog] = useState<ImportantExperience | null>(null);
  const [experienceForm, setExperienceForm] = useState({
    title: '', content: '', category: 'tip' as ExperienceCategory,
    highlight: '', tags: '',
  });

  // 过滤数据
  const filteredNotes = parentingNotes.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  const filteredReflections = reflectionRecords
    .filter((r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const filteredLearnings = learningRecords
    .filter((r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const filteredExperiences = importantExperiences
    .filter((e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (a.isStarred && !b.isStarred) return -1;
      if (!a.isStarred && b.isStarred) return 1;
      return b.createdAt.localeCompare(a.createdAt);
    });

  // 保存笔记
  const handleSaveNote = () => {
    const note: ParentingNote = {
      id: noteDialog?.id || `note-${Date.now()}`,
      childId: activeChild?.id,
      title: noteForm.title,
      content: noteForm.content,
      tags: noteForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      isPinned: noteDialog?.isPinned || false,
      createdAt: noteDialog?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveParentingNote(note);
    setNoteDialog(null);
    setNoteForm({ title: '', content: '', tags: '' });
  };

  // 保存复盘
  const handleSaveReflection = () => {
    const record: ReflectionRecord = {
      id: reflectionDialog?.id || `reflection-${Date.now()}`,
      childId: activeChild?.id,
      title: reflectionForm.title,
      date: reflectionForm.date,
      situation: reflectionForm.situation,
      thoughts: reflectionForm.thoughts,
      feelings: reflectionForm.feelings,
      actions: reflectionForm.actions,
      result: reflectionForm.result,
      analysis: reflectionForm.analysis,
      learnings: reflectionForm.learnings,
      images: reflectionForm.images.split(',').map((u) => u.trim()).filter(Boolean),
      tags: reflectionForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      createdAt: reflectionDialog?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveReflectionRecord(record);
    setReflectionDialog(null);
    setReflectionForm({ title: '', date: format(new Date(), 'yyyy-MM-dd'), situation: '', thoughts: '', feelings: '', actions: '', result: '', analysis: '', learnings: '', images: '', tags: '' });
  };

  // 保存学习记录
  const handleSaveLearning = () => {
    const record: LearningRecord = {
      id: learningDialog?.id || `learning-${Date.now()}`,
      childId: activeChild?.id,
      title: learningForm.title,
      source: learningForm.source,
      sourceName: learningForm.sourceName,
      date: learningForm.date,
      summary: learningForm.summary,
      insights: learningForm.insights,
      application: learningForm.application,
      actionPlan: learningForm.actionPlan,
      images: learningForm.images.split(',').map((u) => u.trim()).filter(Boolean),
      tags: learningForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      createdAt: learningDialog?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveLearningRecord(record);
    setLearningDialog(null);
    setLearningForm({ title: '', source: 'book', sourceName: '', date: format(new Date(), 'yyyy-MM-dd'), summary: '', insights: '', application: '', actionPlan: '', images: '', tags: '' });
  };

  // 保存重要经验
  const handleSaveExperience = () => {
    const experience: ImportantExperience = {
      id: experienceDialog?.id || `experience-${Date.now()}`,
      childId: activeChild?.id,
      title: experienceForm.title,
      content: experienceForm.content,
      category: experienceForm.category,
      isStarred: experienceDialog?.isStarred || false,
      highlight: experienceForm.highlight,
      tags: experienceForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      createdAt: experienceDialog?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveImportantExperience(experience);
    setExperienceDialog(null);
    setExperienceForm({ title: '', content: '', category: 'tip', highlight: '', tags: '' });
  };

  // 打开编辑对话框
  const openNoteDialog = (note?: ParentingNote) => {
    setNoteForm({
      title: note?.title || '',
      content: note?.content || '',
      tags: note?.tags.join(', ') || '',
    });
    setNoteDialog(note || null);
  };

  const openReflectionDialog = (record?: ReflectionRecord) => {
    setReflectionForm({
      title: record?.title || '',
      date: record?.date || format(new Date(), 'yyyy-MM-dd'),
      situation: record?.situation || '',
      thoughts: record?.thoughts || '',
      feelings: record?.feelings || '',
      actions: record?.actions || '',
      result: record?.result || '',
      analysis: record?.analysis || '',
      learnings: record?.learnings || '',
      images: record?.images.join(', ') || '',
      tags: record?.tags.join(', ') || '',
    });
    setReflectionDialog(record || null);
  };

  const openLearningDialog = (record?: LearningRecord) => {
    setLearningForm({
      title: record?.title || '',
      source: record?.source || 'book',
      sourceName: record?.sourceName || '',
      date: record?.date || format(new Date(), 'yyyy-MM-dd'),
      summary: record?.summary || '',
      insights: record?.insights || '',
      application: record?.application || '',
      actionPlan: record?.actionPlan || '',
      images: record?.images.join(', ') || '',
      tags: record?.tags.join(', ') || '',
    });
    setLearningDialog(record || null);
  };

  const openExperienceDialog = (exp?: ImportantExperience) => {
    setExperienceForm({
      title: exp?.title || '',
      content: exp?.content || '',
      category: exp?.category || 'tip',
      highlight: exp?.highlight || '',
      tags: exp?.tags.join(', ') || '',
    });
    setExperienceDialog(exp || null);
  };

  return (
    <div className="min-h-screen">
      <MainNav />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-200">
              <BookHeart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">父母园地</h1>
              <p className="text-sm text-gray-500">
                记录陪伴成长，分享育儿心得
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6 border-0 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索笔记、复盘、学习记录..."
                className="pl-10 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-800">{parentingNotes.length}</div>
              <div className="text-xs text-gray-500">陪伴笔记</div>
            </CardContent>
          </Card>
          <Card className="border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-800">{reflectionRecords.length}</div>
              <div className="text-xs text-gray-500">复盘记录</div>
            </CardContent>
          </Card>
          <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-800">{learningRecords.length}</div>
              <div className="text-xs text-gray-500">学习记录</div>
            </CardContent>
          </Card>
          <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-800">{importantExperiences.filter(e => e.isStarred).length}</div>
              <div className="text-xs text-gray-500">标星经验</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full flex-wrap h-auto gap-2 bg-transparent p-0 mb-6">
            <TabsTrigger
              value="notes"
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg',
                'bg-white border border-gray-200 text-gray-600 data-[state=active]:border-transparent'
              )}
            >
              <StickyNote className="w-4 h-4" />
              陪伴笔记
            </TabsTrigger>
            <TabsTrigger
              value="reflection"
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg',
                'bg-white border border-gray-200 text-gray-600 data-[state=active]:border-transparent'
              )}
            >
              <RefreshCw className="w-4 h-4" />
              复盘记录
            </TabsTrigger>
            <TabsTrigger
              value="learning"
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg',
                'bg-white border border-gray-200 text-gray-600 data-[state=active]:border-transparent'
              )}
            >
              <GraduationCap className="w-4 h-4" />
              学习成长
            </TabsTrigger>
            <TabsTrigger
              value="experiences"
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg',
                'bg-white border border-gray-200 text-gray-600 data-[state=active]:border-transparent'
              )}
            >
              <Star className="w-4 h-4" />
              重要经验
            </TabsTrigger>
          </TabsList>

          {/* 陪伴笔记 */}
          <TabsContent value="notes">
            <div className="flex justify-end mb-4">
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600" onClick={() => { setNoteDialog({ id: '', childId: undefined, title: '', content: '', tags: [], isPinned: false, createdAt: '', updatedAt: '' }); }}>
                <Plus className="w-4 h-4 mr-1" />
                写笔记
              </Button>
              <Dialog open={!!noteDialog} onOpenChange={(open) => { if (!open) setNoteDialog(null); }}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{noteDialog?.id ? '编辑笔记' : '写新笔记'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>标题</Label>
                      <Input value={noteForm.title} onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })} placeholder="给笔记起个标题" />
                    </div>
                    <div>
                      <Label>内容</Label>
                      <Textarea value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} placeholder="记录你的育儿心得..." className="min-h-[150px]" />
                    </div>
                    <div>
                      <Label>标签（用逗号分隔）</Label>
                      <Input value={noteForm.tags} onChange={(e) => setNoteForm({ ...noteForm, tags: e.target.value })} placeholder="如：情绪管理, 沟通技巧" />
                    </div>
                    <Button onClick={handleSaveNote} disabled={!noteForm.title} className="w-full bg-gradient-to-r from-pink-500 to-rose-500">
                      保存笔记
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {sortedNotes.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="p-12 text-center">
                  <StickyNote className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">还没有笔记</h3>
                  <p className="text-gray-400">点击右上角写下第一篇陪伴笔记</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {sortedNotes.map((note) => (
                  <Card key={note.id} className={cn('border transition-all hover:shadow-md', note.isPinned && 'border-pink-200 bg-pink-50/30')}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {note.isPinned && <Pin className="w-4 h-4 text-pink-500" />}
                          <h3 className="font-semibold text-gray-800">{note.title}</h3>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => toggleNotePin(note.id)} className="p-1 rounded hover:bg-gray-100">
                            {note.isPinned ? <PinOff className="w-4 h-4 text-gray-400" /> : <Pin className="w-4 h-4 text-gray-400" />}
                          </button>
                          <button onClick={() => { deleteParentingNote(note.id); }} className="p-1 rounded hover:bg-gray-100">
                            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">{note.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {note.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">{format(parseISO(note.createdAt), 'MM/dd')}</span>
                      </div>
                      <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => openNoteDialog(note)}>
                        <Edit3 className="w-3 h-3 mr-1" />
                        编辑
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* 复盘记录 */}
          <TabsContent value="reflection">
            <div className="flex justify-end mb-4">
              <Button className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600" onClick={() => openReflectionDialog()}>
                <Plus className="w-4 h-4 mr-1" />
                新增复盘
              </Button>
              <Dialog open={!!reflectionDialog} onOpenChange={(open) => { if (!open) setReflectionDialog(null); }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>复盘记录</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>标题</Label>
                        <Input value={reflectionForm.title} onChange={(e) => setReflectionForm({ ...reflectionForm, title: e.target.value })} placeholder="复盘主题" />
                      </div>
                      <div>
                        <Label>日期</Label>
                        <Input type="date" value={reflectionForm.date} onChange={(e) => setReflectionForm({ ...reflectionForm, date: e.target.value })} />
                      </div>
                    </div>

                    <div className="p-4 bg-violet-50 rounded-xl space-y-3">
                      <h4 className="font-medium text-violet-700">发生了什么</h4>
                      <Textarea value={reflectionForm.situation} onChange={(e) => setReflectionForm({ ...reflectionForm, situation: e.target.value })} placeholder="描述当时的情况..." className="min-h-[60px]" />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">当时的想法</Label>
                          <Textarea value={reflectionForm.thoughts} onChange={(e) => setReflectionForm({ ...reflectionForm, thoughts: e.target.value })} placeholder="你在想什么..." className="min-h-[60px]" />
                        </div>
                        <div>
                          <Label className="text-xs">当时的感受</Label>
                          <Textarea value={reflectionForm.feelings} onChange={(e) => setReflectionForm({ ...reflectionForm, feelings: e.target.value })} placeholder="你的感受是..." className="min-h-[60px]" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">采取了什么行动</Label>
                        <Textarea value={reflectionForm.actions} onChange={(e) => setReflectionForm({ ...reflectionForm, actions: e.target.value })} placeholder="你做了什么..." className="min-h-[60px]" />
                      </div>
                      <div>
                        <Label className="text-xs">结果如何</Label>
                        <Textarea value={reflectionForm.result} onChange={(e) => setReflectionForm({ ...reflectionForm, result: e.target.value })} placeholder="结果是什么..." className="min-h-[60px]" />
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-xl space-y-3">
                      <h4 className="font-medium text-blue-700">分析与收获</h4>
                      <div>
                        <Label className="text-xs">分析原因</Label>
                        <Textarea value={reflectionForm.analysis} onChange={(e) => setReflectionForm({ ...reflectionForm, analysis: e.target.value })} placeholder="为什么会有这样的结果..." className="min-h-[60px]" />
                      </div>
                      <div>
                        <Label className="text-xs">学到了什么</Label>
                        <Textarea value={reflectionForm.learnings} onChange={(e) => setReflectionForm({ ...reflectionForm, learnings: e.target.value })} placeholder="这次复盘有哪些收获..." className="min-h-[60px]" />
                      </div>
                    </div>

                    <div>
                      <Label>图片链接（用逗号分隔）</Label>
                      <Input value={reflectionForm.images} onChange={(e) => setReflectionForm({ ...reflectionForm, images: e.target.value })} placeholder="https://... , https://..." />
                    </div>
                    <div>
                      <Label>标签（用逗号分隔）</Label>
                      <Input value={reflectionForm.tags} onChange={(e) => setReflectionForm({ ...reflectionForm, tags: e.target.value })} placeholder="如：情绪管理, 沟通技巧" />
                    </div>
                    <Button onClick={handleSaveReflection} disabled={!reflectionForm.title} className="w-full bg-gradient-to-r from-violet-500 to-purple-500">
                      保存复盘
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {filteredReflections.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="p-12 text-center">
                  <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">还没有复盘记录</h3>
                  <p className="text-gray-400">点击右上角开始第一次复盘</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredReflections.map((record) => (
                  <Card key={record.id} className="border-violet-100 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{record.title}</CardTitle>
                          <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <Calendar className="w-3 h-3" />
                            {record.date}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openReflectionDialog(record)}>
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteReflectionRecord(record.id)}>
                            <Trash2 className="w-4 h-4 text-gray-400" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-3 bg-violet-50 rounded-lg">
                          <h4 className="text-sm font-medium text-violet-700 mb-2">发生了什么</h4>
                          <p className="text-xs text-gray-600">{record.situation}</p>
                          <p className="text-xs text-gray-500 mt-2"><span className="font-medium">想法：</span>{record.thoughts}</p>
                          <p className="text-xs text-gray-500"><span className="font-medium">感受：</span>{record.feelings}</p>
                          <p className="text-xs text-gray-500"><span className="font-medium">行动：</span>{record.actions}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-700 mb-2">分析与收获</h4>
                          <p className="text-xs text-gray-600">{record.analysis}</p>
                          <p className="text-sm text-blue-600 mt-2 font-medium">{record.learnings}</p>
                        </div>
                      </div>
                      {record.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-4">
                          {record.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* 学习成长 */}
          <TabsContent value="learning">
            <div className="flex justify-end mb-4">
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600" onClick={() => openLearningDialog()}>
                <Plus className="w-4 h-4 mr-1" />
                新增学习
              </Button>
              <Dialog open={!!learningDialog} onOpenChange={(open) => { if (!open) setLearningDialog(null); }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>学习与成长记录</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>标题</Label>
                        <Input value={learningForm.title} onChange={(e) => setLearningForm({ ...learningForm, title: e.target.value })} placeholder="学习主题" />
                      </div>
                      <div>
                        <Label>日期</Label>
                        <Input type="date" value={learningForm.date} onChange={(e) => setLearningForm({ ...learningForm, date: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>来源</Label>
                        <Select value={learningForm.source} onValueChange={(v) => setLearningForm({ ...learningForm, source: v as 'book' | 'course' | 'article' | 'experience' | 'other' })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="book">书籍</SelectItem>
                            <SelectItem value="course">课程</SelectItem>
                            <SelectItem value="article">文章</SelectItem>
                            <SelectItem value="experience">实践经验</SelectItem>
                            <SelectItem value="other">其他</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>来源名称</Label>
                        <Input value={learningForm.sourceName} onChange={(e) => setLearningForm({ ...learningForm, sourceName: e.target.value })} placeholder="如：《正面管教》" />
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-xl space-y-3">
                      <h4 className="font-medium text-blue-700">学习内容</h4>
                      <div>
                        <Label className="text-xs">学习摘要</Label>
                        <Textarea value={learningForm.summary} onChange={(e) => setLearningForm({ ...learningForm, summary: e.target.value })} placeholder="学到了什么核心内容..." className="min-h-[60px]" />
                      </div>
                      <div>
                        <Label className="text-xs">核心洞察</Label>
                        <Textarea value={learningForm.insights} onChange={(e) => setLearningForm({ ...learningForm, insights: e.target.value })} placeholder="有哪些深刻的理解..." className="min-h-[60px]" />
                      </div>
                    </div>

                    <div className="p-4 bg-indigo-50 rounded-xl space-y-3">
                      <h4 className="font-medium text-indigo-700">实践应用</h4>
                      <div>
                        <Label className="text-xs">如何应用</Label>
                        <Textarea value={learningForm.application} onChange={(e) => setLearningForm({ ...learningForm, application: e.target.value })} placeholder="准备如何应用到生活中..." className="min-h-[60px]" />
                      </div>
                      <div>
                        <Label className="text-xs">行动计划</Label>
                        <Textarea value={learningForm.actionPlan} onChange={(e) => setLearningForm({ ...learningForm, actionPlan: e.target.value })} placeholder="具体的行动计划..." className="min-h-[60px]" />
                      </div>
                    </div>

                    <div>
                      <Label>图片链接（用逗号分隔）</Label>
                      <Input value={learningForm.images} onChange={(e) => setLearningForm({ ...learningForm, images: e.target.value })} placeholder="https://... , https://..." />
                    </div>
                    <div>
                      <Label>标签（用逗号分隔）</Label>
                      <Input value={learningForm.tags} onChange={(e) => setLearningForm({ ...learningForm, tags: e.target.value })} placeholder="如：情绪管理, 沟通技巧" />
                    </div>
                    <Button onClick={handleSaveLearning} disabled={!learningForm.title} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500">
                      保存学习记录
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {filteredLearnings.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="p-12 text-center">
                  <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">还没有学习记录</h3>
                  <p className="text-gray-400">点击右上角记录你的学习成长</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredLearnings.map((record) => {
                  const sourceConfig = learningSourceConfig[record.source];
                  const SourceIcon = sourceConfig.icon;
                  return (
                    <Card key={record.id} className="border-blue-100 hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <SourceIcon className="w-3 h-3" />
                              {sourceConfig.label}
                            </Badge>
                            {record.sourceName && <span className="text-sm text-gray-500">{record.sourceName}</span>}
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openLearningDialog(record)}>
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteLearningRecord(record.id)}>
                              <Trash2 className="w-4 h-4 text-gray-400" />
                            </Button>
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-2">{record.title}</h3>
                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {record.date}
                        </p>
                        <div className="space-y-2">
                          <div className="p-2 bg-blue-50 rounded text-xs">
                            <span className="font-medium text-blue-600">摘要：</span>
                            <span className="text-gray-600">{record.summary}</span>
                          </div>
                          <div className="p-2 bg-indigo-50 rounded text-xs">
                            <span className="font-medium text-indigo-600">洞察：</span>
                            <span className="text-gray-600">{record.insights}</span>
                          </div>
                        </div>
                        {record.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {record.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* 重要经验 */}
          <TabsContent value="experiences">
            <div className="flex justify-end mb-4">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" onClick={() => openExperienceDialog()}>
                <Plus className="w-4 h-4 mr-1" />
                记录经验
              </Button>
              <Dialog open={!!experienceDialog} onOpenChange={(open) => { if (!open) setExperienceDialog(null); }}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>重要经验</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>标题</Label>
                      <Input value={experienceForm.title} onChange={(e) => setExperienceForm({ ...experienceForm, title: e.target.value })} placeholder="经验标题" />
                    </div>
                    <div>
                      <Label>类别</Label>
                      <Select value={experienceForm.category} onValueChange={(v) => setExperienceForm({ ...experienceForm, category: v as ExperienceCategory })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="success">成功经验</SelectItem>
                          <SelectItem value="challenge">挑战应对</SelectItem>
                          <SelectItem value="breakthrough">突破时刻</SelectItem>
                          <SelectItem value="lesson">深刻教训</SelectItem>
                          <SelectItem value="tip">实用技巧</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>内容描述</Label>
                      <Textarea value={experienceForm.content} onChange={(e) => setExperienceForm({ ...experienceForm, content: e.target.value })} placeholder="详细描述这个经验..." className="min-h-[100px]" />
                    </div>
                    <div>
                      <Label>金句/高亮（标注最重要的点）</Label>
                      <Textarea value={experienceForm.highlight} onChange={(e) => setExperienceForm({ ...experienceForm, highlight: e.target.value })} placeholder="最值得记住的一句话..." className="min-h-[60px]" />
                    </div>
                    <div>
                      <Label>标签（用逗号分隔）</Label>
                      <Input value={experienceForm.tags} onChange={(e) => setExperienceForm({ ...experienceForm, tags: e.target.value })} placeholder="如：情绪管理, 沟通技巧" />
                    </div>
                    <Button onClick={handleSaveExperience} disabled={!experienceForm.title} className="w-full bg-gradient-to-r from-amber-500 to-orange-500">
                      保存经验
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {filteredExperiences.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="p-12 text-center">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">还没有重要经验</h3>
                  <p className="text-gray-400">点击右上角记录你的育儿经验</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExperiences.map((exp) => {
                  const config = experienceCategoryConfig[exp.category];
                  const Icon = config.icon;
                  return (
                    <Card key={exp.id} className={cn('border transition-all hover:shadow-md', config.borderColor)}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', config.bgColor)}>
                            <Icon className={cn('w-5 h-5', config.color)} />
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => toggleExperienceStar(exp.id)} className="p-1 rounded hover:bg-gray-100">
                              <Star className={cn('w-5 h-5', exp.isStarred ? 'text-amber-500 fill-amber-300' : 'text-gray-300')} />
                            </button>
                            <Button variant="ghost" size="sm" onClick={() => deleteImportantExperience(exp.id)} className="p-1">
                              <Trash2 className="w-4 h-4 text-gray-400" />
                            </Button>
                          </div>
                        </div>
                        <Badge className={cn('mb-2', config.bgColor, config.color, 'border-0')}>
                          {config.label}
                        </Badge>
                        <h3 className="font-semibold text-gray-800 mb-2">{exp.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-3">{exp.content}</p>
                        {exp.highlight && (
                          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 mb-3">
                            <Quote className="w-4 h-4 text-amber-500 mb-1" />
                            <p className="text-sm text-amber-700 italic">{exp.highlight}</p>
                          </div>
                        )}
                        {exp.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {exp.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-3">{format(parseISO(exp.createdAt), 'MM/dd')}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Tips */}
        <Card className="mt-8 border-0 bg-gradient-to-r from-rose-50 via-pink-50 to-violet-50">
          <CardContent className="p-5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800 text-sm mb-1">记录建议</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                定期记录复盘和学习心得，可以帮助你更好地理解孩子的成长轨迹，也能为未来的育儿决策提供参考。
                重要经验记得标星，方便日后快速回顾！
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
