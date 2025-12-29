// Types derived from the provided Zod schema structure

export interface CharacterBase {
  _等级: number;
  $潜力: number;
  经验值: number;
  $今日经验: number;
  _魅力: number;
  _幸运: number;
  _声望: number;
  _段位: "无段位" | "D" | "C" | "B" | "A" | "S" | "SS" | "SSS";
  段位积分: number;
}

export interface CoreStats {
  _最大耐力: number;
  _耐力: number;
  _最大快感: number;
  _快感: number;
  $基础性斗力: number;
  $基础忍耐力: number;
  $闪避率: number;
  $暴击率: number;
  _堕落度: number;
  _意志力: number;
}

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

export interface InventoryItem {
  类型: "消耗品" | "装备" | "材料" | "特殊";
  等级: "C" | "B" | "A" | "S" | "SS";
  数量: number;
  效果描述: string;
  描述: string;
}

export interface Equipment {
  主装备: string;
  副装备: string;
  饰品1: string;
  饰品2: string;
  特殊装备: string;
}

export interface Quest {
  名称?: string; // Optional because Main uses explicit name, Side uses index usually but we map it
  描述: string;
  类型?: "日常" | "特殊" | "限时" | "隐藏";
  状态: "进行中" | "已完成" | "已失败" | "已放弃";
  目标: Record<string, any>;
  奖励: string;
  期限: string;
}

export interface Relationship {
  好感度: number;
  关系类型: "陌生人" | "同学" | "朋友" | "恋人" | "主仆" | "完全臣服" | "仇敌";
  调教进度: number;
  臣服度: number;
}

export interface LocationSystem {
  坐标: string;
  楼层: number;
  地点名称: string;
}

export interface TimeSystem {
  日期: string;
  星期: number;
  时间: string;
}

export interface GameState {
  角色基础: CharacterBase;
  核心状态: CoreStats;
  _永久状态: {
    $状态列表: string[];
    $加成统计: PermanentBonus;
  };
  物品系统: {
    $学园金币: number;
    $背包: Record<string, InventoryItem>;
    $装备栏: Equipment;
  };
  任务系统: {
    主线任务: Quest;
    支线任务: Record<string, Quest>;
  };
  关系系统: {
    在场人物: string[];
    [key: string]: Relationship | string[] | any; // Simplified for dynamic keys
  };
  位置系统: LocationSystem;
  时间系统: TimeSystem;
  势力声望: Record<string, number>;
  性斗系统: any; // Simplified for this UI demo
  技能系统: any;
}

export type ModalType = 'CHARACTER' | 'INVENTORY' | 'QUESTS' | 'RELATIONSHIPS' | 'MAP' | 'COMBAT' | 'SETTINGS' | null;