/**
 * BOSS战斗系统 - 沐芯兰专属机制
 * 
 * 沐芯兰是一个三阶段BOSS：
 * 1. 代行机体·茉莉（伪装形态）- 50级，高闪避，嚣张雌小鬼
 * 2. 完全同步·祸星茉莉（暴力女王形态）- 88级，高攻击，压倒性力量
 * 3. 真身露出·沐芯兰（羸弱的傲娇女王）- 11级，极度虚弱
 */

import { reactive, ref } from 'vue';

// ==================== 类型定义 ====================
export interface BossState {
  isBossFight: boolean;
  bossId: string;
  currentPhase: 1 | 2 | 3;
  phaseTransitioning: boolean;
  dialogueIndex: number;
  buttonsDisabled: boolean;
  hasUsedMedal: boolean; // 是否使用了三好学生勋章
}

export interface BossDialogue {
  speaker: string;
  text: string;
  emotion?: 'arrogant' | 'angry' | 'weak' | 'tsundere';
}

// ==================== 沐芯兰对话库 ====================
export const MUXINLAN_DIALOGUES = {
  // 第一阶段入场
  phase1_entry: [
    { speaker: '茉莉(?)', text: '"哎呀呀~是哪位不自量力的杂鱼前辈呢？"', emotion: 'arrogant' as const },
    { speaker: '茉莉(?)', text: '"让我猜猜...又是一个想挑战女王大人的蠢货吧？"', emotion: 'arrogant' as const },
    { speaker: '茉莉(?)', text: '"好吧好吧~既然你这么想被玩弄，那我就勉为其难地陪你玩玩吧♡"', emotion: 'arrogant' as const },
  ],
  
  // 第一阶段战斗中（随机）
  phase1_battle: [
    { speaker: '茉莉(?)', text: '"哎呀呀，前辈的攻击是开了自动避让模式吗？真是让人发笑呢~♡"', emotion: 'arrogant' as const },
    { speaker: '茉莉(?)', text: '"就这？就这点程度？杂鱼就是杂鱼呢~"', emotion: 'arrogant' as const },
    { speaker: '茉莉(?)', text: '"再努力一点嘛~不然我都要睡着了呢~"', emotion: 'arrogant' as const },
    { speaker: '茉莉(?)', text: '"前辈真的有在认真吗？还是说...这就是你的全力了？噗~"', emotion: 'arrogant' as const },
    { speaker: '茉莉(?)', text: '"被我的丝线缠住了呢~接下来要怎么玩弄你好呢？"', emotion: 'arrogant' as const },
  ],
  
  // 第一阶段锁血时
  phase1_lockHp: [
    { speaker: '茉莉(?)', text: '"呜...！（身体微微颤抖）"', emotion: 'angry' as const },
    { speaker: '茉莉(?)', text: '"哼...没想到你还有两下子嘛..."', emotion: 'angry' as const },
    { speaker: '茉莉(?)', text: '"不过...这种程度就想让我认输？"', emotion: 'angry' as const },
  ],
  
  // 第一阶段到第二阶段转换
  phase1_to_2: [
    { speaker: '???', text: '"...够了。"', emotion: 'angry' as const },
    { speaker: '???', text: '"看来...是我太小看你了呢。"', emotion: 'angry' as const },
    { speaker: '祸星茉莉', text: '"那么...就让你见识一下真正的力量吧。"', emotion: 'angry' as const },
    { speaker: '祸星茉莉', text: '"【过载同步】——启动！"', emotion: 'angry' as const },
    { speaker: '꧁༺茉莉༻꧂', text: '"利息已经滚到你付不起的程度了。现在，把你的胜算全部清零吧。"', emotion: 'angry' as const },
  ],
  
  // 第二阶段战斗中（随机）
  phase2_battle: [
    { speaker: '꧁༺茉莉༻꧂', text: '"感受到了吗？这就是被完全支配的感觉。"', emotion: 'angry' as const },
    { speaker: '꧁༺茉莉༻꧂', text: '"你的意识...现在归我所有了。"', emotion: 'angry' as const },
    { speaker: '꧁༺茉莉༻꧂', text: '"让我的傀儡们...把你撕碎吧！"', emotion: 'angry' as const },
    { speaker: '꧁༺茉莉༻꧂', text: '"在女王面前...跪下吧，杂鱼。"', emotion: 'angry' as const },
    { speaker: '꧁༺茉莉༻꧂', text: '"这就是与女王为敌的下场。"', emotion: 'angry' as const },
    { speaker: '꧁༺茉莉༻꧂', text: '"挣扎吧，反抗吧...然后绝望吧。"', emotion: 'angry' as const },
  ],
  
  // 第二阶段锁血时
  phase2_lockHp: [
    { speaker: '꧁༺茉莉༻꧂', text: '"不...不可能...！"', emotion: 'angry' as const },
    { speaker: '꧁༺茉莉༻꧂', text: '"这具傀儡...竟然...！"', emotion: 'angry' as const },
  ],
  
  // 第二阶段到第三阶段转换
  phase2_to_3: [
    { speaker: '꧁༺茉莉༻꧂', text: '"不...不要...！（傀儡开始崩解）"', emotion: 'weak' as const },
    { speaker: '???', text: '"啊啊啊啊——！！！"', emotion: 'weak' as const },
    { speaker: '系统', text: '【傀儡"茉莉"已被击毁，意识强制弹回本体】', emotion: 'weak' as const },
    { speaker: '沐芯兰（真身）', text: '"咳...咳咳...（瘫坐在地，浑身颤抖）"', emotion: 'weak' as const },
    { speaker: '沐芯兰（真身）', text: '"茉莉...竟然被你这种杂鱼...（咬牙）"', emotion: 'tsundere' as const },
    { speaker: '沐芯兰（真身）', text: '"...算了，维修费就从你的校园金币里扣！"', emotion: 'tsundere' as const },
  ],
  
  // 第三阶段战斗中（顺序播放，有连续性）
  phase3_battle: [
    { speaker: '沐芯兰（真身）', text: '"别、别过来！我警告你...（声音颤抖）"', emotion: 'tsundere' as const },
    { speaker: '沐芯兰（真身）', text: '"看什么看！没见过真正的女王吗？"', emotion: 'tsundere' as const },
    { speaker: '沐芯兰（真身）', text: '"扶、扶我一下...这是命令！"', emotion: 'tsundere' as const },
    { speaker: '沐芯兰（真身）', text: '"...你还在等什么？快点啊笨蛋！"', emotion: 'tsundere' as const },
    { speaker: '沐芯兰（真身）', text: '"（小声）...为什么不直接结束呢..."', emotion: 'weak' as const },
    { speaker: '沐芯兰（真身）', text: '"明明只是个杂鱼...为什么能在这种时候..."', emotion: 'weak' as const },
    { speaker: '沐芯兰（真身）', text: '"（抓住衣角）...别走..."', emotion: 'weak' as const },
    { speaker: '沐芯兰（真身）', text: '"我才不会...认输呢...笨蛋杂鱼..."', emotion: 'tsundere' as const },
    { speaker: '沐芯兰（真身）', text: '"谢、谢谢什么的，我才不会说呢！"', emotion: 'tsundere' as const },
    { speaker: '沐芯兰（真身）', text: '"...（低头不语，身体微微发抖）"', emotion: 'weak' as const },
  ],
  
  // 使用三好学生勋章时（跳过第二阶段）
  medal_trigger: [
    { speaker: '茉莉(?)', text: '"那、那个是...！"', emotion: 'weak' as const },
    { speaker: '茉莉(?)', text: '"为什么你会有那个东西...！"', emotion: 'weak' as const },
    { speaker: '???', text: '"（傀儡突然停止动作）"', emotion: 'weak' as const },
    { speaker: '沐芯兰（真身）', text: '"...你是从哪里得到那个勋章的？"', emotion: 'tsundere' as const },
    { speaker: '沐芯兰（真身）', text: '"（声音颤抖）那是...那是我以前..."', emotion: 'weak' as const },
    { speaker: '沐芯兰（真身）', text: '"...算了。既然你有那个东西..."', emotion: 'tsundere' as const },
    { speaker: '沐芯兰（真身）', text: '"（傀儡自行解除）...我就亲自来面对你吧。"', emotion: 'tsundere' as const },
  ],
};

