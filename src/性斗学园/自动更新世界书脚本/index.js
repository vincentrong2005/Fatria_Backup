/**
 * 性斗学园 - 自动更新世界书脚本
 * 
 * 功能：
 * 1. 检测世界书中的版本号条目
 * 2. 从远程获取最新版本号
 * 3. 比较版本并在需要时自动更新角色卡
 * 
 * 使用方法：
 * 1. 在世界书中创建一个条目，键名为 "版本号" 或 "version"
 * 2. 内容格式：当前版本: 1.0.0
 * 3. 脚本会自动检测并更新
 */

// ==================== 配置区 ====================
const CONFIG = {
  // 角色卡 PNG 文件的 CDN 地址
  characterCardUrl: 'https://cdn.jsdelivr.net/gh/vincentrong2005/Fatria/src/性斗学园/性斗学院超级重制版.png',
  
  // 版本号文件的 CDN 地址（纯文本文件，内容如：1.2.3）
  versionFileUrl: 'https://cdn.jsdelivr.net/gh/vincentrong2005/Fatria/src/性斗学园/version.txt',
  
  // 世界书中版本号条目的关键词（支持多个）
  versionKeywords: ['版本号', 'version', '当前版本'],
  
  // 是否启用自动更新（设为 false 则只检查不更新）
  autoUpdate: true,
  
  // 更新后刷新页面的延迟时间（毫秒）
  reloadDelay: 3000,
};

// ==================== 工具函数 ====================

/**
 * 从世界书条目中提取版本号
 * @param {string} content - 世界书条目内容
 * @returns {string|null} - 版本号字符串（如 "1.2.3"）或 null
 */
