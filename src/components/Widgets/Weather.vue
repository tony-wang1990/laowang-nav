<template>
<div class="weather">
  <!-- Icon + Temperature -->
  <div class="intro">
    <div class="main-info">
      <p class="temp">{{ temp }}</p>
      <i :class="`owi owi-${icon}`"></i>
    </div>
    <p class="location" v-if="location">📍 {{ location }}</p>
  </div>
  <!-- Weather description -->
  <p class="description">{{ description }}</p>
  <div class="details" v-if="showDetails && weatherDetails.length > 0">
    <div class="info-wrap" v-for="(section, indx) in weatherDetails" :key="indx">
      <p class="info-line" v-for="weather in section" :key="weather.label">
          <span class="lbl">{{weather.label}}</span>
          <span class="val">{{ weather.value }}</span>
        </p>
    </div>
  </div>
  <!-- Show/ hide toggle button -->
  <p class="more-details-btn" @click="toggleDetails" v-if="weatherDetails.length > 0">
    {{ showDetails ? $t('widgets.general.show-less') : $t('widgets.general.show-more') }}
  </p>
</div>
</template>

<script>
import WidgetMixin from '@/mixins/WidgetMixin';
import { widgetApiEndpoints } from '@/utils/defaults';

export default {
  mixins: [WidgetMixin],
  data() {
    return {
      loading: true,
      icon: '01d', // Default icon
      description: 'Loading...',
      temp: '--',
      location: '',
      showDetails: false,
      weatherDetails: [],
    };
  },
  mounted() {
    this.fetchSmartWeather();
  },
  computed: {
    units() { return this.options.units || 'metric'; },
    tempDisplayUnits() { return this.units === 'imperial' ? '°F' : '°C'; },
  },
  methods: {
    /* Main Entry: Try sources in order */
    async fetchSmartWeather() {
      this.loading = true;
      // 1. Try VVHan (Best for China)
      if (await this.fetchVVHan()) return;

      // 2. Try Oioweb (Backup for China)
      if (await this.fetchOioweb()) return;

      // 3. Try OpenWeatherMap (If API Key provided)
      if (this.options.apiKey && await this.fetchOWM()) return;

      // 4. Fallback to Wttr.in
      await this.fetchWttr();
      this.loading = false;
    },

    /* --- Source 1: VVHan --- */
    async fetchVVHan() {
      try {
        const res = await fetch('https://api.vvhan.com/api/weather');
        const data = await res.json();
        if (data.success && data.info) {
          this.temp = data.info.high.replace('°C', '');
          this.description = data.info.type;
          this.location = data.city || 'Local';
          this.icon = this.mapIcon(data.info.type);
          this.makeSimpleDetails(data.info);
          return true;
        }
      } catch (e) { /* ignore */ }
      return false;
    },

    /* --- Source 2: Oioweb --- */
    async fetchOioweb() {
      try {
        const res = await fetch('https://api.oioweb.cn/api/weather/weather');
        const data = await res.json();
        if (data.code === 200 && data.result) {
          const w = data.result;
          this.temp = w.current_temperature;
          this.description = w.weather;
          this.location = w.city_name;
          this.icon = this.mapIcon(w.weather);
          // Oioweb provides richer details, we can use them if needed
          return true;
        }
      } catch (e) { /* ignore */ }
      return false;
    },

    /* --- Source 3: OpenWeatherMap (Legacy) --- */
    async fetchOWM() {
      try {
        const apiKey = this.parseAsEnvVar(this.options.apiKey);
        const { city, lat, lon } = this.options;
        const params = (lat && lon)
          ? `lat=${lat}&lon=${lon}&appid=${apiKey}&units=${this.units}`
          : `q=${city || 'Beijing'}&appid=${apiKey}&units=${this.units}`;
        const url = `${widgetApiEndpoints.weather}?${params}`;

        const res = await fetch(url);
        const data = await res.json();
        if (data.cod === 200) {
          this.processOWMData(data);
          return true;
        }
      } catch (e) { /* ignore */ }
      return false;
    },

    /* --- Source 4: Wttr.in (Fallback) --- */
    async fetchWttr() {
      try {
        const res = await fetch('https://wttr.in/?format=j1'); // JSON format
        const data = await res.json();
        const current = data.current_condition[0];
        const area = data.nearest_area[0];

        this.temp = current.temp_C; // Wttr defaults usually metric
        this.description = current.weatherDesc[0].value;
        // 优先使用 region > areaName，过滤不合理的地名
        const rawLocation = area.region?.[0]?.value
          || area.areaName?.[0]?.value
          || '';
        this.location = this.sanitizeLocation(rawLocation);
        this.icon = '01d'; // Hard to map seamlessly, use default
      } catch (e) {
        this.description = 'Offline';
        this.location = '';
      }
    },

    /* Helper: Map conditions to OWI icons */
    mapIcon(condition) {
      if (!condition) return '01d';
      const c = condition.toString();
      if (c.includes('晴')) return '01d';
      if (c.includes('云') || c.includes('阴')) return '02d';
      if (c.includes('雨')) return '09d';
      if (c.includes('雪')) return '13d';
      if (c.includes('雷')) return '11d';
      if (c.includes('雾')) return '50d';
      return '01d';
    },

    makeSimpleDetails(info) {
      this.weatherDetails = [[
        { label: 'Low', value: info.low },
        { label: 'High', value: info.high },
        { label: 'Wind', value: info.fengxiang },
      ]];
    },

    /* Legacy OWM Processor */
    processOWMData(data) {
      this.icon = data.weather[0].icon;
      this.description = data.weather[0].description;
      this.temp = Math.round(data.main.temp) + this.tempDisplayUnits;
      this.location = data.name;
      if (!this.options.hideDetails) {
        this.makeOWMDetails(data);
      }
    },

    /* Legacy OWM Details */
    makeOWMDetails(data) {
      this.weatherDetails = [
        [
          { label: 'Min', value: Math.round(data.main.temp_min) + this.tempDisplayUnits },
          { label: 'Max', value: Math.round(data.main.temp_max) + this.tempDisplayUnits },
          { label: 'Feels', value: Math.round(data.main.feels_like) + this.tempDisplayUnits },
        ],
        [
          { label: 'Hum', value: `${data.main.humidity}%` },
          { label: 'Wind', value: `${data.wind.speed}m/s` },
        ],
      ];
    },

    /* 过滤不合理的地名 */
    sanitizeLocation(location) {
      if (!location) return '';
      const invalidNames = ['Coffee', 'Unknown', 'undefined', 'null'];
      if (invalidNames.some(n => location.toLowerCase().includes(n.toLowerCase()))) {
        return '';
      }
      return location;
    },

    toggleDetails() { this.showDetails = !this.showDetails; },
    checkProps() { /* Deprecated strict checks, but we keep structure */ },
  },
};
</script>

