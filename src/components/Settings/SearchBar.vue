<template>
  <div :class="minimalSearch ? 'minimal' : 'normal'">
    <!-- Desktop/Tablet Label -->
    <label for="filter-tiles" class="desktop-only">{{ $t('search.search-label') }}</label>
    
    <!-- Desktop/Tablet Search Input -->
    <div class="search-wrap desktop-only">
      <input
        id="filter-tiles"
        v-model="input"
        ref="filter"
        :placeholder="$t('search.search-placeholder')"
        v-on:input="userIsTypingSomething"
        @keydown.esc="clearFilterInput" />
    </div>

    <!-- Mobile Search Layout -->
    <div class="mobile-search-layout">
      <div class="web-search-container">
        <div class="search-engine-selector" @click="toggleEngineMenu">
          <img :src="currentEngineIcon" class="engine-icon" alt="Engine" />
          <div v-if="showEngineMenu" class="engine-menu">
            <div 
              v-for="(engine, key) in webEngines" 
              :key="key" 
              class="engine-option"
              @click.stop="selectEngine(key)"
            >
              <img :src="engine.icon" class="engine-icon-small" />
              <span>{{ engine.name }}</span>
            </div>
          </div>
        </div>
        <input 
          type="text" 
          v-model="webSearchQuery" 
          :placeholder="`Search ${currentEngineName}...`" 
          @keyup.enter="performWebSearch"
          class="web-search-input"
        />
      </div>
      <a href="https://github.com/tony-wang1990/laowang-nav" target="_blank" class="github-btn">
        <svg height="20" width="20" viewBox="0 0 16 16" version="1.1" class="github-icon" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
        <span>GitHub</span>
      </a>
    </div>
  </div>
</template>

<script>
import ArrowKeyNavigation from '@/utils/ArrowKeyNavigation';
import { getCustomKeyShortcuts } from '@/utils/ConfigHelpers';

export default {
  name: 'FilterTile',
  props: {
    minimalSearch: Boolean, // If true, then keep it simple
  },
  data() {
    return {
      input: '', // Users current search term
      webSearchQuery: '', // New for mobile web search
      selectedEngine: 'baidu',
      showEngineMenu: false,
      webEngines: {
        baidu: {
          name: 'Baidu',
          url: 'https://www.baidu.com/s?wd=',
          icon: 'https://www.baidu.com/favicon.ico'
        },
        bing: {
          name: 'Bing',
          url: 'https://www.bing.com/search?q=',
          icon: 'https://www.bing.com/favicon.ico'
        },
        google: {
          name: 'Google',
          url: 'https://www.google.com/search?q=',
          icon: 'https://www.google.com/favicon.ico'
        }
      },
      akn: new ArrowKeyNavigation(), // Class that manages arrow key naviagtion
      getCustomKeyShortcuts,
    };
  },
  computed: {
    active() {
      return !this.$store.state.modalOpen;
    },
    currentEngineName() {
      return this.webEngines[this.selectedEngine].name;
    },
    currentEngineIcon() {
      return this.webEngines[this.selectedEngine].icon;
    },
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeyPress);
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeyPress);
  },
  methods: {
    /* Call correct function dependending on which key is pressed */
    handleKeyPress(event) {
      const currentElem = document.activeElement.id;
      const { key, keyCode } = event;
      const notAlreadySearching = currentElem !== 'filter-tiles';
      // If a modal is open, then do nothing
      if (!this.active) return;
      if (/^[/:!a-zA-Z]$/.test(key) && notAlreadySearching) {
        // Letter or bang key pressed - start searching
        if (this.$refs.filter) this.$refs.filter.focus();
        this.userIsTypingSomething();
      } else if (/^[0-9]$/.test(key)) {
        // Number key pressed, check if user has a custom binding
        this.handleHotKey(key);
      } else if (keyCode >= 37 && keyCode <= 40) {
      // Arrow key pressed - start navigation
        this.akn.arrowNavigation(keyCode);
      } else if (keyCode === 27) {
      // Esc key pressed - reset form
        this.clearFilterInput();
      }
    },
    /* Emmits users's search term up to parent */
    userIsTypingSomething() {
      this.$emit('user-is-searchin', this.input);
    },
    /* Resets everything to initial state, when user is finished */
    clearFilterInput() {
      this.input = ''; // Clear input model
      this.userIsTypingSomething(); // Emmit new empty value
      document.activeElement.blur(); // Remove focus
      this.akn.resetIndex(); // Reset current element index
    },
    /* If configured, launch specific app when hotkey pressed */
    handleHotKey(key) {
      const sections = this.$store.getters.sections || [];
      const usersHotKeys = this.getCustomKeyShortcuts(sections);
      usersHotKeys.forEach((hotkey) => {
        if (hotkey.hotkey === parseInt(key, 10)) {
          if (hotkey.url) window.open(hotkey.url, '_blank');
        }
      });
    },
    /* Mobile Web Search */
    performWebSearch() {
      if (this.webSearchQuery) {
        const engine = this.webEngines[this.selectedEngine];
        window.open(`${engine.url}${encodeURIComponent(this.webSearchQuery)}`, '_blank');
        this.webSearchQuery = '';
      }
    },
    toggleEngineMenu() {
      this.showEngineMenu = !this.showEngineMenu;
    },
    selectEngine(engineKey) {
      this.selectedEngine = engineKey;
      this.showEngineMenu = false;
    },
  },
};
</script>

