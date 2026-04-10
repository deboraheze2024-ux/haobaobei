'use client';

import Link from 'next/link';
import {
  CalendarCheck,
  Target,
  UserCircle,
  MessageCircle,
  BookOpen,
  Users,
  Sparkles,
  TrendingUp,
  Heart,
  Clock,
  ArrowRight,
  Star,
  Smile,
} from 'lucide-react';
import { useApp } from '@/lib/context';
import MainNav from '@/components/main-nav';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const modules = [
  {
    href: '/checkin',
    icon: CalendarCheck,
    title: '今日打卡',
    description: '早晨、日间、晚间三段核心行动',
    gradient: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    stats: '日常惯例',
    tagColor: 'text-amber-600 bg-amber-100',
  },
  {
    href: '/goals',
    icon: Target,
    title: '成长目标',
    description: 'AI智能拆解目标节点，进度追踪',
    gradient: 'from-violet-400 to-purple-500',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    stats: '目标管理',
    tagColor: 'text-violet-600 bg-violet-100',
  },
  {
    href: '/profile',
    icon: UserCircle,
    title: '成长档案',
    description: '追踪情绪变化和行为模式',
    gradient: 'from-pink-400 to-rose-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    stats: '数据分析',
    tagColor: 'text-pink-600 bg-pink-100',
  },
  {
    href: '/chat',
    icon: MessageCircle,
    title: 'AI 问答助手',
    description: '基于正面管教书籍的智能问答',
    gradient: 'from-blue-400 to-indigo-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    stats: 'RAG 知识库',
    tagColor: 'text-blue-600 bg-blue-100',
  },
  {
    href: '/phrases',
    icon: BookOpen,
    title: '话术速查库',
    description: '按场景整理的实用话术卡片',
    gradient: 'from-teal-400 to-emerald-500',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    stats: '30+ 话术',
    tagColor: 'text-teal-600 bg-teal-100',
  },
  {
    href: '/meeting',
    icon: Users,
    title: '家庭会议',
    description: '完整会议流程与记录归档',
    gradient: 'from-cyan-400 to-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    stats: '团队协作',
    tagColor: 'text-cyan-600 bg-cyan-100',
  },
];

export default function HomePage() {
  const { activeChild, recentEmotions, todayCheckIns, activeGoals } = useApp();

  // 统计数据
  const todayCompletedTasks = todayCheckIns.reduce(
    (sum, checkin) => sum + checkin.tasks.filter((t) => t.completed).length,
    0
  );
  const todayTotalTasks = todayCheckIns.reduce(
    (sum, checkin) => sum + checkin.tasks.length,
    0
  );
  const todayProgress = todayTotalTasks > 0 ? Math.round((todayCompletedTasks / todayTotalTasks) * 100) : 0;

  // 目标进度
  const goalsProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length)
    : 0;

  // 近7天情绪统计
  const emotionCounts = recentEmotions.reduce(
    (acc, e) => {
      acc[e.emotion] = (acc[e.emotion] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="min-h-screen">
      <MainNav />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative mb-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-pink-50 to-violet-100 rounded-3xl" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-200/40 to-violet-200/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-amber-200/40 to-rose-200/40 rounded-full blur-3xl" />
          
          <div className="relative p-8 md:p-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-white/80 text-pink-600 backdrop-blur-sm border border-pink-200 shadow-sm">
                    <Sparkles className="w-3 h-3 mr-1" />
                    正面管教助手
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
                  陪伴成长，
                  <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                    从心开始
                  </span>
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed max-w-xl">
                  基于《正面管教》理念，为您和您的孩子提供个性化的成长陪伴方案。
                  让每一个日常时刻都成为培养责任感、归属感和能力的契机。
                </p>
              </div>

              {/* Child Card */}
              {activeChild ? (
                <Card className="w-full lg:w-80 border-rose-200 bg-white/80 backdrop-blur-sm shadow-xl shadow-rose-100/50">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-14 h-14 border-3 border-rose-200 shadow-lg">
                        <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-500 text-white text-xl font-bold">
                          {activeChild.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-lg text-gray-800">
                          {activeChild.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {activeChild.currentStage}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-rose-400" />
                        <span>{format(new Date(), 'EEEE', { locale: zhCN })}</span>
                        <span className="text-gray-300">·</span>
                        <span>{format(new Date(), 'MM月dd日')}</span>
                      </div>
                      {topEmotion && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Smile className="w-4 h-4 text-amber-400" />
                          <span>近期情绪：{topEmotion[0]}</span>
                        </div>
                      )}
                      {activeChild.personality && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Star className="w-4 h-4 text-violet-400" />
                          <span>{activeChild.personality}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="w-full lg:w-80 border-dashed border-2 border-rose-200 bg-white/50">
                  <CardContent className="p-8 text-center">
                    <Heart className="w-12 h-12 text-rose-300 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-700 mb-2">添加陪伴对象</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      开始记录孩子的成长旅程
                    </p>
                    <Link href="/settings">
                      <Button className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600">
                        <ArrowRight className="w-4 h-4 mr-1" />
                        前往设置
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-lg transition-shadow">
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-200">
                <CalendarCheck className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {todayCompletedTasks}/{todayTotalTasks || 9}
              </div>
              <div className="text-sm text-gray-500 mb-2">今日打卡</div>
              <Progress value={todayProgress} className="h-1.5" />
            </CardContent>
          </Card>
          
          <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 hover:shadow-lg transition-shadow">
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-violet-200">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {goalsProgress}%
              </div>
              <div className="text-sm text-gray-500 mb-2">目标进度</div>
              <Progress value={goalsProgress} className="h-1.5" />
            </CardContent>
          </Card>
          
          <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 hover:shadow-lg transition-shadow">
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-pink-200">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {recentEmotions.length}
              </div>
              <div className="text-sm text-gray-500 mb-2">情绪记录</div>
              <Progress value={Math.min(recentEmotions.length * 10, 100)} className="h-1.5" />
            </CardContent>
          </Card>
          
          <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50 hover:shadow-lg transition-shadow">
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-teal-200">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">50+</div>
              <div className="text-sm text-gray-500 mb-2">知识条目</div>
              <Progress value={100} className="h-1.5" />
            </CardContent>
          </Card>
        </div>

        {/* Module Grid */}
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-pink-500" />
          <h2 className="text-xl font-bold text-gray-800">核心模块</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.href} href={module.href} className="group">
                <Card className={`h-full ${module.borderColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden`}>
                  <div className={`h-1.5 bg-gradient-to-r ${module.gradient}`} />
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${module.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-gray-900">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {module.description}
                    </p>
                    <Badge className={module.tagColor}>
                      {module.stats}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quote Section */}
        <Card className="mt-12 border-0 bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full blur-2xl" />
          <CardContent className="p-10 text-center relative">
            <div className="text-5xl text-amber-200 mb-4">&ldquo;</div>
            <blockquote className="text-xl md:text-2xl text-gray-700 italic leading-relaxed mb-4 max-w-2xl mx-auto">
              孩子们的行为是以自己认为真实的东西为基础，而不是以事实为基础。
            </blockquote>
            <cite className="text-pink-500 font-medium">
              —— 简·尼尔森《正面管教》
            </cite>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-400">
          <p>用爱与尊重陪伴孩子成长</p>
        </div>
      </main>
    </div>
  );
}
