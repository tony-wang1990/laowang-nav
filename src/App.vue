<template>
  <div id="dashy" :style="topLevelStyleModifications" :class="subPageClassName">
    <EditModeTopBanner v-if="isEditMode" />
    <LoadingScreen :isLoading="isLoading" v-if="shouldShowSplash" />
    <Header :pageInfo="pageInfo" />
    <router-view v-if="!isFetching" />
    <CriticalError v-if="hasCriticalError" />
    <Footer v-if="visibleComponents.footer && !isFetching" />
  </div>
</template>
<script>

import Header from '@/components/PageStrcture/Header.vue';
import Footer from '@/components/PageStrcture/Footer.vue';
import EditModeTopBanner from '@/components/InteractiveEditor/EditModeTopBanner.vue';
import CriticalError from '@/components/PageStrcture/CriticalError.vue';
import LoadingScreen from '@/components/PageStrcture/LoadingScreen.vue';
import { welcomeMsg } from '@/utils/CoolConsole';
import ErrorHandler from '@/utils/ErrorHandler';
import Keys from '@/utils/StoreMutations';
import {
  localStorageKeys,
  splashScreenTime,
  language as defaultLanguage,
} from '@/utils/defaults';

export default {
  name: 'app',
  components: {
    Header,
    Footer,
    LoadingScreen,
    EditModeTopBanner,
    CriticalError,
  },
  data() {
    return {
      isLoading: true, // Set to false after mount complete
      isFetching: true, // Set to false after the conf has been fetched
    };
  },
  watch: {
    isEditMode(isEditMode) {
      // When in edit mode, show confirmation dialog on page exit
      window.onbeforeunload = isEditMode ? this.confirmExit : null;
    },
    config() {
      this.isFetching = false;
    },
  },
  computed: {

    /* Determine if splash screen should be shown */
    shouldShowSplash() {
      return (this.appConfig.showSplashScreen);
    },
    config() {
      return this.$store.state.config;
    },
    appConfig() {
      return this.$store.getters.appConfig;
    },
    pageInfo() {
      return this.$store.getters.pageInfo;
    },
    sections() {
      return this.$store.getters.sections;
    },
    visibleComponents() {
      return this.$store.getters.visibleComponents;
    },
    isEditMode() {
      return this.$store.state.editMode;
    },
    hasCriticalError() {
      return this.$store.state.criticalError;
    },
    subPageClassName() {
      const currentSubPage = this.$store.state.currentConfigInfo;
      return (currentSubPage && currentSubPage.pageId) ? currentSubPage.pageId : '';
    },
    topLevelStyleModifications() {
      const vc = this.visibleComponents;
      if (!vc.footer && !vc.pageTitle) {
        return '--footer-height: 1rem;';
      } else if (!vc.footer) {
        return '--footer-height: 5rem;';
      } else if (!vc.pageTitle) {
        return '--footer-height: 4rem;';
      }
      return '';
    },
  },
  methods: {
    /* Injects the users custom CSS as a style tag */
    injectCustomStyles(usersCss) {
      const style = document.createElement('style');
      style.textContent = usersCss;
      document.head.append(style);
    },
    /* Hide splash screen, either after 2 seconds, or immediately based on user preference */
    hideSplash() {
      if (this.shouldShowSplash) {
        setTimeout(() => { this.isLoading = false; }, splashScreenTime || 1000);
      } else {
        this.isLoading = false;
      }
    },

    /* Auto-detects users language from browser/ os, when not specified */
    autoDetectLanguage(availibleLocales) {
      const isLangSupported = (languageList, userLang) => languageList
        .map(lang => lang.toLowerCase()).find((lang) => lang === userLang.toLowerCase());

      const usersBorwserLang1 = window.navigator.language || ''; // e.g. en-GB or or ''
      const usersBorwserLang2 = usersBorwserLang1.split('-')[0]; // e.g. en or undefined
      const usersSpairLangs = window.navigator.languages; // e.g [en, en-GB, en-US]
      return isLangSupported(availibleLocales, usersBorwserLang1)
        || isLangSupported(availibleLocales, usersBorwserLang2)
        || usersSpairLangs.find((spair) => isLangSupported(availibleLocales, spair))
        || defaultLanguage;
    },

    /* Get users language, if not available then call auto-detect */
    getLanguage() {
      const availibleLocales = this.$i18n.availableLocales; // All available locales
      const usersLang = localStorage[localStorageKeys.LANGUAGE] || this.appConfig.language;
      if (usersLang) {
        if (availibleLocales.includes(usersLang)) {
          return usersLang;
        } else {
          ErrorHandler(`Unsupported Language: '${usersLang}'`);
        }
      }
      return this.autoDetectLanguage(availibleLocales);
    },

    /* Fetch or detect users language, then apply it */
    applyLanguage() {
      const language = this.getLanguage();
      this.$store.commit(Keys.SET_LANGUAGE, language);
      this.$i18n.locale = language;
      document.getElementsByTagName('html')[0].setAttribute('lang', language);
    },
    /* If placeholder element still visible, hide it */
    hideLoader() {
      const loader = document.getElementById('loader');
      if (loader) loader.style.display = 'none';
    },
    /* Called when in edit mode and navigating away from page */
    confirmExit(e) {
      e.preventDefault();
      return 'You may have unsaved edits. Are you sure you want to exit the page?';
    },
    /* Detect and apply theme based on OS preference */
    applyThemeBasedOnOSPreference() {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const osTheme = prefersDark ? this.appConfig.nightTheme : this.appConfig.dayTheme;
      if (osTheme) {
        this.$store.commit(Keys.SET_THEME, osTheme);
        this.updateTheme(osTheme);
      }
    },
  },
  /* Basic initialization tasks on app load */
  async mounted() {
    await this.$store.dispatch(Keys.INITIALIZE_CONFIG); // Initialize config before moving on
    this.applyLanguage(); // Apply users local language
    this.applyThemeBasedOnOSPreference(); // Apply theme based on OS preference
    this.hideSplash(); // Hide the splash screen, if visible
    if (this.appConfig.customCss) { // Inject users custom CSS, if present
      const cleanedCss = this.appConfig.customCss.replace(/<\/?[^>]+(>|$)/g, '');
      this.injectCustomStyles(cleanedCss);
    }
    this.hideLoader(); // If initial placeholder still visible, hide it
    welcomeMsg(); // Show message in console
  },
};
</script>

<style lang="scss">
/* Import styles used globally throughout the app */
@import '@/styles/global-styles.scss';
@import '@/styles/color-palette.scss';
@import '@/styles/dimensions.scss';
@import '@/styles/color-themes.scss';
@import '@/styles/typography.scss';
@import '@/styles/user-defined-themes.scss';

/* Fix for Deep Ocean theme background consistency */
html[data-theme='deep-ocean'] {
  #dashy {
    background-color: #151e2d;
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%231a3f57' fill-opacity='0.18' fill-rule='evenodd'/%3E%3C/svg%3E");
    background-attachment: fixed;
    min-height: 100vh;
  }
  .home,
  .options-container {
    background: transparent !important;
  }
}
</style>
