import { WebClient } from '@slack/web-api';
import { SummarizedArticle } from '../types';

export async function sendToSlack(
  articles: SummarizedArticle[],
  token: string,
  channelId: string
): Promise<void> {
  const client = new WebClient(token);

  try {
    // ヘッダーメッセージを送信
    await client.chat.postMessage({
      channel: channelId,
      text: '今週のテックニュースまとめ',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📰 今週のテックニュースまとめ',
          },
        },
      ],
    });

    // 各記事を個別に送信（Slackの文字数制限を回避）
    for (const article of articles) {
      const message = formatSingleArticle(article);

      await client.chat.postMessage({
        channel: channelId,
        text: article.title,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: message,
            },
          },
          {
            type: 'divider',
          },
        ],
      });

      // Rate limiting対策: 少し待機
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log('✓ Successfully sent message to Slack');
  } catch (error) {
    console.error('Error sending message to Slack:', error);
    throw error;
  }
}

function formatSingleArticle(article: SummarizedArticle): string {
  return `*${article.title}*\n${article.url}\n${article.summary}`;
}
