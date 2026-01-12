<template>
  <div class="combat-wrapper">
    <!-- 背景效果 -->
    <BackgroundAmbience />

    <!-- 顶部标题栏 -->
    <header class="combat-header">
      <div class="header-left">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="terminal-icon"
        >
          <path d="m4 17 6-6-6-6" />
          <path d="M12 19h8" />
        </svg>
        <div>
          <h1 class="title">性斗学园</h1>
        </div>
      </div>
      <div class="header-right">
        <div class="turn-counter">TURN {{ turnState.currentTurn }}</div>
        <div class="phase-indicator">{{ getPhaseText(turnState.phase) }}</div>
      </div>
    </header>

    <!-- 主战斗区域 -->
    <main class="combat-arena">
      <!-- 玩家角色 -->
      <CharacterPanel
        :character="player"
        :is-enemy="false"
        :turn-state="turnState"
        :enemy-intention="turnState.enemyIntention"
      />

      <!-- VS 分隔线 -->
      <div class="vs-divider">
        <div class="divider-line"></div>
        <span class="vs-text">VS</span>
        <div class="divider-line"></div>
      </div>

      <!-- 敌人角色 -->
      <CharacterPanel
        :character="enemy"
        :is-enemy="true"
        :turn-state="turnState"
        :enemy-intention="turnState.enemyIntention"
      />
    </main>

    <!-- BOSS文字特效 -->
    <div
      v-if="bossOverlayText"
      :key="bossDialogueKey"
      class="boss-text-overlay active"
      @click="handleBossTextClick"
    >
      {{ bossOverlayText }}
    </div>

    <!-- BOSS阶段转换特效 -->
    <div v-if="phaseTransitionEffect" class="phase-transition-effect" :class="phaseTransitionEffect">
      <div class="transition-flash"></div>
      <div class="transition-particles">
        <div v-for="i in 50" :key="i" class="particle" :style="{ '--delay': i * 0.02 + 's', '--x': Math.random() * 100 + '%', '--y': Math.random() * 100 + '%' }"></div>
      </div>
      <div class="transition-shockwave"></div>
    </div>

    <!-- 粒子封印画布 -->
    <canvas ref="sealCanvas" class="seal-canvas"></canvas>

    <!-- 底部操作区域 -->
    <footer class="combat-footer">
      <div class="footer-content">
        <!-- 战斗日志 -->
        <div class="log-section">
          <CombatLog :logs="logs" />
        </div>

        <!-- 操作菜单 -->
        <div class="action-section">
          <!-- 菜单标题 -->
          <div v-if="turnState.phase === 'playerInput'" class="action-header">
            <button class="tab-btn" :class="{ active: activeMenu === 'main' }" @click="activeMenu = 'main'">
              行动
            </button>
            <div class="tab-divider"></div>
            <span class="action-hint">请选择你的行动</span>
          </div>
          <div v-else class="action-header">
            <span class="waiting-text">
              {{ turnState.phase === 'climaxResolution' ? '等待抉择...' : '等待行动结算...' }}
            </span>
          </div>

          <!-- 操作按钮区 -->
          <div class="action-grid">
            <!-- 处理中遮罩 -->
            <div
              v-if="turnState.phase !== 'playerInput' && turnState.phase !== 'climaxResolution'"
              class="processing-overlay"
            >
              <span>计算中...</span>
            </div>

            <Transition name="slide" mode="out-in">
              <!-- 主菜单 -->
              <div v-if="activeMenu === 'main'" key="main" class="menu-main">
                <Card hover class="menu-card" @click="activeMenu = 'skills'">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class="icon-blue"
                  >
                    <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
                    <path d="M13 19l6-6" />
                    <path d="m16 16 4 4" />
                    <path d="m19 21 2-2" />
                  </svg>
                  <span>战斗技能</span>
                </Card>
                <Card 
                  :hover="!isBossItemsDisabled"
                  class="menu-card"
                  :class="{ disabled: isBossItemsDisabled }"
                  @click="!isBossItemsDisabled && (activeMenu = 'items')"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class="icon-green"
                  >
                    <path d="M4 20V10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
                    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                  </svg>
                  <span>{{ isBossItemsDisabled ? '已封印' : '物品背包' }}</span>
                </Card>
                <Card hover class="menu-card" @click="handleSkipTurn">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class="icon-yellow"
                  >
                    <polygon points="5 4 15 12 5 20 5 4" />
                    <line x1="19" y1="5" x2="19" y2="19" />
                  </svg>
                  <span>跳过回合</span>
                </Card>
                <div class="surrender-stack">
                  <button class="tab-btn portrait-upload-btn" @click="openPlayerPortraitPicker">更换立绘</button>
                  <Card
                    :hover="!allowSurrender && !isBossSurrenderDisabled"
                    class="menu-card"
                    :class="{ disabled: allowSurrender || isBossSurrenderDisabled }"
                    @click="handleSurrender"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      class="icon-red"
                    >
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                      <line x1="4" y1="22" x2="4" y2="15" />
                    </svg>
                    <span>{{ isBossSurrenderDisabled ? '已封印' : (allowSurrender ? '不可投降' : '投降') }}</span>
                  </Card>
                  <input
                    ref="playerPortraitInput"
                    class="hidden-file-input"
                    type="file"
                    accept="image/*"
                    @change="handlePlayerPortraitSelected"
                  />
                </div>
              </div>

              <!-- 技能菜单 -->
              <div v-else-if="activeMenu === 'skills'" key="skills" class="menu-skills">
                <Card
                  v-for="skill in player.skills"
                  :key="skill.id"
                  :hover="!isSkillDisabled(skill)"
                  class="skill-card"
                  :class="{ disabled: isSkillDisabled(skill) }"
                  @click="handlePlayerSkill(skill)"
                >
                  <div v-if="skill.currentCooldown > 0" class="cooldown-overlay">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span class="cooldown-count">{{ skill.currentCooldown }}<small>T</small></span>
                  </div>
                  <div class="skill-header">
                    <span class="skill-name" :class="{ 'skill-disabled': isSkillDisabled(skill) }">{{
                      skill.name
                    }}</span>
                    <span class="skill-cost" :class="{ 'cost-danger': player.stats.currentEndurance < skill.cost }"
                      >{{ skill.cost }} SP</span
                    >
                  </div>
                  <p class="skill-desc">{{ skill.description }}</p>
                  <div v-if="skill.data?.effectDescription" class="skill-effect">
                    <span class="effect-label">效果：</span>
                    <span class="effect-value">{{ skill.data.effectDescription }}</span>
                  </div>
                  <div class="skill-type" :class="{ 'type-disabled': isSkillDisabled(skill) }">{{ skill.type }}</div>
                </Card>
                <button class="back-btn" @click="activeMenu = 'main'">返回</button>
              </div>

              <!-- 物品菜单 -->
              <div v-else-if="activeMenu === 'items'" key="items" class="menu-items">
                <template v-if="player.items.filter(i => i.quantity > 0).length > 0">
                  <Card
                    v-for="item in player.items.filter(i => i.quantity > 0)"
                    :key="item.id"
                    :hover="true"
                    class="item-card"
                    @click="handlePlayerItem(item)"
                  >
                    <div class="item-header">
                      <span class="item-name">{{ item.name }}</span>
                      <span class="item-quantity">x{{ item.quantity }}</span>
                    </div>
                    <p class="item-desc">{{ item.description }}</p>
                    <div v-if="item.staminaRestore || item.pleasureReduce" class="item-effect">
                      <span v-if="item.staminaRestore" class="effect-stamina">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                        +{{ item.staminaRestore }} 耐力
                      </span>
                      <span v-if="item.pleasureReduce" class="effect-pleasure">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path
                            d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
                          />
                        </svg>
                        -{{ item.pleasureReduce }} 快感
                      </span>
                    </div>
                  </Card>
                </template>
                <div v-else class="empty-items">
                  <p class="empty-text">背包中没有可用的战斗用品</p>
                </div>
                <button class="back-btn" @click="activeMenu = 'main'">返回</button>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- 胜负结算遮罩 -->
      <Teleport to="body">
        <div v-if="turnState.phase === 'victory' || turnState.phase === 'defeat'" class="result-overlay">
          <div class="result-content">
            <h2 class="result-title" :class="turnState.phase">
              {{ turnState.phase === 'victory' ? '完全胜利' : '彻底败北' }}
            </h2>
            <p class="result-subtitle">战斗结束</p>
            
            <!-- CG图片显示 -->
            <div v-if="cgImageUrl" class="cg-container">
              <img :src="cgImageUrl" :alt="cgDescription" class="cg-image" @error="handleCGImageError" />
            </div>
            
            <button class="btn btn-process" @click="handleSendCombatLogToLLM">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              发送日志输出过程
            </button>
          </div>
        </div>
      </Teleport>
    </footer>

    <!-- 战斗特效 -->
    <CombatEffect v-if="effectType" :type="effectType!" :show="showEffect" />
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { onMounted, reactive, ref, watch } from 'vue';
import BackgroundAmbience from './components/BackgroundAmbience.vue';
import Card from './components/Card.vue';
import CharacterPanel from './components/CharacterPanel.vue';
import CombatEffect from './components/CombatEffect.vue';
import CombatLog from './components/CombatLog.vue';
import { createDefaultEnemy, createDefaultPlayer, getEnemyPortraitUrl, savePlayerCustomAvatar } from './constants';
import { selectCGEvent } from './data/cgConfig';
import { resolveEnemyName } from './enemyDatabase';
import type { Character, CombatLogEntry, Item, Skill, TurnState } from './types';
// BOSS系统
import * as BossSystem from './bossSystem';

// 延迟加载数据库模块的辅助函数
let enemyDbModule: any = null;
let skillDbModule: any = null;
let enemySkillDbModule: any = null;

async function loadDatabaseModules() {
  if (!enemyDbModule) {
    enemyDbModule = await import('./enemyDatabase');
  }
  if (!skillDbModule) {
    skillDbModule = await import('./skillDatabase');
  }
  if (!enemySkillDbModule) {
    enemySkillDbModule = await import('./enemySkillDatabase');
  }
  return { enemyDbModule, skillDbModule, enemySkillDbModule };
}

// ================= 状态 =================
const player = ref<Character>(createDefaultPlayer());
const enemy = ref<Character>(createDefaultEnemy());
const turnState = reactive<TurnState>({
  currentTurn: 1,
  phase: 'playerInput',
  enemyIntention: null,
  climaxTarget: null,
});
const logs = ref<CombatLogEntry[]>([]);
const activeMenu = ref<'main' | 'skills' | 'items'>('main');
const allowSurrender = ref<boolean>(true); // 允许认输：true时不可认输，false时允许认输
const playerBoundTurns = ref<number>(0); // 玩家被束缚的回合数
const enemyBoundTurns = ref<number>(0); // 敌人被束缚的回合数
const playerBindSource = ref<'player' | 'enemy' | null>(null); // 玩家束缚的施加者
const enemyBindSource = ref<'player' | 'enemy' | null>(null); // 敌人束缚的施加者

// BOSS禁用状态（第二阶段禁用物品和投降）
const isBossItemsDisabled = ref<boolean>(false);
const isBossSurrenderDisabled = ref<boolean>(false);

// BOSS对话显示状态
const bossOverlayText = ref<string>('');
const bossDialogueKey = ref<number>(0); // 用于强制重新创建DOM元素，让动画重新播放
const sealCanvas = ref<HTMLCanvasElement | null>(null);

// BOSS阶段转换状态
const isPhaseTransitioning = ref<boolean>(false);
const phaseTransitionEffect = ref<'phase1to2' | 'phase2to3' | null>(null);

// 特效状态
const effectType = ref<'critical' | 'dodge' | 'climax' | 'victory' | 'defeat' | null>(null);
const showEffect = ref(false);

// 玩家立绘上传 input
const playerPortraitInput = ref<HTMLInputElement | null>(null);

// CG相关状态
const cgImageUrl = ref<string | null>(null);
const cgDescription = ref<string>('');

// ================= BOSS对话显示系统 =================
// 点击跳过当前对话
function handleBossTextClick() {
  if (BossSystem.isShowingDialogue.value) {
    BossSystem.skipDialogue();
  }
}

// 将bossSystem.ts的对话直接映射到淡入淡出文字层
watch(
  () => [BossSystem.isShowingDialogue.value, BossSystem.currentDialogue.value],
  () => {
    if (BossSystem.isShowingDialogue.value && BossSystem.currentDialogue.value) {
      const d = BossSystem.currentDialogue.value;
      // 只显示对话文本，不显示说话人
      bossOverlayText.value = d.text;
      // 更新key强制Vue重新创建DOM元素，让动画重新播放
      bossDialogueKey.value++;
    } else {
      bossOverlayText.value = '';
    }
  },
  { immediate: true, deep: true }
);

// 粒子封印系统
interface Particle {
  x: number;
  y: number;
  tx: number;
  ty: number;
  size: number;
  color: string;
  speed: number;
  delay: number;
  isArrived: boolean;
}

let particles: Particle[] = [];
let animationFrameId: number | null = null;

// 生成对角线叉叉坐标点
function generateCrossPoints(rect: DOMRect, count: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const padding = 12;
  const size = rect.width - padding * 2;
  
  for (let i = 0; i < count; i++) {
    const pos = (i / count) * size;
    // 左上到右下
    points.push({ x: rect.left + padding + pos, y: rect.top + padding + pos });
    // 右上到左下
    points.push({ x: rect.left + padding + pos, y: rect.top + padding + (size - pos) });
  }
  return points;
}

// 创建粒子
function createParticle(tx: number, ty: number, delay: number): Particle {
  const angle = Math.random() * Math.PI * 2;
  const dist = 500 + Math.random() * 300;
  const shades = ['#000000', '#1a1a1a', '#0d0d0d'];
  
  return {
    x: tx + Math.cos(angle) * dist,
    y: ty + Math.sin(angle) * dist,
    tx,
    ty,
    size: Math.random() * 6 + 4,
    color: shades[Math.floor(Math.random() * shades.length)],
    speed: 0.05 + Math.random() * 0.03,
    delay,
    isArrived: false,
  };
}

// 更新粒子
function updateParticle(p: Particle) {
  if (p.delay > 0) {
    p.delay--;
    return;
  }
  if (p.isArrived) return;
  
  p.x += (p.tx - p.x) * p.speed;
  p.y += (p.ty - p.y) * p.speed;
  
  if (Math.abs(p.x - p.tx) < 0.5 && Math.abs(p.y - p.ty) < 0.5) {
    p.x = p.tx;
    p.y = p.ty;
    p.isArrived = true;
  }
}

// 绘制粒子
function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  if (p.delay > 0) return;
  ctx.fillStyle = p.color;
  ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
}

// 粒子动画循环
function animateParticles() {
  if (!sealCanvas.value) return;
  const ctx = sealCanvas.value.getContext('2d');
  if (!ctx) return;
  
  ctx.clearRect(0, 0, sealCanvas.value.width, sealCanvas.value.height);
  particles.forEach(p => {
    updateParticle(p);
    drawParticle(ctx, p);
  });
  
  animationFrameId = requestAnimationFrame(animateParticles);
}

// 执行封印效果（禁用按钮）
function castSealEffect(targetSelectors: string[]) {
  particles = [];
  
  targetSelectors.forEach(selector => {
    const el = document.querySelector(selector) as HTMLElement;
    if (!el) return;
    
    const rect = el.getBoundingClientRect();
    const points = generateCrossPoints(rect, 50);
    
    points.forEach(p => {
      particles.push(createParticle(p.x, p.y, Math.random() * 40));
    });
    
    // 1.2秒后按钮变暗
    setTimeout(() => {
      el.classList.add('is-sealed');
    }, 1200);
  });
  
  if (animationFrameId === null) {
    animateParticles();
  }
}

// 解除封印效果
function removeSealEffect(targetSelectors: string[]) {
  targetSelectors.forEach(selector => {
    const el = document.querySelector(selector) as HTMLElement;
    if (el) {
      el.classList.remove('is-sealed');
    }
  });
  particles = [];
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (sealCanvas.value) {
    const ctx = sealCanvas.value.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, sealCanvas.value.width, sealCanvas.value.height);
    }
  }
}

// ================= MVU 集成 =================
// 获取用户名字
function getUserName(): string {
  try {
    // 方法1：从聊天消息中获取最新的用户消息
    if (typeof getChatMessages === 'function') {
      const messages = getChatMessages(-1, { role: 'user' });
      if (messages && messages.length > 0) {
        const lastUserMessage = messages[messages.length - 1];
        if (lastUserMessage?.name) {
          return lastUserMessage.name;
        }
      }
    }

    // 方法2：从全局对象获取
    const globalAny = window as any;
    if (globalAny.chat?.characters && globalAny.chat.characters.length > 0) {
      // 尝试获取用户名字（通常是第一个角色）
      const userChar = globalAny.chat.characters.find((c: any) => c.is_user || c.role === 'user');
      if (userChar?.name) {
        return userChar.name;
      }
    }

    // 方法3：从SillyTavern获取
    if (globalAny.SillyTavern?.chat?.characters) {
      const userChar = globalAny.SillyTavern.chat.characters.find((c: any) => c.is_user || c.role === 'user');
      if (userChar?.name) {
        return userChar.name;
      }
    }
  } catch (e) {
    console.warn('[战斗界面] 获取用户名失败', e);
  }

  // 默认值
  return '玩家';
}

