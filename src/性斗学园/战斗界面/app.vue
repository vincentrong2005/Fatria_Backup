<template>
  <div class="combat-wrapper">
    <!-- 背景效果 -->
    <BackgroundAmbience />

    <!-- 顶部标题栏 -->
    <header class="combat-header">
      <div class="header-left">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="terminal-icon"><path d="m4 17 6-6-6-6"/><path d="M12 19h8"/></svg>
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

    <!-- 高潮处理弹窗 -->
    <Teleport to="body">
      <div v-if="turnState.phase === 'climaxResolution'" class="modal-overlay">
        <div class="climax-modal">
          <div class="modal-bg-pattern"></div>
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="climax-icon"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>
          <h2 class="climax-title">高潮降临</h2>
          <p class="climax-desc">
            {{ turnState.climaxTarget === 'enemy' ? enemy.name : player.name }} 已经达到了极限...
          </p>
          <div class="climax-actions">
            <button class="btn btn-process" @click="handleClimaxResolution('process')">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              输出过程
            </button>
            <button class="btn btn-skip" @click="handleClimaxResolution('skip')">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
              跳过过程
            </button>
          </div>
        </div>
      </div>
    </Teleport>

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
            <button
              class="tab-btn"
              :class="{ active: activeMenu === 'main' }"
              @click="activeMenu = 'main'"
            >行动</button>
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
            <div v-if="turnState.phase !== 'playerInput' && turnState.phase !== 'climaxResolution'" class="processing-overlay">
              <span>计算中...</span>
            </div>

            <Transition name="slide" mode="out-in">
              <!-- 主菜单 -->
              <div v-if="activeMenu === 'main'" key="main" class="menu-main">
                <Card hover @click="activeMenu = 'skills'" class="menu-card">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-blue"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="m16 16 4 4"/><path d="m19 21 2-2"/></svg>
                  <span>战斗技能</span>
                </Card>
                <Card hover @click="activeMenu = 'items'" class="menu-card">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-green"><path d="M4 20V10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
                  <span>物品背包</span>
                </Card>
                <Card hover @click="handleSurrender" class="menu-card">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-red"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                  <span>投降</span>
                </Card>
              </div>

              <!-- 技能菜单 -->
              <div v-else-if="activeMenu === 'skills'" key="skills" class="menu-skills">
                <Card
                  v-for="skill in player.skills"
                  :key="skill.id"
                  :hover="!isSkillDisabled(skill)"
                  @click="handlePlayerSkill(skill)"
                  class="skill-card"
                  :class="{ disabled: isSkillDisabled(skill) }"
                >
                  <div v-if="skill.currentCooldown > 0" class="cooldown-overlay">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span class="cooldown-count">{{ skill.currentCooldown }}<small>T</small></span>
                  </div>
                  <div class="skill-header">
                    <span class="skill-name" :class="{ 'skill-disabled': isSkillDisabled(skill) }">{{ skill.name }}</span>
                    <span class="skill-cost" :class="{ 'cost-danger': player.stats.currentEndurance < skill.cost }">{{ skill.cost }} SP</span>
                  </div>
                  <p class="skill-desc">{{ skill.description }}</p>
                  <div class="skill-type" :class="{ 'type-disabled': isSkillDisabled(skill) }">{{ skill.type }}</div>
                </Card>
                <button class="back-btn" @click="activeMenu = 'main'">返回</button>
              </div>

              <!-- 物品菜单 -->
              <div v-else-if="activeMenu === 'items'" key="items" class="menu-items">
                <Card
                  v-for="item in player.items"
                  :key="item.id"
                  :hover="item.quantity > 0"
                  @click="handlePlayerItem(item)"
                  class="item-card"
                  :class="{ disabled: item.quantity === 0 }"
                >
                  <div class="item-header">
                    <span class="item-name">{{ item.name }}</span>
                    <span class="item-quantity">x{{ item.quantity }}</span>
                  </div>
                  <p class="item-desc">{{ item.description }}</p>
                </Card>
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
            <button class="restart-btn" @click="handleRestart">重新开始</button>
          </div>
        </div>
      </Teleport>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import type { Character, Skill, Item, CombatLogEntry, TurnState } from './types';
