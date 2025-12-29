<template>
  <div class="inventory-page">
    <!-- 金币显示 -->
    <div class="coins-card">
      <div class="coins-icon">
        <i class="fas fa-coins"></i>
      </div>
      <div class="coins-info">
        <span class="coins-label">学园金币</span>
        <span class="coins-amount">{{ formatNumber(characterData.物品系统?.$学园金币 || 0) }}</span>
      </div>
    </div>

    <!-- 装备栏 -->
    <div class="section-card">
      <h3 class="section-title"><i class="fas fa-shield"></i> 装备栏</h3>
      <div class="equipment-grid">
        <div class="equipment-slot" v-for="(slot, key) in equipmentSlots" :key="key" :class="{ empty: !slot.value }">
          <div class="slot-icon">
            <i :class="slot.icon"></i>
          </div>
          <div class="slot-info">
            <div class="slot-label">{{ slot.label }}</div>
            <div class="slot-value">{{ slot.value || '空' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 装备总加成 -->
    <div class="section-card" v-if="hasEquipmentBonuses">
      <h3 class="section-title"><i class="fas fa-chart-line"></i> 装备加成</h3>
      <div class="bonus-grid">
        <div v-for="(value, key) in equipmentBonuses" :key="key" class="bonus-item" v-show="value !== 0">
          <span class="bonus-label">{{ formatBonusLabel(key) }}</span>
          <span class="bonus-value" :class="getBonusClass(value)">
            {{ formatBonusValue(value) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 背包物品 -->
    <div class="section-card">
      <h3 class="section-title">
        <i class="fas fa-box"></i> 背包
        <span class="item-count">{{ Object.keys(inventoryItems).length }} 件物品</span>
      </h3>

      <div class="inventory-list" v-if="Object.keys(inventoryItems).length > 0">
        <div
          class="inventory-item"
          v-for="(item, key) in inventoryItems"
          :key="key"
          :class="getItemRarityClass(item.等级)"
        >
          <div class="item-header">
            <div class="item-name">{{ key }}</div>
            <div class="item-badges">
              <span class="item-level" :class="getItemRarityClass(item.等级)">{{ item.等级 }}</span>
              <span class="item-count">×{{ item.数量 }}</span>
            </div>
          </div>
          <div class="item-type">{{ item.类型 }}</div>
          <div class="item-desc" v-if="item.描述 || item.效果描述">
            {{ item.描述 || item.效果描述 }}
          </div>
        </div>
      </div>

      <div class="empty-state" v-else>
        <i class="fas fa-box-open"></i>
        <p>背包空空如也</p>
        <span>去学园商店逛逛吧</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  characterData: any;
}>();

const equipmentSlots = computed(() => {
  const equipment = props.characterData.物品系统?.$装备栏 || {};
  return [
    { key: '主装备', label: '主装备', value: equipment.主装备, icon: 'fas fa-wand-magic-sparkles' },
    { key: '副装备', label: '副装备', value: equipment.副装备, icon: 'fas fa-hand-fist' },
    { key: '饰品1', label: '饰品 1', value: equipment.饰品1, icon: 'fas fa-ring' },
    { key: '饰品2', label: '饰品 2', value: equipment.饰品2, icon: 'fas fa-gem' },
    { key: '特殊装备', label: '特殊装备', value: equipment.特殊装备, icon: 'fas fa-star' },
  ];
});

const equipmentBonuses = computed(() => {
  return props.characterData.物品系统?.$装备总加成 || {};
});

const hasEquipmentBonuses = computed(() => {
  const bonuses = equipmentBonuses.value;
  return Object.values(bonuses).some((v: any) => v !== 0);
});

const inventoryItems = computed(() => {
  return props.characterData.物品系统?.$背包 || {};
});

function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN');
}

// 格式化加成标签
function formatBonusLabel(key: string): string {
  const labelMap: Record<string, string> = {
    $魅力加成: '魅力',
    $幸运加成: '幸运',
    $基础性斗力加成: '性斗力+',
    $基础性斗力成算: '性斗力%',
    $基础忍耐力加成: '忍耐力+',
    $基础忍耐力成算: '忍耐力%',
    $闪避率加成: '闪避率',
    $暴击率加成: '暴击率',
    $意志力加成: '意志力',
  };
  return labelMap[key] || key;
}

// 格式化加成值
function formatBonusValue(value: number): string {
  if (value === 0) return '0';
  if (value > 0) return `+${value}`;
  return `${value}`;
}

// 获取加成值的样式类
function getBonusClass(value: number): string {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
}

// 获取物品稀有度样式
function getItemRarityClass(level: string): string {
  const rarityMap: Record<string, string> = {
    C: 'rarity-c',
    B: 'rarity-b',
    A: 'rarity-a',
    S: 'rarity-s',
    SS: 'rarity-ss',
  };
  return rarityMap[level] || 'rarity-c';
}
</script>

<style scoped lang="scss">
.inventory-page {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
}

.coins-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.05));
  border-radius: 16px;
  border: 1px solid rgba(251, 191, 36, 0.3);
  margin-bottom: 20px;

  .coins-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    display: flex;
    align-items: center;
    justify-content: center;

    i {
      font-size: 24px;
      color: white;
    }
  }

  .coins-info {
    display: flex;
    flex-direction: column;
  }

  .coins-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .coins-amount {
    font-size: 28px;
    font-weight: 700;
    color: #fcd34d;
    font-family: 'JetBrains Mono', monospace;
  }
}

