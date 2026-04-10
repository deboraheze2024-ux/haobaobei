'use client';

import { useState } from 'react';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  Heart,
  Smile,
  Frown,
  Meh,
  Angry,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '@/lib/context';
import MainNav from '@/components/main-nav';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmotionRecord, EmotionType, KeyBehavior } from '@/lib/types';

const emotionIcons: Record<EmotionType, typeof Smile> = {
  开心: Smile,
  平静: Meh,
  焦虑: AlertCircle,
  沮丧: Frown,
  愤怒: Angry,
  恐惧: AlertCircle,
  惊讶: AlertCircle,
  悲伤: Frown,
  疲惫: Frown,
  兴奋: Smile,
};

const emotionColors: Record<EmotionType, string> = {
  开心: 'text-yellow-500 bg-yellow-50 border-yellow-200',
  平静: 'text-blue-500 bg-blue-50 border-blue-200',
  焦虑: 'text-orange-500 bg-orange-50 border-orange-200',
  沮丧: 'text-gray-500 bg-gray-50 border-gray-200',
  愤怒: 'text-red-500 bg-red-50 border-red-200',
  恐惧: 'text-purple-500 bg-purple-50 border-purple-200',
  惊讶: 'text-pink-500 bg-pink-50 border-pink-200',
  悲伤: 'text-indigo-500 bg-indigo-50 border-indigo-200',
  疲惫: 'text-slate-500 bg-slate-50 border-slate-200',
  兴奋: 'text-amber-500 bg-amber-50 border-amber-200',
};

const allEmotions: EmotionType[] = [
  '开心',
  '平静',
  '焦虑',
  '沮丧',
  '愤怒',
  '恐惧',
  '惊讶',
  '悲伤',
  '疲惫',
  '兴奋',
];

