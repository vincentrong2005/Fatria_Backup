<template>
  <div class="animate-slide-up space-y-8">
    <!-- Archetype Selection -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-4">
        <!-- Header Panel -->
        <div class="bg-black/20 border border-white/5 rounded-t-2xl p-4 flex justify-between items-center backdrop-blur-md">
          <div class="flex items-center gap-2">
            <div class="p-1.5 bg-secondary/20 rounded text-secondary">
              <i class="fas fa-user"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-white">校园身份</h3>
              <p class="text-xs text-gray-400">选择 1 个核心身份</p>
            </div>
          </div>
        </div>

        <!-- Scrollable List -->
        <div class="bg-black/20 border-x border-b border-white/5 rounded-b-2xl p-4 h-[350px] overflow-y-auto custom-scrollbar">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              v-for="archetype in currentArchetypes"
              :key="archetype.id"
              @click="updateData({ archetypeId: archetype.id })"
              :class="[
                'relative group p-3 rounded-xl border transition-all duration-300 text-left flex items-start gap-3',
                data.archetypeId === archetype.id
                  ? 'bg-secondary/20 border-secondary ring-1 ring-secondary'
                  : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
              ]"
            >
              <div :class="[
                'p-2.5 rounded-lg transition-colors shrink-0',
                data.archetypeId === archetype.id ? 'bg-secondary text-white' : 'bg-black/30 text-gray-400 group-hover:text-gray-200'
              ]">
                <i :class="['fas', getIconClass(archetype.icon)]"></i>
              </div>
              
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start">
                  <h4 :class="[
                    'font-bold text-sm truncate transition-colors',
                    data.archetypeId === archetype.id ? 'text-white' : 'text-gray-200'
                  ]">
                    {{ archetype.name }}
                  </h4>
                </div>
                <p class="text-xs text-gray-400 mt-1 leading-snug line-clamp-2">
                  {{ archetype.description }}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Selected Archetype Detail Panel -->
      <div class="lg:col-span-1">
        <div :class="[
          'h-full rounded-2xl border border-white/10 p-6 flex flex-col items-center text-center transition-all duration-500',
          selectedArchetype ? 'bg-gradient-to-b from-secondary/10 to-transparent' : 'bg-white/5 grayscale opacity-50'
        ]">
          <template v-if="selectedArchetype">
            <div class="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4 text-secondary shadow-[0_0_20px_rgba(236,72,153,0.3)]">
              <i :class="['fas', getIconClass(selectedArchetype.passiveSkill.icon)]"></i>
            </div>
            <h4 class="text-sm uppercase tracking-widest text-secondary font-bold mb-1">专属被动</h4>
            <h3 class="text-xl font-bold text-white mb-2">{{ selectedArchetype.passiveSkill.name }}</h3>
            <p class="text-sm text-gray-300 leading-relaxed">
              {{ selectedArchetype.passiveSkill.description }}
            </p>
            
            <div class="mt-6 w-full pt-6 border-t border-white/10">
              <h4 class="text-xs uppercase tracking-widest text-gray-500 mb-3">初始加成</h4>
              <div class="flex flex-wrap gap-2 justify-center">
                <span
                  v-for="[key, value] in Object.entries(selectedArchetype.baseBonus)"
                  :key="key"
                  class="text-xs px-2 py-1 rounded-md bg-black/40 text-gray-200 border border-white/10"
                >
                  {{ getStatLabel(key) }} <span :class="(value as number) > 0 ? 'text-green-400' : 'text-red-400'">
                    {{ (value as number) > 0 ? '+' : '' }}{{ value }}
                  </span>
                </span>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="flex flex-col items-center justify-center h-full text-gray-500">
              <i class="fas fa-sparkles text-5xl mb-4 opacity-20"></i>
              <p>请选择一个身份以查看详情</p>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Body Stats Customization -->
    <div class="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
      <h3 class="text-lg text-white font-medium mb-6 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i class="fas fa-chart-line text-secondary"></i>
          身体数据定制
        </div>
        <span v-if="isOther" class="text-xs text-gray-500 flex items-center gap-1">
          <i class="fas fa-gear"></i> 非二元自由配置
        </span>
      </h3>
      
      <!-- Non-binary Config Toggles -->
      <div v-if="isOther" class="mb-8 bg-black/20 p-4 rounded-xl border border-white/5">
        <label class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">生理构造设置</label>
        <div class="flex gap-4">
          <label class="flex items-center gap-2 cursor-pointer group">
            <div :class="[
              'w-5 h-5 rounded border flex items-center justify-center transition-colors',
              data.configFeatures.hasBreasts ? 'bg-secondary border-secondary' : 'border-gray-500 bg-transparent'
            ]">
              <i v-if="data.configFeatures.hasBreasts" class="fas fa-check text-white text-xs"></i>
            </div>
            <input
              type="checkbox"
              class="hidden"
              :checked="data.configFeatures.hasBreasts"
              @change="toggleFeature('hasBreasts')"
            />
            <span :class="[
              'text-sm group-hover:text-white transition-colors',
              data.configFeatures.hasBreasts ? 'text-white' : 'text-gray-400'
            ]">
              女性性征 (乳房/臀部)
            </span>
          </label>

          <label class="flex items-center gap-2 cursor-pointer group">
            <div :class="[
              'w-5 h-5 rounded border flex items-center justify-center transition-colors',
              data.configFeatures.hasPenis ? 'bg-secondary border-secondary' : 'border-gray-500 bg-transparent'
            ]">
              <i v-if="data.configFeatures.hasPenis" class="fas fa-check text-white text-xs"></i>
            </div>
            <input
              type="checkbox"
              class="hidden"
              :checked="data.configFeatures.hasPenis"
              @change="toggleFeature('hasPenis')"
            />
            <span :class="[
              'text-sm group-hover:text-white transition-colors',
              data.configFeatures.hasPenis ? 'text-white' : 'text-gray-400'
            ]">
              男性性征 (阴茎)
            </span>
          </label>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Height Slider -->
        <div>
          <label class="flex justify-between text-sm font-medium text-gray-300 mb-4">
            <span class="flex items-center gap-2">
              <i class="fas fa-ruler"></i> 身高 (Height)
            </span>
            <span class="text-secondary font-bold">{{ data.height }} cm</span>
          </label>
          <div class="relative flex items-center h-6">
            <input
              type="range"
              min="135"
              max="195"
              step="1"
              :value="data.height"
              @input="(e) => updateData({ height: parseInt((e.target as HTMLInputElement).value) })"
              class="absolute w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer focus:outline-none accent-secondary z-20 opacity-0 hover:opacity-100"
            />
            <div class="w-full h-2 bg-slate-700 rounded-full overflow-hidden absolute z-10">
              <div
                class="h-full bg-gradient-to-r from-indigo-500 to-pink-500"
                :style="{ width: `${((data.height - 135) / (195 - 135)) * 100}%` }"
              />
            </div>
          </div>
          <div class="flex justify-between text-xs text-gray-500 mt-2">
            <span>135cm</span>
            <span>165cm</span>
            <span>195cm</span>
          </div>
        </div>

        <!-- Hips Slider -->
        <div v-if="showBreasts">
          <label class="flex justify-between text-sm font-medium text-gray-300 mb-4">
            <span class="flex items-center gap-2">
              <i class="fas fa-circle"></i> 臀围 (Hips)
            </span>
            <span class="text-secondary font-bold">{{ data.hips }} cm</span>
          </label>
          <div class="relative flex items-center h-6">
            <input
              type="range"
              min="75"
              max="120"
              step="1"
              :value="data.hips"
              @input="(e) => updateData({ hips: parseInt((e.target as HTMLInputElement).value) })"
              class="absolute w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer focus:outline-none accent-secondary z-20 opacity-0 hover:opacity-100"
            />
            <div class="w-full h-2 bg-slate-700 rounded-full overflow-hidden absolute z-10">
              <div
                class="h-full bg-gradient-to-r from-pink-500 to-rose-500"
                :style="{ width: `${((data.hips - 75) / (120 - 75)) * 100}%` }"
              />
            </div>
          </div>
          <div class="flex justify-between text-xs text-gray-500 mt-2">
            <span>75cm (骨感)</span>
            <span>95cm (丰满)</span>
            <span>120cm (安产)</span>
          </div>
        </div>

        <!-- Cock Length Slider -->
        <div v-if="showPenis">
          <label class="flex justify-between text-sm font-medium text-gray-300 mb-4">
            <span class="flex items-center gap-2">
              <i class="fas fa-bolt"></i> 阴茎长度 (Length)
            </span>
            <span class="text-secondary font-bold">{{ data.cockLength }} cm</span>
          </label>
          <div class="relative flex items-center h-6">
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              :value="data.cockLength"
              @input="(e) => updateData({ cockLength: parseInt((e.target as HTMLInputElement).value) })"
              class="absolute w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer focus:outline-none accent-secondary z-20 opacity-0 hover:opacity-100"
            />
            <div class="w-full h-2 bg-slate-700 rounded-full overflow-hidden absolute z-10">
              <div
                class="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                :style="{ width: `${((data.cockLength - 5) / (30 - 5)) * 100}%` }"
              />
            </div>
          </div>
          <div class="flex justify-between text-xs text-gray-500 mt-2">
            <span>5cm</span>
            <span>15cm (平均)</span>
            <span>30cm (巨根)</span>
          </div>
        </div>

        <!-- Cup Size Selector -->
        <div v-if="showBreasts" class="col-span-1 md:col-span-2">
          <label class="flex text-sm font-medium text-gray-300 mb-4 items-center gap-2">
            <i class="fas fa-heart"></i> 罩杯 (Cup Size)
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="size in CUP_SIZES"
              :key="size"
              @click="updateData({ cupSize: size })"
              :class="[
                'w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200',
                data.cupSize === size
                  ? 'bg-secondary text-white shadow-lg scale-110 border-transparent'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30 hover:text-white'
              ]"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <!-- Genital Type Selector (All) -->
        <div class="col-span-1 md:col-span-2">
          <label class="flex text-sm font-medium text-gray-300 mb-4 items-center gap-2">
            <i class="fas fa-dna"></i> 性器特征 (Genitals)
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="type in currentGenitalOptions"
              :key="type"
              @click="updateData({ genitalType: type })"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border',
                data.genitalType === type
                  ? 'bg-secondary/20 border-secondary text-white shadow-[0_0_10px_rgba(236,72,153,0.3)]'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
              ]"
            >
              {{ type }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CharacterData, Gender, Archetype } from '../types';
