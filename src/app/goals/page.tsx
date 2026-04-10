'use client';

import { useState } from 'react';
import {
  Plus,
  Target,
  ChevronRight,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Circle,
  Trash2,
  Loader2,
  Clock,
  BookOpen,
  MessageSquare,
  Calendar,
  CalendarDays,
  CalendarCheck,
  Sunrise,
  Sun,
  Moon,
  Link2,
  Link2Off,
  Timer,
  ListTodo,
  Play,
  Pause,
  Check,
  Edit3,
  GripVertical,
  AlertCircle,
} from 'lucide-react';
import { format, addDays, differenceInDays, isAfter, isBefore, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useApp } from '@/lib/context';
import MainNav from '@/components/main-nav';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { GrowthGoal, GoalNode, GoalSubTask, GoalCategory } from '@/lib/types';
import { cn } from '@/lib/utils';

const categoryColors: Record<GoalCategory, { bg: string; text: string; border: string; gradient: string }> = {
  '情绪管理': { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200', gradient: 'from-violet-400 to-purple-500' },
  '行为习惯': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', gradient: 'from-emerald-400 to-teal-500' },
  '社交能力': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', gradient: 'from-blue-400 to-indigo-500' },
  '学习习惯': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', gradient: 'from-amber-400 to-orange-500' },
  '自信心': { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', gradient: 'from-pink-400 to-rose-500' },
  '责任感': { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200', gradient: 'from-teal-400 to-cyan-500' },
  '自律能力': { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', gradient: 'from-indigo-400 to-violet-500' },
  '其他': { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', gradient: 'from-gray-400 to-slate-500' },
};

const categories: GoalCategory[] = [
  '情绪管理', '行为习惯', '社交能力', '学习习惯', '自信心', '责任感', '自律能力', '其他',
];

const periodIcons = {
  morning: Sunrise,
  afternoon: Sun,
  evening: Moon,
};

const periodLabels = {
  morning: '早晨',
  afternoon: '日间',
  evening: '晚间',
};

export default function GoalsPage() {
  const {
    activeChild,
    activeGoals,
    growthGoals,
    saveGoal,
    deleteGoal,
    updateGoalNode,
    updateGoalSubTask,
    addGoalSubTask,
    deleteGoalSubTask,
    linkNodeToCheckIn,
    unlinkNodeFromCheckIn,
    todayCheckIns,
  } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [newSubTask, setNewSubTask] = useState<{ nodeId: string; title: string } | null>(null);
  const [linkDialog, setLinkDialog] = useState<{ goalId: string; nodeId: string } | null>(null);
  const [linkPeriod, setLinkPeriod] = useState<'morning' | 'afternoon' | 'evening'>('evening');

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '行为习惯' as GoalCategory,
    priority: 'medium' as 'high' | 'medium' | 'low',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    targetEndDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
  });

  // 计算目标状态
  const getGoalStatus = (goal: GrowthGoal) => {
    if (goal.status === 'completed') return '已完成';
    if (goal.status === 'paused') return '已暂停';
    
    const today = new Date();
    const endDate = goal.targetEndDate ? parseISO(goal.targetEndDate) : null;
    const startDate = goal.startDate ? parseISO(goal.startDate) : null;

    if (endDate && isAfter(today, endDate)) return '已逾期';
    if (startDate && isAfter(today, startDate)) return '进行中';
    if (startDate && isBefore(today, startDate)) return '待开始';
    return '进行中';
  };

  const getGoalStatusColor = (goal: GrowthGoal) => {
    const status = getGoalStatus(goal);
    switch (status) {
      case '已完成': return 'bg-green-100 text-green-700';
      case '已逾期': return 'bg-red-100 text-red-700';
      case '进行中': return 'bg-blue-100 text-blue-700';
      case '待开始': return 'bg-gray-100 text-gray-600';
      case '已暂停': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getDaysRemaining = (goal: GrowthGoal) => {
    if (!goal.targetEndDate) return null;
    const today = new Date();
    const endDate = parseISO(goal.targetEndDate);
    const days = differenceInDays(endDate, today);
    if (days < 0) return { text: `逾期${Math.abs(days)}天`, urgent: true };
    if (days === 0) return { text: '今日到期', urgent: true };
    if (days <= 7) return { text: `剩余${days}天`, urgent: true };
    return { text: `剩余${days}天`, urgent: false };
  };

  // 创建新目标
  const handleCreateGoal = async () => {
    if (!activeChild || !form.title) return;

    setIsAiProcessing(true);

    try {
      const response = await fetch('/api/goals/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: form,
          childInfo: activeChild,
        }),
      });

      let nodes: GoalNode[] = [];

      if (response.ok) {
        const data = await response.json();
        nodes = data.nodes || [];
      }

      if (nodes.length === 0) {
        // 创建默认节点
        nodes = [
          { id: `node-${Date.now()}-1`, goalId: '', title: '了解目标', description: '与孩子沟通，了解他对这个目标的看法', status: 'pending', progress: 0, order: 1, startDate: form.startDate, endDate: form.startDate ? format(addDays(parseISO(form.startDate), 3), 'yyyy-MM-dd') : undefined, estimatedDays: 3 },
          { id: `node-${Date.now()}-2`, goalId: '', title: '制定计划', description: '一起制定具体的行动计划', status: 'pending', progress: 0, order: 2, startDate: form.startDate ? format(addDays(parseISO(form.startDate), 4), 'yyyy-MM-dd') : undefined, endDate: form.startDate ? format(addDays(parseISO(form.startDate), 7), 'yyyy-MM-dd') : undefined, estimatedDays: 3 },
          { id: `node-${Date.now()}-3`, goalId: '', title: '开始实践', description: '执行计划，记录每天的进展', status: 'pending', progress: 0, order: 3, startDate: form.startDate ? format(addDays(parseISO(form.startDate), 8), 'yyyy-MM-dd') : undefined, endDate: form.startDate ? format(addDays(parseISO(form.startDate), 20), 'yyyy-MM-dd') : undefined, estimatedDays: 13 },
          { id: `node-${Date.now()}-4`, goalId: '', title: '回顾总结', description: '回顾进展，总结经验', status: 'pending', progress: 0, order: 4, startDate: form.startDate ? format(addDays(parseISO(form.startDate), 21), 'yyyy-MM-dd') : undefined, endDate: form.targetEndDate, estimatedDays: differenceInDays(parseISO(form.targetEndDate), parseISO(form.startDate)) - 20 },
        ];
      }

      // 为节点分配时间
      nodes = nodes.map((node, index) => ({
        ...node,
        goalId: `goal-${Date.now()}`,
        subTasks: node.subTasks || [],
      }));

      const goalId = `goal-${Date.now()}`;
      const goalNodes = nodes.map(node => ({ ...node, goalId }));

      const totalDays = differenceInDays(parseISO(form.targetEndDate), parseISO(form.startDate));

      const newGoal: GrowthGoal = {
        id: goalId,
        childId: activeChild.id,
        title: form.title,
        description: form.description,
        category: form.category,
        status: 'active',
        priority: form.priority,
        progress: 0,
        nodes: goalNodes,
        startDate: form.startDate,
        targetEndDate: form.targetEndDate,
        totalDuration: totalDays,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveGoal(newGoal);
      setIsAddOpen(false);
      setForm({ title: '', description: '', category: '行为习惯', priority: 'medium', startDate: format(new Date(), 'yyyy-MM-dd'), targetEndDate: format(addDays(new Date(), 30), 'yyyy-MM-dd') });
      setExpandedGoalId(goalId);
    } catch (error) {
      console.error('Failed to create goal:', error);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // 切换节点状态
  const handleToggleNode = (goalId: string, node: GoalNode) => {
    const newStatus = node.status === 'completed' ? 'pending' : 'completed';
    const newProgress = newStatus === 'completed' ? 100 : 0;
    updateGoalNode(goalId, node.id, {
      status: newStatus,
      progress: newProgress,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
    });
  };

  // 删除目标
  const handleDeleteGoal = (goalId: string) => {
    if (confirm('确定要删除这个目标吗？')) {
      deleteGoal(goalId);
    }
  };

  // 添加子任务
  const handleAddSubTask = () => {
    if (!newSubTask || !linkDialog) return;
    addGoalSubTask(linkDialog.goalId, linkDialog.nodeId, newSubTask.title);
    setNewSubTask(null);
  };

  // 链接到打卡
  const handleLinkToCheckIn = () => {
    if (!linkDialog) return;
    const goal = growthGoals.find((g) => g.id === linkDialog.goalId);
    const node = goal?.nodes.find((n) => n.id === linkDialog.nodeId);
    if (goal && node) {
      linkNodeToCheckIn(linkDialog.goalId, linkDialog.nodeId, linkPeriod, `${goal.title} - ${node.title}`);
    }
    setLinkDialog(null);
  };

  // 总体统计
  const overallProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length)
    : 0;

  const inProgressGoals = activeGoals.filter(g => g.progress > 0 && g.progress < 100);
  const notStartedGoals = activeGoals.filter(g => g.progress === 0);
  const completedGoals = growthGoals.filter(g => g.status === 'completed');
  const overdueGoals = activeGoals.filter(g => {
    if (!g.targetEndDate) return false;
    return isAfter(new Date(), parseISO(g.targetEndDate));
  });

  if (!activeChild) {
    return (
      <div className="min-h-screen">
        <MainNav />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card className="border-dashed border-2 border-violet-200">
            <CardContent className="p-8 text-center">
              <Target className="w-12 h-12 text-violet-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                请先添加陪伴对象
              </h2>
              <p className="text-gray-500">
                在设置中添加孩子信息后，才能创建成长目标
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

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-200">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">成长目标</h1>
              <p className="text-sm text-gray-500">
                为 {activeChild.name} 设定可落地的成长计划
              </p>
            </div>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg shadow-violet-200">
                <Plus className="w-4 h-4 mr-1" />
                新建目标
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-500" />
                  创建成长目标
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    目标名称 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="例如：培养孩子独立整理房间"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    目标描述
                  </label>
                  <Textarea
                    placeholder="详细描述这个目标，例如：孩子7岁，希望能够自己整理玩具和衣物..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">目标类别</label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as GoalCategory })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">优先级</label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as 'high' | 'medium' | 'low' })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">高优先级</SelectItem>
                        <SelectItem value="medium">中优先级</SelectItem>
                        <SelectItem value="low">低优先级</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">开始日期</label>
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">目标完成日期</label>
                    <Input
                      type="date"
                      value={form.targetEndDate}
                      onChange={(e) => setForm({ ...form, targetEndDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-violet-200">
                  <div className="flex items-center gap-2 text-sm text-violet-700">
                    <Sparkles className="w-4 h-4" />
                    <span>AI 将根据《正面管教》拆解为可执行的时间节点</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleCreateGoal}
                    className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                    disabled={!form.title || isAiProcessing}
                  >
                    {isAiProcessing ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />AI 拆解中...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-1" />创建目标</>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>取消</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-800">{overallProgress}%</div>
              <div className="text-xs text-gray-500">总体进度</div>
              <Progress value={overallProgress} className="h-1.5 mt-2" />
            </CardContent>
          </Card>
          <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-800">{inProgressGoals.length}</div>
              <div className="text-xs text-gray-500">进行中</div>
            </CardContent>
          </Card>
          <Card className="border-red-100 bg-gradient-to-br from-red-50 to-orange-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{overdueGoals.length}</div>
              <div className="text-xs text-gray-500">已逾期</div>
            </CardContent>
          </Card>
          <Card className="border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-800">{completedGoals.length}</div>
              <div className="text-xs text-gray-500">已完成</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'active' ? 'default' : 'outline'}
            onClick={() => setActiveTab('active')}
            className={cn(activeTab === 'active' && 'bg-gradient-to-r from-violet-500 to-purple-500')}
          >
            <Target className="w-4 h-4 mr-1" />
            进行中 ({activeGoals.length})
          </Button>
          <Button
            variant={activeTab === 'completed' ? 'default' : 'outline'}
            onClick={() => setActiveTab('completed')}
            className={cn(activeTab === 'completed' && 'bg-gradient-to-r from-green-500 to-emerald-500')}
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            已完成 ({completedGoals.length})
          </Button>
        </div>

        {/* Goals List */}
        {activeTab === 'active' && activeGoals.length === 0 && (
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">还没有成长目标</h3>
              <p className="text-gray-400 mb-4">点击上方按钮，创建第一个目标</p>
              <p className="text-sm text-violet-500">AI 会帮你拆解为可执行的时间节点和每日任务</p>
            </CardContent>
          </Card>
        )}

        {activeTab === 'active' && (
          <div className="space-y-4">
            {activeGoals.map((goal) => {
              const colors = categoryColors[goal.category];
              const isExpanded = expandedGoalId === goal.id;
              const daysInfo = getDaysRemaining(goal);
              const status = getGoalStatus(goal);

              return (
                <Card key={goal.id} className={cn('border-2 transition-all', colors.border, isExpanded && 'shadow-lg')}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge className={cn(colors.bg, colors.text, 'border-0')}>{goal.category}</Badge>
                          <Badge className={getGoalStatusColor(goal)}>{status}</Badge>
                          {goal.priority === 'high' && <Badge variant="outline" className="text-red-500 border-red-200">高优</Badge>}
                          {daysInfo && (
                            <Badge variant="outline" className={cn(daysInfo.urgent ? 'text-red-500 border-red-200' : 'text-gray-500')}>
                              <Clock className="w-3 h-3 mr-1" />
                              {daysInfo.text}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        {goal.description && (
                          <p className="text-sm text-gray-500 mt-1">{goal.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteGoal(goal.id)}>
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress & Timeline */}
                    <div className="flex items-center gap-4 mt-4">
                      <Progress value={goal.progress} className="flex-1 h-2.5" />
                      <span className="text-sm font-bold text-gray-700 w-12 text-right">{goal.progress}%</span>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {goal.startDate && format(parseISO(goal.startDate), 'MM/dd')} - {goal.targetEndDate && format(parseISO(goal.targetEndDate), 'MM/dd')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Timer className="w-3.5 h-3.5" />
                        预计 {goal.totalDuration} 天
                      </span>
                      <span className="flex items-center gap-1">
                        <ListTodo className="w-3.5 h-3.5" />
                        {goal.nodes.filter(n => n.status === 'completed').length}/{goal.nodes.length} 节点
                      </span>
                    </div>
                  </CardHeader>

                  {/* Expand */}
                  <CardContent className="pt-0">
                    <Button
                      variant="ghost"
                      className="w-full justify-between text-gray-500 hover:text-gray-700"
                      onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                    >
                      <span className="flex items-center gap-2">
                        <CalendarCheck className="w-4 h-4" />
                        查看详细计划
                      </span>
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>

                    {/* Nodes */}
                    {isExpanded && (
                      <div className="mt-4 space-y-3">
                        {goal.nodes.map((node, index) => {
                          const nodeExpanded = expandedNodeId === node.id;
                          const completedSubTasks = node.subTasks?.filter(st => st.completed).length || 0;
                          const totalSubTasks = node.subTasks?.length || 0;

                          return (
                            <div key={node.id}>
                              <div
                                className={cn(
                                  'p-4 rounded-xl border transition-all',
                                  node.status === 'completed'
                                    ? 'bg-green-50 border-green-200'
                                    : node.status === 'in_progress'
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  <button onClick={() => handleToggleNode(goal.id, node)} className="flex-shrink-0 mt-0.5">
                                    {node.status === 'completed' ? (
                                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    ) : (
                                      <Circle className="w-6 h-6 text-gray-300 hover:text-violet-400 transition-colors" />
                                    )}
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={cn('font-medium', node.status === 'completed' ? 'text-green-700 line-through' : 'text-gray-800')}>
                                        {index + 1}. {node.title}
                                      </span>
                                      {node.status === 'in_progress' && (
                                        <Badge className="bg-blue-100 text-blue-600 border-0 text-xs">进行中</Badge>
                                      )}
                                    </div>
                                    {node.description && (
                                      <p className={cn('text-sm mt-1', node.status === 'completed' ? 'text-green-600' : 'text-gray-500')}>
                                        {node.description}
                                      </p>
                                    )}

                                    {/* Node Meta */}
                                    <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-gray-400">
                                      {node.startDate && (
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          {format(parseISO(node.startDate), 'MM/dd')}
                                        </span>
                                      )}
                                      {node.endDate && (
                                        <>
                                          <span>-</span>
                                          <span>{format(parseISO(node.endDate), 'MM/dd')}</span>
                                        </>
                                      )}
                                      {node.estimatedDays && (
                                        <span>({node.estimatedDays}天)</span>
                                      )}
                                      {totalSubTasks > 0 && (
                                        <span className="flex items-center gap-1 text-violet-500">
                                          <ListTodo className="w-3 h-3" />
                                          {completedSubTasks}/{totalSubTasks} 任务
                                        </span>
                                      )}
                                      {node.linkedCheckIn && node.checkInPeriod && (
                                        <Badge variant="outline" className="text-xs border-violet-200 text-violet-600">
                                          {(() => {
                                            const Icon = periodIcons[node.checkInPeriod];
                                            return <Icon className="w-3 h-3 mr-1" />;
                                          })()}
                                          {periodLabels[node.checkInPeriod]}打卡
                                        </Badge>
                                      )}
                                    </div>

                                    {/* SubTasks */}
                                    {node.subTasks && node.subTasks.length > 0 && (
                                      <div className="mt-3 pl-2 space-y-1.5 border-l-2 border-violet-200">
                                        {node.subTasks.map((subTask) => (
                                          <div key={subTask.id} className="flex items-center gap-2 group">
                                            <button
                                              onClick={() => updateGoalSubTask(goal.id, node.id, subTask.id, { completed: !subTask.completed })}
                                              className="flex-shrink-0"
                                            >
                                              {subTask.completed ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                              ) : (
                                                <Circle className="w-5 h-5 text-gray-300 hover:text-violet-400" />
                                              )}
                                            </button>
                                            <span className={cn('text-sm flex-1', subTask.completed ? 'text-gray-400 line-through' : 'text-gray-700')}>
                                              {subTask.title}
                                            </span>
                                            <button
                                              onClick={() => deleteGoalSubTask(goal.id, node.id, subTask.id)}
                                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                              <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Node Actions */}
                                    <div className="flex items-center gap-2 mt-3">
                                      <Dialog open={linkDialog?.nodeId === node.id} onOpenChange={(open) => !open && setLinkDialog(null)}>
                                        <DialogTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() => setLinkDialog({ goalId: goal.id, nodeId: node.id })}
                                          >
                                            {node.linkedCheckIn ? (
                                              <><Link2 className="w-3 h-3 mr-1 text-green-500" />已关联打卡</>
                                            ) : (
                                              <><Link2 className="w-3 h-3 mr-1" />加入打卡</>
                                            )}
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-sm">
                                          <DialogHeader>
                                            <DialogTitle>添加到今日打卡</DialogTitle>
                                          </DialogHeader>
                                          <div className="space-y-4 py-4">
                                            <div>
                                              <label className="text-sm font-medium mb-2 block">选择时段</label>
                                              <Select value={linkPeriod} onValueChange={(v) => setLinkPeriod(v as typeof linkPeriod)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="morning"><span className="flex items-center gap-2"><Sunrise className="w-4 h-4" />早晨</span></SelectItem>
                                                  <SelectItem value="afternoon"><span className="flex items-center gap-2"><Sun className="w-4 h-4" />日间</span></SelectItem>
                                                  <SelectItem value="evening"><span className="flex items-center gap-2"><Moon className="w-4 h-4" />晚间</span></SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <Button onClick={handleLinkToCheckIn} className="w-full bg-gradient-to-r from-violet-500 to-purple-500">
                                              确认添加
                                            </Button>
                                          </div>
                                        </DialogContent>
                                      </Dialog>

                                      <Dialog open={newSubTask?.nodeId === node.id} onOpenChange={(open) => !open && setNewSubTask(null)}>
                                        <DialogTrigger asChild>
                                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setNewSubTask({ nodeId: node.id, title: '' })}>
                                            <Plus className="w-3 h-3 mr-1" />添加任务
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-sm">
                                          <DialogHeader>
                                            <DialogTitle>添加可执行任务</DialogTitle>
                                          </DialogHeader>
                                          <div className="space-y-4 py-4">
                                            <Input
                                              placeholder="输入任务，例如：今天练习整理书包"
                                              value={newSubTask?.title || ''}
                                              onChange={(e) => setNewSubTask({ ...newSubTask!, title: e.target.value })}
                                              onKeyDown={(e) => e.key === 'Enter' && handleAddSubTask()}
                                            />
                                            <Button onClick={handleAddSubTask} disabled={!newSubTask?.title} className="w-full bg-gradient-to-r from-violet-500 to-purple-500">
                                              添加
                                            </Button>
                                          </div>
                                        </DialogContent>
                                      </Dialog>

                                      {node.relatedKnowledge && (
                                        <Badge variant="outline" className="h-7 text-xs text-violet-600 border-violet-200">
                                          <BookOpen className="w-3 h-3 mr-1" />
                                          {node.relatedKnowledge.slice(0, 20)}...
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Completed Goals */}
        {activeTab === 'completed' && (
          <div className="space-y-3">
            {completedGoals.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">还没有已完成的目标</h3>
                  <p className="text-gray-400">继续加油，完成第一个目标吧！</p>
                </CardContent>
              </Card>
            ) : (
              completedGoals.slice(-10).reverse().map((goal) => {
                const colors = categoryColors[goal.category];
                return (
                  <Card key={goal.id} className={cn('border', colors.border, 'opacity-80')}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <div>
                            <span className="font-medium text-gray-800">{goal.title}</span>
                            <Badge className={cn('ml-2', colors.bg, colors.text, 'border-0 text-xs')}>
                              {goal.category}
                            </Badge>
                          </div>
                        </div>
                        <span className="text-sm text-gray-400">
                          {goal.completedAt && format(parseISO(goal.completedAt), 'MM月dd日')} 完成
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Tips */}
        <Card className="mt-8 border-0 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="p-5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800 text-sm mb-1">落地执行技巧</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                将大目标拆分为每周甚至每天的小任务，并关联到每日打卡中。这样可以让孩子每天都有明确的行动目标，家长也能更好地跟踪进展。记得定期回顾和调整计划，保持灵活性！
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
