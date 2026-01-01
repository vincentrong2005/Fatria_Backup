/**
 * 战斗计算系统
 * 实现伤害计算、闪避暴击判定等核心战斗逻辑
 */

import { Character, SkillData, DamageSource, BuffType, StatusEffect } from './types';

/**
 * 战斗结果
 */
export interface CombatResult {
  damage: number;
  isCritical: boolean;
  isDodged: boolean;
  actualDamage: number;
  logs: string[];
}

/**
 * 计算技能基础伤害
 * @param attacker 攻击者
 * @param skill 技能数据
 * @returns 基础伤害值
 */
export function calculateBaseDamage(attacker: Character, skill: SkillData): number {
  let totalDamage = 0;

  console.info('[战斗计算] 计算基础伤害:');
  console.info('  技能伤害公式组件数量:', skill.damageFormula.length);

  if (skill.damageFormula.length === 0) {
    console.warn('[战斗计算] 技能伤害公式为空，返回0');
    return 0;
  }

  for (const component of skill.damageFormula) {
    let sourceValue = 0;

    switch (component.source) {
      case DamageSource.SEX_POWER:
        sourceValue = attacker.stats.sexPower;
        break;
      case DamageSource.CHARM:
        sourceValue = attacker.stats.charm;
        break;
      case DamageSource.LUCK:
        sourceValue = attacker.stats.luck;
        break;
      case DamageSource.WILLPOWER:
        sourceValue = attacker.stats.willpower;
        break;
      case DamageSource.FIXED:
        sourceValue = 1;
        break;
    }

    const componentDamage = sourceValue * component.coefficient + component.baseValue;
    totalDamage += componentDamage;

    console.info(
      `  组件: ${component.source}, 来源值: ${sourceValue}, 系数: ${component.coefficient}, 基础值: ${component.baseValue}, 组件伤害: ${componentDamage}`,
    );
  }

  const finalDamage = Math.max(0, Math.floor(totalDamage));
  console.info(`  总基础伤害: ${finalDamage}`);
  return finalDamage;
}

/**
 * 应用非线性减伤模型
 * 公式: 最终伤害 = 基础伤害 * 100 / (忍耐力 + 100)
 * 这意味着：
 * - 忍耐力为0时，最终伤害 = 基础伤害 * 100/100 = 基础伤害（无减伤）
 * - 忍耐力为100时，最终伤害 = 基础伤害 * 100/200 = 基础伤害 * 0.5（减伤50%）
 * - 忍耐力为200时，最终伤害 = 基础伤害 * 100/300 = 基础伤害 * 0.333（减伤66.7%）
 * - 忍耐力越高，减伤越多，但永远不会完全减伤到0
 * @param baseDamage 基础伤害
 * @param targetEndurance 目标的忍耐力
 * @param ignoreDefense 是否忽视防御
 * @returns 减伤后的伤害
 */
export function applyDefenseReduction(baseDamage: number, targetEndurance: number, ignoreDefense: boolean): number {
  if (ignoreDefense) {
    console.info(`[防御减伤] 忽视防御，伤害不变: ${baseDamage}`);
    return baseDamage;
  }

  // 非线性减伤公式：最终伤害 = 基础伤害 * 100 / (忍耐力 + 100)
  // 这个公式确保：忍耐力越高，减伤越多
  const denominator = targetEndurance + 100;
  const finalDamage = (baseDamage * 100) / denominator;
  const reductionPercent = ((targetEndurance / denominator) * 100).toFixed(1);

  console.info(`[防御减伤] 基础伤害: ${baseDamage}, 目标忍耐力: ${targetEndurance}`);
  console.info(
    `[防御减伤] 减伤公式: ${baseDamage} * 100 / (${targetEndurance} + 100) = ${baseDamage} * 100 / ${denominator}`,
  );
  console.info(
    `[防御减伤] 计算过程: ${baseDamage} * 100 = ${baseDamage * 100}, ${baseDamage * 100} / ${denominator} = ${finalDamage}`,
  );
  console.info(`[防御减伤] 减伤比例: ${reductionPercent}%, 最终伤害: ${Math.floor(finalDamage)}`);

  return Math.max(1, Math.floor(finalDamage));
}

