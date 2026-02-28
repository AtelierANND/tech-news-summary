export interface Article {
  title: string;
  link: string;
  pubDate?: string;
  contentSnippet?: string;
}

export interface SelectedArticle {
  title: string;
  url: string;
}

export interface SummarizedArticle {
  title: string;
  url: string;
  summary: string;
}
