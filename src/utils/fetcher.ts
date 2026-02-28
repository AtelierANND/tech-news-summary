import * as cheerio from 'cheerio';

export async function fetchArticleContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 不要な要素を削除
    $('script').remove();
    $('style').remove();
    $('nav').remove();
    $('header').remove();
    $('footer').remove();
    $('iframe').remove();

    // 記事本文を抽出（一般的なセレクタ）
    let content = '';
    const articleSelectors = [
      'article',
      '[role="main"]',
      '.article-content',
      '.post-content',
      '.entry-content',
      'main',
    ];

    for (const selector of articleSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text();
        break;
      }
    }

    // セレクタで取得できなかった場合はbody全体から取得
    if (!content || content.length < 100) {
      content = $('body').text();
    }

    // 空白を整理
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    // 文字数制限（Claude APIの入力制限を考慮）
    const maxLength = 10000;
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + '...';
    }

    return content;
  } catch (error) {
    console.error(`  Error fetching article content from ${url}:`, error);
    return '';
  }
}
