# [Best Mods](https://bestmods.io)
Browse the best mods in gaming from many sources on the Internet!

<a href="https://bestmods.io/" target="_blank"><img src="https://github.com/bestmods/bestmods/blob/main/gitimages/preview01.png" data-canonical-src="https://github.com/BestMods/bestmods/blob/main/gitimages/preview01.png" /></a>

## 2025 Update
While the website is still online, this project **is no longer maintained**! There is a chance I may overhaul the project at a later date, but I have no ETA since I have a lot of other work and projects to work on.

The website is still online as a part of my resume. There is also a lot of valuable code in this repository that I put many hours into making. With that said, I did a horrible job at the front-end design of the website in my opinion and that's something I'd really like to improve on if I do work on the project again. However, back-end wise I think there's a lot of neat functionality in the project.

If you're interested, I've also released the source code of the web scraper [here](https://github.com/bestmods/scan-r-us)!

## About This Project
An open source [website](https://bestmods.io) made by [Christian Deacon](https://github.com/gamemann) that helps users find their favorite mods all in one place! The website also includes Discord login authentication and the ability to upvote and downvote mods. Read more about us [here](https://bestmods.io/about)!

## Showcase
### Desktop
<a href="https://bestmods.io/" target="_blank"><img src="https://github.com/bestmods/bestmods/blob/main/gitimages/preview01.png" data-canonical-src="https://github.com/BestMods/bestmods/blob/main/gitimages/preview01.png" /></a>
<a href="https://bestmods.io/category" target="_blank"><img src="https://github.com/bestmods/bestmods/blob/main/gitimages/preview02.png" data-canonical-src="https://github.com/BestMods/bestmods/blob/main/gitimages/preview02.png" /></a>
<a href="https://bestmods.io/category/sims4" target="_blank"><img src="https://github.com/bestmods/bestmods/blob/main/gitimages/preview03.jpg" data-canonical-src="https://github.com/BestMods/bestmods/blob/main/gitimages/preview03.jpg" /></a>
<a href="https://bestmods.io/browse" target="_blank"><img src="https://github.com/bestmods/bestmods/blob/main/gitimages/preview04.jpg" data-canonical-src="https://github.com/BestMods/bestmods/blob/main/gitimages/preview04.jpg" /></a>
<a href="https://bestmods.io/browse" target="_blank"><img src="https://github.com/bestmods/bestmods/blob/main/gitimages/preview05.png" data-canonical-src="https://github.com/BestMods/bestmods/blob/main/gitimages/preview05.png" /></a>
<a href="https://bestmods.io/view/cs-zr" target="_blank"><img src="https://github.com/bestmods/bestmods/blob/main/gitimages/preview06.jpg" data-canonical-src="https://github.com/BestMods/bestmods/blob/main/gitimages/preview06.jpg" /></a>
<a href="https://bestmods.io/view/cs-zr/install" target="_blank"><img src="https://github.com/bestmods/bestmods/blob/main/gitimages/preview07.jpg" data-canonical-src="https://github.com/BestMods/bestmods/blob/main/gitimages/preview07.jpg" /></a>
<a href="https://bestmods.io/view/cs-zr/sources" target="_blank"><img src="https://github.com/bestmods/bestmods/blob/main/gitimages/preview08.jpg" data-canonical-src="https://github.com/BestMods/bestmods/blob/main/gitimages/preview08.jpg" /></a>

### Mobile
<a href="https://bestmods.io/" target="_blank"><img src="https://github.com/bestmods/bestmods/blob/main/gitimages/preview09.png" data-canonical-src="https://github.com/BestMods/bestmods/blob/main/gitimages/preview09.png" /></a>
<a href="https://bestmods.io/" target="_blank"><img src="https://github.com/bestmods/bestmods/blob/main/gitimages/preview10.png" data-canonical-src="https://github.com/BestMods/bestmods/blob/main/gitimages/preview10.png" /></a>

## Road Map
A road map for the website may be found [here](https://github.com/bestmods/bestmods/milestones)!

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
* PostgreSQL (unless you choose SQLite; See below)
* Node ^14
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

## Permissions
While this project is open source, if you use this full project publicly, please add a link back to Best Mods' [website](https://bestmods.io/) that is visible to the public user. You don't need to do this if you're using *<30%* of the project's code. This is to attempt to mitigate people blatantly copying the project for their own use publicly.

## Credits
* [Christian Deacon](https://github.com/gamemann) - Creator
* [The Modding Community](https://github.com/modcommunity)