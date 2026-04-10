'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarCheck,
  Menu,
  X,
  Home,
  Target,
  Settings,
  Heart,
  BookHeart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/checkin', label: '今日打卡', icon: CalendarCheck },
  { href: '/goals', label: '成长目标', icon: Target },
  { href: '/parenting', label: '父母园地', icon: BookHeart },
];

export default function MainNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { activeChild } = useApp();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-rose-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-400 via-pink-400 to-violet-500 flex items-center justify-center shadow-lg shadow-pink-200 group-hover:shadow-xl group-hover:scale-105 transition-all">
              <span className="text-white text-xl font-bold">正</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                正面管教
              </div>
              <div className="text-xs text-pink-500 font-medium -mt-0.5">成长陪伴</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />}
                  <Icon className={cn('w-4 h-4', isActive ? 'text-pink-500' : '')} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Settings */}
            <Link
              href="/settings"
              className={cn(
                'p-2 rounded-xl transition-all',
                pathname === '/settings'
                  ? 'bg-pink-50 text-pink-600'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              )}
            >
              <Settings className="w-5 h-5" />
            </Link>

            {/* Child Badge */}
            {activeChild && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-rose-50 to-pink-50 rounded-full border border-rose-100 shadow-sm">
                <Avatar className="w-7 h-7 border-2 border-pink-200">
                  <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-500 text-white text-xs font-bold">
                    {activeChild.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">
                  {activeChild.name}
                </span>
                <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-200" />
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 bg-white/95 backdrop-blur-xl">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                      isActive
                        ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-pink-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
