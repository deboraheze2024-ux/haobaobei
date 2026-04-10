'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 如果已登录，重定向到管理后台
  if (isAuthenticated) {
    router.push('/admin');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      router.push('/admin');
    } else {
      setError(result.error || '登录失败');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            管理员后台
          </CardTitle>
          <CardDescription className="text-gray-400">
            好宝贝 - 正面管教成长陪伴系统
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">管理员邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="请输入管理员邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </Button>
          </form>
          
          <div className="mt-6 p-4 rounded-lg bg-gray-700/30 border border-gray-600">
            <p className="text-sm text-gray-400 mb-2">默认管理员账号：</p>
            <p className="text-sm text-gray-300 font-mono">admin@haobaobei.com</p>
            <p className="text-sm text-gray-300 font-mono">密码: admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