// ==================== BOSS状态管理 ====================
export const bossState = reactive<BossState>({
  isBossFight: false,
  bossId: '',
  currentPhase: 1,
  phaseTransitioning: false,
  dialogueIndex: 0,
  buttonsDisabled: false,
  hasUsedMedal: false,
});

// 当前显示的对话
export const currentDialogue = ref<BossDialogue | null>(null);
export const dialogueQueue = ref<BossDialogue[]>([]);
export const isShowingDialogue = ref(false);

// ==================== BOSS检测函数 ====================
/**
 * 检测是否是沐芯兰BOSS战
 */
export function isMuxinlanBoss(enemyName: string): boolean {
  if (!enemyName) return false;
  const name = enemyName.toLowerCase();
  return name.includes('茉莉') || name.includes('沐芯兰') || name.includes('muxinlan');
}

/**
 * 初始化沐芯兰BOSS战
 */
export function initMuxinlanBoss(): void {
  bossState.isBossFight = true;
  bossState.bossId = 'muxinlan';
  bossState.currentPhase = 1;
  bossState.phaseTransitioning = false;
  bossState.dialogueIndex = 0;
  bossState.buttonsDisabled = false;
  bossState.hasUsedMedal = false;
  
  // 播放入场对话
  queueDialogues(MUXINLAN_DIALOGUES.phase1_entry);
}

