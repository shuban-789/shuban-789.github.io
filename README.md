# Astro Starter Kit: Blog

## GitHub Pages deployment

The `Deploy to GitHub Pages` workflow builds Astro on pushes to `master`
and commits the generated site to `docs/` on that same branch. It includes `.nojekyll` so Pages
serves the generated assets directly, and copies the root `CNAME` to preserve the
custom domain.

Run the workflow once to create `docs/`. Then, in **Settings → Pages → Build
and deployment**, select **Deploy from a branch**, choose **master** and
**/docs**, and save. Run the workflow again to publish. Keep editing the source
on `master`; the workflow manages the generated `docs/` folder. Branch rules must
allow the workflow to push these generated commits to `master`.

The workflow explicitly requests a Pages build after publishing because pushes
made with `GITHUB_TOKEN` do not automatically trigger one. No additional token
secret is needed. See [GitHub's publishing-source documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

Post tags and Markdown notes share their colors and default in [`src/tag.config.js`](src/tag.config.js).
Both support `peach`, `sky` (blue), `lavender`, `sage`, `gold`, and `rose`. Change a palette entry's
`bg`, `border`, or `text` value there to update both tags and notes.

Markdown `>` notes automatically cycle through the post's tag colors in frontmatter order. The first
note uses the first tag's color, the second note uses the second tag's color, and the sequence repeats
after the last tag. Each page starts a fresh cycle. Pages without tags use the default `sky` color.

To override the color of an individual note, put `[!color]` at the start of the quote. That note still
counts toward the cycle:

```md
> [!rose]
> NOTE: This note uses the same rose colors as a rose post tag.
>
> Notes can contain multiple paragraphs, **emphasis**, links, and lists.
```

The color marker is hidden in the rendered note. Note text uses normal weight and the surrounding body text
size, and the rounded box grows to fit its content.

```sh
npm create astro@latest -- --template blog
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

Features:

- ✅ Minimal styling (make it your own!)
- ✅ 100/100 Lighthouse performance
- ✅ SEO-friendly with canonical URLs and Open Graph data
- ✅ Sitemap support
- ✅ RSS Feed support
- ✅ Markdown & MDX support

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   └── pages/
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

The `src/content/` directory contains "collections" of related Markdown and MDX documents. Use `getCollection()` to retrieve posts from `src/content/blog/`, and type-check your frontmatter using an optional schema. See [Astro's Content Collections docs](https://docs.astro.build/en/guides/content-collections/) to learn more.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Check out [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Credit

This theme is based off of the lovely [Bear Blog](https://github.com/HermanMartinus/bearblog/).
