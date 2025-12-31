<template>
  <div class="animate-slide-up space-y-6">
    <div
      :class="[
        'flex justify-between items-center p-4 rounded-xl border',
        cheatMode
          ? 'bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-yellow-500/30'
          : 'bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-white/10',
      ]"
    >
      <div class="text-sm text-gray-300">
        <p>
          当前难度: <span class="text-white font-bold">{{ data.difficulty }}</span>
          <span v-if="cheatMode" class="ml-2 text-xs text-yellow-400">[作弊模式]</span>
        </p>
        <p class="text-xs text-gray-500 mt-1">初始点数: {{ totalPointsAvailable }}</p>
      </div>
      <div class="text-right">
        <span class="block text-xs text-gray-400 uppercase tracking-wider">剩余点数</span>
        <span :class="['text-3xl font-bold', remaining === 0 ? 'text-gray-500' : 'text-secondary animate-pulse']">
          {{ remaining }}
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="stat in stats"
        :key="stat.path"
        class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div :class="['p-2 rounded-lg bg-black/20', stat.color]">
            <i :class="['fas', stat.icon]"></i>
          </div>
          <div>
            <span class="block text-sm font-medium text-gray-200">{{ stat.label }}</span>
            <span class="text-xs text-gray-500">{{ stat.costText }}</span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="handleStatChange(stat.path, -1)"
            :disabled="getCurrentValue(stat.path) <= getInitialValue(stat.path) || isUpdating"
            class="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <i class="fas fa-minus text-sm"></i>
          </button>

          <span class="w-12 text-center font-mono font-bold text-lg text-white">
            {{ getCurrentValue(stat.path) }}
          </span>

          <button
            @click="handleStatChange(stat.path, 1)"
            :disabled="remaining <= 0 || isUpdating"
            class="w-8 h-8 flex items-center justify-center rounded-full bg-secondary text-white shadow-lg shadow-pink-500/20 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none transition-all"
          >
            <i class="fas fa-plus text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { CharacterData, CharacterAttributes, INITIAL_ATTRIBUTES } from '../types';
import { DIFFICULTY_POINTS, MAX_STATS } from '../constants';
import { updateMvuVariable } from '../utils/mvu-helper';

const props = defineProps<{
  data: CharacterData;
  cheatMode?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update-data', fields: Partial<CharacterData>): void;
}>();

const isUpdating = ref(false);

// 作弊模式下使用999点，否则使用难度对应的点数
const totalPointsAvailable = computed(() => {
  if (props.cheatMode) return 999;
  return DIFFICULTY_POINTS[props.data.difficulty];
});

// 根据路径获取当前值
const getCurrentValue = (path: string): number => {
  const [category, key] = path.split('.');
  return (props.data.attributes[category as keyof CharacterAttributes] as any)?.[key] || 0;
};

// 根据路径获取初始值
const getInitialValue = (path: string): number => {
  const [category, key] = path.split('.');
  return (INITIAL_ATTRIBUTES[category as keyof CharacterAttributes] as any)?.[key] || 0;
};

// 计算已使用的点数（只计算可分配的6个属性）
const pointsUsed = computed(() => {
  let used = 0;
  const attrs = props.data.attributes;
  const init = INITIAL_ATTRIBUTES;

  // 确保所有值都存在，否则使用0
  const getVal = (obj: any, path: string[], fallback: number) => {
    let val = obj;
    for (const key of path) {
      val = val?.[key];
      if (val === undefined) return fallback;
    }
    return val ?? fallback;
  };

  // 角色基础 - 等级
  used += (getVal(attrs, ['角色基础', '_等级'], 1) - getVal(init, ['角色基础', '_等级'], 1)) * 1;
  // 核心状态 - 潜力
  used += (getVal(attrs, ['核心状态', '_潜力'], 5.0) - getVal(init, ['核心状态', '_潜力'], 5.0)) * 20;
  // 核心状态 - 基础魅力
  used += (getVal(attrs, ['核心状态', '$基础魅力'], 10) - getVal(init, ['核心状态', '$基础魅力'], 10)) * 1;
  // 核心状态 - 基础幸运
  used += (getVal(attrs, ['核心状态', '$基础幸运'], 10) - getVal(init, ['核心状态', '$基础幸运'], 10)) * 1;
  // 核心状态 - 最大耐力和最大快感
  used += (getVal(attrs, ['核心状态', '$最大耐力'], 100) - getVal(init, ['核心状态', '$最大耐力'], 100)) / 5;
  used += (getVal(attrs, ['核心状态', '$最大快感'], 100) - getVal(init, ['核心状态', '$最大快感'], 100)) / 5;

  return Math.max(0, Math.ceil(used));
});

const remaining = computed(() => totalPointsAvailable.value - pointsUsed.value);

// 可分配的属性列表（只有6个可分配属性）
const stats = [
  {
    path: '角色基础._等级',
    label: '初始等级',
    icon: 'fa-arrow-trend-up',
    color: 'text-yellow-400',
    costText: '1点 = 1级',
  },
  { path: '核心状态._潜力', label: '潜力资质', icon: 'fa-star', color: 'text-purple-400', costText: '2点 = 0.1潜力' },
  {
    path: '核心状态.$最大耐力',
    label: '最大耐力',
    icon: 'fa-shield-halved',
    color: 'text-green-400',
    costText: '1点 = 5耐力',
  },
  { path: '核心状态.$最大快感', label: '最大快感', icon: 'fa-heart', color: 'text-pink-400', costText: '1点 = 5快感' },
  {
    path: '核心状态.$基础魅力',
    label: '基础魅力',
    icon: 'fa-face-grin-hearts',
    color: 'text-rose-400',
    costText: '1点 = 1魅力',
  },
  { path: '核心状态.$基础幸运', label: '基础幸运', icon: 'fa-clover', color: 'text-cyan-400', costText: '1点 = 1幸运' },
];

const handleStatChange = async (path: string, delta: number) => {
  if (isUpdating.value) return;

  const [category, key] = path.split('.');
  let cost = 1;
  let valueChange = delta;

  // 根据属性类型计算成本和变化值
  if (path === '核心状态.$最大耐力' || path === '核心状态.$最大快感') {
    cost = 1;
    valueChange = delta * 5;
  } else if (path === '核心状态._潜力') {
    cost = 2;
    valueChange = delta * 0.1;
  }

  if (delta > 0 && remaining.value < cost) return;

  const currentVal = getCurrentValue(path);
  const maxVal = MAX_STATS[path as keyof typeof MAX_STATS] || 9999;
  const minVal = getInitialValue(path);

  let newVal = currentVal + valueChange;
  if (path === '核心状态._潜力') newVal = parseFloat(newVal.toFixed(1));

  if (newVal <= maxVal && newVal >= minVal) {
    isUpdating.value = true;

    try {
      // 更新本地状态
      const newAttributes = { ...props.data.attributes };
      const categoryObj = { ...newAttributes[category as keyof CharacterAttributes] } as any;
      categoryObj[key] = newVal;
      newAttributes[category as keyof CharacterAttributes] = categoryObj as any;

      // 先更新本地状态（立即反馈）
      emit('update-data', {
        attributes: newAttributes,
      });

      // 然后实时更新 MVU 变量
      await updateMvuVariable(path, newVal, `角色创建：${delta > 0 ? '增加' : '减少'}${Math.abs(valueChange)}`);
    } catch (error) {
      console.error('更新失败:', error);
    } finally {
      isUpdating.value = false;
    }
  }
};
</script>

<style lang="scss" scoped></style>
