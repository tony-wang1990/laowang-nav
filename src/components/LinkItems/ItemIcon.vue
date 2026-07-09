<template>
  <div :class="`item-icon wrapper-${size}`">
    <!-- Font-Awesome Icon -->
    <i v-if="iconType === 'font-awesome'" :class="`${icon} ${size}`" ></i>
    <!-- Emoji Icon -->
    <i v-else-if="iconType === 'emoji'" :class="`emoji-icon ${size}`" >{{getEmoji(iconPath)}}</i>
    <!-- Material Design Icon -->
    <span v-else-if="iconType === 'mdi'" :class="` mdi ${icon} ${size}`"></span>
    <!-- Simple-Icons -->
    <img v-else-if="iconType === 'simple-icons' && iconPath" :src="iconPath"
      ref="iconImg"
      :class="`simple-icons ${size}`"
      @error="imageNotFound"
      @load="imageLoaded"
    />
    <!-- Image asset icon -->
    <img v-else-if="iconPath" :src="iconPath"
      ref="iconImg"
      @error="imageNotFound"
      @load="imageLoaded"
      :class="`tile-icon ${size}`"
    />
    <!-- Final fallback: inline CSS generative icon (no image loading, never fails) -->
    <span v-else :class="`generative-icon-text ${size}`" :style="generativeStyle">
      {{ generativeText }}
    </span>
  </div>
</template>

<script>
import ErrorHandler from '@/utils/ErrorHandler';
import EmojiUnicodeRegex from '@/utils/EmojiUnicodeRegex';
import emojiLookup from '@/utils/emojis.json';
import {
  faviconApi as defaultFaviconApi, faviconApiEndpoints, faviconFallbackChain, iconCdns,
} from '@/utils/defaults';

