'use client';

import { useState } from 'react';
import {
  Plus,
  Settings,
  User,
  Trash2,
  Edit3,
  ChevronRight,
  Heart,
  Sparkles,
  Star,
  Target,
  Check,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { ChildProfile } from '@/lib/types';

const stageEmojis: Record<string, string> = {
  '幼儿园': '🏠',
  '小学低年级': '📚',
  '小学高年级': '📖',
  '初中': '🎯',
  '高中': '🚀',
};

export default function SettingsPage() {
  const { childProfiles, activeChild, setActiveChild, addChildProfile, updateChildProfile, deleteChildProfile } = useApp();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);

  // 新建/编辑表单
  const [form, setForm] = useState({
    name: '',
    nickname: '',
    birthDate: '',
    gender: 'male' as 'male' | 'female' | 'other',
    currentStage: '幼儿园' as ChildProfile['currentStage'],
    personality: '',
    strengths: '',
    challenges: '',
    interests: '',
    notes: '',
  });

  const resetForm = () => {
    setForm({
      name: '',
      nickname: '',
      birthDate: '',
      gender: 'male',
      currentStage: '幼儿园',
      personality: '',
      strengths: '',
      challenges: '',
      interests: '',
      notes: '',
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setEditingChild(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (child: ChildProfile) => {
    setForm({
      name: child.name,
      nickname: child.nickname || '',
      birthDate: child.birthDate,
      gender: child.gender,
      currentStage: child.currentStage,
      personality: child.personality || '',
      strengths: child.strengths?.join('、') || '',
      challenges: child.challenges?.join('、') || '',
      interests: child.interests?.join('、') || '',
      notes: child.notes || '',
    });
    setEditingChild(child);
    setIsAddOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.birthDate) return;

    const childData: ChildProfile = {
      id: editingChild?.id || `child-${Date.now()}`,
      name: form.name,
      nickname: form.nickname || undefined,
      birthDate: form.birthDate,
      gender: form.gender,
      currentStage: form.currentStage,
      personality: form.personality || undefined,
      strengths: form.strengths ? form.strengths.split('、').filter(Boolean) : undefined,
      challenges: form.challenges ? form.challenges.split('、').filter(Boolean) : undefined,
      interests: form.interests ? form.interests.split('、').filter(Boolean) : undefined,
      notes: form.notes || undefined,
      keyBehaviors: editingChild?.keyBehaviors || [],
      createdAt: editingChild?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingChild) {
      updateChildProfile(childData);
    } else {
      addChildProfile(childData);
      setActiveChild(childData.id);
    }

    setIsAddOpen(false);
    resetForm();
    setEditingChild(null);
  };

  const handleDelete = (childId: string) => {
    if (confirm('确定要删除这个陪伴对象吗？所有相关数据将一并删除。')) {
      deleteChildProfile(childId);
    }
  };

  return (
    <div className="min-h-screen">
      <MainNav />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">设置</h1>
            <p className="text-gray-500">管理陪伴对象信息</p>
          </div>
        </div>

        {/* Children List */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <User className="w-5 h-5 text-violet-500" />
              陪伴对象 ({childProfiles.length})
            </h2>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600">
                  <Plus className="w-4 h-4 mr-1" />
                  添加
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingChild ? '编辑陪伴对象' : '添加陪伴对象'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        姓名 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="孩子的名字"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        昵称
                      </label>
                      <Input
                        placeholder="小名/昵称"
                        value={form.nickname}
                        onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        生日 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={form.birthDate}
                        onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        性别
                      </label>
                      <Select
                        value={form.gender}
                        onValueChange={(v) => setForm({ ...form, gender: v as 'male' | 'female' | 'other' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">男孩</SelectItem>
                          <SelectItem value="female">女孩</SelectItem>
                          <SelectItem value="other">其他</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      当前阶段
                    </label>
                    <Select
                      value={form.currentStage}
                      onValueChange={(v) => setForm({ ...form, currentStage: v as ChildProfile['currentStage'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="幼儿园">幼儿园</SelectItem>
                        <SelectItem value="小学低年级">小学低年级（1-3年级）</SelectItem>
                        <SelectItem value="小学高年级">小学高年级（4-6年级）</SelectItem>
                        <SelectItem value="初中">初中</SelectItem>
                        <SelectItem value="高中">高中</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      性格特点
                    </label>
                    <Textarea
                      placeholder="描述孩子的性格，如：活泼开朗、内向害羞、有主见..."
                      value={form.personality}
                      onChange={(e) => setForm({ ...form, personality: e.target.value })}
                      className="min-h-[60px]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      优点/长处 <span className="text-xs text-gray-400">（用顿号分隔）</span>
                    </label>
                    <Input
                      placeholder="如：善良、有创造力、动手能力强"
                      value={form.strengths}
                      onChange={(e) => setForm({ ...form, strengths: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      需要支持的地方 <span className="text-xs text-gray-400">（用顿号分隔）</span>
                    </label>
                    <Input
                      placeholder="如：情绪管理、时间观念、社交技巧"
                      value={form.challenges}
                      onChange={(e) => setForm({ ...form, challenges: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      兴趣爱好 <span className="text-xs text-gray-400">（用顿号分隔）</span>
                    </label>
                    <Input
                      placeholder="如：画画、踢球、阅读、拼图"
                      value={form.interests}
                      onChange={(e) => setForm({ ...form, interests: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      备注
                    </label>
                    <Textarea
                      placeholder="其他想记录的信息..."
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="min-h-[60px]"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleSubmit}
                      className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                      disabled={!form.name || !form.birthDate}
                    >
                      {editingChild ? '保存修改' : '添加'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                      取消
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {childProfiles.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-200">
              <CardContent className="p-8 text-center">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  还没有添加陪伴对象
                </h3>
                <p className="text-gray-400 mb-4">
                  点击上方按钮添加您想要陪伴成长的孩子
                </p>
              </CardContent>
            </Card>
          ) : (
            childProfiles.map((child) => (
              <Card
                key={child.id}
                className={`border-2 transition-all cursor-pointer hover:shadow-md ${
                  activeChild?.id === child.id
                    ? 'border-violet-300 bg-gradient-to-r from-violet-50 to-purple-50'
                    : 'border-gray-100 hover:border-violet-200'
                }`}
                onClick={() => setActiveChild(child.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16 border-2 border-violet-200">
                      <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-500 text-white text-xl">
                        {child.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-800">
                          {child.name}
                        </h3>
                        {child.nickname && (
                          <span className="text-gray-400">({child.nickname})</span>
                        )}
                        {activeChild?.id === child.id && (
                          <Badge className="bg-violet-100 text-violet-700">
                            <Check className="w-3 h-3 mr-1" />
                            当前
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-2">
                        <span className="flex items-center gap-1">
                          {stageEmojis[child.currentStage]} {child.currentStage}
                        </span>
                        {child.birthDate && (
                          <span>· {format(new Date(child.birthDate), 'yyyy年MM月dd日')}</span>
                        )}
                      </div>

                      {child.personality && (
                        <p className="text-sm text-gray-600 mb-2">
                          <Star className="w-3 h-3 inline mr-1 text-amber-400" />
                          {child.personality}
                        </p>
                      )}

                      {(child.strengths?.length || child.challenges?.length) && (
                        <div className="flex flex-wrap gap-1">
                          {child.strengths?.slice(0, 2).map((s, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-emerald-50 text-emerald-600 border-emerald-200">
                              <Sparkles className="w-3 h-3 mr-1" />
                              {s}
                            </Badge>
                          ))}
                          {child.challenges?.slice(0, 2).map((c, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-amber-50 text-amber-600 border-amber-200">
                              <Target className="w-3 h-3 mr-1" />
                              {c}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(child);
                        }}
                      >
                        <Edit3 className="w-4 h-4 text-gray-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(child.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                      <ChevronRight className="w-5 h-5 text-gray-300 self-center" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Tips */}
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="p-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400" />
              温馨提醒
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-amber-500">•</span>
                <span>添加孩子的性格特点和兴趣爱好，有助于AI给出更个性化的建议</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">•</span>
                <span>记录需要支持的地方，可以在成长目标中重点关注</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">•</span>
                <span>点击卡片即可切换当前陪伴对象</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
