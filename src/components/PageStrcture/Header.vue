<template>
    <header v-if="componentVisible">
      <div class="logo-container">
        <div class="title-glass-wrapper">
          <div class="logo-wrapper">
            <TransparentLogo
              :src="require('@/assets/logo-icon.png')"
              :tolerance="80"
              class="img-logo"
            />
            <span class="logo-text">LaoWang Nav</span>
            <sup class="trademark">®</sup>
          </div>
        </div>
      </div>
      <!-- PageTitle removed to prevent duplicate text -->
      <div class="header-right">
        <HeaderInfo class="header-weather" />
        <!-- Custom GitHub Link -->
        <a href="https://github.com/tony-wang1990/laowang-nav" target="_blank" class="github-text-link">
          GitHub
        </a>
        <Nav v-if="navVisible" :links="hardcodedLinks" class="nav" />
      </div>
    </header>
</template>

<script>
import HeaderInfo from '@/components/PageStrcture/HeaderInfo.vue';
import Nav from '@/components/PageStrcture/Nav.vue';
import TransparentLogo from '@/components/PageStrcture/TransparentLogo.vue';
import { shouldBeVisible } from '@/utils/SectionHelpers';

export default {
  name: 'Header',
  components: {
    HeaderInfo,
    Nav,
    TransparentLogo,
  },
  props: {
    pageInfo: Object,
  },
  data() {
    return {
      // Empty hardcoded links as GitHub is now separate
      hardcodedLinks: [],
    };
  },
  computed: {
    componentVisible() {
      return shouldBeVisible(this.$route.name);
    },
    visibleComponents() {
      return this.$store.getters.visibleComponents;
    },
    titleVisible() {
      return this.visibleComponents.pageTitle;
    },
    navVisible() {
      return this.visibleComponents.navigation;
    },
  },
};
</script>

<style scoped lang="scss">

@import '@/styles/media-queries.scss';

  header {
    margin: 0;
    padding: 0.5rem;
    display: flex;
    justify-content: space-between;
    background: transparent; /* Fix theme inconsistency */
    align-items: center;
    align-content: flex-start;
    @include phone {
      flex-direction: column;
      gap: 0.5rem;
    }
  }

  .logo-container {
    display: flex;
    align-items: center;
    padding-left: 1rem;
    @include phone {
      width: 100%;
      justify-content: center;
      padding-left: 0;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;

    @include phone {
      width: 100%;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
      align-items: center;
    }
  }

  .github-text-link {
    font-size: 1.2rem;
    font-weight: 700;
    text-decoration: none;

    /* Rainbow Gradient */
    background: linear-gradient(90deg,
      #ff0000 0%,
      #ff7f00 14%,
      #ffff00 28%,
      #00ff00 42%,
      #00ffff 57%,
      #0000ff 71%,
      #8b00ff 85%,
      #ff0000 100%
    );
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: rainbowFlow 10s linear infinite;

    &:hover {
      opacity: 0.8;
    }
  }

  .header-weather {
    flex-shrink: 0;
  }

  .title-glass-wrapper {
    position: relative;
    padding: 0.5rem 1rem;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;

    &:hover {
      transform: translateY(-2px);
    }
  }

  .logo-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.8rem; /* Space between icon and text */
    text-decoration: none;
  }

  .img-logo {
    height: 2.5rem;
    width: 2.5rem;
    display: block;
    border-radius: 50%; /* Circular icon */
    object-fit: cover;
    /* mix-blend-mode removed, handled by component */

    @include phone {
      height: 2rem;
      width: 2rem;
    }
  }

  .logo-text {
    font-size: 1.5rem;
    font-weight: 700;
    white-space: nowrap;
    letter-spacing: 0.5px;

    /* Rainbow Gradient */
    background: linear-gradient(90deg,
      #ff0000 0%,
      #ff7f00 14%,
      #ffff00 28%,
      #00ff00 42%,
      #00ffff 57%,
      #0000ff 71%,
      #8b00ff 85%,
      #ff0000 100%
    );
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: rainbowFlow 10s linear infinite;

    @include phone {
      font-size: 1.2rem;
    }
  }

  .trademark {
    position: absolute;
    top: -0.3rem;
    right: -0.8rem;
    font-size: 0.8rem;
    font-weight: 700;
    color: #fff;
    opacity: 0.9;

    /* Optional: keep the rainbow effect for the R symbol if desired, or just white */
    background: linear-gradient(90deg,
      #ff0000 0%,
      #ff7f00 14%,
      #ffff00 28%,
      #00ff00 42%,
      #00ffff 57%,
      #0000ff 71%,
      #8b00ff 85%,
      #ff0000 100%
    );
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: rainbowFlow 10s linear infinite;
  }

  @keyframes rainbowFlow {
    0% {
      background-position: 0% 50%;
    }
    100% {
      background-position: 200% 50%;
    }
  }

  @include phone {
    .title-glass-wrapper {
      padding: 0.5rem 1rem;
    }

    .trademark {
      font-size: 0.7rem;
      top: -0.1rem;
      right: -0.6rem;
    }
  }
</style>