export default {
  name: 'Icon',
  props: {
    icon: String, // Path to icon asset
    url: String, // Used for fetching the favicon
    size: String, // Either small, medium or large
    label: String, // Item title for generative icons
  },
  components: {},
  computed: {
    /* Get appConfig from store */
    appConfig() {
      return this.$store.getters.appConfig;
    },
    /* 保持原始 icon 值：如果配置了就用配置的，否则为空 */
    effectiveIcon() {
      return this.icon || '';
    },
    /* Determines the type of icon */
    iconType() {
      return this.determineImageType(this.effectiveIcon);
    },
    /* Gets the icon path, dependent on icon type */
    iconPath() {
      // 显式声明依赖 fallbackStage，确保 Vue 追踪变化
      const stage = this.fallbackStage;
      return this.getIconPath(this.effectiveIcon, this.url, stage);
    },
    faviconFallbackApis() {
      return this.getOrderedFaviconApis();
    },
    /* Text to show in inline generative icon (last resort fallback) */
    generativeText() {
      const src = this.label || this.safeHostname(this.url) || 'W';
      return this.extractInitials(src);
    },
    /* Style for inline generative icon */
    generativeStyle() {
      const src = this.label || this.safeHostname(this.url) || 'W';
      const [color1, color2] = this.generateGradientColors(src);
      return {
        background: `linear-gradient(135deg, ${color1}, ${color2})`,
        color: '#fff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        fontWeight: '700',
        fontFamily: "Arial, 'Microsoft YaHei', sans-serif",
      };
    },
  },
  data() {
    return {
      fallbackStage: 0,
      iconLoadTimer: null,
    };
  },
  watch: {
    /* Reset fallbackStage whenever the icon source changes */
    icon() {
      this.resetFallback();
    },
    url() {
      this.resetFallback();
    },
    iconPath() {
      this.scheduleImageFallback();
    },
  },
  mounted() {
    this.scheduleImageFallback();
  },
  beforeDestroy() {
    this.clearImageFallbackTimer();
  },
  methods: {
    /* Determine icon type, e.g. local or remote asset, SVG, favicon, font-awesome, etc */
    determineImageType(img) {
      let imgType = '';
      if (!img) imgType = 'auto-fetch';
      else if (this.isUrl(img) || this.isDataImage(img)) imgType = 'url';
      else if (this.isImage(img)) imgType = 'img';
      else if (img.includes('fa-')) imgType = 'font-awesome';
      else if (img.includes('mdi-')) imgType = 'mdi';
      else if (img.includes('si-')) imgType = 'simple-icons';
      else if (img.includes('hl-')) imgType = 'home-lab-icons';
      else if (img.includes('sh-')) imgType = 'selfhst-icons';
      else if (img.includes('favicon-')) imgType = 'custom-favicon';
      else if (img === 'favicon') imgType = 'favicon';
      else if (img === 'generative') imgType = 'generative';
      else if (this.isEmoji(img).isEmoji) imgType = 'emoji';
      else imgType = 'auto-fetch';
      return imgType;
    },
    /* Return the path to icon asset, depending on icon type */
    getIconPath(img, url, fallbackStage = this.fallbackStage) {
      const type = this.determineImageType(img);

      if (this.isAutoFaviconType(type)) {
        return this.getFallbackFaviconPath(url, fallbackStage);
      }

      // If an explicit icon fails, fall back to the target site's favicon chain.
      if (fallbackStage > 0) {
        if (this.canFallbackToFavicon(type)) {
          return this.getFallbackFaviconPath(url, fallbackStage - 1);
        }
        return '';
      }

      switch (type) {
        case 'url': return img;
        case 'img': return this.getLocalImagePath(img);
        case 'favicon': return this.getFavicon(url);
        case 'custom-favicon': return this.getCustomFavicon(url, img);
        case 'generative': return '';
        case 'mdi': return img;
        case 'simple-icons': return this.getSimpleIcon(img);
        case 'home-lab-icons': return this.getHomeLabIcon(img);
        case 'selfhst-icons': return this.getSelfhstIcon(img);
        case 'svg': return img;
        case 'emoji': return img;
        case 'auto-fetch':
          return '';
        default:
          return '';
      }
    },
    /* Check if a string is in a URL format */
    isUrl(str) {
      const pattern = new RegExp(/(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-/]))?/);
      return pattern.test(str);
    },
    isDataImage(str) {
      return typeof str === 'string' && str.startsWith('data:image/');
    },
    /* Returns true if the input is a path to an image file */
    isImage(img) {
      const fileExtRegex = /(?:\.([^.]+))?$/;
      const validImgExtensions = ['svg', 'png', 'jpg', 'jpeg', 'webp', 'ico', 'gif', 'avif'];
      const splitPath = fileExtRegex.exec(img);
      if (splitPath.length >= 1) return validImgExtensions.includes((splitPath[1] || '').toLowerCase());
      return false;
    },
    /* Determines if a given string is an emoji, and if so what type it is */
    isEmoji(img) {
      if (EmojiUnicodeRegex.test(img) && img.match(/./gu).length) {
        return { isEmoji: true, emojiType: 'glyph' };
      } else if (new RegExp(/^:.*:$/).test(img)) {
        return { isEmoji: true, emojiType: 'shortcode' };
      } else if (img.substring(0, 2) === 'U+' && img.length === 7) {
        return { isEmoji: true, emojiType: 'unicode' };
      }
      return { isEmoji: false, emojiType: '' };
    },
    /* Returns the corresponding emoji for a shortcode */
    getShortCodeEmoji(emojiCode) {
      return emojiLookup[emojiCode] || null;
    },
    /* Formats and gets emoji */
    getEmoji(emojiCode) {
      const { emojiType } = this.isEmoji(emojiCode);
      if (emojiType === 'shortcode') return this.getShortCodeEmoji(emojiCode);
      if (emojiType === 'unicode') return String.fromCodePoint(parseInt(emojiCode.substr(2), 16));
      if (emojiType === 'glyph') return emojiCode;
      return null;
    },
    /* Get favicon URL */
    getFavicon(fullUrl, specificApi) {
      const fullUrlTrue = fullUrl || '';
      const faviconApi = specificApi || this.appConfig.faviconApi || defaultFaviconApi;

      if (faviconApi === 'local') {
        return this.getDirectFavicon(fullUrlTrue);
      }

      if (specificApi) {
        const host = this.safeHostname(fullUrlTrue);
        const endpoint = faviconApiEndpoints[specificApi];
        return endpoint ? endpoint.replace('$URL', host) : '';
      }

      if (this.shouldUseDefaultFavicon(fullUrlTrue) || faviconApi === 'local') {
        return this.getDirectFavicon(fullUrlTrue);
      } else if (this.normalizeUrl(fullUrlTrue).includes('http')) {
        const host = this.safeHostname(fullUrlTrue);
        const endpoint = faviconApiEndpoints[faviconApi];
        if (endpoint) return endpoint.replace('$URL', host);
      }
      return '';
    },
    /* Get the URL for a favicon using a non-default favicon API */
    getCustomFavicon(fullUrl, faviconIdentifier) {
      const faviconApi = faviconIdentifier.split('favicon-')[1];
      if (!faviconApi) {
        ErrorHandler('Favicon API not specified');
        return undefined;
      }
      if (!Object.keys(faviconApiEndpoints).includes(faviconApi) && faviconApi !== 'local') {
        ErrorHandler(`The specified favicon API, '${faviconApi}' cannot be found.`);
        return undefined;
      }
      return this.getFavicon(fullUrl, faviconApi);
    },
    /* Returns true if the service is local or user prefers local favicon */
    shouldUseDefaultFavicon(fullUrl) {
      const isLocalIP = /(127\.)|(192\.168\.)|(10\.)|(172\.1[6-9]\.)|(172\.2[0-9]\.)|(172\.3[0-1]\.)|(::1$)|([fF][cCdD])|(localhost)/;
      return (isLocalIP.test(fullUrl) || this.appConfig.faviconApi === 'local');
    },
    /* Fetches the path of local images, from Docker container */
    getLocalImagePath(img) {
      return `/${iconCdns.localPath}/${img}`;
    },
    normalizeUrl(url) {
      if (!url || typeof url !== 'string') return '';
      const trimmed = url.trim();
      if (/^https?:\/\//i.test(trimmed)) return trimmed;
      if (/^(localhost|(\d{1,3}\.){3}\d{1,3}|\[[a-f0-9:]+\]|[a-f0-9:]+)(:\d+)?(\/|$)/i.test(trimmed)
        || trimmed.includes('.')) {
        return `https://${trimmed}`;
      }
      return trimmed;
    },
    getDirectFavicon(url) {
      try {
        const parsedUrl = new URL(this.normalizeUrl(url));
        return `${parsedUrl.origin}/${iconCdns.faviconName}`;
      } catch (e) {
        return '';
      }
    },
    /* Safely extract hostname from a URL string */
    safeHostname(url) {
      if (!url) return 'W';
      try {
        return new URL(this.normalizeUrl(url)).hostname || url;
      } catch (e) {
        return url;
      }
    },
    /* Extract initials from string (supports Chinese and English) */
    extractInitials(str) {
      if (!str) return 'W';
      let cleaned = str.replace(/^(https?:\/\/)?(www\.)?/, '');
      cleaned = cleaned.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '');
      if (!cleaned) return 'W';
      const firstChar = cleaned.charAt(0).toUpperCase();
      if (/[\u4e00-\u9fa5]/.test(firstChar)) {
        return firstChar;
      }
      const match = cleaned.match(/^([a-zA-Z0-9]{1,2})/);
      return match ? match[0].toUpperCase() : 'W';
    },
    /* Generate gradient colors based on string hash */
    generateGradientColors(str) {
      const hash = this.hashCode(str || 'W');
      const hue = Math.abs(hash % 360);
      return [`hsl(${hue}, 70%, 55%)`, `hsl(${(hue + 40) % 360}, 70%, 45%)`];
    },
    /* Generate hash code from string */
    hashCode(str) {
      let hash = 0;
      if (!str) return hash;
      for (let i = 0; i < str.length; i += 1) {
        // eslint-disable-next-line no-bitwise
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        // eslint-disable-next-line no-bitwise
        hash |= 0;
      }
      return hash;
    },
    /* Returns the CDN URL for the icon */
    getSimpleIcon(img) {
      return `https://cdn.simpleicons.org/${img.slice(3)}`;
    },
    getSelfhstIcon(img, cdn) {
      const imageName = img.slice(3).toLocaleLowerCase();
      return (cdn || iconCdns.sh).replace('{icon}', imageName);
    },
    getHomeLabIcon(img, cdn) {
      const imageName = img.replace('hl-', '').toLocaleLowerCase();
      return (cdn || iconCdns.homeLabIcons).replace('{icon}', imageName);
    },
    resetFallback() {
      this.fallbackStage = 0;
      this.scheduleImageFallback();
    },
    clearImageFallbackTimer() {
      if (this.iconLoadTimer) {
        clearTimeout(this.iconLoadTimer);
        this.iconLoadTimer = null;
      }
    },
    scheduleImageFallback() {
      this.clearImageFallbackTimer();
      if (!this.iconPath) return;
      if (!this.shouldScheduleImageFallback()) return;
      this.$nextTick(() => {
        const img = this.$refs.iconImg;
        if (!img || (img.complete && img.naturalWidth >= 2 && img.naturalHeight >= 2)) return;
        this.iconLoadTimer = setTimeout(() => {
          const currentImg = this.$refs.iconImg;
          if (currentImg && (!currentImg.complete
            || currentImg.naturalWidth < 2
            || currentImg.naturalHeight < 2)) {
            this.imageNotFound();
          }
        }, this.getFallbackTimeout());
      });
    },
    shouldScheduleImageFallback() {
      const type = this.determineImageType(this.effectiveIcon);
      return this.fallbackStage > 0 || this.isAutoFaviconType(type);
    },
    getFallbackTimeout() {
      const type = this.determineImageType(this.effectiveIcon);
      return this.fallbackStage === 0 && this.isAutoFaviconType(type) ? 2200 : 1800;
    },
    isAutoFaviconType(type) {
      return type === 'favicon' || type === 'auto-fetch';
    },
    canFallbackToFavicon(type) {
      return [
        'url',
        'img',
        'simple-icons',
        'home-lab-icons',
        'selfhst-icons',
        'custom-favicon',
      ].includes(type);
    },
    getFallbackFaviconPath(url, stage) {
      const api = this.getFaviconFallbackApisForUrl(url)[stage];
      return api ? this.getFavicon(url, api) : '';
    },
    getFaviconFallbackApisForUrl(url) {
      const localFirst = this.shouldUseDefaultFavicon(url);
      const orderedApis = localFirst ? ['local', ...this.faviconFallbackApis] : this.faviconFallbackApis;
      return [...new Set(orderedApis)];
    },
    getOrderedFaviconApis() {
      const configuredApi = this.appConfig.faviconApi || defaultFaviconApi;
      const preferredApis = [
        configuredApi,
        'allesedv',
        'local',
        ...(faviconFallbackChain.domestic || []),
        'duckduckgo',
        'faviconkit',
        'iconhorse',
        'unavatar',
        'google',
        'clearbit',
      ];
      return [...new Set(preferredApis)].filter(api => api === 'local' || faviconApiEndpoints[api]);
    },
    /* Some favicon APIs return a successful but empty image. Treat it as a miss. */
    imageLoaded(event) {
      this.clearImageFallbackTimer();
      const img = event?.target;
      if (img && (img.naturalWidth < 2 || img.naturalHeight < 2)) {
        this.imageNotFound();
      }
    },
    /* Called when the path to the image cannot be resolved */
    imageNotFound() {
      this.clearImageFallbackTimer();
      const type = this.determineImageType(this.effectiveIcon);
      const nextStage = this.fallbackStage + 1;
      const maxStage = this.isAutoFaviconType(type)
        ? this.getFaviconFallbackApisForUrl(this.url).length - 1
        : this.getFaviconFallbackApisForUrl(this.url).length;
      const canTryNextFallback = this.isAutoFaviconType(type) || this.canFallbackToFavicon(type);

      if (canTryNextFallback && nextStage <= maxStage) {
        this.fallbackStage = nextStage;
        return;
      }
      this.fallbackStage = Number.MAX_SAFE_INTEGER;
    },
  },
};
</script>

