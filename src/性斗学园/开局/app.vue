<template>
  <div class="relative font-sans text-gray-100 flex items-center justify-center p-4 py-8 md:py-12 w-full">
    <FloatingShapes />

    <!-- Main Container -->
    <div class="relative z-10 w-full max-w-4xl bg-glass border border-glassBorder backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto min-h-[600px]">
      
      <!-- Sidebar / Header -->
      <div class="w-full md:w-64 bg-black/20 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 shrink-0">
        <div>
          <div class="flex items-center gap-3 mb-8">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <i class="fas fa-terminal text-white"></i>
            </div>
            <h1 class="font-bold text-xl tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
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
                    : 'text-gray-500 cursor-not-allowed'
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
            <Step3_Attributes v-if="step === 3" :data="characterData" :cheat-mode="isCheatActive" @update-data="updateCharacterData" />
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
              step === 1
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
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
            <span v-else>
              <i class="fas fa-sparkles"></i> 开始学园生活
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Generic Modal for Placeholder Interactions -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative bg-[#1e293b] w-full max-w-md p-8 rounded-2xl border border-white/10 shadow-2xl animate-fade-in transform transition-all scale-100">
        <h3 class="text-xl font-bold text-white mb-4">{{ modalTitle }}</h3>
        <div class="h-32 bg-black/20 rounded-xl flex items-center justify-center border border-white/5 border-dashed">
          <p class="text-gray-500 text-sm">{{ modalContent || '此功能模块已就绪，等待内容注入。' }}</p>
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

    <!-- Cheat Code Button -->
    <div class="fixed bottom-4 left-4 z-50">
      <button
        @click="showCheatInput = !showCheatInput"
        class="w-6 h-6 rounded-full bg-black/30 hover:bg-black/50 text-gray-500 hover:text-gray-300 text-xs transition-all flex items-center justify-center"
        title="?"
      >
        ?
      </button>
      <div v-if="showCheatInput" class="absolute bottom-8 left-0 bg-black/90 rounded-lg p-2 border border-white/10">
        <input
          v-model="cheatCode"
          @keydown.enter="applyCheatCode"
          type="password"
          placeholder="输入代码"
          class="w-24 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-secondary"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { CharacterData, INITIAL_CHARACTER_DATA, INITIAL_ATTRIBUTES, Gender } from './types';
import FloatingShapes from './components/FloatingShapes.vue';
import Step1_Identity from './components/Step1_Identity.vue';
import Step2_Archetype from './components/Step2_Archetype.vue';
import Step3_Attributes from './components/Step3_Attributes.vue';
import Step4_Skills from './components/Step4_Skills.vue';
import { getMvuData, syncFromMvu, updateMvuVariables } from './utils/mvu-helper';
import { STARTER_SKILLS } from './data/skills';
import { getConstitutionById } from './data/constitutions';
import { ARCHETYPES } from './constants';

const step = ref(1);
const loading = ref(false);
const characterData = ref<CharacterData>({ ...INITIAL_CHARACTER_DATA });
const showModal = ref(false);
const modalTitle = ref('');
const modalContent = ref('');

// 作弊码相关
const showCheatInput = ref(false);
const cheatCode = ref('');
const isCheatActive = ref(false);

// 从 MVU 变量同步初始数据
onMounted(async () => {
  try {
    const mvuData = await getMvuData();
    if (mvuData) {
      const syncedAttributes = syncFromMvu(mvuData);
      if (syncedAttributes) {
        characterData.value.attributes = syncedAttributes;
      }
    }
  } catch (error) {
    console.warn('无法从 MVU 同步数据，使用默认值:', error);
  }
});

// 作弊码验证
const applyCheatCode = () => {
  const code = cheatCode.value.trim();

  if (code === '0210') {
    // 天赋作弊码
    isCheatActive.value = true;
    showCheatInput.value = false;
    cheatCode.value = '';
    openModal('作弊模式已激活', '天赋点数已设为 999');
  } else if (code === '1011') {
    // 提示用户 1011 是隐藏角色码，应该在角色类型界面的锁图标中输入
    openModal(
      '提示',
      '1011 是用于解锁隐藏校园身份的代码，请前往第二步「角色类型」界面右上角的小锁按钮中输入。此处仅用于输入天赋作弊码 0210。'
    );
    cheatCode.value = '';
  } else {
    openModal('错误', '无效的代码');
    cheatCode.value = '';
  }
};

const MAX_STEPS = 4;

const navItems = [
  { id: 1, label: '身份档案', icon: 'fa-user' },
  { id: 2, label: '角色类型', icon: 'fa-wand-magic-sparkles' },
  { id: 3, label: '天赋分配', icon: 'fa-dice-d20' },
  { id: 4, label: '初始技能', icon: 'fa-hand-fist' },
];

const stepTitles = [
  '创建你的学籍档案',
  '选择你的校园定位',
  '激活你的天赋潜能',
  '选择初始技能'
];

const stepDescriptions = [
  '请输入基础信息以办理入学手续。',
  '不同的身份将决定你在学园中的社交圈层与初始加成。',
  '根据游戏难度，你需要合理分配有限的天赋点数。',
  '选择适合你战术风格的初始技能。'
];

const progress = computed(() => (step.value / MAX_STEPS) * 100);

const updateCharacterData = (fields: Partial<CharacterData>) => {
  characterData.value = { ...characterData.value, ...fields };
};

const nextStep = () => {
  if (step.value < MAX_STEPS) {
    // 如果离开步骤3（天赋分配），重置属性到初始值
    if (step.value === 3) {
      resetAttributes();
    }
    step.value++;
  }
};

const prevStep = () => {
  if (step.value > 1) {
    // 如果离开步骤3（天赋分配），重置属性到初始值
    if (step.value === 3) {
      resetAttributes();
    }
    step.value--;
  }
};

const handleNavClick = (id: number) => {
  if (id < step.value) {
    // 如果离开步骤3（天赋分配），重置属性到初始值
    if (step.value === 3) {
      resetAttributes();
    }
    step.value = id;
  }
};

// 重置属性到初始值
const resetAttributes = () => {
  characterData.value.attributes = {
    角色基础: {
      _等级: INITIAL_ATTRIBUTES.角色基础._等级,
      $潜力: INITIAL_ATTRIBUTES.角色基础.$潜力,
      _魅力: INITIAL_ATTRIBUTES.角色基础._魅力,
      _幸运: INITIAL_ATTRIBUTES.角色基础._幸运,
    },
    核心状态: {
      _最大耐力: INITIAL_ATTRIBUTES.核心状态._最大耐力,
      _最大快感: INITIAL_ATTRIBUTES.核心状态._最大快感,
      $基础性斗力: INITIAL_ATTRIBUTES.核心状态.$基础性斗力,
      $基础忍耐力: INITIAL_ATTRIBUTES.核心状态.$基础忍耐力,
      $闪避率: INITIAL_ATTRIBUTES.核心状态.$闪避率,
      $暴击率: INITIAL_ATTRIBUTES.核心状态.$暴击率,
    },
  };
};

const handleStartGame = async () => {
  loading.value = true;
  
  try {
    // 保存选中的主动技能到 MVU 变量
    // 变量类型是 z.record(z.string(), z.object({ $描述: z.string() }))
    // 所以需要构建为对象，键为技能名称，值为 { $描述: string }
    const activeSkillsRecord: Record<string, { $描述: string }> = {};
    for (const skillId of characterData.value.initialActiveSkills) {
      const skill = STARTER_SKILLS.find(s => s.id === skillId);
      if (skill) {
        activeSkillsRecord[skill.name] = { $描述: skill.description };
      }
    }

    // 获取当前角色类型的永久状态
    const currentArchetypes = ARCHETYPES[characterData.value.gender] || ARCHETYPES[Gender.OTHER];
    const selectedArchetype = currentArchetypes.find(a => a.id === characterData.value.archetypeId);
    
    // 构建永久状态列表和加成统计
    const permanentStateList: string[] = [];
    const permanentBonusStats: Record<string, number> = {
      $魅力加成: 0,
      $幸运加成: 0,
      $基础性斗力加成: 0,
      $基础性斗力成算: 0,
      $基础忍耐力加成: 0,
      $基础忍耐力成算: 0,
      $闪避率加成: 0,
      $暴击率加成: 0,
      $意志力加成: 0,
    };
    
    // 添加角色类型的永久状态
    if (selectedArchetype?.permanentState) {
      permanentStateList.push(selectedArchetype.passiveSkill.name);
      for (const [key, value] of Object.entries(selectedArchetype.permanentState.bonus)) {
        if (permanentBonusStats[key] !== undefined) {
          permanentBonusStats[key] += value as number;
        }
      }
    }
    
    // 添加选中的体质到永久状态
    for (const constitutionId of characterData.value.initialPassiveSkills) {
      const constitution = getConstitutionById(constitutionId);
      if (constitution) {
        permanentStateList.push(constitution.name);
        for (const mod of constitution.permanentModifiers) {
          if (permanentBonusStats[mod.stat] !== undefined) {
            permanentBonusStats[mod.stat] += mod.value;
          }
        }
      }
    }

    await updateMvuVariables({
      '技能系统.$主动技能': activeSkillsRecord,
      '技能系统.$被动体质': characterData.value.initialPassiveSkills,
      '_永久状态.$状态列表': permanentStateList,
      '_永久状态.$加成统计': permanentBonusStats,
    });

    console.info('[开局] 数据已保存到 MVU');
    console.info('[开局] 永久状态:', permanentStateList);
    console.info('[开局] 永久加成:', permanentBonusStats);
    
    // 发送角色基础数据到酒馆
    sendCharacterDataToTavern();
    
    // 完成创建
    setTimeout(() => {
      loading.value = false;
      openModal('角色创建完成！', '你的学园生活即将开始...');
    }, 1500);
  } catch (error) {
    console.error('[开局] 保存失败:', error);
    loading.value = false;
    openModal('保存失败', '请重试');
  }
};

// 发送角色基础数据到酒馆
const sendCharacterDataToTavern = async () => {
  const currentArchetypes = ARCHETYPES[characterData.value.gender] || ARCHETYPES[Gender.OTHER];
  const selectedArchetype = currentArchetypes.find(a => a.id === characterData.value.archetypeId);
  
  // 根据身体配置决定实际性别输出
  const isFemale = characterData.value.gender === Gender.FEMALE;
  const isMale = characterData.value.gender === Gender.MALE;
  const config = characterData.value.configFeatures || { hasBreasts: isFemale, hasPenis: isMale };
  const hasBreasts = config.hasBreasts;
  const hasPenis = config.hasPenis;
  
  // 根据选择的性器特征决定性别输出
  let genderText: string;
  if (hasBreasts && hasPenis) {
    genderText = '扶她';
  } else if (hasPenis) {
    genderText = '男';
  } else if (hasBreasts) {
    genderText = '女';
  } else {
    genderText = '无性';
  }
  
  // 构建角色描述文本
  const infoParts: string[] = [
    `【学员档案】`,
    `姓名：${characterData.value.name}`,
    `性别：${genderText}`,
    `难度：${characterData.value.difficulty}`,
    `身高：${characterData.value.height}cm`,
  ];
  
  // 只有有胸部时才显示罩杯和臀围（女性特征）
  if (hasBreasts) {
    if (characterData.value.cupSize) {
      infoParts.push(`罩杯：${characterData.value.cupSize}`);
    }
    if (characterData.value.hips) {
      infoParts.push(`臀围：${characterData.value.hips}cm`);
    }
    // 女性性器特征
    if (characterData.value.femaleGenitalType) {
      infoParts.push(`女性性器特征：${characterData.value.femaleGenitalType}`);
    }
  }
  
  // 只有有阴茎时才显示阴茎长度和男性性器特征
  if (hasPenis) {
    if (characterData.value.cockLength) {
      infoParts.push(`阴茎长度：${characterData.value.cockLength}cm`);
    }
    // 男性性器特征
    if (characterData.value.maleGenitalType) {
      infoParts.push(`男性性器特征：${characterData.value.maleGenitalType}`);
    }
  }
  
  // 如果两个性征都不选，则为无性
  if (!hasBreasts && !hasPenis) {
    infoParts.push(`性器特征：无性`);
  }
  
  // 外貌与性格 / 背景描述（所有性别通用）
  if (characterData.value.appearance?.trim()) {
    infoParts.push('', `【外貌】`, characterData.value.appearance.trim());
  }
  if (characterData.value.personality?.trim()) {
    infoParts.push('', `【性格与背景】`, characterData.value.personality.trim());
  }
  if (characterData.value.background?.trim()) {
    infoParts.push('', `【补充背景】`, characterData.value.background.trim());
  }

  infoParts.push('', `【校园身份】`);
  infoParts.push(`类型：${selectedArchetype?.name || '未知'}`);
  infoParts.push(`专属被动：${selectedArchetype?.passiveSkill.name || '无'}`);
  infoParts.push(`特性描述：${selectedArchetype?.description || ''}`);
  
  const characterDescription = infoParts.join('\n');
  
  // 尝试发送到酒馆并写入世界书
  try {
    // @ts-ignore - createChatMessages 为全局注入
    if (typeof createChatMessages === 'function') {
      // 1. 发送角色信息到聊天
      // @ts-ignore
      await createChatMessages([
        {
          role: 'user',
          message: characterDescription,
          name: characterData.value.name,
        }
      ]);
      
      // 2. 将角色信息写入世界书「性斗学园」的user条目（uid=0）
      // 直接访问世界书数据并更新，避免通过消息发送
      try {
        const globalAny = window as any;
        let worldbookUpdated = false;
        
        // 方法1: 尝试直接访问世界书数据
        // 查找 world_info 相关的全局对象
        const worldInfoSources = [
          globalAny.world_info,
          globalAny.SillyTavern?.world_info,
          globalAny.parent?.world_info,
          globalAny.parent?.SillyTavern?.world_info,
        ];
        
        for (const worldInfo of worldInfoSources) {
          if (!worldInfo) continue;
          
          try {
            // 尝试获取世界书列表
            const books = worldInfo.books || worldInfo.getBooks?.() || worldInfo.getAllBooks?.();
            if (!books) continue;
            
            // 查找「性斗学园」世界书
            const book = Array.isArray(books) 
              ? books.find((b: any) => b.name === '性斗学园' || b.title === '性斗学园')
              : books['性斗学园'];
            
            if (!book) continue;
            
            // 获取条目列表
            const entries = book.entries || book.getEntries?.() || book.getAllEntries?.();
            if (!entries) continue;
            
            // 查找uid为0的条目
            const entry = Array.isArray(entries)
              ? entries.find((e: any) => String(e.uid) === '0' || e.uid === 0)
              : entries['0'] || entries[0];
            
            if (entry) {
              entry.content = characterDescription;
              
              // 触发保存
              if (book.save) await book.save();
              else if (book.updateEntry) await book.updateEntry(entry);
              else if (worldInfo.save) await worldInfo.save();
              else if (worldInfo.saveBook) await worldInfo.saveBook(book);
              
              worldbookUpdated = true;
              console.info('[开局] 世界书已直接更新');
              break;
            }
          } catch (e) {
            // 继续尝试下一个源
            continue;
          }
        }
        
        // 方法2: 如果无法直接访问，尝试通过slash命令执行器
        if (!worldbookUpdated) {
          // 这里不再把换行符替换为 \n，而是直接使用原始文本，
          // 这样世界书中会保留真实的换行格式（与你手动输入的效果一致）
          const escapedContent = characterDescription;
          
          const command = `/setentryfield file=性斗学园 uid=0 field=content ${escapedContent}`;
          
          // 尝试通过triggerSlash执行命令（如果可用）
          try {
            // @ts-ignore - triggerSlash 为全局注入
            if (typeof triggerSlash === 'function') {
              // @ts-ignore
              await triggerSlash(command);
              worldbookUpdated = true;
              console.info('[开局] 已通过triggerSlash更新世界书');
            }
          } catch (e) {
            console.warn('[开局] triggerSlash执行失败:', e);
          }
          
          // 如果triggerSlash不可用，尝试其他执行方式
          if (!worldbookUpdated) {
            const executors = [
              () => globalAny.SillyTavern?.executeSlashCommand?.(command),
              () => globalAny.executeSlashCommand?.(command),
              () => globalAny.SillyTavern?.processSlashCommand?.(command),
              () => globalAny.parent?.SillyTavern?.executeSlashCommand?.(command),
              () => globalAny.parent?.executeSlashCommand?.(command),
              // 尝试通过消息输入框模拟输入
              () => {
                const inputElement = document.querySelector('#send_textarea, textarea[placeholder*="Message"], .chat-input textarea') as HTMLTextAreaElement;
                if (inputElement) {
                  inputElement.value = command;
                  inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                  const form = inputElement.closest('form');
                  if (form) {
                    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                  }
                  return true;
                }
                return false;
              },
            ];
            
            for (const executor of executors) {
              try {
                const result = await executor();
                if (result !== undefined && result !== false) {
                  worldbookUpdated = true;
                  console.info('[开局] 已通过slash命令执行器更新世界书');
                  break;
                }
              } catch (e) {
                continue;
              }
            }
          }
        }
        
        if (!worldbookUpdated) {
          console.warn('[开局] 无法自动更新世界书，请手动执行以下命令:');
          console.warn(`/setentryfield file=性斗学园 uid=0 field=content ${characterDescription}`);
        }
      } catch (worldbookError) {
        console.warn('[开局] 更新世界书失败:', worldbookError);
        // 继续执行，不阻止主流程
      }
      
      // @ts-ignore - triggerSlash 为全局注入
      if (typeof triggerSlash === 'function') {
        // @ts-ignore
        await triggerSlash('/trigger');
      }
      
      // @ts-ignore - toastr 为全局注入
      toastr.success('角色信息已发送并写入世界书，学园生活即将开始...', '命运的序章');
      console.info('[开局] 角色数据已发送到酒馆并写入世界书');
    }
  } catch (error) {
    console.warn('[开局] 无法发送到酒馆或写入世界书:', error);
    // @ts-ignore
    toastr.warning('角色信息发送失败，请手动输入或检查世界书配置', '提示');
  }
};

const openModal = (title: string, content?: string) => {
  modalTitle.value = title;
  modalContent.value = content || '';
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
