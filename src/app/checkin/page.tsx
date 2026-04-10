'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Sun, Moon, CloudSun, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useApp } from '@/lib/context';
import MainNav from '@/components/main-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckInRecord, CheckInTask } from '@/lib/types';

const periodConfig = {
  morning: {
    icon: Sun,
    title: '早晨',
    subtitle: '美好的一天从问候开始',
    gradient: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    timeRange: '6:00 - 12:00',
  },
  afternoon: {
    icon: CloudSun,
    title: '日间',
    subtitle: '陪伴是最好的教育',
    gradient: 'from-teal-400 to-emerald-500',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    timeRange: '12:00 - 18:00',
  },
  evening: {
    icon: Moon,
    title: '晚间',
    subtitle: '温馨的结束时光',
    gradient: 'from-violet-400 to-purple-500',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    timeRange: '18:00 - 22:00',
  },
};

export default function CheckInPage() {
  const { taskTemplates, todayCheckIns, saveCheckIn, activeChild } = useApp();
  const [records, setRecords] = useState<Record<string, CheckInRecord>>({});

  // 初始化今日记录
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const newRecords: Record<string, CheckInRecord> = {};

    ['morning', 'afternoon', 'evening'].forEach((period) => {
      const existingRecord = todayCheckIns.find((r) => r.period === period);
      if (existingRecord) {
        newRecords[period] = existingRecord;
      } else {
        const periodTasks = taskTemplates
          .filter((t) => t.period === period)
          .map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            completed: false,
          }));

        newRecords[period] = {
          id: `${today}-${period}`,
          date: today,
          period: period as 'morning' | 'afternoon' | 'evening',
          tasks: periodTasks,
        };
      }
    });

    setRecords(newRecords);
  }, [taskTemplates, todayCheckIns]);

  const toggleTask = (period: string, taskId: string) => {
    const record = records[period];
    if (!record) return;

    const updatedTasks = record.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            completed: !task.completed,
            completedAt: !task.completed ? new Date().toISOString() : undefined,
          }
        : task
    );

    const updatedRecord: CheckInRecord = {
      ...record,
      tasks: updatedTasks,
      completedAt: updatedTasks.every((t) => t.completed)
        ? new Date().toISOString()
        : undefined,
    };

    setRecords((prev) => ({ ...prev, [period]: updatedRecord }));
    saveCheckIn(updatedRecord);
  };

  const periodCompletion = (period: string) => {
    const record = records[period];
    if (!record) return { completed: 0, total: 0 };
    return {
      completed: record.tasks.filter((t) => t.completed).length,
      total: record.tasks.length,
    };
  };

  const overallProgress = () => {
    const totals = ['morning', 'afternoon', 'evening'].map((p) =>
      periodCompletion(p)
    );
    const completed = totals.reduce((sum, t) => sum + t.completed, 0);
    const total = totals.reduce((sum, t) => sum + t.total, 0);
    return { completed, total };
  };

  const { completed, total } = overallProgress();
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="min-h-screen">
      <MainNav />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">今日打卡</h1>
              <p className="text-gray-500">
                {activeChild
                  ? `为 ${activeChild.name} 定制的日常惯例表`
                  : '培养好习惯，从每日打卡开始'}
              </p>
            </div>
            <Badge className="bg-amber-100 text-amber-700">
              {format(new Date(), 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
            </Badge>
          </div>

          {/* Progress Bar */}
          <Card className="border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  今日进度
                </span>
                <span className="text-sm font-bold text-amber-600">
                  {completed}/{total} ({progressPercent}%)
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {progressPercent === 100 && (
                <p className="text-center text-sm text-amber-600 font-medium mt-2">
                  太棒了！今日任务全部完成！
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Period Cards */}
        <div className="space-y-6">
          {(['morning', 'afternoon', 'evening'] as const).map((period) => {
            const config = periodConfig[period];
            const Icon = config.icon;
            const record = records[period];
            const progress = periodCompletion(period);

            if (!record) return null;

            return (
              <Card
                key={period}
                className={`border ${config.borderColor} overflow-hidden`}
              >
                <CardHeader className={`${config.bgColor} border-b ${config.borderColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{config.title}</CardTitle>
                        <p className="text-sm text-gray-500">{config.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">
                        {progress.completed}/{progress.total}
                      </div>
                      <div className="text-xs text-gray-400">
                        {config.timeRange}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    {record.tasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={() => toggleTask(period, task.id)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tips */}
        <Card className="mt-8 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="p-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-xl">💡</span> 正面管教小贴士
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                使用惯例表代替唠叨和提醒，让孩子学会自主管理
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                当孩子完成任务时，关注努力而非结果
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                {'"'}你看起来很开心！坚持下来真不容易！{'"'} 这样的鼓励比{'"'}真棒{'"'}更有力量
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function TaskItem({
  task,
  onToggle,
}: {
  task: CheckInTask;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all group text-left"
    >
      <div className="flex-shrink-0 mt-0.5">
        {task.completed ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
        ) : (
          <Circle className="w-6 h-6 text-gray-300 group-hover:text-amber-400 transition-colors" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`font-medium ${
            task.completed ? 'text-gray-400 line-through' : 'text-gray-800'
          }`}
        >
          {task.title}
        </div>
        {task.description && (
          <div
            className={`text-sm mt-1 ${
              task.completed ? 'text-gray-300' : 'text-gray-500'
            }`}
          >
            {task.description}
          </div>
        )}
      </div>
    </button>
  );
}
