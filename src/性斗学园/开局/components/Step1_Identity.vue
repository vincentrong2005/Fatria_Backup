<template>
  <div class="space-y-6 animate-slide-up">
    <!-- Mode Toggle Button (右上角) -->
    <div class="flex justify-end mb-2">
      <button
        @click="toggleLifeSimMode"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border',
          !isLifeSimUnlocked
            ? 'bg-gray-800/50 text-gray-500 border-gray-700/50 cursor-pointer'
            : isLifeSimMode
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 hover:bg-purple-500/30 shadow-lg shadow-purple-500/20'
              : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/20 hover:text-white',
        ]"
        :title="!isLifeSimUnlocked ? '需要特殊代码解锁' : isLifeSimMode ? '切换到正常模式' : '切换到生活模拟模式'"
      >
        <i :class="['fas', !isLifeSimUnlocked ? 'fa-lock' : isLifeSimMode ? 'fa-user-secret' : 'fa-user']"></i>
        <span v-if="!isLifeSimUnlocked">🔒 生活模拟</span>
        <span v-else-if="isLifeSimMode">生活模拟</span>
        <span v-else>正常模式</span>
      </button>
    </div>

    <!-- 正常模式：角色创建 -->
    <template v-if="!isLifeSimMode">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Name Input -->
        <div class="group relative">
          <label class="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <i class="fas fa-user text-secondary"></i> 姓名
          </label>
          <input
            type="text"
            :value="data.name"
            @input="e => updateData({ name: (e.target as HTMLInputElement).value })"
            class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
            placeholder="输入你的角色名..."
          />
        </div>

        <!-- Age Input -->
        <div class="group relative">
          <label class="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <i class="fas fa-graduation-cap text-secondary"></i> 年龄
          </label>
          <input
            type="number"
            min="15"
            max="25"
            :value="data.age"
            @input="e => updateData({ age: parseInt((e.target as HTMLInputElement).value) || 16 })"
            class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all backdrop-blur-sm"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Gender Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">性别</label>
          <div class="flex bg-white/5 rounded-xl p-1 border border-white/10 backdrop-blur-sm">
            <button
              v-for="g in Object.values(Gender)"
              :key="g"
              @click="handleGenderChange(g as Gender)"
              :class="[
                'flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300',
                data.gender === g
                  ? 'bg-secondary text-white shadow-lg shadow-pink-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5',
              ]"
            >
              {{ g }}
            </button>
          </div>
        </div>

        <!-- Difficulty Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <i class="fas fa-exclamation-circle text-red-400"></i> 游戏难度
          </label>
          <select
            :value="data.difficulty"
            @change="e => updateData({ difficulty: (e.target as HTMLSelectElement).value as Difficulty })"
            :disabled="data.difficulty === Difficulty.CHEATER"
            :class="[
              'w-full bg-white/5 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 appearance-none backdrop-blur-sm',
              data.difficulty === Difficulty.CHEATER
                ? 'border-yellow-500/50 cursor-not-allowed opacity-75 bg-yellow-500/10'
                : 'border-white/10 cursor-pointer',
            ]"
          >
            <option
              v-for="d in availableDifficulties"
              :key="d"
              :value="d"
              :class="[
                'bg-slate-900',
                d === Difficulty.MASOCHIST && data.difficulty !== Difficulty.MASOCHIST
                  ? 'text-gray-500 opacity-40'
                  : 'text-white',
              ]"
            >
              {{ getDifficultyDisplayName(d) }}
            </option>
          </select>
          <div v-if="data.difficulty === Difficulty.MASOCHIST" class="mt-2 text-xs text-pink-400 flex items-center gap-1">
            <i class="fas fa-lock"></i> 已选择抖M特化难度
          </div>
          <p v-if="data.difficulty === Difficulty.CHEATER" class="mt-2 text-xs text-yellow-400 flex items-center gap-1">
            <i class="fas fa-lock"></i> 作弊模式已激活，难度已锁定
          </p>
        </div>
      </div>

      <!-- Appearance Textarea -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
          <i class="fas fa-face-smile text-secondary"></i> 外貌描述
        </label>
        <textarea
          rows="2"
          :value="data.appearance"
          @input="e => updateData({ appearance: (e.target as HTMLTextAreaElement).value })"
          class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all backdrop-blur-sm resize-none"
          placeholder="例如：银色长发，红瞳，身材娇小，常年围着一条红色围巾..."
        />
      </div>

      <!-- Personality Textarea -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
          <i class="fas fa-align-left text-secondary"></i> 性格与背景
        </label>
        <textarea
          rows="3"
          :value="data.personality"
          @input="e => updateData({ personality: (e.target as HTMLTextAreaElement).value })"
          class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all backdrop-blur-sm resize-none"
          placeholder="你的性格特点，以及你是如何进入这所学院的..."
        />
      </div>
    </template>

    <!-- 生活模拟模式：NPC选择 -->
    <template v-else>
      <NpcCharacterSelect
        ref="npcSelectRef"
        @select="handleNpcSelect"
      />

      <!-- 难度选择（生活模拟模式） -->
      <div v-if="localSelectedNpc" class="mt-4">
        <label class="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
          <i class="fas fa-exclamation-circle text-red-400"></i> 游戏难度
        </label>
        <select
          :value="data.difficulty"
          @change="e => updateData({ difficulty: (e.target as HTMLSelectElement).value as Difficulty })"
          :disabled="data.difficulty === Difficulty.CHEATER"
          :class="[
            'w-full bg-white/5 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none backdrop-blur-sm',
            data.difficulty === Difficulty.CHEATER
              ? 'border-yellow-500/50 cursor-not-allowed opacity-75 bg-yellow-500/10'
              : 'border-purple-500/30 cursor-pointer',
          ]"
        >
          <option
            v-for="d in availableDifficulties"
            :key="d"
            :value="d"
            :class="[
              'bg-slate-900',
              d === Difficulty.MASOCHIST && data.difficulty !== Difficulty.MASOCHIST
                ? 'text-gray-500 opacity-40'
                : 'text-white',
            ]"
          >
            {{ getDifficultyDisplayName(d) }}
          </option>
        </select>
        <p v-if="data.difficulty === Difficulty.CHEATER" class="mt-2 text-xs text-yellow-400 flex items-center gap-1">
          <i class="fas fa-lock"></i> 作弊模式已激活，难度已锁定
        </p>
      </div>

      <!-- 开局场景输入 -->
      <div v-if="localSelectedNpc" class="mt-4">
        <label class="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
          <i class="fas fa-map-marker-alt text-purple-400"></i> 开局场景
        </label>
        <textarea
          rows="3"
          v-model="openingScene"
          class="w-full bg-white/5 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all backdrop-blur-sm resize-none"
          placeholder="描述你的开局场景，例如：正在教室备课/刚从体育馆训练结束..."
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { NpcCharacter } from '../data/npcCharacters';
import { CharacterData, Difficulty, Gender } from '../types';
import NpcCharacterSelect from './NpcCharacterSelect.vue';