/**
 * 判定是否闪避
 * @param attackerLuck 攻击者幸运
 * @param targetEvasion 目标闪避率
 * @param skillAccuracy 技能命中率
 * @param canBeDodged 技能是否可被闪避
 * @returns 是否闪避成功
 */
export function checkDodge(
  attackerLuck: number,
  targetEvasion: number,
  skillAccuracy: number,
  canBeDodged: boolean,
): boolean {
  if (!canBeDodged) {
    return false;
  }

  // 计算最终命中率 = 技能基础命中率 - 目标闪避率 + (攻击者幸运 / 10)
  const finalAccuracy = skillAccuracy - targetEvasion + attackerLuck / 10;

  // 命中率最低10%,最高95%
  const clampedAccuracy = Math.max(10, Math.min(95, finalAccuracy));

  // 随机判定
  const roll = Math.random() * 100;
  return roll >= clampedAccuracy;
}

/**
 * 判定是否暴击
 * @param attackerCrit 攻击者暴击率
 * @param attackerLuck 攻击者幸运
 * @param skillCritModifier 技能暴击修正
 * @returns 是否暴击
 */
export function checkCritical(attackerCrit: number, attackerLuck: number, skillCritModifier: number): boolean {
  // 计算最终暴击率 = 基础暴击率 + (幸运 / 5) + 技能修正
  const finalCritRate = attackerCrit + attackerLuck / 5 + skillCritModifier;

  // 暴击率最低0%,最高80%
  const clampedCritRate = Math.max(0, Math.min(80, finalCritRate));

  // 随机判定
  const roll = Math.random() * 100;
  return roll < clampedCritRate;
}

/**
 * 应用buff效果到伤害
 * @param damage 原始伤害
 * @param attacker 攻击者
 * @param target 目标
 * @returns 修正后的伤害
 */
export function applyBuffModifiers(damage: number, attacker: Character, target: Character): number {
  let modifier = 1.0;

  // 检查攻击者的攻击力buff
  for (const effect of attacker.statusEffects) {
    if (effect.effect.type === BuffType.ATK_UP && effect.effect.isPercent) {
      modifier += effect.effect.value / 100;
    } else if (effect.effect.type === BuffType.ATK_DOWN && effect.effect.isPercent) {
      modifier -= effect.effect.value / 100;
    }
  }

  // 检查目标的防御力buff
  for (const effect of target.statusEffects) {
    if (effect.effect.type === BuffType.DEF_UP && effect.effect.isPercent) {
      modifier -= effect.effect.value / 100;
    } else if (effect.effect.type === BuffType.DEF_DOWN && effect.effect.isPercent) {
      modifier += effect.effect.value / 100;
    } else if (effect.effect.type === BuffType.SENSITIVE && effect.effect.isPercent) {
      modifier += effect.effect.value / 100;
    }
  }

  return Math.max(1, Math.floor(damage * modifier));
}

/**
 * 执行完整的战斗计算
 * @param attacker 攻击者
 * @param target 目标
 * @param skill 技能数据
 * @returns 战斗结果
 */
