import { useEffect } from 'react'

interface SEOOptions {
  title: string
  description?: string
  image?: string
  url?: string
  type?: string
}

function setMeta(name: string, content: string, property = false) {
  const attr = property ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.content = content
}

export function useSEO({ title, description, image, url, type = 'article' }: SEOOptions) {
  useEffect(() => {
    const fullTitle = title.includes('Whatz') ? title : `${title} · Whatz`
    document.title = fullTitle

    if (description) {
      setMeta('description', description)
      setMeta('og:description', description, true)
      setMeta('twitter:description', description)
    }

    setMeta('og:title', fullTitle, true)
    setMeta('twitter:title', fullTitle)
    setMeta('og:type', type, true)

    const pageUrl = url || window.location.href
    setMeta('og:url', pageUrl, true)

    if (image) {
      setMeta('og:image', image, true)
      setMeta('twitter:card', 'summary_large_image')
      setMeta('twitter:image', image)
    } else {
      setMeta('twitter:card', 'summary')
    }

    return () => {
      document.title = 'Whatz'
    }
  }, [title, description, image, url, type])
}