import { createDefaultPlayer, createDefaultEnemy, CLIMAX_TEXTS } from './constants';
import { getEnemyByName } from './enemyDatabase';
import BackgroundAmbience from './components/BackgroundAmbience.vue';
import CharacterPanel from './components/CharacterPanel.vue';
import CombatLog from './components/CombatLog.vue';
import Card from './components/Card.vue';

// ================= 状态 =================
const player = ref<Character>(createDefaultPlayer());
const enemy = ref<Character>(createDefaultEnemy());
const turnState = reactive<TurnState>({
  currentTurn: 1,
  phase: 'playerInput',
  enemyIntention: null,
  climaxTarget: null
});
const logs = ref<CombatLogEntry[]>([]);
const activeMenu = ref<'main' | 'skills' | 'items'>('main');

// ================= MVU 集成 =================
async function loadFromMvu() {
  try {
    await waitGlobalInitialized('Mvu');
    const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData?.stat_data) return;

    const data = mvuData.stat_data;
    
    // 获取统一的高潮次数上限 (双方共享)
    const maxClimaxCount = _.get(data, '性斗系统.胜负规则.高潮次数上限', 3);
    
    // 同步玩家数据
    player.value.stats.maxEndurance = _.get(data, '核心状态._最大耐力', 100);
    player.value.stats.currentEndurance = _.get(data, '核心状态._耐力', 100);
    player.value.stats.maxPleasure = _.get(data, '核心状态._最大快感', 100);
    player.value.stats.currentPleasure = _.get(data, '核心状态._快感', 0);
    player.value.stats.willpower = _.get(data, '核心状态._意志力', 100);
    player.value.stats.charm = _.get(data, '核心状态._魅力', 10);
    player.value.stats.luck = _.get(data, '核心状态._幸运', 10);
    player.value.stats.evasion = _.get(data, '核心状态.$闪避率', 0);
    player.value.stats.crit = _.get(data, '核心状态.$暴击率', 0);
    player.value.stats.sexPower = _.get(data, '性斗系统.$实时性斗力', 25);
    player.value.stats.baseEndurance = _.get(data, '性斗系统.$实时忍耐力', 15);
    player.value.stats.climaxCount = _.get(data, '性斗系统.$高潮次数', 0);
    player.value.stats.maxClimaxCount = maxClimaxCount;

    // 加载玩家技能
    const availableSkills = _.get(data, '性斗系统.$可用技能', {});
    const skillIds = Object.keys(availableSkills);
    if (skillIds.length > 0) {
      const { getSkillById } = await import('./skillDatabase');
      player.value.skills = skillIds.map(skillId => {
        const skillData = getSkillById(skillId);
        if (!skillData) return null;
        
        // 获取技能当前冷却
        const currentCooldown = _.get(data, `性斗系统.$技能冷却.${skillId}`, 0);
        
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
      }).filter(skill => skill !== null);
      
      console.info('[战斗界面] 已加载玩家技能:', player.value.skills.map(s => s.name));
    }

    // 获取对手名称
    const enemyName = _.get(data, '性斗系统.对手名称', '');
    console.info('[战斗界面] 对手名称:', enemyName);

    // 从数据库加载敌人数据
    if (enemyName && enemyName !== '') {
      const loadedEnemy = getEnemyByName(enemyName);
      if (loadedEnemy) {
        enemy.value = loadedEnemy;
        console.info('[战斗界面] 已从数据库加载敌人:', enemyName);
        
        // 同步MVU中的对手数据到数据库加载的敌人
        const existingEndurance = _.get(data, '性斗系统.$对手耐力');
        const existingPleasure = _.get(data, '性斗系统.$对手快感');
        const existingClimaxCount = _.get(data, '性斗系统.$对手高潮次数');
        
        if (existingEndurance !== undefined) {
          enemy.value.stats.currentEndurance = existingEndurance;
        }
        if (existingPleasure !== undefined) {
          enemy.value.stats.currentPleasure = existingPleasure;
        }
        if (existingClimaxCount !== undefined) {
          enemy.value.stats.climaxCount = existingClimaxCount;
        }
        
        // 使用统一的高潮次数上限覆盖数据库中的值
        enemy.value.stats.maxClimaxCount = maxClimaxCount;

        // 加载敌人技能冷却
        const enemySkillCooldowns = _.get(data, '性斗系统.$对手技能冷却', {});
        enemy.value.skills.forEach(skill => {
          const cooldown = enemySkillCooldowns[skill.id];
          if (cooldown !== undefined) {
            skill.currentCooldown = cooldown;
          }
        });

        // 将数据库中的完整数据写回MVU
        await saveMvuEnemyData();
      } else {
        console.warn('[战斗界面] 数据库中未找到敌人:', enemyName, '，使用MVU数据');
        // 从MVU加载现有数据作为后备
        loadEnemyFromMvuData(data, maxClimaxCount);
      }
    } else {
      // 没有对手名称，使用MVU中的数据
      loadEnemyFromMvuData(data, maxClimaxCount);
    }

    // 同步回合数
    turnState.currentTurn = _.get(data, '性斗系统.$当前回合', 1);

    console.info('[战斗界面] 已从MVU加载数据');
  } catch (e) {
    console.warn('[战斗界面] MVU加载失败，使用默认数据', e);
  }
}

