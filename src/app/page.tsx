'use client';

import Link from 'next/link';
import {
  CalendarCheck,
  UserCircle,
  MessageCircle,
  BookOpen,
  Users,
  Sparkles,
  TrendingUp,
  Heart,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '@/lib/context';
import MainNav from '@/components/main-nav';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const modules = [
  {
    href: '/checkin',
    icon: CalendarCheck,
    title: '今日打卡',
    description: '早晨、日间、晚间三段核心行动',
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    stats: '3个时段任务',
  },
  {
    href: '/profile',
    icon: UserCircle,
    title: '成长档案',
    description: '追踪情绪变化和行为模式',
    color: 'from-pink-400 to-rose-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    stats: '行为分析',
  },
  {
    href: '/chat',
    icon: MessageCircle,
    title: 'AI 问答助手',
    description: '基于正面管教书籍的智能问答',
    color: 'from-violet-400 to-purple-500',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    stats: 'RAG知识库',
  },
  {
    href: '/phrases',
    icon: BookOpen,
    title: '话术速查库',
    description: '按场景整理的实用话术卡片',
    color: 'from-teal-400 to-emerald-500',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    stats: '20+话术',
  },
  {
    href: '/meeting',
    icon: Users,
    title: '家庭会议',
    description: '完整会议流程与记录归档',
    color: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    stats: '致谢-议题-决策',
  },
];

export default function HomePage() {
  const { activeChild, recentEmotions, todayCheckIns } = useApp();

  // 统计数据
  const todayCompletedTasks = todayCheckIns.reduce(
    (sum, checkin) => sum + checkin.tasks.filter((t) => t.completed).length,
    0
  );
  const todayTotalTasks = todayCheckIns.reduce(
    (sum, checkin) => sum + checkin.tasks.length,
    0
  );

  // 近7天情绪统计
  const emotionCounts = recentEmotions.reduce(
    (acc, e) => {
      acc[e.emotion] = (acc[e.emotion] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const topEmotion = Object.entries(emotionCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return (
    <div className="min-h-screen">
      <MainNav />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-100 via-orange-50 to-rose-100 rounded-3xl opacity-50" />
          <div className="relative p-8 md:p-12 rounded-3xl border border-amber-200 bg-white/60 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                    <Sparkles className="w-3 h-3 mr-1" />
                    正面管教助手
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                  陪伴成长，从心开始
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed">
                  基于《正面管教》118页核心内容，为您和您的孩子提供个性化的成长陪伴方案。
                  让每一个日常时刻都成为培养责任感、归属感和能力的契机。
                </p>
              </div>

              {/* Child Card */}
              {activeChild && (
                <Card className="w-full md:w-72 border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                          {activeChild.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">
                          {activeChild.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {activeChild.currentStage}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{format(new Date(), 'EEEE', { locale: zhCN })}</span>
                      </div>
                      {topEmotion && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Heart className="w-4 h-4 text-pink-400" />
                          <span>近期情绪：{topEmotion[0]}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Card className="border-amber-200">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-amber-600 mb-1">
                {todayCompletedTasks}/{todayTotalTasks || 9}
              </div>
              <div className="text-sm text-gray-500">今日打卡</div>
            </CardContent>
          </Card>
          <Card className="border-pink-200">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-pink-600 mb-1">
                {recentEmotions.length}
              </div>
              <div className="text-sm text-gray-500">情绪记录</div>
            </CardContent>
          </Card>
          <Card className="border-violet-200">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-violet-600 mb-1">118</div>
              <div className="text-sm text-gray-500">知识库页数</div>
            </CardContent>
          </Card>
          <Card className="border-teal-200">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-teal-600 mb-1">5</div>
              <div className="text-sm text-gray-500">核心模块</div>
            </CardContent>
          </Card>
        </div>

        {/* Module Grid */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-amber-500" />
          核心模块
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.href} href={module.href}>
                <Card className={`h-full ${module.borderColor} hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer`}>
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        {module.title}
                      </h3>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {module.description}
                    </p>
                    <Badge
                      variant="secondary"
                      className={`${module.bgColor} ${module.borderColor} border`}
                    >
                      {module.stats}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quote Section */}
        <Card className="mt-10 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="p-8 text-center">
            <blockquote className="text-xl text-gray-700 italic leading-relaxed mb-4">
              {"\u201C"}孩子们的行为是以自己认为真实的东西为基础，而不是以事实为基础。{"\u201D"}
            </blockquote>
            <cite className="text-amber-600 font-medium">
              —— 简·尼尔森《正面管教》
            </cite>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
