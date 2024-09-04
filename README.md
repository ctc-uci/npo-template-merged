# npo-template-merged

## Quickstart

### 1. Clone this repository, then `cd` into the directory

```shell
  > git clone https://github.com/ctc-uci/npo-template-merged.git
  > cd npo-template-merged
```

> [!TIP]
> `npo-template-merged` is a template repository. [You can create a copy through Github.](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)

### 2. Install dependencies

Install [Node.js, version 18.20.4)](https://nodejs.org/en/download/package-manager). 

> [!TIP]
> On MacOS and Linux, installing Node with `nvm` is recommended!

Install [Yarn](https://classic.yarnpkg.com/lang/en/), our package manager of choice.

```shell
  > npm install --global yarn
```

Now, install packages:

```shell
  > yarn install
```

> [!TIP]
> This monorepo uses [Yarn Workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/) to manage dependencies across repositories. Unless you know what you're doing, you should install dependencies (`yarn install`) at the root of the repository (i.e. not in `/client` or `/server`).
> 
> However, you should add _new_ dependencies (`yarn add`) in the directory which actually uses them.

### 3. Get environment secrets

Both the `client` and `server` directories have their own `env.local` and `.env` files, respectively. If you're a general member, these secrets should be provided to you by your tech leads. 

For this quickstart, `client` secrets consist mostly of Firebase secrets, which can be created in the [Firebase console](https://console.firebase.google.com/). `server` secrets consist mostly of database connection strings and can be created with your choice of database provider (in CTC's case, usually AWS).

Examples of what your secrets should look like are provided in `client/.env.example` and `server/.env.example`.

### 4. Start developing!

Start the development server by running this command:

```shell
  > yarn dev
```

## Client
The frontend repository is built with Vite, React, and Typescript.

## Server
The backend respository is built with Node.js, Express.js, and your choice of database (SQL/NoSQL). This template uses PostgreSQL by default, but both MySQL and MongoDB are available as plug-and-play options as well.
