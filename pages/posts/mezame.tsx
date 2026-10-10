import siteConfig from 'config/site';
import { Post, ReadingTime } from 'types/post';

import { MezameStory, mezameOutline } from '@core/components/MezameStory';
import { storyTitle } from '@core/components/MezameStory/storyContent';
import { BlogPost } from '@core/features/BlogPost';

const frontMatter: Post & { readingTime: ReadingTime } = {
  date: '2026-09-28T12:00:00.000Z',
  updated: '2026-09-28T12:00:00.000Z',
  slug: 'mezame',
  title: storyTitle,
  subtitle:
    'Behind the scenes at St. Bartholomew’s, from Friday’s setup to Saturday’s performances.',
  readingTime: { text: '' },
};

const Mezame = () => (
  <BlogPost
    frontMatter={frontMatter}
    ogImage={siteConfig.image}
    immersive
    outline={mezameOutline}
  >
    <MezameStory />
  </BlogPost>
);

export default Mezame;