// 从MVU数据加载敌人（后备方案）
function loadEnemyFromMvuData(data: any, maxClimaxCount: number) {
  const enemyName = _.get(data, '性斗系统.对手名称', '风纪委员长');
  if (enemyName) enemy.value.name = enemyName;
  enemy.value.stats.maxEndurance = _.get(data, '性斗系统.$对手最大耐力', 150);
  enemy.value.stats.currentEndurance = _.get(data, '性斗系统.$对手耐力', 150);
  enemy.value.stats.maxPleasure = _.get(data, '性斗系统.$对手最大快感', 100);
  enemy.value.stats.currentPleasure = _.get(data, '性斗系统.$对手快感', 0);
  enemy.value.stats.climaxCount = _.get(data, '性斗系统.$对手高潮次数', 0);
  enemy.value.stats.maxClimaxCount = maxClimaxCount; // 使用统一的高潮次数上限
  enemy.value.stats.sexPower = _.get(data, '性斗系统.$对手性斗力', 20);
  enemy.value.stats.baseEndurance = _.get(data, '性斗系统.$对手忍耐力', 20);
  enemy.value.stats.charm = _.get(data, '性斗系统.$对手魅力', 10);
  enemy.value.stats.luck = _.get(data, '性斗系统.$对手幸运', 5);
  enemy.value.stats.evasion = _.get(data, '性斗系统.$对手闪避率', 5);
  enemy.value.stats.crit = _.get(data, '性斗系统.$对手暴击率', 10);
}

