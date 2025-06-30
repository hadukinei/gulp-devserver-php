# gulp-devserver-php

|言語|Language|
|---|---|
|[<img width="24" height="24" align="left" src="README.img/1f1ef-1f1f5.png" alt="🇯🇵"> 日本語](README.md)|[<img width="24" height="24" align="left" src="README.img/1f1fa-1f1f8.png" alt="🇺🇸"> English](README_EN.md)|


## Revision: in v1.1.2

- Add type definition (export declare) in `index.d.ts`.
- Update to latest version about `gulp-devserver-php` in `test/*` folders.


---

This package processes to run on Node.js about PHP.

I design as it runs on [gulp], works as live server for Web-development with [browser-sync] mainly.

And also runs as workflow of PHP singleton which is without any browsers.

I thought developing this package because [gulp-connect-php] did not update for a long time.
There are many codes from which inspired and thank you so much.
But replacing dependency which have any security troubles positively.

[gulp]: https://gulpjs.com/
[browser-sync]: https://github.com/BrowserSync/browser-sync
[gulp-connect-php]: https://github.com/micahblu/gulp-connect-php


## Indexes

- [gulp-devserver-php](#gulp-devserver-php)
  - [Revision: in v1.1.2](#revision-in-v112)
  - [Indexes](#indexes)
  - [Features](#features)
  - [Web development with using gulpfile.mjs only](#web-development-with-using-gulpfilemjs-only)
    - [Initialize](#initialize)
    - [Install](#install)
      - [Changed method to load package](#changed-method-to-load-package)
      - [How to launch a internal webserver](#how-to-launch-a-internal-webserver)
      - [If you does not register to environment variable about path of `php.exe`](#if-you-does-not-register-to-environment-variable-about-path-of-phpexe)
    - [Development](#development)
  - [Web development with using gulpfile.mjs and Docker](#web-development-with-using-gulpfilemjs-and-docker)
    - [Initialize](#initialize-1)
    - [Install](#install-1)
      - [Changed method to load package](#changed-method-to-load-package-1)
      - [How to launch a internal webserver](#how-to-launch-a-internal-webserver-1)
      - [If you does not register to environment variable about path of `php.exe`](#if-you-does-not-register-to-environment-variable-about-path-of-phpexe-1)
    - [Create a Docker container](#create-a-docker-container)
    - [Development](#development-1)
  - [Run PHP in singleton](#run-php-in-singleton)
    - [Initialize](#initialize-2)
    - [Install](#install-2)
      - [Changed method to load package](#changed-method-to-load-package-2)
      - [How to launch a internal webserver](#how-to-launch-a-internal-webserver-2)
    - [Development](#development-2)
  - [Options in the 1st argument on `serve` function](#options-in-the-1st-argument-on-serve-function)
    - [port](#port)
    - [hostname](#hostname)
    - [base](#base)
    - [bin](#bin)
    - [ini](#ini)
    - [debug](#debug)
    - [onother options](#onother-options)
  - [Options in the 2nd argument on `serve` function](#options-in-the-2nd-argument-on-serve-function)


## Features

The source of this package -- [gulp-connect-php] -- is very available when develops PHP website by [gulp].

But that does not update in long time yet, and where are no signs.
When running `npm i`, Node.js warns to execute `npm audit fix` every time.

> However that would not resolve you do!

Therefore I developed newly in which dependency replacing and ESModule (import declaration) using.
This is the `gulp-devserver-php`.


## Web development with using gulpfile.mjs only

### Initialize

Create a project folder, and create next folders.

```
mkdir dist
mkdir src
```

```
+- projectFolder/
  +- dist/
  +- src/
```

Change scripts method in `package.json`.

```json
"scripts": {
  "clean": "gulp clean",
  "build": "gulp",
  "dev": "gulp dev"
}
```


### Install

Let be able to use a `npm`.

```
npm init -y
```

Install packages.

```
npm i browser-sync fs-extra gulp gulp-if gulp-plumber gulp-pug gulp-rename gulp-devserver-php
```

Refer to `test/gulp/gulpfile.mjs` as a sample code.

That is transpiling to `dist/index.php` (or index.html) from `src/index.pug`.


#### Changed method to load package

`gulp-connect-php` case, load package in below code.

```js
import browserSync from 'browser-sync'
import connectPHP from 'gulp-connect-php'
```

In `gulp-devserver-php` case, changed to load package in below code.

```js
import browserSync from 'browser-sync'
import { server as phpServer } from 'gulp-devserver-php'
```

Changed to load exported functions directly.
If you want to load a whole package, then code like below.

```js
import browserSync from 'browser-sync'
import * as devServerPHP from 'gulp-devserver-php'
```


#### How to launch a internal webserver

In whole loaded case, syntax is as before.

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

In newly loaded case, syntax is a bit shortened.

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


#### If you does not register to environment variable about path of `php.exe`

In the case of using WAMP, XAMPP and/or Mac.

Above code will not work because there are not registered in environment variables about path of `php.exe` and `php.ini`.

> If you are installed and registered already Apache and PHP, need not to designate additional settings.

Designate file paths in the 1st argument, in the case of existing files about PHP in your computer.

> The usage is available too if you are already installed PHP but want to use another PHP version.

```js
phpServer(
  {
    base: 'dist',
    bin: "C:/php7.4.13/php.exe",
    ini: "C:/php7.4.13/php.ini",
  },
  // Omitting 2nd argument
)
```

In the case of WAMP or XAMPP, same as above.
But file paths finding is easier than downloaded yourself case, that is as static path located.

```js
phpServer(
  {
    base: 'dist',
    bin: 'C:/wamp64/bin/php/php8.3.14/php.exe',
    ini: 'C:/wamp64/bin/php/php8.3.14/php.ini',
  },
  // Omitting 2nd argument
)
```


### Development

There are commands of npm scripts.

- `npm run clean`: Remove outputed files there are in `dist` folder.
- `npm run build`: Output static fildes into `dist` folder.
- `npm run dev`: Launch development mode. **(This is a main theme of this package.)**

When launched development mode, it will open a new tab of browser which is running PHP.

If you turn a variable `isPHP` to `true` which descripted in `gulpfile.mjs` line 26, so HTML files will process to output as `.php` extension.


## Web development with using gulpfile.mjs and Docker

You can use to develop on Docker too that code in `gulpfile.mjs` by previous section.


### Initialize

Create a project folder, and create next folders.

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

Change scripts method in `package.json`.

```json
"scripts": {
  "clean": "gulp clean",
  "build": "gulp",
  "dev": "gulp dev"
}
```


### Install

Let be able to use a `npm`.

```
npm init -y
```

Install packages.

```
npm i browser-sync fs-extra gulp gulp-if gulp-plumber gulp-pug gulp-rename gulp-devserver-php
```

Refer to `test/docker/gulpfile.mjs` as a sample code.

That is transpiling to `html/app/index.php` (or index.html) from `html/src/index.pug`.


#### Changed method to load package

Refer to [Changed method to load package](#changed-method-to-load-package).


#### How to launch a internal webserver

Refer to [How to launch a internal webserver](#how-to-launch-a-internal-webserver).

Notice there are changed file paths.

> - Changed from `src` to `html/src`.
> - Changed from `dist` to `html/app`.


#### If you does not register to environment variable about path of `php.exe`

Refer to [If you does not register to environment variable about path of `php.exe`](#if-you-does-not-register-to-environment-variable-about-path-of-phpexe).


### Create a Docker container

Create files -- `docker-compose.yml` and `config/web/Dockerfile`.

Refer to `test/docker/`.

In launching `Docker Desktop`, and then execute next command.

```
docker compose up -d
```

Open with browser about `http://localhost:8880`.
So you can see the website which made by Docker container.

If you want to shut down a Docker container, execute the command `docker compose down -v`.


### Development

There are commands of npm scripts.

- `npm run clean`: Remove outputed files there are in `dist` folder.
- `npm run build`: Output static fildes into `dist` folder.
- `npm run dev`: Launch development mode. **(This is a main theme of this package.)**

When launched development mode, it will open a new tab of browser which is running PHP.

If you turn a variable `isPHP` to `true` which descripted in `gulpfile.mjs` line 26, so HTML files will process to output as `.php` extension.

It will not open in new browser tab automatically, even if execute `npm run dev` which means development mode.

By the way you are opened manually `http://localhost:8880`, display website that results by Docker container.

The task of `watch` which are defined in `gulp` -- executes transpiling process automatically, when you are running development mode still and saving files there are `html/src/` folder.


## Run PHP in singleton

You can execute PHP directly.


### Initialize

Create a project folder.

Change scripts method in `package.json`.

```json
"scripts": {
  "serve": "gulp"
}
```


### Install

Let be able to use a `npm`.

```
npm init -y
```

Install packages.

```
npm i gulp gulp-devserver-php
```

Refer to `test/singleton/gulpfile.mjs` as a sample code.

That executes about `index.php`.


#### Changed method to load package

Refer to [Changed method to load package](#changed-method-to-load-package).

```js
import { server as phpServer, closeServer } from 'gulp-devserver-php'
```

You need to close oneself a PHP process which is opened by `gulp`.
There is a function to do which is additional loaded `closeServer()`.


#### How to launch a internal webserver

```js
phpServer({
  //bin: 'C:/wamp64/bin/php/php8.3.14/php.exe',
  //ini: 'C:/wamp64/bin/php/php8.3.14/php.ini',
}, () => {
  closeServer()
})
```

That is simplified because need not to cooperate with `browser-sync` package.

If you want to add settings about file paths to `php.exe` and `php.ini` into `server function (phpServer function)`, refer to [If you does not register to environment variable about path of `php.exe`](#if-you-does-not-register-to-environment-variable-about-path-of-phpexe).

At the 2nd argument of `server function (phpServer function)`, execute a PHP process closing.


### Development

There are commands of npm scripts.

- `npm run serve`: Execute about `index.php`.

In the case of checking about content of variable, let not be bringing out to the Standard Input/Output (STDIO) by `var_dump()`, please use `error_log($data, 4);`.

> There is a value of `4` in the 2nd argument, which means to send to handler for log outputing.
>
> This package lets output to terminal by using error logs.


## Options in the 1st argument on `serve` function

There are settings that is based on `gulp-connect-php`.
Almost saying, you need not to designate any settings.
But may to be ought to do about `bin` and `ini`.


### port

Designate port number about when access to web server.

Default value: `8000` (number)


### hostname

Designate hostname about when access to web server.

Default value: `127.0.0.1` (string)

> In internal processing, that is as same as `localhost`.


### base

Designate folder which works as base directory on web server.

Default value: `.` (string)

In default case, base directory is where exists a `gulpfile.mjs`.


### bin

Designate file path to `php.exe`.

Default value: `php` (string)

In registered a PHP into environment variable case, `php` means as retrieve file paths from that.

But you need to designate a file path to `php.exe`, in the case of using WAMP or XAMPP, pre-installed but disable to use PHP like a Mac, or to want to use another PHP version against installed one.


### ini

Designate file path to `php.ini`.

Default value: none (not set)

If you did not designate this value, this package may make to retrieve a file path from environment variable.

When you designate `bin` value, and also need to do `ini` value which is file path to `php.ini`.

And you can designate a expected value.


### debug

Designate a boolean value `true`, if you want to see arguments that send to `php.exe`.

Default value: `false` (boolean)

If you turn to `true`, this package displays to terminal about arguments of `php.exe` and PHP logs that includes error and access logs.


### onother options

Refer to [options in `gulp-connect-php`](https://www.npmjs.com/package/gulp-connect-php#options).


## Options in the 2nd argument on `serve` function

This is a callback function which will fire after processed about PHP scripts.

Please use for closing PHP process, displaying terminated message, or more.
