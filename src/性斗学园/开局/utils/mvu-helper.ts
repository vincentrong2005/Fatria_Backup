// MVU 变量操作辅助函数
// 注意：lodash 和 Mvu 都是全局可用的，不需要导入

/**
 * 等待 MVU 初始化并获取 MVU 数据
 */
export async function getMvuData(): Promise<any> {
  const globalAny = window as any;
  if (globalAny.waitGlobalInitialized) {
    await globalAny.waitGlobalInitialized('Mvu');
  }
  if (!globalAny.Mvu) {
    console.warn('MVU 变量框架未初始化');
    return null;
  }
  return globalAny.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
}

/**
 * 更新 MVU 变量
 * @param path 变量路径，如 '角色基础._等级'
 * @param value 新值
 * @param reason 更新原因（可选）
 */
export async function updateMvuVariable(path: string, value: any, reason?: string): Promise<void> {
  const globalAny = window as any;
  if (!globalAny.Mvu) {
    await getMvuData(); // 确保初始化
  }
  if (!globalAny.Mvu) {
    console.error('MVU 变量框架不可用');
    return;
  }

  try {
    // 获取当前 MVU 数据
    const mvuData = globalAny.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData) {
      console.error('无法获取 MVU 数据');
      return;
    }

    // 确保 stat_data 存在
    if (!mvuData.stat_data) {
      mvuData.stat_data = {};
    }

    // 使用 lodash 设置值（lodash 是全局可用的）
    _.set(mvuData.stat_data, path, value);

    // 写回 MVU 数据
    await globalAny.Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
  } catch (error) {
    console.error('更新 MVU 变量失败:', error);
  }
}

/**
 * 批量更新 MVU 变量
 * @param updates 要更新的变量路径和值的映射
 */
export async function updateMvuVariables(updates: Record<string, any>): Promise<void> {
  const globalAny = window as any;
  if (!globalAny.Mvu) {
    await getMvuData(); // 确保初始化
  }
  if (!globalAny.Mvu) {
    console.error('MVU 变量框架不可用');
    return;
  }

  try {
    const mvuData = globalAny.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData) {
      console.error('无法获取 MVU 数据');
      return;
    }

    if (!mvuData.stat_data) {
      mvuData.stat_data = {};
    }

    // 批量设置值
    for (const [path, value] of Object.entries(updates)) {
      _.set(mvuData.stat_data, path, value);
    }

    await globalAny.Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
  } catch (error) {
    console.error('批量更新 MVU 变量失败:', error);
  }
}

/**
 * 从 MVU 数据同步到本地状态
 */
export function syncFromMvu(mvuData: any): any {
  if (!mvuData || !mvuData.stat_data) {
    return null;
  }

  // lodash 是全局可用的
  return {
    角色基础: {
      _等级: _.get(mvuData.stat_data, '角色基础._等级', 1),
      $潜力: _.get(mvuData.stat_data, '角色基础.$潜力', 5.0),
      _魅力: _.get(mvuData.stat_data, '角色基础._魅力', 10),
      _幸运: _.get(mvuData.stat_data, '角色基础._幸运', 10),
    },
    核心状态: {
      _最大耐力: _.get(mvuData.stat_data, '核心状态._最大耐力', 100),
      _最大快感: _.get(mvuData.stat_data, '核心状态._最大快感', 100),
      $基础性斗力: _.get(mvuData.stat_data, '核心状态.$基础性斗力', 10),
      $基础忍耐力: _.get(mvuData.stat_data, '核心状态.$基础忍耐力', 10),
      $闪避率: _.get(mvuData.stat_data, '核心状态.$闪避率', 0),
      $暴击率: _.get(mvuData.stat_data, '核心状态.$暴击率', 0),
    },
  };
}

