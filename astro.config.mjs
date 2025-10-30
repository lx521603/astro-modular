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

// Deployment platform configuration
const DEPLOYMENT_PLATFORM = process.env.DEPLOYMENT_PLATFORM || 'netlify';

export default defineConfig({
  site: siteConfig.site,
  // 🔧 修复1: 添加 base 配置（根据你的部署平台调整）
  base: process.env.CF_PAGES_URL ? new URL(process.env.CF_PAGES_URL).pathname : '/',
  // 🔧 修复2: 统一路径格式
  trailingSlash: 'always',
  
  deployment: {
    platform: DEPLOYMENT_PLATFORM
  },
  devToolbar: {
    enabled: true
  },
  redirects: {
    '/about-me': '/about',
    '/about-us': '/about',
    '/contact-me': '/contact',
    '/contact-us': '/contact',
    '/privacy': '/privacy-policy',
    '/posts/mermaid-test': '/posts/mermaid-diagrams',
    '/posts/mermaid-diagram-test': '/posts/mermaid-diagrams',
    '/posts/astro-suite-vault-modular-guide': '/posts/obsidian-vault-guide',
    '/posts/astro-suite-obsidian-vault-guide-astro-modular': '/posts/obsidian-vault-guide',
    '/projects/obsidian-astro-composer': '/projects/astro-composer',
    '/docs/api-reference': '/docs/api',
    '/docs/astro-modular-configuration': '/docs/configuration',
    '/docs/sourcetree-and-git': '/docs/sourcetree-and-git-setup'
  },
  // 🔧 修复3: 临时禁用图片服务解决构建错误
  image: {
    service: undefined
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
      rehypeOptimizeImages,
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
    // 🔧 修复4: 禁用图片推断
    image: {
      inferSize: false
    },
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  },
  vite: {
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
        '@/components': new URL('./src/components', import.meta.url).pathname,
        '@/layouts': new URL('./src/layouts', import.meta.url).pathname,
        '@/utils': new URL('./src/utils', import.meta.url).pathname,
        '@/types': new URL('./src/types.ts', import.meta.url).pathname,
        '@/config': new URL('./src/config.ts', import.meta.url).pathname
      }
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.ASTRO_CONTENT_COLLECTION_CACHE': 'false'
    },
    optimizeDeps: {
      exclude: ['astro:content']
    },
    exclude: ['**/_redirects']
  },
  build: {
    assets: '_assets'
  }
});