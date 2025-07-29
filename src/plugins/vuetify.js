/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
import { useI18n } from 'vue-i18n'
import i18n from '@/i18n'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  locale: {
    adapter: createVueI18nAdapter({ i18n, useI18n }),
  },
  theme: {
    defaultTheme: 'pink',
    themes: {
      pink: {
        dark: false, // 如果需要深色模式，设置为 true
        colors: {
          primary: '#E8B4B8', // 设置主题主色，导航列默认会继承 primary
          secondary: '#FFC107', // 设置其他辅助颜色
          appBarBackground: '#F06292', // 自定义导航列颜色
        },
      },
    },
  },
})