import { ARCHETYPES, CUP_SIZES, GENITAL_TYPES } from '../constants';
import { getIconClass } from '../icon-helper';

const props = defineProps<{
  data: CharacterData;
}>();

const emit = defineEmits<{
  (e: 'update-data', fields: Partial<CharacterData>): void;
}>();

const currentArchetypes = computed(() => ARCHETYPES[props.data.gender] || ARCHETYPES[Gender.OTHER]);
const currentGenitalOptions = computed(() => GENITAL_TYPES[props.data.gender] || GENITAL_TYPES[Gender.OTHER]);

const isMale = computed(() => props.data.gender === Gender.MALE);
const isFemale = computed(() => props.data.gender === Gender.FEMALE);
const isOther = computed(() => props.data.gender === Gender.OTHER);

const showBreasts = computed(() => isFemale.value || (isOther.value && props.data.configFeatures.hasBreasts));
const showPenis = computed(() => isMale.value || (isOther.value && props.data.configFeatures.hasPenis));

const selectedArchetype = computed(() => currentArchetypes.value.find(a => a.id === props.data.archetypeId));

const getStatLabel = (key: string): string => {
  const map: Record<string, string> = {
    _等级: '等级',
    $潜力: '潜力',
    _魅力: '魅力',
    _幸运: '幸运',
    _声望: '声望',
    _最大耐力: '耐力',
    _最大快感: '耐性',
    $基础性斗力: '性斗',
    $基础忍耐力: '忍耐',
    $闪避率: '闪避',
    $暴击率: '暴击',
    _堕落度: '堕落',
    _意志力: '意志',
    _全属性: '全属性'
  };
  return map[key] || key;
};

const updateData = (fields: Partial<CharacterData>) => {
  emit('update-data', fields);
};

const toggleFeature = (feature: 'hasBreasts' | 'hasPenis') => {
  updateData({
    configFeatures: {
      ...props.data.configFeatures,
      [feature]: !props.data.configFeatures[feature]
    }
  });
};
</script>

<style lang="scss" scoped>
</style>

