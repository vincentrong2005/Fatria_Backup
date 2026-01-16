// 天赋系统 - 战斗效果实现
// 处理天赋在战斗中的各种触发效果

import type { TalentData } from '../性斗学园脚本/data/talentDatabase';

export interface TalentState {
  // 计数器（用于追踪次数限制的效果）
  attackCount: number;           // 攻击次数
  damageReceivedCount: number;   // 本回合受到伤害次数
  damageReceivedCountInBattle: number; // 本次性斗受到伤害次数
  bindReceivedCount: number;     // 受到束缚次数
  consecutiveHits: number;       // 连续命中次数
  accumulatedPleasureDamage: number;  // 累计受到的快感伤害
  accumulatedStaminaConsume: number;  // 累计消耗的耐力
  // 状态标记
  hasShield: boolean;            // 是否有护盾
  shieldTurnsRemaining: number;  // 护盾剩余回合
  shieldValue: number;           // 护盾减伤值
  nextAttackBoost: number;       // 下次攻击加成
  dodgeBoostActive: boolean;     // 闪避后攻击加成是否激活
}

// 创建默认天赋状态
export function createDefaultTalentState(): TalentState {
  return {
    attackCount: 0,
    damageReceivedCount: 0,
    damageReceivedCountInBattle: 0,
    bindReceivedCount: 0,
    consecutiveHits: 0,
    accumulatedPleasureDamage: 0,
    accumulatedStaminaConsume: 0,
    hasShield: false,
    shieldTurnsRemaining: 0,
    shieldValue: 0,
    nextAttackBoost: 0,
    dodgeBoostActive: false,
  };
}

// 天赋效果处理器接口
export interface TalentEffectContext {
  playerPleasure: number;
  playerMaxPleasure: number;
  playerStamina: number;
  playerMaxStamina: number;
  enemyPleasure: number;
  enemyMaxPleasure: number;
  enemyStamina: number;
  enemyMaxStamina: number;
  currentTurn: number;
  talentState: TalentState;
  // 回调函数
  modifyPlayerPleasure: (delta: number) => void;
  modifyPlayerStamina: (delta: number) => void;
  modifyEnemyPleasure: (delta: number) => void;
  modifyEnemyStamina: (delta: number) => void;
  addLog: (message: string, source: string, type: string) => void;
  applyBuff: (target: 'player' | 'enemy', buffName: string, bonus: Record<string, number>, duration: number) => void;
}

// 天赋效果结果
export interface TalentEffectResult {
  damageMultiplier?: number;      // 伤害倍率修正
  damageReduction?: number;       // 伤害减免（固定值）
  damageReductionPercent?: number; // 伤害减免（百分比）
  accuracyBoost?: number;         // 命中率加成
  guaranteedHit?: boolean;        // 必定命中
  reflectDamage?: number;         // 反弹伤害
  preventClimaxCount?: boolean;   // 阻止高潮计数
  preventBind?: boolean;          // 阻止束缚
  addBind?: boolean;              // 附加束缚
  bindDuration?: number;          // 束缚持续回合
  skipEffect?: boolean;           // 跳过本次效果
  message?: string;               // 日志消息
}

