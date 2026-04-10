'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarCheck,
  UserCircle,
  MessageCircle,
  BookOpen,
  Users,
  Menu,
  X,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/context';

const navItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/checkin', label: '今日打卡', icon: CalendarCheck },
  { href: '/profile', label: '成长档案', icon: UserCircle },
  { href: '/chat', label: 'AI 问答', icon: MessageCircle },
  { href: '/phrases', label: '话术库', icon: BookOpen },
  { href: '/meeting', label: '家庭会议', icon: Users },
];

export default function MainNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { activeChild } = useApp();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-amber-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <span className="text-white text-xl font-bold">正</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-bold text-gray-800">正面管教</div>
              <div className="text-xs text-amber-600">成长陪伴系统</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Child Badge */}
          {activeChild && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-full">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {activeChild.name.charAt(0)}
                </span>
              </div>
              <span className="text-sm font-medium text-rose-700">
                {activeChild.name}
              </span>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