/**
 * 重置BOSS状态
 */
export function resetBossState(): void {
  bossState.isBossFight = false;
  bossState.bossId = '';
  bossState.currentPhase = 1;
  bossState.phaseTransitioning = false;
  bossState.dialogueIndex = 0;
  bossState.buttonsDisabled = false;
  bossState.hasUsedMedal = false;
  currentDialogue.value = null;
  dialogueQueue.value = [];
  isShowingDialogue.value = false;
}

// ==================== 对话系统 ====================
/**
 * 将对话加入队列
 */
export function queueDialogues(dialogues: BossDialogue[]): void {
  dialogueQueue.value.push(...dialogues);
  if (!isShowingDialogue.value) {
    showNextDialogue();
  }
}

/**
 * 显示下一条对话
 */
export function showNextDialogue(): void {
  if (dialogueQueue.value.length === 0) {
    isShowingDialogue.value = false;
    currentDialogue.value = null;
    return;
  }
  
  isShowingDialogue.value = true;
  currentDialogue.value = dialogueQueue.value.shift() || null;
}

/**
 * 跳过当前对话
 */
export function skipDialogue(): void {
  showNextDialogue();
}

/**
 * 获取随机战斗对话
 */
export function getRandomBattleDialogue(phase: 1 | 2 | 3): BossDialogue | null {
  let dialogues: BossDialogue[];
  
  switch (phase) {
    case 1:
      dialogues = MUXINLAN_DIALOGUES.phase1_battle;
      break;
    case 2:
      dialogues = MUXINLAN_DIALOGUES.phase2_battle;
      break;
    case 3:
      // 第三阶段使用顺序对话
      const idx = bossState.dialogueIndex;
      if (idx < MUXINLAN_DIALOGUES.phase3_battle.length) {
        bossState.dialogueIndex++;
        return MUXINLAN_DIALOGUES.phase3_battle[idx];
      }
      // 循环最后几条
      return MUXINLAN_DIALOGUES.phase3_battle[MUXINLAN_DIALOGUES.phase3_battle.length - 1];
    default:
      return null;
  }
  
  return dialogues[Math.floor(Math.random() * dialogues.length)];
}

// ==================== 阶段切换 ====================
/**
 * 获取当前阶段的敌人数据键名
 */
export function getMuxinlanDataKey(phase: 1 | 2 | 3): string {
  return `沐芯兰_${phase}`;
}

/**
 * 获取当前阶段的显示名称
 */
export function getMuxinlanDisplayName(phase: 1 | 2 | 3): string {
  switch (phase) {
    case 1:
      return '茉莉(?)';
    case 2:
      return '꧁༺茉莉༻꧂';
    case 3:
      return '沐芯兰（真身）';
    default:
      return '茉莉';
  }
}

/**
 * 获取当前阶段的头像
 */
export function getMuxinlanAvatarUrl(phase: 1 | 2 | 3): string {
  return `https://raw.githubusercontent.com/vincentrong2005/Fatria/main/图片素材/性斗学园/头像/沐芯兰_${phase}.png`;
}

/**
 * 检查是否应该锁血（阻止高潮）
 */
export function shouldLockPleasure(
  currentPleasure: number,
  maxPleasure: number,
  currentClimaxCount: number,
  phase: 1 | 2 | 3
): boolean {
  if (!bossState.isBossFight || bossState.bossId !== 'muxinlan') {
    return false;
  }
  
  // 第一阶段：快感达到最大快感-1时锁血
  if (phase === 1 && currentPleasure >= maxPleasure - 1) {
    return true;
  }
  
  // 第二阶段：高潮次数达到4次且快感即将满时锁血
  if (phase === 2 && currentClimaxCount >= 4 && currentPleasure >= maxPleasure - 1) {
    return true;
  }
  
  return false;
}

