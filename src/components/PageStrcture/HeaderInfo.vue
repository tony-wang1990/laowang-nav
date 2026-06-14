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

    /* 主天气获取：依次尝试多个 API，任一成功则停止 */
    async fetchWeather() {
      const ok = await this.tryWttrIn()
        || await this.tryIpApiPlusOpenMeteo()
        || await this.tryIpapiCoOpenMeteo();

      if (!ok) {
        this.weather.condition = '晴';
        this.weather.temp = '--';
        this.weather.location = '';
      }
    },

    /* 辅助：带超时的 fetch */
    fetchWithTimeout(url, timeoutMs) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      return fetch(url, { signal: controller.signal })
        .then(r => { clearTimeout(timer); return r; })
        .catch(e => { clearTimeout(timer); throw e; });
    },

    /* 方案1: wttr.in - 国际通用，部分国内网络可访问 */
    async tryWttrIn() {
      try {
        const resp = await this.fetchWithTimeout('https://wttr.in/?format=j1', 5000);
        if (!resp.ok) return false;
        const data = await resp.json();
        const current = data.current_condition[0];
        this.weather.temp = current.temp_C;
        this.weather.condition = this.translateWeather(current.weatherDesc[0].value);
        if (data.nearest_area && data.nearest_area[0]) {
          const area = data.nearest_area[0];
          const rawName = (area.areaName[0] && area.areaName[0].value)
            || (area.region[0] && area.region[0].value) || '';
          this.weather.location = this.translateCityName(rawName);
        }
        return true;
      } catch (e) {
        return false;
      }
    },

    /* 方案2: ip-api.com (国内可访问) + Open-Meteo (无需 key) */
    async tryIpApiPlusOpenMeteo() {
      try {
        // ip-api.com 指定 zh-CN 语言，直接返回中文城市名
        const ipResp = await this.fetchWithTimeout(
          'http://ip-api.com/json/?fields=status,city,regionName,lat,lon&lang=zh-CN', 5000,
        );
        if (!ipResp.ok) return false;
        const ipData = await ipResp.json();
        if (ipData.status !== 'success' || !ipData.lat) return false;

        const wResp = await this.fetchWithTimeout(
          `https://api.open-meteo.com/v1/forecast?latitude=${ipData.lat
          }&longitude=${ipData.lon
          }&current=temperature_2m,weathercode&timezone=auto`,
          5000,
        );
        if (!wResp.ok) return false;
        const wData = await wResp.json();
        if (!wData.current) return false;

        this.weather.temp = Math.round(wData.current.temperature_2m);
        this.weather.condition = this.weatherCodeToText(wData.current.weathercode);
        // ip-api 返回的中文城市名（lang=zh-CN 时有效）
        this.weather.location = ipData.city || ipData.regionName || '';
        return true;
      } catch (e) {
        return false;
      }
    },

    /* 方案3: ipapi.co + Open-Meteo (备选定位源) */
    async tryIpapiCoOpenMeteo() {
      try {
        const ipResp = await this.fetchWithTimeout('https://ipapi.co/json/', 6000);
        if (!ipResp.ok) return false;
        const ipData = await ipResp.json();
        if (!ipData.latitude) return false;

        const wResp = await this.fetchWithTimeout(
          `https://api.open-meteo.com/v1/forecast?latitude=${ipData.latitude
          }&longitude=${ipData.longitude
          }&current=temperature_2m,weathercode&timezone=auto`,
          5000,
        );
        if (!wResp.ok) return false;
        const wData = await wResp.json();
        if (!wData.current) return false;

        this.weather.temp = Math.round(wData.current.temperature_2m);
        this.weather.condition = this.weatherCodeToText(wData.current.weathercode);
        const rawCity = ipData.city || ipData.region || '';
        this.weather.location = this.translateCityName(rawCity);
        return true;
      } catch (e) {
        return false;
      }
    },

    /* WMO 天气代码 → 中文（Open-Meteo 使用此标准） */
    weatherCodeToText(code) {
      const map = {
        0: '晴',
        1: '晴',
        2: '多云',
        3: '阴',
        45: '雾',
        48: '冻雾',
        51: '细雨',
        53: '细雨',
        55: '细雨',
        56: '冻雨',
        57: '大冻雨',
        61: '小雨',
        63: '中雨',
        65: '大雨',
        66: '小冻雨',
        67: '大冻雨',
        71: '小雪',
        73: '中雪',
        75: '大雪',
        77: '冰粒',
        80: '阵雨',
        81: '中阵雨',
        82: '大阵雨',
        85: '小阵雪',
        86: '大阵雪',
        95: '雷雨',
        96: '雷雨夹冰雹',
        99: '雷雨夹冰雹',
      };
      return map[Number(code)] || '晴';
    },

    /* 英文天气描述 → 中文（wttr.in 使用英文描述） */
    translateWeather(desc) {
      if (!desc) return '晴';
      const map = {
        Clear: '晴',
        Sunny: '晴天',
        'Partly cloudy': '多云',
        'Partly Cloudy': '多云',
        Cloudy: '阴',
        Overcast: '阴天',
        Mist: '薄雾',
        Fog: '雾',
        'Freezing fog': '冻雾',
        'Patchy rain possible': '阵雨',
        'Patchy snow possible': '阵雪',
        'Blowing snow': '风雪',
        Blizzard: '暴风雪',
        'Thundery outbreaks possible': '雷雨',
        'Patchy light drizzle': '零星小雨',
        'Light drizzle': '细雨',
        'Freezing drizzle': '冻雨',
        'Heavy freezing drizzle': '大冻雨',
        'Patchy light rain': '零星小雨',
        'Light rain': '小雨',
        'Moderate rain at times': '时有中雨',
        'Moderate rain': '中雨',
        'Heavy rain at times': '时有大雨',
        'Heavy rain': '大雨',
        'Light freezing rain': '小冻雨',
        'Moderate or heavy freezing rain': '中大冻雨',
        'Light sleet': '小雨夹雪',
        'Moderate or heavy sleet': '中大雨夹雪',
        'Patchy light snow': '零星小雪',
        'Light snow': '小雪',
        'Patchy moderate snow': '时有中雪',
        'Moderate snow': '中雪',
        'Patchy heavy snow': '时有大雪',
        'Heavy snow': '大雪',
        'Ice pellets': '冰粒',
        'Light rain shower': '小雨',
        'Moderate or heavy rain shower': '大雨',
        'Torrential rain shower': '暴雨',
        'Light sleet showers': '雨夹雪',
        'Moderate or heavy sleet showers': '中大雨夹雪',
        'Light snow showers': '小雪',
        'Moderate or heavy snow showers': '大雪',
        'Light showers of ice pellets': '小冰粒',
        'Moderate or heavy showers of ice pellets': '大冰粒',
        'Patchy light rain with thunder': '雷阵雨',
        'Moderate or heavy rain with thunder': '雷大雨',
        'Patchy light snow with thunder': '雷雪',
        'Moderate or heavy snow with thunder': '雷大雪',
      };
      return map[desc] || desc;
    },

    /* 英文城市名 → 中文（常用城市映射表） */
    translateCityName(name) {
      if (!name) return '';
      // 如果已经包含中文字符，直接返回
      if (/[\u4e00-\u9fa5]/.test(name)) return name;
      const cityMap = {
        // 国内主要城市
        Beijing: '北京',
        Shanghai: '上海',
        Guangzhou: '广州',
        Shenzhen: '深圳',
        Hangzhou: '杭州',
        Chengdu: '成都',
        Wuhan: '武汉',
        Xian: '西安',
        Nanjing: '南京',
        Tianjin: '天津',
        Chongqing: '重庆',
        Suzhou: '苏州',
        Changsha: '长沙',
        Zhengzhou: '郑州',
        Qingdao: '青岛',
        Jinan: '济南',
        Fuzhou: '福州',
        Xiamen: '厦门',
        Kunming: '昆明',
        Guiyang: '贵阳',
        Hefei: '合肥',
        Shijiazhuang: '石家庄',
        Harbin: '哈尔滨',
        Changchun: '长春',
        Shenyang: '沈阳',
        Urumqi: '乌鲁木齐',
        Lanzhou: '兰州',
        Xining: '西宁',
        Yinchuan: '银川',
        Nanning: '南宁',
        Hohhot: '呼和浩特',
        Lhasa: '拉萨',
        Haikou: '海口',
        Nanchang: '南昌',
        Taiyuan: '太原',
        Wenzhou: '温州',
        Ningbo: '宁波',
        Dongguan: '东莞',
        Foshan: '佛山',
        Zhuhai: '珠海',
        Huizhou: '惠州',
        Zhongshan: '中山',
        Jiaxing: '嘉兴',
        Taizhou: '台州',
        Wuxi: '无锡',
        Nantong: '南通',
        Yangzhou: '扬州',
        Xuzhou: '徐州',
        Anqing: '安庆',
        // 港澳台
        'Hong Kong': '香港',
        Macao: '澳门',
        Macau: '澳门',
        Taipei: '台北',
        Kaohsiung: '高雄',
        Taichung: '台中',
        // 国际主要城市
        Tokyo: '东京',
        Osaka: '大阪',
        Seoul: '首尔',
        Singapore: '新加坡',
        Bangkok: '曼谷',
        Kuala: '吉隆坡',
        Jakarta: '雅加达',
        London: '伦敦',
        Paris: '巴黎',
        Berlin: '柏林',
        Rome: '罗马',
        Madrid: '马德里',
        Amsterdam: '阿姆斯特丹',
        Moscow: '莫斯科',
        'New York': '纽约',
        'Los Angeles': '洛杉矶',
        Chicago: '芝加哥',
        Houston: '休斯顿',
        Toronto: '多伦多',
        Vancouver: '温哥华',
        Sydney: '悉尼',
        Melbourne: '墨尔本',
        Auckland: '奥克兰',
        Dubai: '迪拜',
        Mumbai: '孟买',
        Delhi: '德里',
      };
      return cityMap[name] || name;
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
