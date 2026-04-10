'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import MainNav from '@/components/main-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Users,
  Heart,
  Lightbulb,
  Vote,
  Gift,
  FileText,
  Plus,
  ChevronRight,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Calendar,
  Star,
  Trash2,
} from 'lucide-react';

interface AgendaItem {
  id: string;
  type: 'gratitude' | 'topic' | 'brainstorm' | 'decision' | 'activity' | 'note';
  title: string;
  description?: string;
  completed: boolean;
  votes?: Record<string, number>;
  decision?: string;
}

interface Meeting {
  id: string;
  date: string;
  title: string;
  participants: string[];
  agenda: AgendaItem[];
  summary?: string;
}

const defaultAgenda: AgendaItem[] = [
  { id: 'g1', type: 'gratitude', title: '致谢环节', description: '每人感谢一位家庭成员的具体帮助', completed: false },
  { id: 't1', type: 'topic', title: '讨论议题', description: '提出并讨论本周需要解决的问题', completed: false },
  { id: 'b1', type: 'brainstorm', title: '头脑风暴', description: '全家一起想解决方案，不批评任何想法', completed: false },
  { id: 'd1', type: 'decision', title: '共同决策', description: '选择大家都能接受的解决方案', completed: false },
  { id: 'a1', type: 'activity', title: '娱乐活动', description: '安排下周的家庭活动', completed: false },
  { id: 'n1', type: 'note', title: '会议记录', description: '记录决定和任务分配', completed: false },
];

const stepConfig = {
  gratitude: {
    icon: Heart,
    label: '致谢',
    gradient: 'from-pink-400 to-rose-500',
    bgGradient: 'bg-gradient-to-br from-pink-50 to-rose-50',
    title: '致谢环节',
    tip: '每人轮流感谢一位家庭成员的具体帮助。这能增进家庭成员之间的情感连接。',
  },
  topic: {
    icon: Lightbulb,
    label: '议题',
    gradient: 'from-amber-400 to-orange-500',
    bgGradient: 'bg-gradient-to-br from-amber-50 to-orange-50',
    title: '讨论议题',
    tip: '选择一个需要解决的问题。确保每个家庭成员都有发言的机会。',
  },
  brainstorm: {
    icon: Star,
    label: '头脑风暴',
    gradient: 'from-blue-400 to-indigo-500',
    bgGradient: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    title: '头脑风暴',
    tip: '所有想法都值得被记录，不要批评任何人的想法。数量比质量更重要！',
  },
  decision: {
    icon: Vote,
    label: '决策',
    gradient: 'from-violet-400 to-purple-500',
    bgGradient: 'bg-gradient-to-br from-violet-50 to-purple-50',
    title: '共同决策',
    tip: '使用"赞同"举手或打分的方式选择方案。确保每个人都支持这个决定。',
  },
  activity: {
    icon: Gift,
    label: '娱乐',
    gradient: 'from-teal-400 to-emerald-500',
    bgGradient: 'bg-gradient-to-br from-teal-50 to-emerald-50',
    title: '娱乐活动',
    tip: '安排下周的家庭活动，可以是游戏、出游或一起看电影。',
  },
  note: {
    icon: FileText,
    label: '记录',
    gradient: 'from-gray-400 to-slate-500',
    bgGradient: 'bg-gradient-to-br from-gray-50 to-slate-50',
    title: '会议记录',
    tip: '记录讨论结果、决定事项和任务分配，方便跟进执行。',
  },
};

