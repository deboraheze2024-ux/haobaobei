'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Database, FileText, Trash2, RefreshCw, LogOut, Shield } from 'lucide-react';

interface Stats {
  userCount: number;
  tableStats: Record<string, number>;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  last_login_at: string | null;
  childCount: number;
  goalCount: number;
  meetingCount: number;
  noteCount: number;
}

interface TableData {
  data: any[];
  count: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { admin, isAuthenticated, isLoading, logout, token } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [selectedTable, setSelectedTable] = useState('users');
  const [isLoadingData, setIsLoadingData] = useState(false);

  // 未登录或加载中
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // 未登录
  if (!isAuthenticated) {
    router.push('/admin/login');
    return null;
  }

  // 获取统计数据
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'stats' }),
      });
      const data = await response.json();
      if (data.userCount !== undefined) {
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, [token]);

  // 获取用户列表
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'get-users' }),
      });
      const data = await response.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }, [token]);

  // 获取表数据
  const fetchTableData = useCallback(async (table: string) => {
    setIsLoadingData(true);
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'get-table-data', table, limit: 100 }),
      });
      const data = await response.json();
      if (data.data) {
        setTableData(data);
      }
    } catch (error) {
      console.error('Failed to fetch table data:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [token]);

  // 初始加载
  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchTableData('users');
  }, [fetchStats, fetchUsers, fetchTableData]);

  // 删除用户
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('确定要删除这个用户及其所有数据吗？此操作不可恢复！')) {
      return;
    }

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'delete-user', userId }),
      });
      const data = await response.json();
      if (data.success) {
        fetchStats();
        fetchUsers();
        fetchTableData(selectedTable);
      } else {
        alert('删除失败: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('删除失败');
    }
  };

  // 登出
  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  const tableOptions = [
    { value: 'users', label: '用户表' },
    { value: 'child_profiles', label: '孩子档案' },
    { value: 'check_in_records', label: '打卡记录' },
    { value: 'emotion_records', label: '情绪记录' },
    { value: 'family_meetings', label: '家庭会议' },
    { value: 'growth_goals', label: '成长目标' },
    { value: 'chat_messages', label: '聊天记录' },
    { value: 'phrase_cards', label: '话术卡片' },
    { value: 'parenting_notes', label: '陪伴笔记' },
    { value: 'reflection_records', label: '复盘记录' },
    { value: 'learning_records', label: '学习记录' },
    { value: 'important_experiences', label: '重要经验' },
  ];

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">管理员后台</div>
                <div className="text-xs text-gray-500">好宝贝管理系统</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="text-gray-400">管理员：</span>
                <span className="font-medium">{admin?.name || admin?.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-1" />
                退出
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard" className="gap-2">
              <Database className="w-4 h-4" />
              数据概览
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              用户管理
            </TabsTrigger>
            <TabsTrigger value="tables" className="gap-2">
              <FileText className="w-4 h-4" />
              数据表
            </TabsTrigger>
          </TabsList>

          {/* 数据概览 */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-100">总用户数</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.userCount || 0}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-100">孩子档案</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.tableStats?.child_profiles || 0}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-100">成长目标</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.tableStats?.growth_goals || 0}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-500 to-orange-500 border-0 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-amber-100">家庭会议</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.tableStats?.family_meetings || 0}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>数据表统计</CardTitle>
                <CardDescription>各数据表的记录数量</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats?.tableStats && Object.entries(stats.tableStats).map(([table, count]) => (
                    <div key={table} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="text-xs text-gray-500 truncate">{table}</div>
                      <div className="text-xl font-bold text-gray-900">{count}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={fetchStats}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    刷新
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 用户管理 */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>用户列表</CardTitle>
                    <CardDescription>管理所有注册用户</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchUsers}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    刷新
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>用户</TableHead>
                      <TableHead>邮箱</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>最近登录</TableHead>
                      <TableHead>孩子</TableHead>
                      <TableHead>目标</TableHead>
                      <TableHead>笔记</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                          暂无用户数据
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.name || '未设置昵称'}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {user.email}
                          </TableCell>
                          <TableCell className="text-gray-500 text-sm">
                            {formatDate(user.created_at)}
                          </TableCell>
                          <TableCell className="text-gray-500 text-sm">
                            {formatDate(user.last_login_at)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{user.childCount}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{user.goalCount}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{user.noteCount}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 数据表 */}
          <TabsContent value="tables">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle>数据表详情</CardTitle>
                    <CardDescription>查看各表的详细数据</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedTable}
                      onChange={(e) => {
                        setSelectedTable(e.target.value);
                        fetchTableData(e.target.value);
                      }}
                      className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {tableOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Button variant="outline" size="sm" onClick={() => fetchTableData(selectedTable)}>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      刷新
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingData ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <>
                    <div className="mb-4 text-sm text-gray-500">
                      共 {tableData?.count || 0} 条记录
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-200 text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            {tableData?.data?.[0] && Object.keys(tableData.data[0]).map((key) => (
                              <th key={key} className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-600 whitespace-nowrap">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tableData?.data?.map((row: any, index: number) => (
                            <tr key={index} className="hover:bg-gray-50">
                              {Object.values(row).map((value: any, i: number) => (
                                <td key={i} className="border border-gray-200 px-3 py-2 max-w-xs truncate">
                                  {typeof value === 'object' 
                                    ? JSON.stringify(value)?.slice(0, 50) + '...' 
                                    : String(value ?? '')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
