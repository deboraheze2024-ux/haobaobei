'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import MainNav from '@/components/main-nav';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  Sunrise,
  Sun,
  Moon,
  CheckCircle2,
  Circle,
  Sparkles,
  TrendingUp,
  Calendar,
  ArrowRight,
  Target,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  isGoalTask?: boolean;
  goalTitle?: string;
}

interface CheckIn {
  id: string;
  date: string;
  period: 'morning' | 'afternoon' | 'evening';
  tasks: Task[];
  note?: string;
}

const defaultCheckIns: Omit<CheckIn, 'id' | 'date'>[] = [
  {
    period: 'morning',
    tasks: [
      { id: 'm1', title: '起床问候', description: '用正面的方式叫醒孩子', completed: false },
      { id: 'm2', title: '整理床铺', description: '培养整洁习惯', completed: false },
      { id: 'm3', title: '早餐时光', description: '愉快地一起用餐', completed: false },
    ],
  },
  {
    period: 'afternoon',
    tasks: [
      { id: 'a1', title: '放学后倾听', description: '询问今天开心的事', completed: false },
      { id: 'a2', title: '作业时间', description: '温和地陪伴完成', completed: false },
      { id: 'a3', title: '自由活动', description: '给予放松时间', completed: false },
    ],
  },
  {
    period: 'evening',
    tasks: [
      { id: 'e1', title: '晚餐时光', description: '全家一起用餐', completed: false },
      { id: 'e2', title: '家庭互动', description: '游戏或阅读时间', completed: false },
      { id: 'e3', title: '睡前分享', description: '今天最开心/困难的事', completed: false },
    ],
  },
];

const periodConfig = {
  morning: {
    icon: Sunrise,
    label: '早晨',
    gradient: 'from-amber-400 to-orange-500',
    bgGradient: 'bg-gradient-to-br from-amber-50 to-orange-50',
    borderColor: 'border-amber-200',
  },
  afternoon: {
    icon: Sun,
    label: '日间',
    gradient: 'from-blue-400 to-indigo-500',
    bgGradient: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    borderColor: 'border-blue-200',
  },
  evening: {
    icon: Moon,
    label: '晚间',
    gradient: 'from-violet-400 to-purple-500',
    bgGradient: 'bg-gradient-to-br from-violet-50 to-purple-50',
    borderColor: 'border-violet-200',
  },
};

