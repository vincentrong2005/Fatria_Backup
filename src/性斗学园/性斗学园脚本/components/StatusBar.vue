<template>
  <div 
    v-if="isVisible" 
    class="status-bar-overlay"
    @click.self="close"
  >
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
              @click="currentPage = 'dashboard'"
              title="返回主页"
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
          <DashboardPage 
            v-if="currentPage === 'dashboard'" 
            :characterData="characterData"
          />
          
          <!-- Profile 档案页 -->
          <ProfilePage 
            v-if="currentPage === 'profile'" 
            :characterData="characterData"
            :combatData="combatData"
          />
          
          <!-- Inventory 背包页 -->
          <InventoryPage 
            v-if="currentPage === 'inventory'" 
            :characterData="characterData"
          />
          
          <!-- Quest 任务页 -->
          <QuestPage 
            v-if="currentPage === 'quest'" 
            :characterData="characterData"
          />
          
          <!-- Relationship 关系页 -->
          <RelationshipPage 
            v-if="currentPage === 'relationship'" 
            :characterData="characterData"
          />
        </div>

        <!-- 底部导航栏 -->
        <div class="bottom-nav">
          <button 
            class="nav-button" 
            :class="{ active: currentPage === 'profile' }"
            @click="currentPage = 'profile'"
          >
            <i class="fas fa-user"></i>
            <span>档案</span>
          </button>
          <button 
            class="nav-button" 
            :class="{ active: currentPage === 'inventory' }"
            @click="currentPage = 'inventory'"
          >
            <i class="fas fa-shopping-bag"></i>
            <span>背包</span>
          </button>
          <button 
            class="nav-button" 
            :class="{ active: currentPage === 'quest' }"
            @click="currentPage = 'quest'"
          >
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
import { ref, onMounted, onUnmounted } from 'vue';
import DashboardPage from './pages/DashboardPage.vue';
import ProfilePage from './pages/ProfilePage.vue';
import InventoryPage from './pages/InventoryPage.vue';
import QuestPage from './pages/QuestPage.vue';
import RelationshipPage from './pages/RelationshipPage.vue';

const props = defineProps<{
  isVisible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const characterData = ref<any>({});
const combatData = ref<any>({});
const currentTime = ref('12:00');
const currentPage = ref<'dashboard' | 'profile' | 'inventory' | 'quest' | 'relationship'>('dashboard');

// 从 MVU 获取数据
async function loadMvuData() {
  try {
    const globalAny = window as any;
    if (!globalAny.Mvu) {
      return;
    }
    
    const mvuData = globalAny.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData || !mvuData.stat_data) {
      return;
    }

    characterData.value = mvuData.stat_data;
    combatData.value = mvuData.stat_data;
  } catch (error) {
    console.error('[状态栏] 加载 MVU 数据失败:', error);
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
});

onUnmounted(() => {
  if (updateInterval !== null) {
    clearInterval(updateInterval);
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
}

.nav-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 12px;
  
  i {
    font-size: 20px;
    margin-bottom: 2px;
  }
  
  span {
    font-size: 11px;
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