'use client';

import { useState } from 'react';
import {
  Plus,
  Calendar,
  Users,
  Heart,
  Lightbulb,
  CheckCircle2,
  PartyPopper,
  ChevronRight,
  Clock,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '@/lib/context';
import MainNav from '@/components/main-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import {
  FamilyMeeting,
  BrainstormItem,
  Decision,
} from '@/lib/types';

// 生成唯一ID的辅助函数（在组件外部定义以避免 purity 警告）
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const meetingSteps = [
  { icon: Heart, title: '致谢', description: '每人说出对其他家庭成员的感谢' },
  { icon: Lightbulb, title: '议题讨论', description: '讨论议程上的议题' },
  { icon: Sparkles, title: '头脑风暴', description: '收集解决方案' },
  { icon: CheckCircle2, title: '做决定', description: '选择最佳方案' },
  { icon: PartyPopper, title: '娱乐时光', description: '以有趣的活动结束' },
];

export default function MeetingPage() {
  const { familyMeetings, saveMeeting, activeChild } = useApp();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState<FamilyMeeting | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // 新会议表单
  const [newMeeting, setNewMeeting] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    attendees: [] as string[],
    topics: '' as string,
  });

  // 头脑风暴输入
  const [brainstormInput, setBrainstormInput] = useState('');

  // 创建新会议
  const handleCreateMeeting = () => {
    const topics = newMeeting.topics
      .split('\n')
      .filter((t) => t.trim())
      .map((topic, i) => ({
        id: `agenda-${Date.now()}-${i}`,
        topic: topic.trim(),
        proposer: activeChild?.name || '家长',
        status: 'pending' as const,
      }));

    const meeting: FamilyMeeting = {
      id: `meeting-${Date.now()}`,
      date: newMeeting.date,
      status: 'planned',
      attendees: [activeChild?.name || '家长', '父母'].concat(newMeeting.attendees),
      agenda: topics,
      gratitudeList: [],
      brainstorms: [],
      decisions: [],
      funPlan: '',
      createdAt: new Date().toISOString(),
    };

    saveMeeting(meeting);
    setCurrentMeeting(meeting);
    setCurrentStep(0);
    setIsCreateOpen(false);
    setNewMeeting({ date: format(new Date(), 'yyyy-MM-dd'), attendees: [], topics: '' });
  };

  // 开始会议
  const handleStartMeeting = () => {
    if (!currentMeeting) return;
    setCurrentMeeting({ ...currentMeeting, status: 'in_progress' });
    saveMeeting(currentMeeting);
  };

  // 添加致谢
  const [gratitudeInput, setGratitudeInput] = useState('');
  const handleAddGratitude = () => {
    if (!currentMeeting || !gratitudeInput.trim()) return;
    setCurrentMeeting({
      ...currentMeeting,
      gratitudeList: [...currentMeeting.gratitudeList, gratitudeInput.trim()],
    });
    setGratitudeInput('');
  };

  // 添加头脑风暴
  const handleAddBrainstorm = () => {
    if (!currentMeeting || !brainstormInput.trim()) return;
    const currentAgenda = currentMeeting.agenda[currentStep - 1];
    if (!currentAgenda) return;

    const item: BrainstormItem = {
      id: `brainstorm-${Date.now()}`,
      agendaId: currentAgenda.id,
      suggestion: brainstormInput.trim(),
      proposer: activeChild?.name || '家长',
    };

    setCurrentMeeting({
      ...currentMeeting,
      brainstorms: [...currentMeeting.brainstorms, item],
    });
    setBrainstormInput('');
  };

  // 做决定
  const handleMakeDecision = (agendaId: string, suggestion: string) => {
    if (!currentMeeting) return;
    const decision: Decision = {
      id: generateId('decision'),
      agendaId,
      content: suggestion,
      agreedBy: currentMeeting.attendees,
    };

    const updatedAgenda = currentMeeting.agenda.map((a) =>
      a.id === agendaId ? { ...a, status: 'decided' as const, result: suggestion } : a
    );

    setCurrentMeeting({
      ...currentMeeting,
      agenda: updatedAgenda,
      decisions: [...currentMeeting.decisions, decision],
    });
  };

  // 完成会议
  const handleFinishMeeting = () => {
    if (!currentMeeting) return;
    const finished: FamilyMeeting = {
      ...currentMeeting,
      status: 'completed',
    };
    saveMeeting(finished);
    setCurrentMeeting(null);
    setCurrentStep(0);
  };

  // 删除会议
  const handleDeleteMeeting = (id: string) => {
    const meeting = familyMeetings.find((m) => m.id === id);
    if (!meeting) return;
    saveMeeting({ ...meeting, status: 'cancelled' });
  };

  const upcomingMeetings = familyMeetings.filter(
    (m) => m.status === 'planned' || m.status === 'in_progress'
  );
  const completedMeetings = familyMeetings.filter((m) => m.status === 'completed');

  // 会议进行中视图
  if (currentMeeting && currentMeeting.status === 'in_progress') {
    return (
      <div className="min-h-screen">
        <MainNav />
        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-800">家庭会议进行中</h1>
              <Badge className="bg-blue-100 text-blue-700">
                <Clock className="w-3 h-3 mr-1" />
                {format(new Date(currentMeeting.date), 'MM月dd日')}
              </Badge>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {meetingSteps.map((step, i) => {
                const Icon = step.icon;
                const isActive = currentStep === i;
                const isCompleted = currentStep > i;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-blue-500 text-white'
                        : isCompleted
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{step.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const Icon = meetingSteps[currentStep].icon;
                  return <Icon className="w-5 h-5 text-blue-500" />;
                })()}
                {meetingSteps[currentStep].title}
              </CardTitle>
              <p className="text-sm text-gray-500">
                {meetingSteps[currentStep].description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 步骤 0: 致谢 */}
              {currentStep === 0 && (
                <>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <Lightbulb className="w-4 h-4 inline mr-1" />
                      轮流发言，每人说出对其他家庭成员的感谢。格式：{"\u201C"}我想感谢___，因为___。{"\u201D"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="我想感谢...因为..."
                      value={gratitudeInput}
                      onChange={(e) => setGratitudeInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddGratitude()}
                    />
                    <Button onClick={handleAddGratitude}>添加</Button>
                  </div>
                  <div className="space-y-2">
                    {currentMeeting.gratitudeList.map((g, i) => (
                      <div
                        key={i}
                        className="p-3 bg-rose-50 rounded-lg border border-rose-200 flex items-center gap-2"
                      >
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>{g}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* 步骤 1-3: 议题讨论 */}
              {currentStep >= 1 && currentStep <= 3 && (
                <>
                  <div className="space-y-4">
                    {currentMeeting.agenda.map((agenda, i) => (
                      <div
                        key={agenda.id}
                        className={`p-4 rounded-lg border ${
                          agenda.status === 'decided'
                            ? 'bg-emerald-50 border-emerald-200'
                            : currentStep - 1 === i
                              ? 'bg-blue-50 border-blue-300'
                              : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{i + 1}</Badge>
                            <span className="font-medium">{agenda.topic}</span>
                          </div>
                          {agenda.status === 'decided' && (
                            <Badge className="bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              已决定
                            </Badge>
                          )}
                        </div>

                        {/* 头脑风暴 */}
                        {currentStep === 2 && agenda.status !== 'decided' && currentStep - 1 === i && (
                          <>
                            <div className="p-3 bg-amber-50 rounded-lg mb-3">
                              <p className="text-xs text-amber-700">
                                头脑风暴规则：不批评、越多越好、疯狂的想法也可以！
                              </p>
                            </div>
                            <div className="flex gap-2 mb-3">
                              <Input
                                placeholder="提出你的建议..."
                                value={brainstormInput}
                                onChange={(e) => setBrainstormInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddBrainstorm()}
                              />
                              <Button onClick={handleAddBrainstorm}>添加</Button>
                            </div>
                            <div className="space-y-2">
                              {currentMeeting.brainstorms
                                .filter((b) => b.agendaId === agenda.id)
                                .map((item) => (
                                  <div
                                    key={item.id}
                                    className="p-2 bg-white rounded border flex items-center justify-between"
                                  >
                                    <span>{item.suggestion}</span>
                                    <span className="text-xs text-gray-400">
                                      by {item.proposer}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </>
                        )}

                        {/* 做决定 */}
                        {currentStep === 3 && agenda.status !== 'decided' && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {currentMeeting.brainstorms
                              .filter((b) => b.agendaId === agenda.id)
                              .map((item) => (
                                <Button
                                  key={item.id}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleMakeDecision(agenda.id, item.suggestion)}
                                  className="border-emerald-300 hover:bg-emerald-50"
                                >
                                  选这个: {item.suggestion}
                                </Button>
                              ))}
                          </div>
                        )}

                        {agenda.status === 'decided' && agenda.result && (
                          <p className="text-sm text-emerald-700 mt-2">
                            <CheckCircle2 className="w-3 h-3 inline mr-1" />
                            决定: {agenda.result}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* 步骤 4: 娱乐时光 */}
              {currentStep === 4 && (
                <>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      会议以有趣的活动结束！家庭投票选择一个娱乐活动。
                    </p>
                  </div>
                  <Textarea
                    placeholder="计划一个娱乐活动..."
                    value={currentMeeting.funPlan || ''}
                    onChange={(e) =>
                      setCurrentMeeting({ ...currentMeeting, funPlan: e.target.value })
                    }
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-gray-500">
                    示例：一起玩桌游、户外散步、看电影等
                  </p>
                </>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                >
                  上一步
                </Button>
                {currentStep < 4 ? (
                  <Button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={
                      (currentStep === 0 && currentMeeting.gratitudeList.length === 0) ||
                      (currentStep === 3 && !currentMeeting.agenda.every((a) => a.status === 'decided'))
                    }
                  >
                    下一步
                  </Button>
                ) : (
                  <Button onClick={handleFinishMeeting} className="bg-emerald-500 hover:bg-emerald-600">
                    完成会议
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // 默认视图
  return (
    <div className="min-h-screen">
      <MainNav />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">家庭会议</h1>
              <p className="text-gray-500">
                实现《正面管教》第6章的完整会议流程
              </p>
            </div>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Plus className="w-4 h-4 mr-1" />
                安排会议
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>安排新家庭会议</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">日期</label>
                  <Input
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) =>
                      setNewMeeting((m) => ({ ...m, date: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    参会人员
                  </label>
                  <Select
                    value={newMeeting.attendees[0] || ''}
                    onValueChange={(v) =>
                      setNewMeeting((m) => ({ ...m, attendees: [v] }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择参会人员" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="全家">全家</SelectItem>
                      <SelectItem value="父母+孩子">父母+孩子</SelectItem>
                      <SelectItem value="父母">仅父母</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    议题（每行一个）
                  </label>
                  <Textarea
                    placeholder="孩子的作业时间&#10;周末活动安排&#10;零花钱问题"
                    value={newMeeting.topics}
                    onChange={(e) =>
                      setNewMeeting((m) => ({ ...m, topics: e.target.value }))
                    }
                    className="min-h-[120px]"
                  />
                </div>
                <Button
                  onClick={handleCreateMeeting}
                  disabled={!newMeeting.topics.trim()}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  创建会议
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Meeting Flow Guide */}
        <Card className="border-blue-200 mb-8 bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              家庭会议流程
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {meetingSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="text-center">
                    <div className="w-12 h-12 rounded-full bg-white border-2 border-blue-300 flex items-center justify-center mx-auto mb-2">
                      <Icon className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="font-medium text-gray-800">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Meetings */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            即将进行 ({upcomingMeetings.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingMeetings.length === 0 ? (
              <Card className="border-gray-200 col-span-2">
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    暂无安排的家庭会议
                  </h3>
                  <p className="text-gray-400">
                    点击右上角按钮安排一次家庭会议
                  </p>
                </CardContent>
              </Card>
            ) : (
              upcomingMeetings.map((meeting) => (
                <Card
                  key={meeting.id}
                  className={`border ${meeting.status === 'in_progress' ? 'border-blue-300 bg-blue-50' : 'border-blue-200'}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={meeting.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-100 text-gray-600'}>
                          {meeting.status === 'in_progress' ? '进行中' : format(new Date(meeting.date), 'MM月dd日')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {meeting.status === 'planned' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setCurrentMeeting(meeting);
                              handleStartMeeting();
                            }}
                          >
                            开始
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMeeting(meeting.id)}
                        >
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {meeting.agenda.slice(0, 3).map((agenda) => (
                        <div
                          key={agenda.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <ChevronRight className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-600">{agenda.topic}</span>
                        </div>
                      ))}
                      {meeting.agenda.length > 3 && (
                        <p className="text-xs text-gray-400">
                          还有 {meeting.agenda.length - 3} 个议题...
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {meeting.attendees.join(', ')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Completed Meetings */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            历史会议 ({completedMeetings.length})
          </h2>
          <div className="space-y-3">
            {completedMeetings.slice(-5).reverse().map((meeting) => (
              <Card key={meeting.id} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        已完成
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {format(new Date(meeting.date), 'yyyy年MM月dd日')}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">致谢 ({meeting.gratitudeList.length})</div>
                      <div className="flex flex-wrap gap-1">
                        {meeting.gratitudeList.slice(0, 2).map((g, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {g.substring(0, 15)}...
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">决议 ({meeting.decisions.length})</div>
                      <div className="space-y-1">
                        {meeting.decisions.slice(0, 2).map((d, i) => (
                          <div key={i} className="text-xs text-emerald-600">
                            {d.content}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">娱乐活动</div>
                      <div className="text-sm text-gray-600">
                        {meeting.funPlan || '未安排'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