function extractVersionFromContent(content) {
  if (!content) return null;
  
  // 匹配常见的版本号格式：1.2.3, v1.2.3, 版本: 1.2.3 等
  const versionPatterns = [
    /(?:当前)?版本\s*[:：]\s*v?(\d+\.\d+\.\d+)/i,
    /version\s*[:：]\s*v?(\d+\.\d+\.\d+)/i,
    /v?(\d+\.\d+\.\d+)/,
  ];
  
  for (const pattern of versionPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * 比较两个版本号
 * @param {string} version1 - 版本号1
 * @param {string} version2 - 版本号2
 * @returns {number} - 返回 -1 (v1 < v2), 0 (v1 == v2), 1 (v1 > v2)
 */
function compareVersions(version1, version2) {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1 = v1Parts[i] || 0;
    const v2 = v2Parts[i] || 0;
    
    if (v1 < v2) return -1;
    if (v1 > v2) return 1;
  }
  
  return 0;
}

/**
 * 从世界书中查找版本号条目
 * @returns {string|null} - 当前版本号或 null
 */
function getCurrentVersionFromWorldBook() {
  try {
    // 获取当前角色的世界书
    const characterId = this_chid;
    if (characterId === undefined) {
      console.warn('[自动更新] 无法获取当前角色ID');
      return null;
    }
    
    const character = characters[characterId];
    if (!character || !character.data || !character.data.character_book) {
      console.warn('[自动更新] 当前角色没有世界书');
      return null;
    }
    
    const worldBook = character.data.character_book;
    if (!worldBook.entries || worldBook.entries.length === 0) {
      console.warn('[自动更新] 世界书中没有条目');
      return null;
    }
    
    // 查找版本号条目
    for (const entry of worldBook.entries) {
      // 检查关键词是否匹配
      const matchesKeyword = CONFIG.versionKeywords.some(keyword => 
        entry.keys?.some(key => key.toLowerCase().includes(keyword.toLowerCase())) ||
        entry.comment?.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (matchesKeyword) {
        const version = extractVersionFromContent(entry.content);
        if (version) {
          console.log(`[自动更新] 在世界书中找到版本号: ${version}`);
          return version;
        }
      }
    }
    
    console.warn('[自动更新] 未在世界书中找到版本号条目');
    return null;
  } catch (error) {
    console.error('[自动更新] 读取世界书版本号时出错:', error);
    return null;
  }
}

/**
 * 从远程获取最新版本号
 * @returns {Promise<string|null>} - 最新版本号或 null
 */
async function getLatestVersionFromRemote() {
  try {
    console.log('[自动更新] 正在从远程获取最新版本号...');
    const response = await fetch(CONFIG.versionFileUrl);
    
    if (!response.ok) {
      console.warn(`[自动更新] 获取版本文件失败: ${response.status}`);
      return null;
    }
    
    const versionText = await response.text();
    const version = extractVersionFromContent(versionText.trim());
    
    if (version) {
      console.log(`[自动更新] 远程最新版本: ${version}`);
      return version;
    } else {
      console.warn('[自动更新] 无法从远程版本文件中解析版本号');
      return null;
    }
  } catch (error) {
    console.error('[自动更新] 获取远程版本号时出错:', error);
    return null;
  }
}

/**
 * 执行角色卡更新
 * @returns {Promise<boolean>} - 更新是否成功
 */
async function updateCharacterCard() {
  try {
    console.log('[自动更新] 开始下载并更新角色卡...');
    
    // 下载角色卡 PNG 文件
    const response = await fetch(CONFIG.characterCardUrl);
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status}`);
    }
    
    const blob = await response.blob();
    
    // 导入角色卡
    const characterName = substitudeMacros('{{char}}');
    await importRawCharacter(characterName, blob);
    
    console.log('[自动更新] 角色卡更新成功');
    return true;
  } catch (error) {
    console.error('[自动更新] 更新角色卡时出错:', error);
    toastr.error(`角色卡更新失败: ${error.message}`, '性斗学园自动更新');
    return false;
  }
}

// ==================== 主逻辑 ====================

/**
 * 检查并执行自动更新
 */
async function checkAndUpdate() {
  try {
    console.log('[自动更新] ========== 开始检查更新 ==========');
    
    // 1. 获取当前版本
    const currentVersion = getCurrentVersionFromWorldBook();
    if (!currentVersion) {
      console.log('[自动更新] 无法获取当前版本，跳过更新检查');
      return;
    }
    
    // 2. 获取最新版本
    const latestVersion = await getLatestVersionFromRemote();
    if (!latestVersion) {
      console.log('[自动更新] 无法获取最新版本，跳过更新检查');
      return;
    }
    
    // 3. 比较版本
    const comparison = compareVersions(currentVersion, latestVersion);
    
    console.log(`[自动更新] 版本比较: 当前 ${currentVersion} vs 最新 ${latestVersion}`);
    
    if (comparison < 0) {
      // 当前版本低于最新版本，需要更新
      console.log('[自动更新] 检测到新版本，准备更新...');
      
      if (!CONFIG.autoUpdate) {
        toastr.info(
          `检测到新版本 ${latestVersion}（当前: ${currentVersion}），但自动更新已禁用`,
          '性斗学园更新提示'
        );
        return;
      }
      
      // 执行更新
      const success = await updateCharacterCard();
      
      if (success) {
        toastr.success(
          `角色卡已从 ${currentVersion} 更新到 ${latestVersion}，准备刷新页面...`,
          '性斗学园自动更新'
        );
        
        // 延迟刷新页面以让用户看到提示
        setTimeout(() => {
          console.log('[自动更新] 刷新页面以应用更新...');
          triggerSlash('/reload-page');
        }, CONFIG.reloadDelay);
      }
    } else if (comparison === 0) {
      console.log('[自动更新] 当前已是最新版本');
    } else {
      console.log('[自动更新] 当前版本高于远程版本（可能是开发版本）');
    }
    
    console.log('[自动更新] ========== 更新检查完成 ==========');
  } catch (error) {
    console.error('[自动更新] 检查更新时发生错误:', error);
    toastr.error(`自动更新检查失败: ${error.message}`, '性斗学园自动更新');
  }
}

// ==================== 执行入口 ====================

// 立即执行检查
checkAndUpdate();
