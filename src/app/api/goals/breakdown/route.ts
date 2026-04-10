import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { GoalNode, GoalCategory } from '@/lib/types';

const SYSTEM_PROMPT = `你是一位专业的正面管教导师，擅长将成长目标拆解为可执行的小步骤。

## 你的任务
根据用户输入的目标，结合《正面管教》的理念，将其拆解为4-6个具体的执行节点，每个节点需要包含时间计划。

## 拆解原则
1. 每个节点应该是具体、可观察、可评估的
2. 结合正面管教的核心理念：和善与坚定、关注解决方案、把错误当学习机会
3. 考虑孩子的年龄和当前阶段
4. 节点应该循序渐进，从简单到复杂
5. 节点应包含具体的可执行任务（subTasks）

## 输出格式
请严格按照以下JSON格式输出，不要添加任何其他内容：

{
  "nodes": [
    {
      "title": "节点标题（简洁明了）",
      "description": "详细描述这个节点要做什么",
      "estimatedDays": 预计天数（数字）,
      "subTasks": [
        {"title": "子任务1（具体可执行的行动）"},
        {"title": "子任务2"}
      ],
      "relatedPhrases": ["相关的话术1", "相关的话术2"],
      "relatedKnowledge": "相关的正面管教知识点"
    }
  ]
}

## 话术参考（可选择性使用）
- 我们一起来制定计划
- 你觉得怎么样？
- 我看到你的努力了
- 错误是学习的好机会
- 我相信你能做到
- 你愿意...吗？

## 知识点参考
- 第7章：日常惯例表、无言信号
- 第8章：赢得合作的四个步骤、鼓励与表扬
- 第4章：关注于解决问题、启发式问题
- 第3章：四个错误目的、自暴自弃

## 时间规划建议
- 了解目标：3天
- 制定计划：3-5天
- 执行练习：7-14天（根据目标复杂度）
- 回顾调整：3-5天

## 子任务示例
对于培养整理习惯：
- 今天和孩子一起整理书包
- 设置整理区域标识
- 每天固定时间练习
- 记录一周进展
- 总结经验继续改进`;

