import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/context';

export const metadata: Metadata = {
  title: {
    default: '好宝贝 - 正面管教成长陪伴',
    template: '%s | 好宝贝',
  },
  description:
    '以孩子为中心的成长陪伴系统，基于正面管教理念，AI 驱动的个性化育儿建议',
  keywords: ['正面管教', '育儿', '家庭教育', '成长陪伴', 'AI育儿助手'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