async function loadFromMvu() {
  try {
    await waitGlobalInitialized('Mvu');
    const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData?.stat_data) return;

    const data = mvuData.stat_data;

    // 设置玩家名字
    const userName = getUserName();
    player.value.name = userName;

    // 获取统一的高潮次数上限 (双方共享)
    const maxClimaxCount = _.get(data, '性斗系统.胜负规则.高潮次数上限', 3);

    // 同步玩家数据 - 核心状态
    player.value.stats.maxEndurance = _.get(data, '核心状态.$最大耐力', 100);
    player.value.stats.currentEndurance = _.get(data, '核心状态.$耐力', 100);
    player.value.stats.maxPleasure = _.get(data, '核心状态.$最大快感', 100);
    player.value.stats.currentPleasure = _.get(data, '核心状态.$快感', 0);
    // 已移除意志力相关字段
    player.value.stats.level = _.get(data, '角色基础._等级', 1);
    player.value.stats.charm = _.get(data, '核心状态._魅力', 10);
    player.value.stats.luck = _.get(data, '核心状态._幸运', 10);
    player.value.stats.evasion = _.get(data, '核心状态._闪避率', 0);
    player.value.stats.crit = _.get(data, '核心状态._暴击率', 0);

    // 性斗系统数据 - 直接读取实时值
    player.value.stats.sexPower = _.get(data, '性斗系统.实时性斗力', 25);
    player.value.stats.baseEndurance = _.get(data, '性斗系统.实时忍耐力', 15);
    player.value.stats.climaxCount = _.get(data, '性斗系统.高潮次数', 0);
    player.value.stats.maxClimaxCount = maxClimaxCount;

    // 加载玩家技能 - 从技能系统.主动技能读取
    const availableSkills = _.get(data, '技能系统.主动技能', {});
    const skillIds = Object.keys(availableSkills);
    if (skillIds.length > 0) {
      const { getSkillById } = await import('./skillDatabase');
      const { DamageSource } = await import('./types');

      player.value.skills = skillIds
        .map(skillId => {
          const skillData = getSkillById(skillId);
          if (!skillData) {
            // 如果数据库中没有，尝试从MVU数据中读取技能信息
            const mvuSkill = availableSkills[skillId];
            if (mvuSkill && mvuSkill.基本信息) {
              // 从MVU数据生成效果描述
              let effectDesc = '';
              const damageInfo = mvuSkill.伤害与效果 || {};
              if (damageInfo) {
                const sourceName = damageInfo.伤害来源 || '性斗力';
                const coefficient = damageInfo.系数 || 100;
                effectDesc = `造成${coefficient}%${sourceName}伤害`;

                // 添加效果列表信息
                if (damageInfo.效果列表 && Object.keys(damageInfo.效果列表).length > 0) {
                  const effects = Object.values(damageInfo.效果列表).map((eff: any) => {
                    const value = eff.是否为百分比 ? `${eff.效果值}%` : eff.效果值;
                    return `${eff.效果类型}+${value}`;
                  });
                  effectDesc += `，${effects.join('、')}`;
                }
              }

              // 根据伤害来源和系数构建伤害公式
              const damageSource = damageInfo.伤害来源 || '性斗力';
              const coefficient = (damageInfo.系数 || 100) / 100; // 转换为小数（100% = 1.0）

              // 映射伤害来源到DamageSource枚举（使用字符串值，因为DamageSource是字符串枚举）
              let source: any;
              switch (damageSource) {
                case '性斗力':
                  source = 'sex_power'; // DamageSource.SEX_POWER
                  break;
                case '魅力':
                  source = 'charm'; // DamageSource.CHARM
                  break;
                case '幸运':
                  source = 'luck'; // DamageSource.LUCK
                  break;
                case '意志力':
                  source = 'willpower'; // DamageSource.WILLPOWER
                  break;
                case '固定值':
                  source = 'fixed'; // DamageSource.FIXED
                  break;
                default:
                  source = 'sex_power';
              }

              // 构建伤害公式组件
              const damageFormula = [
                {
                  source: source,
                  coefficient: coefficient,
                  baseValue: 0,
                },
              ];

              // 创建基本的SkillData对象（读取连击数、准确率、暴击修正）
              const basicSkillData = {
                id: skillId,
                name: mvuSkill.基本信息.技能名称 || skillId,
                description: mvuSkill.基本信息.技能描述 || '',
                effectDescription: effectDesc,
                type: 'attack' as any,
                staminaCost: mvuSkill.冷却与消耗?.耐力消耗 || 0,
                cooldown: mvuSkill.冷却与消耗?.冷却回合数 || 0,
                castTime: 0,
                damageFormula: damageFormula,
                accuracy: mvuSkill.伤害与效果?.基础命中率 || 100,
                critModifier: mvuSkill.伤害与效果?.暴击修正 || 0,
                buffs: [],
                canBeReflected: false,
                hitCount: mvuSkill.伤害与效果?.连击数 || 1,
                accuracyModifier: mvuSkill.伤害与效果?.准确率 || 100,
              };

              return {
                id: skillId,
                name: mvuSkill.基本信息.技能名称 || skillId,
                description: mvuSkill.基本信息.技能描述 || '',
                cost: mvuSkill.冷却与消耗?.耐力消耗 || 0,
                type: 'attack' as any,
                cooldown: mvuSkill.冷却与消耗?.冷却回合数 || 0,
                currentCooldown: 0,
                data: basicSkillData,
              };
            }
            return null;
          }

          // 获取技能当前冷却 - 注意：Schema中没有明确的玩家技能冷却字段
          // 技能冷却在战斗中管理，不需要从MVU读取（每次战斗开始时冷却为0）
          const currentCooldown = 0;

          return {
            id: skillData.id,
            name: skillData.name,
            description: skillData.description,
            cost: skillData.staminaCost,
            type: skillData.type,
            cooldown: skillData.cooldown,
            currentCooldown,
            data: skillData,
          };
        })
        .filter(skill => skill !== null) as any;

      console.info(
        '[战斗界面] 已加载玩家技能:',
        player.value.skills.map((s: any) => s.name),
      );
    }

    // 获取对手名称
    const enemyName = _.get(data, '性斗系统.对手名称', '');
    console.info('[战斗界面] 对手名称:', enemyName);

    // 直接从MVU加载敌人数据（如果MVU中没有数据，会从数据库加载并写入MVU）
    await loadEnemyFromMvuData(data, maxClimaxCount);

    // 加载玩家物品 - 从物品系统.背包读取"战斗用品"为true的消耗品
    const backpack = _.get(data, '物品系统.背包', {});
    const combatItems = _.get(data, '性斗系统.战斗物品', {});

    // 从背包中筛选出战斗用品（类型为"消耗品"且战斗用品为true）
    const combatUsableItems: Item[] = [];
    Object.entries(backpack).forEach(([itemId, itemData]: [string, any]) => {
      // 检查是否为消耗品且战斗用品为true
      if (itemData?.类型 === '消耗品' && itemData?.战斗用品 === true) {
        // 获取数量
        const quantity = itemData?.数量 || combatItems[itemId] || 0;
        if (quantity > 0) {
          // 提取物品名称：优先使用描述的第一部分，或使用ID
          let itemName = itemId;
          if (itemData?.描述) {
            // 尝试从描述中提取名称（描述格式可能是"名称：效果"或"名称 效果"）
            const nameMatch = itemData.描述.match(/^([^：:]+)/);
            if (nameMatch) {
              itemName = nameMatch[1].trim();
            } else {
              itemName = itemData.描述;
            }
          }

          // 调试日志
          if (itemData?.加成属性) {
            console.info(`[战斗界面] 加载临时buff物品: ${itemId}`, itemData.加成属性);
          }
          
          // 创建Item对象
          // 使用itemId作为名称（因为背包的key就是物品名称）
          const item: Item = {
            id: itemId,
            name: itemName, // 显示用名称（优先使用描述里提取的名称）
            description: itemData?.描述 || '战斗用品',
            quantity: quantity,
            staminaRestore: itemData?.耐力增加,
            pleasureReduce: itemData?.快感降低,
            bonuses: itemData?.加成属性, // 添加加成属性
            effect: (user, _target) => {
              // 根据物品属性应用效果
              let message = `${user.name} 使用了 ${item.name}`;

              // 恢复耐力
              if (itemData?.耐力增加) {
                const oldEndurance = user.stats.currentEndurance;
                user.stats.currentEndurance = Math.min(
                  user.stats.maxEndurance,
                  user.stats.currentEndurance + itemData.耐力增加,
                );
                const actualHeal = user.stats.currentEndurance - oldEndurance;
                if (actualHeal > 0) {
                  message += `，恢复了 ${actualHeal} 点耐力`;
                }
              }

              // 降低快感
              if (itemData?.快感降低) {
                const oldPleasure = user.stats.currentPleasure;
                user.stats.currentPleasure = Math.max(0, user.stats.currentPleasure - itemData.快感降低);
                const actualReduce = oldPleasure - user.stats.currentPleasure;
                if (actualReduce > 0) {
                  message += `，快感降低了 ${actualReduce} 点`;
                }
              }

              // 临时buff：写入MVU的临时状态
              if (itemData?.加成属性 && Object.keys(itemData.加成属性).length > 0) {
                // 这里只记录消息，实际写入MVU在handlePlayerItem中处理
                const buffDesc = itemData.描述?.match(/持续(\d+)回合/);
                const duration = buffDesc ? parseInt(buffDesc[1]) : 3;
                message += `，获得临时增益（持续${duration}回合）`;
              }

              return {
                id: Math.random().toString(36).substr(2, 9),
                turn: turnState.currentTurn,
                message: message + '。',
                source: 'player',
                type: 'heal' as const,
              };
            },
          };
          combatUsableItems.push(item);
        }
      }
    });

    // 如果有战斗用品，替换玩家物品列表；否则清空物品列表
    if (combatUsableItems.length > 0) {
      player.value.items = combatUsableItems;
      console.info(
        '[战斗界面] 已加载战斗用品:',
        combatUsableItems.map(i => `${i.name} x${i.quantity}`),
      );
    } else {
      // 如果没有战斗用品，清空物品列表（不显示默认物品）
      player.value.items = [];
      console.info('[战斗界面] 未找到战斗用品，物品列表已清空');
    }

    // 应用临时状态和永久状态的加成
    const tempBonus = _.get(data, '临时状态.加成统计', {});
    const permBonus = _.get(data, '永久状态.加成统计', {});
    const equipBonus = _.get(data, '物品系统.装备总加成', {});

    // 计算总加成（这里只是示例，实际应该根据加成类型进行计算）
    // 注意：这些加成应该在战斗计算时应用，而不是直接修改基础值

    // 读取允许认输设置（注意：true时不可认输，false时允许认输）
    const surrenderAllowed = _.get(data, '性斗系统.胜负规则.允许认输', true);
    allowSurrender.value = !surrenderAllowed; // 反转逻辑：true时不可认输，false时允许认输

    // 同步回合数
    turnState.currentTurn = _.get(data, '性斗系统.当前回合', 1);

    console.info('[战斗界面] 已从MVU加载数据');
  } catch (e) {
    console.warn('[战斗界面] MVU加载失败，使用默认数据', e);
  }
}

// 从MVU数据加载敌人（后备方案）
async function loadEnemyFromMvuData(data: any, maxClimaxCount: number) {
  const enemyName = _.get(data, '性斗系统.对手名称', '风纪委员长');
  if (enemyName) enemy.value.name = enemyName;

  // ==================== BOSS检测 ====================
  // 检测是否是沐芯兰BOSS战
  if (BossSystem.isMuxinlanBoss(enemyName)) {
    console.info('[战斗界面] 检测到沐芯兰BOSS战！');
    BossSystem.initMuxinlanBoss();
    // 强制使用第一阶段数据
    const bossDisplayName = BossSystem.getMuxinlanDisplayName(1);
    const bossClimaxLimit = BossSystem.BOSS_CONFIG.muxinlan.climaxLimits[0]; // 第一阶段高潮次数上限
    enemy.value.name = bossDisplayName;
    enemy.value.avatarUrl = BossSystem.getMuxinlanAvatarUrl(1);
    
    // 更新MVU中的对手名称和胜负规则
    if (typeof Mvu !== 'undefined') {
      const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
      if (mvuData?.stat_data) {
        _.set(mvuData.stat_data, '性斗系统.对手名称', bossDisplayName);
        // 第一阶段：设置高潮次数上限为1（达到1次高潮即可进入第二阶段）
        _.set(mvuData.stat_data, '性斗系统.胜负规则.高潮次数上限', bossClimaxLimit);
        // 对手高潮次数初始为0（记录已高潮次数）
        _.set(mvuData.stat_data, '性斗系统.对手高潮次数', 0);
        await Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
      }
    }
    // 同步更新UI中的高潮次数上限（双方共享）
    player.value.stats.maxClimaxCount = bossClimaxLimit;
    enemy.value.stats.maxClimaxCount = bossClimaxLimit;
    
    // 入场对话已在BossSystem.initMuxinlanBoss()中通过queueDialogues播放
    addLog(`【特殊战斗】沐芯兰BOSS战开始！`, 'system', 'critical');
    
    console.info(`[战斗界面] BOSS战初始化完成: ${bossDisplayName}, 高潮次数上限: ${bossClimaxLimit}`);
  }

  // 优先从数据库查找对手数据，如果存在则覆盖MVU变量
  if (enemyName) {
    try {
      console.info('[战斗界面] 开始加载对手数据...');
      
      // 加载数据库模块
      const { enemyDbModule, enemySkillDbModule } = await loadDatabaseModules();
      
      // 解析完整名称（支持模糊匹配）
      const fullEnemyName = enemyDbModule.resolveEnemyName(enemyName);
      const presetData = enemyDbModule.getEnemyMvuData(enemyName);
      
      console.info(`[战斗界面] 名称解析: ${enemyName} -> ${fullEnemyName}`);
      
      // 设置敌人立绘 URL（沐芯兰BOSS战使用分阶段立绘，其它敌人使用名称生成 GitHub 路径）
      if (BossSystem.bossState.isBossFight && BossSystem.bossState.bossId === 'muxinlan') {
        enemy.value.avatarUrl = BossSystem.getMuxinlanAvatarUrl(BossSystem.bossState.currentPhase);
      } else {
        enemy.value.avatarUrl = getEnemyPortraitUrl(fullEnemyName);
      }
      console.info(`[战斗界面] 敌人立绘 URL: ${enemy.value.avatarUrl}`);
      
      if (presetData) {
        console.info(`[战斗界面] 从数据库加载对手数据并覆盖MVU: ${enemyName} -> ${fullEnemyName}`);
        // 将预设数据写入MVU（覆盖原有数据）
        if (typeof Mvu !== 'undefined') {
          const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
          if (mvuData?.stat_data) {
            // 获取当前难度并应用难度系数
            const difficulty = _.get(mvuData.stat_data, '角色基础.难度', '普通');
            const adjustedData = enemyDbModule.applyDifficultyCoefficient(presetData, difficulty);
            console.info(`[战斗界面] 应用难度系数: ${difficulty}, 原始性斗力=${presetData.对手性斗力}, 调整后=${adjustedData.对手性斗力}`);
            
            // 确保对手名称被写入（使用完整名称）
            _.set(mvuData.stat_data, '性斗系统.对手名称', fullEnemyName);
            // 写入所有对手基础属性（已应用难度系数）
            _.set(mvuData.stat_data, '性斗系统.对手魅力', adjustedData.对手魅力);
            _.set(mvuData.stat_data, '性斗系统.对手幸运', adjustedData.对手幸运);
            _.set(mvuData.stat_data, '性斗系统.对手闪避率', adjustedData.对手闪避率);
            _.set(mvuData.stat_data, '性斗系统.对手暴击率', adjustedData.对手暴击率);
            _.set(mvuData.stat_data, '性斗系统.对手等级', adjustedData.对手等级);
            _.set(mvuData.stat_data, '性斗系统.对手耐力', adjustedData.对手耐力);
            _.set(mvuData.stat_data, '性斗系统.对手最大耐力', adjustedData.对手最大耐力);
            _.set(mvuData.stat_data, '性斗系统.对手快感', adjustedData.对手快感);
            _.set(mvuData.stat_data, '性斗系统.对手最大快感', adjustedData.对手最大快感);
            _.set(mvuData.stat_data, '性斗系统.对手高潮次数', adjustedData.对手高潮次数);
            _.set(mvuData.stat_data, '性斗系统.对手性斗力', adjustedData.对手性斗力);
            _.set(mvuData.stat_data, '性斗系统.对手忍耐力', adjustedData.对手忍耐力);
            // 初始化对手实时属性（初始时等于基础属性）
            _.set(mvuData.stat_data, '性斗系统.对手实时魅力', adjustedData.对手魅力);
            _.set(mvuData.stat_data, '性斗系统.对手实时幸运', adjustedData.对手幸运);
            _.set(mvuData.stat_data, '性斗系统.对手实时闪避率', adjustedData.对手闪避率);
            _.set(mvuData.stat_data, '性斗系统.对手实时暴击率', adjustedData.对手暴击率);
            _.set(mvuData.stat_data, '性斗系统.对手实时性斗力', adjustedData.对手性斗力);
            _.set(mvuData.stat_data, '性斗系统.对手实时忍耐力', adjustedData.对手忍耐力);
            // 初始化对手临时状态（即使为空对象也要确保存在）
            if (!_.get(mvuData.stat_data, '性斗系统.对手临时状态')) {
              _.set(mvuData.stat_data, '性斗系统.对手临时状态', {
                状态列表: {},
                加成统计: {},
              });
            } else {
              // 确保结构完整
              if (!_.get(mvuData.stat_data, '性斗系统.对手临时状态.状态列表')) {
                _.set(mvuData.stat_data, '性斗系统.对手临时状态.状态列表', {});
              }
              if (!_.get(mvuData.stat_data, '性斗系统.对手临时状态.加成统计')) {
                _.set(mvuData.stat_data, '性斗系统.对手临时状态.加成统计', {});
              }
            }
            // 写入对手技能冷却（如果为空则初始化为空对象）
            _.set(mvuData.stat_data, '性斗系统.对手技能冷却', presetData.对手技能冷却 || {});
            
            // 自动加载对手技能（使用解析后的完整名称）
            // 重要：如果数据库中存在该对手技能，则直接覆盖MVU中的技能
            // 特殊处理：艾格妮丝根据玩家性别选择技能池
            let skillLookupName = fullEnemyName;
            if (fullEnemyName === '艾格妮丝' || fullEnemyName.includes('艾格妮丝')) {
              const playerGender = _.get(mvuData.stat_data, '角色基础.性别', '女');
              if (playerGender === '男') {
                skillLookupName = '艾格妮丝_男';
                console.info(`[战斗界面] 艾格妮丝检测到男性玩家，使用男性技能池`);
              } else {
                skillLookupName = '艾格妮丝';
                console.info(`[战斗界面] 艾格妮丝检测到女性/非二元玩家，使用女性技能池`);
              }
            }
            
            const enemySkills = enemySkillDbModule.getEnemySkills(enemyName, skillLookupName);
            if (enemySkills && enemySkills.length > 0) {
              console.info(`[战斗界面] 为对手 ${fullEnemyName} 加载技能:`, enemySkills.map((s: any) => s.name));
              const mvuSkills: Record<string, any> = {};
              enemySkills.forEach((skill: any) => {
                mvuSkills[skill.id] = enemySkillDbModule.convertToMvuSkillFormat(skill);
              });
              _.set(mvuData.stat_data, '性斗系统.对手可用技能', mvuSkills);
              console.info(`[战斗界面] 技能覆盖完成，现有技能数: ${Object.keys(mvuSkills).length}`);
            } else {
              // 如果MVU中没有对手可用技能，初始化为空对象
              if (!_.get(mvuData.stat_data, '性斗系统.对手可用技能')) {
                _.set(mvuData.stat_data, '性斗系统.对手可用技能', {});
              }
            }
            
            await Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
            console.info(`[战斗界面] 已将对手数据和技能写入MVU: ${fullEnemyName}`);
            // 重新读取数据
            const updatedMvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
            if (updatedMvuData?.stat_data) {
              data = updatedMvuData.stat_data;
            }
          }
        }
      } else {
        console.info(`[战斗界面] 数据库中未找到对手数据: ${enemyName}，使用MVU中的现有数据`);
        // 即使数据库中没有数据，也尝试设置立绘（使用解析后的完整名称）
        const fullEnemyName = resolveEnemyName(enemyName);
        if (BossSystem.bossState.isBossFight && BossSystem.bossState.bossId === 'muxinlan') {
          enemy.value.avatarUrl = BossSystem.getMuxinlanAvatarUrl(BossSystem.bossState.currentPhase);
        } else {
          enemy.value.avatarUrl = getEnemyPortraitUrl(fullEnemyName);
        }
        console.info(`[战斗界面] 敌人立绘 URL: ${enemy.value.avatarUrl}`);
        // 即使数据库中没有，也尝试加载技能
        if (typeof Mvu !== 'undefined') {
          const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
          if (mvuData?.stat_data) {
            // 使用解析后的完整名称
            _.set(mvuData.stat_data, '性斗系统.对手名称', fullEnemyName);
            // 确保对手临时状态结构存在
            if (!_.get(mvuData.stat_data, '性斗系统.对手临时状态')) {
              _.set(mvuData.stat_data, '性斗系统.对手临时状态', {
                状态列表: {},
                加成统计: {},
              });
            }
            // 确保对手技能冷却存在
            if (!_.get(mvuData.stat_data, '性斗系统.对手技能冷却')) {
              _.set(mvuData.stat_data, '性斗系统.对手技能冷却', {});
            }
            
            // 尝试加载对手技能（使用解析后的完整名称）
            // 重要：如果数据库中存在该对手技能，则直接覆盖MVU中的技能
            // 特殊处理：艾格妮丝根据玩家性别选择技能池
            let skillLookupName = fullEnemyName;
            if (fullEnemyName === '艾格妮丝' || fullEnemyName.includes('艾格妮丝')) {
              const playerGender = _.get(mvuData.stat_data, '角色基础.性别', '女');
              if (playerGender === '男') {
                skillLookupName = '艾格妮丝_男';
                console.info(`[战斗界面] 艾格妮丝检测到男性玩家，使用男性技能池`);
              } else {
                skillLookupName = '艾格妮丝';
                console.info(`[战斗界面] 艾格妮丝检测到女性/非二元玩家，使用女性技能池`);
              }
            }
            
            const enemySkills = enemySkillDbModule.getEnemySkills(enemyName, skillLookupName);
            if (enemySkills && enemySkills.length > 0) {
              console.info(`[战斗界面] 为对手 ${fullEnemyName} 加载技能:`, enemySkills.map((s: any) => s.name));
              const mvuSkills: Record<string, any> = {};
              enemySkills.forEach((skill: any) => {
                mvuSkills[skill.id] = enemySkillDbModule.convertToMvuSkillFormat(skill);
              });
              _.set(mvuData.stat_data, '性斗系统.对手可用技能', mvuSkills);
              console.info(`[战斗界面] 技能覆盖完成，现有技能数: ${Object.keys(mvuSkills).length}`);
            } else {
              // 确保对手可用技能存在
              if (!_.get(mvuData.stat_data, '性斗系统.对手可用技能')) {
                _.set(mvuData.stat_data, '性斗系统.对手可用技能', {});
              }
            }
            
            await Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
          }
        }
      }
    } catch (e) {
      console.error('[战斗界面] 加载对手数据库失败', e);
      console.error('[战斗界面] 错误详情:', e instanceof Error ? e.message : String(e));
      console.error('[战斗界面] 错误堆栈:', e instanceof Error ? e.stack : '无堆栈信息');
    }
  }

  enemy.value.stats.maxEndurance = _.get(data, '性斗系统.对手最大耐力', 150);
  enemy.value.stats.currentEndurance = _.get(data, '性斗系统.对手耐力', 150);
  enemy.value.stats.maxPleasure = _.get(data, '性斗系统.对手最大快感', 100);
  enemy.value.stats.currentPleasure = _.get(data, '性斗系统.对手快感', 0);
  enemy.value.stats.climaxCount = _.get(data, '性斗系统.对手高潮次数', 0);
  // BOSS战时高潮次数上限已在BOSS初始化时设置，不再覆盖
  if (!BossSystem.bossState.isBossFight) {
    enemy.value.stats.maxClimaxCount = maxClimaxCount;
  }
  // UI 读取对手实时属性（已包含临时状态加成）
  enemy.value.stats.sexPower = _.get(data, '性斗系统.对手实时性斗力', _.get(data, '性斗系统.对手性斗力', 20));
  enemy.value.stats.baseEndurance = _.get(data, '性斗系统.对手实时忍耐力', _.get(data, '性斗系统.对手忍耐力', 20));
  enemy.value.stats.charm = _.get(data, '性斗系统.对手实时魅力', _.get(data, '性斗系统.对手魅力', 10));
  enemy.value.stats.luck = _.get(data, '性斗系统.对手实时幸运', _.get(data, '性斗系统.对手幸运', 5));
  enemy.value.stats.evasion = _.get(data, '性斗系统.对手实时闪避率', _.get(data, '性斗系统.对手闪避率', 5));
  enemy.value.stats.crit = _.get(data, '性斗系统.对手实时暴击率', _.get(data, '性斗系统.对手暴击率', 10));
  enemy.value.stats.level = _.get(data, '性斗系统.对手等级', 1);

  // 加载对手技能 - 从性斗系统.对手可用技能读取
  const enemySkills = _.get(data, '性斗系统.对手可用技能', {});
  const enemySkillIds = Object.keys(enemySkills);
  console.info('[战斗界面] 从MVU加载敌人技能，技能ID列表:', enemySkillIds);

  if (enemySkillIds.length > 0) {
    const { skillDbModule } = await loadDatabaseModules();
    enemy.value.skills = enemySkillIds
      .map((skillId: string) => {
        const skillData = skillDbModule.getSkillById(skillId);
        const mvuSkill = enemySkills[skillId];

        if (!skillData && mvuSkill) {
          const skillName = mvuSkill.基本信息?.技能名称 || skillId;

          // 从MVU数据创建技能
          return {
            id: skillId,
            name: skillName,
            description: mvuSkill.基本信息?.技能描述 || '',
            cost: mvuSkill.冷却与消耗?.耐力消耗 || 0,
            type: 'attack' as any,
            cooldown: mvuSkill.冷却与消耗?.冷却回合数 || 0,
            currentCooldown: _.get(data, `性斗系统.对手技能冷却.${skillId}`, 0),
            data: null,
          };
        }
        if (!skillData) return null;

        const currentCooldown = _.get(data, `性斗系统.对手技能冷却.${skillId}`, 0);
        return {
          id: skillData.id,
          name: skillData.name,
          description: skillData.description,
          cost: skillData.staminaCost,
          type: skillData.type,
          cooldown: skillData.cooldown,
          currentCooldown,
          data: skillData,
        };
      })
      .filter((skill: any) => skill !== null);

    console.info(
      '[战斗界面] 已加载敌人技能:',
      enemy.value.skills.map((s: any) => `${s.name}(${s.id})`),
    );
  } else {
    console.warn('[战斗界面] 性斗系统.对手可用技能为空');
  }
}

