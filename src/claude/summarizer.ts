import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { SelectedArticle, SummarizedArticle } from '../types';
import { fetchArticleContent } from '../utils/fetcher';

function loadPrompt(filename: string): string {
  const promptPath = join(__dirname, '../../prompts', filename);
  return readFileSync(promptPath, 'utf-8');
}

export async function summarizeArticles(
  articles: SelectedArticle[],
  apiKey: string
): Promise<SummarizedArticle[]> {
  const client = new Anthropic({ apiKey });
  const summarized: SummarizedArticle[] = [];

  const summaryPrompt = loadPrompt('summary.md');

  console.log(`Starting summarization of ${articles.length} articles...`);

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`  [${i + 1}/${articles.length}] Summarizing: ${article.title}`);

    try {
      // 記事の本文を取得
      const content = await fetchArticleContent(article.url);

      if (!content || content.length < 100) {
        console.warn(`  Warning: Could not fetch content for ${article.title}`);
        summarized.push({
          title: article.title,
          url: article.url,
          summary: '記事の内容を取得できませんでした。リンクから直接ご確認ください。',
        });
        continue;
      }

      // 本文を要約
      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: summaryPrompt + '\n' + content,
          },
        ],
      });

      const summary =
        message.content[0].type === 'text' ? message.content[0].text.trim() : '';

      summarized.push({
        title: article.title,
        url: article.url,
        summary,
      });

      // Rate limiting対策: 少し待機
      if (i < articles.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`  Error summarizing article: ${article.title}`, error);
      // エラーが発生した場合もスキップして続行
      summarized.push({
        title: article.title,
        url: article.url,
        summary: '要約の生成に失敗しました。',
      });
    }
  }

  console.log(`✓ Summarized ${summarized.length} articles`);
  return summarized;
}