// 处理回合开始时的天赋效果
export function processTalentOnTurnStart(
  talent: TalentData | null,
  context: TalentEffectContext
): TalentEffectResult {
  if (!talent) return {};
  
  const result: TalentEffectResult = {};
  
  for (const effect of talent.effects) {
    if (effect.trigger !== 'turn_start') continue;
    
    switch (effect.effect) {
      case 'reduce_pleasure_when_high': {
        // 当快感超过阈值时减少快感
        const threshold = (effect.params.threshold || 50) / 100;
        if (context.playerPleasure > context.playerMaxPleasure * threshold) {
          const reduction = effect.params.value || 5;
          context.modifyPlayerPleasure(-reduction);
          context.addLog(`【${talent.name}】触发：快感减少${reduction}点`, 'system', 'info');
        }
        break;
      }
      
      case 'reduce_pleasure_when_low': {
        // 当快感低于阈值时减少快感
        const threshold = (effect.params.threshold || 25) / 100;
        if (context.playerPleasure < context.playerMaxPleasure * threshold) {
          const reduction = effect.params.value || 10;
          context.modifyPlayerPleasure(-reduction);
          context.addLog(`【${talent.name}】触发：快感减少${reduction}点`, 'system', 'info');
        }
        break;
      }
      
      case 'balance_pleasure': {
        // 快感向目标值调整
        const targetPercent = (effect.params.threshold || 50) / 100;
        const targetPleasure = context.playerMaxPleasure * targetPercent;
        const adjustValue = effect.params.value || 20;
        
        if (context.playerPleasure > targetPleasure) {
          const reduction = Math.min(adjustValue, context.playerPleasure - targetPleasure);
          context.modifyPlayerPleasure(-reduction);
          context.addLog(`【${talent.name}】触发：快感减少${Math.floor(reduction)}点`, 'system', 'info');
        } else if (context.playerPleasure < targetPleasure) {
          const increase = Math.min(adjustValue, targetPleasure - context.playerPleasure);
          context.modifyPlayerPleasure(increase);
          context.addLog(`【${talent.name}】触发：快感增加${Math.floor(increase)}点`, 'system', 'info');
        }
        break;
      }
      
      case 'random_buff_every_n_turns': {
        // 每N回合获得随机buff
        const interval = effect.params.count || 3;
        if (context.currentTurn > 0 && context.currentTurn % interval === 0) {
          const buffs: Array<{ name: string; bonus: Record<string, number> }> = [
            { name: '性斗力提升', bonus: { '基础性斗力成算': 15 } },
            { name: '忍耐力提升', bonus: { '基础忍耐力成算': 15 } },
            { name: '闪避提升', bonus: { '闪避率加成': 10 } },
            { name: '暴击提升', bonus: { '暴击率加成': 10 } },
          ];
          const randomBuff = buffs[Math.floor(Math.random() * buffs.length)];
          const duration = effect.params.duration || 2;
          context.applyBuff('player', `天赋_${randomBuff.name}`, randomBuff.bonus, duration);
          context.addLog(`【${talent.name}】触发：获得${randomBuff.name}效果（${duration}回合）`, 'system', 'info');
        }
        break;
      }
    }
  }
  
  // 重置回合内计数器
  context.talentState.damageReceivedCount = 0;
  
  return result;
}

// 处理回合结束时的天赋效果
export function processTalentOnTurnEnd(
  talent: TalentData | null,
  context: TalentEffectContext
): TalentEffectResult {
  if (!talent) return {};
  
  const result: TalentEffectResult = {};
  
  for (const effect of talent.effects) {
    if (effect.trigger !== 'turn_end') continue;
    
    switch (effect.effect) {
      case 'boost_stamina_recovery': {
        // 耐力回复量增加（这个效果需要在实际回复时应用）
        // 这里只是标记，实际处理在耐力回复逻辑中
        break;
      }
      
      case 'recover_stamina_per_turn': {
        const value = effect.params.value || 2;
        context.modifyPlayerStamina(value);
        context.addLog(`【${talent.name}】触发：回复${value}点耐力`, 'system', 'info');
        break;
      }
      
      case 'reduce_pleasure_per_turn': {
        const value = effect.params.value || 3;
        context.modifyPlayerPleasure(-value);
        context.addLog(`【${talent.name}】触发：快感减少${value}点`, 'system', 'info');
        break;
      }
    }
  }
  
  // 护盾回合递减
  if (context.talentState.hasShield && context.talentState.shieldTurnsRemaining > 0) {
    context.talentState.shieldTurnsRemaining--;
    if (context.talentState.shieldTurnsRemaining <= 0) {
      context.talentState.hasShield = false;
      context.talentState.shieldValue = 0;
      context.addLog(`【护盾】效果已结束`, 'system', 'info');
    }
  }
  
  return result;
}

