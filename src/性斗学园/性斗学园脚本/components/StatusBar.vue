<template>
  <div v-if="isVisible" class="status-bar-overlay" @click.self="close">
    <div class="status-bar-container" @click.stop>
      <!-- 手机边框 -->
      <div class="phone-frame">
        <!-- 动态背景 -->
        <div class="phone-background">
          <div class="bg-gradient-1"></div>
          <div class="bg-gradient-2"></div>
        </div>

        <!-- 状态栏头部 -->
        <div class="status-header">
          <div class="header-left">
            <button
              v-if="currentPage !== 'dashboard'"
              class="back-button"
              title="返回主页"
              @click="currentPage = 'dashboard'"
            >
              <i class="fas fa-home"></i>
            </button>
            <div class="header-time">{{ currentTime }}</div>
          </div>
          <div class="header-icons">
            <i class="fas fa-signal"></i>
            <span class="signal-text">5G</span>
            <div class="battery-indicator">
              <div class="battery-fill"></div>
            </div>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="status-content">
          <!-- Dashboard 主页（默认显示） -->
          <DashboardPage v-if="currentPage === 'dashboard'" :character-data="characterData" />

          <!-- Profile 档案页 -->
          <ProfilePage v-if="currentPage === 'profile'" :character-data="characterData" :combat-data="combatData" />

          <!-- Inventory 背包页 -->
          <InventoryPage v-if="currentPage === 'inventory'" :character-data="characterData" />

          <!-- Quest 任务页 -->
          <QuestPage v-if="currentPage === 'quest'" :character-data="characterData" />

          <!-- Relationship 关系页 -->
          <RelationshipPage v-if="currentPage === 'relationship'" :character-data="characterData" />

          <!-- Skills 技能页 -->
          <SkillPage v-if="currentPage === 'skills'" :character-data="characterData" />

          <!-- Map 地图页 -->
          <MapPage v-if="currentPage === 'map'" :character-data="characterData" />
        </div>

        <!-- 底部导航栏 -->
        <div class="bottom-nav">
          <button class="nav-button" :class="{ active: currentPage === 'profile' }" @click="currentPage = 'profile'">
            <i class="fas fa-user"></i>
            <span>档案</span>
          </button>
          <button class="nav-button" :class="{ active: currentPage === 'skills' }" @click="currentPage = 'skills'">
            <i class="fas fa-hand-fist"></i>
            <span>技能</span>
          </button>
          <button
            class="nav-button"
            :class="{ active: currentPage === 'inventory' }"
            @click="currentPage = 'inventory'"
          >
            <i class="fas fa-shopping-bag"></i>
            <span>背包</span>
          </button>
          <button class="nav-button" :class="{ active: currentPage === 'quest' }" @click="currentPage = 'quest'">
            <i class="fas fa-scroll"></i>
            <span>任务</span>
          </button>
          <button
            class="nav-button"
            :class="{ active: currentPage === 'relationship' }"
            @click="currentPage = 'relationship'"
          >
            <i class="fas fa-heart"></i>
            <span>关系</span>
          </button>
          <button
            class="nav-button"
            :class="{ active: currentPage === 'map' }"
            @click="currentPage = 'map'"
          >
            <i class="fas fa-map"></i>
            <span>地图</span>
          </button>
        </div>

        <!-- 底部指示器 -->
        <div class="home-indicator"></div>
      </div>

      <!-- 关闭按钮 -->
      <button class="close-button" @click="close">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import DashboardPage from './pages/DashboardPage.vue';
import InventoryPage from './pages/InventoryPage.vue';
import ProfilePage from './pages/ProfilePage.vue';
import QuestPage from './pages/QuestPage.vue';
import RelationshipPage from './pages/RelationshipPage.vue';
import SkillPage from './pages/SkillPage.vue';
import MapPage from './pages/MapPage.vue';

