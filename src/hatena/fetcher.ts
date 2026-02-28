import Parser from 'rss-parser';
import { Article } from '../types';

const RSS_URL = 'https://b.hatena.ne.jp/hotentry/it.rss';

export async function fetchArticles(): Promise<Article[]> {
  const parser = new Parser();

  try {
    const feed = await parser.parseURL(RSS_URL);

    const articles: Article[] = feed.items.map((item) => ({
      title: item.title || '',
      link: item.link || '',
      pubDate: item.pubDate,
      contentSnippet: item.contentSnippet,
    }));

    console.log(`✓ Fetched ${articles.length} articles from Hatena Bookmark`);
    return articles;
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    throw error;
  }
}