// 处理战斗开始时的天赋效果
export function processTalentOnBattleStart(
  talent: TalentData | null,
  context: TalentEffectContext
): TalentEffectResult {
  if (!talent) return {};
  
  // 重置天赋状态
  Object.assign(context.talentState, createDefaultTalentState());
  
  for (const effect of talent.effects) {
    if (effect.trigger !== 'battle_start') continue;
    
    switch (effect.effect) {
      case 'reset_stats_on_battle_start': {
        // 回满耐力，清空快感
        const staminaToRecover = context.playerMaxStamina - context.playerStamina;
        const pleasureToReduce = context.playerPleasure;
        context.modifyPlayerStamina(staminaToRecover);
        context.modifyPlayerPleasure(-pleasureToReduce);
        context.addLog(`【${talent.name}】触发：耐力回满，快感清空`, 'system', 'info');
        break;
      }
      
      case 'shield_first_n_turns': {
        context.talentState.hasShield = true;
        context.talentState.shieldTurnsRemaining = effect.params.duration || 3;
        context.talentState.shieldValue = effect.params.value || 5;
        context.addLog(`【${talent.name}】触发：获得护盾（${context.talentState.shieldTurnsRemaining}回合）`, 'system', 'info');
        break;
      }
      
      case 'bonus_stamina_on_start': {
        const value = effect.params.value || 15;
        context.modifyPlayerStamina(value);
        context.addLog(`【${talent.name}】触发：获得${value}点额外耐力`, 'system', 'info');
        break;
      }
    }
  }
  
  return {};
}

// 处理攻击时的天赋效果
export function processTalentOnAttack(
  talent: TalentData | null,
  context: TalentEffectContext,
  hasBindEffect: boolean
): TalentEffectResult {
  if (!talent) return {};
  
  const result: TalentEffectResult = {};
  context.talentState.attackCount++;
  
  for (const effect of talent.effects) {
    if (effect.trigger !== 'on_attack') continue;
    
    switch (effect.effect) {
      case 'double_first_n_attacks': {
        const count = effect.params.count || 2;
        if (context.talentState.attackCount <= count) {
          result.damageMultiplier = (result.damageMultiplier || 1) * (effect.params.multiplier || 2);
          context.addLog(`【${talent.name}】触发：伤害翻倍！`, 'system', 'critical');
        }
        break;
      }
      
      case 'guaranteed_hit_first_n': {
        const count = effect.params.count || 2;
        if (context.talentState.attackCount <= count) {
          result.guaranteedHit = true;
          context.addLog(`【${talent.name}】触发：必定命中！`, 'system', 'info');
        }
        break;
      }
      
      case 'add_bind_first_n': {
        const count = effect.params.count || 2;
        if (context.talentState.attackCount <= count && !hasBindEffect) {
          result.addBind = true;
          result.bindDuration = effect.params.duration || 1;
          context.addLog(`【${talent.name}】触发：附加束缚效果！`, 'system', 'info');
        }
        break;
      }
      
      case 'reduce_enemy_dodge_chance': {
        const chance = effect.params.chance || 15;
        if (Math.random() * 100 < chance) {
          const value = effect.params.value || 20;
          const duration = effect.params.duration || 1;
          context.applyBuff('enemy', '天赋_闪避降低', { '闪避率加成': -value }, duration);
          context.addLog(`【${talent.name}】触发：敌人闪避率降低${value}%`, 'system', 'info');
        }
        break;
      }
    }
  }
  
  // 处理闪避后攻击加成
  if (context.talentState.dodgeBoostActive && context.talentState.nextAttackBoost > 0) {
    result.damageMultiplier = (result.damageMultiplier || 1) * (1 + context.talentState.nextAttackBoost / 100);
    context.addLog(`【闪避大师】触发：伤害提升${context.talentState.nextAttackBoost}%`, 'system', 'info');
    context.talentState.dodgeBoostActive = false;
    context.talentState.nextAttackBoost = 0;
  }
  
  return result;
}

// 处理造成伤害时的天赋效果
export function processTalentOnDamageDealt(
  talent: TalentData | null,
  context: TalentEffectContext,
  damageDealt: number
): TalentEffectResult {
  if (!talent) return {};
  
  const result: TalentEffectResult = {};
  
  for (const effect of talent.effects) {
    if (effect.trigger !== 'on_damage_deal') continue;
    
    switch (effect.effect) {
      case 'reduce_self_pleasure_on_attack': {
        const value = effect.params.value || 3;
        context.modifyPlayerPleasure(-value);
        context.addLog(`【${talent.name}】触发：快感减少${value}点`, 'system', 'info');
        break;
      }
      
      case 'drain_enemy_stamina': {
        const chance = effect.params.chance || 25;
        if (Math.random() * 100 < chance) {
          const value = effect.params.value || 3;
          context.modifyEnemyStamina(-value);
          context.addLog(`【${talent.name}】触发：消耗敌人${value}点耐力`, 'system', 'info');
        }
        break;
      }
    }
  }
  
  // 连续命中计数
  context.talentState.consecutiveHits++;
  
  return result;
}

