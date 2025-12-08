<template>
  <div class="search-engine-selector">
    <div class="engine-tabs">
      <button
        v-for="engine in searchEngines"
        :key="engine.key"
        :class="['engine-btn', {active: currentEngine === engine.key }]"
        @click="selectEngine(engine.key)"
      >
        {{ engine.name }}
      </button>
    </div>
    <div class="search-input-container">
      <input
        v-model="searchQuery"
        :placeholder="`${currentEngineName} 搜索...`"
        @keydown.enter="performSearch"
        class="search-input"
      />
      <button @click="performSearch" class="search-btn">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchEngineSelector',
  data() {
    return {
      searchQuery: '',
      currentEngine: 'google',
      searchEngines: [
        { key: 'google', name: 'Google', url: 'https://www.google.com/search?q=' },
        { key: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd=' },
        { key: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=' },
        { key: 'github', name: 'GitHub', url: 'https://github.com/search?q=' },
      ],
    };
  },
  computed: {
    currentEngineName() {
      const engine = this.searchEngines.find((e) => e.key === this.currentEngine);
      return engine ? engine.name : 'Google';
    },
    currentEngineUrl() {
      const engine = this.searchEngines.find((e) => e.key === this.currentEngine);
      return engine ? engine.url : this.searchEngines[0].url;
    },
  },
  methods: {
    selectEngine(engineKey) {
      this.currentEngine = engineKey;
    },
    performSearch() {
      if (this.searchQuery.trim()) {
        const searchUrl = this.currentEngineUrl + encodeURIComponent(this.searchQuery);
        window.open(searchUrl, '_blank');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.search-engine-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;

  .engine-tabs {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;

    .engine-btn {
      padding: 0.6rem 1.5rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--curve-factor);
      cursor: pointer;
      transition: all 0.2s;
      color: var(--settings-text-color);
      opacity: 0.6;
      font-size: 1rem;
      font-weight: 500;
      min-width: 80px;

      &:hover {
        opacity: 0.9;
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-1px);
      }

      &.active {
        opacity: 1;
        background: var(--primary);
        border-color: var(--primary);
        color: var(--background);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }
  }

  .search-input-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: var(--curve-factor);
    padding: 0.4rem 1rem; /* Reduced padding */
    transition: all 0.3s ease;
    min-height: 32px; /* Reduced min-height */

    &:focus-within {
      background: rgba(255, 255, 255, 0.15);
      border-color: var(--primary);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: var(--settings-text-color);
      font-size: 1rem; /* Slightly reduced font size */

      &::placeholder {
        color: var(--settings-text-color);
        opacity: 0.5;
      }
    }

    .search-btn {
      background: transparent;
      border: none;
      color: var(--settings-text-color);
      cursor: pointer;
      padding: 0.2rem; /* Reduced padding */
      display: flex;
      align-items: center;
      opacity: 0.7;
      transition: all 0.2s;
      border-radius: var(--curve-factor);

      &:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }

  @media (max-width: 768px) {
    .engine-tabs {
      gap: 0.5rem;
      padding: 0.4rem 0.5rem;
      flex-wrap: wrap;

      .engine-btn {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
        min-width: 70px;
      }
    }

    .search-input-container {
      padding: 0.4rem 1rem; /* Consistent reduced padding on mobile */
      min-height: 32px;
      /* display: none;  Restored as per user request */

      .search-input {
        font-size: 0.95rem;
      }
    }
  }
}
</style>
