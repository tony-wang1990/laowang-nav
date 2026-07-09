<template>
  <div class="health-panel">
    <div class="health-header">
      <div>
        <h2>链接健康面板</h2>
        <p>{{ summaryText }}</p>
      </div>
      <div class="health-actions">
        <Button :click="runHealthCheck" :disabled="isRunning || rows.length < 1">
          {{ isRunning ? '检测中...' : '开始检测' }}
        </Button>
        <Button :click="showOnlyIssues = !showOnlyIssues">
          {{ showOnlyIssues ? '显示全部' : '只看问题' }}
        </Button>
      </div>
    </div>

    <div class="health-table">
      <div class="health-row table-head">
        <span>站点</span>
        <span>状态</span>
        <span>耗时</span>
        <span>证书</span>
        <span>最终地址</span>
      </div>
      <div
        v-for="row in visibleRows"
        :key="row.key"
        :class="`health-row level-${resultLevel(row.result)}`"
      >
        <div class="site-cell">
          <strong>{{ row.title }}</strong>
          <small>{{ row.sectionName }}</small>
        </div>
        <span class="status-pill">{{ resultStatus(row.result) }}</span>
        <span>{{ resultDuration(row.result) }}</span>
        <span>{{ certificateText(row.result) }}</span>
        <code :title="row.result && row.result.finalUrl ? row.result.finalUrl : row.url">
          {{ row.result && row.result.finalUrl ? row.result.finalUrl : row.url }}
        </code>
      </div>
      <p v-if="visibleRows.length < 1" class="empty-state">
        当前没有可展示的链接检测结果。
      </p>
    </div>
  </div>
</template>

<script>

import axios from 'axios';
import { serviceEndpoints } from '@/utils/defaults';
import Button from '@/components/FormElements/Button';

export default {
  name: 'LinkHealthPanel',
  components: {
    Button,
  },
  props: {
    config: Object,
  },
  data() {
    return {
      isRunning: false,
      showOnlyIssues: false,
      results: {},
      lastCheckedAt: '',
    };
  },
  computed: {
    rows() {
      return this.flattenItems().map((row, index) => ({
        ...row,
        key: `${row.sectionName}-${row.title || row.url}-${index}`,
        result: this.results[index],
        index,
      }));
    },
    visibleRows() {
      if (!this.showOnlyIssues) return this.rows;
      return this.rows.filter(row => this.resultLevel(row.result) !== 'ok');
    },
    checkedCount() {
      return Object.keys(this.results).length;
    },
    issueCount() {
      return this.rows.filter(row => this.resultLevel(row.result) === 'danger').length;
    },
    summaryText() {
      if (!this.lastCheckedAt) return `共 ${this.rows.length} 个链接，可批量检测访问性、响应时间和 HTTPS 证书。`;
      return `已检测 ${this.checkedCount} 个链接，发现 ${this.issueCount} 个不可用或高风险结果。`;
    },
  },
  methods: {
    flattenItems() {
      const sections = this.config?.sections || [];
      return sections.reduce((items, section) => {
        const sectionItems = section.items || [];
        sectionItems.forEach((item) => {
          if (item.subItems) {
            item.subItems.forEach((subItem) => {
              items.push({
                title: subItem.title,
                url: subItem.statusCheckUrl || subItem.url,
                sectionName: section.name || 'Untitled',
              });
            });
          } else {
            items.push({
              title: item.title,
              url: item.statusCheckUrl || item.url,
              sectionName: section.name || 'Untitled',
            });
          }
        });
        return items.filter(item => item.url);
      }, []);
    },
    runHealthCheck() {
      const baseUrl = process.env.VUE_APP_DOMAIN || window.location.origin;
      const endpoint = `${baseUrl}${serviceEndpoints.linkHealthCheck}`;
      this.isRunning = true;
      this.results = {};
      axios.post(endpoint, {
        items: this.rows.map(row => ({
          title: row.title,
          url: row.url,
          sectionName: row.sectionName,
        })),
      })
        .then((response) => {
          const results = response.data && response.data.results ? response.data.results : [];
          this.results = results.reduce((acc, result, index) => {
            acc[index] = result;
            return acc;
          }, {});
          this.lastCheckedAt = new Date().toISOString();
          this.$toasted.show('链接检测完成', { className: 'toast-success' });
        })
        .catch((error) => {
          this.$toasted.show(`链接检测失败: ${error.message}`, { className: 'toast-error' });
        })
        .finally(() => {
          this.isRunning = false;
        });
    },
    resultLevel(result) {
      if (!result) return 'pending';
      if (!result.ok) return 'danger';
      if (result.certificateDaysRemaining !== undefined && result.certificateDaysRemaining < 15) {
        return 'warning';
      }
      return 'ok';
    },
    resultStatus(result) {
      if (!result) return '未检测';
      if (result.error) return result.code || '请求失败';
      return `${result.statusCode} ${result.statusText || ''}`.trim();
    },
    resultDuration(result) {
      if (!result || result.durationMs === undefined) return '-';
      return `${result.durationMs} ms`;
    },
    certificateText(result) {
      if (!result) return '-';
      if (result.certificateDaysRemaining === undefined) return result.protocol === 'https:' ? '未返回' : '非 HTTPS';
      if (result.certificateDaysRemaining < 0) return '已过期';
      return `${result.certificateDaysRemaining} 天`;
    },
  },
};
</script>