// 处理受到伤害时的天赋效果
export function processTalentOnDamageReceived(
  talent: TalentData | null,
  context: TalentEffectContext,
  incomingDamage: number
): TalentEffectResult {
  if (!talent) return {};
  
  const result: TalentEffectResult = {};
  context.talentState.damageReceivedCount++;
  context.talentState.damageReceivedCountInBattle++;
  
  for (const effect of talent.effects) {
    if (effect.trigger !== 'on_damage_receive') continue;
    
    switch (effect.effect) {
      case 'cap_pleasure_damage': {
        // 单次伤害上限
        const threshold = (effect.params.threshold || 30) / 100;
        const maxDamage = Math.floor(context.playerMaxPleasure * threshold);
        if (incomingDamage > maxDamage) {
          result.damageReduction = incomingDamage - maxDamage;
          context.addLog(`【${talent.name}】触发：伤害被限制为${maxDamage}点`, 'system', 'info');
        }
        break;
      }
      
      case 'reflect_pleasure_damage': {
        const reflectPercent = (effect.params.value || 25) / 100;
        result.reflectDamage = Math.floor(incomingDamage * reflectPercent);
        if (result.reflectDamage > 0) {
          context.modifyEnemyPleasure(result.reflectDamage);
          context.addLog(`【${talent.name}】触发：反弹${result.reflectDamage}点伤害`, 'system', 'info');
        }
        break;
      }
      
      case 'reduce_pleasure_damage': {
        const reductionPercent = effect.params.value || 15;
        result.damageReductionPercent = (result.damageReductionPercent || 0) + reductionPercent;
        break;
      }
      
      case 'reduce_first_n_damage': {
        const count = effect.params.count || 2;
        if (context.talentState.damageReceivedCountInBattle <= count) {
          const reductionPercent = effect.params.value || 50;
          result.damageReductionPercent = (result.damageReductionPercent || 0) + reductionPercent;
          context.addLog(`【${talent.name}】触发：伤害减少${reductionPercent}%`, 'system', 'info');
        }
        break;
      }
      
      case 'reduce_first_damage_per_turn': {
        if (context.talentState.damageReceivedCount === 1) {
          const value = effect.params.value || 8;
          result.damageReduction = (result.damageReduction || 0) + value;
          context.addLog(`【${talent.name}】触发：伤害减少${value}点`, 'system', 'info');
        }
        break;
      }
      
      case 'convert_pleasure_to_stamina': {
        context.talentState.accumulatedPleasureDamage += incomingDamage;
        const threshold = effect.params.threshold || 15;
        const value = effect.params.value || 3;
        while (context.talentState.accumulatedPleasureDamage >= threshold) {
          context.talentState.accumulatedPleasureDamage -= threshold;
          context.modifyPlayerStamina(value);
          context.addLog(`【${talent.name}】触发：回复${value}点耐力`, 'system', 'info');
        }
        break;
      }
      
      case 'reduce_damage_when_high_pleasure': {
        const threshold = (effect.params.threshold || 80) / 100;
        if (context.playerPleasure > context.playerMaxPleasure * threshold) {
          const reductionPercent = effect.params.value || 25;
          result.damageReductionPercent = (result.damageReductionPercent || 0) + reductionPercent;
          context.addLog(`【${talent.name}】触发：伤害减少${reductionPercent}%`, 'system', 'info');
        }
        break;
      }
      
      case 'chance_immune_attack': {
        const chance = effect.params.chance || 10;
        if (Math.random() * 100 < chance) {
          result.skipEffect = true;
          context.addLog(`【${talent.name}】触发：完全免疫攻击！`, 'system', 'critical');
        }
        break;
      }
    }
  }
  
  // 护盾减伤
  if (context.talentState.hasShield && context.talentState.shieldValue > 0) {
    result.damageReduction = (result.damageReduction || 0) + context.talentState.shieldValue;
  }
  
  return result;
}

