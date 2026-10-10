/* eslint-disable no-console */
import chalk from 'chalk';
import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import RSS from 'rss';
import { fileURLToPath } from 'url';

import customPosts from '../config/custom-posts.js';
import siteConfig from '../config/site.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.info(chalk.cyan('info'), ` - Generating RSS feed`);

  const root = process.cwd();

  function getPosts() {
    const files = fs
      .readdirSync(path.join(root, 'content'))
      .filter((name) => name.endsWith('.mdx'));

    const posts = files.reduce((allPosts, postSlug) => {
      const source = fs.readFileSync(
        path.join(root, 'content', postSlug),
        'utf8'
      );
      const { data } = matter(source);

      return [
        {
          ...data,
          slug: postSlug.replace('.mdx', ''),
        },
        ...allPosts,
      ];
    }, []);

    return [...posts, ...customPosts];
  }

  try {
    const feed = new RSS({
      title: "Valerie Andy's Blog",
      description:
        "Hi I'm Valerie Andy, and this is my blog. Home to my audio visualizer series exploring sonic identity through creative code, released every Wednesday. As a computational designer, I dive deep into the intersection of sound, code, and visual expression.",
      site_url: siteConfig.url,
      feed_url: `${siteConfig.url}/rss.xml`,
      image_url: siteConfig.image,
      language: 'en',
    });

    const content = [...getPosts()].sort((post1, post2) =>
      post1.date > post2.date ? -1 : 1
    );

    content.forEach((post) => {
      const url = `${siteConfig.url}/posts/${post.slug}`;

      feed.item({
        title: post.title,
        description: post.subtitle,
        date: new Date(post.date),
        author: 'Valerie Andy',
        url,
        guid: url,
      });
    });

    const rss = feed.xml({ indent: true });
    fs.writeFileSync(path.join(__dirname, '../public/rss.xml'), rss);
  } catch (error) {
    console.error(
      chalk.red('error'),
      ` - An error occurred while generating the RSS feed`
    );
    console.error(error);
    process.exit(1);
  }
})();
