
## Googleによる認証の準備

https://console.developers.google.com/

* プロジェクトを作成
    * プロジェクト名に適当な名前を付ける
    * Google+ APIを有効にする
* 認証情報の作成
    * OAuthクライアントIDの作成
    * アプリケーションの種類はWebアプリケーション
    * 認証済みリダイレクトURIに `http://ドメイン/auth/google/callback` のようにリダイレクトURLを追加する。
* クライアントIDとクライアントシークレットをコピー
