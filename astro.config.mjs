import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { remarkInternalLinks, remarkFolderImages, remarkImageCaptions } from './src/utils/internallinks.ts';
import remarkCallouts from './src/utils/remark-callouts.ts';
import remarkImageGrids from './src/utils/remark-image-grids.ts';
import remarkMermaid from './src/utils/remark-mermaid.ts';
import { remarkObsidianEmbeds } from './src/utils/remark-obsidian-embeds.ts';
import remarkMath from 'remark-math';
import remarkReadingTime from 'remark-reading-time';
import remarkToc from 'remark-toc';
import rehypeKatex from 'rehype-katex';
import rehypeMark from './src/utils/rehype-mark.ts';
import rehypeOptimizeImages from './src/utils/rehype-optimize-images.ts';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { siteConfig } from './src/config.ts';
import swup from '@swup/astro';

const DEPLOYMENT_PLATFORM = process.env.DEPLOYMENT_PLATFORM || 'netlify';

export default defineConfig({
  site: siteConfig.site,
  deployment: {
    platform: DEPLOYMENT_PLATFORM
  },
  devToolbar: {
    enabled: true
  },
  // 恢复原来的 image 配置
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
      }
    },
    remotePatterns: [{
      protocol: 'https'
    }]
  },
  integrations: [
    tailwind(),
    sitemap(),
    mdx(),
    swup({
      theme: false,
      animationClass: 'transition-swup-',
      containers: ['#swup-container'],
      smoothScrolling: false,
      cache: true,
      preload: true, 
      accessibility: false,
      updateHead: true,
      updateBodyClass: false,
      globalInstance: true,
      plugins: [],
      skipPopStateHandling: (event) => {
        return true;
      },
      linkSelector: 'a[href]:not([data-no-swup]):not([href^="mailto:"]):not([href^="tel:"])'
    })
  ],
  markdown: {
    // 恢复所有插件
    remarkPlugins: [
      remarkInternalLinks,
      remarkFolderImages,
      remarkObsidianEmbeds,
      remarkImageCaptions,
      remarkMath,
      remarkCallouts,
      remarkImageGrids,
      remarkMermaid,
      [remarkReadingTime, {}],
      [remarkToc, { 
        tight: true,
        ordered: false,
        maxDepth: 3,
        heading: 'contents|table[ -]of[ -]contents?|toc'
      }],
    ],
    rehypePlugins: [
      rehypeKatex,
      rehypeMark,
      rehypeOptimizeImages, // 恢复这个插件
      [rehypeSlug, {
        test: (node) => node.tagName !== 'h1'
      }],
      [rehypeAutolinkHeadings, {
        behavior: 'wrap',
        test: (node) => node.tagName !== 'h1',
        properties: {
          className: ['anchor-link'],
          ariaLabel: 'Link to this section'
        }
      }]
    ],
    image: {
      inferSize: true // 恢复为 true
    },
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  },
  // ... 其他配置保持不变
});