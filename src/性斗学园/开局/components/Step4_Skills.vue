<template>
  <div class="animate-slide-up space-y-8 pb-4">
    <!-- Active Skills Section -->
    <div class="bg-black/20 border border-white/5 rounded-2xl overflow-hidden">
      <div class="bg-white/5 border-b border-white/5 p-4 flex justify-between items-center backdrop-blur-md">
        <div class="flex items-center gap-2">
          <div class="p-1.5 bg-red-500/20 rounded text-red-400">
            <i class="fas fa-sword"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-white">主动技能</h3>
            <p class="text-xs text-gray-400">选择 {{ MAX_ACTIVE_SKILLS }} 个性斗手段</p>
          </div>
        </div>
        <div class="text-right bg-white/5 px-3 py-1 rounded-full border border-white/5">
          <span
            :class="[
              'font-bold',
              data.initialActiveSkills.length === MAX_ACTIVE_SKILLS ? 'text-secondary' : 'text-white',
            ]"
          >
            {{ data.initialActiveSkills.length }}
          </span>
          <span class="text-gray-500 text-sm">/{{ MAX_ACTIVE_SKILLS }}</span>
        </div>
      </div>

      <div class="p-4 h-[300px] overflow-y-auto custom-scrollbar">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            v-for="skill in ACTIVE_SKILLS"
            :key="skill.id"
            @click="toggleActiveSkill(skill.id)"
            :disabled="
              !data.initialActiveSkills.includes(skill.id) && data.initialActiveSkills.length >= MAX_ACTIVE_SKILLS
            "
            :class="[
              'relative group p-3 rounded-xl border transition-all duration-300 text-left flex items-start gap-3 h-full',
              data.initialActiveSkills.includes(skill.id)
                ? 'bg-secondary/20 border-secondary ring-1 ring-secondary'
                : data.initialActiveSkills.length >= MAX_ACTIVE_SKILLS
                  ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30',
            ]"
          >
            <div
              :class="[
                'p-2.5 rounded-lg transition-colors shrink-0',
                data.initialActiveSkills.includes(skill.id)
                  ? 'bg-secondary text-white'
                  : 'bg-black/30 text-gray-400 group-hover:text-gray-200',
              ]"
            >
              <i :class="['fas', getIconClass(skill.icon)]"></i>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start">
                <h4
                  :class="[
                    'font-bold text-sm truncate pr-2 transition-colors',
                    data.initialActiveSkills.includes(skill.id) ? 'text-white' : 'text-gray-200',
                  ]"
                >
                  {{ skill.name }}
                </h4>
                <i v-if="data.initialActiveSkills.includes(skill.id)" class="fas fa-check text-secondary shrink-0"></i>
              </div>
              <p class="text-xs text-gray-500 mt-1 mb-1 font-medium">
                {{ skill.effectDescription }}
              </p>
              <p class="text-xs text-gray-400 leading-snug line-clamp-2">
                {{ skill.description }}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Constitution Skills Section -->
    <div class="bg-black/20 border border-white/5 rounded-2xl overflow-hidden">
      <div class="bg-white/5 border-b border-white/5 p-4 flex justify-between items-center backdrop-blur-md">
        <div class="flex items-center gap-2">
          <div class="p-1.5 bg-blue-500/20 rounded text-blue-400">
            <i class="fas fa-shield"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-white">特殊体质</h3>
            <p class="text-xs text-gray-400">选择 {{ MAX_PASSIVE_SKILLS }} 个被动特性</p>
          </div>
        </div>
        <div class="text-right bg-white/5 px-3 py-1 rounded-full border border-white/5">
          <span
            :class="[
              'font-bold',
              data.initialPassiveSkills.length === MAX_PASSIVE_SKILLS ? 'text-secondary' : 'text-white',
            ]"
          >
            {{ data.initialPassiveSkills.length }}
          </span>
          <span class="text-gray-500 text-sm">/{{ MAX_PASSIVE_SKILLS }}</span>
        </div>
      </div>

      <div class="p-4 h-[300px] overflow-y-auto custom-scrollbar">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            v-for="skill in currentPassiveSkills"
            :key="skill.id"
            @click="togglePassiveSkill(skill.id)"
            :disabled="
              !data.initialPassiveSkills.includes(skill.id) && data.initialPassiveSkills.length >= MAX_PASSIVE_SKILLS
            "
            :class="[
              'relative group p-3 rounded-xl border transition-all duration-300 text-left flex items-start gap-3 h-full',
              data.initialPassiveSkills.includes(skill.id)
                ? 'bg-secondary/20 border-secondary ring-1 ring-secondary'
                : data.initialPassiveSkills.length >= MAX_PASSIVE_SKILLS
                  ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30',
            ]"
          >
            <div
              :class="[
                'p-2.5 rounded-lg transition-colors shrink-0',
                data.initialPassiveSkills.includes(skill.id)
                  ? 'bg-secondary text-white'
                  : 'bg-black/30 text-gray-400 group-hover:text-gray-200',
              ]"
            >
              <i :class="['fas', getIconClass(skill.icon)]"></i>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start">
                <h4
                  :class="[
                    'font-bold text-sm truncate pr-2 transition-colors',
                    data.initialPassiveSkills.includes(skill.id) ? 'text-white' : 'text-gray-200',
                  ]"
                >
                  {{ skill.name }}
                </h4>
                <i v-if="data.initialPassiveSkills.includes(skill.id)" class="fas fa-check text-secondary shrink-0"></i>
              </div>
              <p class="text-xs text-gray-500 mt-1 mb-1 font-medium">
                {{ skill.effectDescription }}
              </p>
              <p class="text-xs text-gray-400 leading-snug line-clamp-2">
                {{ skill.description }}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CharacterData, Gender } from '../types';
import { ACTIVE_SKILLS, PASSIVE_SKILLS } from '../constants';
import { getIconClass } from '../icon-helper';

const props = defineProps<{
  data: CharacterData;
}>();

const emit = defineEmits<{
  (e: 'update-data', fields: Partial<CharacterData>): void;
}>();

const MAX_ACTIVE_SKILLS = 3;
const MAX_PASSIVE_SKILLS = 2;

const currentPassiveSkills = computed(() => PASSIVE_SKILLS[props.data.gender] || PASSIVE_SKILLS[Gender.OTHER]);

const toggleActiveSkill = (skillId: string) => {
  const current = [...props.data.initialActiveSkills];
  const index = current.indexOf(skillId);
  if (index >= 0) {
    current.splice(index, 1);
  } else if (current.length < MAX_ACTIVE_SKILLS) {
    current.push(skillId);
  }
  emit('update-data', { initialActiveSkills: current });
};

const togglePassiveSkill = (skillId: string) => {
  const current = [...props.data.initialPassiveSkills];
  const index = current.indexOf(skillId);
  if (index >= 0) {
    current.splice(index, 1);
  } else if (current.length < MAX_PASSIVE_SKILLS) {
    current.push(skillId);
  }
  emit('update-data', { initialPassiveSkills: current });
};
</script>

<style lang="scss" scoped></style>
