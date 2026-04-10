'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Heart,
  Copy,
  Check,
  Filter,
  MessageSquare,
  BookOpen,
  Sparkles,
  Users,
  Zap,
  Moon,
} from 'lucide-react';
import { useApp } from '@/lib/context';
import MainNav from '@/components/main-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhraseCard as PhraseCardType, PhraseCategory } from '@/lib/types';

const categoryConfig: Record<
  PhraseCategory,
  { icon: typeof MessageSquare; color: string; bgColor: string; borderColor: string }
> = {
  '赢得合作': {
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
  },
  '启发式提问': {
    icon: Zap,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  '积极暂停': {
    icon: Moon,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  '情绪调节': {
    icon: Sparkles,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
  },
  '错误目的': {
    icon: BookOpen,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  '日常惯例': {
    icon: Filter,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
  },
  '家庭会议': {
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  '鼓励话语': {
    icon: Heart,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
};

const categories: PhraseCategory[] = [
  '赢得合作',
  '启发式提问',
  '积极暂停',
  '情绪调节',
  '错误目的',
  '日常惯例',
  '家庭会议',
  '鼓励话语',
];

export default function PhrasesPage() {
  const { phraseCards, toggleFavorite } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PhraseCategory | '全部'>('全部');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredCards = useMemo(() => {
    return phraseCards.filter((card) => {
      // 搜索过滤
      const matchesSearch =
        searchQuery === '' ||
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // 分类过滤
      const matchesCategory =
        selectedCategory === '全部' || card.category === selectedCategory;

      // 收藏过滤
      const matchesFavorite = !showFavoritesOnly || card.isFavorite;

      return matchesSearch && matchesCategory && matchesFavorite;
    });
  }, [phraseCards, searchQuery, selectedCategory, showFavoritesOnly]);

  const copyToClipboard = async (text: string, cardId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(cardId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  const favoriteCount = phraseCards.filter((c) => c.isFavorite).length;

  return (
    <div className="min-h-screen">
      <MainNav />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">话术速查库</h1>
              <p className="text-gray-500">
                来自《正面管教》的实用话术，按场景整理
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4">
            <Badge className="bg-teal-100 text-teal-700 px-3 py-1.5">
              共 {phraseCards.length} 条话术
            </Badge>
            <Badge
              className={`px-3 py-1.5 cursor-pointer transition-all ${showFavoritesOnly ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-600 hover:bg-pink-50'}`}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <Heart className="w-3 h-3 mr-1" />
              收藏 {favoriteCount}
            </Badge>
          </div>
        </div>

        {/* Search & Filter */}
        <Card className="border-teal-200 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="搜索话术..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-teal-200 focus:border-teal-400"
                />
              </div>
              <Tabs
                value={selectedCategory}
                onValueChange={(v) => setSelectedCategory(v as PhraseCategory | '全部')}
              >
                <TabsList className="flex flex-wrap h-auto">
                  <TabsTrigger value="全部" className="data-[state=active]:bg-teal-100">
                    全部
                  </TabsTrigger>
                  {categories.map((cat) => (
                    <TabsTrigger
                      key={cat}
                      value={cat}
                      className="data-[state=active]:bg-teal-100"
                    >
                      {cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Category Overview */}
        {searchQuery === '' && selectedCategory === '全部' && !showFavoritesOnly && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {categories.map((cat) => {
              const config = categoryConfig[cat];
              const Icon = config.icon;
              const count = phraseCards.filter((c) => c.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`p-4 rounded-xl border-2 ${config.borderColor} ${config.bgColor} hover:shadow-md transition-all text-left`}
                >
                  <Icon className={`w-6 h-6 ${config.color} mb-2`} />
                  <div className="font-medium text-gray-800">{cat}</div>
                  <div className="text-sm text-gray-500">{count} 条话术</div>
                </button>
              );
            })}
          </div>
        )}

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => {
            const config = categoryConfig[card.category];
            const Icon = config.icon;
            return (
              <PhraseCard
                key={card.id}
                card={card}
                config={config}
                Icon={Icon}
                isCopied={copiedId === card.id}
                onCopy={() => copyToClipboard(card.content, card.id)}
                onToggleFavorite={() => toggleFavorite(card.id)}
              />
            );
          })}
        </div>

        {filteredCards.length === 0 && (
          <Card className="border-gray-200">
            <CardContent className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                未找到匹配的话术
              </h3>
              <p className="text-gray-400">
                尝试调整搜索词或选择其他分类
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="mt-8 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="p-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-xl">💡</span> 使用建议
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>话术是工具，不是脚本。根据孩子的性格和当前情况灵活调整</span>
              </li>
              <li className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>先理解孩子的感受，再使用这些话术，效果会更好</span>
              </li>
              <li className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>建议收藏经常使用的话术，随时快速查阅</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function PhraseCard({
  card,
  config,
  Icon,
  isCopied,
  onCopy,
  onToggleFavorite,
}: {
  card: PhraseCardType;
  config: (typeof categoryConfig)[PhraseCategory];
  Icon: typeof MessageSquare;
  isCopied: boolean;
  onCopy: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <Card className={`border ${config.borderColor} hover:shadow-lg transition-all group`}>
      <CardHeader className={`pb-2 ${config.bgColor} border-b ${config.borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${config.color}`} />
            <Badge variant="secondary" className={`${config.bgColor} ${config.color} border-0`}>
              {card.category}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleFavorite}
              className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${card.isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`}
              />
            </button>
            <button
              onClick={onCopy}
              className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>
        <CardTitle className="text-base mt-2">{card.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <blockquote className="text-gray-700 italic mb-3">{"\u201C"}{card.content}{"\u201D"}</blockquote>
        {card.situation && (
          <p className="text-sm text-gray-500 mb-3">适用场景：{card.situation}</p>
        )}
        <div className="flex flex-wrap gap-1">
          {card.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        {card.sourceChapter && (
          <p className="text-xs text-gray-400 mt-3">来源：{card.sourceChapter}</p>
        )}
      </CardContent>
    </Card>
  );
}
