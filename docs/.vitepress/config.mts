import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Librairie Sans Titre",
  description: "Documentation",
  lastUpdated: true,
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', items: [
        { text: 'Introduction', link: '/guide/introduction' },
        { text: 'General Settings', link: '/guide/general-settings' },
      ] },
      { text: 'Events', link: '/events/creating-events' }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/guide/introduction' },
          { text: 'General Settings', link: '/guide/general-settings' },
        ]
      },
      {
        text: 'Events',
        items: [
          { text: 'Creating Events', link: '/events/creating-events' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-org/your-repo' }
    ]
  }
}) 