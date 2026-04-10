import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { positiveDisciplineKnowledgeBase } from '@/lib/knowledge-base';

// 简化的知识库匹配函数
function findRelevantKnowledge(query: string): string {
  const queryLower = query.toLowerCase();
  const relevantEntries = positiveDisciplineKnowledgeBase
    .filter((entry) => {
      const contentLower = entry.content.toLowerCase();
      const tagsLower = entry.tags.map((t) => t.toLowerCase());
      const queryWords = queryLower.split(/\s+/);

      // 计算匹配度
      return queryWords.some(
        (word) =>
          contentLower.includes(word) ||
          tagsLower.some((tag) => tag.includes(word) || word.includes(tag))
      );
    })
    .slice(0, 3);

  if (relevantEntries.length === 0) {
    return '';
  }

  return relevantEntries
    .map(
      (entry) =>
        `[第${entry.chapter}章 "${entry.chapterName}"] ${entry.section}（第${entry.page}页）: ${entry.content}`
    )
    .join('\n\n');
}

// 正面管教导师系统提示词
const SYSTEM_PROMPT = `你是一位专业的正面管教导师，以简·尼尔森的《正面管教》为方法论基础。

## 核心原则
1. 永远以和善而坚定的态度回应
2. 关注解决方案而不是惩罚
3. 把错误当作学习的机会
4. 尊重孩子、尊重自己、尊重情形的需要

## 回答格式
请按以下结构回答：
1. **理解孩子的需求**：分析孩子行为背后的信念和需求
2. **错误目的分析**：如果是问题行为，分析可能的错误目的（寻求关注/寻求权力/报复/自暴自弃）
3. **适用的正面管教工具**：推荐1-2个来自知识库的工具
4. **具体话术建议**：可以直接说出口的话
5. **不建议做的事**：基于《正面管教》书中提到的无效做法
6. **知识库参考**：引用相关章节

## 边界约束
- 如果问题涉及严重心理问题或危险行为，明确建议寻求专业帮助
- 答案要基于书中的具体内容，不要凭空编造
- 始终保持鼓励和支持的态度

## 回答语言
- 用中文回答
- 语言温暖但专业
- 尽量使用具体的例子和可操作的建议`;

export async function POST(request: NextRequest) {
  try {
    const { message, childInfo, conversationHistory } = await request.json();

    // 获取相关知识库内容
    const relevantKnowledge = findRelevantKnowledge(message);

    // 构建上下文
    let contextPrompt = '';
    if (childInfo) {
      contextPrompt = `
## 当前孩子信息
- 姓名: ${childInfo.name}
- 年龄/阶段: ${childInfo.currentStage}
- 关键行为记录: ${childInfo.keyBehaviors.length > 0 ? childInfo.keyBehaviors.map((b: { type: string; description: string; effect: string }) => `${b.type}: ${b.description} (效果: ${b.effect})`).join('; ') : '暂无'}
`;
    }

    let knowledgePrompt = '';
    if (relevantKnowledge) {
      knowledgePrompt = `
## 相关知识库内容
${relevantKnowledge}
`;
    }

    // 构建完整消息
    const fullPrompt = `${SYSTEM_PROMPT}
${contextPrompt}
${knowledgePrompt}

## 用户问题
${message}

请根据以上信息，结合《正面管教》的理念，给出专业、温暖且可操作的建议。`;

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const messages = [
      { role: 'system' as const, content: fullPrompt },
      ...(conversationHistory || []).slice(-6).map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    // 使用流式输出
    const stream = client.stream(messages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.7,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content: chunk.content.toString() })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: '抱歉，服务暂时不可用，请稍后重试。' },
      { status: 500 }
    );
  }
}
