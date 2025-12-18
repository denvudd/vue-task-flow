import { createI18n } from 'vue-i18n'
import uk from './locales/uk.json'
import en from './locales/en.json'

// Get saved locale from localStorage or use default
const savedLocale = localStorage.getItem('locale') || 'uk'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    uk,
    en,
  },
})

export default i18n