.section-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 16px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  i {
    font-size: 14px;
    color: #667eea;
  }

  .item-count {
    margin-left: auto;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    font-weight: 400;
  }
}

.equipment-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.equipment-slot {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &.empty {
    opacity: 0.5;
  }

  .slot-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.1));
    display: flex;
    align-items: center;
    justify-content: center;

    i {
      font-size: 16px;
      color: #a78bfa;
    }
  }

  .slot-info {
    flex: 1;
  }

  .slot-label {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .slot-value {
    font-size: 14px;
    color: white;
    font-weight: 500;
    margin-top: 2px;
  }
}

.bonus-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.bonus-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.bonus-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.bonus-value {
  font-size: 14px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;

  &.positive {
    color: #34d399;
  }

  &.negative {
    color: #f87171;
  }

  &.neutral {
    color: rgba(255, 255, 255, 0.4);
  }
}

.inventory-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.inventory-item {
  padding: 14px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border-left: 3px solid;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateX(4px);
  }

  &.rarity-c {
    border-left-color: #9ca3af;
  }

  &.rarity-b {
    border-left-color: #60a5fa;
  }

  &.rarity-a {
    border-left-color: #a78bfa;
  }

  &.rarity-s {
    border-left-color: #fbbf24;
  }

  &.rarity-ss {
    border-left-color: #f87171;
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .item-name {
    font-size: 14px;
    font-weight: 600;
    color: white;
  }

  .item-badges {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .item-level {
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 600;

    &.rarity-c {
      background: rgba(156, 163, 175, 0.2);
      color: #d1d5db;
    }

    &.rarity-b {
      background: rgba(96, 165, 250, 0.2);
      color: #93c5fd;
    }

    &.rarity-a {
      background: rgba(167, 139, 250, 0.2);
      color: #c4b5fd;
    }

    &.rarity-s {
      background: rgba(251, 191, 36, 0.2);
      color: #fcd34d;
    }

    &.rarity-ss {
      background: rgba(248, 113, 113, 0.2);
      color: #fca5a5;
    }
  }

  .item-count {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    font-family: 'JetBrains Mono', monospace;
  }

  .item-type {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    margin-bottom: 6px;
  }

  .item-desc {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.5;
  }
}

.empty-state {
  padding: 40px 20px;
  text-align: center;

  i {
    font-size: 48px;
    color: rgba(255, 255, 255, 0.1);
    margin-bottom: 16px;
  }

  p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 4px;
  }

  span {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.3);
  }
}
</style>