// 处理闪避时的天赋效果
export function processTalentOnDodge(
  talent: TalentData | null,
  context: TalentEffectContext
): TalentEffectResult {
  if (!talent) return {};
  
  for (const effect of talent.effects) {
    if (effect.trigger !== 'on_dodge') continue;
    
    switch (effect.effect) {
      case 'boost_next_attack_on_dodge': {
        const value = effect.params.value || 15;
        context.talentState.nextAttackBoost = value;
        context.talentState.dodgeBoostActive = true;
        context.addLog(`【${talent.name}】触发：下次攻击伤害+${value}%`, 'system', 'info');
        break;
      }
    }
  }
  
  return {};
}

// 处理暴击时的天赋效果
export function processTalentOnCrit(
  talent: TalentData | null,
  context: TalentEffectContext,
  baseDamage: number
): TalentEffectResult {
  if (!talent) return {};
  
  const result: TalentEffectResult = {};
  
  for (const effect of talent.effects) {
    if (effect.trigger !== 'on_crit') continue;
    
    switch (effect.effect) {
      case 'boost_crit_damage': {
        const value = effect.params.value || 25;
        result.damageMultiplier = (result.damageMultiplier || 1) * (1 + value / 100);
        context.addLog(`【${talent.name}】触发：暴击伤害+${value}%`, 'system', 'critical');
        break;
      }
    }
  }
  
  return result;
}

// 处理受到暴击时的天赋效果
export function processTalentOnCritReceived(
  talent: TalentData | null,
  context: TalentEffectContext
): TalentEffectResult {
  if (!talent) return {};
  
  const result: TalentEffectResult = {};
  
  for (const effect of talent.effects) {
    if (effect.trigger !== 'on_crit_receive') continue;
    
    switch (effect.effect) {
      case 'reduce_crit_damage_received': {
        const value = effect.params.value || 20;
        result.damageReductionPercent = (result.damageReductionPercent || 0) + value;
        context.addLog(`【${talent.name}】触发：暴击伤害减少${value}%`, 'system', 'info');
        break;
      }
    }
  }
  
  return result;
}

// 处理高潮时的天赋效果
export function processTalentOnClimax(
  talent: TalentData | null,
  context: TalentEffectContext
): TalentEffectResult {
  if (!talent) return {};
  
  const result: TalentEffectResult = {};
  
  for (const effect of talent.effects) {
    if (effect.trigger !== 'on_climax') continue;
    
    switch (effect.effect) {
      case 'chance_ignore_climax_count': {
        const chance = effect.params.chance || 30;
        if (Math.random() * 100 < chance) {
          result.preventClimaxCount = true;
          context.addLog(`【${talent.name}】触发：本次高潮不计入次数！`, 'system', 'critical');
        }
        break;
      }
    }
  }
  
  return result;
}

// 处理敌人高潮时的天赋效果
export function processTalentOnEnemyClimax(
  talent: TalentData | null,
  context: TalentEffectContext
): TalentEffectResult {
  if (!talent) return {};
  
  for (const effect of talent.effects) {
    if (effect.trigger !== 'on_enemy_climax') continue;
    
    switch (effect.effect) {
      case 'recover_stamina_on_enemy_climax': {
        const value = effect.params.value || 20;
        context.modifyPlayerStamina(value);
        context.addLog(`【${talent.name}】触发：回复${value}点耐力`, 'system', 'info');
        break;
      }
    }
  }
  
  return {};
}

// 处理受到debuff时的天赋效果
export function processTalentOnDebuffReceived(
  talent: TalentData | null,
  context: TalentEffectContext,
  debuffType: string
): TalentEffectResult {
  if (!talent) return {};
  
  const result: TalentEffectResult = {};
  
  for (const effect of talent.effects) {
    if (effect.trigger !== 'on_debuff_receive') continue;
    
    switch (effect.effect) {
      case 'immune_first_n_binds': {
        if (debuffType === 'bind') {
          const count = effect.params.count || 2;
          context.talentState.bindReceivedCount++;
          if (context.talentState.bindReceivedCount <= count) {
            result.preventBind = true;
            context.addLog(`【${talent.name}】触发：免疫束缚效果！`, 'system', 'info');
          }
        }
        break;
      }
    }
  }
  
  return result;
}