<style scoped lang="scss">

@import '@/styles/media-queries.scss';

  div.normal {
    display: flex;
    align-items: center;
    border-radius: 0 0 var(--curve-factor-navbar) 0;
    padding: 0 0.2rem 0.2rem 0;
    background: transparent; /* Fix inconsistent background */
    .search-wrap {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    label {
        display: inline;
        color: var(--search-label-color);
        margin: 0.5rem;
        display: inline;
        word-break: keep-all;
    }
    input {
      display: inline-block;
      width: 200px;
      height: 1.5rem;
      padding: 0.75rem;
      margin: 0.5rem;
      outline: none;
      border-radius: var(--curve-factor);
      
      /* Match SearchEngineSelector style */
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      color: var(--settings-text-color);
      font-size: 0.95rem;
      transition: all 0.3s ease;

      &:focus {
        background: rgba(255, 255, 255, 0.15);
        border-color: var(--primary);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        opacity: 1;
      }
    }
    .clear-search {
      color: var(--settings-text-color);
      padding: 0 0.3rem 0.1rem 0.3rem;
      font-style: normal;
      font-size: 1rem;
      opacity: var(--dimming-factor);
      border-radius: 50px;
      cursor: pointer;
      right: 0.5rem;
      top: 1rem;
      border: 1px solid var(--settings-text-color);
      margin: 0.25rem;
      &:hover {
        opacity: 1;
        background: var(--background-darker);
      }
    }
  }

  /* Mobile Search Layout Styles */
  .mobile-search-layout {
    display: none; /* Hidden by default on desktop */
    width: 100%;
    gap: 0.5rem;
    align-items: stretch;
    padding: 0.5rem;
  }

  .web-search-container {
    flex: 1;
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 0 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    
    .search-engine-selector {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.2rem;
      margin-right: 0.5rem;
      cursor: pointer;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      padding-right: 0.5rem;
      
      .engine-icon {
        width: 20px;
        height: 20px;
        border-radius: 50%;
      }

      .engine-menu {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 0.5rem;
        background: #2c2c2c; /* Dark background */
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        overflow: hidden;
        z-index: 100;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        min-width: 120px;

        .engine-option {
          display: flex;
          align-items: center;
          padding: 0.6rem 1rem;
          gap: 0.5rem;
          color: #fff;
          transition: background 0.2s;

          &:hover {
            background: rgba(255, 255, 255, 0.1);
          }

          .engine-icon-small {
            width: 16px;
            height: 16px;
            border-radius: 50%;
          }
          
          span {
            font-size: 0.9rem;
          }
        }
      }
    }

    .web-search-input {
      flex: 1;
      background: transparent;
      border: none;
      color: #fff;
      font-size: 1rem;
      padding: 0.8rem 0;
      outline: none;
      width: 100%;
      margin: 0; /* Override default input margin */
      
      &::placeholder {
        color: rgba(255, 255, 255, 0.4);
      }
    }
  }

  .github-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 0.5rem 1rem;
    color: #fff;
    text-decoration: none;
    font-size: 0.8rem;
    gap: 0.2rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    min-width: 70px;
    
    .github-icon {
      color: #fff;
    }
    
    span {
      font-weight: 500;
    }
  }

  @include tablet {
    div.normal {
      display: block;
      text-align: center;
    }
  }
  
  @include phone {
    div.normal {
      flex: 1;
      border-radius: 0;
      text-align: center;
      padding: 0.25rem 0;
      display: block;
      background: transparent; /* Remove background on mobile */
    }

    /* Hide desktop elements on mobile */
    .desktop-only {
      display: none !important;
    }

    /* Show mobile layout - HIDDEN as per user request */
    .mobile-search-layout {
      display: none !important;
    }
  }

  div.minimal {
    display: flex;
    align-items: center;
    label { display: none; }
    .search-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }
    input {
      display: inline-block;
      width: 80%;
      max-width: 400px;
      font-size: 1.2rem;
      padding: 0.5rem 1rem;
      margin: 1rem auto;
      outline: none;
      border: 1px solid var(--outline-color);
      border-radius: var(--curve-factor);
      background: var(--minimal-view-search-background);
      color: var(--minimal-view-search-color);
      &:focus {
        border-color: var(--minimal-view-search-color);
        opacity: var(--dimming-factor);
      }
    }
    .clear-search {
      color: var(--minimal-view-search-color);
      padding: 0.15rem 0.5rem 0.2rem 0.5rem;
      font-style: normal;
      font-size: 1rem;
      opacity: var(--dimming-factor);
      border-radius: 50px;
      cursor: pointer;
      right: 0.5rem;
      top: 1rem;
      border: 1px solid var(--minimal-view-search-color);
      margin: 0.5rem;
      &:hover {
        opacity: 1;
        color: var(--minimal-view-search-background);
        background: var(--minimal-view-search-color);
      }
    }
  }
</style>