/**
 * 检查是否应该触发阶段转换
 */
export function shouldTransitionPhase(
  currentPleasure: number,
  maxPleasure: number,
  currentClimaxCount: number,
  phase: 1 | 2 | 3
): { shouldTransition: boolean; nextPhase: 1 | 2 | 3 } {
  if (!bossState.isBossFight || bossState.bossId !== 'muxinlan') {
    return { shouldTransition: false, nextPhase: phase };
  }
  
  // 获取当前阶段的高潮次数上限
  const climaxLimit = BOSS_CONFIG.muxinlan.climaxLimits[phase - 1];
  
  // 第一阶段：快感达到最大值时，转换到第二阶段
  if (phase === 1 && currentPleasure >= maxPleasure) {
    // 如果使用了勋章，跳过第二阶段直接到第三阶段
    if (bossState.hasUsedMedal) {
      return { shouldTransition: true, nextPhase: 3 };
    }
    return { shouldTransition: true, nextPhase: 2 };
  }
  
  // 第二阶段：高潮次数达到上限-1且快感达到最大值时，转换到第三阶段
  // 例如：climaxLimit=3时，高潮2次后快感满就转换
  if (phase === 2 && currentClimaxCount >= climaxLimit - 1 && currentPleasure >= maxPleasure) {
    return { shouldTransition: true, nextPhase: 3 };
  }
  
  return { shouldTransition: false, nextPhase: phase };
}

/**
 * 执行阶段转换
 */
export function executePhaseTransition(nextPhase: 1 | 2 | 3): void {
  const currentPhase = bossState.currentPhase;
  bossState.phaseTransitioning = true;
  
  // 播放转换对话
  if (currentPhase === 1 && nextPhase === 2) {
    queueDialogues(MUXINLAN_DIALOGUES.phase1_to_2);
  } else if (currentPhase === 1 && nextPhase === 3) {
    // 使用勋章跳过第二阶段
    queueDialogues(MUXINLAN_DIALOGUES.medal_trigger);
  } else if (currentPhase === 2 && nextPhase === 3) {
    queueDialogues(MUXINLAN_DIALOGUES.phase2_to_3);
  }
  
  // 更新阶段
  bossState.currentPhase = nextPhase;
  bossState.dialogueIndex = 0; // 重置第三阶段对话索引
  
  // 第二阶段禁用按钮
  if (nextPhase === 2) {
    bossState.buttonsDisabled = true;
  }
  
  // 第三阶段解除按钮禁用
  if (nextPhase === 3) {
    bossState.buttonsDisabled = false;
  }
}

/**
 * 完成阶段转换
 */
export function completePhaseTransition(): void {
  bossState.phaseTransitioning = false;
}

// ==================== 特殊道具检测 ====================
/**
 * 检查是否拥有三好学生勋章
 */
export function hasHonorMedal(items: any[]): boolean {
  if (!items || !Array.isArray(items)) return false;
  return items.some(item => 
    item && (
      item.name?.includes('三好学生') ||
      item.name?.includes('荣誉勋章') ||
      item.name?.includes('沐芯兰') ||
      item.id === 'honor_medal_muxinlan'
    )
  );
}

/**
 * 使用三好学生勋章
 */
export function useHonorMedal(): boolean {
  if (bossState.currentPhase !== 1) {
    return false; // 只能在第一阶段使用
  }
  
  bossState.hasUsedMedal = true;
  queueDialogues(MUXINLAN_DIALOGUES.medal_trigger);
  return true;
}

// ==================== 导出BOSS系统配置 ====================
export const BOSS_CONFIG = {
  muxinlan: {
    id: 'muxinlan',
    phases: 3,
    dataKeys: ['沐芯兰_1', '沐芯兰_2', '沐芯兰_3'],
    displayNames: ['茉莉(?)', '꧁༺茉莉༻꧂', '沐芯兰（真身）'],
    levels: [50, 88, 11],
    climaxLimits: [1, 3, 1], // 各阶段的高潮次数上限（胜负规则.高潮次数上限）
    specialItem: '刻有沐芯兰名字的三好学生荣誉勋章',
  },
};