const props = defineProps<{
  isVisible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const characterData = ref<any>({});
const combatData = ref<any>({});
const currentTime = ref('12:00');
const currentPage = ref<'dashboard' | 'profile' | 'skills' | 'inventory' | 'quest' | 'relationship' | 'map'>('dashboard');

// 从 MVU 获取数据
async function loadMvuData() {
  try {
    const globalAny = window as any;
    if (!globalAny.Mvu) {
      return;
    }

    const mvuData = globalAny.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData || !mvuData.stat_data) {
      console.warn('[状态栏] MVU数据为空');
      return;
    }

    characterData.value = mvuData.stat_data;
    combatData.value = mvuData.stat_data;
    
    // 调试：检查背包数据
    console.log('[状态栏] 物品系统:', mvuData.stat_data?.物品系统);
    console.log('[状态栏] 背包数据:', mvuData.stat_data?.物品系统?.背包);
    console.log('[状态栏] 背包类型:', typeof mvuData.stat_data?.物品系统?.背包);
    if (mvuData.stat_data?.物品系统?.背包) {
      console.log('[状态栏] 背包键值:', Object.keys(mvuData.stat_data.物品系统.背包));
    }

    // 检查是否需要自动升级
    await checkAutoLevelUp(mvuData);
  } catch (error) {
    console.error('[状态栏] 加载 MVU 数据失败:', error);
  }
}

// 自动升级检查
async function checkAutoLevelUp(mvuData: any) {
  try {
    const globalAny = window as any;
    const statData = mvuData.stat_data;

    // 获取当前经验值、等级和潜力
    const currentExp = statData.角色基础?.经验值 || 0;
    const currentLevel = statData.角色基础?._等级 || 1;
    const potential = statData.核心状态?._潜力 || 5.0; // 潜力值 (5.0-10.0)

    // 每100经验值升一级
    const expNeeded = 100;

    // 检查是否可以升级（最高100级）
    if (currentExp >= expNeeded && currentLevel < 100) {
      // 计算升级次数和剩余经验
      const levelsGained = Math.floor(currentExp / expNeeded);
      const newLevel = Math.min(100, currentLevel + levelsGained);
      const actualLevelsGained = newLevel - currentLevel;
      const remainingExp = currentExp - actualLevelsGained * expNeeded;

      if (actualLevelsGained > 0) {
        // 升级奖励：根据潜力计算，每级获得 floor(潜力/2) 点（属性点和技能点相同）
        const pointsPerLevel = Math.floor(potential / 2);
        const attributePointsGained = actualLevelsGained * pointsPerLevel;
        const skillPointsGained = actualLevelsGained * pointsPerLevel;

        // 更新 MVU 数据
        if (!statData.角色基础) statData.角色基础 = {};
        if (!statData.核心状态) statData.核心状态 = {};

        statData.角色基础._等级 = newLevel;
        statData.角色基础.经验值 = remainingExp;
        statData.核心状态.$属性点 = (statData.核心状态.$属性点 || 0) + attributePointsGained;
        statData.核心状态.$技能点 = (statData.核心状态.$技能点 || 0) + skillPointsGained;

        // 升级不再自动增加属性，只增加属性点和技能点让用户自由分配

        // 写回 MVU
        await globalAny.Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });

        // 更新本地数据
        characterData.value = statData;
        combatData.value = statData;

        // 显示升级提示
        if (typeof toastr !== 'undefined') {
          toastr.success(
            `等级提升至 ${newLevel}！获得 ${attributePointsGained} 属性点、${skillPointsGained} 技能点`,
            '🎉 升级！',
            { timeOut: 3000 },
          );
        }

        console.log(
          `[状态栏] 自动升级: ${currentLevel} -> ${newLevel}, 潜力=${potential}, 每级获得 ${pointsPerLevel} 点, 共获得 ${attributePointsGained} 属性点, ${skillPointsGained} 技能点`,
        );
      }
    }
  } catch (error) {
    console.error('[状态栏] 自动升级检查失败:', error);
  }
}

// 更新当前时间（从MVU变量读取游戏时间）
function updateTime() {
  try {
    const globalAny = window as any;
    if (globalAny.Mvu) {
      const mvuData = globalAny.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
      if (mvuData?.stat_data?.时间系统?.时间) {
        const gameTime = mvuData.stat_data.时间系统.时间;
        // 假设游戏时间格式为 "HH:MM" 或数字（分钟数）
        if (typeof gameTime === 'string') {
          currentTime.value = gameTime;
        } else if (typeof gameTime === 'number') {
          // 如果是数字，假设是分钟数，转换为 HH:MM
          const hours = Math.floor(gameTime / 60);
          const minutes = gameTime % 60;
          currentTime.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        } else {
          // 如果无法读取，使用默认值
          currentTime.value = '00:00';
        }
        return;
      }
    }
    // 如果无法读取游戏时间，使用默认值
    currentTime.value = '00:00';
  } catch (error) {
    console.warn('[状态栏] 读取游戏时间失败:', error);
    currentTime.value = '00:00';
  }
}

