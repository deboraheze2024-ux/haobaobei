'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import MainNav from '@/components/main-nav';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Search,
  Heart,
  Copy,
  Check,
  Star,
  Sparkles,
  Plus,
  Mic,
} from 'lucide-react';

interface Phrase {
  id: string;
  title: string;
  category: string;
  content: string;
  scenario: string;
  chapter: string;
  isFavorite?: boolean;
}

const defaultPhrases: Phrase[] = [
  // 赢得合作
  {
    id: 'p1',
    title: '表达理解',
    category: '赢得合作',
    content: '我知道你现在很沮丧，因为作业太难了。',
    scenario: '孩子因作业困难而发脾气时',
    chapter: '第4章：重新看待不良行为',
    isFavorite: false,
  },
  {
    id: 'p2',
    title: '表达感受',
    category: '赢得合作',
    content: '这让我感到有些担心，因为我真的很在乎你。',
    scenario: '孩子不愿意沟通时',
    chapter: '第4章：重新看待不良行为',
    isFavorite: false,
  },
  {
    id: 'p3',
    title: '分享经历',
    category: '赢得合作',
    content: '我记得我小时候也有过这种感觉，当时我觉得...',
    scenario: '建立情感连接时',
    chapter: '第4章：重新看待不良行为',
    isFavorite: false,
  },
  {
    id: 'p4',
    title: '专注于解决方案',
    category: '赢得合作',
    content: '让我们一起来想办法解决这个问题吧。',
    scenario: '一起面对挑战时',
    chapter: '第4章：重新看待不良行为',
    isFavorite: false,
  },
  // 启发式提问
  {
    id: 'p5',
    title: '探索原因',
    category: '启发式提问',
    content: '你愿意告诉我发生了什么吗？',
    scenario: '了解事情经过时',
    chapter: '第5章：班会',
    isFavorite: false,
  },
  {
    id: 'p6',
    title: '引导思考',
    category: '启发式提问',
    content: '你对解决这个问题有什么想法？',
    scenario: '引导孩子独立思考时',
    chapter: '第5章：班会',
    isFavorite: false,
  },
  {
    id: 'p7',
    title: '理解感受',
    category: '启发式提问',
    content: '那时候你一定感到很...（停顿等孩子回应）',
    scenario: '帮助孩子表达感受时',
    chapter: '第5章：班会',
    isFavorite: false,
  },
  {
    id: 'p8',
    title: '后果认知',
    category: '启发式提问',
    content: '你觉得这个决定会带来什么后果？',
    scenario: '帮助孩子预见行为结果',
    chapter: '第5章：班会',
    isFavorite: false,
  },
  // 情绪调节
  {
    id: 'p9',
    title: '命名情绪',
    category: '情绪调节',
    content: '你现在看起来很生气。我可以帮你冷静下来。',
    scenario: '孩子情绪激动时',
    chapter: '第6章：家庭会议',
    isFavorite: false,
  },
  {
    id: 'p10',
    title: '接纳情绪',
    category: '情绪调节',
    content: '感到伤心/生气是完全可以的。每个人都会有这样的感受。',
    scenario: '否定孩子情绪后修复时',
    chapter: '第6章：家庭会议',
    isFavorite: false,
  },
  {
    id: 'p11',
    title: '积极暂停',
    category: '情绪调节',
    content: '我觉得我们都需要冷静一下。你想选择在你的房间还是客厅角落？',
    scenario: '冲突升级时',
    chapter: '第6章：家庭会议',
    isFavorite: false,
  },
  {
    id: 'p12',
    title: '共情连接',
    category: '情绪调节',
    content: '我爱你，我们只是需要冷静一下再来解决问题。',
    scenario: '情绪激动时保持连接',
    chapter: '第6章：家庭会议',
    isFavorite: false,
  },
  // 正向引导
  {
    id: 'p13',
    title: '关注正向',
    category: '正向引导',
    content: '我注意到你今天主动把玩具收好了，谢谢你！',
    scenario: '强化正向行为时',
    chapter: '第3章：出生顺序的重要性',
    isFavorite: false,
  },
  {
    id: 'p14',
    title: '具体表扬',
    category: '正向引导',
    content: '你是怎么做到这么有耐心的？我看到你一直在努力。',
    scenario: '肯定孩子努力而非天赋',
    chapter: '第3章：出生顺序的重要性',
    isFavorite: false,
  },
  {
    id: 'p15',
    title: '鼓励的话语',
    category: '正向引导',
    content: '错误是学习的好机会。你从这个错误中学到了什么？',
    scenario: '孩子犯错时',
    chapter: '第1章：正面的方法',
    isFavorite: false,
  },
  {
    id: 'p16',
    title: '赋权表达',
    category: '正向引导',
    content: '我相信你有能力解决这个问题。',
    scenario: '培养孩子自信心时',
    chapter: '第1章：正面的方法',
    isFavorite: false,
  },
  // 日常互动
  {
    id: 'p17',
    title: '早晨问候',
    category: '日常互动',
    content: '早安！今天你希望怎么被叫醒——温柔地还是充满活力地？',
    scenario: '叫孩子起床时',
    chapter: '第7章：班会',
    isFavorite: false,
  },
  {
    id: 'p18',
    title: '睡前分享',
    category: '日常互动',
    content: '今天有没有什么让你觉得开心/困难的事情？',
    scenario: '睡前的特别时光',
    chapter: '第7章：班会',
    isFavorite: false,
  },
  {
    id: 'p19',
    title: '餐桌对话',
    category: '日常互动',
    content: '如果你可以和任何一个人共进晚餐，你想选谁？',
    scenario: '促进家庭交流',
    chapter: '第6章：家庭会议',
    isFavorite: false,
  },
  {
    id: 'p20',
    title: '感谢表达',
    category: '日常互动',
    content: '谢谢你帮忙摆餐具，这让晚餐准备变得轻松多了。',
    scenario: '孩子帮忙做家务时',
    chapter: '第3章：出生顺序的重要性',
    isFavorite: false,
  },
];

