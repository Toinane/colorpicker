import type { LanguageOption } from '@interfaces/settings'

export interface LanguageDefinition {
  value: LanguageOption
  label: string
}

/** All languages shipped with translation files in `src/assets/locales`. */
export const AVAILABLE_LANGUAGES: LanguageDefinition[] = [
  { value: 'en_US', label: 'English' },
  { value: 'fr_FR', label: 'Français' },
]

const FALLBACK_LANGUAGE: LanguageOption = 'en_US'

/**
 * Map a browser/OS locale (e.g. `fr-FR`, `fr`, `en-GB`) to one of our
 * supported languages, matching on language code first (`fr` -> `fr_FR`),
 * falling back to English when nothing matches.
 */
export const resolveSupportedLanguage = (locale: string | undefined | null): LanguageOption => {
  if (!locale) return FALLBACK_LANGUAGE

  const normalized = locale.replace('-', '_')
  const exactMatch = AVAILABLE_LANGUAGES.find(
    (lang) => lang.value.toLowerCase() === normalized.toLowerCase(),
  )
  if (exactMatch) return exactMatch.value

  const languageCode = locale.split(/[-_]/)[0]?.toLowerCase()
  const codeMatch = AVAILABLE_LANGUAGES.find(
    (lang) => lang.value.split('_')[0].toLowerCase() === languageCode,
  )

  return codeMatch?.value ?? FALLBACK_LANGUAGE
}
