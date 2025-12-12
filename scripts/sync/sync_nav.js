const https = require('https');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const MENUS_URL = 'https://nav.eooce.com/api/menus';
const CARDS_API_BASE = 'https://nav.eooce.com/api/cards';

// Get project root directory (works whether run from root or scripts/sync/)
const PROJECT_ROOT = process.cwd();
const DATA_DIR = path.join(PROJECT_ROOT, 'data');
const CONF_PATH = path.join(PROJECT_ROOT, 'user-data', 'conf.yml');

// Helper function to fetch data from a URL
function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            reject(new Error(`Request failed with status code ${res.statusCode}`));
            return;
          }
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => reject(err));
  });
}

// Transform API card to conf.yml item format
function transformCard(card) {
  return {
    title: card.title,
    description: card.desc || undefined,
    icon: card.display_logo || card.logo_url || 'favicon',
    url: card.url
  };
}

// Check if two items are the same (by title - so user can modify URL without duplicates)
function isSameItem(item1, item2) {
  return item1.title === item2.title;
}

// Check if an item already exists in a list
function itemExists(item, itemList) {
  return itemList.some(existing => isSameItem(existing, item));
}

// Merge items: keep existing + add new ones from remote
function mergeItems(localItems, remoteItems) {
  const merged = [...localItems]; // Keep all local items

  for (const remoteItem of remoteItems) {
    if (!itemExists(remoteItem, localItems)) {
      merged.push(remoteItem);
      console.log(`    [+] 新增: ${remoteItem.title}`);
    }
  }

  return merged;
}

async function sync() {
  try {
    console.log('='.repeat(60));
    console.log('🔄 开始增量同步 (保留您的自定义分类)');
    console.log('='.repeat(60));

    // 1. Fetch Menus from remote
    console.log(`\n📡 获取远程菜单: ${MENUS_URL}`);
    const menus = await fetchData(MENUS_URL);
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(path.join(DATA_DIR, 'menus.json'), JSON.stringify(menus, null, 2));

    // 2. Fetch all remote sections
    const remoteSections = [];

    for (const menu of menus) {
      // Fetch main menu items
      const mainUrl = `${CARDS_API_BASE}/${menu.id}`;
      try {
        const mainCards = await fetchData(mainUrl);
        if (mainCards && mainCards.length > 0) {
          remoteSections.push({
            name: menu.name,
            items: mainCards.map(transformCard)
          });
        }
      } catch (err) {
        console.error(`获取 ${menu.name} 失败:`, err.message);
      }

      // Fetch submenu items
      if (menu.subMenus && menu.subMenus.length > 0) {
        for (const subMenu of menu.subMenus) {
          const subUrl = `${CARDS_API_BASE}/${menu.id}?subMenuId=${subMenu.id}`;
          try {
            const subCards = await fetchData(subUrl);
            if (subCards && subCards.length > 0) {
              remoteSections.push({
                name: `${menu.name} - ${subMenu.name}`,
                items: subCards.map(transformCard)
              });
            }
          } catch (err) {
            console.error(`获取 ${menu.name} - ${subMenu.name} 失败:`, err.message);
          }
        }
      }
    }

    console.log(`\n📦 远程共有 ${remoteSections.length} 个分类`);

    // 3. Load existing conf.yml
    const confPath = CONF_PATH;
    let conf = {
      appConfig: { theme: 'colorful', faviconApi: 'google' },
      pageInfo: { title: 'LaoWang Nav', description: '您的个人导航站' },
      sections: []
    };

    if (fs.existsSync(confPath)) {
      const confContent = fs.readFileSync(confPath, 'utf8');
      conf = yaml.load(confContent);
    }

    const localSections = conf.sections || [];
    console.log(`📂 本地共有 ${localSections.length} 个分类`);

    // 4. Smart Merge Logic
    console.log('\n🔀 开始智能合并...\n');

    const mergedSections = [];
    const processedRemoteNames = new Set();
    let newSectionsCount = 0;
    let newItemsCount = 0;

    // First: Process all local sections
    for (const localSection of localSections) {
      const matchingRemote = remoteSections.find(r => r.name === localSection.name);

      if (matchingRemote) {
        // Section exists in both: merge items
        processedRemoteNames.add(matchingRemote.name);
        const localItems = localSection.items || [];
        const remoteItems = matchingRemote.items || [];

        console.log(`📁 [合并] ${localSection.name}`);
        const beforeCount = localItems.length;
        const mergedItems = mergeItems(localItems, remoteItems);
        const addedCount = mergedItems.length - beforeCount;

        if (addedCount > 0) {
          newItemsCount += addedCount;
        }

        mergedSections.push({
          ...localSection,
          items: mergedItems
        });
      } else {
        // Section only exists locally: keep it
        console.log(`💾 [保留] ${localSection.name} (本地自定义)`);
        mergedSections.push(localSection);
      }
    }

    // Second: Add new remote sections that don't exist locally
    for (const remoteSection of remoteSections) {
      if (!processedRemoteNames.has(remoteSection.name)) {
        const localExists = localSections.some(l => l.name === remoteSection.name);
        if (!localExists) {
          console.log(`✨ [新增分类] ${remoteSection.name} (${remoteSection.items.length} 项)`);
          mergedSections.push(remoteSection);
          newSectionsCount++;
          newItemsCount += remoteSection.items.length;
        }
      }
    }

    // 5. Save merged result
    conf.sections = mergedSections;
    const newConfContent = yaml.dump(conf, {
      lineWidth: -1,
      quotingType: '"',
      forceQuotes: false
    });
    fs.writeFileSync(confPath, newConfContent);

    // 6. Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ 同步完成!');
    console.log('='.repeat(60));
    console.log(`📊 统计:`);
    console.log(`   - 总分类数: ${mergedSections.length}`);
    console.log(`   - 新增分类: ${newSectionsCount}`);
    console.log(`   - 新增卡片: ${newItemsCount}`);
    console.log(`   - 您的自定义分类: 全部保留 ✅`);

  } catch (error) {
    console.error('同步失败:', error);
  }
}

sync();
