<template>
  <div class="animate-slide-up space-y-6">
    <div class="flex justify-between items-center bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-4 rounded-xl border border-white/10">
      <div class="text-sm text-gray-300">
        <p>当前难度: <span class="text-white font-bold">{{ data.difficulty }}</span></p>
        <p class="text-xs text-gray-500 mt-1">初始点数: {{ totalPointsAvailable }}</p>
      </div>
      <div class="text-right">
        <span class="block text-xs text-gray-400 uppercase tracking-wider">剩余点数</span>
        <span :class="[
          'text-3xl font-bold',
          remaining === 0 ? 'text-gray-500' : 'text-secondary animate-pulse'
        ]">
          {{ remaining }}
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="stat in stats"
        :key="stat.key"
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
            @click="handleStatChange(stat.key, -1)"
            :disabled="data.attributes[stat.key] <= INITIAL_ATTRIBUTES[stat.key]"
            class="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <i class="fas fa-minus text-sm"></i>
          </button>
          
          <span class="w-12 text-center font-mono font-bold text-lg text-white">
            {{ data.attributes[stat.key] }}
          </span>
          
          <button
            @click="handleStatChange(stat.key, 1)"
            :disabled="remaining <= 0"
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
import { computed } from 'vue';
import { CharacterData, GameAttributes, INITIAL_ATTRIBUTES } from '../types';
import { DIFFICULTY_POINTS, MAX_STATS } from '../constants';

const props = defineProps<{
  data: CharacterData;
}>();

const emit = defineEmits<{
  (e: 'update-data', fields: Partial<CharacterData>): void;
}>();

const totalPointsAvailable = computed(() => DIFFICULTY_POINTS[props.data.difficulty]);

const pointsUsed = computed(() => {
  let used = 0;
  used += (props.data.attributes._等级 - INITIAL_ATTRIBUTES._等级) * 1;
  used += (props.data.attributes.$潜力 - INITIAL_ATTRIBUTES.$潜力) * 20;
  used += (props.data.attributes._魅力 - INITIAL_ATTRIBUTES._魅力) * 1;
  used += (props.data.attributes._幸运 - INITIAL_ATTRIBUTES._幸运) * 1;
  used += (props.data.attributes._最大耐力 - INITIAL_ATTRIBUTES._最大耐力) / 5;
  used += (props.data.attributes._最大快感 - INITIAL_ATTRIBUTES._最大快感) / 5;
  return Math.max(0, Math.ceil(used));
});

const remaining = computed(() => totalPointsAvailable.value - pointsUsed.value);

const stats = [
  { key: '_等级' as keyof GameAttributes, label: '初始等级', icon: 'fa-arrow-trend-up', color: 'text-yellow-400', costText: '1点 = 1级' },
  { key: '$潜力' as keyof GameAttributes, label: '潜力资质', icon: 'fa-star', color: 'text-purple-400', costText: '2点 = 0.1潜力' },
  { key: '_最大耐力' as keyof GameAttributes, label: '最大耐力', icon: 'fa-shield', color: 'text-green-400', costText: '1点 = 5耐力' },
  { key: '_最大快感' as keyof GameAttributes, label: '最大快感', icon: 'fa-heart', color: 'text-pink-400', costText: '1点 = 5快感' },
  { key: '_魅力' as keyof GameAttributes, label: '个人魅力', icon: 'fa-sparkles', color: 'text-rose-400', costText: '1点 = 1魅力' },
  { key: '_幸运' as keyof GameAttributes, label: '幸运值', icon: 'fa-bolt', color: 'text-cyan-400', costText: '1点 = 1幸运' },
];

const handleStatChange = (key: keyof GameAttributes, delta: number) => {
  let cost = 1;
  let valueChange = delta;

  if (key === '_最大耐力' || key === '_最大快感') {
    cost = 1;
    valueChange = delta * 5;
  } else if (key === '$潜力') {
    cost = 2;
    valueChange = delta * 0.1;
  }

  if (delta > 0 && remaining.value < cost) return;

  const currentVal = props.data.attributes[key];
  const maxVal = MAX_STATS[key as keyof typeof MAX_STATS] || 9999;
  const minVal = INITIAL_ATTRIBUTES[key];

  let newVal = currentVal + valueChange;
  if (key === '$潜力') newVal = parseFloat(newVal.toFixed(1));

  if (newVal <= maxVal && newVal >= minVal) {
    emit('update-data', {
      attributes: {
        ...props.data.attributes,
        [key]: newVal
      }
    });
  }
};
</script>

<style lang="scss" scoped>
</style>
