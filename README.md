# Tech News Summary

はてなブックマークのテクノロジーカテゴリから週次で記事をピックアップし、Claude APIで要約してSlackに投稿するツールです。

## 機能

- はてなブックマークのテクノロジーカテゴリRSSから記事を取得
- Claude APIで対象読者に適した10記事を自動選定
- 各記事をClaude APIで200-300文字に要約
- Slackチャンネルに整形して投稿
- GitHub Actionsで毎週月曜日に自動実行

## 対象読者

Web制作会社に勤務する以下の職種の方々向けに記事を選定します：
- ディレクター
- デザイナー
- フロントエンドエンジニア

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`を`.env`にコピーして、以下の環境変数を設定してください：

```bash
cp .env.example .env
```

#### 必要な環境変数

- `ANTHROPIC_API_KEY`: Anthropic APIキー（[Console](https://console.anthropic.com/)で取得）
- `SLACK_BOT_TOKEN`: Slack Bot Token（後述の手順で取得）
- `SLACK_CHANNEL_ID`: 投稿先のSlackチャンネルID

#### Slack Botの設定手順

1. [Slack API](https://api.slack.com/apps)にアクセス
2. 「Create New App」→「From scratch」を選択
3. App NameとWorkspaceを設定
4. 「OAuth & Permissions」で以下のBot Token Scopesを追加：
   - `chat:write`
   - `chat:write.public`
5. 「Install to Workspace」でアプリをインストール
6. 表示される「Bot User OAuth Token」（`xoxb-`で始まる）をコピーして`SLACK_BOT_TOKEN`に設定
7. Slackで投稿先のチャンネルIDを取得（チャンネル右クリック→「リンクをコピー」の末尾）

### 3. ビルド

```bash
npm run build
```

## 使い方

### ローカルで実行

```bash
npm start
```

### 開発モード（TypeScriptを直接実行）

```bash
npm run dev
```

## GitHub Actionsでの自動実行

### 1. GitHubリポジトリのSecretsに環境変数を設定

リポジトリの Settings → Secrets and variables → Actions → New repository secret で以下を追加：

- `ANTHROPIC_API_KEY`
- `SLACK_BOT_TOKEN`
- `SLACK_CHANNEL_ID`

### 2. スケジュール

毎週月曜日 0:00 UTC（日本時間 9:00）に自動実行されます。

### 3. 手動実行

Actions タブから「Weekly Tech News Summary」を選択し、「Run workflow」で手動実行も可能です。

## プロジェクト構成

```
.
├── src/
│   ├── index.ts              # メインエントリーポイント
│   ├── types.ts              # 型定義
│   ├── hatena/
│   │   └── fetcher.ts        # はてなブックマークRSS取得
│   ├── claude/
│   │   ├── selector.ts       # Claude APIで記事選定
│   │   └── summarizer.ts     # Claude APIで記事要約
│   └── slack/
│       └── notifier.ts       # Slack通知
├── .github/
│   └── workflows/
│       └── weekly-summary.yml # GitHub Actions設定
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## ライセンス

MIT