<style scoped lang="scss">
@import '@/styles/weather-icons.scss';

.loader {
  margin: 0 auto;
  display: flex;
}
  p {
    color: var(--widget-text-color);
  }

.weather {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  // Weather symbol and temperature
  .intro {
    grid-column-start: span 2;
    display: flex;
    flex-direction: column;
    align-items: center;

    .main-info {
      display: flex;
      justify-content: space-around;
      width: 100%;
      align-items: center;

      .owi {
        font-size: 3rem;
        color: var(--widget-text-color);
        margin: 0;
      }
      .temp {
        font-size: 3rem;
        margin: 0;
      }
    }

    .location {
      margin: 0.2rem 0 0 0;
      font-size: 0.9rem;
      opacity: 0.8;
      color: var(--widget-text-color);
    }
  }
  // Weather description
  .description {
    grid-column-start: 2;
    text-transform: capitalize;
    text-align: center;
    margin: 0;
  }
  // Show more details button
  .more-details-btn {
    grid-column-start: span 2;
    cursor: pointer;
    font-size: 0.9rem;
    text-align: center;
    width: fit-content;
    margin: 0.25rem auto;
    padding: 0.1rem 0.25rem;
    border: 1px solid transparent;
    opacity: var(--dimming-factor);
    border-radius: var(--curve-factor);
    &:hover {
      border: 1px solid var(--widget-text-color);
    }
    &:focus, &:active {
      background: var(--widget-text-color);
      color: var(--widget-background-color);
    }
  }
  // More weather details table
  .details {
    grid-column-start: span 2;
    display: flex;
    .info-wrap {
      display: flex;
      flex-direction: column;
      width: 100%;
      opacity: var(--dimming-factor);
      p.info-line {
        display: flex;
        justify-content: space-between;
        margin: 0.1rem 0.5rem;
        padding: 0.1rem 0;
        color: var(--widget-text-color);
        &:not(:last-child) {
          border-bottom: 1px dashed var(--widget-text-color);
        }
        span.lbl {
          text-transform: capitalize;
        }
      }
    }
  }
}

</style>
