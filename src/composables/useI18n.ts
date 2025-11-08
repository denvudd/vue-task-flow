import { useI18n as vueI18n } from 'vue-i18n'

export function useI18n() {
  const i18n = vueI18n()

  const changeLocale = (locale: string) => {
    i18n.locale.value = locale
  }

  return {
    t: i18n.t,
    locale: i18n.locale,
    availableLocales: i18n.availableLocales,
    changeLocale,
  }
}
