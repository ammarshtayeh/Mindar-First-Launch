"use client"

import Head from 'next/head'
import { useI18n } from '@/lib/i18n'

interface MetaTagsProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  author?: string
  publishedTime?: string
  modifiedTime?: string
}

export function MetaTags({
  title = 'MINDAR - AI-Powered Quiz Generator',
  description = 'Transform your study materials into smart quizzes and flashcards in seconds using AI. Upload PDF or PPTX files and start learning smarter.',
  keywords = 'quiz generator, AI quiz, flashcards, study tool, education, learning, AI learning, smart study',
  image = '/og-image.png',
  url = 'https://mindar.tech',
  type = 'website',
  author = 'Ammar Shtayeh',
  publishedTime,
  modifiedTime
}: MetaTagsProps) {
  const { language } = useI18n()
  
  const fullTitle = title.includes('MINDAR') ? title : `${title} | MINDAR`
  const fullUrl = url.startsWith('http') ? url : `https://mindar.tech${url}`
  const fullImage = image.startsWith('http') ? image : `https://mindar.tech${image}`

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      
      {/* Language */}
      <meta httpEquiv="content-language" content={language} />
      <link rel="alternate" hrefLang="ar" href={`${fullUrl}?lang=ar`} />
      <link rel="alternate" hrefLang="en" href={`${fullUrl}?lang=en`} />
      <link rel="alternate" hrefLang="x-default" href={fullUrl} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="MINDAR" />
      <meta property="og:locale" content={language === 'ar' ? 'ar_AR' : 'en_US'} />
      
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:creator" content="@mindar_app" />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      
      {/* Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#6366f1" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Favicon */}
      <link rel="icon" href="/icon-2026.png" />
      <link rel="apple-touch-icon" href="/apple-icon.png" />
    </Head>
  )
}
