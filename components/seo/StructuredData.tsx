"use client"

import Script from 'next/script'

interface StructuredDataProps {
  type?: 'website' | 'organization' | 'educationalOrganization' | 'softwareApplication'
}

export function StructuredData({ type = 'website' }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mindar.tech'
  
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "MINDAR",
    "alternateName": ["Mindar App", "مندار"],
    "url": baseUrl,
    "description": "Transform your study materials into smart quizzes and flashcards using AI",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "inLanguage": ["ar", "en"]
  }
  
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "MINDAR",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "description": "AI-powered educational platform for creating smart quizzes and flashcards",
    "founder": {
      "@type": "Person",
      "name": "Ammar Shtayeh",
      "url": "https://www.linkedin.com/in/ammar-shtayeh-174259221/"
    },
    "sameAs": [
      "https://www.linkedin.com/in/ammar-shtayeh-174259221/",
      "https://www.instagram.com/ammar._.space"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+972-595-537-190",
      "contactType": "Customer Service",
      "availableLanguage": ["Arabic", "English"]
    }
  }
  
  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "MINDAR",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150"
    },
    "description": "AI-powered quiz and flashcard generator for students",
    "screenshot": `${baseUrl}/screenshot.png`,
    "softwareVersion": "1.0.0",
    "author": {
      "@type": "Person",
      "name": "Ammar Shtayeh"
    }
  }
  
  const getSchema = () => {
    switch (type) {
      case 'organization':
      case 'educationalOrganization':
        return organizationSchema
      case 'softwareApplication':
        return softwareAppSchema
      default:
        return websiteSchema
    }
  }

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(getSchema()) }}
    />
  )
}

// Breadcrumb Schema Component
export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mindar.tech'
  
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  }

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
    />
  )
}