// 关闭状态栏
function close() {
  emit('close');
}

// 监听 MVU 变量更新
let updateInterval: number | null = null;

onMounted(() => {
  loadMvuData();
  updateTime();

  // 每2秒更新一次数据
  updateInterval = window.setInterval(() => {
    if (props.isVisible) {
      loadMvuData();
      updateTime(); // 同时更新游戏时间
    }
  }, 2000);

  // 监听 MVU 变量更新事件
  const globalAny = window as any;
  if (globalAny.eventOn && globalAny.Mvu) {
    globalAny.eventOn(globalAny.Mvu.events.VARIABLE_UPDATE_ENDED, () => {
      if (props.isVisible) {
        loadMvuData();
        updateTime(); // 变量更新时也更新游戏时间
      }
    });
  }
  
  // 监听自定义数据更新事件（用于背包界面等）
  const dataUpdateHandler = () => {
    if (props.isVisible) {
      loadMvuData();
    }
  };
  window.addEventListener('mvu-data-updated', dataUpdateHandler);
  
  // 保存处理器引用以便清理
  (window as any).__statusBarDataUpdateHandler = dataUpdateHandler;
});

onUnmounted(() => {
  if (updateInterval !== null) {
    clearInterval(updateInterval);
  }
  // 移除事件监听
  const handler = (window as any).__statusBarDataUpdateHandler;
  if (handler) {
    window.removeEventListener('mvu-data-updated', handler);
    delete (window as any).__statusBarDataUpdateHandler;
  }
});
</script>

<style scoped lang="scss">
.status-bar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  pointer-events: all;
}

.status-bar-container {
  position: relative;
  width: 100%;
  max-width: 390px;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.phone-frame {
  position: relative;
  width: 100%;
  max-width: 390px;
  height: 844px;
  max-height: 90vh;
  background: #0f172a;
  border-radius: 40px;
  overflow: hidden;
  border: 8px solid #1e1e1e;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
}

.phone-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;

  .bg-gradient-1 {
    position: absolute;
    top: -10%;
    left: -20%;
    width: 140%;
    height: 70%;
    background: rgba(99, 102, 241, 0.4);
    filter: blur(80px);
    border-radius: 50%;
    opacity: 0.5;
  }

  .bg-gradient-2 {
    position: absolute;
    bottom: -10%;
    right: -10%;
    width: 100%;
    height: 60%;
    background: rgba(139, 92, 246, 0.3);
    filter: blur(60px);
    border-radius: 50%;
    opacity: 0.5;
  }
}

.status-header {
  position: relative;
  height: 40px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 50;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  user-select: none;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-button {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  i {
    font-size: 14px;
  }
}

.header-time {
  font-size: 12px;
}

.header-icons {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;

  i {
    color: rgba(255, 255, 255, 0.6);
  }

  .signal-text {
    font-family: monospace;
    opacity: 0.6;
  }

  .battery-indicator {
    width: 24px;
    height: 12px;
    border-radius: 2px;
    border: 1px solid rgba(255, 255, 255, 0.4);
    position: relative;
    margin-left: 4px;

    .battery-fill {
      position: absolute;
      top: 2px;
      bottom: 2px;
      left: 2px;
      right: 4px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 1px;
    }
  }
}

.status-content {
  position: relative;
  flex: 1;
  overflow-y: auto;
  z-index: 10;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
}

.bottom-nav {
  position: relative;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 12px 0;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 50;
  flex-wrap: wrap;
  gap: 4px;
}

.nav-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 12px;
  flex: 0 0 auto;
  min-width: 50px;

  i {
    font-size: 18px;
    margin-bottom: 2px;
  }

  span {
    font-size: 10px;
    font-weight: 500;
  }

  &:hover {
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.05);
  }

  &.active {
    color: white;

    i {
      color: #818cf8;
    }
  }
}

.home-indicator {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 128px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  z-index: 50;
  pointer-events: none;
}

.close-button {
  position: absolute;
  top: -50px;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  i {
    font-size: 18px;
  }
}
</style>