export default function CheckInPage() {
  const { activeChild, todayCheckIns, saveCheckIn, growthGoals } = useApp();
  const [activeTab, setActiveTab] = useState<string>('morning');
  const today = format(new Date(), 'yyyy-MM-dd');

  // 获取目标关联的任务
  const getGoalTasksForPeriod = (period: 'morning' | 'afternoon' | 'evening') => {
    const goalTasks: Task[] = [];
    growthGoals.forEach((goal) => {
      goal.nodes.forEach((node) => {
        if (node.linkedCheckIn && node.checkInPeriod === period) {
          // 检查今天是否已完成此任务
          const checkIn = todayCheckIns.find((c) => c.period === period);
          const existingTask = checkIn?.tasks.find((t) => t.id === `checkin-goal-${node.id}`);
          
          goalTasks.push({
            id: `checkin-goal-${node.id}`,
            title: node.title,
            description: `目标: ${goal.title}`,
            completed: existingTask?.completed || false,
            isGoalTask: true,
            goalTitle: goal.title,
          });
        }
      });
    });
    return goalTasks;
  };

  const getCheckInForPeriod = (period: string) => {
    const checkIn = todayCheckIns.find((c) => c.period === period);
    const defaultTasks = defaultCheckIns.find((d) => d.period === period)!.tasks.map((t) => ({
      ...t,
      completed: false,
    }));
    // 合并目标任务和默认任务
    const goalTasks = getGoalTasksForPeriod(period as 'morning' | 'afternoon' | 'evening');
    const existingGoalTaskIds = goalTasks.map((t) => t.id);
    
    // 过滤掉已有的目标任务，只保留新添加的
    const filteredDefaultTasks = defaultTasks.filter((t) => !existingGoalTaskIds.includes(t.id));
    
    return (
      checkIn || {
        period,
        tasks: [...filteredDefaultTasks, ...goalTasks],
      }
    );
  };

  const toggleTask = (period: string, taskId: string) => {
    const existingCheckIn = todayCheckIns.find((c) => c.period === period);
    const checkIn = getCheckInForPeriod(period);
    const updatedTasks = checkIn.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );

    const newCheckIn: CheckIn = {
      id: existingCheckIn?.id || `${today}-${period}`,
      date: today,
      period: period as 'morning' | 'afternoon' | 'evening',
      tasks: updatedTasks,
    };

    saveCheckIn(newCheckIn);
  };

  const getPeriodProgress = (period: string) => {
    const checkIn = getCheckInForPeriod(period);
    const completed = checkIn.tasks.filter((t) => t.completed).length;
    const total = checkIn.tasks.length || 1;
    return Math.round((completed / total) * 100);
  };

  const getOverallProgress = () => {
    let completed = 0;
    let total = 0;
    ['morning', 'afternoon', 'evening'].forEach((period) => {
      const checkIn = getCheckInForPeriod(period);
      completed += checkIn.tasks.filter((t) => t.completed).length;
      total += checkIn.tasks.length;
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

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
                在开始打卡之前，需要先在设置中添加孩子信息
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

  const overallProgress = getOverallProgress();

  return (
    <div className="min-h-screen">
      <MainNav />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">今日打卡</h1>
              <p className="text-sm text-gray-500">
                {format(new Date(), 'EEEE', { locale: zhCN })} · {format(new Date(), 'MM月dd日')}
              </p>
            </div>
          </div>

          {/* Overall Progress */}
          <Card className="mt-6 border-0 bg-gradient-to-r from-pink-50 via-rose-50 to-violet-50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800">今日完成度</h3>
                  <p className="text-sm text-gray-500">培养日常好习惯</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                    {overallProgress}%
                  </span>
                </div>
              </div>
              <Progress value={overallProgress} className="h-3" />
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>早晨</span>
                <span>日间</span>
                <span>晚间</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-gray-100 p-1 rounded-2xl mb-6">
            {(['morning', 'afternoon', 'evening'] as const).map((period) => {
              const config = periodConfig[period];
              const Icon = config.icon;
              const progress = getPeriodProgress(period);
              return (
                <TabsTrigger
                  key={period}
                  value={period}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all',
                    activeTab === period
                      ? 'bg-white shadow-sm text-gray-800'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{config.label}</span>
                  {progress === 100 ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">
                      {progress}%
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {(['morning', 'afternoon', 'evening'] as const).map((period) => {
            const config = periodConfig[period];
            const checkIn = getCheckInForPeriod(period);
            const Icon = config.icon;

            return (
              <TabsContent key={period} value={period}>
                <div className={cn('rounded-3xl p-6 mb-6', config.bgGradient)}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg', config.gradient)}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{config.label}时光</h2>
                      <p className="text-sm text-gray-500">
                        {period === 'morning' && '美好的一天从早晨开始'}
                        {period === 'afternoon' && '日间陪伴与学习'}
                        {period === 'evening' && '温馨的晚间相处'}
                      </p>
                    </div>
                    <Badge className="ml-auto bg-white/80 text-gray-600 backdrop-blur-sm border-0">
                      {checkIn.tasks.filter((t) => t.completed).length}/{checkIn.tasks.length}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {checkIn.tasks.map((task) => (
                      <Card
                        key={task.id}
                        className={cn(
                          'border transition-all duration-200 cursor-pointer hover:shadow-md',
                          task.completed
                            ? 'border-green-200 bg-green-50/50'
                            : task.isGoalTask
                            ? 'border-violet-200 bg-gradient-to-r from-violet-50/50 to-purple-50/50'
                            : config.borderColor,
                          'hover:-translate-y-0.5'
                        )}
                        onClick={() => toggleTask(period, task.id)}
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                              task.completed
                                ? 'bg-green-500 text-white'
                                : task.isGoalTask
                                ? 'bg-gradient-to-br from-violet-400 to-purple-500 text-white'
                                : 'bg-gray-100 text-gray-400'
                            )}
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4
                                className={cn(
                                  'font-medium',
                                  task.completed
                                    ? 'text-gray-400 line-through'
                                    : 'text-gray-800'
                                )}
                              >
                                {task.title}
                              </h4>
                              {task.isGoalTask && (
                                <Badge variant="outline" className="text-xs border-violet-200 text-violet-600 bg-violet-50/50">
                                  <Target className="w-3 h-3 mr-1" />
                                  目标任务
                                </Badge>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-500">
                                {task.description}
                              </p>
                            )}
                            {task.goalTitle && (
                              <p className="text-xs text-violet-500 mt-0.5">
                                来自: {task.goalTitle}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs',
                              task.completed
                                ? 'border-green-200 text-green-600 bg-green-50'
                                : task.isGoalTask
                                ? 'border-violet-200 text-violet-600 bg-violet-50'
                                : 'border-gray-200 text-gray-400'
                            )}
                          >
                            {task.completed ? '已完成' : '待完成'}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Goal tasks indicator */}
                  {getGoalTasksForPeriod(period as 'morning' | 'afternoon' | 'evening').length > 0 && (
                    <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100">
                      <div className="flex items-center gap-2 text-sm text-violet-700">
                        <Target className="w-4 h-4" />
                        <span>今日有 {getGoalTasksForPeriod(period as 'morning' | 'afternoon' | 'evening').filter(t => !t.completed).length} 个成长目标任务待完成</span>
                        <a href="/goals" className="ml-auto text-xs underline">查看目标 →</a>
                      </div>
                    </div>
                  )}

                  {checkIn.tasks.every((t) => t.completed) && (
                    <Card className="mt-6 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                      <CardContent className="p-6 text-center">
                        <div className="text-5xl mb-3">🎉</div>
                        <h3 className="text-lg font-bold text-green-700 mb-1">
                          太棒了！
                        </h3>
                        <p className="text-sm text-green-600">
                          你已完成今日{config.label}的所有任务
                        </p>
                        <Sparkles className="w-5 h-5 text-amber-400 mx-auto mt-2 animate-pulse" />
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Positive Parenting Tip */}
                <Card className="border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-violet-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">
                          正面管教提示
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {period === 'morning' &&
                            '早晨的互动方式会影响孩子一整天的情绪状态。尝试用微笑和拥抱开始新的一天，避免批评和催促。'}
                          {period === 'afternoon' &&
                            '放学后的倾听比提问更重要。让孩子先分享他想说的，再询问具体细节，这能帮助孩子感到被理解和尊重。'}
                          {period === 'evening' &&
                            '睡前的"特别时光"是建立亲密关系的黄金时间。可以分享"今天最开心/最困难的事"，帮助孩子学会表达情绪。'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <Card className="border-0 bg-gradient-to-br from-pink-50 to-rose-50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-200">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {todayCheckIns.length}
                </div>
                <div className="text-sm text-gray-500">累计打卡天数</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {Math.max(0, 7 - todayCheckIns.length)}
                </div>
                <div className="text-sm text-gray-500">本周剩余天数</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
