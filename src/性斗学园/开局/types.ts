export enum Gender {
  MALE = '男',
  FEMALE = '女',
  OTHER = '非二元'
}

export enum Difficulty {
  STORY = '剧情模式 (简单)',
  NORMAL = '学园生活 (普通)',
  HARDCORE = '地狱开局 (困难)'
}

// 根据 MVU 变量结构定义的属性路径
export interface CharacterAttributes {
  // 角色基础
  角色基础: {
    _等级: number;
    $潜力: number;
    _魅力: number;
    _幸运: number;
    经验值?: number; // 当前经验值
    $今日经验?: number; // 今日获得经验
  };
  
  // 核心状态
  核心状态: {
    _最大耐力: number;
    _最大快感: number;
    _耐力?: number; // 当前耐力
    _快感?: number; // 当前快感
    _意志力?: number; // 意志力（用于计算忍耐力）
    $基础性斗力: number; // 注意：实际性斗力由公式计算，此值仅用于显示
    $基础忍耐力: number; // 注意：实际忍耐力由公式计算，此值仅用于显示
    $闪避率: number;
    $暴击率: number;
  };
}

// 永久状态加成统计
export interface PermanentBonus {
  $魅力加成: number;
  $幸运加成: number;
  $基础性斗力加成: number;
  $基础性斗力成算: number;
  $基础忍耐力加成: number;
  $基础忍耐力成算: number;
  $闪避率加成: number;
  $暴击率加成: number;
  $意志力加成: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: 'active' | 'constitution'; // Active = Action, Constitution = Passive Body Trait
  cost?: number; // Point cost if applicable
  icon: string;
  effectDescription?: string; // Short text for UI
}

export interface Archetype {
  id: string;
  name: string;
  description: string;
  icon: string; 
  passiveSkill: Skill;
  // 永久状态
  permanentState: {
    name: string; // 永久状态名称
    bonus: PermanentBonus; // 永久状态加成
  };
  hidden?: boolean; // 是否隐藏（需要特殊代码才能显示）
}

export interface CharacterData {
  name: string;
  age: number;
  gender: Gender;
  appearance: string;
  personality: string;
  background: string;
  difficulty: Difficulty;
  archetypeId: string | null;
  
  // The core stats - 使用嵌套结构匹配 MVU 变量
  attributes: CharacterAttributes;
  
  // Body stats
  height: number; 
  weight: number; 
  cupSize: string; 
  hips: number; 
  cockLength: number; 
  maleGenitalType?: string; // 男性性器特征（当hasPenis为true时使用）
  femaleGenitalType?: string; // 女性性器特征（当hasBreasts为true时使用） 

  // Body Configuration (For Non-binary mostly)
  configFeatures: {
    hasBreasts: boolean;
    hasPenis: boolean;
  };

  // Skills
  initialActiveSkills: string[]; // IDs of selected active skills
  initialPassiveSkills: string[]; // IDs of selected constitution skills
}

// Default starting values based on MVU schema defaults
export const INITIAL_ATTRIBUTES: CharacterAttributes = {
  角色基础: {
    _等级: 1,
    $潜力: 5.0,
    _魅力: 10,
    _幸运: 10,
    经验值: 0,
    $今日经验: 0,
  },
  核心状态: {
    _最大耐力: 100,
    _最大快感: 100,
    _耐力: 100,
    _快感: 0,
    _意志力: 100,
    $基础性斗力: 10, // 注意：实际性斗力 = (等级 x 潜力) + 加成，此值仅用于显示
    $基础忍耐力: 10, // 注意：实际忍耐力 = (等级 x 意志力/10) + 加成，此值仅用于显示
    $闪避率: 0,
    $暴击率: 0,
  },
};

export const INITIAL_CHARACTER_DATA: CharacterData = {
  name: '',
  age: 18,
  gender: Gender.FEMALE,
  appearance: '',
  personality: '',
  background: '',
  difficulty: Difficulty.NORMAL,
  archetypeId: null,
  attributes: { ...INITIAL_ATTRIBUTES },
  height: 165,
  weight: 50,
  cupSize: 'C',
  hips: 90,
  cockLength: 15,
  maleGenitalType: undefined,
  femaleGenitalType: undefined,
  configFeatures: {
    hasBreasts: true,
    hasPenis: false
  },
  initialActiveSkills: [],
  initialPassiveSkills: [],
};