// 保存敌人完整数据到MVU
async function saveMvuEnemyData() {
  try {
    if (typeof Mvu === 'undefined') return;

    const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData) return;

    // 更新敌人的动态数据（耐力、快感等会变化的值）
    // 注意：基础属性不在这里修改，实时属性由 updateEnemyRealtimeStats 统一管理
    _.set(mvuData.stat_data, '性斗系统.对手名称', enemy.value.name);
    _.set(mvuData.stat_data, '性斗系统.对手最大耐力', enemy.value.stats.maxEndurance);
    _.set(mvuData.stat_data, '性斗系统.对手耐力', enemy.value.stats.currentEndurance);
    _.set(mvuData.stat_data, '性斗系统.对手最大快感', enemy.value.stats.maxPleasure);
    _.set(mvuData.stat_data, '性斗系统.对手快感', enemy.value.stats.currentPleasure);
    _.set(mvuData.stat_data, '性斗系统.对手高潮次数', enemy.value.stats.climaxCount);
    // 写入实时属性（UI 中显示的值）
    _.set(mvuData.stat_data, '性斗系统.对手实时性斗力', enemy.value.stats.sexPower);
    _.set(mvuData.stat_data, '性斗系统.对手实时忍耐力', enemy.value.stats.baseEndurance);
    _.set(mvuData.stat_data, '性斗系统.对手实时魅力', enemy.value.stats.charm);
    _.set(mvuData.stat_data, '性斗系统.对手实时幸运', enemy.value.stats.luck);
    _.set(mvuData.stat_data, '性斗系统.对手实时闪避率', enemy.value.stats.evasion);
    _.set(mvuData.stat_data, '性斗系统.对手实时暴击率', enemy.value.stats.crit);
    _.set(mvuData.stat_data, '性斗系统.对手等级', enemy.value.stats.level);

    await Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
    console.info('[战斗界面] 已保存敌人完整数据到MVU');
  } catch (e) {
    console.warn('[战斗界面] 保存敌人数据失败', e);
  }
}

async function saveToMvu() {
  try {
    if (typeof Mvu === 'undefined') return;

    const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData) return;

    // 保存玩家技能冷却 - 注意：Schema中没有明确的玩家技能冷却字段
    // 暂时保存到性斗系统中，但实际应该根据Schema调整
    const playerSkillCooldowns: Record<string, number> = {};
    player.value.skills.forEach(skill => {
      playerSkillCooldowns[skill.id] = skill.currentCooldown;
    });

    // 保存敌人技能冷却
    const enemySkillCooldowns: Record<string, number> = {};
    enemy.value.skills.forEach(skill => {
      enemySkillCooldowns[skill.id] = skill.currentCooldown;
    });

    // 保存战斗物品数量
    const combatItems: Record<string, number> = {};
    player.value.items.forEach(item => {
      if (item.quantity > 0) {
        combatItems[item.id] = item.quantity;
      }
    });

    // 收集当前所有战斗日志到行动日志
    const actionLogs: Record<string, string> = {};
    logs.value.forEach((log, index) => {
      const logKey = `回合${log.turn}_${index}`;
      const logValue = `[${log.turn}] ${
        log.source === 'player' ? player.value.name : log.source === 'enemy' ? enemy.value.name : '系统'
      }: ${log.message}`;
      actionLogs[logKey] = logValue;
    });

    const updates: Record<string, any> = {
      // 玩家数据 - 核心状态（已移除意志力）
      '核心状态.$耐力': player.value.stats.currentEndurance,
      '核心状态.$快感': player.value.stats.currentPleasure,
      '核心状态._魅力': player.value.stats.charm,
      '核心状态._幸运': player.value.stats.luck,
      '核心状态._闪避率': player.value.stats.evasion,
      '核心状态._暴击率': player.value.stats.crit,

      // 玩家数据 - 性斗系统
      '性斗系统.当前回合': turnState.currentTurn,
      '性斗系统.高潮次数': player.value.stats.climaxCount,
      '性斗系统.实时性斗力': player.value.stats.sexPower,
      '性斗系统.实时忍耐力': player.value.stats.baseEndurance,
      '性斗系统.行动日志': actionLogs, // 保存所有战斗日志
      // 注意：玩家技能冷却在Schema中没有明确字段，技能冷却在战斗中临时管理，不持久化

      // 敌人数据 - 动态变化的值
      '性斗系统.对手名称': enemy.value.name,
      '性斗系统.对手耐力': enemy.value.stats.currentEndurance,
      '性斗系统.对手最大耐力': enemy.value.stats.maxEndurance,
      '性斗系统.对手快感': enemy.value.stats.currentPleasure,
      '性斗系统.对手最大快感': enemy.value.stats.maxPleasure,
      '性斗系统.对手高潮次数': enemy.value.stats.climaxCount,
      '性斗系统.对手等级': enemy.value.stats.level,
      // 敌人实时属性（UI 中的值，已包含 debuff 加成）
      '性斗系统.对手实时性斗力': enemy.value.stats.sexPower,
      '性斗系统.对手实时忍耐力': enemy.value.stats.baseEndurance,
      '性斗系统.对手实时魅力': enemy.value.stats.charm,
      '性斗系统.对手实时幸运': enemy.value.stats.luck,
      '性斗系统.对手实时闪避率': enemy.value.stats.evasion,
      '性斗系统.对手实时暴击率': enemy.value.stats.crit,
      '性斗系统.对手技能冷却': enemySkillCooldowns,
      '性斗系统.战斗物品': combatItems,
    };

    for (const [path, value] of Object.entries(updates)) {
      _.set(mvuData.stat_data, path, value);
    }

    await Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
  } catch (e) {
    console.warn('[战斗界面] MVU保存失败', e);
  }
}

// ================= 辅助函数 =================

// ================= 完全重写的 Debuff 运算逻辑 =================
// 设计原则：
// 1. 技能命中时：只写入 MVU 状态列表，不修改任何属性值
// 2. 属性计算时：从状态列表动态计算总加成（在 reloadStatusFromMvu 中）
// 3. 回合结束时：只减少剩余回合数，移除过期状态
// 这样确保 debuff 效果只"生效"一次（通过动态计算），而不是重复叠加

/**
 * 将技能的 debuff/buff 效果写入 MVU 状态列表
 * 只负责写入，不修改任何属性值
 * 属性值的变化通过 reloadStatusFromMvu 中的动态计算实现
 */
async function applySkillEffectsFromMvu(skillId: string, isPlayerSkill: boolean): Promise<string[]> {
  const logs: string[] = [];
  console.info(`[Debuff系统] applySkillEffectsFromMvu被调用: skillId=${skillId}, isPlayerSkill=${isPlayerSkill}`);

  try {
    if (typeof Mvu === 'undefined') {
      console.warn('[战斗界面] Mvu不可用');
      return logs;
    }

    const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData?.stat_data) {
      console.warn('[战斗界面] 无法获取MVU数据');
      return logs;
    }

    // 从MVU读取技能效果列表
    const skillPath = isPlayerSkill 
      ? `技能系统.主动技能.${skillId}.伤害与效果.效果列表`
      : `性斗系统.对手可用技能.${skillId}.伤害与效果.效果列表`;
    const effectList = _.get(mvuData.stat_data, skillPath, {});

    if (!effectList || Object.keys(effectList).length === 0) {
      return logs;
    }
    
    console.info(`[Debuff系统] 处理技能效果: ${skillId}, isPlayerSkill=${isPlayerSkill}, 路径=${skillPath}`, effectList);

    console.info(`[Debuff系统] 效果列表keys:`, Object.keys(effectList));
    for (const [effectName, effectData] of Object.entries(effectList)) {
      console.info(`[Debuff系统] 开始处理效果: ${effectName}, effectData类型=${typeof effectData}, effectData=`, effectData);
      if (!effectData || typeof effectData !== 'object') {
        console.warn(`[Debuff系统] 跳过无效效果: ${effectName}`);
        continue;
      }

      const effectType = _.get(effectData, '效果类型', '') as string;
      console.info(`[Debuff系统] 处理效果: ${effectName}, 类型=${effectType}`);
      const effectValue = _.get(effectData, '效果值', 0) as number;
      const isPercentage = _.get(effectData, '是否为百分比', false) as boolean;
      const duration = _.get(effectData, '持续回合数', 0) as number;
      const targetEnemy = _.get(effectData, '是否作用敌人', true) as boolean;

      // 特殊处理：束缚效果（不写入状态列表，直接设置束缚回合数）
      // 束缚效果的effectValue可以为0，只需要duration>0即可生效
      if (effectType === '束缚') {
        console.info(`[束缚] 检测到束缚效果: duration=${duration}, targetEnemy=${targetEnemy}, isPlayerSkill=${isPlayerSkill}`);
        if (duration === 0) {
          console.warn(`[束缚] 束缚效果duration为0，跳过`);
          continue;
        }
        const targetIsPlayer = isPlayerSkill ? !targetEnemy : targetEnemy;
        console.info(`[束缚] 束缚目标计算: targetIsPlayer=${targetIsPlayer}, isPlayerSkill=${isPlayerSkill}, targetEnemy=${targetEnemy}`);
        if (targetIsPlayer) {
          playerBoundTurns.value = duration;
          playerBindSource.value = isPlayerSkill ? 'player' : 'enemy';
          logs.push(`${player.value.name} 被束缚了 ${duration} 回合，无法行动！`);
          console.info(`[束缚] ★★★ 设置玩家束缚: playerBoundTurns=${playerBoundTurns.value}`);
        } else {
          // 检查是否是沐芯兰BOSS战，如果是则免疫束缚
          if (BossSystem.bossState.isBossFight && BossSystem.bossState.bossId === 'muxinlan') {
            const immuneDialogue = BossSystem.getBindImmuneDialogue(BossSystem.bossState.currentPhase);
            if (immuneDialogue) {
              BossSystem.queueDialogues([immuneDialogue]);
            }
            logs.push(`${enemy.value.name} 免疫了束缚效果！`);
            console.info(`[束缚] 沐芯兰BOSS免疫束缚`);
            continue;
          }
          
          enemyBoundTurns.value = duration;
          enemyBindSource.value = isPlayerSkill ? 'player' : 'enemy';
          logs.push(`${enemy.value.name} 被束缚了 ${duration} 回合，无法行动！`);
          console.info(`[束缚] ★★★ 设置敌人束缚: enemyBoundTurns=${enemyBoundTurns.value}, enemyBindSource=${enemyBindSource.value}`);
        }
        continue;
      }

      // 对于非束缚效果，如果effectValue为0或duration为0则跳过
      if (effectValue === 0 || duration === 0) continue;

      // 确定目标和状态路径
      const targetIsPlayer = isPlayerSkill ? !targetEnemy : targetEnemy;
      const targetName = targetIsPlayer ? player.value.name : enemy.value.name;
      const statusListPath = targetIsPlayer ? '临时状态.状态列表' : '性斗系统.对手临时状态.状态列表';

      // 生成唯一的状态key（同一技能同一效果只存在一个条目）
      const statusKey = `${effectType}_${skillId}_${effectName}`;
      
      // 构建加成对象
      const bonusObj: Record<string, number> = {};
      const bonusFieldMap: Record<string, string> = {
        '性斗力': isPercentage ? '基础性斗力成算' : '基础性斗力加成',
        '忍耐力': isPercentage ? '基础忍耐力成算' : '基础忍耐力加成',
        '魅力': '魅力加成',
        '幸运': '幸运加成',
        '闪避率': '闪避率加成',
        '暴击率': '暴击率加成',
      };
      
      const bonusField = bonusFieldMap[effectType];
      if (!bonusField) {
        console.warn(`[Debuff系统] 未知效果类型: ${effectType}`);
        continue;
      }
      
      bonusObj[bonusField] = effectValue; // 直接使用原始值（可正可负）

      // 读取当前状态列表
      const currentStatusList = _.get(mvuData.stat_data, statusListPath, {}) as Record<string, any>;
      
      // 检查是否已存在该状态
      if (currentStatusList[statusKey]) {
        // 已存在：只刷新回合数，不重复添加
        currentStatusList[statusKey].剩余回合 = duration;
        logs.push(`${targetName} 的 ${effectType} 效果已刷新 (${duration} 回合)`);
        console.info(`[Debuff系统] 刷新已有状态: ${statusKey}`);
      } else {
        // 不存在：添加新状态
        currentStatusList[statusKey] = {
          加成: bonusObj,
          剩余回合: duration,
        };
        const sign = effectValue > 0 ? '+' : '';
        logs.push(`${targetName} ${sign}${effectValue}${isPercentage ? '%' : ''} ${effectType} (${duration} 回合)`);
        console.info(`[Debuff系统] 添加新状态: ${statusKey}`, currentStatusList[statusKey]);
      }
      
      _.set(mvuData.stat_data, statusListPath, currentStatusList);
    }

    // 一次性保存所有更改
    await Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
    
    // 更新对手实时属性（状态列表 -> 加成统计 -> 实时属性 -> UI）
    await updateEnemyRealtimeStats();
    
  } catch (e) {
    console.error('[Debuff系统] 应用效果失败', e);
    logs.push('应用技能效果失败');
  }

  return logs;
}

