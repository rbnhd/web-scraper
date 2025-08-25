# Eコマース ウェブスクレイパー

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18.0+-green.svg)
![ライセンス](https://img.shields.io/badge/license-MIT-blue.svg)
![ビルド状態](https://img.shields.io/badge/build-passing-brightgreen.svg)
![カバレッジ](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)

Puppeteerを使用して構築された、様々なEコマースウェブサイトから商品データを抽出するための強力で本格的なNode.jsウェブスクレイパー。

[機能](#機能) • [インストール](#インストール) • [クイックスタート](#クイックスタート) •
[ドキュメント](#ドキュメント) • [貢献](#貢献)

</div>

---

## 重要な注意事項

**学習とテスト目的のために、まずデモスクレイパーを使用してください：**

```bash
npm run demo
```

これは、スクレイピング練習用に設計された安全なテストウェブサイト（books.toscrape.com と quotes.toscrape.com）を使用します。

## 機能

- **マルチサイト対応**: Amazon、eBay、Etsy、Walmartなどからスクレイピング
- **動的コンテンツ処理**: インテリジェントセレクターを使用して動的コンテンツの読み込みを待機
- **エラーハンドリング**: 堅牢な再試行ロジックとエラー復旧
- **CSV エクスポート**: スクレイピングしたデータを整形されたCSVファイルにエクスポート
- **レート制限**: ブロックされることを避けるための組み込み遅延
- **ステルスモード**: ユーザーエージェントローテーションとリクエスト最適化
- **CLI インターフェース**: 使いやすいコマンドラインインターフェース
- **設定可能**: 異なるサイト用のJSONベース設定
- **デモモード**: デモウェブサイトでの安全なテスト環境

## プロジェクト状況

### CI/CD パイプライン

- **マルチNode テスト**: Node.js 18.x、20.x、22.x で検証済み
- **セキュリティスキャン**: 自動脆弱性検出
- **コード品質**: ESLint + Prettier 強制適用
- **依存関係レビュー**: 自動依存関係セキュリティチェック
- **メインブランチ保護**: 包括的な事前デプロイ検証

### パフォーマンス指標

- **スクレイピング速度**: ページあたり2-5秒（設定可能）
- **成功率**: サポートされているデモサイトで95%以上
- **エラー復旧**: 指数バックオフ付き3回再試行メカニズム
- **メモリ効率**: 最適化されたリソースブロッキング

## インストール

### 前提条件

- **Node.js 18.0.0 以上**（最新のPuppeteerバージョンに必要）
- npm（Node.jsに付属）

### セットアップ

1. プロジェクトファイルをクローンまたはダウンロード
2. 依存関係をインストール：

```bash
npm install
```

> **注意**: Node.js < 18を使用している場合、互換性警告が表示される可能性があります。コードはNode.js
> 18+を実行するCI/CD環境で正常に動作します。

## クイックスタート

### 安全なデモ（学習に推奨）

```bash
# 安全なテストウェブサイトでデモを実行
npm run demo

# または直接実行
node demo.js
```

### 実際のEコマースサイト（責任を持って使用）

```bash
# スクレイパー機能をテスト
npm test

# Amazonでワイヤレスヘッドフォンをスクレイピング（ボット検出をトリガーする可能性があります）
node scraper.js amazon "wireless headphones" --delay=5000

# eBayでヴィンテージカメラをスクレイピング
node scraper.js ebay "vintage camera"
```

### 高度な使用法

```bash
# デバッグ用の非ヘッドレスモード（表示可能なブラウザ）で実行
node scraper.js amazon "laptop" --headless=false --delay=3000

# カスタム出力ファイル名
node scraper.js ebay "smartphone" --output=my_products.csv
```

## ボット検出と制限

**Amazonや他の主要なEコマースサイトには高度なボット検出があります：**

- ✅ **デモサイトは完璧に動作**（books.toscrape.com、quotes.toscrape.com）
- ⚠️ **Amazonはリクエストをブロックする可能性** - より長い遅延を使用し、robots.txtを尊重してください
- 📧 **eBayや他のサイトは特別な処理が必要な場合があります**

**ボット検出に遭遇した場合：**

1. 遅延を増やす：`--delay=5000`（5秒）
2. 非ヘッドレスモードを使用：`--headless=false`
3. まずデモサイトを試す：`npm run demo`
4. 代わりに公式APIの使用を検討

## 利用可能なスクリプト

| コマンド          | 説明                                       |
| ----------------- | ------------------------------------------ |
| `npm run demo`    | テストサイトで安全なデモスクレイパーを実行 |
| `npm test`        | 機能テストを実行                           |
| `npm start`       | メインスクレイパーを実行（引数が必要）     |
| `npm run example` | サンプルスクリプトを実行                   |

## サポートされているサイト

### デモサイト（テスト用に安全）

- **books.toscrape.com** - スクレイピング練習用の書籍カタログ
- **quotes.toscrape.com** - スクレイピング練習用の有名な引用

### Eコマースサイト（責任を持って使用）

- **Amazon**（`amazon`）- 特別な処理が必要な場合があります
- **eBay**（`ebay`）
- **Etsy**（`etsy`）
- **Walmart**（`walmart`）

## ドキュメント

### コアAPI

```javascript
const EcommerceScraper = require('./scraper');

// オプション付きで初期化
const scraper = new EcommerceScraper({
  headless: true, // ヘッドレスモードで実行
  delay: 3000, // リクエスト間の遅延（ms）
  outputFile: 'data.csv', // 出力ファイル名
  timeout: 30000, // ページタイムアウト（ms）
  maxRetries: 3 // 最大再試行回数
});

// 商品をスクレイピング
const result = await scraper.scrape('demo', '検索語');
console.log(`成功: ${result.success}, 件数: ${result.count}`);
```

### 設定スキーマ

`config.json`ファイルはサイト固有のセレクターを定義します：

```json
{
  "sites": {
    "siteName": {
      "name": "表示名",
      "baseUrl": "https://example.com",
      "searchUrl": "https://example.com/search?q={query}",
      "selectors": {
        "productContainer": ".product-item",
        "title": ".product-title",
        "price": ".price",
        "link": "a.product-link",
        "image": "img.product-image"
      },
      "waitForSelector": ".product-list",
      "pagination": {
        "nextButton": ".next-page",
        "maxPages": 5
      }
    }
  }
}
```

## 高度な設定

| オプション     | 説明                             | デフォルト             |
| -------------- | -------------------------------- | ---------------------- |
| `--headless`   | ヘッドレスモードでブラウザを実行 | `true`                 |
| `--delay`      | リクエスト間の遅延（ms）         | `2000`                 |
| `--output`     | 出力CSVファイル名                | `scraped_products.csv` |
| `--timeout`    | ページ読み込みタイムアウト（ms） | `30000`                |
| `--maxRetries` | 最大再試行回数                   | `3`                    |

## 出力形式

スクレイパーは以下の列を持つCSVにデータをエクスポートします：

- **ID**: 連続商品ID
- **Product Title**: 商品名/タイトル
- **Price (Numeric)**: クリーンアップされた数値価格
- **Price (Original)**: 元の価格テキスト
- **Product URL**: 商品ページへのリンク
- **Image URL**: 商品画像URL
- **Scraped At**: データがスクレイピングされたタイムスタンプ

## エラーハンドリング

スクレイパーには包括的なエラーハンドリングが含まれています：

- **再試行ロジック**: 失敗したリクエストを自動的に再試行
- **タイムアウト処理**: ページ読み込みタイムアウトを適切に処理
- **ネットワーク問題**: ネットワーク接続問題から復旧
- **要素検出**: 一部の要素が欠落していてもスクレイピングを継続

## レート制限

ウェブサイトにブロックされることを避けるために：

- **デフォルト遅延**: リクエスト間で2秒
- **リクエスト最適化**: 不要なリソース（画像、CSS、フォント）をブロック
- **ユーザーエージェントローテーション**: 現実的なブラウザユーザーエージェントを使用
- **バースト保護**: 急速な連続リクエストを制限

## プログラミングインターフェース

自分のコードでスクレイパーをモジュールとして使用することもできます：

```javascript
const EcommerceScraper = require('./scraper');

async function customScrape() {
  const scraper = new EcommerceScraper({
    headless: true,
    delay: 3000,
    outputFile: 'my_products.csv'
  });

  const result = await scraper.scrape('amazon', 'ワイヤレスマウス');

  if (result.success) {
    console.log(`${result.count}個の商品をスクレイピングしました`);
    console.log(`データの保存先: ${result.outputPath}`);
  }
}
```

## ベストプラクティス

1. **robots.txtを尊重**: ウェブサイトのrobots.txtファイルを確認
2. **適切な遅延を使用**: サーバーを大量のリクエストで圧迫しない
3. **エラーを適切に処理**: 常に適切なエラーハンドリングを実装
4. **レート制限を監視**: 429（Too Many Requests）レスポンスを監視
5. **ユーザーエージェントをローテーション**: 検出を避けるために異なるユーザーエージェントを使用

## 法的考慮事項

- 常にウェブサイトの利用規約を確認してください
- robots.txtファイルを尊重してください
- 個人情報や機密情報をスクレイピングしないでください
- スクレイピングしたデータを責任を持って倫理的に使用してください
- 代わりにAPIアクセスのためにウェブサイトに連絡することを検討してください

## トラブルシューティング

### よくある問題

1. **商品が見つからない**
   - ウェブサイトの構造が変更されていないか確認
   - `config.json`のセレクターを確認
   - `--headless=false`で実行して何が起きているかを確認

2. **タイムアウトエラー**
   - `--timeout=60000`でタイムアウトを増やす
   - インターネット接続を確認
   - 一部のサイトは自動リクエストをブロックしている可能性があります

3. **レート制限の問題**
   - `--delay=5000`で遅延を増やす
   - サイトがボット検出を実装しているかを確認

### デバッグモード

デバッグ用に表示可能なブラウザで実行：

```bash
node scraper.js amazon "test" --headless=false
```

## 🧪 開発

### 前提条件

- Node.js 18.0.0以上
- npmまたはyarnパッケージマネージャー

### ローカル開発環境のセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/your-username/web-scraper.git
cd web-scraper

# 依存関係をインストール
npm install

# 開発モードで実行
npm run dev

# テストを実行
npm test

# リンティングを実行
npm run lint

# コードをフォーマット
npm run format
```

### テスト戦略

```bash
# ユニットテスト
npm run test:unit

# デモサイトとの統合テスト
npm run test:integration

# エンドツーエンドテスト
npm run test:e2e

# カバレッジレポート
npm run test:coverage
```

## デプロイメント

### 本番ビルド

```bash
# 本番パッケージを作成
npm run build

# 本番モードで開始
NODE_ENV=production npm start
```

### Docker サポート

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 パフォーマンスと監視

### メトリクスダッシュボード

```javascript
// 組み込みパフォーマンス監視
const scraper = new EcommerceScraper({ monitoring: true });
const result = await scraper.scrape('demo', 'テスト');

console.log('パフォーマンス指標:', result.metrics);
// {
//   pageLoadTime: 1250,
//   elementsFound: 24,
//   processingTime: 890,
//   memoryUsage: '45MB'
// }
```

### 最適化のヒント

- 🚀 **リソースブロッキング**: 画像、CSS、フォントはデフォルトでブロック
- ⚡ **並行処理**: 複数のページを同時に処理
- 💾 **メモリ管理**: 自動ブラウザコンテキストクリーンアップ
- 🔄 **コネクションプーリング**: 可能な場合はブラウザインスタンスを再利用

## 🔒 セキュリティとプライバシー

### データ保護

- 🛡️ **個人データなし**: 公開商品情報のみ
- 🔐 **セキュアヘッダー**: すべてのリクエストにセキュリティヘッダーを含む
- 🚫 **Cookieなし**: ステートレススクレイピングアプローチ
- 📝 **監査証跡**: コンプライアンスのためすべての活動をログ

### ベストプラクティス準拠

- ✅ **Robots.txt尊重**: 自動robots.txtチェック
- ⏱️ **レート制限**: 組み込みリクエストスロットリング
- 🏃 **優雅な劣化**: サイトの変更を優雅に処理
- 📋 **規約準拠**: ウェブサイトのToSを尊重

## 貢献

貢献を歓迎します！詳細については[貢献ガイドライン](CONTRIBUTING.md)をご覧ください。

### 開発ワークフロー

1. リポジトリを**フォーク**
2. 機能ブランチを**作成**：`git checkout -b feature/amazing-feature`
3. 変更を**コミット**：`git commit -m 'Add amazing feature'`
4. ブランチに**プッシュ**：`git push origin feature/amazing-feature`
5. プルリクエストを**開く**

### 新しいサイトの追加

新しいEコマースサイトのサポートを追加するには：

1. `config.json`にサイト設定を追加
2. セレクターを追加し設定をテスト
3. 新しいサイト用のテストを作成
4. ドキュメントを更新
5. 変更をPRで提出

### コード基準

- ✅ ESLint設定の強制適用
- ✅ Prettierフォーマットが必要
- ✅ 100%テストカバレッジが期待される
- ✅ すべてのパブリックメソッドにJSDocコメント
- ✅ 従来のコミットメッセージ

## 🌐 国際化

このプロジェクトは複数言語をサポートしています：

- 🇺🇸 **英語**（README.md）
- 🇯🇵 **日本語**（このファイル）

## 📞 サポート

### ヘルプの取得

- 📚 **ドキュメント**: [Wiki](../../wiki)を確認
- 🐛 **バグレポート**: [Issue を開く](../../issues/new?template=bug_report.md)
- 💡 **機能リクエスト**: [Issue を開く](../../issues/new?template=feature_request.md)
- 💬 **ディスカッション**: [GitHub Discussions](../../discussions)

### コミュニティ

- 🌟 プロジェクトが役立つと思ったら**スター**をつけてください
- 🐦 アップデートのために**フォロー**してください
- 📢 コミュニティと**共有**してください

## 📄 ライセンス

このプロジェクトはMITライセンスの下でライセンスされています - 詳細については[LICENSE](LICENSE)ファイルをご覧ください。

## 🙏 謝辞

- 優れた自動化ライブラリを提供してくれた**Puppeteerチーム**
- 継続的な革新を行う**Node.jsコミュニティ**
- このプロジェクトの改善を支援してくれる**オープンソース貢献者**
- 安全なスクレイピング環境を提供してくれる**テストウェブサイト**（books.toscrape.com、quotes.toscrape.com）

---

<div align="center">

**コミュニティによって❤️で作られました**

[⬆ トップに戻る](#eコマース-ウェブスクレイパー)

</div>