const props = defineProps<{
  data: CharacterData;
  isLifeSimUnlocked?: boolean;
  isLifeSimMode?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update-data', fields: Partial<CharacterData>): void;
  (e: 'update-life-sim-mode', isActive: boolean): void;
  (e: 'select-npc', npc: NpcCharacter | null): void;
}>();

// 本地状态
const localSelectedNpc = ref<NpcCharacter | null>(null);
const openingScene = ref('');

// 切换模式
const toggleLifeSimMode = () => {
  if (props.isLifeSimUnlocked) {
    emit('update-life-sim-mode', !props.isLifeSimMode);
  } else {
    // 未解锁时显示提示
    alert('尚未解锁，敬请期待');
  }
};

// 处理NPC选择
const handleNpcSelect = (npc: NpcCharacter | null) => {
  localSelectedNpc.value = npc;
  emit('select-npc', npc);
  if (npc) {
    // 自动设置角色名为NPC名
    emit('update-data', { name: npc.name });
  }
};

// 监听开局场景变化
watch(openingScene, (newScene) => {
  emit('update-data', { personality: `[生活模拟模式开局场景]\n${newScene}` });
});

// 过滤难度选项：隐藏"作弊者"，除非当前已经是"作弊者"
const availableDifficulties = computed(() => {
  const allDifficulties = Object.values(Difficulty);
  // 如果当前难度是"作弊者"，则显示所有选项（包括作弊者）
  if (props.data.difficulty === Difficulty.CHEATER) {
    return allDifficulties;
  }
  // 否则隐藏"作弊者"选项
  return allDifficulties.filter(d => d !== Difficulty.CHEATER);
});

// 获取难度的显示名称
const getDifficultyDisplayName = (difficulty: Difficulty): string => {
  if (difficulty === Difficulty.MASOCHIST) {
    // 如果当前已选中"抖M"，显示"抖M特化"
    if (props.data.difficulty === Difficulty.MASOCHIST) {
      return '抖M特化';
    }
    // 否则显示"（隐藏条目）"
    return '（隐藏条目）';
  }
  return difficulty;
};

const updateData = (fields: Partial<CharacterData>) => {
  emit('update-data', fields);
};

const handleGenderChange = (gender: Gender) => {
  // 切换性别时，同时更新默认的身体配置
  let configFeatures: CharacterData['configFeatures'];

  if (gender === Gender.MALE) {
    // 男性：默认只有男性性征
    configFeatures = {
      hasBreasts: false,
      hasPenis: true,
    };
  } else if (gender === Gender.FEMALE) {
    // 女性：默认只有女性性征
    configFeatures = {
      hasBreasts: true,
      hasPenis: false,
    };
  } else {
    // 非二元：默认两种性征都可用，之后在角色类型页中自行勾选
    configFeatures = {
      hasBreasts: true,
      hasPenis: true,
    };
  }

  updateData({
    gender,
    archetypeId: null,
    configFeatures,
    // 清除性器特征（因为性别改变了）
    maleGenitalType: undefined,
    femaleGenitalType: undefined,
  });
};

// 暴露给父组件
defineExpose({
  localSelectedNpc,
  openingScene,
});
</script>

<style lang="scss" scoped>
// 让隐藏条目更不起眼
select option.text-gray-500 {
  color: rgba(156, 163, 175, 0.3) !important;
  font-size: 0.85em;
  font-style: italic;
}
</style>