/**
 * 回合结束时更新状态效果
 * 只负责减少剩余回合数，移除过期状态
 * 不修改任何属性值
 */
async function updateStatusEffectsFromMvu(): Promise<string[]> {
  const logs: string[] = [];

  try {
    if (typeof Mvu === 'undefined') return logs;

    const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData?.stat_data) return logs;

    // 处理玩家状态
    const playerStatusList = _.get(mvuData.stat_data, '临时状态.状态列表', {}) as Record<string, any>;
    const updatedPlayerStatus: Record<string, any> = {};
    
    for (const [statusKey, statusData] of Object.entries(playerStatusList)) {
      if (typeof statusData !== 'object' || statusData === null) continue;
      
      const currentDuration = statusData.剩余回合 || 0;
      const newDuration = currentDuration - 1;
      
      if (newDuration > 0) {
        updatedPlayerStatus[statusKey] = { ...statusData, 剩余回合: newDuration };
      } else {
        const effectType = statusKey.split('_')[0];
        logs.push(`${player.value.name} 的 ${getEffectTypeName(effectType)} 效果消失了`);
        console.info(`[Debuff系统] 玩家状态过期: ${statusKey}`);
      }
    }
    _.set(mvuData.stat_data, '临时状态.状态列表', updatedPlayerStatus);

    // 处理对手状态
    const enemyStatusList = _.get(mvuData.stat_data, '性斗系统.对手临时状态.状态列表', {}) as Record<string, any>;
    const updatedEnemyStatus: Record<string, any> = {};
    
    for (const [statusKey, statusData] of Object.entries(enemyStatusList)) {
      if (typeof statusData !== 'object' || statusData === null) continue;
      
      const currentDuration = statusData.剩余回合 || 0;
      const newDuration = currentDuration - 1;
      
      if (newDuration > 0) {
        updatedEnemyStatus[statusKey] = { ...statusData, 剩余回合: newDuration };
      } else {
        const effectType = statusKey.split('_')[0];
        logs.push(`${enemy.value.name} 的 ${getEffectTypeName(effectType)} 效果消失了`);
        console.info(`[Debuff系统] 对手状态过期: ${statusKey}`);
      }
    }
    _.set(mvuData.stat_data, '性斗系统.对手临时状态.状态列表', updatedEnemyStatus);

    await Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
    
    // 状态变化后更新对手实时属性
    await updateEnemyRealtimeStats();
    
  } catch (e) {
    console.error('[Debuff系统] 更新状态失败', e);
  }

  return logs;
}

// 获取效果类型的中文名称
function getEffectTypeName(effectType: string): string {
  const names: Record<string, string> = {
    性斗力: '性斗力',
    忍耐力: '忍耐力',
    魅力: '魅力',
    幸运: '幸运',
    闪避率: '闪避率',
    暴击率: '暴击率',
    束缚: '束缚',
  };
  return names[effectType] || effectType;
}

// 从状态列表中动态计算加成总和（符合 mvuSchema.ts 设计：加成统计由代码实时计算）
function calculateBonusFromStatusList(statusList: Record<string, any>): Record<string, number> {
  const totalBonus: Record<string, number> = {
    魅力加成: 0,
    幸运加成: 0,
    基础性斗力加成: 0,
    基础性斗力成算: 0,
    基础忍耐力加成: 0,
    基础忍耐力成算: 0,
    闪避率加成: 0,
    暴击率加成: 0,
  };
  
  for (const [_statusKey, statusData] of Object.entries(statusList)) {
    if (typeof statusData === 'object' && statusData !== null) {
      const bonus = (statusData as any).加成 || {};
      for (const [key, value] of Object.entries(bonus)) {
        if (typeof value === 'number' && key in totalBonus) {
          totalBonus[key] += value;
        }
      }
    }
  }
  
  return totalBonus;
}

/**
 * 更新对手实时属性到 MVU 和 UI
 * 流程：状态列表 -> 计算加成统计 -> 写入加成统计 -> 基础属性+加成统计=实时属性 -> 写入实时属性 -> 同步UI
 */
async function updateEnemyRealtimeStats(): Promise<void> {
  try {
    if (typeof Mvu === 'undefined') return;
    
    const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData?.stat_data) return;
    
    const data = mvuData.stat_data;
    
    // 1. 从状态列表计算加成统计
    const enemyStatusList = _.get(data, '性斗系统.对手临时状态.状态列表', {});
    const enemyTempBonus = calculateBonusFromStatusList(enemyStatusList);
    
    // 2. 写入加成统计到 MVU
    _.set(data, '性斗系统.对手临时状态.加成统计', enemyTempBonus);
    
    // 3. 读取基础属性
    const baseCharm = _.get(data, '性斗系统.对手魅力', 0);
    const baseLuck = _.get(data, '性斗系统.对手幸运', 0);
    const baseEvasion = _.get(data, '性斗系统.对手闪避率', 0);
    const baseCrit = _.get(data, '性斗系统.对手暴击率', 0);
    const baseSexPower = _.get(data, '性斗系统.对手性斗力', 0);
    const baseEndurance = _.get(data, '性斗系统.对手忍耐力', 0);
    
    // 4. 计算实时属性 = 基础属性 + 加成统计
    const realtimeCharm = Math.max(0, baseCharm + (enemyTempBonus.魅力加成 || 0));
    const realtimeLuck = Math.max(0, baseLuck + (enemyTempBonus.幸运加成 || 0));
    const realtimeEvasion = Math.min(60, Math.max(0, baseEvasion + (enemyTempBonus.闪避率加成 || 0)));
    const realtimeCrit = Math.min(100, Math.max(0, baseCrit + (enemyTempBonus.暴击率加成 || 0)));
    
    // 性斗力和忍耐力支持百分比加成
    const sexPowerBonus = enemyTempBonus.基础性斗力加成 || 0;
    const sexPowerMultiplier = (enemyTempBonus.基础性斗力成算 || 0) / 100;
    const realtimeSexPower = Math.max(0, Math.round((baseSexPower + sexPowerBonus) * (1 + sexPowerMultiplier)));
    
    const enduranceBonus = enemyTempBonus.基础忍耐力加成 || 0;
    const enduranceMultiplier = (enemyTempBonus.基础忍耐力成算 || 0) / 100;
    const realtimeEndurance = Math.max(0, Math.round((baseEndurance + enduranceBonus) * (1 + enduranceMultiplier)));
    
    // 5. 写入实时属性到 MVU
    _.set(data, '性斗系统.对手实时魅力', realtimeCharm);
    _.set(data, '性斗系统.对手实时幸运', realtimeLuck);
    _.set(data, '性斗系统.对手实时闪避率', realtimeEvasion);
    _.set(data, '性斗系统.对手实时暴击率', realtimeCrit);
    _.set(data, '性斗系统.对手实时性斗力', realtimeSexPower);
    _.set(data, '性斗系统.对手实时忍耐力', realtimeEndurance);
    
    await Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
    
    // 6. 同步更新 UI（从实时属性读取）
    enemy.value.stats.charm = realtimeCharm;
    enemy.value.stats.luck = realtimeLuck;
    enemy.value.stats.evasion = realtimeEvasion;
    enemy.value.stats.crit = realtimeCrit;
    enemy.value.stats.sexPower = realtimeSexPower;
    enemy.value.stats.baseEndurance = realtimeEndurance;
    
    console.info(`[Debuff系统] 对手实时属性已更新 - 性斗力:${baseSexPower}->${realtimeSexPower}, 忍耐力:${baseEndurance}->${realtimeEndurance}`);
  } catch (e) {
    console.error('[Debuff系统] 更新对手实时属性失败', e);
  }
}

/**
 * 重新读取 MVU 中的状态，更新 UI 显示
 * 玩家：从临时/永久/装备加成计算
 * 对手：调用 updateEnemyRealtimeStats 更新
 */
async function reloadStatusFromMvu() {
  try {
    if (typeof Mvu === 'undefined') return;

    const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData?.stat_data) return;

    const data = mvuData.stat_data;

    // === 玩家属性计算 ===
    const playerStatusList = _.get(data, '临时状态.状态列表', {});
    const playerTempBonus = calculateBonusFromStatusList(playerStatusList);
    const playerPermBonus = _.get(data, '永久状态.加成统计', {});
    const playerEquipBonus = _.get(data, '物品系统.装备总加成', {});
    
    // 写入玩家的临时状态加成统计
    _.set(data, '临时状态.加成统计', playerTempBonus);

    // 玩家性斗力
    const playerBaseSexPower = _.get(data, '核心状态.$基础性斗力', 10);
    const playerSexPowerBonus = (playerTempBonus.基础性斗力加成 || 0) + (playerPermBonus.基础性斗力加成 || 0) + (playerEquipBonus.基础性斗力加成 || 0);
    const playerSexPowerMultiplier = ((playerTempBonus.基础性斗力成算 || 0) + (playerPermBonus.基础性斗力成算 || 0) + (playerEquipBonus.基础性斗力成算 || 0)) / 100;
    const calculatedSexPower = Math.max(0, Math.round((playerBaseSexPower + playerSexPowerBonus) * (1 + playerSexPowerMultiplier)));
    player.value.stats.sexPower = calculatedSexPower;
    
    // 玩家忍耐力
    const playerBaseEndurance = _.get(data, '核心状态.$基础忍耐力', 10);
    const playerEnduranceBonus = (playerTempBonus.基础忍耐力加成 || 0) + (playerPermBonus.基础忍耐力加成 || 0) + (playerEquipBonus.基础忍耐力加成 || 0);
    const playerEnduranceMultiplier = ((playerTempBonus.基础忍耐力成算 || 0) + (playerPermBonus.基础忍耐力成算 || 0) + (playerEquipBonus.基础忍耐力成算 || 0)) / 100;
    const calculatedEndurance = Math.max(0, Math.round((playerBaseEndurance + playerEnduranceBonus) * (1 + playerEnduranceMultiplier)));
    player.value.stats.baseEndurance = calculatedEndurance;
    
    // 写入玩家实时值
    _.set(data, '性斗系统.实时性斗力', calculatedSexPower);
    _.set(data, '性斗系统.实时忍耐力', calculatedEndurance);

    // 玩家其他属性
    player.value.stats.charm = _.get(data, '核心状态.$基础魅力', 10) + (playerTempBonus.魅力加成 || 0) + (playerPermBonus.魅力加成 || 0) + (playerEquipBonus.魅力加成 || 0);
    player.value.stats.luck = _.get(data, '核心状态.$基础幸运', 10) + (playerTempBonus.幸运加成 || 0) + (playerPermBonus.幸运加成 || 0) + (playerEquipBonus.幸运加成 || 0);
    player.value.stats.evasion = Math.min(60, Math.max(0, _.get(data, '核心状态.$基础闪避率', 0) + (playerTempBonus.闪避率加成 || 0) + (playerPermBonus.闪避率加成 || 0) + (playerEquipBonus.闪避率加成 || 0)));
    player.value.stats.crit = Math.min(100, Math.max(0, _.get(data, '核心状态.$基础暴击率', 0) + (playerTempBonus.暴击率加成 || 0) + (playerPermBonus.暴击率加成 || 0) + (playerEquipBonus.暴击率加成 || 0)));

    // 快感和高潮次数
    player.value.stats.currentPleasure = _.get(data, '核心状态.$快感', 0);
    player.value.stats.maxPleasure = _.get(data, '核心状态.$最大快感', 100);
    player.value.stats.climaxCount = _.get(data, '性斗系统.高潮次数', 0);
    
    enemy.value.stats.currentPleasure = _.get(data, '性斗系统.对手快感', 0);
    enemy.value.stats.maxPleasure = _.get(data, '性斗系统.对手最大快感', 100);
    enemy.value.stats.climaxCount = _.get(data, '性斗系统.对手高潮次数', 0);

    await Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
    
    // === 对手属性计算（调用专用函数）===
    await updateEnemyRealtimeStats();
    
  } catch (e) {
    console.error('[战斗界面] 重新读取状态失败', e);
  }
}

// 触发战斗特效
function triggerEffect(type: 'critical' | 'dodge' | 'climax' | 'victory' | 'defeat') {
  effectType.value = type;
  showEffect.value = true;
  setTimeout(() => {
    showEffect.value = false;
    setTimeout(() => {
      effectType.value = null;
    }, 300);
  }, 1500);
}

// 初始化性斗系统数据（战斗结束后调用）
async function initializeCombatSystem() {
  try {
    if (typeof Mvu === 'undefined') return;

    const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData) return;

    // 初始化性斗系统数据
    _.set(mvuData.stat_data, '性斗系统.当前回合', 0);
    _.set(mvuData.stat_data, '性斗系统.行动日志', {});
    _.set(mvuData.stat_data, '性斗系统.对手技能冷却', {});
    _.set(mvuData.stat_data, '性斗系统.战斗物品', {});

    // 清空对手数据（可选，根据需求决定是否清空）
    // _.set(mvuData.stat_data, '性斗系统.对手名称', '');
    // _.set(mvuData.stat_data, '性斗系统.对手性斗力', 0);
    // ...

    await Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
    console.info('[战斗界面] 已初始化性斗系统数据');
    
    // 重置BOSS状态
    if (BossSystem.bossState.isBossFight) {
      BossSystem.resetBossState();
      isBossItemsDisabled.value = false;
      isBossSurrenderDisabled.value = false;
      console.info('[战斗界面] BOSS状态已重置');
    }
  } catch (e) {
    console.error('[战斗界面] 初始化性斗系统数据失败', e);
  }
}

// 清空临时状态（战斗结束后调用）
async function clearTemporaryStatus() {
  try {
    if (typeof Mvu === 'undefined') {
      return;
    }

    const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData) {
      return;
    }

    // 清空玩家的临时状态（已移除意志力加成）
    _.set(mvuData.stat_data, '临时状态.状态列表', {});
    _.set(mvuData.stat_data, '临时状态.加成统计', {
      魅力加成: 0,
      幸运加成: 0,
      基础性斗力加成: 0,
      基础性斗力成算: 0,
      基础忍耐力加成: 0,
      基础忍耐力成算: 0,
      闪避率加成: 0,
      暴击率加成: 0,
    });

    // 清空对手的临时状态（已移除意志力加成）
    _.set(mvuData.stat_data, '性斗系统.对手临时状态.状态列表', {});
    _.set(mvuData.stat_data, '性斗系统.对手临时状态.加成统计', {
      魅力加成: 0,
      幸运加成: 0,
      基础性斗力加成: 0,
      基础性斗力成算: 0,
      基础忍耐力加成: 0,
      基础忍耐力成算: 0,
      闪避率加成: 0,
      暴击率加成: 0,
    });

    // 清空束缚状态
    playerBoundTurns.value = 0;
    enemyBoundTurns.value = 0;
    playerBindSource.value = null;
    enemyBindSource.value = null;

    // 保存到MVU
    await Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
    addLog('临时状态已清空', 'system', 'info');
  } catch (e) {
    console.error('[战斗界面] 清空临时状态失败', e);
  }
}

function addLog(message: string, source: string, type: CombatLogEntry['type'] = 'info') {
  const logEntry: CombatLogEntry = {
    id: Math.random().toString(36).substr(2, 9),
    turn: turnState.currentTurn,
    message,
    source,
    type,
  };
  logs.value.push(logEntry);

  // 同时异步写入MVU的行动日志（不阻塞UI）
  (async () => {
    try {
      if (typeof Mvu !== 'undefined') {
        const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
        if (mvuData) {
          const logKey = `回合${turnState.currentTurn}_${Date.now()}`;
          const logValue = `[${logEntry.turn}] ${
            logEntry.source === 'player' ? player.value.name : logEntry.source === 'enemy' ? enemy.value.name : '系统'
          }: ${logEntry.message}`;

          const currentLogs = _.get(mvuData.stat_data, '性斗系统.行动日志', {});
          const updatedLogs = { ...currentLogs, [logKey]: logValue };
          _.set(mvuData.stat_data, '性斗系统.行动日志', updatedLogs);

          // 异步保存，不阻塞UI
          await Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
        }
      }
    } catch (e) {
      console.warn('[战斗界面] 写入行动日志失败', e);
    }
  })();
}

