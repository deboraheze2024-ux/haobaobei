'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  BookOpen,
  Lightbulb,
  MessageCircle,
} from 'lucide-react';
import { useApp } from '@/lib/context';
import MainNav from '@/components/main-nav';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/lib/types';

// 预设问题
const suggestedQuestions = [
  '孩子今天拒绝上课，坐在位置上一言不发，我该怎么办？',
  '孩子总是拖延作业，催了很多遍都没用',
  '两个孩子总是吵架，怎么用家庭会议解决？',
  '孩子情绪崩溃时，我应该怎么回应？',
  '如何用启发式提问引导孩子反思？',
];

export default function ChatPage() {
  const { activeChild, chatMessages, addChatMessage, clearChat } = useApp();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 自动滚动
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, streamingContent]);

  const handleSubmit = async (question?: string) => {
    const query = question || input;
    if (!query.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    addChatMessage(userMessage);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          childInfo: activeChild
            ? {
                name: activeChild.name,
                currentStage: activeChild.currentStage,
                keyBehaviors: activeChild.keyBehaviors,
              }
            : null,
          conversationHistory: chatMessages.slice(-10),
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullContent += parsed.content;
                  setStreamingContent(fullContent);
                }
              } catch {
                // 忽略解析错误
              }
            }
          }
        }
      }

      // 保存完整的 AI 回复
      if (fullContent) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: fullContent,
          timestamp: new Date().toISOString(),
        };
        addChatMessage(assistantMessage);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '抱歉，服务暂时不可用。请稍后重试，或尝试简化您的问题。',
        timestamp: new Date().toISOString(),
      };
      addChatMessage(errorMessage);
    } finally {
      setIsLoading(false);
      setStreamingContent('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">AI 问答助手</h1>
              <p className="text-sm text-gray-500">
                基于《正面管教》书籍的智能问答
              </p>
            </div>
          </div>
          {chatMessages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="text-gray-500 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              清空对话
            </Button>
          )}
        </div>

        {/* Child Info Badge */}
        {activeChild && (
          <Card className="mb-4 border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {activeChild.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800">
                  正在为 {activeChild.name} 分析
                </div>
                <div className="text-xs text-gray-500">
                  {activeChild.currentStage} · {activeChild.keyBehaviors.length} 条行为记录
                </div>
              </div>
              <Badge className="bg-violet-100 text-violet-700">
                <BookOpen className="w-3 h-3 mr-1" />
                118页知识库
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Chat Messages */}
        <Card className="flex-1 border-violet-200 flex flex-col min-h-[400px]">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-violet-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  描述一个具体的育儿场景
                </h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  我会结合《正面管教》书籍内容和您孩子的档案，给出个性化的建议
                </p>

                {/* Suggested Questions */}
                <div className="w-full max-w-lg space-y-3">
                  <p className="text-sm text-gray-500 font-medium">
                    试试这些常见问题：
                  </p>
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSubmit(q)}
                      className="w-full text-left p-3 rounded-lg border border-violet-200 hover:border-violet-400 hover:bg-violet-50 transition-all text-sm text-gray-700"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {chatMessages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                {isLoading && streamingContent && (
                  <MessageBubble
                    message={{
                      id: 'streaming',
                      role: 'assistant',
                      content: streamingContent,
                      timestamp: new Date().toISOString(),
                    }}
                    isStreaming
                  />
                )}
                {isLoading && !streamingContent && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="animate-bounce">
                      <Bot className="w-6 h-6" />
                    </div>
                    <span className="text-sm">思考中...</span>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-violet-200">
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="描述一个具体的育儿场景..."
                className="min-h-[60px] resize-none border-violet-200 focus:border-violet-400"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSubmit()}
                disabled={!input.trim() || isLoading}
                className="bg-violet-500 hover:bg-violet-600 self-end"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              按 Enter 发送，Shift + Enter 换行
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
}

function MessageBubble({
  message,
  isStreaming,
}: {
  message: ChatMessage;
  isStreaming?: boolean;
}) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-gradient-to-br from-amber-400 to-orange-500'
            : 'bg-gradient-to-br from-violet-400 to-purple-500'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {isUser ? (
          <p className="text-sm">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none">
            {message.content.split('\n').map((line, i) => {
              // 格式化回答
              if (line.startsWith('**') && line.endsWith('**')) {
                return (
                  <p key={i} className="font-bold text-violet-700 mt-3 first:mt-0">
                    {line.replace(/\*\*/g, '')}
                  </p>
                );
              }
              if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.') || line.startsWith('5.') || line.startsWith('6.')) {
                return (
                  <p key={i} className="pl-4 my-1">
                    {line}
                  </p>
                );
              }
              if (line.startsWith('-')) {
                return (
                  <p key={i} className="pl-4 my-1 text-violet-600">
                    {line}
                  </p>
                );
              }
              if (line.startsWith('[') && line.includes('第')) {
                return (
                  <p key={i} className="text-xs text-gray-500 italic mt-2 bg-violet-50 p-2 rounded">
                    <Lightbulb className="w-3 h-3 inline mr-1" />
                    {line}
                  </p>
                );
              }
              if (line.trim() === '') {
                return <br key={i} />;
              }
              return (
                <p key={i} className="text-sm my-1">
                  {line}
                </p>
              );
            })}
            {isStreaming && (
              <span className="inline-block animate-pulse">▊</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
