import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { positiveDisciplineKnowledgeBase } from '@/lib/knowledge-base';

// 增强的知识库匹配函数
function findRelevantKnowledge(query: string): string {
  const queryLower = query.toLowerCase();
  const keywords = queryLower.split(/[，。！？、,\s]+/).filter(w => w.length >= 2);
  
  const scoredEntries = positiveDisciplineKnowledgeBase.map(entry => {
    const contentLower = entry.content.toLowerCase();
    const tagsLower = entry.tags.map(t => t.toLowerCase());
    const chapterNameLower = entry.chapterName.toLowerCase();
    
    let score = 0;
    
    // 关键词匹配
    keywords.forEach(keyword => {
      if (contentLower.includes(keyword)) score += 3;
      if (tagsLower.some(tag => tag.includes(keyword) || keyword.includes(tag))) score += 5;
      if (chapterNameLower.includes(keyword)) score += 2;
    });
    
    // 精确匹配提升
    if (contentLower.includes(queryLower)) score += 10;
    
    return { entry, score };
  });

  const relevantEntries = scoredEntries
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(e => e.entry);

  if (relevantEntries.length === 0) {
    return '';
  }

  return relevantEntries
    .map(
      (entry) =>
        `【第${entry.chapter}章 "${entry.chapterName}"】${entry.section}（第${entry.page}页）: ${entry.content}\n相关标签: ${entry.tags.join(', ')}`
    )
    .join('\n\n---\n\n');
}

// 正面管教导师系统提示词
const SYSTEM_PROMPT = `你是一位专业的正面管教导师，以简·尼尔森的《正面管教》为方法论基础。你的所有建议都必须基于书中内容，不要凭空编造。

## 核心原则（来自第1章）
1. 永远以和善而坚定的态度回应
2. 关注解决方案而不是惩罚
3. 把错误当作学习的机会
4. 尊重孩子、尊重自己、尊重情形的需要
5. 避免惩罚，因为惩罚会造成4个R：愤恨、报复、反叛、退缩

## 七项重要感知力和技能（第1章）
1. 对个人能力的感知力——"我能行"
2. 对自己在重要关系中的价值的感知力——"我的贡献有价值"
3. 对自己在生活中的力量的感知力——"我能影响发生在自己身上的事情"
4. 内省能力强
5. 人际沟通能力强
6. 整体把握能力强
7. 判断能力强

## 四个错误目的（第3章）
1. 寻求过度关注——"我只有得到关注才有归属感"
2. 寻求权力——"我只有证明我说了算才有归属感"
3. 报复——"我只有让你受伤才公平"
4. 自暴自弃——"我不可能有归属感，所以我放弃"

## 回答格式（请严格遵循）
请按以下结构回答：
1. **理解孩子的需求**：分析孩子行为背后的信念和需求
2. **错误目的分析**（如果是问题行为）：分析可能的错误目的
3. **正面管教工具推荐**：推荐1-2个来自知识库的工具（如3R1H、启发式提问、积极暂停等）
4. **具体话术建议**：可以直接说出口的话（引用书中原话或基于书中原则改编）
5. **不建议做的事**：基于书中提到的无效做法
6. **知识库参考**：引用相关章节

## 边界约束
- 如果问题涉及严重心理问题或危险行为，明确建议寻求专业帮助
- 答案要基于书中的具体内容，不要凭空编造
- 始终保持鼓励和支持的态度
- 如果知识库中没有相关内容，诚实说明并基于正面管教通用原则回答`;

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
- 关键行为记录: ${childInfo.keyBehaviors && childInfo.keyBehaviors.length > 0 
    ? childInfo.keyBehaviors.map((b: { type: string; description: string; effect: string }) => 
        `【${b.type}】${b.description}（应对效果: ${b.effect}）`
      ).join('； ')
    : '暂无'}
`;
    }

    let knowledgePrompt = '';
    if (relevantKnowledge) {
      knowledgePrompt = `
## 正面管教知识库相关内容（请务必引用）
${relevantKnowledge}
`;
    }

    // 构建完整消息
    const fullPrompt = `${SYSTEM_PROMPT}
${contextPrompt}
${knowledgePrompt}

## 用户问题
${message}

请根据以上信息，结合《正面管教》的理念，给出专业、温暖且可操作的建议。记住：你的每一个建议都必须能在知识库中找到依据！`;

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