function cloneCharacter(char: Character): Character {
  return {
    ...char,
    stats: { ...char.stats },
    skills: char.skills.map(s => ({ ...s })),
    items: char.items.map(i => ({ ...i })),
    statusEffects: [...char.statusEffects],
  };
}

function getPhaseText(phase: TurnState['phase']): string {
  const texts: Record<TurnState['phase'], string> = {
    playerInput: '玩家回合',
    processing: '结算中',
    enemyAction: '敌方行动',
    victory: '胜利',
    defeat: '败北',
    climaxResolution: '高潮处理',
  };
  return texts[phase];
}

function isSkillDisabled(skill: Skill): boolean {
  return skill.currentCooldown > 0 || player.value.stats.currentEndurance < skill.cost;
}

// ================= 战斗逻辑 =================
function determineEnemyIntention() {
  // 从对手的技能中随机选择一项，显示在预告中
  // 从 性斗系统.对手可用技能 中随机选取一个没有冷却的技能

  if (enemy.value.skills.length === 0) {
    console.warn('[战斗界面] 敌人没有可用技能');
    turnState.enemyIntention = null;
    return;
  }

  // 过滤掉无效的技能（必须有ID和名称）
  const validSkills = enemy.value.skills.filter(s => {
    // 技能必须有ID和名称
    if (!s.id || !s.name) {
      console.warn('[战斗界面] 发现无效技能:', s);
      return false;
    }
    return true;
  });

  if (validSkills.length === 0) {
    console.warn('[战斗界面] 没有有效的敌人技能');
    turnState.enemyIntention = null;
    return;
  }

  // 优先选择不在冷却中的技能
  const availableSkills = validSkills.filter(s => s.currentCooldown === 0);
  const skillsToChoose = availableSkills.length > 0 ? availableSkills : validSkills;

  if (skillsToChoose.length === 0) {
    console.warn('[战斗界面] 没有可选择的技能');
    turnState.enemyIntention = null;
    return;
  }

  const skill = skillsToChoose[Math.floor(Math.random() * skillsToChoose.length)];
  console.info('[战斗界面] 选择预告技能:', skill.name, 'ID:', skill.id);
  turnState.enemyIntention = skill;
}

function handlePlayerSkill(skill: Skill) {
  if (turnState.phase !== 'playerInput') return;

  // 注意：敌人束缚的递减在敌人回合开始时处理（handleEnemyTurn），不在这里处理

  // 检查是否被束缚
  if (playerBoundTurns.value > 0) {
    addLog(`${player.value.name} 被束缚了，无法使用技能！剩余 ${playerBoundTurns.value} 回合`, 'system', 'warn');
    return;
  }

  // 检查体力是否足够
  if (player.value.stats.currentEndurance < skill.cost) {
    addLog('体力不足，无法使用技能！', 'system', 'warn');
    return;
  }

  if (isSkillDisabled(skill)) {
    addLog(skill.currentCooldown > 0 ? '技能冷却中！' : '耐力不足！', 'system', 'info');
    return;
  }

  turnState.phase = 'processing';
  const nextPlayer = cloneCharacter(player.value);
  const nextEnemy = cloneCharacter(enemy.value);

  // 消耗体力
  nextPlayer.stats.currentEndurance -= skill.cost;
  addLog(`${nextPlayer.name} 消耗了 ${skill.cost} 点体力`, 'system', 'info');

  // 设置冷却
  const skillIndex = nextPlayer.skills.findIndex(s => s.id === skill.id);
  if (skillIndex !== -1) {
    nextPlayer.skills[skillIndex].currentCooldown = skill.cooldown;
    if (skill.cooldown > 0) {
      addLog(`${skill.name} 进入冷却，冷却时间 ${skill.cooldown} 回合`, 'system', 'info');
    }
  }

  // 使用新的战斗计算系统
  import('./combatCalculator').then(async ({ executeAttack, applySkillBuffs }) => {
    try {
      // 检查技能数据是否存在
      if (!skill.data) {
        addLog(`技能 ${skill.name} 的数据不存在，无法使用`, 'system', 'error');
        turnState.phase = 'playerInput';
        return;
      }

      const result = executeAttack(nextPlayer, nextEnemy, skill.data, true); // 玩家攻击敌人，启用等级压制

      // 记录战斗日志
      addLog(`${nextPlayer.name} 使用了 ${skill.name}！`, 'player', 'info');

      if (result.isDodged) {
        addLog(`${nextEnemy.name} 闪避了所有攻击！`, 'system', 'info');
        triggerEffect('dodge');
      } else {
        // 输出详细的伤害计算过程（包括连击日志）
        console.info('[战斗界面] 玩家攻击 - result.logs:', result.logs);
        if (result.logs && result.logs.length > 0) {
          result.logs.forEach(log => {
            addLog(log, 'system', 'info');
          });
        } else {
          console.warn('[战斗界面] 玩家攻击 - result.logs 为空或未定义');
        }

        // 使用totalDamage而不是actualDamage（连击总伤害）
        if (result.isCritical) {
          addLog(`暴击！总计造成 ${result.totalDamage} 点快感伤害！`, 'player', 'critical');
          triggerEffect('critical');
        } else {
          addLog(`总计造成 ${result.totalDamage} 点快感伤害`, 'player', 'damage');
        }

        // 应用伤害（结算快感）- 使用totalDamage
        const oldPleasure = nextEnemy.stats.currentPleasure;
        nextEnemy.stats.currentPleasure = Math.min(
          nextEnemy.stats.maxPleasure,
          nextEnemy.stats.currentPleasure + result.totalDamage,
        );
        addLog(`${nextEnemy.name} 的快感从 ${oldPleasure} 增加到 ${nextEnemy.stats.currentPleasure}`, 'system', 'info');

        // ========== 简化的束缚效果处理 ==========
        // 直接从MVU读取技能效果，检查是否有束缚
        try {
          if (typeof Mvu !== 'undefined') {
            const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
            if (mvuData?.stat_data) {
              const effectList = _.get(mvuData.stat_data, `技能系统.主动技能.${skill.id}.伤害与效果.效果列表`, {});
              for (const [, effect] of Object.entries(effectList)) {
                if (effect && typeof effect === 'object') {
                  const type = (effect as any)['效果类型'];
                  const dur = (effect as any)['持续回合数'] || 0;
                  const targetEnemy = (effect as any)['是否作用敌人'] !== false; // 默认true
                  if (type === '束缚' && dur > 0 && targetEnemy) {
                    // 检查是否是沐芯兰BOSS战，如果是则免疫束缚
                    if (BossSystem.bossState.isBossFight && BossSystem.bossState.bossId === 'muxinlan') {
                      const immuneDialogue = BossSystem.getBindImmuneDialogue(BossSystem.bossState.currentPhase);
                      if (immuneDialogue) {
                        BossSystem.queueDialogues([immuneDialogue]);
                      }
                      addLog(`${nextEnemy.name} 免疫了束缚效果！`, 'system', 'info');
                      console.info(`[束缚] 沐芯兰BOSS免疫束缚（玩家技能）`);
                    } else {
                      // 玩家使用技能，效果作用于敌人 -> 设置敌人束缚
                      enemyBoundTurns.value = dur;
                      enemyBindSource.value = 'player';
                      addLog(`${nextEnemy.name} 被束缚了 ${dur} 回合！`, 'system', 'info');
                    }
                  }
                }
              }
            }
          }
        } catch (e) {
          console.error('束缚效果处理失败', e);
        }

        // 应用其他buff/debuff效果（从MVU读取并写入状态列表）
        try {
          const effectLogs = await applySkillEffectsFromMvu(skill.id, true);
          effectLogs.forEach(log => addLog(log, 'system', 'info'));
        } catch (e) {
          console.error('[战斗界面] 应用技能效果失败', e);
        }
      }

      // 更新状态
      player.value = nextPlayer;
      enemy.value = nextEnemy;

      // 保存状态（先保存，确保高潮状态写入MVU）
      saveToMvu();

      // 检查是否高潮（在reloadStatusFromMvu之前检查，避免覆盖）
      if (nextEnemy.stats.currentPleasure >= nextEnemy.stats.maxPleasure && turnState.climaxTarget === null) {
        addLog(`${nextEnemy.name} 达到了快感上限！`, 'system', 'critical');
        // 自动继续，不显示按钮
        addLog(`${nextEnemy.name} 达到了高潮！ (过程略)`, 'system', 'info');
        triggerEffect('climax');
        await processClimaxAfterLLM(true);
      } else {
        // 没有高潮时，才重新读取状态加成
        await reloadStatusFromMvu();
        
        // 使用技能后，轮到对方结算快感
        addLog(`--- 轮到 ${nextEnemy.name} 行动 ---`, 'system', 'info');
        setTimeout(handleEnemyTurn, 1000);
      }
    } catch (e) {
      console.error('[战斗界面] 使用技能时出错', e);
      addLog('使用技能时出错', 'system', 'error');
      turnState.phase = 'playerInput';
    }
  });
}

async function handlePlayerItem(item: Item) {
  if (turnState.phase !== 'playerInput' || item.quantity <= 0) {
    if (item.quantity <= 0) {
      addLog(`${item.name} 数量不足，无法使用`, 'system', 'info');
    }
    return;
  }

  // 使用物品不结束回合，所以不需要设置processing状态
  const nextPlayer = cloneCharacter(player.value);
  const nextEnemy = cloneCharacter(enemy.value);

  const itemIndex = nextPlayer.items.findIndex(i => i.id === item.id);
  if (itemIndex > -1) {
    nextPlayer.items[itemIndex].quantity -= 1;
    addLog(
      `${nextPlayer.name} 使用了 ${item.name}，剩余数量：${nextPlayer.items[itemIndex].quantity}`,
      'system',
      'info',
    );
  }

  // ==================== 特殊道具：三好学生勋章（跳过沐芯兰第二阶段） ====================
  if (item.id === 'honor_medal_muxinlan') {
    if (!BossSystem.bossState.isBossFight || BossSystem.bossState.bossId !== 'muxinlan') {
      addLog('该道具只能在与沐芯兰的战斗中使用。', 'system', 'info');
      // 更新状态
      player.value = nextPlayer;
      enemy.value = nextEnemy;
      activeMenu.value = 'main';
      await saveToMvu();
      await reloadStatusFromMvu();
      return;
    }

    if (BossSystem.bossState.currentPhase !== 1) {
      addLog('该道具只能在沐芯兰第一阶段使用。', 'system', 'info');
      // 更新状态
      player.value = nextPlayer;
      enemy.value = nextEnemy;
      activeMenu.value = 'main';
      await saveToMvu();
      await reloadStatusFromMvu();
      return;
    }

    if (BossSystem.bossState.hasUsedMedal) {
      addLog('该道具已经使用过了。', 'system', 'info');
      // 更新状态
      player.value = nextPlayer;
      enemy.value = nextEnemy;
      activeMenu.value = 'main';
      await saveToMvu();
      await reloadStatusFromMvu();
      return;
    }

    const ok = BossSystem.useHonorMedal();
    if (ok) {
      addLog('你使用了【三好学生荣誉勋章】！沐芯兰的第二阶段将被跳过。', 'system', 'critical');
    } else {
      addLog('该道具使用失败。', 'system', 'info');
    }

    // 更新状态
    player.value = nextPlayer;
    enemy.value = nextEnemy;
    activeMenu.value = 'main';
    await saveToMvu();
    await reloadStatusFromMvu();
    addLog(`--- 继续 ${nextPlayer.name} 的回合 ---`, 'system', 'info');
    return;
  }

  // 应用物品效果
  const log = item.effect(nextPlayer, nextEnemy);
  addLog(log.message, log.source, log.type);

  // 记录属性变化
  if (item.staminaRestore) {
    addLog(
      `${nextPlayer.name} 的耐力变化：${player.value.stats.currentEndurance} → ${nextPlayer.stats.currentEndurance}`,
      'system',
      'info',
    );
  }
  if (item.pleasureReduce) {
    addLog(
      `${nextPlayer.name} 的快感变化：${player.value.stats.currentPleasure} → ${nextPlayer.stats.currentPleasure}`,
      'system',
      'info',
    );
  }

  // 更新状态
  player.value = nextPlayer;
  enemy.value = nextEnemy;

  // 如果物品有临时buff，写入MVU的临时状态
  if (item.bonuses && Object.keys(item.bonuses).length > 0 && typeof Mvu !== 'undefined') {
    const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (mvuData && mvuData.stat_data) {
      // 确保临时状态结构存在
      if (!mvuData.stat_data.临时状态) mvuData.stat_data.临时状态 = {};
      if (!mvuData.stat_data.临时状态.状态列表) mvuData.stat_data.临时状态.状态列表 = {};
      if (!mvuData.stat_data.临时状态.加成统计) mvuData.stat_data.临时状态.加成统计 = {};
      
      // 从描述中提取持续回合数
      const buffDesc = item.description?.match(/持续(\d+)回合/);
      const duration = buffDesc ? parseInt(buffDesc[1]) : 3;
      
      // 生成唯一的状态key
      let statusKey = item.name;
      let index = 1;
      while (mvuData.stat_data.临时状态.状态列表[statusKey]) {
        statusKey = `${item.name}_${index}`;
        index++;
      }
      
      // 写入临时状态.状态列表
      mvuData.stat_data.临时状态.状态列表[statusKey] = {
        加成: item.bonuses,
        剩余回合: duration,
      };
      
      // 更新加成统计（累加所有状态的加成）
      for (const [bonusKey, bonusValue] of Object.entries(item.bonuses)) {
        mvuData.stat_data.临时状态.加成统计[bonusKey] = 
          (mvuData.stat_data.临时状态.加成统计[bonusKey] || 0) + (bonusValue as number);
      }
      
      // 保存到MVU
      await Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
      
      addLog(`${item.name} 的增益效果已生效，持续 ${duration} 回合`, 'system', 'info');
    }
  }

  // 返回主菜单
  activeMenu.value = 'main';

  // 先保存物品使用后的状态到MVU（包括物品数量变化和快感/耐力变化）
  await saveToMvu();

  // 然后重新读取MVU中的临时状态加成，更新UI显示
  await reloadStatusFromMvu();

  addLog(`--- 继续 ${nextPlayer.name} 的回合 ---`, 'system', 'info');

  // 注意：使用物品不结束回合，玩家可以继续操作
  // 只有使用技能才会结束回合并轮到对方行动
}

