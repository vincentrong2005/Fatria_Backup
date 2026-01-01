/**
 * 性斗学园敌人角色数据库
 * 根据世界书人物条目创建，使用新的技能系统
 */

import type { Character, Skill } from './types';
import { getSkillById } from './skillDatabase';

/**
 * 从技能ID创建技能实例
 */
function createSkillFromId(skillId: string): Skill | null {
  const skillData = getSkillById(skillId);
  if (!skillData) {
    console.warn(`技能 ${skillId} 不存在`);
    return null;
  }
  return {
    id: skillData.id,
    name: skillData.name,
    description: skillData.description,
    cost: skillData.staminaCost,
    type: skillData.type,
    cooldown: skillData.cooldown,
    currentCooldown: 0,
    data: skillData,
  };
}

/**
 * 从技能ID数组创建技能列表
 */
function createSkills(skillIds: string[]): Skill[] {
  return skillIds.map(id => createSkillFromId(id)).filter(skill => skill !== null) as Skill[];
}

/**
 * 敌人数据接口
 */
export interface EnemyData {
  name: string;
  avatarUrl: string;
  stats: {
    charm: number;
    luck: number;
    evasion: number;
    crit: number;
    willpower: number;
    sexPower: number;
    baseEndurance: number;
    maxEndurance: number;
    maxPleasure: number;
    maxClimaxCount: number;
  };
  skillIds: string[];
  description: string;
}

// ==================== 角色数据库 ====================