export function executeAttack(attacker: Character, target: Character, skill: SkillData): CombatResult {
  const logs: string[] = [];
  const result: CombatResult = {
    damage: 0,
    isCritical: false,
    isDodged: false,
    actualDamage: 0,
    logs: [],
  };

  // 1. 计算基础伤害
  const baseDamage = calculateBaseDamage(attacker, skill);
  logs.push(`基础伤害: ${baseDamage}`);

  // 2. 判定闪避
  const dodged = checkDodge(attacker.stats.luck, target.stats.evasion, skill.accuracy, skill.canBeDodged);
  if (dodged) {
    result.isDodged = true;
    result.logs = logs;
    logs.push(`${target.name} 闪避了攻击!`);
    return result;
  }

  // 3. 判定暴击
  const critical = checkCritical(attacker.stats.crit, attacker.stats.luck, skill.critModifier);
  result.isCritical = critical;
  let finalDamage = baseDamage;
  if (critical) {
    finalDamage = Math.floor(baseDamage * 2);
    logs.push(`暴击! 伤害翻倍: ${finalDamage}`);
  }

  // 4. 应用防御减伤
  const damageBeforeDefense = finalDamage;
  const targetEndurance = target.stats.baseEndurance;
  console.info(
    `[executeAttack] 准备应用防御减伤: 原始伤害=${damageBeforeDefense}, 目标忍耐力=${targetEndurance}, 忽视防御=${skill.ignoreDefense}`,
  );

  const damageAfterDefense = applyDefenseReduction(finalDamage, targetEndurance, skill.ignoreDefense);

  if (!skill.ignoreDefense) {
    const reductionPercent = ((targetEndurance / (targetEndurance + 100)) * 100).toFixed(1);
    const actualReduction = damageBeforeDefense - damageAfterDefense;
    logs.push(`原始伤害: ${damageBeforeDefense}`);
    logs.push(`目标忍耐力: ${targetEndurance}`);
    logs.push(
      `防御减伤公式: ${damageBeforeDefense} × 100 ÷ (${targetEndurance} + 100) = ${damageBeforeDefense} × 100 ÷ ${targetEndurance + 100}`,
    );
    logs.push(
      `计算过程: ${damageBeforeDefense} × 100 = ${damageBeforeDefense * 100}, ${damageBeforeDefense * 100} ÷ ${targetEndurance + 100} = ${Math.floor((damageBeforeDefense * 100) / (targetEndurance + 100))}`,
    );
    logs.push(`减伤比例: ${reductionPercent}% (减伤 ${actualReduction} 点)`);
    logs.push(`减伤后伤害: ${damageAfterDefense}`);
    finalDamage = damageAfterDefense;
    console.info(
      `[executeAttack] 防御减伤完成: ${damageBeforeDefense} -> ${damageAfterDefense}, 日志数量=${logs.length}`,
    );
  } else {
    logs.push(`原始伤害: ${damageBeforeDefense}`);
    logs.push(`忽视防御: 伤害不变，最终伤害: ${damageAfterDefense}`);
    finalDamage = damageAfterDefense;
    console.info(`[executeAttack] 忽视防御，伤害不变: ${damageAfterDefense}`);
  }

  // 5. 应用buff修正
  finalDamage = applyBuffModifiers(finalDamage, attacker, target);
  logs.push(`最终伤害: ${finalDamage}`);

  result.damage = baseDamage;
  result.actualDamage = finalDamage;
  result.logs = logs;

  return result;
}

/**
 * 应用技能的buff效果
 * @param target 目标角色
 * @param skill 技能数据
 */