function handleEnemyTurn() {
  turnState.phase = 'enemyAction';
  
  console.info(`[束缚系统] 敌人回合开始 - enemyBoundTurns=${enemyBoundTurns.value}, enemyBindSource=${enemyBindSource.value}`);

  // 敌人行动开始时，递减敌人施加的束缚效果
  if (playerBoundTurns.value > 0 && playerBindSource.value === 'enemy') {
    playerBoundTurns.value--;
    if (playerBoundTurns.value === 0) {
      addLog(`${player.value.name} 的束缚效果消失了`, 'system', 'info');
      playerBindSource.value = null;
    } else {
      addLog(`${player.value.name} 的束缚剩余 ${playerBoundTurns.value} 回合`, 'system', 'info');
    }
  }

  // 检查敌人是否被束缚（玩家施加的束缚）
  console.info(`[束缚系统] 检查敌人束缚状态 - enemyBoundTurns=${enemyBoundTurns.value}`);
  if (enemyBoundTurns.value > 0) {
    addLog(`${enemy.value.name} 被束缚了，无法行动！剩余 ${enemyBoundTurns.value} 回合`, 'system', 'info');
    // 递减束缚回合数
    enemyBoundTurns.value--;
    if (enemyBoundTurns.value === 0) {
      enemyBindSource.value = null;
      addLog(`${enemy.value.name} 的束缚效果消失了`, 'system', 'info');
    }
    endTurn();
    setTimeout(startNewTurn, 1000);
    return;
  }

  addLog(`${enemy.value.name} 开始行动...`, 'system', 'info');

  setTimeout(() => {
    // 使用预告的技能（如果预告存在且可用），否则随机选择
    if (!turnState.enemyIntention) {
      // 如果没有预告，随机选择一个技能
      determineEnemyIntention();
      addLog(`${enemy.value.name} 随机选择了技能`, 'system', 'info');
    }

    const nextPlayer = cloneCharacter(player.value);
    const nextEnemy = cloneCharacter(enemy.value);

    // 优先使用预告的技能
    let skill = nextEnemy.skills.find(s => s.id === turnState.enemyIntention?.id);

    // 如果预告的技能不在技能列表中或冷却中，随机选择一个可用技能
    if (!skill || skill.currentCooldown > 0) {
      const availableSkills = nextEnemy.skills.filter(s => s.currentCooldown === 0);
      if (availableSkills.length > 0) {
        skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
        addLog(`${nextEnemy.name} 的预告技能冷却中，改为使用 ${skill.name}`, 'system', 'info');
      } else {
        // 如果所有技能都在冷却，使用第一个技能（即使冷却中）
        skill = nextEnemy.skills[0];
        addLog(`${nextEnemy.name} 所有技能都在冷却，使用 ${skill.name}`, 'system', 'info');
      }
    }

    if (!skill) {
      addLog(`${nextEnemy.name} 没有可用技能`, 'system', 'info');
      endTurn();
      setTimeout(startNewTurn, 1000);
      return;
    }

    // 检查敌人体力是否足够（在构建技能数据之前检查）
    const skillCost = skill.data?.staminaCost || skill.cost || 0;
    if (nextEnemy.stats.currentEndurance < skillCost) {
      addLog(`${nextEnemy.name} 体力不足，无法使用 ${skill.name}！`, 'system', 'warn');
      endTurn();
      setTimeout(startNewTurn, 1000);
      return;
    }

    // 如果技能数据为null，从MVU重新构建
    if (!skill.data) {
      try {
        if (typeof Mvu !== 'undefined') {
          const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
          if (mvuData) {
            const mvuSkill = _.get(mvuData.stat_data, `性斗系统.对手可用技能.${skill.id}`, null);
            if (mvuSkill && mvuSkill.基本信息) {
              // 从MVU数据构建SkillData
              const damageInfo = mvuSkill.伤害与效果 || {};

              // 根据伤害来源和系数构建伤害公式
              const damageSource = damageInfo.伤害来源 || '性斗力';
              const coefficient = (damageInfo.系数 || 100) / 100; // 转换为小数（100% = 1.0）

              // 映射伤害来源到DamageSource枚举（字符串枚举，直接使用字符串值）
              let source: any;
              switch (damageSource) {
                case '性斗力':
                  source = 'sex_power'; // DamageSource.SEX_POWER
                  break;
                case '魅力':
                  source = 'charm'; // DamageSource.CHARM
                  break;
                case '幸运':
                  source = 'luck'; // DamageSource.LUCK
                  break;
                case '意志力':
                  source = 'willpower'; // DamageSource.WILLPOWER
                  break;
                case '固定值':
                  source = 'fixed'; // DamageSource.FIXED
                  break;
                default:
                  source = 'sex_power';
              }

              // 构建伤害公式组件
              const damageFormula = [
                {
                  source: source,
                  coefficient: coefficient,
                  baseValue: 0,
                },
              ];

              // 读取连击数、准确率、暴击修正
              const basicSkillData = {
                id: skill.id,
                name: mvuSkill.基本信息.技能名称 || skill.id,
                description: mvuSkill.基本信息.技能描述 || '',
                effectDescription: '',
                type: 'attack' as any,
                staminaCost: mvuSkill.冷却与消耗?.耐力消耗 || 0,
                cooldown: mvuSkill.冷却与消耗?.冷却回合数 || 0,
                castTime: 0,
                damageFormula: damageFormula,
                accuracy: damageInfo.基础命中率 || 100,
                critModifier: damageInfo.暴击修正 || 0,
                buffs: [],
                canBeReflected: false,
                hitCount: damageInfo.连击数 || 1,
                accuracyModifier: damageInfo.准确率 || 100,
              };
              skill.data = basicSkillData;
              console.info('[战斗界面] 从MVU重新构建敌人技能数据:', skill.name, '伤害公式:', damageFormula);
            }
          }
        }
      } catch (e) {
        console.error('[战斗界面] 重新构建技能数据失败', e);
      }
    }

    // 消耗敌人体力
    nextEnemy.stats.currentEndurance -= skillCost;
    addLog(`${nextEnemy.name} 消耗了 ${skillCost} 点体力`, 'system', 'info');

    // 设置冷却
    const skillIndex = nextEnemy.skills.findIndex(s => s.id === skill.id);
    if (skillIndex !== -1) {
      const cooldown = skill.data?.cooldown || skill.cooldown || 0;
      nextEnemy.skills[skillIndex].currentCooldown = cooldown;
      if (cooldown > 0) {
        addLog(`${skill.name} 进入冷却，冷却时间 ${cooldown} 回合`, 'system', 'info');
      }
    }

    // 使用新的战斗计算系统
    import('./combatCalculator').then(async ({ executeAttack, applySkillBuffs }) => {
      try {
        // 检查技能数据是否存在
        if (!skill.data) {
          addLog(`技能 ${skill.name} 的数据不存在，无法使用`, 'system', 'error');
          endTurn();
          setTimeout(startNewTurn, 1000);
          return;
        }

        const result = executeAttack(nextEnemy, nextPlayer, skill.data);
        
        // 调试日志：检查40%伤害上限是否生效
        const maxDamageCap = Math.floor(nextPlayer.stats.maxPleasure * 0.4);
        console.info(`[战斗界面] 敌人攻击玩家 - 玩家最大快感=${nextPlayer.stats.maxPleasure}, 40%上限=${maxDamageCap}, 总伤害=${result.totalDamage}`);

        // 记录战斗日志
        addLog(`${nextEnemy.name} 使用了 ${skill.name}！`, 'enemy', 'info');
        
        // BOSS战时：敌人使用技能后触发随机战斗对话
        if (BossSystem.bossState.isBossFight && BossSystem.bossState.bossId === 'muxinlan') {
          const battleDialogue = BossSystem.getRandomBattleDialogue(BossSystem.bossState.currentPhase);
          if (battleDialogue) {
            BossSystem.queueDialogues([battleDialogue]);
          }
        }

        if (result.isDodged) {
          addLog(`${nextPlayer.name} 闪避了所有攻击！`, 'system', 'info');
          triggerEffect('dodge');
        } else {
          // 输出详细的伤害计算过程（包括连击日志）
          console.info('[战斗界面] 敌人攻击 - result.logs:', result.logs);
          if (result.logs && result.logs.length > 0) {
            result.logs.forEach(log => {
              addLog(log, 'system', 'info');
            });
          } else {
            console.warn('[战斗界面] 敌人攻击 - result.logs 为空或未定义');
          }

          // 使用totalDamage而不是actualDamage（连击总伤害）
          if (result.isCritical) {
            addLog(`暴击！总计造成 ${result.totalDamage} 点快感伤害！`, 'enemy', 'critical');
            triggerEffect('critical');
          } else {
            addLog(`总计造成 ${result.totalDamage} 点快感伤害`, 'enemy', 'damage');
          }

          // 应用伤害（结算快感）- 使用totalDamage
          const oldPleasure = nextPlayer.stats.currentPleasure;
          nextPlayer.stats.currentPleasure = Math.min(
            nextPlayer.stats.maxPleasure,
            nextPlayer.stats.currentPleasure + result.totalDamage,
          );
          addLog(
            `${nextPlayer.name} 的快感从 ${oldPleasure} 增加到 ${nextPlayer.stats.currentPleasure}`,
            'system',
            'info',
          );

          // ========== 简化的束缚效果处理（敌人技能） ==========
          try {
            if (typeof Mvu !== 'undefined') {
              const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
              if (mvuData?.stat_data) {
                const effectList = _.get(mvuData.stat_data, `性斗系统.对手可用技能.${skill.id}.伤害与效果.效果列表`, {});
                for (const [, effect] of Object.entries(effectList)) {
                  if (effect && typeof effect === 'object') {
                    const type = (effect as any)['效果类型'];
                    const dur = (effect as any)['持续回合数'] || 0;
                    const targetEnemy = (effect as any)['是否作用敌人'] !== false;
                    if (type === '束缚' && dur > 0 && targetEnemy) {
                      // 敌人使用技能，效果作用于"敌人"（从敌人视角看是玩家）-> 设置玩家束缚
                      playerBoundTurns.value = dur;
                      playerBindSource.value = 'enemy';
                      addLog(`${nextPlayer.name} 被束缚了 ${dur} 回合！`, 'system', 'info');
                    }
                  }
                }
              }
            }
          } catch (e) {
            console.error('束缚效果处理失败', e);
          }

          // 应用其他buff效果（从MVU读取并写入状态列表）
          try {
            const effectLogs = await applySkillEffectsFromMvu(skill.id, false);
            effectLogs.forEach(log => addLog(log, 'system', 'info'));
          } catch (e) {
            console.error('[战斗界面] 应用技能效果失败', e);
            addLog('应用技能效果时出错，但战斗继续', 'system', 'info');
          }
        }

        // 更新状态
        player.value = nextPlayer;
        enemy.value = nextEnemy;

        // 保存状态（先保存，确保高潮状态写入MVU）
        saveToMvu();

        // 检查是否高潮（在reloadStatusFromMvu之前检查，避免覆盖）
        if (nextPlayer.stats.currentPleasure >= nextPlayer.stats.maxPleasure && turnState.climaxTarget === null) {
          addLog(`${nextPlayer.name} 达到了快感上限！`, 'system', 'critical');
          // 自动继续，不显示按钮
          addLog(`${nextPlayer.name} 达到了高潮！ (过程略)`, 'system', 'info');
          triggerEffect('climax');
          await processClimaxAfterLLM(false);
        } else {
          // 没有高潮时，才重新读取状态加成
          await reloadStatusFromMvu();
          
          // 对方执行完技能后，处理回合结束事务，然后进入下一回合
          endTurn();
          setTimeout(startNewTurn, 1000);
        }
      } catch (e) {
        console.error('[战斗界面] 敌人使用技能时出错', e);
        addLog('敌人使用技能时出错', 'system', 'error');
        endTurn();
        setTimeout(startNewTurn, 1000);
      }
    });
  }, 1000);
}

function startNewTurn() {
  turnState.currentTurn++;
  addLog(`--- 第 ${turnState.currentTurn} 回合开始 ---`, 'system', 'info');

  // 重置高潮目标标记
  turnState.climaxTarget = null;
  turnState.phase = 'playerInput';

  // 随机选择对方技能，进行预告
  determineEnemyIntention();
  if (turnState.enemyIntention) {
    addLog(`预告：${enemy.value.name} 准备使用 ${turnState.enemyIntention.name}`, 'system', 'info');
  }

  // 回合开始回复（双方各回复 3+最大耐力*0.03 点体力，向上取整）
  const playerRecovery = Math.ceil(3 + player.value.stats.maxEndurance * 0.03);
  const oldPlayerEndurance = player.value.stats.currentEndurance;
  player.value.stats.currentEndurance = Math.min(
    player.value.stats.maxEndurance,
    player.value.stats.currentEndurance + playerRecovery,
  );
  if (player.value.stats.currentEndurance > oldPlayerEndurance) {
    addLog(
      `${player.value.name} 回复了 ${player.value.stats.currentEndurance - oldPlayerEndurance} 点体力`,
      'system',
      'info',
    );
  }

  const enemyRecovery = Math.ceil(3 + enemy.value.stats.maxEndurance * 0.03);
  const oldEnemyEndurance = enemy.value.stats.currentEndurance;
  enemy.value.stats.currentEndurance = Math.min(
    enemy.value.stats.maxEndurance,
    enemy.value.stats.currentEndurance + enemyRecovery,
  );
  if (enemy.value.stats.currentEndurance > oldEnemyEndurance) {
    addLog(
      `${enemy.value.name} 回复了 ${enemy.value.stats.currentEndurance - oldEnemyEndurance} 点体力`,
      'system',
      'info',
    );
  }

  // 冷却递减
  player.value.skills.forEach(s => {
    if (s.currentCooldown > 0) {
      s.currentCooldown--;
      if (s.currentCooldown === 0) {
        addLog(`${s.name} 冷却完成`, 'system', 'info');
      }
    }
  });
  enemy.value.skills.forEach(s => {
    if (s.currentCooldown > 0) {
      s.currentCooldown--;
    }
  });

  // 更新状态效果（从MVU读取并更新）
  updateStatusEffectsFromMvu().then(async logs => {
    logs.forEach(log => addLog(log, 'system', 'info'));
    // 重新读取MVU中的临时状态加成，更新UI显示
    await reloadStatusFromMvu();
  });

  // 束缚回合数现在在专门的endTurn函数中处理

  addLog(`--- ${player.value.name} 的回合 ---`, 'system', 'info');
  saveToMvu();
}

// 处理回合结束时的事务
function endTurn() {
  // 束缚回合数在尝试行动时递减，不在这里处理
}

// 收集战斗日志文本（过滤掉冗余信息）
function collectCombatLogs(): string {
  const filteredLogs = logs.value.filter(log => {
    const message = log.message;

    // 保留玩家和敌人使用的技能
    if ((log.source === 'player' || log.source === 'enemy') && message.includes('使用了')) {
      return true;
    }

    // 保留闪避动作
    if (message.includes('闪避了攻击')) {
      return true;
    }

    // 保留暴击动作
    if (message.includes('暴击！')) {
      return true;
    }

    // 保留造成的伤害（包括暴击）
    if (message.includes('造成') && (message.includes('伤害') || message.includes('暴击'))) {
      return true;
    }

    // 保留快感变动
    if (message.includes('的快感从')) {
      return true;
    }

    // 保留"轮到XX行动"
    if (message.includes('轮到') && message.includes('行动')) {
      return true;
    }

    // 保留束缚效果
    if (message.includes('被束缚了') && message.includes('无法行动')) {
      return true;
    }

    // 保留投降动作
    if (message.includes('选择了投降') || message.includes('不能逃跑')) {
      return true;
    }

    // 保留达到快感上限
    if (message.includes('达到快感上限')) {
      return true;
    }

    // 保留达到高潮
    if (message.includes('达到高潮')) {
      return true;
    }

    // 保留高潮次数
    if (message.includes('高潮次数')) {
      return true;
    }

    // 保留败北/胜利消息
    if (message.includes('败北') || message.includes('胜利') || message.includes('崩溃')) {
      return true;
    }

    // 过滤掉预告技能
    if (message.includes('预告')) {
      return false;
    }

    // 过滤掉状态变化
    if (message.includes('进入了贤者时间状态') || message.includes('进入虚脱状态') ||
        message.includes('性斗力降低') || message.includes('性斗力提升') || 
        message.includes('忍耐力降低') || message.includes('忍耐力提升') ||
        message.includes('耐力降低') || message.includes('耐力提升')) {
      return false;
    }

    // 过滤掉其他系统消息
    return false;
  });

  // 格式化日志，去掉回合号和"系统："前缀
  const logTexts = filteredLogs.map(log => {
    if (log.source === 'player') {
      return `${player.value.name}: ${log.message}`;
    } else if (log.source === 'enemy') {
      return `${enemy.value.name}: ${log.message}`;
    } else {
      // 系统消息，直接显示消息内容，不显示"系统："
      return log.message;
    }
  });

  return logTexts.join('\n');
}

// 选择并显示CG
function selectAndDisplayCG() {
  console.log('[战斗界面] ========================================');
  console.log('[战斗界面] selectAndDisplayCG 函数被调用');
  console.log('[战斗界面] 当前战斗阶段:', turnState.phase);
  console.log('[战斗界面] ========================================');
  
  try {
    // 获取玩家性别
    const globalAny = window as any;
    let playerGender: '男' | '女' = '男';
    
    console.log('[战斗界面] 检查Mvu是否可用:', typeof Mvu !== 'undefined');
    
    if (typeof Mvu !== 'undefined') {
      const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
      console.log('[战斗界面] MVU数据获取成功:', !!mvuData);
      console.log('[战斗界面] MVU stat_data存在:', !!mvuData?.stat_data);
      
      if (mvuData && mvuData.stat_data) {
        const gender = _.get(mvuData.stat_data, '角色基础.性别', '男');
        console.log('[战斗界面] 从MVU读取的性别值:', gender);
        playerGender = gender === '男' ? '男' : '女';
        console.log('[战斗界面] 处理后的性别:', playerGender);
      }
    } else {
      console.warn('[战斗界面] Mvu未定义，使用默认性别');
    }
    
    // 判断胜负
    const isVictory = turnState.phase === 'victory';
    console.log('[战斗界面] 是否胜利:', isVictory);
    
    // 获取对手名称
    const enemyName = enemy.value.name;
    console.log('[战斗界面] 对手名称:', enemyName);
    
    console.log('[战斗界面] 准备调用selectCGEvent，参数:', {
      enemyName,
      playerGender,
      isVictory
    });
    
    // 选择CG事件
    const cgResult = selectCGEvent(enemyName, playerGender, isVictory);
    
    console.log('[战斗界面] selectCGEvent返回结果:', cgResult);
    
    if (cgResult) {
      cgImageUrl.value = cgResult.imageUrl;
      cgDescription.value = cgResult.description;
      console.log('[战斗界面] ✓ CG已设置');
      console.log('[战斗界面]   - 事件名称:', cgResult.event.name);
      console.log('[战斗界面]   - 图片URL:', cgResult.imageUrl);
      console.log('[战斗界面]   - 描述:', cgResult.description);
      console.log('[战斗界面]   - cgImageUrl.value:', cgImageUrl.value);
      console.log('[战斗界面]   - cgDescription.value:', cgDescription.value);
    } else {
      cgImageUrl.value = null;
      cgDescription.value = '';
      console.warn('[战斗界面] ✗ 未找到匹配的CG，已清空CG状态');
    }
  } catch (e) {
    console.error('[战斗界面] ✗✗✗ 选择CG时发生异常 ✗✗✗');
    console.error('[战斗界面] 异常详情:', e);
    console.error('[战斗界面] 异常堆栈:', (e as Error).stack);
    cgImageUrl.value = null;
    cgDescription.value = '';
  }
  
  console.log('[战斗界面] ========================================');
  console.log('[战斗界面] selectAndDisplayCG 函数执行完毕');
  console.log('[战斗界面] 最终 cgImageUrl.value:', cgImageUrl.value);
  console.log('[战斗界面] 最终 cgDescription.value:', cgDescription.value);
  console.log('[战斗界面] ========================================');
}

// 处理CG图片加载错误
function handleCGImageError() {
  console.warn('[战斗界面] CG图片加载失败:', cgImageUrl.value);
  cgImageUrl.value = null;
}

// 发送战斗日志给LLM生成过程描述
async function sendCombatLogToLLM(context: string) {
  try {
    const combatLogText = collectCombatLogs();
    const totalTurns = turnState.currentTurn;

    // 判断是胜利还是失败
    const isVictory = turnState.phase === 'victory';
    const resultText = isVictory ? '胜利' : '战败';
    const contextText = isVictory ? '调教/羞辱场景' : '被调教场景';

    // 构建完整的提示词（包含CG描述）
    let fullPrompt = `请根据以下战斗日志生成${resultText}剧情\n[战斗日志]\n${combatLogText}\n共${totalTurns}回合。\n请根据以上性斗过程，生成一段性斗时的剧情描写（${contextText}）。`;
    
    // 如果有CG描述，添加到提示词中
    if (cgDescription.value) {
      fullPrompt += `\n${cgDescription.value}`;
    }

    // 先发送战斗日志文本到聊天中显示（作为用户消息）
    if (typeof createChatMessages === 'function') {
      await createChatMessages([
        {
          role: 'user',
          message: fullPrompt,
        },
      ]);
    }

    // 发送给LLM生成
    if (typeof generate === 'function') {
      addLog('正在生成过程描述...', 'system', 'info');
      const generatedText = await generate({ user_input: fullPrompt });

      // 将生成的内容发送到聊天（作为AI助手消息）
      if (typeof createChatMessages === 'function') {
        await createChatMessages([
          {
            role: 'assistant',
            message: `[战斗过程] ${generatedText}`,
          },
        ]);

        // 只触发一次AI回复（移除重复触发）
        // 注意：createChatMessages 已经会触发AI回复，所以不需要再调用 triggerSlash
        addLog('已将过程描述发送给LLM，等待AI回复...', 'system', 'info');
      }
    } else {
      console.warn('[战斗界面] generate函数不可用');
      addLog('无法生成过程描述，generate函数不可用', 'system', 'warn');

      // 如果 generate 不可用，直接触发一次AI回复
      if (typeof triggerSlash === 'function') {
        await triggerSlash('/trigger');
      }
    }
  } catch (e) {
    console.error('[战斗界面] 发送日志给LLM失败', e);
    addLog('发送日志给LLM失败', 'system', 'error');
  }
}

