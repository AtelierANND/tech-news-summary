import dotenv from 'dotenv';
import { fetchArticles } from './hatena/fetcher';
import { selectArticles } from './claude/selector';
import { summarizeArticles } from './claude/summarizer';
import { sendToSlack } from './slack/notifier';

dotenv.config();

async function main() {
  console.log('🚀 Starting tech news summary generation...\n');

  // 環境変数のチェック
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const slackBotToken = process.env.SLACK_BOT_TOKEN;
  const slackChannelId = process.env.SLACK_CHANNEL_ID;

  if (!anthropicApiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }
  if (!slackBotToken) {
    throw new Error('SLACK_BOT_TOKEN is not set');
  }
  if (!slackChannelId) {
    throw new Error('SLACK_CHANNEL_ID is not set');
  }

  try {
    // 1. はてなブックマークから記事取得
    console.log('Step 1: Fetching articles from Hatena Bookmark...');
    const articles = await fetchArticles();
    console.log('');

    // 2. Claude APIで記事選定
    console.log('Step 2: Selecting articles with Claude API...');
    const selectedArticles = await selectArticles(articles, anthropicApiKey);
    console.log('');

    // 3. Claude APIで記事要約
    console.log('Step 3: Summarizing articles with Claude API...');
    const summarizedArticles = await summarizeArticles(
      selectedArticles,
      anthropicApiKey
    );
    console.log('');

    // 4. Slackに送信
    console.log('Step 4: Sending to Slack...');
    await sendToSlack(summarizedArticles, slackBotToken, slackChannelId);
    console.log('');

    console.log('✅ All done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