export const ENEMY_DATABASE: Record<string, EnemyData> = {
  // ========== 最高层 ==========
  '伊甸·阿斯莫德': {
    name: '伊甸·阿斯莫德',
    avatarUrl: 'https://picsum.photos/400/600?random=101',
    stats: {
      charm: 100,
      luck: 100,
      evasion: 50,
      crit: 50,
      willpower: 200,
      sexPower: 100,
      baseEndurance: 90,
      maxEndurance: 300,
      maxPleasure: 200,
      maxClimaxCount: 5,
    },
    skillIds: ['s_kiss', 's_massage', 's_bind', 's_pheromone'],
    description: '学园的神秘创办者与最高领导者',
  },

  // ========== 教师团队 ==========
  白石响子: {
    name: '白石响子',
    avatarUrl: 'https://picsum.photos/400/600?random=85',
    stats: {
      charm: 90,
      luck: 60,
      evasion: 20,
      crit: 15,
      willpower: 180,
      sexPower: 80,
      baseEndurance: 70,
      maxEndurance: 200,
      maxPleasure: 120,
      maxClimaxCount: 4,
    },
    skillIds: ['s_tease', 's_spank', 's_dirtytalk', 's_taunt'],
    description: '风纪委员长，铁腕女王',
  },

  '艾琳·海德': {
    name: '艾琳·海德',
    avatarUrl: 'https://picsum.photos/400/600?random=88',
    stats: {
      charm: 85,
      luck: 55,
      evasion: 22,
      crit: 18,
      willpower: 170,
      sexPower: 75,
      baseEndurance: 65,
      maxEndurance: 190,
      maxPleasure: 115,
      maxClimaxCount: 4,
    },
    skillIds: ['s_tease', 's_kiss', 's_observe', 's_rest'],
    description: '教导主任，严厉但内心温柔',
  },

  '卡洛琳·兰德尔': {
    name: '卡洛琳·兰德尔',
    avatarUrl: 'https://picsum.photos/400/600?random=86',
    stats: {
      charm: 75,
      luck: 50,
      evasion: 30,
      crit: 25,
      willpower: 160,
      sexPower: 70,
      baseEndurance: 60,
      maxEndurance: 180,
      maxPleasure: 110,
      maxClimaxCount: 3,
    },
    skillIds: ['s_strip', 's_spank', 's_taunt'],
    description: '教学副院长',
  },

  '蕾西·布莱克': {
    name: '蕾西·布莱克',
    avatarUrl: 'https://picsum.photos/400/600?random=87',
    stats: {
      charm: 70,
      luck: 60,
      evasion: 15,
      crit: 20,
      willpower: 150,
      sexPower: 65,
      baseEndurance: 55,
      maxEndurance: 170,
      maxPleasure: 105,
      maxClimaxCount: 3,
    },
    skillIds: ['s_tease', 's_dirtytalk', 's_observe'],
    description: '训育老师',
  },

  '米莉娅·格林伍德': {
    name: '米莉娅·格林伍德',
    avatarUrl: 'https://picsum.photos/400/600?random=89',
    stats: {
      charm: 75,
      luck: 55,
      evasion: 18,
      crit: 15,
      willpower: 145,
      sexPower: 60,
      baseEndurance: 50,
      maxEndurance: 165,
      maxPleasure: 100,
      maxClimaxCount: 3,
    },
    skillIds: ['s_kiss', 's_dirtytalk', 's_rest'],
    description: '保健老师',
  },

  '塞西莉亚·罗森': {
    name: '塞西莉亚·罗森',
    avatarUrl: 'https://picsum.photos/400/600?random=90',
    stats: {
      charm: 80,
      luck: 65,
      evasion: 25,
      crit: 20,
      willpower: 165,
      sexPower: 70,
      baseEndurance: 60,
      maxEndurance: 175,
      maxPleasure: 110,
      maxClimaxCount: 3,
    },
    skillIds: ['s_tease', 's_kiss', 's_pheromone'],
    description: '生理卫生课老师',
  },

  // ========== 学生 - 高年级 ==========
  '莉莉安娜·蒙特古': {
    name: '莉莉安娜·蒙特古',
    avatarUrl: 'https://picsum.photos/400/600?random=91',
    stats: {
      charm: 70,
      luck: 50,
      evasion: 35,
      crit: 30,
      willpower: 170,
      sexPower: 75,
      baseEndurance: 65,
      maxEndurance: 200,
      maxPleasure: 120,
      maxClimaxCount: 4,
    },
    skillIds: ['s_strip', 's_spank', 's_observe', 's_bind'],
    description: '风纪委员会成员，高年级学生',
  },

  '索菲亚·克劳斯': {
    name: '索菲亚·克劳斯',
    avatarUrl: 'https://picsum.photos/400/600?random=92',
    stats: {
      charm: 95,
      luck: 80,
      evasion: 40,
      crit: 45,
      willpower: 190,
      sexPower: 85,
      baseEndurance: 75,
      maxEndurance: 250,
      maxPleasure: 150,
      maxClimaxCount: 5,
    },
    skillIds: ['s_kiss', 's_massage', 's_pheromone', 's_observe'],
    description: '学生会会长',
  },

  '克莱尔·温斯顿': {
    name: '克莱尔·温斯顿',
    avatarUrl: 'https://picsum.photos/400/600?random=93',
    stats: {
      charm: 60,
      luck: 55,
      evasion: 15,
      crit: 12,
      willpower: 140,
      sexPower: 55,
      baseEndurance: 45,
      maxEndurance: 160,
      maxPleasure: 100,
      maxClimaxCount: 3,
    },
    skillIds: ['s_tease', 's_dirtytalk', 's_rest'],
    description: '普通高年级学生',
  },

  // ========== 学生 - 中年级 ==========
  '伊莎贝拉·德雷克': {
    name: '伊莎贝拉·德雷克',
    avatarUrl: 'https://picsum.photos/400/600?random=94',
    stats: {
      charm: 95,
      luck: 75,
      evasion: 35,
      crit: 40,
      willpower: 200,
      sexPower: 80,
      baseEndurance: 70,
      maxEndurance: 220,
      maxPleasure: 140,
      maxClimaxCount: 4,
    },
    skillIds: ['s_kiss', 's_spank', 's_massage', 's_observe'],
    description: '中年级顶尖学生',
  },

  '艾米丽·布朗': {
    name: '艾米丽·布朗',
    avatarUrl: 'https://picsum.photos/400/600?random=95',
    stats: {
      charm: 70,
      luck: 50,
      evasion: 28,
      crit: 25,
      willpower: 155,
      sexPower: 65,
      baseEndurance: 55,
      maxEndurance: 170,
      maxPleasure: 105,
      maxClimaxCount: 3,
    },
    skillIds: ['s_tease', 's_strip', 's_rest'],
    description: '中年级学生',
  },
};

/**
 * 将敌人数据转换为完整的角色对象
 */
export function getEnemyByName(name: string): Character | undefined {
  const enemyData = ENEMY_DATABASE[name];
  if (!enemyData) {
    return undefined;
  }

  return {
    id: name,
    name: enemyData.name,
    avatarUrl: enemyData.avatarUrl,
    isPlayer: false,
    statusEffects: [],
    items: [],
    skills: createSkills(enemyData.skillIds),
    stats: {
      maxEndurance: enemyData.stats.maxEndurance,
      currentEndurance: enemyData.stats.maxEndurance,
      maxPleasure: enemyData.stats.maxPleasure,
      currentPleasure: 0,
      willpower: enemyData.stats.willpower,
      baseWillpower: enemyData.stats.willpower,
      climaxCount: 0,
      maxClimaxCount: enemyData.stats.maxClimaxCount,
      sexPower: enemyData.stats.sexPower,
      baseEndurance: enemyData.stats.baseEndurance,
      evasion: enemyData.stats.evasion,
      crit: enemyData.stats.crit,
      charm: enemyData.stats.charm,
      luck: enemyData.stats.luck,
    },
  };
}

/**
 * 获取所有敌人名称列表
 */
export function getAllEnemyNames(): string[] {
  return Object.keys(ENEMY_DATABASE);
}