// 处理发送战斗日志（用于胜负结算）
async function handleSendCombatLogToLLM() {
  const context = turnState.phase === 'victory' ? '获得胜利' : turnState.phase === 'defeat' ? '败北' : '战斗结束';
  await sendCombatLogToLLM(context);

  // 战斗结算机制：玩家当前快感减半，耐力增加最大耐力的20%
  try {
    if (typeof Mvu !== 'undefined') {
      const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
      if (mvuData && mvuData.stat_data) {
        // 获取当前数值
        const currentPleasure = _.get(mvuData.stat_data, '核心状态.$快感', 0);
        const maxStamina = _.get(mvuData.stat_data, '核心状态.$最大耐力', 100);
        const currentStamina = _.get(mvuData.stat_data, '核心状态.$耐力', 0);
        
        // 计算新数值
        const newPleasure = Math.floor(currentPleasure / 2); // 快感减半
        const staminaIncrease = Math.floor(maxStamina * 0.2); // 耐力增加最大耐力的20%
        const newStamina = Math.min(maxStamina, currentStamina + staminaIncrease); // 不超过最大耐力
        
        // 更新MVU变量
        _.set(mvuData.stat_data, '核心状态.$快感', newPleasure);
        _.set(mvuData.stat_data, '核心状态.$耐力', newStamina);
        
        // 保存到MVU
        await Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
        
        // 添加结算日志
        addLog(`战斗结算：快感 ${currentPleasure} → ${newPleasure} (减半)`, 'system', 'info');
        addLog(`战斗结算：耐力 ${currentStamina} → ${newStamina} (+${staminaIncrease})`, 'system', 'info');
        addLog('战斗结算完成', 'system', 'info');
        
        console.info(`[战斗结算] 快感: ${currentPleasure} → ${newPleasure}, 耐力: ${currentStamina} → ${newStamina} (+${staminaIncrease})`);
      }
    }
  } catch (e) {
    console.error('[战斗界面] 战斗结算失败', e);
    addLog('战斗结算时出错，但战斗记录已发送', 'system', 'error');
  }

  // 清空战斗日志
  logs.value = [];

  // 清空MVU中的行动日志
  try {
    if (typeof Mvu !== 'undefined') {
      const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
      if (mvuData) {
        _.set(mvuData.stat_data, '性斗系统.行动日志', {});
        await Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
      }
    }
  } catch (e) {
    console.warn('[战斗界面] 清空行动日志失败', e);
  }
}

// ==================== BOSS阶段切换处理 ====================
// 步骤1：锁血并立即换图
function lockHealthAndChangeAvatar(nextPhase: 1 | 2 | 3) {
  const currentPhase = BossSystem.bossState.currentPhase;
  console.info(`[战斗界面] BOSS阶段切换开始: ${currentPhase} -> ${nextPhase}`);
  
  // 锁血：快感设为最大值-1，防止触发高潮
  enemy.value.stats.currentPleasure = enemy.value.stats.maxPleasure - 1;
  
  // 立即更立绘和名称
  const newDisplayName = BossSystem.getMuxinlanDisplayName(nextPhase);
  const newAvatarUrl = BossSystem.getMuxinlanAvatarUrl(nextPhase);
  enemy.value.name = newDisplayName;
  enemy.value.avatarUrl = newAvatarUrl;
  
  // 设置转换状态
  isPhaseTransitioning.value = true;
  phaseTransitionEffect.value = currentPhase === 1 ? 'phase1to2' : 'phase2to3';
  
  // 1.5秒后自动清除特效（冲击波动画完成后）
  setTimeout(() => {
    phaseTransitionEffect.value = null;
  }, 1500);
  
  console.info(`[战斗界面] 已锁血并更换立绘: ${newDisplayName}`);
}

// 步骤3：执行转阶段逻辑（在文字播放完成后调用）
async function executePhaseTransitionLogic(nextPhase: 1 | 2 | 3) {
  const currentPhase = BossSystem.bossState.currentPhase;
  console.info(`[战斗界面] 执行阶段转换逻辑: ${currentPhase} -> ${nextPhase}`);
  
  // 执行阶段转换（更新BOSS状态）
  BossSystem.executePhaseTransition(nextPhase);
  
  // 获取新阶段的配置
  const newDisplayName = BossSystem.getMuxinlanDisplayName(nextPhase);
  const newClimaxLimit = BossSystem.BOSS_CONFIG.muxinlan.climaxLimits[nextPhase - 1];
  const newDataKey = BossSystem.getMuxinlanDataKey(nextPhase);
  
  // 添加阶段切换日志
  addLog(`【阶段切换】${enemy.value.name} 进入了新形态！`, 'system', 'critical');
  
  // 从数据库加载新阶段的敌人数据
  try {
    const { enemyDbModule, enemySkillDbModule } = await loadDatabaseModules();
    const newEnemyData = enemyDbModule.getEnemyMvuData(newDataKey);
    
    if (newEnemyData) {
      // 更新敌人显示名称和立绘
      enemy.value.name = newDisplayName;
      enemy.value.avatarUrl = BossSystem.getMuxinlanAvatarUrl(nextPhase);
      
      // 更新敌人属性
      enemy.value.stats.level = newEnemyData.对手等级;
      enemy.value.stats.charm = newEnemyData.对手魅力;
      enemy.value.stats.luck = newEnemyData.对手幸运;
      enemy.value.stats.evasion = Math.min(60, newEnemyData.对手闪避率);
      enemy.value.stats.crit = newEnemyData.对手暴击率;
      enemy.value.stats.maxEndurance = newEnemyData.对手最大耐力;
      enemy.value.stats.currentEndurance = newEnemyData.对手耐力;
      enemy.value.stats.maxPleasure = newEnemyData.对手最大快感;
      enemy.value.stats.currentPleasure = 0; // 新阶段快感重置
      enemy.value.stats.climaxCount = 0; // 新阶段高潮次数重置
      enemy.value.stats.sexPower = newEnemyData.对手性斗力;
      enemy.value.stats.baseEndurance = newEnemyData.对手忍耐力;
      
      // 更新高潮次数上限（双方共享）
      enemy.value.stats.maxClimaxCount = newClimaxLimit;
      player.value.stats.maxClimaxCount = newClimaxLimit;
      
      // 加载新阶段的技能
      const newSkills = enemySkillDbModule.getEnemySkills(newDataKey, newDataKey);
      if (newSkills && newSkills.length > 0) {
        // 更新UI中的技能列表
        enemy.value.skills = newSkills.map((skill: any) => ({
          id: skill.id,
          name: skill.name,
          description: skill.effectDescription || skill.description,
          cost: skill.staminaCost,
          type: skill.type,
          cooldown: skill.cooldown,
          currentCooldown: 0,
          data: skill,
        }));
        console.info(`[战斗界面] 加载新阶段技能:`, newSkills.map((s: any) => s.name));
        
        // 同时写入MVU的对手可用技能
        if (typeof Mvu !== 'undefined') {
          const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
          if (mvuData?.stat_data) {
            // 清空旧技能
            _.set(mvuData.stat_data, '性斗系统.对手可用技能', {});
            
            // 写入新技能（使用convertToMvuSkillFormat保持格式一致）
            const mvuSkills: Record<string, any> = {};
            newSkills.forEach((skill: any) => {
              mvuSkills[skill.id] = enemySkillDbModule.convertToMvuSkillFormat(skill);
            });
            _.set(mvuData.stat_data, '性斗系统.对手可用技能', mvuSkills);
            
            // 重置技能冷却
            _.set(mvuData.stat_data, '性斗系统.对手技能冷却', {});
            
            await Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
            console.info(`[战斗界面] 新阶段技能已写入MVU:`, newSkills.map((s: any) => s.id));
          }
        }
      }
      
      // 更新MVU数据
      if (typeof Mvu !== 'undefined') {
        const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
        if (mvuData?.stat_data) {
          _.set(mvuData.stat_data, '性斗系统.对手名称', newDisplayName);
          _.set(mvuData.stat_data, '性斗系统.胜负规则.高潮次数上限', newClimaxLimit);
          _.set(mvuData.stat_data, '性斗系统.对手等级', newEnemyData.对手等级);
          _.set(mvuData.stat_data, '性斗系统.对手魅力', newEnemyData.对手魅力);
          _.set(mvuData.stat_data, '性斗系统.对手幸运', newEnemyData.对手幸运);
          _.set(mvuData.stat_data, '性斗系统.对手闪避率', newEnemyData.对手闪避率);
          _.set(mvuData.stat_data, '性斗系统.对手暴击率', newEnemyData.对手暴击率);
          _.set(mvuData.stat_data, '性斗系统.对手耐力', newEnemyData.对手耐力);
          _.set(mvuData.stat_data, '性斗系统.对手最大耐力', newEnemyData.对手最大耐力);
          _.set(mvuData.stat_data, '性斗系统.对手快感', 0);
          _.set(mvuData.stat_data, '性斗系统.对手最大快感', newEnemyData.对手最大快感);
          _.set(mvuData.stat_data, '性斗系统.对手高潮次数', 0);
          _.set(mvuData.stat_data, '性斗系统.对手性斗力', newEnemyData.对手性斗力);
          _.set(mvuData.stat_data, '性斗系统.对手忍耐力', newEnemyData.对手忍耐力);
          _.set(mvuData.stat_data, '性斗系统.对手实时性斗力', newEnemyData.对手性斗力);
          _.set(mvuData.stat_data, '性斗系统.对手实时忍耐力', newEnemyData.对手忍耐力);
          _.set(mvuData.stat_data, '性斗系统.对手实时魅力', newEnemyData.对手魅力);
          _.set(mvuData.stat_data, '性斗系统.对手实时幸运', newEnemyData.对手幸运);
          _.set(mvuData.stat_data, '性斗系统.对手实时闪避率', newEnemyData.对手闪避率);
          _.set(mvuData.stat_data, '性斗系统.对手实时暴击率', newEnemyData.对手暴击率);
          await Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
        }
      }
      
      // 添加阶段特定效果和禁用
      if (nextPhase === 2) {
        // 第二阶段：禁用物品和投降，并施加封印效果
        isBossItemsDisabled.value = true;
        isBossSurrenderDisabled.value = true;
        // 延迟执行封印动画
        setTimeout(() => {
          castSealEffect(['.menu-card:has(svg[data-icon="package"])', 'button:has-text("投降")']);
        }, 500);
        addLog(`【警告】物品背包和投降按钮已被禁用！`, 'system', 'critical');
      } else if (nextPhase === 3) {
        // 第三阶段：解除禁用和封印效果
        isBossItemsDisabled.value = false;
        isBossSurrenderDisabled.value = false;
        removeSealEffect(['.menu-card:has(svg[data-icon="package"])', 'button:has-text("投降")']);
        addLog(`【提示】禁用效果已解除，可以正常使用物品和投降（啊你真的会在这个阶段投降吗？）`, 'system', 'info');
      }
    }
  } catch (e) {
    console.error('[战斗界面] BOSS阶段切换失败', e);
  }
  
  // 完成阶段转换
  BossSystem.completePhaseTransition();
  
  // 清除转换状态和特效
  isPhaseTransitioning.value = false;
  phaseTransitionEffect.value = null;
  
  // 重置回合状态，继续战斗
  turnState.phase = 'playerInput';
  addLog(`阶段切换完成，继续战斗...`, 'system', 'info');
}

// 完整的阶段转换流程（协调三个步骤）
async function handleBossPhaseTransition(nextPhase: 1 | 2 | 3) {
  const currentPhase = BossSystem.bossState.currentPhase;
  
  // 步骤1：锁血+换图（立即执行）
  lockHealthAndChangeAvatar(nextPhase);
  
  // 步骤2：播放锁血对话 + 转阶段对话（使用bossSystem.ts的对话系统）
  // 先播放lockHp对话，再播放phase_to对话
  const allDialogues: BossSystem.BossDialogue[] = [];
  
  // 添加锁血对话
  const lockHpDialogues = BossSystem.getPhaseDialogues(currentPhase, 'lockHp');
  if (lockHpDialogues) {
    allDialogues.push(...lockHpDialogues);
  }
  
  // 添加转阶段对话
  const transitionDialogues = BossSystem.getPhaseDialogues(currentPhase, 'transition');
  if (transitionDialogues) {
    allDialogues.push(...transitionDialogues);
  }
  
  // 播放所有对话
  if (allDialogues.length > 0) {
    BossSystem.queueDialogues(allDialogues);
  }
  
  // 步骤3：等待对话播放完成后执行转阶段逻辑
  // 计算等待时间：每句对话2.5秒
  const waitTime = allDialogues.length * 2500 + 500; // 额外500ms缓冲
  
  setTimeout(async () => {
    await executePhaseTransitionLogic(nextPhase);
  }, waitTime);
}

// 处理高潮后的逻辑（自动继续，不显示按钮）
async function processClimaxAfterLLM(targetIsEnemy: boolean) {
  // 防止重复调用：如果已经在处理高潮，则直接返回
  if (turnState.climaxTarget !== null) {
    console.warn('[战斗界面] 高潮处理已在进行中，跳过重复调用');
    return;
  }

  const char = targetIsEnemy ? enemy.value : player.value;
  
  // 再次检查快感是否真的达到最大值（防止重复触发）
  if (char.stats.currentPleasure < char.stats.maxPleasure) {
    console.warn('[战斗界面] 快感未达到最大值，跳过高潮处理');
    return;
  }

  // 立即设置climaxTarget，防止重复调用
  turnState.climaxTarget = targetIsEnemy ? 'enemy' : 'player';
  
  // ==================== BOSS锁血和阶段切换检测 ====================
  // 必须在增加高潮次数之前检测，以实现锁血效果
  if (targetIsEnemy && BossSystem.bossState.isBossFight && BossSystem.bossState.bossId === 'muxinlan') {
    const currentPhase = BossSystem.bossState.currentPhase;
    const currentClimaxCount = enemy.value.stats.climaxCount;
    
    // 检查是否应该触发阶段转换
    const transitionCheck = BossSystem.shouldTransitionPhase(
      char.stats.currentPleasure,
      char.stats.maxPleasure,
      currentClimaxCount,
      currentPhase
    );
    
    if (transitionCheck.shouldTransition) {
      // 触发阶段转换（锁血对话和转阶段对话已在handleBossPhaseTransition中统一处理）
      await handleBossPhaseTransition(transitionCheck.nextPhase);
      // 阶段转换后，重置快感但不增加高潮次数（锁血效果）
      enemy.value.stats.currentPleasure = 0;
      turnState.climaxTarget = null;
      saveToMvu();
      return;
    }
  }

  // 直接修改stats对象，不使用cloneCharacter（确保Vue响应式更新）
  if (targetIsEnemy) {
    enemy.value.stats.currentPleasure = 0;
    enemy.value.stats.climaxCount += 1;
    addLog(`${enemy.value.name} 的高潮次数：${enemy.value.stats.climaxCount}/${enemy.value.stats.maxClimaxCount}`, 'system', 'info');
  } else {
    player.value.stats.currentPleasure = 0;
    player.value.stats.climaxCount += 1;
    addLog(`${player.value.name} 的高潮次数：${player.value.stats.climaxCount}/${player.value.stats.maxClimaxCount}`, 'system', 'info');
  }

  // 保存状态到MVU
  saveToMvu();

  // 检查并记录贤者时间状态
  try {
    if (typeof Mvu !== 'undefined') {
      const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
      if (mvuData?.stat_data) {
        const tempStates = mvuData.stat_data.临时状态?.状态列表 || {};
        if ('贤者时间' in tempStates) {
          addLog(`${char.name} 进入了贤者时间状态（持续${tempStates.贤者时间}回合）`, 'system', 'info');
          addLog(`${char.name} 的性斗力降低20%，忍耐力提升10%`, 'system', 'info');
        }
        
        // 检查虚脱状态
        const orgasmCount = _.get(mvuData.stat_data, '性斗系统.高潮次数', 0);
        const maxOrgasmCount = _.get(mvuData.stat_data, '性斗系统.胜负规则.高潮次数上限', 0);
        if (maxOrgasmCount > 0 && orgasmCount >= maxOrgasmCount) {
          addLog(`${char.name} 达到了高潮次数上限，进入虚脱状态！`, 'system', 'critical');
          addLog(`${char.name} 的耐力降低30%`, 'system', 'critical');
        }
      }
    }
  } catch (e) {
    console.warn('[战斗界面] 检查状态变化失败', e);
  }

  // 检查是否达到最大高潮次数（胜负判定）
  if (targetIsEnemy && enemy.value.stats.climaxCount >= enemy.value.stats.maxClimaxCount) {
    turnState.phase = 'victory';
    addLog(`${enemy.value.name} 达到了最大高潮次数！战斗胜利！共${turnState.currentTurn}回合。`, 'system', 'critical');
    triggerEffect('victory');
    selectAndDisplayCG(); // 选择并显示CG
    await clearTemporaryStatus();
    await initializeCombatSystem();
    saveToMvu();
    return;
  }
  
  if (!targetIsEnemy && player.value.stats.climaxCount >= player.value.stats.maxClimaxCount) {
    turnState.phase = 'defeat';
    addLog(`${player.value.name} 达到了最大高潮次数... 败北，共${turnState.currentTurn}回合。`, 'system', 'damage');
    triggerEffect('defeat');
    selectAndDisplayCG(); // 选择并显示CG
    await clearTemporaryStatus();
    await initializeCombatSystem();
    saveToMvu();
    return;
  }

  // 高潮后继续战斗，进入下一回合
  addLog(`高潮结束，战斗继续...`, 'system', 'info');
  setTimeout(() => {
    turnState.climaxTarget = null;
    endTurn();
    startNewTurn();
  }, 1500);
}

function handleSkipTurn() {
  if (turnState.phase !== 'playerInput') {
    return;
  }

  // 被束缚时也可以跳过回合
  if (playerBoundTurns.value > 0) {
    addLog(`${player.value.name} 被束缚了，跳过回合`, 'system', 'warn');
  } else {
    addLog(`${player.value.name} 选择了跳过回合`, 'system', 'info');
  }

  // 跳过回合，直接轮到对方行动
  turnState.phase = 'processing';
  setTimeout(handleEnemyTurn, 1000);
}

function openPlayerPortraitPicker() {
  if (!playerPortraitInput.value) {
    return;
  }
  playerPortraitInput.value.click();
}

function handlePlayerPortraitSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) {
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('图片文件过大，请选择小于 5MB 的图片');
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target?.result as string;
    if (base64) {
      savePlayerCustomAvatar(base64);
      // 强制触发响应式更新：创建新对象
      player.value = {
        ...player.value,
        avatarUrl: base64
      };
      console.info('[战斗界面] 玩家立绘已更新:', base64.substring(0, 50) + '...');
    }
    input.value = '';
  };
  reader.readAsDataURL(file);
}