<style lang="scss">

/* Icon wrapper */
.item-icon {
  &.wrapper-medium {
    min-height: 2.5rem;
  }
  &.wrapper-large {
    min-width: 3.5rem;
    text-align: center;
  }
}

  /* Default Image Icon */
  .tile-icon {
      min-width: 1rem;
      max-width: 2rem;
      min-height: 1rem;
      max-height: 2rem;
      object-fit: cover;
      filter: var(--item-icon-transform) saturate(1.2) brightness(var(--icon-brightness, 1.1));
      border-radius: var(--curve-factor);
      &.small {
        max-width: 1.5rem;
        max-height: 1.5rem;
      }
      &.large {
        max-width: 3rem;
        max-height: 3rem;
      }
      &.broken {
        display: none;
      }
  }
  /* Font-Awesome and Material Design Icons */
  i.fas, i.fab, i.far, i.fal, i.fad, span.mdi {
    font-size: 2rem;
    color: currentColor;
    margin: 1px 4px;
    &.small {
      font-size: 1.5rem;
    }
    &.large {
      font-size: 2.5rem;
    }
  }
  span.mdi {
    font-size: 2.5rem;
  }
  object.tile-icon {
    width: 55px;
    height: 55px;
    svg, svg g, svg g path {
      fill: currentColor;
    }
  }
  /* Simple Icons */
  .item-icon .simple-icons {
    width: 2rem;
    &.small { width: 1.5rem; }
    &.large { width: 2.5rem; }
  }
  .item-icon .simple-icons path {
    fill: currentColor;
  }
  /* Emoji Icons */
  i.emoji-icon {
    font-style: normal;
    font-size: 2rem;
    margin: 0.2rem;
    &.small {
      font-size: 1.5rem;
    }
    &.large {
      font-size: 2.5rem;
    }
  }

  /* Inline Generative Text Icon - absolute last-resort fallback (pure CSS, no image loading) */
  span.generative-icon-text {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 700;
    font-family: Arial, 'Microsoft YaHei', sans-serif;
    color: #fff;
    flex-shrink: 0;
    user-select: none;
    &.small {
      width: 1.5rem;
      height: 1.5rem;
      font-size: 0.75rem;
    }
    &.large {
      width: 3rem;
      height: 3rem;
      font-size: 1.2rem;
    }
  }

  /* Icon Not Found */
  .missing-image {
    width: 2rem;
    &.small {
      width: 1.5rem !important;
    }
    &.large {
      width: 2.5rem;
    }
    path {
      fill: currentColor;
    }
  }
</style>
