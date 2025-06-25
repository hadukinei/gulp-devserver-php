# gulp-devserver-php

|言語|Language|
|---|---|
|[<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵"> 日本語](README.md)|[<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸"> English](README_EN.md)|


## 更新点: v1.1.0

- stdioの初期値を "pipe" に変更
- ログの出力方法を変更
- パッケージ: [chalk](https://github.com/chalk/chalk)を追加


---

このパッケージはNode.js上でPHPを扱います。

[gulp]での動作を想定しており、主に[browser-sync]と連動した開発用ライブサーバーとして機能させます。

またブラウザを起動せず、直接PHPの処理を実行させることも可能です。

このパッケージは[gulp-connect-php]が長くアップデートされていないために作成したもので、コードの大部分に影響を受けていますが、セキュリティに問題のある依存パッケージは積極的に別のものへと置き換えています。

[gulp]: https://gulpjs.com/
[browser-sync]: https://github.com/BrowserSync/browser-sync
[gulp-connect-php]: https://github.com/micahblu/gulp-connect-php


## 目次

- [gulp-devserver-php](#gulp-devserver-php)
  - [更新点: v1.1.0](#更新点-v110)
  - [目次](#目次)
  - [特徴](#特徴)
  - [gulpfile.mjs単体での利用](#gulpfilemjs単体での利用)
    - [初期化](#初期化)
    - [インストール](#インストール)
      - [読み込み方法の変更](#読み込み方法の変更)
      - [サーバーの起動方法](#サーバーの起動方法)
      - [`php.exe`へのパスを環境変数に登録していない場合](#phpexeへのパスを環境変数に登録していない場合)
    - [開発](#開発)
  - [Dockerを用いたgulpfile.mjsでの利用](#dockerを用いたgulpfilemjsでの利用)
    - [初期化](#初期化-1)
    - [インストール](#インストール-1)
      - [読み込み方法の変更](#読み込み方法の変更-1)
      - [サーバーの起動方法](#サーバーの起動方法-1)
      - [PHP.exeへのパスを環境変数に登録していない場合](#phpexeへのパスを環境変数に登録していない場合-1)
    - [Dockerコンテナの作成](#dockerコンテナの作成)
    - [開発](#開発-1)
  - [ブラウザを使わずにPHPを直接利用する](#ブラウザを使わずにphpを直接利用する)
    - [初期化](#初期化-2)
    - [インストール](#インストール-2)
      - [読み込み方法の変更](#読み込み方法の変更-2)
      - [サーバーの起動方法](#サーバーの起動方法-2)
    - [開発](#開発-2)
  - [第一引数のオプション](#第一引数のオプション)
    - [port](#port)
    - [hostname](#hostname)
    - [base](#base)
    - [bin](#bin)
    - [ini](#ini)
    - [debug](#debug)
    - [その他のオプション](#その他のオプション)
  - [第二引数](#第二引数)


## 特徴

元となった`gulp-connect-php`はgulpを使ったPHPサイトの制作に欠かせないとても素晴らしいパッケージですが、長らくアップデートされておらず、`npm i`する度に`npm audit fix`するよう警告されます。

> そして実行しても警告文は解消されません！

そこでパッケージを更新しつつ、ESModule形式（import文）へ書き換えることにしたのがこの`gulp-devserver-php`プラグインです。


## gulpfile.mjs単体での利用

### 初期化

プロジェクトフォルダを作成し、次のフォルダを作成します。

```
mkdir dist
mkdir src
```

```
+- projectFolder/
  +- dist/
  +- src/
```

`package.json`のscriptsメソッドを更新します。

```json
"scripts": {
  "clean": "gulp clean",
  "build": "gulp",
  "dev": "gulp dev"
}
```


### インストール

`npm`を使えるようにします。

```
npm init -y
```

パッケージをインストールします。

```
npm i browser-sync fs-extra gulp gulp-if gulp-plumber gulp-pug gulp-rename gulp-devserver-php
```

gulpfile.mjsの作成例は、`test/gulp/gulpfile.mjs`を参照してください。

`src/index.pug`を`dist/index.php`（またはindex.html）へとトランスパイルしています。


#### 読み込み方法の変更

`gulp-connect-php`では次のようにパッケージを読み込んでいました。

```js
import browserSync from 'browser-sync'
import connectPHP from 'gulp-connect-php'
```

gulp-devserver-phpでは読み込み方法が変わっています。

```js
import browserSync from 'browser-sync'
import { server as phpServer } from 'gulp-devserver-php'
```

関数そのものを呼び出すように変更していますが、パッケージ全体を読み込む場合は次のようにしてください。

```js
import browserSync from 'browser-sync'
import * as devServerPHP from 'gulp-devserver-php'
```


#### サーバーの起動方法

パッケージ全体を読み込んだ場合、従来通りの書き方になります。

```js
devServerPHP.server(
  {
    base: 'dist',
  },
  () => {
    browserSync.init({
      proxy: 'localhost:8000',
    })
  }
)
```

新たに導入した関数としての読み込みを行った場合、少しだけ簡略化できます。

```js
phpServer(
  {
    base: 'dist',
  },
  () => {
    browserSync.init({
      proxy: 'localhost:8000',
    })
  }
)
```


#### `php.exe`へのパスを環境変数に登録していない場合

WAMPやXAMPP、そしてMacで利用する場合の話。

`php.exe`と`php.ini`へのパスが環境変数に登録されていないため、上記の例のままでは動作しません。

> ApacheやPHPのインストールが完了している場合、この章での追加設定は必要ありません。

PHPの関連ファイルがすでにパソコン内に保存されている場合は、ファイルパスを第一引数に加えます。

> パスが環境変数に登録している状態でも、別バージョンのPHPで動作させたい場合にも下記の例は有効です。

```js
phpServer(
  {
    base: 'dist',
    bin: "C:/php7.4.13/php.exe",
    ini: "C:/php7.4.13/php.ini",
  },
  // 省略
)
```

WAMP・XAMPPを用いる場合も同様ですが、ファイルの保存場所は（自分でインストールする場合に比べて）固定的であるため分かりやすいでしょう。

```js
phpServer(
  {
    base: 'dist',
    bin: 'C:/wamp64/bin/php/php8.3.14/php.exe',
    ini: 'C:/wamp64/bin/php/php8.3.14/php.ini',
  },
  // 省略
)
```


### 開発

ターミナルから実行可能なコマンドは以下の通りです。

- `npm run clean`: 出力したファイルを削除する
- `npm run build`: 静的なファイルを出力する
- `npm run dev`: 開発モードを起動する **（今回の主眼）**

開発モードを起動すると、ブラウザの新しいタブでPHPが動作するはずです。

`gulpfile.mjs`の26行目にある変数を切り替えれば、出力されるファイルの拡張子は`.php`と`.html`とで変わります。


## Dockerを用いたgulpfile.mjsでの利用

gulpfile.mjs単体での利用を応用して、Dockerでも動作させることが可能です。

### 初期化

プロジェクトフォルダを作成し、次のフォルダを作成します。

```
mkdir config
cd config
mkdir web
cd ../
mkdir html
cd html
mkdir app
mkdir src
cd ../
```

```
+- projectFolder/
  +- config/
  | +- web/
  +- html/
    +- app/
    +- src/
```

`package.json`のscriptsメソッドを更新します。

```json
"scripts": {
  "clean": "gulp clean",
  "build": "gulp",
  "dev": "gulp dev"
}
```


### インストール

`npm`を使えるようにします。

```
npm init -y
```

パッケージをインストールします。

```
npm i browser-sync fs-extra gulp gulp-if gulp-plumber gulp-pug gulp-rename gulp-devserver-php
```

gulpfile.mjsの作成例は、`test/docker/gulpfile.mjs`を参照してください。

`html/src/index.pug`を`html/app/index.php`（またはindex.html）へとトランスパイルしています。


#### 読み込み方法の変更

gulpfile.mjs単体利用の[読み込み方法の変更](#読み込み方法の変更)を参照してください。


#### サーバーの起動方法

gulpfile.mjs単体利用の[サーバーの起動方法](#サーバーの起動方法)を参照してください。

フォルダパスが変わっていますので、その点だけご注意ください。

> - `src`フォルダ: `html/src`フォルダへ変更
> - `dist`フォルダ: `html/app`フォルダへ変更


#### PHP.exeへのパスを環境変数に登録していない場合

gulpfile.mjs単体利用の[PHP.exeへのパスを環境変数に登録していない場合](#phpexeへのパスを環境変数に登録していない場合)を参照してください。


### Dockerコンテナの作成

`docker-compose.yml`と、`config/web/Dockerfile`を作成します。

作成例は`test/docker/`フォルダを参照してください。

`Docker Desktop`を起動した状態で、ターミナルから次のコマンドを実行します。

```
docker compose up -d
```

`http://localhost:8880`をブラウザで開けば、Dockerコンテナの管理下にある開発サーバを確認できるでしょう。

Dockerコンテナの利用を終了したい場合は`docker compose down -v`コマンドから実行可能です。


### 開発

ターミナルから実行可能なコマンドは以下の通りです。

- `npm run clean`: 出力したファイルを削除する
- `npm run build`: 静的なファイルを出力する
- `npm run dev`: 開発モードでコーディングする **（今回の主眼）**

`gulpfile.mjs`の26行目にある変数を切り替えれば、出力されるファイルの拡張子は`.php`と`.html`とで変わります。

開発モードを実行しても、ブラウザの新しいタブで自動的に開かれることはありません。

代わりに`http://localhost:8880`をブラウザで開くと、Dockerを利用した出力結果が表示されます。

開発モードを起動したまま`html/src/`フォルダの中身を更新・保存すると`gulp`の`watch`タスクが自動的にトランスパイル処理を実行してくれますが、ブラウザのオートリロードは働いていないので手動リロードが必要になります。


## ブラウザを使わずにPHPを直接利用する

直接PHPを実行することも可能です。


### 初期化

プロジェクトフォルダを作成します。

`package.json`のscriptsメソッドを更新します。

```json
"scripts": {
  "serve": "gulp"
}
```


### インストール

`npm`を使えるようにします。

```
npm init -y
```

パッケージをインストールします。

```
npm i gulp gulp-devserver-php
```

gulpfile.mjsの作成例は、`test/singleton/gulpfile.mjs`を参照してください。

`index.php`の内容を実行しています。


#### 読み込み方法の変更

gulpfile.mjs単体利用の[読み込み方法の変更](#読み込み方法の変更)を参照してください。

```js
import { server as phpServer, closeServer } from 'gulp-devserver-php'
```

開いたPHPのプロセスを閉じる必要がありますので、そのための関数を追加で読み込んでいる点に注意してください。


#### サーバーの起動方法

```js
phpServer({
  //bin: 'C:/wamp64/bin/php/php8.3.14/php.exe',
  //ini: 'C:/wamp64/bin/php/php8.3.14/php.ini',
}, () => {
  closeServer()
})
```

`browser-sync`パッケージと連動する必要がなくなったため、シンプルになりました。

`server関数 (phpServer関数)`へ`php.exe`・`php.ini`のパスに関する設定を第一引数に追加する場合、[PHP.exeへのパスを環境変数に登録していない場合](#phpexeへのパスを環境変数に登録していない場合)を参照してください。

第二引数では、PHPプロセスを閉じる処理を行っています。


### 開発

ターミナルから実行可能なコマンドは以下の通りです。

- `npm run serve`: index.phpを実行する

変数の内容を確認したい場合は`var_dump()`関数などで標準出力へ持って行くのでなく、`error_log($data, 4)`を用いてください。

> 第二引数の`4`は、ログ出力用のハンドラへ渡すための指定です
>
> ここではエラーログを使って、ターミナルに出力させています


## 第一引数のオプション

概ね`gulp-connect-php`に準拠しており、`bin`・`ini`を除けば特に指定をしなくても動作してくれると思います。


### port

アクセスする時のポート番号を指定します。

初期値: `8000` (number)


### hostname

アクセスする時のホスト名を指定します。

初期値: `127.0.0.1` (string)

> 内部的には`localhost`と同じです。


### base

どのフォルダをサーバとしての基本ディレクトリとするかを指定します。

初期値: `.` (string)

ここでは`gulpfile.mjs`が存在しているフォルダが対象となります。


### bin

`php.exe`へのファイルパスを指定します。

初期値: `php` (string)

環境変数に登録している場合、初期値の`php`がファイルパスの代わりになります。

WAMP・XAMPPを利用した環境や、MacなどPHPがインストールされているけれども利用できない状態にされている環境、あるいはインストール済みのPHPではない別バージョンのPHPを利用する場合に`php.exe`へのファイルパスを指定します。


### ini

php.iniへのファイルパスを指定します。

初期値: なし

指定しない場合、環境変数からphp.iniへのファイルパスを取得します。

`bin`を指定した場合、同時に`ini`も指定する必要があります。

また独自のphp.iniへと切り替える場合にも指定することが可能です。


### debug

`php.exe`へ渡される引数を確認するかどうかを指定します。

初期値: `false` (boolean)

`true`へ変更すると、`php.exe`の引数とログ（エラーログやアクセスログなど）がターミナルに出力されるようになります。


### その他のオプション

[`gulp-connect-php`のオプション](https://www.npmjs.com/package/gulp-connect-php#options)を参照してください。


## 第二引数

PHPの処理が完了した後に実行されるコールバック関数となっています。

PHPのプロセスを閉じたり、完了メッセージを表示したりする時にご利用ください。