async function handleSurrender() {
  // BOSS第二阶段禁用投降
  if (isBossSurrenderDisabled.value) {
    addLog('「逃跑？在女王面前...你以为你有这个资格吗？」', 'enemy', 'critical');
    return;
  }
  
  // allowSurrender为true时不可认输，false时允许认输
  if (allowSurrender.value) {
    addLog('不能逃跑！这是尊严之战！', 'system', 'info');
    return;
  }

  // 允许认输，结束战斗
  turnState.phase = 'defeat';
  addLog('你选择了投降...', 'system', 'info');
  addLog('--- 战斗结束 ---', 'system', 'info');
  selectAndDisplayCG(); // 选择并显示CG

  // 清空临时状态
  await clearTemporaryStatus();
  saveToMvu();
}

// ================= 状态监听 =================
watch(
  [
    () => player.value.stats.currentPleasure,
    () => player.value.stats.currentEndurance,
    () => enemy.value.stats.currentPleasure,
    () => enemy.value.stats.currentEndurance,
  ],
  () => {
    if (turnState.phase === 'climaxResolution' || turnState.phase === 'victory' || turnState.phase === 'defeat') return;

    // 检查高潮（自动处理，不显示按钮）
    // 注意：如果climaxTarget已经设置，说明正在处理高潮，跳过检查
    if (turnState.climaxTarget === null) {
      if (enemy.value.stats.currentPleasure >= enemy.value.stats.maxPleasure) {
        addLog(`${enemy.value.name} 达到了快感上限！`, 'system', 'critical');
        addLog(`${enemy.value.name} 达到了高潮！ (过程略)`, 'system', 'info');
        triggerEffect('climax');
        processClimaxAfterLLM(true);
        return;
      }
      if (player.value.stats.currentPleasure >= player.value.stats.maxPleasure) {
        addLog(`${player.value.name} 达到了快感上限！`, 'system', 'critical');
        addLog(`${player.value.name} 达到了高潮！ (过程略)`, 'system', 'info');
        triggerEffect('climax');
        processClimaxAfterLLM(false);
        return;
      }
    }
  },
);

// ================= 初始化 =================
onMounted(async () => {
  await loadFromMvu();

  // 确保玩家名字已设置
  const userName = getUserName();
  player.value.name = userName;

  // 重新计算所有属性（包括加成）
  await reloadStatusFromMvu();

  // 初始化粒子封印画布
  if (sealCanvas.value) {
    sealCanvas.value.width = window.innerWidth;
    sealCanvas.value.height = window.innerHeight;
  }

  addLog(`遭遇了 ${enemy.value.name} !`, 'system', 'info');

  // 随机选择对方技能，进行预告
  determineEnemyIntention();
  if (turnState.enemyIntention) {
    addLog(`预告：${enemy.value.name} 准备使用 ${turnState.enemyIntention.name}`, 'system', 'info');
  }

  addLog(`--- 战斗开始 ---`, 'system', 'info');
  addLog(`--- ${player.value.name} 的回合 ---`, 'system', 'info');
});
</script>

<style lang="scss" scoped>
.combat-wrapper {
  position: relative;
  min-height: 100vh;
  background: #09090b;
  font-family: 'Noto Sans SC', system-ui, sans-serif;
  color: #e2e8f0;
  overflow-x: hidden;
}

// ========== 顶部标题 ==========
.combat-header {
  position: relative;
  z-index: 20;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(to bottom, rgba(9, 9, 11, 0.95), transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.terminal-icon {
  color: #c084fc;
}

.title {
  font-size: 1.75rem;
  font-weight: 900;
  letter-spacing: -0.025em;
  background: linear-gradient(135deg, #c084fc, #f472b6, #fb7185);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(192, 132, 252, 0.5);
}

.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.turn-counter {
  font-size: 1.75rem;
  font-family: ui-monospace, monospace;
  font-weight: 900;
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 20px rgba(96, 165, 250, 0.5);
  letter-spacing: 0.05em;
}

.phase-indicator {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-weight: 600;
  margin-top: 0.25rem;
}

// ========== 战斗区域 ==========
.combat-arena {
  position: relative;
  z-index: 10;
  max-width: 72rem;
  margin: 0 auto;
  padding: 2rem 1rem;
  padding-bottom: 20rem;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  gap: 1rem;
  
  @media (max-width: 640px) {
    padding-bottom: 22rem;
  }
}

.vs-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.3;
  padding-top: 6rem;
  flex-shrink: 0;
  width: 10%;
}

.divider-line {
  height: 8rem;
  width: 1px;
  background: linear-gradient(to bottom, transparent, white, transparent);
}

.vs-text {
  margin: 1rem 0;
  font-weight: 900;
  font-size: 2rem;
  font-style: italic;
  font-family: ui-monospace, monospace;
  color: rgba(255, 255, 255, 0.5);
}

// ========== 底部操作区 ==========
.combat-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 30;
  background: linear-gradient(to top, rgba(9, 9, 11, 0.98), rgba(9, 9, 11, 0.85));
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(30px) saturate(180%);
  padding: 1rem 1.5rem 1.5rem;
  box-shadow:
    0 -20px 60px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;

  @media (max-width: 640px) {
    padding: 0.75rem 0.9rem 1rem;
  }
}

.footer-content {
  max-width: 72rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column-reverse;
  gap: 1rem;
}

@media (min-width: 1024px) {
  .footer-content {
    flex-direction: row;
  }
}

.log-section {
  width: 100%;
  flex: 0 0 30%;
  max-width: 18rem;
}

.action-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.tab-btn {
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 640px) {
    padding: 0.35rem 0.9rem;
    font-size: 0.7rem;
    letter-spacing: 0.06em;
  }

  &.active {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
    color: white;
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  }

  &:hover:not(.active) {
    color: white;
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
}

.tab-divider {
  height: 1px;
  width: 2rem;
  background: rgba(255, 255, 255, 0.2);
}

.action-hint {
  font-size: 0.75rem;
  color: #94a3b8;
}

.waiting-text {
  font-size: 0.875rem;
  color: #64748b;
  animation: pulse 2s ease-in-out infinite;
}

.action-grid {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.processing-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.05);

  span {
    color: rgba(255, 255, 255, 0.5);
    font-family: ui-monospace, monospace;
    letter-spacing: 0.1em;
  }
}

// ========== 菜单样式 ==========
.menu-main {
  display: flex;
  gap: 0.5rem;
  height: 100%;
  width: 100%;
}

.surrender-stack {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.portrait-upload-btn {
  width: 100%;
  text-transform: none;
}

.hidden-file-input {
  display: none;
}

.menu-skills,
.menu-items {
  display: flex;
  gap: 0.5rem;
  height: 100%;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;

  // Webkit浏览器滚动条样式
  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.menu-card {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.5rem 1rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  user-select: none;
  position: relative;

  @media (max-width: 640px) {
    gap: 0.5rem;
    padding: 1rem 0.65rem;
    border-radius: 0.9rem;
    font-size: 0.85rem;

    svg {
      width: 26px;
      height: 26px;
    }

    span {
      font-size: 0.8rem;
      line-height: 1.1;
    }
  }
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover::before {
    opacity: 1;
  }

  &:hover {
    transform: translateY(-4px) scale(1.02);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  }

  span {
    font-weight: 700;
    white-space: nowrap;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.9);
  }

  svg {
    transition: transform 0.3s;
  }

  &:hover svg {
    transform: scale(1.1) rotate(5deg);
  }
}

.icon-blue {
  color: #38bdf8;
}
.icon-green {
  color: #4ade80;
}
.icon-yellow {
  color: #fbbf24;
}
.icon-red {
  color: #f87171;
}

.skill-card,
.item-card {
  flex: 0 0 auto; // 不允许收缩，保持固定宽度
  min-width: 220px; // 增加最小宽度，确保内容可读
  max-width: 280px; // 设置最大宽度，避免过宽
  width: 220px; // 固定宽度
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  padding: 1rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &:hover:not(.disabled) {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.1) inset;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05));
  }

  &.disabled {
    opacity: 0.5;
    filter: grayscale(0.7);
    pointer-events: none;
    cursor: not-allowed;
  }
}

.cooldown-overlay {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(2px);

  svg {
    color: #38bdf8;
    margin-bottom: 0.25rem;
    animation: pulse 2s ease-in-out infinite;
  }
}

.cooldown-count {
  font-size: 1.5rem;
  font-weight: 900;
  color: white;
  letter-spacing: -0.05em;

  small {
    font-size: 0.625rem;
    margin-left: 2px;
    vertical-align: top;
    opacity: 0.6;
    font-weight: normal;
  }
}

.skill-header,
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.25rem;
}

.skill-name {
  font-weight: 700;
  font-size: 0.875rem;
  color: #38bdf8;
  overflow: hidden;
  text-overflow: ellipsis;

  &.skill-disabled {
    color: #94a3b8;
  }
}

.skill-cost {
  font-size: 0.625rem;
  font-family: ui-monospace, monospace;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  white-space: nowrap;

  &.cost-danger {
    background: rgba(239, 68, 68, 0.2);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }
}

.skill-desc,
.item-desc {
  font-size: 0.625rem;
  color: #94a3b8;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.skill-effect {
  margin-top: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 0.25rem;
  font-size: 0.625rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.effect-label {
  color: #94a3b8;
  font-weight: 500;
}

.effect-value {
  color: #38bdf8;
  font-weight: 600;
}

.skill-type {
  margin-top: 0.5rem;
  font-size: 0.625rem;
  text-transform: uppercase;
  font-weight: 700;
  color: #64748b;
  transition: color 0.2s;

  &.type-disabled {
    color: #475569;
  }
}

.item-name {
  font-weight: 700;
  font-size: 0.875rem;
  color: #4ade80;
}

.item-quantity {
  font-size: 0.625rem;
  font-family: ui-monospace, monospace;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  background: rgba(16, 185, 129, 0.4);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #bbf7d0;
}

.item-effect {
  margin-top: 0.25rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.625rem;
}

.effect-stamina {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 0.25rem;
  color: #4ade80;
  font-weight: 600;

  svg {
    width: 12px;
    height: 12px;
  }
}

.effect-pleasure {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  background: rgba(236, 72, 153, 0.15);
  border: 1px solid rgba(236, 72, 153, 0.3);
  border-radius: 0.25rem;
  color: #f472b6;
  font-weight: 600;

  svg {
    width: 12px;
    height: 12px;
  }
}

.back-btn {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  color: #cbd5e1;
  min-width: 60px;
  flex-shrink: 0; // 防止返回按钮被压缩
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0.75rem 1rem;

  &:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1));
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateX(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}

.empty-items {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.empty-text {
  color: #64748b;
  font-size: 0.875rem;
  text-align: center;
}

// ========== 高潮弹窗 ==========
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.3s ease;
}

.climax-modal {
  background: linear-gradient(to bottom, rgba(88, 28, 135, 0.9), black);
  border: 1px solid rgba(168, 85, 247, 0.5);
  border-radius: 1rem;
  padding: 2.5rem;
  max-width: 28rem;
  width: 100%;
  box-shadow: 0 0 50px rgba(168, 85, 247, 0.3);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.modal-bg-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.1;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23fff' fill-opacity='0.1'/%3E%3C/svg%3E");
  pointer-events: none;
}

.climax-icon {
  color: #ec4899;
  margin: 0 auto 1rem;
  animation: pulse 1.5s ease-in-out infinite;
}

.climax-title {
  font-size: 1.875rem;
  font-weight: 900;
  color: white;
  margin-bottom: 0.5rem;
  letter-spacing: -0.025em;
}

.climax-desc {
  color: #e9d5ff;
  margin-bottom: 2rem;
  font-size: 0.875rem;
}

.climax-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn {
  width: 100%;
  padding: 1rem;
  font-weight: 700;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.btn-process {
  background: linear-gradient(135deg, #db2777, #ec4899);
  color: white;
  box-shadow:
    0 8px 24px rgba(219, 39, 119, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.05em;

  &:hover {
    background: linear-gradient(135deg, #ec4899, #f472b6);
    transform: translateY(-2px);
    box-shadow:
      0 12px 32px rgba(219, 39, 119, 0.6),
      0 0 0 1px rgba(255, 255, 255, 0.2) inset;
  }

  &:active {
    transform: translateY(0);
  }
}

.btn-skip {
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.05);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
}

// ========== 结果遮罩 ==========
.result-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: max(20px, env(safe-area-inset-top, 0px)) 20px calc(20px + env(safe-area-inset-bottom, 0px)) 20px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  animation: fadeIn 0.3s ease;
}

.result-content {
  text-align: center;
  padding: 2.4rem 1.6rem;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(9, 9, 11, 0.98));
  border-radius: 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.8),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  backdrop-filter: blur(30px);
  max-width: 400px;
  width: 72%;
  position: relative;
  overflow: hidden;
  margin-top: 20px;
  margin-bottom: 20px;

  @media (min-height: 600px) {
    margin-top: max(40px, 10vh);
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.05), transparent 70%);
    pointer-events: none;
  }
}

.result-title {
  font-size: 4.5rem;
  font-weight: 900;
  margin-bottom: 1rem;
  letter-spacing: -0.05em;
  text-shadow: 0 0 40px currentColor;
  position: relative;
  z-index: 1;

  &.victory {
    background: linear-gradient(135deg, #fde047, #f59e0b, #f97316);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 20px rgba(253, 224, 71, 0.5));
  }

  &.defeat {
    background: linear-gradient(135deg, #94a3b8, #64748b, #475569);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 20px rgba(148, 163, 184, 0.3));
  }
}

.result-subtitle {
  font-size: 1.5rem;
  color: #cbd5e1;
  font-weight: 400;
  letter-spacing: 0.15em;
  margin-bottom: 2rem;
  text-transform: uppercase;
  position: relative;
  z-index: 1;
  opacity: 0.8;
}

.cg-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto 2rem;
  border-radius: 1rem;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 1;
  
  @media (max-width: 640px) {
    max-width: 100%;
    margin-bottom: 1.5rem;
  }
}

.cg-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
  background: rgba(0, 0, 0, 0.3);
}

.restart-btn {
  padding: 0.75rem 2rem;
  background: white;
  color: black;
  font-weight: 700;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
}

// ========== 动画 ==========
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// ========== BOSS文字特效样式 ==========
.boss-text-overlay {
  position: fixed;
  top: 35%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 60px;
  font-weight: 900;
  color: #ff1493;
  opacity: 0;
  pointer-events: none;
  z-index: 100;
  text-shadow: 0 0 20px #ff1493, 0 0 40px #dc143c, 2px 2px 0 #000;
  letter-spacing: 10px;
  font-family: "Courier New", monospace;
  
  &.active {
    animation: bossTextSlam 2.5s ease-out forwards;
  }
}

@keyframes bossTextSlam {
  0% {
    transform: translateX(-50%) scale(3);
    opacity: 0;
    filter: blur(10px);
  }
  30% {
    transform: translateX(-50%) scale(1);
    opacity: 1;
    filter: blur(0px);
  }
  70% {
    transform: translateX(-50%) scale(1);
    opacity: 1;
    filter: blur(0px);
  }
  80% {
    transform: translateX(-50%) scale(1);
    opacity: 0.8;
    filter: blur(2px);
  }
  85% {
    transform: translateX(-50%) scale(1);
    opacity: 0.5;
    filter: blur(5px);
  }
  90% {
    transform: translateX(-50%) scale(1);
    opacity: 0.2;
    filter: blur(8px);
  }
  100% {
    transform: translateX(-50%) scale(1);
    opacity: 0;
    filter: blur(10px);
  }
}

// ========== 粒子封印画布 ==========
.seal-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 50;
}

// ========== 封印效果（按钮暗淡） ==========
.is-sealed {
  filter: grayscale(1) brightness(0.3) contrast(1.2) !important;
  pointer-events: none !important;
  cursor: not-allowed !important;
  transition: filter 0.5s ease;
}

// ========== BOSS阶段转换特效 ==========
.phase-transition-effect {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 90;
  overflow: hidden;
}

// 闪光效果
.transition-flash {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.9) 0%, transparent 70%);
  animation: flashEffect 0.8s ease-out;
}

// 粒子效果
.transition-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.transition-particles .particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #ff1493;
  border-radius: 50%;
  box-shadow: 0 0 10px #ff1493, 0 0 20px #ff1493;
  left: var(--x);
  top: var(--y);
  animation: particleExplode 1.5s ease-out var(--delay) forwards;
}

// 冲击波效果
.transition-shockwave {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  margin: -50px 0 0 -50px;
  border: 3px solid #ff1493;
  border-radius: 50%;
  animation: shockwaveExpand 1.2s ease-out;
}

// 第一阶段转第二阶段特效（红粉色）
.phase-transition-effect.phase1to2 {
  .transition-flash {
    background: radial-gradient(circle at center, rgba(255, 20, 147, 0.8) 0%, transparent 70%);
  }
  
  .particle {
    background: #ff1493;
    box-shadow: 0 0 10px #ff1493, 0 0 20px #ff1493;
  }
  
  .transition-shockwave {
    border-color: #ff1493;
    box-shadow: 0 0 20px #ff1493, 0 0 40px #ff1493, inset 0 0 20px #ff1493;
  }
}

// 第二阶段转第三阶段特效（紫色）
.phase-transition-effect.phase2to3 {
  .transition-flash {
    background: radial-gradient(circle at center, rgba(138, 43, 226, 0.8) 0%, transparent 70%);
  }
  
  .particle {
    background: #8a2be2;
    box-shadow: 0 0 10px #8a2be2, 0 0 20px #8a2be2;
  }
  
  .transition-shockwave {
    border-color: #8a2be2;
    box-shadow: 0 0 20px #8a2be2, 0 0 40px #8a2be2, inset 0 0 20px #8a2be2;
  }
}

// 闪光动画
@keyframes flashEffect {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  30% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.5);
  }
}

// 粒子爆炸动画
@keyframes particleExplode {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(
      calc((var(--x) - 50%) * 2),
      calc((var(--y) - 50%) * 2)
    ) scale(0);
  }
}

// 冲击波扩散动画
@keyframes shockwaveExpand {
  0% {
    width: 100px;
    height: 100px;
    margin: -50px 0 0 -50px;
    opacity: 1;
  }
  100% {
    width: 2000px;
    height: 2000px;
    margin: -1000px 0 0 -1000px;
    opacity: 0;
  }
}
</style>