const categories = [
  { value: 'all', label: '全部', icon: BookOpen, gradient: 'from-gray-400 to-gray-500' },
  { value: '赢得合作', label: '赢得合作', icon: Heart, gradient: 'from-pink-400 to-rose-500' },
  { value: '启发式提问', label: '启发式提问', icon: Mic, gradient: 'from-blue-400 to-indigo-500' },
  { value: '情绪调节', label: '情绪调节', icon: Sparkles, gradient: 'from-violet-400 to-purple-500' },
  { value: '正向引导', label: '正向引导', icon: Star, gradient: 'from-amber-400 to-orange-500' },
  { value: '日常互动', label: '日常互动', icon: Heart, gradient: 'from-teal-400 to-emerald-500' },
];

export default function PhrasesPage() {
  const { phraseCards, addPhraseCard, toggleFavorite, deletePhraseCard } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPhrase, setNewPhrase] = useState<Partial<Phrase>>({
    title: '',
    category: '日常互动',
    content: '',
    scenario: '',
    chapter: '自定义',
  });

  const allPhrases = [...defaultPhrases, ...phraseCards].map((p) => ({
    ...p,
    isFavorite: phraseCards.find((ph) => ph.id === p.id)?.isFavorite ?? p.isFavorite,
  }));

  const filteredPhrases = allPhrases.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const scenarioText = 'scenario' in p ? (p as any).scenario : '';
    const matchesSearch =
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scenarioText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (phrase: any) => {
    navigator.clipboard.writeText(phrase.content);
    setCopiedId(phrase.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddPhrase = () => {
    if (!newPhrase.title || !newPhrase.content) return;
    addPhraseCard({
      id: `custom-${Date.now()}`,
      title: newPhrase.title!,
      category: newPhrase.category as '赢得合作' | '启发式提问' | '积极暂停' | '情绪调节' | '错误目的' | '日常惯例',
      content: newPhrase.content!,
      situation: newPhrase.scenario || '',
      sourceChapter: newPhrase.chapter || '自定义',
      isFavorite: false,
      tags: [],
    });
    setNewPhrase({
      title: '',
      category: '日常互动',
      content: '',
      scenario: '',
      chapter: '自定义',
    });
    setShowAddDialog(false);
  };

  return (
    <div className="min-h-screen">
      <MainNav />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-200">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">话术速查库</h1>
              <p className="text-sm text-gray-500">
                {allPhrases.length}条实用话术，即学即用
              </p>
            </div>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-lg shadow-teal-200">
                <Plus className="w-4 h-4 mr-1" />
                添加话术
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>添加自定义话术</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>话术标题</Label>
                  <Input
                    value={newPhrase.title}
                    onChange={(e) =>
                      setNewPhrase({ ...newPhrase, title: e.target.value })
                    }
                    placeholder="例如：早晨问候"
                  />
                </div>
                <div>
                  <Label>话术内容</Label>
                  <Textarea
                    value={newPhrase.content}
                    onChange={(e) =>
                      setNewPhrase({ ...newPhrase, content: e.target.value })
                    }
                    placeholder="输入你想保存的话术..."
                  />
                </div>
                <div>
                  <Label>适用场景</Label>
                  <Input
                    value={newPhrase.scenario}
                    onChange={(e) =>
                      setNewPhrase({ ...newPhrase, scenario: e.target.value })
                    }
                    placeholder="例如：早晨叫孩子起床时"
                  />
                </div>
                <div>
                  <Label>分类</Label>
                  <select
                    value={newPhrase.category}
                    onChange={(e) =>
                      setNewPhrase({ ...newPhrase, category: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white"
                  >
                    {categories
                      .filter((c) => c.value !== 'all')
                      .map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                  </select>
                </div>
                <Button
                  onClick={handleAddPhrase}
                  disabled={!newPhrase.title || !newPhrase.content}
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-500"
                >
                  保存话术
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search & Filter */}
        <Card className="mb-6 border-0 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索话术..."
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>

            <Tabs
              value={activeCategory}
              onValueChange={setActiveCategory}
              className="mt-4"
            >
              <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <TabsTrigger
                      key={cat.value}
                      value={cat.value}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:text-white',
                        activeCategory === cat.value
                          ? `bg-gradient-to-r ${cat.gradient} text-white shadow-lg`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-xs">{cat.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Phrases Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredPhrases.map((phrase) => (
            <Card
              key={phrase.id}
              className={cn(
                'group hover:shadow-lg transition-all duration-200 border',
                phrase.isFavorite
                  ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50'
                  : 'border-gray-100 hover:border-gray-200'
              )}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        phrase.category === '赢得合作' && 'border-pink-200 text-pink-600 bg-pink-50',
                        phrase.category === '启发式提问' && 'border-blue-200 text-blue-600 bg-blue-50',
                        phrase.category === '情绪调节' && 'border-violet-200 text-violet-600 bg-violet-50',
                        phrase.category === '正向引导' && 'border-amber-200 text-amber-600 bg-amber-50',
                        phrase.category === '日常互动' && 'border-teal-200 text-teal-600 bg-teal-50'
                      )}
                    >
                      {phrase.category}
                    </Badge>
                    {phrase.isFavorite && (
                      <Star className="w-4 h-4 text-amber-500 fill-amber-300" />
                    )}
                  </div>
                  <button
                    onClick={() => handleCopy(phrase)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-gray-100 transition-all"
                  >
                    {copiedId === phrase.id ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>

                <h3 className="font-semibold text-gray-800 mb-2">{phrase.title}</h3>
                <blockquote className="text-gray-600 text-sm leading-relaxed mb-3 pl-3 border-l-2 border-pink-200 italic">
                  &ldquo;{phrase.content}&rdquo;
                </blockquote>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {('scenario' in phrase ? (phrase as any).scenario : '') || '通用场景'}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span>{('chapter' in phrase ? (phrase as any).chapter : phrase.sourceChapter) || '正面管教'}</span>
                </div>

                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8 text-xs"
                    onClick={() => handleCopy(phrase)}
                  >
                    {copiedId === phrase.id ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        复制话术
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      'h-8 text-xs',
                      phrase.isFavorite
                        ? 'text-amber-500 border-amber-200 hover:bg-amber-50'
                        : ''
                    )}
                    onClick={() => {
                      if (phraseCards.find((p) => p.id === phrase.id)) {
                        deletePhraseCard(phrase.id);
                      } else {
                        toggleFavorite(phrase.id);
                      }
                    }}
                  >
                    <Star
                      className={cn(
                        'w-3 h-3',
                        phrase.isFavorite ? 'fill-amber-300' : ''
                      )}
                    />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPhrases.length === 0 && (
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="py-16 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                未找到相关话术
              </h3>
              <p className="text-sm text-gray-500">
                尝试调整搜索词或选择其他分类
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tip */}
        <Card className="mt-8 border-0 bg-gradient-to-r from-violet-50 to-purple-50">
          <CardContent className="p-5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800 text-sm mb-1">
                使用技巧
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                话术只是起点，更重要的是真诚的态度。当您真正理解孩子的感受，用平和的语气说出这些话术，效果会更好。
                记住：赢得孩子合作，而不是赢了孩子。
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
