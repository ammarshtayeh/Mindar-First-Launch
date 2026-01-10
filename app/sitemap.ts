import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mindar.app'
  
  const routes = [
    '',
    '/about',
    '/quiz',
    '/flashcards',
    '/leaderboard',
    '/hub',
    '/todo',
    '/challenge',
    '/privacy',
    '/terms'
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly' as any,
    priority: route === '' ? 1.0 : 0.8,
    alternates: {
      languages: {
        ar: `${baseUrl}${route}?lang=ar`,
        en: `${baseUrl}${route}?lang=en`
      }
    }
  }))
}