// 保存敌人完整数据到MVU
async function saveMvuEnemyData() {
  try {
    if (typeof Mvu === 'undefined') return;
    
    const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData) return;

    // 更新敌人的完整数据
    _.set(mvuData.stat_data, '性斗系统.对手名称', enemy.value.name);
    _.set(mvuData.stat_data, '性斗系统.$对手最大耐力', enemy.value.stats.maxEndurance);
    _.set(mvuData.stat_data, '性斗系统.$对手耐力', enemy.value.stats.currentEndurance);
    _.set(mvuData.stat_data, '性斗系统.$对手最大快感', enemy.value.stats.maxPleasure);
    _.set(mvuData.stat_data, '性斗系统.$对手快感', enemy.value.stats.currentPleasure);
    _.set(mvuData.stat_data, '性斗系统.$对手高潮次数', enemy.value.stats.climaxCount);
    _.set(mvuData.stat_data, '性斗系统.$对手性斗力', enemy.value.stats.sexPower);
    _.set(mvuData.stat_data, '性斗系统.$对手忍耐力', enemy.value.stats.baseEndurance);
    _.set(mvuData.stat_data, '性斗系统.$对手魅力', enemy.value.stats.charm);
    _.set(mvuData.stat_data, '性斗系统.$对手幸运', enemy.value.stats.luck);
    _.set(mvuData.stat_data, '性斗系统.$对手闪避率', enemy.value.stats.evasion);
    _.set(mvuData.stat_data, '性斗系统.$对手暴击率', enemy.value.stats.crit);

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

    // 保存玩家技能冷却
    const playerSkillCooldowns: Record<string, number> = {};
    player.value.skills.forEach(skill => {
      playerSkillCooldowns[skill.id] = skill.currentCooldown;
    });
    
    // 保存敌人技能冷却
    const enemySkillCooldowns: Record<string, number> = {};
    enemy.value.skills.forEach(skill => {
      enemySkillCooldowns[skill.id] = skill.currentCooldown;
    });

    const updates: Record<string, any> = {
      // 玩家数据
      '核心状态._耐力': player.value.stats.currentEndurance,
      '核心状态._快感': player.value.stats.currentPleasure,
      '性斗系统.$当前回合': turnState.currentTurn,
      '性斗系统.$高潮次数': player.value.stats.climaxCount,
      '性斗系统.$技能冷却': playerSkillCooldowns,
      
      // 敌人数据
      '性斗系统.对手名称': enemy.value.name,
      '性斗系统.$对手耐力': enemy.value.stats.currentEndurance,
      '性斗系统.$对手快感': enemy.value.stats.currentPleasure,
      '性斗系统.$对手高潮次数': enemy.value.stats.climaxCount,
      '性斗系统.$对手最大耐力': enemy.value.stats.maxEndurance,
      '性斗系统.$对手最大快感': enemy.value.stats.maxPleasure,
      '性斗系统.$对手性斗力': enemy.value.stats.sexPower,
      '性斗系统.$对手忍耐力': enemy.value.stats.baseEndurance,
      '性斗系统.$对手魅力': enemy.value.stats.charm,
      '性斗系统.$对手幸运': enemy.value.stats.luck,
      '性斗系统.$对手闪避率': enemy.value.stats.evasion,
      '性斗系统.$对手暴击率': enemy.value.stats.crit,
      '性斗系统.$对手技能冷却': enemySkillCooldowns,
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
function addLog(message: string, source: string, type: CombatLogEntry['type'] = 'info') {
  logs.value.push({
    id: Math.random().toString(36).substr(2, 9),
    turn: turnState.currentTurn,
    message,
    source,
    type
  });
}

function cloneCharacter(char: Character): Character {
  return {
    ...char,
    stats: { ...char.stats },
    skills: char.skills.map(s => ({ ...s })),
    items: char.items.map(i => ({ ...i })),
    statusEffects: [...char.statusEffects]
  };
}

function getPhaseText(phase: TurnState['phase']): string {
  const texts: Record<TurnState['phase'], string> = {
    playerInput: '玩家回合',
    processing: '结算中',
    enemyAction: '敌方行动',
    victory: '胜利',
    defeat: '败北',
    climaxResolution: '高潮处理'
  };
  return texts[phase];
}

function isSkillDisabled(skill: Skill): boolean {
  return skill.currentCooldown > 0 || player.value.stats.currentEndurance < skill.cost;
}

// ================= 战斗逻辑 =================
function determineEnemyIntention() {
  const skill = enemy.value.skills[Math.floor(Math.random() * enemy.value.skills.length)];
  turnState.enemyIntention = skill;
}

function handlePlayerSkill(skill: Skill) {
  if (turnState.phase !== 'playerInput') return;
  if (isSkillDisabled(skill)) {
    addLog(skill.currentCooldown > 0 ? '技能冷却中！' : '耐力不足！', 'system', 'info');
    return;
  }

  turnState.phase = 'processing';
  const nextPlayer = cloneCharacter(player.value);
  const nextEnemy = cloneCharacter(enemy.value);

  // 消耗耐力
  nextPlayer.stats.currentEndurance -= skill.cost;
  
  // 设置冷却
  const skillIndex = nextPlayer.skills.findIndex(s => s.id === skill.id);
  if (skillIndex !== -1) {
    nextPlayer.skills[skillIndex].currentCooldown = skill.cooldown;
  }

  // 使用新的战斗计算系统
  import('./combatCalculator').then(({ executeAttack, applySkillBuffs }) => {
    const result = executeAttack(nextPlayer, nextEnemy, skill.data);
    
    // 记录战斗日志
    addLog(`${nextPlayer.name} 使用了 ${skill.name}！`, 'player', 'info');
    
    if (result.isDodged) {
      addLog(`${nextEnemy.name} 闪避了攻击！`, 'system', 'info');
    } else {
      if (result.isCritical) {
        addLog(`暴击！造成 ${result.actualDamage} 点快感伤害！`, 'player', 'critical');
      } else {
        addLog(`造成 ${result.actualDamage} 点快感伤害`, 'player', 'damage');
      }
      
      // 应用伤害
      nextEnemy.stats.currentPleasure = Math.min(
        nextEnemy.stats.maxPleasure,
        nextEnemy.stats.currentPleasure + result.actualDamage
      );
      
      // 应用buff效果
      const buffLogs = applySkillBuffs(nextEnemy, skill.data);
      buffLogs.forEach(log => addLog(log, 'system', 'info'));
    }

    // 更新状态
    player.value = nextPlayer;
    enemy.value = nextEnemy;

    // 检查是否高潮
    if (nextEnemy.stats.currentPleasure >= nextEnemy.stats.maxPleasure) {
      turnState.climaxTarget = 'enemy';
      turnState.phase = 'climaxResolution';
    } else {
      setTimeout(handleEnemyTurn, 1000);
    }
  });
}

function handlePlayerItem(item: Item) {
  if (turnState.phase !== 'playerInput' || item.quantity <= 0) return;

  turnState.phase = 'processing';
  const nextPlayer = cloneCharacter(player.value);
  const nextEnemy = cloneCharacter(enemy.value);

  const itemIndex = nextPlayer.items.findIndex(i => i.id === item.id);
  if (itemIndex > -1) {
    nextPlayer.items[itemIndex].quantity -= 1;
  }

  const log = item.effect(nextPlayer, nextEnemy);
  addLog(log.message, log.source, log.type);

  player.value = nextPlayer;
  enemy.value = nextEnemy;
  activeMenu.value = 'main';

  if (nextEnemy.stats.currentPleasure < nextEnemy.stats.maxPleasure &&
      nextPlayer.stats.currentPleasure < nextPlayer.stats.maxPleasure) {
    setTimeout(handleEnemyTurn, 1000);
  }
}

function handleEnemyTurn() {
  turnState.phase = 'enemyAction';

  setTimeout(() => {
    if (!turnState.enemyIntention) return;

    const nextPlayer = cloneCharacter(player.value);
    const nextEnemy = cloneCharacter(enemy.value);

    const skill = nextEnemy.skills.find(s => s.id === turnState.enemyIntention?.id) || nextEnemy.skills[0];
    if (!skill) return;

    // 使用新的战斗计算系统
    import('./combatCalculator').then(({ executeAttack, applySkillBuffs }) => {
      const result = executeAttack(nextEnemy, nextPlayer, skill.data);
      
      // 记录战斗日志
      addLog(`${nextEnemy.name} 使用了 ${skill.name}！`, 'enemy', 'info');
      
      if (result.isDodged) {
        addLog(`你闪避了攻击！`, 'system', 'info');
      } else {
        if (result.isCritical) {
          addLog(`暴击！受到 ${result.actualDamage} 点快感伤害！`, 'enemy', 'critical');
        } else {
          addLog(`受到 ${result.actualDamage} 点快感伤害`, 'enemy', 'damage');
        }
        
        // 应用伤害
        nextPlayer.stats.currentPleasure = Math.min(
          nextPlayer.stats.maxPleasure,
          nextPlayer.stats.currentPleasure + result.actualDamage
        );
        
        // 应用buff效果
        const buffLogs = applySkillBuffs(nextPlayer, skill.data);
        buffLogs.forEach(log => addLog(log, 'system', 'info'));
      }

      // 更新状态
      player.value = nextPlayer;
      enemy.value = nextEnemy;

      // 检查是否高潮
      if (nextPlayer.stats.currentPleasure >= nextPlayer.stats.maxPleasure) {
        turnState.climaxTarget = 'player';
        turnState.phase = 'climaxResolution';
      } else {
        setTimeout(startNewTurn, 1000);
      }
    });
  }, 1000);
}

function startNewTurn() {
  turnState.currentTurn++;
  turnState.phase = 'playerInput';
  determineEnemyIntention();

  // 回合开始回复
  player.value.stats.currentEndurance = Math.min(
    player.value.stats.maxEndurance,
    player.value.stats.currentEndurance + 5
  );

  // 冷却递减
  player.value.skills.forEach(s => {
    if (s.currentCooldown > 0) s.currentCooldown--;
  });
  enemy.value.skills.forEach(s => {
    if (s.currentCooldown > 0) s.currentCooldown--;
  });

  // 更新状态效果
  import('./combatCalculator').then(({ updateStatusEffects }) => {
    const playerLogs = updateStatusEffects(player.value);
    const enemyLogs = updateStatusEffects(enemy.value);
    playerLogs.forEach(log => addLog(log, 'system', 'info'));
    enemyLogs.forEach(log => addLog(log, 'system', 'info'));
  });

  addLog(`--- 第 ${turnState.currentTurn} 回合 ---`, 'system', 'info');
  saveToMvu();
}

function handleClimaxResolution(action: 'skip' | 'process') {
  const targetIsEnemy = turnState.climaxTarget === 'enemy';
  const char = targetIsEnemy ? enemy.value : player.value;

  if (action === 'process') {
    const text = CLIMAX_TEXTS[Math.floor(Math.random() * CLIMAX_TEXTS.length)](char.name);
    addLog(`>>> [过程] ${text}`, 'system', 'critical');
  } else {
    addLog(`${char.name} 达到了高潮！ (过程略)`, 'system', 'info');
  }

  const newChar = cloneCharacter(char);
  newChar.stats.currentPleasure = 0;
  newChar.stats.climaxCount += 1;

  if (targetIsEnemy) {
    enemy.value = newChar;
  } else {
    player.value = newChar;
  }

  // 检查游戏结束
  if (newChar.stats.climaxCount >= newChar.stats.maxClimaxCount) {
    turnState.phase = targetIsEnemy ? 'victory' : 'defeat';
    turnState.climaxTarget = null;
    addLog(targetIsEnemy ? '对手彻底崩溃！战斗胜利！' : '你彻底崩溃... 败北。', 'system', 'critical');
    saveToMvu();
    return;
  }

  // 继续战斗
  if (targetIsEnemy) {
    setTimeout(handleEnemyTurn, 500);
  } else {
    setTimeout(startNewTurn, 500);
  }
  turnState.climaxTarget = null;
}

function handleSurrender() {
  addLog('不能逃跑！这是尊严之战！', 'system', 'info');
}

function handleRestart() {
  window.location.reload();
}

// ================= 状态监听 =================
watch([
  () => player.value.stats.currentPleasure,
  () => player.value.stats.currentEndurance,
  () => enemy.value.stats.currentPleasure,
  () => enemy.value.stats.currentEndurance
], () => {
  if (turnState.phase === 'climaxResolution' || turnState.phase === 'victory' || turnState.phase === 'defeat') return;

  // 检查体力耗尽
  if (enemy.value.stats.currentEndurance <= 0) {
    turnState.phase = 'victory';
    addLog('对手体力耗尽！战斗胜利！', 'system', 'critical');
    saveToMvu();
    return;
  }
  if (player.value.stats.currentEndurance <= 0) {
    turnState.phase = 'defeat';
    addLog('你体力耗尽... 败北。', 'system', 'damage');
    saveToMvu();
    return;
  }

  // 检查高潮
  if (enemy.value.stats.currentPleasure >= enemy.value.stats.maxPleasure) {
    turnState.phase = 'climaxResolution';
    turnState.climaxTarget = 'enemy';
    return;
  }
  if (player.value.stats.currentPleasure >= player.value.stats.maxPleasure) {
    turnState.phase = 'climaxResolution';
    turnState.climaxTarget = 'player';
    return;
  }
});

// ================= 初始化 =================
onMounted(async () => {
  await loadFromMvu();
  addLog(`遭遇了 ${enemy.value.name} !`, 'system');
  determineEnemyIntention();
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
  padding: 1rem 1.5rem;
  background: transparent;
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
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: white;
}

.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.turn-counter {
  font-size: 1.5rem;
  font-family: ui-monospace, monospace;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.phase-indicator {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

// ========== 战斗区域 ==========
.combat-arena {
  position: relative;
  z-index: 10;
  max-width: 72rem;
  margin: 0 auto;
  padding: 2rem 1rem;
  padding-bottom: 24rem;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  gap: 1rem;
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
  background: rgba(9, 9, 11, 0.9);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  padding: 0.5rem 1rem 1.5rem;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
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
  flex: 1;
  max-width: 36rem;
}

.action-section {
  flex: 1;
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
  padding: 0.25rem 1rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: transparent;
  color: #64748b;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    background: white;
    color: black;
  }

  &:hover:not(.active) {
    color: white;
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
.menu-main, .menu-skills, .menu-items {
  display: flex;
  gap: 0.5rem;
  height: 100%;
  width: 100%;
}

.menu-card {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  span {
    font-weight: 700;
    white-space: nowrap;
  }
}

.icon-blue { color: #38bdf8; }
.icon-green { color: #4ade80; }
.icon-red { color: #f87171; }

.skill-card, .item-card {
  flex: 1;
  min-width: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;

  &.disabled {
    opacity: 0.6;
    filter: grayscale(0.5);
    pointer-events: none;
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

.skill-header, .item-header {
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

.skill-desc, .item-desc {
  font-size: 0.625rem;
  color: #94a3b8;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

.back-btn {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  color: #94a3b8;
  min-width: 60px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
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
  background: #db2777;
  color: white;
  box-shadow: 0 4px 14px rgba(219, 39, 119, 0.5);

  &:hover {
    background: #ec4899;
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
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.result-content {
  text-align: center;
}

.result-title {
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 1rem;
  letter-spacing: -0.025em;

  &.victory {
    background: linear-gradient(to right, #fde047, #f59e0b);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  &.defeat {
    color: #64748b;
  }
}

.result-subtitle {
  font-size: 1.25rem;
  color: #cbd5e1;
  font-weight: 300;
  letter-spacing: 0.1em;
  margin-bottom: 2rem;
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
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
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
</style>
