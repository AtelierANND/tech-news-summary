import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Article, SelectedArticle } from '../types';

function loadPrompt(filename: string): string {
  const promptPath = join(__dirname, '../../prompts', filename);
  return readFileSync(promptPath, 'utf-8');
}

export async function selectArticles(
  articles: Article[],
  apiKey: string
): Promise<SelectedArticle[]> {
  const client = new Anthropic({ apiKey });

  const selectionPrompt = loadPrompt('selection.md');

  const articleList = articles
    .map((article, index) => `${index + 1}. ${article.title}\n   URL: ${article.link}`)
    .join('\n\n');

  const tool = {
    name: 'select_articles' as const,
    description: '選定した記事リストを返す',
    input_schema: {
      type: 'object' as const,
      properties: {
        articles: {
          type: 'array' as const,
          items: {
            type: 'object' as const,
            properties: {
              title: { type: 'string' as const, description: '記事タイトル' },
              url: { type: 'string' as const, description: '記事URL' },
            },
            required: ['title', 'url'],
          },
          description: '選定された15記事',
        },
      },
      required: ['articles'],
    },
  };

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      tools: [tool],
      tool_choice: { type: 'tool', name: 'select_articles' },
      messages: [
        {
          role: 'user',
          content: selectionPrompt + '\n' + articleList,
        },
      ],
    });

    const toolUseBlock = message.content.find(
      (block) => block.type === 'tool_use'
    );
    if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
      throw new Error('Failed to get tool use response');
    }

    const result = toolUseBlock.input as { articles: SelectedArticle[] };
    const selectedArticles = result.articles;

    console.log(`✓ Selected ${selectedArticles.length} articles`);
    return selectedArticles.slice(0, 15);
  } catch (error) {
    console.error('Error selecting articles:', error);
    throw error;
  }
}
