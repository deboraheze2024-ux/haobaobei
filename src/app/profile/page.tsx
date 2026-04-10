'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import MainNav from '@/components/main-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import {
  Heart,
  Smile,
  Frown,
  Meh,
  Angry,
  Calendar,
  TrendingUp,
  Plus,
  ChevronRight,
  Sparkles,
  Brain,
  Target,
  ArrowRight,
} from 'lucide-react';
import { EmotionType } from '@/lib/types';

const emotionTypes: { type: EmotionType; emoji: string; label: string; color: string }[] = [
  { type: 'happy', emoji: '😄', label: '开心', color: 'text-green-500 bg-green-50 border-green-200' },
  { type: 'excited', emoji: '🎉', label: '兴奋', color: 'text-amber-500 bg-amber-50 border-amber-200' },
  { type: 'calm', emoji: '😌', label: '平静', color: 'text-blue-500 bg-blue-50 border-blue-200' },
  { type: 'worried', emoji: '😟', label: '担心', color: 'text-purple-500 bg-purple-50 border-purple-200' },
  { type: 'sad', emoji: '😢', label: '难过', color: 'text-indigo-500 bg-indigo-50 border-indigo-200' },
  { type: 'angry', emoji: '😠', label: '生气', color: 'text-red-500 bg-red-50 border-red-200' },
  { type: 'frustrated', emoji: '😤', label: '沮丧', color: 'text-orange-500 bg-orange-50 border-orange-200' },
  { type: 'scared', emoji: '😨', label: '害怕', color: 'text-gray-500 bg-gray-50 border-gray-200' },
  { type: 'tired', emoji: '😴', label: '疲惫', color: 'text-teal-500 bg-teal-50 border-teal-200' },
  { type: 'proud', emoji: '🥹', label: '自豪', color: 'text-pink-500 bg-pink-50 border-pink-200' },
];

const behaviorPatterns = [
  { id: '求关注', label: '寻求关注', description: '行为背后的错误目的：寻求过度关注', color: 'from-yellow-400 to-orange-400' },
  { id: '争权力', label: '争夺权力', description: '行为背后的错误目的：证明自己有权', color: 'from-red-400 to-pink-400' },
  { id: '报复', label: '报复行为', description: '行为背后的错误目的：情感伤害', color: 'from-purple-400 to-violet-400' },
  { id: '自暴自弃', label: '自暴自弃', description: '行为背后的错误目的：避免失败', color: 'from-gray-400 to-slate-400' },
];

