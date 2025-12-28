<template>
  <div class="relative font-sans text-gray-100 flex items-center justify-center p-4 py-8 md:py-12 w-full">
    <FloatingShapes />

    <!-- Main Container -->
    <div
      class="relative z-10 w-full max-w-4xl bg-glass border border-glassBorder backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto min-h-[600px]"
    >
      <!-- Sidebar / Header -->
      <div
        class="w-full md:w-64 bg-black/20 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 shrink-0"
      >
        <div>
          <div class="flex items-center gap-3 mb-8">
            <div
              class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-indigo-500/20"
            >
              <i class="fas fa-terminal text-white"></i>
            </div>
            <h1
              class="font-bold text-xl tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
            >
              性斗学园
            </h1>
          </div>

          <nav class="space-y-2">
            <button
              v-for="item in navItems"
              :key="item.id"
              @click="handleNavClick(item.id)"
              :class="[
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium',
                step === item.id
                  ? 'bg-white/10 text-white shadow-inner border border-white/5'
                  : step > item.id
                    ? 'text-green-400'
                    : 'text-gray-500 cursor-not-allowed',
              ]"
            >
              <i :class="['fas', item.icon, step === item.id ? 'text-secondary' : '']"></i>
              {{ item.label }}
              <div v-if="step > item.id" class="ml-auto w-1.5 h-1.5 rounded-full bg-green-400"></div>
            </button>
          </nav>
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 flex flex-col relative">
        <!-- Progress Bar Line -->
        <div class="h-1 w-full bg-white/5">
          <div
            class="h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-500 ease-out"
            :style="{ width: `${progress}%` }"
          />
        </div>

        <div class="flex-1 p-6 md:p-10">
          <!-- Step Content -->
          <div class="max-w-2xl mx-auto min-h-[400px]">
            <div class="mb-6">
              <h2 class="text-3xl font-bold text-white mb-2">
                {{ stepTitles[step - 1] }}
              </h2>
              <p class="text-gray-400">
                {{ stepDescriptions[step - 1] }}
              </p>
            </div>

            <Step1_Identity v-if="step === 1" :data="characterData" @update-data="updateCharacterData" />
            <Step2_Archetype v-if="step === 2" :data="characterData" @update-data="updateCharacterData" />
            <Step3_Attributes v-if="step === 3" :data="characterData" @update-data="updateCharacterData" />
            <Step4_Skills v-if="step === 4" :data="characterData" @update-data="updateCharacterData" />
          </div>
        </div>

        <!-- Footer Navigation -->
        <div class="p-6 border-t border-white/5 bg-black/10 backdrop-blur-md flex justify-between items-center z-20">
          <button
            @click="prevStep"
            :disabled="step === 1"
            :class="[
              'flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all',
              step === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:text-white hover:bg-white/5',
            ]"
          >
            <i class="fas fa-chevron-left"></i> 上一步
          </button>

          <button
            v-if="step < MAX_STEPS"
            @click="nextStep"
            :disabled="step === 1 && !characterData.name"
            class="group relative flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-black font-bold shadow-lg shadow-white/10 hover:shadow-white/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            下一步 <i class="fas fa-chevron-right group-hover:translate-x-1 transition-transform"></i>
          </button>
          <button
            v-else
            @click="handleStartGame"
            :disabled="characterData.initialActiveSkills.length === 0"
            class="group relative flex items-center gap-2 px-10 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
          >
            <span v-if="loading" class="flex items-center gap-2">
              <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              加载世界...
            </span>
            <span v-else> <i class="fas fa-sparkles"></i> 开始学园生活 </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Generic Modal for Placeholder Interactions -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>
      <div
        class="relative bg-[#1e293b] w-full max-w-md p-8 rounded-2xl border border-white/10 shadow-2xl animate-fade-in transform transition-all scale-100"
      >
        <h3 class="text-xl font-bold text-white mb-4">{{ modalTitle }}</h3>
        <div class="h-32 bg-black/20 rounded-xl flex items-center justify-center border border-white/5 border-dashed">
          <p class="text-gray-500 text-sm">此功能模块已就绪，等待内容注入。</p>
        </div>
        <div class="mt-6 flex justify-end">
          <button
            @click="closeModal"
            class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { CharacterData, INITIAL_CHARACTER_DATA } from './types';
import FloatingShapes from './components/FloatingShapes.vue';
import Step1_Identity from './components/Step1_Identity.vue';
import Step2_Archetype from './components/Step2_Archetype.vue';
import Step3_Attributes from './components/Step3_Attributes.vue';
import Step4_Skills from './components/Step4_Skills.vue';

const step = ref(1);
const loading = ref(false);
const characterData = ref<CharacterData>({ ...INITIAL_CHARACTER_DATA });
const showModal = ref(false);
const modalTitle = ref('');

const MAX_STEPS = 4;

const navItems = [
  { id: 1, label: '身份档案', icon: 'fa-user' },
  { id: 2, label: '角色类型', icon: 'fa-sparkles' },
  { id: 3, label: '天赋分配', icon: 'fa-dice-five' },
  { id: 4, label: '初始技能', icon: 'fa-sword' },
];

const stepTitles = ['创建你的学籍档案', '选择你的校园定位', '激活你的天赋潜能', '选择初始技能'];

const stepDescriptions = [
  '请输入基础信息以办理入学手续。',
  '不同的身份将决定你在学园中的社交圈层与初始加成。',
  '根据游戏难度，你需要合理分配有限的天赋点数。',
  '选择适合你战术风格的初始技能。',
];

const progress = computed(() => (step.value / MAX_STEPS) * 100);

const updateCharacterData = (fields: Partial<CharacterData>) => {
  characterData.value = { ...characterData.value, ...fields };
};

const nextStep = () => {
  if (step.value < MAX_STEPS) step.value++;
};

const prevStep = () => {
  if (step.value > 1) step.value--;
};

const handleNavClick = (id: number) => {
  if (id < step.value) step.value = id;
};

const handleStartGame = () => {
  loading.value = true;
  // Simulate LLM initialization
  setTimeout(() => {
    loading.value = false;
    openModal('系统连接中...');
  }, 2000);
};

const openModal = (title: string) => {
  modalTitle.value = title;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};
</script>

<style lang="scss" scoped>
.bg-glass {
  background: rgba(255, 255, 255, 0.1);
}

.border-glassBorder {
  border-color: rgba(255, 255, 255, 0.2);
}

.primary {
  color: #6366f1;
}

.secondary {
  color: #ec4899;
}

.accent {
  color: #8b5cf6;
}
</style>
