import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'product' | 'article'
  price?: number
  currency?: string
  availability?: 'in stock' | 'out of stock'
  brand?: string
  category?: string
}

const SEO = ({
  title = 'Premium Perfumes & Fragrances - Scentrise',
  description = 'Discover luxury perfumes and fragrances from top brands. Shop authentic designer perfumes for men and women with fast delivery and genuine products.',
  keywords = 'perfume, fragrance, luxury perfumes, designer perfumes, cologne, eau de parfum, eau de toilette, men perfume, women perfume',
  image = '/scentrise-og-image.jpg',
  url = 'https://scentrise.com',
  type = 'website',
  price,
  currency = 'INR',
  availability,
  brand,
  category
}: SEOProps) => {
  const siteName = 'Scentrise'
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'product' ? 'Product' : 'WebSite',
    name: fullTitle,
    description,
    url,
    ...(type === 'website' && {
      potentialAction: {
        '@type': 'SearchAction',
        target: `${url}/catalog?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    }),
    ...(type === 'product' && {
      brand: {
        '@type': 'Brand',
        name: brand
      },
      category,
      image,
      offers: {
        '@type': 'Offer',
        price,
        priceCurrency: currency,
        availability: availability === 'in stock' 
          ? 'https://schema.org/InStock' 
          : 'https://schema.org/OutOfStock'
      }
    })
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Product specific meta tags */}
      {type === 'product' && price && (
        <>
          <meta property="product:price:amount" content={price.toString()} />
          <meta property="product:price:currency" content={currency} />
          <meta property="product:availability" content={availability} />
          {brand && <meta property="product:brand" content={brand} />}
          {category && <meta property="product:category" content={category} />}
        </>
      )}

      {/* Additional SEO meta tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="author" content="Scentrise Team" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Language and locale */}
      <meta httpEquiv="content-language" content="en-IN" />
      <meta property="og:locale" content="en_IN" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Additional structured data for e-commerce */}
      {type === 'website' && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: siteName,
            url,
            logo: `${url}/logo.png`,
            sameAs: [
              'https://www.facebook.com/scentrise',
              'https://www.instagram.com/scentrise',
              'https://twitter.com/scentrise'
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+91-XXXXXXXXXX',
              contactType: 'customer service',
              availableLanguage: ['English', 'Hindi']
            }
          })}
        </script>
      )}

      {/* Favicon and app icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Theme color for mobile browsers */}
      <meta name="theme-color" content="#8B5CF6" />
      <meta name="msapplication-TileColor" content="#8B5CF6" />
    </Helmet>
  )
}

export default SEO
