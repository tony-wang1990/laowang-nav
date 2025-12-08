<template>
  <div class="header-info">
    <div class="info-item date-info">
      <div class="date-row">
        <span class="date">{{ currentDate }}</span>
        <span class="weekday">{{ currentWeekday }}</span>
      </div>
      <div class="location-row" v-if="weather.location">
        <span class="location-name">{{ weather.location }}</span>
      </div>
    </div>
    <div class="divider"></div>
    <div class="info-item weather-info">
      <span class="temp">{{ weather.temp }}°C</span>
      <span class="condition">{{ weather.condition }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HeaderInfo',
  data() {
    return {
      currentDate: '',
      currentWeekday: '',
      weather: {
        temp: '--',
        condition: '加载中...',
        location: '',
      },
    };
  },
  mounted() {
    this.updateDateTime();
    this.fetchWeather();
    setInterval(this.updateDateTime, 60000);
  },
  methods: {
    updateDateTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      this.currentDate = `${year}年${month}月${day}日`;

      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      this.currentWeekday = weekdays[now.getDay()];
    },
    async fetchWeather() {
      try {
        const response = await fetch('https://wttr.in/?format=j1');
        const data = await response.json();
        const current = data.current_condition[0];
        this.weather.temp = current.temp_C;
        this.weather.condition = this.translateWeather(current.weatherDesc[0].value);

        // Extract location (City name)
        if (data.nearest_area && data.nearest_area[0]) {
          const area = data.nearest_area[0];
          this.weather.location = area.areaName[0].value || area.region[0].value;
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch weather:', err);
        this.weather.condition = '晴';
      }
    },
    translateWeather(desc) {
      const translations = {
        Clear: '晴',
        Sunny: '晴',
        'Partly cloudy': '多云',
        Cloudy: '阴',
        Overcast: '阴',
        Mist: '薄雾',
        Fog: '雾',
        'Light rain': '小雨',
        'Moderate rain': '中雨',
        'Heavy rain': '大雨',
        'Light snow': '小雪',
        'Moderate snow': '中雪',
        'Heavy snow': '大雪',
      };
      return translations[desc] || desc;
    },
  },
};
</script>

<style lang="scss" scoped>
.header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  white-space: nowrap;
  min-height: 70px;

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;

      span {
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
        line-height: 1.3;
      }

      .date-row {
        display: flex;
        align-items: baseline;
        gap: 0.5rem;
      }

      .location-row {
        display: flex;
        justify-content: flex-start;
      }

      .date, .temp {
        font-size: 1.3rem;
        font-weight: 600;
      }

      .weekday, .condition, .location-name {
        font-size: 0.95rem;
        font-weight: 500;
      }
    }

    .divider {
      width: 1px;
      height: 2.5rem;
      background: rgba(255, 255, 255, 0.2);
    }

    @media (max-width: 768px) {
      padding: 0.8rem 1.2rem;
      gap: 0.8rem;
      min-height: 60px;

      .info-item {
        flex-direction: column;
        gap: 0.2rem;

        .date, .temp {
          font-size: 1.1rem;
        }
        .weekday, .condition, .location-name {
          font-size: 0.85rem;
        }
      }

      .divider {
        height: 2rem;
      }
    }

    @media (max-width: 600px) {
      padding: 0.5rem 1rem;
      gap: 0.5rem;
      min-height: auto;
      justify-content: center;

      .info-item {
        flex-direction: row;
        align-items: baseline;
        gap: 0.3rem;

        .date-row {
            gap: 0.3rem;
        }

        .location-row {
            display: none;
        }

        .date, .temp {
          font-size: 1rem;
        }

        .weekday {
            display: none;
        }

        .condition {
          font-size: 0.9rem;
        }
      }

      .divider {
        height: 1.2rem;
        margin: 0 0.2rem;
      }
    }
}

@keyframes rainbowFlow {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}
</style>