export default function ProfilePage() {
  const { activeChild, emotions, addEmotionRecord, behaviorRecords } = useApp();
  const [showAddEmotion, setShowAddEmotion] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [emotionIntensity, setEmotionIntensity] = useState(5);
  const [emotionNote, setEmotionNote] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('7');

  if (!activeChild) {
    return (
      <div className="min-h-screen">
        <MainNav />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Card className="border-dashed border-2 border-rose-200">
            <CardContent className="py-16">
              <div className="text-6xl mb-4">👶</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                请先添加陪伴对象
              </h2>
              <p className="text-gray-500 mb-6">
                在开始记录之前，需要先在设置中添加孩子信息
              </p>
              <Button asChild className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600">
                <a href="/settings">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  前往设置
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const filterDays = parseInt(filterPeriod);
  const recentDate = format(subDays(new Date(), filterDays), 'yyyy-MM-dd');
  const filteredEmotions = emotions.filter((e) => e.date >= recentDate);

  // 统计数据
  const emotionCounts = filteredEmotions.reduce(
    (acc, e) => {
      acc[e.emotion] = (acc[e.emotion] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const topEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const avgIntensity =
    filteredEmotions.length > 0
      ? Math.round(
          filteredEmotions.reduce((sum, e) => sum + e.intensity, 0) /
            filteredEmotions.length
        )
      : 0;

  const handleAddEmotion = () => {
    if (!selectedEmotion) return;
    addEmotionRecord({
      childId: activeChild.id,
      emotion: selectedEmotion,
      intensity: emotionIntensity,
      note: emotionNote,
      triggers: [],
    });
    setSelectedEmotion(null);
    setEmotionIntensity(5);
    setEmotionNote('');
    setShowAddEmotion(false);
  };

  return (
    <div className="min-h-screen">
      <MainNav />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-200">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">成长档案</h1>
              <p className="text-sm text-gray-500">
                {activeChild.name}的情绪与行为记录
              </p>
            </div>
          </div>
          <Dialog open={showAddEmotion} onOpenChange={setShowAddEmotion}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 shadow-lg shadow-pink-200">
                <Plus className="w-4 h-4 mr-1" />
                记录情绪
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Smile className="w-5 h-5 text-pink-500" />
                  记录此刻情绪
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Emotion Selection */}
                <div>
                  <Label className="text-gray-700 mb-3 block">选择情绪</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {emotionTypes.map((e) => (
                      <button
                        key={e.type}
                        onClick={() => setSelectedEmotion(e.type)}
                        className={cn(
                          'p-3 rounded-xl text-center transition-all',
                          selectedEmotion === e.type
                            ? 'ring-2 ring-pink-500 bg-pink-50 scale-105'
                            : 'hover:bg-gray-50'
                        )}
                      >
                        <div className="text-2xl mb-1">{e.emoji}</div>
                        <div className="text-xs text-gray-600">{e.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Intensity */}
                <div>
                  <Label className="text-gray-700 mb-3 block">
                    情绪强度：{emotionIntensity}/10
                  </Label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={emotionIntensity}
                    onChange={(e) => setEmotionIntensity(parseInt(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>轻微</span>
                    <span>强烈</span>
                  </div>
                </div>

                {/* Note */}
                <div>
                  <Label className="text-gray-700 mb-3 block">备注说明</Label>
                  <Textarea
                    placeholder="记录一下是什么触发了这种情绪..."
                    value={emotionNote}
                    onChange={(e) => setEmotionNote(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <Button
                  onClick={handleAddEmotion}
                  disabled={!selectedEmotion}
                  className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600"
                >
                  保存记录
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50">
            <CardContent className="p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mx-auto mb-2 shadow-lg">
                <Smile className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {filteredEmotions.length}
              </div>
              <div className="text-xs text-gray-500">情绪记录</div>
            </CardContent>
          </Card>

          <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-2 shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800">{avgIntensity}</div>
              <div className="text-xs text-gray-500">平均强度</div>
            </CardContent>
          </Card>

          <Card className="border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-2 shadow-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {behaviorRecords.length}
              </div>
              <div className="text-xs text-gray-500">行为记录</div>
            </CardContent>
          </Card>

          <Card className="border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50">
            <CardContent className="p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center mx-auto mb-2 shadow-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {topEmotions.length > 0
                  ? emotionTypes.find((e) => e.type === topEmotions[0][0])
                      ?.emoji || '😊'
                  : '-'}
              </div>
              <div className="text-xs text-gray-500">主要情绪</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Emotion Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filter */}
            <Card className="border-0 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">情绪趋势</h3>
                    <p className="text-xs text-gray-500">追踪情绪变化</p>
                  </div>
                  <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">最近7天</SelectItem>
                      <SelectItem value="14">最近14天</SelectItem>
                      <SelectItem value="30">最近30天</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Emotion Distribution */}
                <div className="mt-4 space-y-3">
                  {topEmotions.length > 0 ? (
                    topEmotions.map(([emotion, count]) => {
                      const config = emotionTypes.find((e) => e.type === emotion);
                      if (!config) return null;
                      const percentage = Math.round(
                        (count / filteredEmotions.length) * 100
                      );
                      return (
                        <div key={emotion}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{config.emoji}</span>
                              <span className="text-sm text-gray-700">
                                {config.label}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-600">
                              {count}次 ({percentage}%)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Smile className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>暂无情绪记录</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Records */}
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-pink-500" />
                  最近记录
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="space-y-3">
                  {filteredEmotions.slice(0, 10).map((record, index) => {
                    const config = emotionTypes.find(
                      (e) => e.type === record.emotion
                    );
                    if (!config) return null;
                    return (
                      <div
                        key={record.id || index}
                        className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="text-2xl">{config.emoji}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-800">
                              {config.label}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              强度 {record.intensity}/10
                            </Badge>
                            <span className="text-xs text-gray-400 ml-auto">
                              {format(new Date(record.date), 'MM/dd HH:mm')}
                            </span>
                          </div>
                          {record.note && (
                            <p className="text-sm text-gray-600">{record.note}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {filteredEmotions.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>还没有记录</p>
                      <p className="text-sm">点击右上角开始记录情绪</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Four Wrong Goals */}
            <Card className="border-0 bg-gradient-to-br from-violet-50 to-purple-50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="w-5 h-5 text-violet-500" />
                  错误目的理论
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3">
                {behaviorPatterns.map((pattern) => (
                  <div
                    key={pattern.id}
                    className="p-4 rounded-xl bg-white/80 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={cn(
                          'w-3 h-3 rounded-full bg-gradient-to-br',
                          pattern.color
                        )}
                      />
                      <span className="font-medium text-gray-800">
                        {pattern.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{pattern.description}</p>
                  </div>
                ))}
                <div className="pt-2">
                  <Button variant="outline" className="w-full text-violet-600 border-violet-200 hover:bg-violet-50" asChild>
                    <a href="/chat">
                      <Sparkles className="w-4 h-4 mr-1" />
                      AI分析指导
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Emotion Guide */}
            <Card className="border-0 bg-gradient-to-br from-pink-50 to-rose-50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="w-5 h-5 text-pink-500" />
                  情绪调节建议
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-white/80">
                    <div className="text-sm font-medium text-gray-800 mb-1">
                      认识情绪
                    </div>
                    <p className="text-xs text-gray-600">
                      帮助孩子命名和识别自己的情绪，这是情绪管理的第一步
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/80">
                    <div className="text-sm font-medium text-gray-800 mb-1">
                      接纳情绪
                    </div>
                    <p className="text-xs text-gray-600">
                      告诉孩子&ldquo;感到生气是正常的&rdquo;，而不是否定或压抑情绪
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/80">
                    <div className="text-sm font-medium text-gray-800 mb-1">
                      表达情绪
                    </div>
                    <p className="text-xs text-gray-600">
                      教会孩子用语言而非行为来表达情绪
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
