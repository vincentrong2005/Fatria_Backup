import { compare } from 'compare-versions';

// 常量定义
const CHARACTER_NAME = '性斗学院超级重制版';
const WORLDBOOK_NAME = '性斗学院超级重制版';
const REPO_BASE_URL = 'https://testingcf.jsdelivr.net/gh/vincentrong2005/Fatria/src/性斗学园';
const VERSION_FILE_URL = `${REPO_BASE_URL}/版本号.txt`;
const CHARACTER_FILE_URL = `${REPO_BASE_URL}/性斗学院超级重制版.png`;

/**
 * 检查并执行自动更新
 */
export async function checkUpdate() {
  try {
    console.info('[自动更新] 开始检查更新...');

    // 1. 获取本地版本
    // 尝试获取世界书，如果不存在则会抛出错误，需要捕获
    let worldbook;
    try {
      worldbook = await getWorldbook(WORLDBOOK_NAME);
    } catch (e) {
      console.warn(`[自动更新] 未找到本地世界书 "${WORLDBOOK_NAME}"，跳过版本检查 (可能需要首次导入)`);
      return;
    }

    const versionEntry = worldbook.find(entry => entry.name === '版本号');
    const localVersion = versionEntry?.content.trim() ?? '0.0.0';

    console.info(`[自动更新] 本地版本: ${localVersion}`);

    // 2. 获取远程版本
    const remoteVersionText = await fetch(VERSION_FILE_URL)
      .then(response => {
        if (!response.ok) throw new Error(`无法获取远程版本文件: ${response.statusText}`);
        return response.text();
      })
      .then(text => text.trim())
      .catch((err) => {
        console.warn('[自动更新] 获取远程版本失败', err);
        return null;
      });

    if (!remoteVersionText) {
      return;
    }

    console.info(`[自动更新] 远程版本: ${remoteVersionText}`);

    // 3. 比较版本: 如果 本地版本 >= 远程版本，则无需更新
    // compare-versions: returns true if v1 >= v2
    if (compare(localVersion, remoteVersionText, '>=')) {
      console.info('[自动更新] 当前已是最新版本');
      return;
    }

    // 4. 检查更新环境 (可选，暂时跳过版本检查以兼容旧版酒馆)
    /*
    if (typeof getTavernVersion === 'function' && compare(getTavernVersion(), '1.12.0', '<')) {
       toastr.warning('检测到更新，但酒馆版本过低可能导致兼容性问题', CHARACTER_NAME);
       // 继续更新或返回
    }
    */

    console.info('[自动更新] 检测到新版本，准备更新...');
    if (typeof toastr !== 'undefined') {
      toastr.info(`发现新版本 ${remoteVersionText}，正在自动更新...`, CHARACTER_NAME);
    }

    // 5. 下载并导入角色卡
    const blob = await fetch(CHARACTER_FILE_URL).then(res => {
         if (!res.ok) throw new Error(`下载角色卡失败: ${res.statusText}`);
         return res.blob();
    });

    // 导入角色卡 (这会自动更新关联的世界书，只要卡里包含了书)
    await importRawCharacter(CHARACTER_NAME, blob);

    const successMsg = `更新成功 (${remoteVersionText})! 页面将在3秒后刷新...`;
    console.info(`[自动更新] ${successMsg}`);
    
    if (typeof toastr !== 'undefined') {
      toastr.success(successMsg, CHARACTER_NAME, { timeOut: 3000, progressBar: true });
    }
    
    // 6. 刷新页面以生效
    setTimeout(() => {
        if (typeof triggerSlash === 'function') {
            triggerSlash('/reload-page');
        } else {
            window.location.reload();
        }
    }, 3000);

  } catch (error) {
    console.error('[自动更新] 更新失败:', error);
    if (typeof toastr !== 'undefined') {
      toastr.error(`更新失败: ${(error as Error).message}`, CHARACTER_NAME);
    }
  }
}

// 脚本加载后延迟执行检查，避免与初始化冲突
setTimeout(checkUpdate, 2000);