<style scoped lang="scss">
.health-panel {
  color: var(--config-settings-color);
  padding: 1rem;
}

.health-header {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  justify-content: space-between;
  border-bottom: 1px solid var(--config-settings-color);
  padding-bottom: 0.75rem;

  h2 {
    font-size: 1.25rem;
    margin: 0 0 0.25rem;
  }

  p {
    margin: 0;
    opacity: 0.8;
  }
}

.health-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: flex-end;

  button {
    min-width: auto;
    margin: 0;
    font-size: 0.85rem;
    padding: 0.35rem 0.55rem;
    color: var(--config-settings-color);
    background: var(--config-settings-background);
    border-color: var(--config-settings-color);
  }
}

.health-table {
  display: grid;
  gap: 0.35rem;
  margin-top: 1rem;
}

.health-row {
  display: grid;
  grid-template-columns:
    minmax(10rem, 1.2fr)
    minmax(7rem, 0.7fr)
    minmax(5rem, 0.4fr)
    minmax(6rem, 0.5fr)
    minmax(12rem, 1.4fr);
  gap: 0.75rem;
  align-items: center;
  border: 1px solid rgba(128, 128, 128, 0.35);
  border-left-width: 4px;
  border-radius: var(--curve-factor);
  padding: 0.6rem;

  &.table-head {
    font-weight: bold;
    border-left-width: 1px;
    opacity: 0.85;
  }

  &.level-danger {
    border-left-color: var(--danger);
  }

  &.level-warning {
    border-left-color: var(--warning);
  }

  &.level-ok {
    border-left-color: var(--success);
  }

  &.level-pending {
    border-left-color: var(--medium-grey);
  }
}

.site-cell {
  display: grid;
  gap: 0.2rem;

  small {
    opacity: 0.7;
  }
}

code {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--config-code-color);
  background: var(--config-code-background);
  border-radius: var(--curve-factor);
  padding: 0.25rem 0.4rem;
}

.status-pill {
  width: fit-content;
  border: 1px solid currentColor;
  border-radius: var(--curve-factor);
  padding: 0.2rem 0.45rem;
  font-size: 0.85rem;
}

.empty-state {
  text-align: center;
  opacity: 0.8;
}

@media (max-width: 950px) {
  .health-header {
    flex-direction: column;
  }

  .health-row {
    grid-template-columns: 1fr;
  }

  .health-actions {
    justify-content: flex-start;
  }
}
</style>