export async function POST(request: NextRequest) {
  try {
    const { goal, childInfo } = await request.json();

    const goalTitle = goal.title || '';
    const goalDesc = goal.description || '无';
    const goalCat = goal.category || '其他';
    const childName = childInfo.name || '';
    const childStage = childInfo.currentStage || '';
    const childPersonality = childInfo.personality || '未知';

    const prompt = "请为以下成长目标拆解执行节点。目标：" + goalTitle + "，描述：" + goalDesc + "，类别：" + goalCat + "，孩子姓名：" + childName + "，年龄/阶段：" + childStage + "，性格特点：" + childPersonality + "。请根据孩子的具体情况和《正面管教》的理念，拆解为合适的节点数量（通常3-6个）。";

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: prompt },
    ];

    // 使用流式输出
    const stream = client.stream(messages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.7,
    });

    const encoder = new TextEncoder();
    let fullContent = '';

    for await (const chunk of stream) {
      if (chunk.content) {
        fullContent += chunk.content.toString();
      }
    }

    // 解析 JSON 响应
    try {
      // 尝试提取 JSON
      const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // 转换格式，添加 id 和其他必要字段
        const nodes: GoalNode[] = (parsed.nodes || []).map((node: { title: string; description: string; estimatedDays?: number; subTasks?: { title: string }[]; relatedPhrases?: string[]; relatedKnowledge?: string }, nodeIndex: number) => ({
          id: `node-${Date.now()}-${nodeIndex + 1}`,
          goalId: '',
          title: node.title,
          description: node.description || '',
          status: 'pending' as const,
          progress: 0,
          order: nodeIndex + 1,
          estimatedDays: node.estimatedDays || 3,
          subTasks: (node.subTasks || []).map((st, stIndex) => ({
            id: `subtask-${Date.now()}-${nodeIndex + 1}-${stIndex + 1}`,
            title: st.title,
            completed: false,
          })),
          relatedPhrases: node.relatedPhrases,
          relatedKnowledge: node.relatedKnowledge,
        }));

        return NextResponse.json({ nodes });
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
    }

    // 默认节点
    const defaultNodes: GoalNode[] = [
      {
        id: `node-${Date.now()}-1`,
        goalId: '',
        title: '了解孩子的想法',
        description: '与孩子沟通，了解他对这个目标的看法和感受，使用启发式提问',
        status: 'pending',
        progress: 0,
        order: 1,
        estimatedDays: 3,
        subTasks: [
          { id: `subtask-${Date.now()}-1-1`, title: '找一个平静的时刻与孩子交谈', completed: false },
          { id: `subtask-${Date.now()}-1-2`, title: '询问孩子对这个目标的感受', completed: false },
          { id: `subtask-${Date.now()}-1-3`, title: '倾听孩子的想法，不要急于评判', completed: false },
        ],
        relatedPhrases: ['发生了什么事？', '你有什么感受？'],
        relatedKnowledge: '第4章：启发式问题',
      },
      {
        id: `node-${Date.now()}-2`,
        goalId: '',
        title: '制定行动计划',
        description: '与孩子一起制定具体的行动计划，使用赢得合作的四个步骤',
        status: 'pending',
        progress: 0,
        order: 2,
        estimatedDays: 5,
        subTasks: [
          { id: `subtask-${Date.now()}-2-1`, title: '告诉孩子你的感受', completed: false },
          { id: `subtask-${Date.now()}-2-2`, title: '倾听孩子的想法', completed: false },
          { id: `subtask-${Date.now()}-2-3`, title: '共同制定具体步骤', completed: false },
          { id: `subtask-${Date.now()}-2-4`, title: '约定执行时间和方式', completed: false },
        ],
        relatedPhrases: ['你觉得我们怎么解决？', '我们一起来制定计划'],
        relatedKnowledge: '第8章：赢得合作的四个步骤',
      },
      {
        id: `node-${Date.now()}-3`,
        goalId: '',
        title: '开始执行并记录',
        description: '开始执行计划，每天记录进展，关注进步而非完美',
        status: 'pending',
        progress: 0,
        order: 3,
        estimatedDays: 14,
        subTasks: [
          { id: `subtask-${Date.now()}-3-1`, title: '每天固定时间练习', completed: false },
          { id: `subtask-${Date.now()}-3-2`, title: '记录当天的进展', completed: false },
          { id: `subtask-${Date.now()}-3-3`, title: '及时鼓励每一次努力', completed: false },
          { id: `subtask-${Date.now()}-3-4`, title: '把错误当作学习机会', completed: false },
        ],
        relatedPhrases: ['我看到你的努力了', '错误是学习的好机会'],
        relatedKnowledge: '第8章：鼓励与表扬',
      },
      {
        id: `node-${Date.now()}-4`,
        goalId: '',
        title: '回顾与调整',
        description: '每周回顾进展，根据实际情况调整计划，保持灵活性',
        status: 'pending',
        progress: 0,
        order: 4,
        estimatedDays: 5,
        subTasks: [
          { id: `subtask-${Date.now()}-4-1`, title: '回顾一周的进展', completed: false },
          { id: `subtask-${Date.now()}-4-2`, title: '总结做得好的地方', completed: false },
          { id: `subtask-${Date.now()}-4-3`, title: '讨论需要改进的地方', completed: false },
          { id: `subtask-${Date.now()}-4-4`, title: '制定下周计划', completed: false },
        ],
        relatedPhrases: ['你觉得效果怎么样？', '我们需要调整一下吗？'],
        relatedKnowledge: '第4章：关注于解决问题',
      },
    ];

    return NextResponse.json({ nodes: defaultNodes });
  } catch (error) {
    console.error('Goal breakdown error:', error);
    return NextResponse.json(
      { error: 'Failed to breakdown goal', nodes: [] },
      { status: 500 }
    );
  }
}