export function applySkillBuffs(target: Character, skill: SkillData): string[] {
  const logs: string[] = [];

  for (const buff of skill.buffs) {
    // 检查是否已有相同类型的buff
    const existingBuffIndex = target.statusEffects.findIndex(effect => effect.effect.type === buff.type);

    if (existingBuffIndex >= 0 && !buff.stackable) {
      // 不可叠加,刷新持续时间
      target.statusEffects[existingBuffIndex].duration = buff.duration;
      logs.push(`刷新了 ${target.statusEffects[existingBuffIndex].name} 的持续时间`);
    } else if (existingBuffIndex >= 0 && buff.stackable) {
      // 可叠加,检查层数限制
      const currentStacks = target.statusEffects.filter(effect => effect.effect.type === buff.type).length;
      if (!buff.maxStacks || currentStacks < buff.maxStacks) {
        // 添加新层
        const newEffect: StatusEffect = {
          id: `${buff.type}_${Date.now()}`,
          name: getBuffName(buff.type),
          duration: buff.duration,
          icon: '🎭',
          effect: buff,
          type: isDebuff(buff.type) ? 'debuff' : 'buff',
        };
        target.statusEffects.push(newEffect);
        logs.push(`添加了 ${newEffect.name} (${currentStacks + 1}层)`);
      } else {
        logs.push(`${getBuffName(buff.type)} 已达最大层数`);
      }
    } else {
      // 添加新buff
      const newEffect: StatusEffect = {
        id: `${buff.type}_${Date.now()}`,
        name: getBuffName(buff.type),
        duration: buff.duration,
        icon: '🎭',
        effect: buff,
        type: isDebuff(buff.type) ? 'debuff' : 'buff',
      };
      target.statusEffects.push(newEffect);
      logs.push(`添加了 ${newEffect.name}`);
    }
  }

  return logs;
}

/**
 * 更新所有状态效果的持续时间
 * @param character 角色
 */
export function updateStatusEffects(character: Character): string[] {
  const logs: string[] = [];

  // 减少持续时间并移除过期的效果
  character.statusEffects = character.statusEffects.filter(effect => {
    effect.duration--;
    if (effect.duration <= 0) {
      logs.push(`${character.name} 的 ${effect.name} 效果消失了`);
      return false;
    }
    return true;
  });

  // 处理持续伤害/回复效果
  for (const effect of character.statusEffects) {
    if (effect.effect.type === BuffType.DOT_LUST) {
      const lustChange = effect.effect.value;
      character.stats.currentPleasure += lustChange;
      logs.push(`${character.name} 受到持续快感影响 (${lustChange > 0 ? '+' : ''}${lustChange})`);
    } else if (effect.effect.type === BuffType.REGEN) {
      const regenValue = effect.effect.isPercent
        ? Math.floor((character.stats.maxEndurance * effect.effect.value) / 100)
        : effect.effect.value;
      character.stats.currentEndurance = Math.min(
        character.stats.maxEndurance,
        character.stats.currentEndurance + regenValue,
      );
      logs.push(`${character.name} 回复了 ${regenValue} 点耐力`);
    }
  }

  return logs;
}

/**
 * 获取buff的中文名称
 */
function getBuffName(type: BuffType): string {
  const names: Record<BuffType, string> = {
    [BuffType.ATK_UP]: '攻击提升',
    [BuffType.DEF_UP]: '防御提升',
    [BuffType.ATK_DOWN]: '攻击下降',
    [BuffType.DEF_DOWN]: '防御下降',
    [BuffType.SENSITIVE]: '敏感',
    [BuffType.WILLPOWER_DOWN]: '意志下降',
    [BuffType.SILENCE]: '沉默',
    [BuffType.BIND]: '束缚',
    [BuffType.DODGE_DOWN]: '闪避下降',
    [BuffType.CRIT_UP]: '暴击提升',
    [BuffType.FOCUS]: '集中',
    [BuffType.SHAME]: '羞耻',
    [BuffType.HEAT]: '发情',
    [BuffType.FEAR]: '恐惧',
    [BuffType.DOT_LUST]: '持续快感',
    [BuffType.REGEN]: '持续回复',
    [BuffType.ENDURANCE_UP]: '忍耐提升',
  };
  return names[type] || '未知效果';
}

/**
 * 判断是否为debuff
 */
function isDebuff(type: BuffType): boolean {
  const debuffs = [
    BuffType.ATK_DOWN,
    BuffType.DEF_DOWN,
    BuffType.SENSITIVE,
    BuffType.WILLPOWER_DOWN,
    BuffType.SILENCE,
    BuffType.BIND,
    BuffType.DODGE_DOWN,
    BuffType.SHAME,
    BuffType.HEAT,
    BuffType.FEAR,
    BuffType.DOT_LUST,
  ];
  return debuffs.includes(type);
}