export default function ProfilePage() {
  const {
    activeChild,
    updateChildProfile,
    recentEmotions,
    saveEmotion,
  } = useApp();

  const [isAddEmotionOpen, setIsAddEmotionOpen] = useState(false);
  const [isAddBehaviorOpen, setIsAddBehaviorOpen] = useState(false);

  // 新情绪记录表单
  const [emotionForm, setEmotionForm] = useState({
    emotion: '' as EmotionType | '',
    intensity: 3 as 1 | 2 | 3 | 4 | 5,
    trigger: '',
    behavior: '',
    parentResponse: '',
    notes: '',
  });

  // 新行为记录表单
  const [behaviorForm, setBehaviorForm] = useState({
    type: '' as KeyBehavior['type'] | '',
    description: '',
    triggers: '',
    parentResponse: '',
    effect: '' as KeyBehavior['effect'] | '',
  });

  const handleAddEmotion = () => {
    if (!activeChild || !emotionForm.emotion) return;

    const record: EmotionRecord = {
      id: `emotion-${Date.now()}`,
      childId: activeChild.id,
      date: new Date().toISOString().split('T')[0],
      time: format(new Date(), 'HH:mm'),
      emotion: emotionForm.emotion as EmotionType,
      intensity: emotionForm.intensity,
      trigger: emotionForm.trigger || undefined,
      behavior: emotionForm.behavior || undefined,
      parentResponse: emotionForm.parentResponse || undefined,
      notes: emotionForm.notes || undefined,
    };

    saveEmotion(record);
    setIsAddEmotionOpen(false);
    setEmotionForm({
      emotion: '',
      intensity: 3,
      trigger: '',
      behavior: '',
      parentResponse: '',
      notes: '',
    });
  };

  const handleAddBehavior = () => {
    if (!activeChild || !behaviorForm.type || !behaviorForm.description) return;

    const newBehavior: KeyBehavior = {
      id: `behavior-${Date.now()}`,
      type: behaviorForm.type as KeyBehavior['type'],
      description: behaviorForm.description,
      triggers: behaviorForm.triggers
        ? behaviorForm.triggers.split(',').map((t) => t.trim())
        : [],
      parentResponse: behaviorForm.parentResponse,
      effect: (behaviorForm.effect as KeyBehavior['effect']) || '部分有效',
      createdAt: new Date().toISOString(),
    };

    updateChildProfile({
      ...activeChild,
      keyBehaviors: [...activeChild.keyBehaviors, newBehavior],
      updatedAt: new Date().toISOString(),
    });

    setIsAddBehaviorOpen(false);
    setBehaviorForm({
      type: '',
      description: '',
      triggers: '',
      parentResponse: '',
      effect: '',
    });
  };

  // 情绪统计
  const emotionStats = allEmotions.map((emotion) => {
    const count = recentEmotions.filter((r) => r.emotion === emotion).length;
    return { emotion, count };
  });

  const maxCount = Math.max(...emotionStats.map((s) => s.count), 1);

  // 行为趋势分析
  const behaviorTrends = activeChild?.keyBehaviors.map((b) => {
    const effectOrder = { 有效: 3, '部分有效': 2, 无效: 1 };
    return {
      ...b,
      effectScore: effectOrder[b.effect as keyof typeof effectOrder] || 2,
    };
  }).sort((a, b) => b.effectScore - a.effectScore) || [];

  if (!activeChild) {
    return (
      <div className="min-h-screen">
        <MainNav />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card className="border-amber-200">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                暂无孩子档案
              </h2>
              <p className="text-gray-500">
                请先在首页添加孩子的基本信息
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <MainNav />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">成长档案</h1>
            <p className="text-gray-500">
              追踪 {activeChild.name} 的情绪变化和行为模式
            </p>
          </div>
        </div>

        {/* Child Info Card */}
        <Card className="border-pink-200 mb-8 bg-gradient-to-r from-pink-50 to-rose-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {activeChild.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {activeChild.name}
                </h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(activeChild.birthDate), 'yyyy年MM月dd日')}
                  </span>
                  <Badge className="bg-pink-100 text-pink-700">
                    {activeChild.currentStage}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-pink-600">
                  {recentEmotions.length}
                </div>
                <div className="text-sm text-gray-500">近7天记录</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Emotion Tracking */}
          <Card className="border-violet-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-violet-500" />
                情绪追踪
              </CardTitle>
              <Dialog open={isAddEmotionOpen} onOpenChange={setIsAddEmotionOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-violet-500 hover:bg-violet-600">
                    <Plus className="w-4 h-4 mr-1" />
                    记录情绪
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>记录情绪</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        当前情绪
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {allEmotions.map((emotion) => {
                          const Icon = emotionIcons[emotion];
                          const isSelected = emotionForm.emotion === emotion;
                          return (
                            <button
                              key={emotion}
                              onClick={() =>
                                setEmotionForm((f) => ({ ...f, emotion }))
                              }
                              className={`p-3 rounded-lg border-2 transition-all ${isSelected ? emotionColors[emotion] + ' border-current' : 'border-gray-100 hover:border-gray-200'}`}
                            >
                              <Icon className="w-5 h-5 mx-auto" />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        情绪强度 (1-5)
                      </label>
                      <div className="flex gap-2">
                        {([1, 2, 3, 4, 5] as const).map((level) => (
                          <button
                            key={level}
                            onClick={() =>
                              setEmotionForm((f) => ({ ...f, intensity: level }))
                            }
                            className={`flex-1 py-2 rounded-lg border-2 transition-all ${emotionForm.intensity === level ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-100'}`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        触发事件（选填）
                      </label>
                      <Textarea
                        placeholder="是什么引发了这种情绪？"
                        value={emotionForm.trigger}
                        onChange={(e) =>
                          setEmotionForm((f) => ({
                            ...f,
                            trigger: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        孩子行为（选填）
                      </label>
                      <Textarea
                        placeholder="孩子有什么反应或行为？"
                        value={emotionForm.behavior}
                        onChange={(e) =>
                          setEmotionForm((f) => ({
                            ...f,
                            behavior: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        你的回应（选填）
                      </label>
                      <Textarea
                        placeholder="你当时是怎么回应的？"
                        value={emotionForm.parentResponse}
                        onChange={(e) =>
                          setEmotionForm((f) => ({
                            ...f,
                            parentResponse: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <Button
                      onClick={handleAddEmotion}
                      className="w-full bg-violet-500 hover:bg-violet-600"
                      disabled={!emotionForm.emotion}
                    >
                      保存记录
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {/* Emotion Stats */}
              <div className="space-y-2 mb-6">
                {emotionStats.map(({ emotion, count }) => {
                  const Icon = emotionIcons[emotion];
                  const percent = (count / maxCount) * 100;
                  return (
                    <div key={emotion} className="flex items-center gap-3">
                      <Icon
                        className={`w-5 h-5 ${emotionColors[emotion].split(' ')[0]}`}
                      />
                      <span className="w-12 text-sm text-gray-600">{emotion}</span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${emotionColors[emotion].split(' ')[1]}`}
                          style={{ width: `${Math.max(percent, count > 0 ? 10 : 0)}%` }}
                        />
                      </div>
                      <span className="w-8 text-sm text-gray-500 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Recent Emotions */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-600 mb-3">
                  最近记录
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {recentEmotions.slice(-5).reverse().map((record) => {
                    const Icon = emotionIcons[record.emotion];
                    return (
                      <div
                        key={record.id}
                        className={`p-3 rounded-lg border ${emotionColors[record.emotion]}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span className="font-medium">{record.emotion}</span>
                            <span className="text-xs opacity-70">
                              强度 {record.intensity}
                            </span>
                          </div>
                          <span className="text-xs opacity-70">
                            {record.date} {record.time}
                          </span>
                        </div>
                        {record.trigger && (
                          <p className="text-xs opacity-80">{record.trigger}</p>
                        )}
                      </div>
                    );
                  })}
                  {recentEmotions.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">
                      暂无记录，点击上方按钮添加
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Behavior Tracking */}
          <Card className="border-teal-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-500" />
                行为模式
              </CardTitle>
              <Dialog
                open={isAddBehaviorOpen}
                onOpenChange={setIsAddBehaviorOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
                    <Plus className="w-4 h-4 mr-1" />
                    记录行为
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>记录行为模式</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        行为类型
                      </label>
                      <Select
                        value={behaviorForm.type}
                        onValueChange={(v) =>
                          setBehaviorForm((f) => ({
                            ...f,
                            type: v as KeyBehavior['type'],
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择行为类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="课堂消极">课堂消极</SelectItem>
                          <SelectItem value="主动开口">主动开口</SelectItem>
                          <SelectItem value="情绪崩溃">情绪崩溃</SelectItem>
                          <SelectItem value="其他">其他</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        行为描述
                      </label>
                      <Textarea
                        placeholder="具体描述这个行为"
                        value={behaviorForm.description}
                        onChange={(e) =>
                          setBehaviorForm((f) => ({
                            ...f,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        触发因素（逗号分隔）
                      </label>
                      <Input
                        placeholder="如: 起床困难, 被批评"
                        value={behaviorForm.triggers}
                        onChange={(e) =>
                          setBehaviorForm((f) => ({
                            ...f,
                            triggers: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        你的应对方式
                      </label>
                      <Textarea
                        placeholder="当时你是怎么回应的？"
                        value={behaviorForm.parentResponse}
                        onChange={(e) =>
                          setBehaviorForm((f) => ({
                            ...f,
                            parentResponse: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        效果
                      </label>
                      <Select
                        value={behaviorForm.effect}
                        onValueChange={(v) =>
                          setBehaviorForm((f) => ({
                            ...f,
                            effect: v as KeyBehavior['effect'],
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择效果" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="有效">有效</SelectItem>
                          <SelectItem value="部分有效">部分有效</SelectItem>
                          <SelectItem value="无效">无效</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleAddBehavior}
                      className="w-full bg-teal-500 hover:bg-teal-600"
                      disabled={!behaviorForm.type || !behaviorForm.description}
                    >
                      保存记录
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {behaviorTrends.map((behavior) => (
                  <div
                    key={behavior.id}
                    className="p-4 rounded-lg border border-gray-200 hover:border-teal-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={
                            behavior.type === '课堂消极'
                              ? 'bg-orange-100 text-orange-700'
                              : behavior.type === '情绪崩溃'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                          }
                        >
                          {behavior.type}
                        </Badge>
                        {behavior.effect === '有效' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {behavior.effect === '有效' ? (
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                        ) : behavior.effect === '无效' ? (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        ) : (
                          <Minus className="w-4 h-4 text-orange-500" />
                        )}
                        <span
                          className={`text-xs font-medium ${
                            behavior.effect === '有效'
                              ? 'text-emerald-600'
                              : behavior.effect === '无效'
                                ? 'text-red-600'
                                : 'text-orange-600'
                          }`}
                        >
                          {behavior.effect}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-800 mb-2">
                      {behavior.description}
                    </p>
                    {behavior.triggers.length > 0 && (
                      <p className="text-xs text-gray-500 mb-2">
                        触发因素: {behavior.triggers.join(', ')}
                      </p>
                    )}
                    {behavior.parentResponse && (
                      <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        应对: {behavior.parentResponse}
                      </p>
                    )}
                  </div>
                ))}
                {behaviorTrends.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p>暂无行为记录</p>
                    <p className="text-sm">
                      记录孩子的行为模式，帮助分析{"\u201C"}四个错误目的{"\u201D"}
                    </p>
                  </div>
                )}
              </div>

              {/* Four Error Purposes Guide */}
              <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg border border-teal-200">
                <h4 className="text-sm font-bold text-teal-700 mb-3">
                  四个错误目的（来自《正面管教》第2章）
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-white rounded">
                    <span className="font-medium text-gray-700">寻求关注</span>
                    <p className="text-gray-500">{"\u201C"}看我！{"\u201D"}</p>
                  </div>
                  <div className="p-2 bg-white rounded">
                    <span className="font-medium text-gray-700">寻求权力</span>
                    <p className="text-gray-500">{"\u201C"}你管不了我{"\u201D"}</p>
                  </div>
                  <div className="p-2 bg-white rounded">
                    <span className="font-medium text-gray-700">报复</span>
                    <p className="text-gray-500">&ldquo;你伤害我&rdquo;</p>
                  </div>
                  <div className="p-2 bg-white rounded">
                    <span className="font-medium text-gray-700">自暴自弃</span>
                    <p className="text-gray-500">&ldquo;我不重要&rdquo;</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
