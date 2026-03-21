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

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: selectionPrompt + '\n' + articleList,
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // JSON部分を抽出
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse selection response');
    }

    const selectedArticles: SelectedArticle[] = JSON.parse(jsonMatch[0]);

    console.log(`✓ Selected ${selectedArticles.length} articles`);
    return selectedArticles.slice(0, 15);
  } catch (error) {
    console.error('Error selecting articles:', error);
    throw error;
  }
}
