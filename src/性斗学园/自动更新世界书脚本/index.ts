import { compare } from 'compare-versions';

const CHARACTER_NAME = '性斗学院超级重制版';
const WORLDBOOK_NAME = '性斗学园';
const VERSION_ENTRY_NAME = '版本号';
const GITHUB_BASE_URL = 'https://testingcf.jsdelivr.net/gh/vincentrong2005/Fatria/src/性斗学园';

export async function checkUpdate() {
  const version =
    (await getWorldbook(WORLDBOOK_NAME))
      .find(entry => entry.name === VERSION_ENTRY_NAME)
      ?.content.trim() ?? '0.0.0';

  const remoteVersion = await fetch(`${GITHUB_BASE_URL}/世界书/版本号.txt`)
    .then(response => response.text())
    .then(text => text.trim())
    .catch(() => '0.0.0');

  if (compare(version, remoteVersion, '>=')) {
    return;
  }

  if (compare(getTavernVersion(), '4.3.18', '<')) {
    toastr.warning('检测到角色卡有更新，但酒馆助手版本过低，无法自动更新', CHARACTER_NAME);
    return;
  }

  await importRawCharacter(
    CHARACTER_NAME,
    await fetch(`${GITHUB_BASE_URL}/性斗学院超级重制版.png`).then(response => response.blob()),
  );

  toastr.success('角色卡自动更新成功, 准备刷新页面以生效...', CHARACTER_NAME);
  setTimeout(() => triggerSlash('/reload-page'), 3000);
}