// 处理耐力消耗时的天赋效果
export function processTalentOnStaminaConsume(
  talent: TalentData | null,
  context: TalentEffectContext,
  staminaConsumed: number
): TalentEffectResult {
  if (!talent) return {};
  
  for (const effect of talent.effects) {
    if (effect.trigger !== 'on_stamina_consume') continue;
    
    switch (effect.effect) {
      case 'convert_stamina_to_pleasure_reduce': {
        context.talentState.accumulatedStaminaConsume += staminaConsumed;
        const threshold = effect.params.threshold || 8;
        const value = effect.params.value || 2;
        while (context.talentState.accumulatedStaminaConsume >= threshold) {
          context.talentState.accumulatedStaminaConsume -= threshold;
          context.modifyPlayerPleasure(-value);
          context.addLog(`【${talent.name}】触发：快感减少${value}点`, 'system', 'info');
        }
        break;
      }
    }
  }
  
  return {};
}

// 获取被动效果的属性修正
export function getTalentPassiveModifiers(
  talent: TalentData | null,
  context: {
    playerPleasure: number;
    playerMaxPleasure: number;
    playerStamina: number;
    playerMaxStamina: number;
    enemyPleasure: number;
    enemyMaxPleasure: number;
  }
): {
  damageBoostPercent: number;
  accuracyBoost: number;
  dodgeBoost: number;
  critBoost: number;
  allStatsBoostPercent: number;
  enemyDodgeReduction: number;
  chanceBoost: number;
  powerCoeffBoost: number;
} {
  const result = {
    damageBoostPercent: 0,
    accuracyBoost: 0,
    dodgeBoost: 0,
    critBoost: 0,
    allStatsBoostPercent: 0,
    enemyDodgeReduction: 0,
    chanceBoost: 0,
    powerCoeffBoost: 0,
  };
  
  if (!talent) return result;
  
  for (const effect of talent.effects) {
    if (effect.trigger !== 'passive') continue;
    
    switch (effect.effect) {
      case 'power_boost_when_high_pleasure': {
        const threshold = (effect.params.threshold || 75) / 100;
        if (context.playerPleasure >= context.playerMaxPleasure * threshold) {
          result.powerCoeffBoost += effect.params.value || 40;
        }
        break;
      }
      
      case 'damage_boost_when_low_stamina': {
        const threshold = (effect.params.threshold || 30) / 100;
        if (context.playerStamina < context.playerMaxStamina * threshold) {
          result.damageBoostPercent += effect.params.value || 20;
        }
        break;
      }
      
      case 'damage_boost_when_enemy_high_pleasure': {
        const threshold = (effect.params.threshold || 70) / 100;
        if (context.enemyPleasure > context.enemyMaxPleasure * threshold) {
          result.damageBoostPercent += effect.params.value || 30;
        }
        break;
      }
      
      case 'boost_accuracy': {
        result.accuracyBoost += effect.params.value || 10;
        break;
      }
      
      case 'boost_all_stats_when_critical': {
        const threshold = (effect.params.threshold || 90) / 100;
        if (context.playerPleasure > context.playerMaxPleasure * threshold) {
          result.allStatsBoostPercent += effect.params.value || 10;
        }
        break;
      }
      
      case 'reduce_enemy_dodge': {
        result.enemyDodgeReduction += effect.params.value || 5;
        break;
      }
      
      case 'boost_all_chances': {
        result.chanceBoost += effect.params.value || 5;
        break;
      }
      
      case 'boost_dodge_when_low_stamina': {
        const threshold = (effect.params.threshold || 20) / 100;
        if (context.playerStamina < context.playerMaxStamina * threshold) {
          result.dodgeBoost += effect.params.value || 15;
        }
        break;
      }
    }
  }
  
  return result;
}

// 获取耐力回复倍率
export function getTalentStaminaRecoveryMultiplier(talent: TalentData | null): number {
  if (!talent) return 1;
  
  for (const effect of talent.effects) {
    if (effect.trigger === 'turn_end' && effect.effect === 'boost_stamina_recovery') {
      return effect.params.multiplier || 1.3;
    }
  }
  
  return 1;
}

// 获取耐力变化上限
export function getTalentStaminaChangeCap(talent: TalentData | null): number | null {
  if (!talent) return null;
  
  for (const effect of talent.effects) {
    if (effect.trigger === 'on_stamina_change' && effect.effect === 'cap_stamina_change') {
      return effect.params.maxValue || 30;
    }
  }
  
  return null;
}
