// Obtener todas las guías (para index /docs/migracion)
export const ALL_MIGRATION_GUIDES_QUERY = `
  *[_type == "migrationGuide"] | order(tier asc, platform asc) {
    _id,
    platform,
    tier,
    slug,
    platformLogo { asset->{ url } },
    platformColor,
    difficulty,
    estimatedTime,
    lastUpdated,
    supportedEntities,
  }
`

// Obtener una guía específica (para /docs/migracion/[slug])
export const MIGRATION_GUIDE_BY_SLUG_QUERY = `
  *[_type == "migrationGuide" && slug.current == $slug][0] {
    _id,
    platform,
    tier,
    slug,
    platformLogo { asset->{ url } },
    platformColor,
    difficulty,
    estimatedTime,
    lastUpdated,
    prerequisites,
    exportSteps[] {
      ...,
      _type == "image" => { asset->{ url, metadata } }
    },
    prepareFileSteps[] {
      ...,
      _type == "image" => { asset->{ url, metadata } }
    },
    commonErrors,
    integrityChecks[] {
      ...,
      _type == "image" => { asset->{ url, metadata } }
    },
    preImportChecklist,
    supportedEntities,
    downloadableTemplate { asset->{ url } },
    videoTutorialUrl,
    faq,
    relatedGuides[]-> {
      _id, platform, slug, platformLogo { asset->{ url } }
    },
    seo,
  }
`

// Contenido de la sección de migración en landing
export const MIGRATION_LANDING_CONTENT_QUERY = `
  *[_type == "migrationLandingContent"][0] {
    eyebrow,
    headline,
    subheadline,
    steps,
    stats,
    ctaPrimary,
    ctaPrimaryUrl,
    ctaSecondary,
    ctaSecondaryUrl,
    reassuranceBox,
  }
`