export default function MeetingPage() {
  const { activeChild, meetings, addMeeting, deleteMeeting } = useApp();
  const [showNewMeeting, setShowNewMeeting] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    participants: '',
    agenda: defaultAgenda.map((a) => ({ ...a })),
    summary: '',
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [gratitudes, setGratitudes] = useState<Record<string, string>>({});
  const [topic, setTopic] = useState('');
  const [brainstorm, setBrainstorm] = useState<string[]>([]);
  const [newIdea, setNewIdea] = useState('');
  const [selectedDecision, setSelectedDecision] = useState('');
  const [activity, setActivity] = useState('');
  const [notes, setNotes] = useState('');

  if (!activeChild) {
    return (
      <div className="min-h-screen">
        <MainNav />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Card className="border-dashed border-2 border-rose-200">
            <CardContent className="py-16">
              <div className="text-6xl mb-4">👨‍👩‍👧</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                请先添加家庭成员
              </h2>
              <p className="text-gray-500 mb-6">
                家庭会议需要至少一位孩子参与
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

  const currentStepConfig = stepConfig[defaultAgenda[currentStep].type as keyof typeof stepConfig];

  const handleStartNewMeeting = () => {
    setNewMeeting({
      title: `${format(new Date(), 'MM月dd日')}家庭会议`,
      participants: `${activeChild.name}、爸爸、妈妈`,
      agenda: defaultAgenda.map((a) => ({ ...a })),
      summary: '',
    });
    setCurrentStep(0);
    setGratitudes({});
    setTopic('');
    setBrainstorm([]);
    setNewIdea('');
    setSelectedDecision('');
    setActivity('');
    setNotes('');
    setShowNewMeeting(true);
  };

  const handleSaveMeeting = () => {
    const meeting: Meeting = {
      id: Date.now().toString(),
      date: format(new Date(), 'yyyy-MM-dd'),
      title: newMeeting.title,
      participants: newMeeting.participants.split('、').filter(Boolean),
      agenda: [
        ...newMeeting.agenda.map((a, i) => {
          if (a.type === 'gratitude') {
            return { ...a, description: Object.entries(gratitudes).map(([k, v]) => `${k}: ${v}`).join('; ') };
          }
          if (a.type === 'topic') return { ...a, description: topic };
          if (a.type === 'brainstorm') return { ...a, description: brainstorm.join('; ') };
          if (a.type === 'decision') return { ...a, decision: selectedDecision };
          if (a.type === 'activity') return { ...a, description: activity };
          if (a.type === 'note') return { ...a, description: notes };
          return a;
        }),
      ],
      summary: notes || `本次会议讨论了"${topic}"，决定：${selectedDecision}，下周活动：${activity}`,
    };

    addMeeting(meeting);
    setShowNewMeeting(false);
  };

  const nextStep = () => {
    if (currentStep < defaultAgenda.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const meetingSteps = defaultAgenda.map((a) => stepConfig[a.type as keyof typeof stepConfig]);

  return (
    <div className="min-h-screen">
      <MainNav />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-200">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">家庭会议</h1>
              <p className="text-sm text-gray-500">
                参考《正面管教》第6章
              </p>
            </div>
          </div>
          <Dialog open={showNewMeeting} onOpenChange={setShowNewMeeting}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-200">
                <Plus className="w-4 h-4 mr-1" />
                发起会议
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-500" />
                  {newMeeting.title || '新家庭会议'}
                </DialogTitle>
              </DialogHeader>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">
                    步骤 {currentStep + 1}/{defaultAgenda.length}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {currentStepConfig.label}
                  </span>
                </div>
                <Progress value={((currentStep + 1) / defaultAgenda.length) * 100} className="h-2" />
                <div className="flex justify-between mt-2">
                  {meetingSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentStep(index)}
                        className={cn(
                          'flex flex-col items-center gap-1',
                          index === currentStep && 'scale-110'
                        )}
                      >
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                            index < currentStep
                              ? 'bg-green-500 text-white'
                              : index === currentStep
                              ? `bg-gradient-to-br ${step.gradient} text-white shadow-lg`
                              : 'bg-gray-100 text-gray-400'
                          )}
                        >
                          {index < currentStep ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Icon className="w-4 h-4" />
                          )}
                        </div>
                        <span className="text-xs text-gray-400">{step.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step Content */}
              <div className={cn('rounded-2xl p-6 mb-6', currentStepConfig.bgGradient)}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center', currentStepConfig.gradient)}>
                    {(() => {
                      const Icon = currentStepConfig.icon;
                      return <Icon className="w-5 h-5 text-white" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{currentStepConfig.title}</h3>
                  </div>
                </div>

                {/* Step-specific content */}
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">{currentStepConfig.tip}</p>
                    {['爸爸', '妈妈', activeChild.name].map((person) => (
                      <div key={person}>
                        <Label className="text-gray-700 mb-2 block">{person}的致谢</Label>
                        <Input
                          value={gratitudes[person] || ''}
                          onChange={(e) =>
                            setGratitudes({ ...gratitudes, [person]: e.target.value })
                          }
                          placeholder={`感谢${person === activeChild.name ? '爸爸/妈妈' : person}的...`}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">{currentStepConfig.tip}</p>
                    <div>
                      <Label className="text-gray-700 mb-2 block">本周议题</Label>
                      <Textarea
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="描述需要解决的问题，例如：哥哥总是抢弟弟的玩具..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">{currentStepConfig.tip}</p>
                    <div className="flex gap-2">
                      <Input
                        value={newIdea}
                        onChange={(e) => setNewIdea(e.target.value)}
                        placeholder="写下你的想法..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newIdea.trim()) {
                            setBrainstorm([...brainstorm, newIdea.trim()]);
                            setNewIdea('');
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          if (newIdea.trim()) {
                            setBrainstorm([...brainstorm, newIdea.trim()]);
                            setNewIdea('');
                          }
                        }}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {brainstorm.map((idea, i) => (
                        <Badge key={i} variant="outline" className="px-3 py-1.5 bg-white">
                          {idea}
                        </Badge>
                      ))}
                      {brainstorm.length === 0 && (
                        <span className="text-sm text-gray-400">等待想法...</span>
                      )}
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">{currentStepConfig.tip}</p>
                    <div className="space-y-2">
                      {brainstorm.map((idea, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedDecision(idea)}
                          className={cn(
                            'w-full p-4 rounded-xl text-left transition-all',
                            selectedDecision === idea
                              ? 'bg-gradient-to-r from-violet-100 to-purple-100 border-2 border-violet-300'
                              : 'bg-white border border-gray-200 hover:border-violet-200'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {selectedDecision === idea ? (
                              <CheckCircle2 className="w-5 h-5 text-violet-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300" />
                            )}
                            <span className="font-medium text-gray-700">{idea}</span>
                          </div>
                        </button>
                      ))}
                      {brainstorm.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                          <Lightbulb className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>请先在头脑风暴环节收集想法</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">{currentStepConfig.tip}</p>
                    <div>
                      <Label className="text-gray-700 mb-2 block">下周家庭活动</Label>
                      <Textarea
                        value={activity}
                        onChange={(e) => setActivity(e.target.value)}
                        placeholder="安排下周想一起做的活动，例如：周六下午去公园野餐..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">{currentStepConfig.tip}</p>
                    <div>
                      <Label className="text-gray-700 mb-2 block">会议记录</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="记录讨论要点、决定和任务分配..."
                        rows={5}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  上一步
                </Button>
                {currentStep < defaultAgenda.length - 1 ? (
                  <Button
                    onClick={nextStep}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500"
                  >
                    下一步
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSaveMeeting}
                    className="bg-gradient-to-r from-green-500 to-emerald-500"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    完成会议
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-cyan-100 bg-gradient-to-br from-cyan-50 to-blue-50">
            <CardContent className="p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto mb-2 shadow-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800">{meetings.length}</div>
              <div className="text-xs text-gray-500">历史会议</div>
            </CardContent>
          </Card>

          <Card className="border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50">
            <CardContent className="p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center mx-auto mb-2 shadow-lg">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {meetings.filter((m) => m.agenda.some((a) => a.decision)).length}
              </div>
              <div className="text-xs text-gray-500">已解决问题</div>
            </CardContent>
          </Card>

          <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-2 shadow-lg">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {meetings.filter((m) => m.agenda.some((a) => a.type === 'gratitude' && a.description?.length > 10)).length}
              </div>
              <div className="text-xs text-gray-500">温馨时刻</div>
            </CardContent>
          </Card>
        </div>

        {/* Meeting Guide */}
        <Card className="mb-8 border-0 bg-gradient-to-r from-violet-50 via-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-violet-500" />
              家庭会议六步法
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {meetingSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-white/80 text-center"
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center mx-auto mb-2',
                        step.gradient
                      )}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="font-medium text-gray-800 text-sm">
                      {step.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {index + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* History */}
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          历史会议
        </h2>

        {meetings.length > 0 ? (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <Card key={meeting.id} className="border-gray-100 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">{meeting.title}</h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(meeting.date), 'yyyy年MM月dd日')} ·{' '}
                        {meeting.participants.join('、')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMeeting(meeting.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {meeting.agenda.map((item, i) => {
                      const config = stepConfig[item.type as keyof typeof stepConfig];
                      const Icon = config.icon;
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs',
                            item.decision || (item.description && item.type === 'gratitude')
                              ? 'bg-green-50 text-green-600'
                              : 'bg-gray-50 text-gray-500'
                          )}
                        >
                          {item.decision || (item.description && item.type === 'gratitude') ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Circle className="w-3 h-3" />
                          )}
                          <span>{config.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {meeting.summary && (
                    <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      {meeting.summary}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                还没有家庭会议记录
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                点击右上角发起第一次家庭会议
              </p>
              <Button
                onClick={handleStartNewMeeting}
                className="bg-gradient-to-r from-cyan-500 to-blue-500"
              >
                <Plus className="w-4 h-4 mr-1" />
                发起会议
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
