<template>
  <div class="health-panel">
    <div class="health-header">
      <div>
        <h2>图标健康检查</h2>
        <p>{{ summaryText }}</p>
      </div>
      <div class="health-actions">
        <Button :click="fixSuspiciousIcons" :disabled="suspiciousRows.length < 1">
          一键改为自动图标
        </Button>
        <Button :click="saveToDisk" :disallow="!permissions.allowWriteToDisk">
          保存到磁盘
        </Button>
        <Button :click="saveLocal" :disallow="!permissions.allowSaveLocally">
          保存到本地
        </Button>
      </div>
    </div>

    <div class="health-filter">
      <button
        v-for="option in filterOptions"
        :key="option.value"
        :class="{ active: activeFilter === option.value }"
        type="button"
        @click="activeFilter = option.value"
      >
        {{ option.label }}
      </button>
    </div>

    <div class="health-table">
      <div class="health-row table-head">
        <span>站点</span>
        <span>图标</span>
        <span>状态</span>
        <span>操作</span>
      </div>
      <div
        v-for="row in visibleRows"
        :key="row.key"
        :class="`health-row level-${row.issue.level}`"
      >
        <div class="site-cell">
          <strong>{{ row.item.title || row.item.url }}</strong>
          <small>{{ row.sectionName }}</small>
        </div>
        <code :title="row.item.icon || 'auto favicon'">
          {{ row.item.icon || 'auto favicon' }}
        </code>
        <span class="status-pill">{{ row.issue.label }}</span>
        <div class="row-actions">
          <Button :click="() => useAutoIcon(row)" tooltip="使用默认 favicon 规则">
            自动
          </Button>
          <Button :click="() => useRootFavicon(row)" tooltip="使用站点根目录 favicon.ico">
            根图标
          </Button>
        </div>
      </div>
      <p v-if="visibleRows.length < 1" class="empty-state">
        当前筛选下没有需要处理的图标。
      </p>
    </div>
  </div>
</template>

<script>

import ConfigSavingMixin from '@/mixins/ConfigSaving';
import Button from '@/components/FormElements/Button';

export default {
  name: 'IconHealthPanel',
  mixins: [ConfigSavingMixin],
  components: {
    Button,
  },
  props: {
    config: Object,
  },
  data() {
    return {
      activeFilter: 'issues',
      filterOptions: [
        { label: '问题项', value: 'issues' },
        { label: '全部', value: 'all' },
      ],
    };
  },
  computed: {
    permissions() {
      return this.$store.getters.permissions;
    },
    rows() {
      return this.flattenItems().map((row, index) => ({
        ...row,
        key: `${row.sectionName}-${row.item.title || row.item.url}-${index}`,
        issue: this.inspectIcon(row.item),
      }));
    },
    suspiciousRows() {
      return this.rows.filter(row => row.issue.level !== 'ok');
    },
    visibleRows() {
      if (this.activeFilter === 'all') return this.rows;
      return this.suspiciousRows;
    },
    summaryText() {
      const total = this.rows.length;
      const issues = this.suspiciousRows.length;
      return `共 ${total} 个链接，发现 ${issues} 个可疑图标配置。`;
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
              items.push({ item: subItem, sectionName: section.name || 'Untitled' });
            });
          } else {
            items.push({ item, sectionName: section.name || 'Untitled' });
          }
        });
        return items;
      }, []);
    },
    inspectIcon(item) {
      const icon = (item.icon || '').trim();
      if (!icon || icon === 'favicon') {
        return { level: 'ok', label: '自动 favicon' };
      }
      if (/^http:\/\//i.test(icon) && /^https:/i.test(window.location.protocol)) {
        return { level: 'warning', label: 'HTTP 图标可能被拦截' };
      }
      if (/\?.*\/favicon\.(ico|png|svg|webp)$/i.test(icon)) {
        return { level: 'danger', label: 'favicon 被拼到查询参数后' };
      }
      if (/\.html?\/favicon\.(ico|png|svg|webp)$/i.test(icon)) {
        return { level: 'danger', label: 'favicon 被拼到页面路径后' };
      }
      if (/\/(zh|zh-hans|cn|en|ru|ja|ko)\/favicon\.(ico|png|svg|webp)$/i.test(icon)) {
        return { level: 'warning', label: '多语言路径图标易失效' };
      }
      return { level: 'ok', label: '看起来正常' };
    },
    useAutoIcon(row) {
      this.setAutoIcon(row);
      this.$toasted.show('已改为自动 favicon', { className: 'toast-success' });
    },
    setAutoIcon(row) {
      if (this.config?.appConfig?.defaultIcon === 'favicon') {
        this.$delete(row.item, 'icon');
      } else {
        this.$set(row.item, 'icon', 'favicon');
      }
    },
    useRootFavicon(row) {
      const rootFavicon = this.getRootFavicon(row.item.url);
      if (!rootFavicon) {
        this.$toasted.show('这个链接 URL 无法解析', { className: 'toast-error' });
        return;
      }
      this.$set(row.item, 'icon', rootFavicon);
      this.$toasted.show('已改为根目录 favicon.ico', { className: 'toast-success' });
    },
    fixSuspiciousIcons() {
      this.suspiciousRows.forEach(row => this.setAutoIcon(row));
      this.$toasted.show('可疑图标已批量改为自动 favicon', { className: 'toast-success' });
    },
    getRootFavicon(rawUrl) {
      try {
        const normalized = /^[a-z][a-z0-9+.-]*:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
        const parsed = new URL(normalized);
        return `${parsed.origin}/favicon.ico`;
      } catch (e) {
        return '';
      }
    },
    saveToDisk() {
      this.writeConfigToDisk(this.config);
    },
    saveLocal() {
      this.saveConfigLocally(this.config);
    },
    showToast(message, success) {
      this.$toasted.show(message, { className: `toast-${success ? 'success' : 'error'}` });
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

.health-actions,
.row-actions {
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

.health-filter {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;

  button {
    color: var(--config-settings-color);
    background: transparent;
    border: 1px solid var(--config-settings-color);
    border-radius: var(--curve-factor);
    padding: 0.35rem 0.75rem;
    cursor: pointer;

    &.active,
    &:hover {
      color: var(--config-settings-background);
      background: var(--config-settings-color);
    }
  }
}

.health-table {
  display: grid;
  gap: 0.35rem;
}

.health-row {
  display: grid;
  grid-template-columns:
    minmax(10rem, 1.2fr)
    minmax(12rem, 1.4fr)
    minmax(8rem, 0.7fr)
    minmax(10rem, 0.8fr);
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

@media (max-width: 850px) {
  .health-header {
    flex-direction: column;
  }

  .health-row {
    grid-template-columns: 1fr;
  }

  .health-actions,
  .row-actions {
    justify-content: flex-start;
  }
}
</style>
