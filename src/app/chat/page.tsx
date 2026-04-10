'use client';

import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/context';
import MainNav from '@/components/main-nav';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  MessageCircle,
  Send,
  Loader2,
  Sparkles,
  BookOpen,
  ArrowRight,
  Bot,
  User,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: { chapter: string; content: string }[];
}

export default function ChatPage() {
  const { activeChild, recentEmotions } = useApp();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 初始欢迎消息
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `您好！我是您的正面管教AI助手。\n\n我可以基于《正面管教》的理念，结合${
            activeChild?.name || '您的孩子'
          }的具体情况，为您提供个性化的育儿建议。\n\n请描述您遇到的具体场景，比如：\n• "孩子拒绝做作业"\n• "孩子发脾气时该怎么办"\n• "如何培养孩子的自律"\n\n我会根据书中的理论和方法，为您分析背后的原因，并给出实用的应对建议。`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [activeChild, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 构建历史对话
      const conversationHistory = messages
        .filter((m) => m.role === 'user')
        .slice(-5)
        .map((m) => ({
          role: 'user' as const,
          content: m.content,
        }));

      // 添加助手回复到历史
      const assistantMessages = messages
        .filter((m) => m.role === 'assistant')
        .slice(-5)
        .map((m) => ({
          role: 'assistant' as const,
          content: m.content,
        }));

      const fullHistory = conversationHistory.map((q, i) => ({
        user: q.content,
        assistant: assistantMessages[i]?.content || '',
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          childInfo: activeChild
            ? {
                name: activeChild.name,
                currentStage: activeChild.currentStage,
                personality: activeChild.personality,
                keyBehaviors: recentEmotions.slice(0, 5).map((e) => e.note || e.emotion),
              }
            : null,
          conversationHistory: fullHistory,
        }),
      });

      if (!response.ok) throw new Error('API request failed');

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      const assistantMessageId = (Date.now() + 1).toString();
      let assistantContent = '';

      // 先添加一条空消息
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: 'assistant' as const,
          content: '',
          timestamp: new Date(),
          sources: [],
        },
      ]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                assistantContent += data.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, content: assistantContent }
                      : m
                  )
                );
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '抱歉，发生了错误。请稍后重试。',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const quickQuestions = [
    '孩子拒绝上学怎么办？',
    '如何帮助孩子控制情绪？',
    '孩子不听话，挑战我的权威',
    '怎样培养孩子的自律能力？',
    '孩子之间发生冲突怎么处理？',
  ];

  if (!activeChild) {
    return (
      <div className="min-h-screen">
        <MainNav />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Card className="border-dashed border-2 border-rose-200">
            <CardContent className="py-16">
              <div className="text-6xl mb-4">👶</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                请先添加陪伴对象
              </h2>
              <p className="text-gray-500 mb-6">
                AI助手需要了解孩子信息才能提供个性化建议
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

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-200">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">AI 问答助手</h1>
            <p className="text-sm text-gray-500">
              基于《正面管教》，为{activeChild.name}量身定制建议
            </p>
          </div>
          <Badge className="ml-auto bg-blue-50 text-blue-600 border-blue-200">
            <Sparkles className="w-3 h-3 mr-1" />
            RAG 知识库
          </Badge>
        </div>

        {/* Chat Container */}
        <Card className="flex-1 flex flex-col border-0 shadow-xl bg-gradient-to-b from-gray-50 to-white overflow-hidden min-h-[500px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
                  message.role === 'user' && 'flex-row-reverse'
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg',
                    message.role === 'assistant'
                      ? 'bg-gradient-to-br from-blue-400 to-indigo-500'
                      : 'bg-gradient-to-br from-pink-400 to-rose-500'
                  )}
                >
                  {message.role === 'assistant' ? (
                    <Bot className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Content */}
                <div
                  className={cn(
                    'max-w-[75%] px-5 py-4 rounded-2xl',
                    message.role === 'assistant'
                      ? 'bg-white border border-gray-100 shadow-sm'
                      : 'bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg shadow-pink-200'
                  )}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border border-gray-100 shadow-sm px-5 py-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>正在思考...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-6 pb-4">
              <div className="text-xs text-gray-400 mb-2">试试这些问题：</div>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-100 p-4 bg-white">
            <div className="flex gap-3">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`描述${activeChild.name}遇到的具体场景...`}
                className="min-h-[56px] max-h-[200px] resize-none rounded-xl border-gray-200 focus:border-pink-300 focus:ring-pink-200"
                rows={1}
              />
              <Button
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
                className="h-auto px-5 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 shadow-lg shadow-pink-200"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                50+ 知识条目
              </span>
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                参考《正面管教》章节
              </span>
              <span className="flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                个性化建议
              </span>
            </div>
          </div>
        </Card>

        {/* Tips */}
        <Card className="mt-4 border-0 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800 text-sm mb-1">提问技巧</h4>
              <p className="text-xs text-gray-600">
                越具体的场景描述，我越能给出精准的建议。例如：&ldquo;孩子7岁，一遇到数学作业就说不会，然后就哭&rdquo; 比 &ldquo;孩子不爱学习&rdquo; 效果更好。
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
