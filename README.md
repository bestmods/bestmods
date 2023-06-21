# <a href="https://bestmods.io/" target="_blank"><img src="https://github.com/bestmods/bestmods/blob/main/gitimages/bestmods.png" data-canonical-src="https://github.com/bestmods/bestmods/blob/main/gitimages/bestmods.png" /></a>
Browse the best mods in gaming from many sources on the Internet!

<a href="https://bestmods.io/" target="_blank"><img src="https://github.com/bestmods/bestmods/blob/main/gitimages/preview.jpeg" data-canonical-src="https://github.com/bestmods/bestmods/blob/main/gitimages/preview.jpeg" /></a>

## About This Project
An open-source [website](https://bestmods.io) made by [Christian Deacon](https://github.com/gamemann) that helps users find their favorite mods. Includes Discord login authentication and the ability to upvote or downvote mods!

Please also check out the [@modcommunity](https://github.com/modcommunity)! They are doing things that will change the direction of gaming on a large scale by using modding and open source like never seen before!

## Road Map
A road map for the website may be found [here](https://github.com/bestmods/roadmap/issues)!

Each GitHub project represents a quarter and lists all things we're hoping to get completed by the end of said quarter.

## Contributing
Any help from the open source community is highly appreciated on this project! We utilize the following.

* [Create T3 App](https://create.t3.gg/) (TypeScript).
* [Next.JS](https://nextjs.org/).
* [React](https://reactjs.org/).
* [tRPC](https://trpc.io/).
* [Prisma](https://www.prisma.io/).
* [Tailwind CSS](https://tailwindcss.com/).

Please take a look at our [road map](https://github.com/bestmods/roadmap/issues) and join our [Discord server](https://discord.moddingcommunity.com/) for communication!

## Our Community
[Best Mods](https://bestmods.io) is ran by [Christian Deacon](https://github.com/gamemann) and the [The Modding Community](https://moddingcommunity.com/). We have a Discord [here](https://discord.moddingcommunity.com/) if you want to socialize and interact with others including talented modders and content creators.

Additionally, you may also use our discussions forum [here](https://github.com/orgs/BestMods/discussions)!

### Social Media
* [TikTok](https://tiktok.com/@bestmodsio) (@bestmodsio)
* [Twitter](https://twitter.com/bestmodsio) (@bestmodsio)
* [Instagram](https://instagram.com/bestmodsio) (@bestmodsio)
* [Facebook](https://facebook.com/bestmodsio)
* [Linkedin](https://linkedin.com/company/bestmods)
* [Steam](https://steamcommunity.com/groups/best-mods)
* [Reddit](https://reddit.com/r/bestmods)

## Installation & Deployment
### Requirements
* PostgreSQL (unless you choose SQLite; See below).
* Node >=14
* NPM

### Using SQLite
To use a local SQLite database, perform the following steps.
1. In `prisma/schema.prisma`, replace `provider = "postgresql"` with `provider = "sqlite"`.
1. In `prisma/schema.prisma`, remove all instances of `@db.Text` because PostgreSQL and SQLite have different column definitions for string.
1. In `.env`, set `DATABASE_URL` to `file:./db.sqlite`.

### Installation & Running Dev Server
You may perform the following commands to run the dev web server.

```bash
# Clone respository.
git clone https://github.com/bestmods/bestmods.git

# Change directory.
cd bestmods

# Update and install NPM packages.
npm update
npm install

# Migrate database.
npx prisma db push

# Run dev server.
npm run dev
```

### Production
To run in production, you can use the `npx next build` command to build the web application. Make sure to add `output: "standalone"` to the config variable in `next.config.mjs`.

With that said, you may then run `node server.js`.

## Showcase
<a href="https://bestmods.io/view/mc-jurassicraft" target="_blank"><img src="https://github.com/bestmods/bestmods/blob/main/gitimages/preview2.jpeg" data-canonical-src="https://github.com/BestMods/bestmods/blob/main/gitimages/preview2.jpeg" /></a>
<a href="https://bestmods.io/view/mc-jurassicraft/sources" target="_blank"><img src="https://github.com/bestmods/bestmods/blob/main/gitimages/preview3.jpeg" data-canonical-src="https://github.com/bestmods/bestmods/blob/main/gitimages/preview3.jpeg" /></a>
<a href="https://bestmods.io/view/mc-jurassicraft/downloads" target="_blank"><img src="https://github.com/bestmods/bestmods/blob/main/gitimages/preview4.jpeg" data-canonical-src="https://github.com/bestmods/bestmods/blob/main/gitimages/preview4.jpeg" /></a>

## Credits
* [Christian Deacon](https://github.com/gamemann) - Creator
* [The Modding Community](https://github.com/modcommunity)