<template>
  <div class="profile-page">
    <!-- 角色头像 -->
    <div class="profile-header">
      <div class="profile-avatar" @click="handleAvatarClick">
        <div class="avatar-inner">
          <img v-if="avatarUrl" :src="avatarUrl" alt="头像" class="avatar-image" @error="handleImageError" />
          <i v-else class="fas fa-user"></i>
        </div>
        <div class="avatar-upload-hint">
          <i class="fas fa-camera"></i>
        </div>
      </div>
      <input ref="fileInputRef" type="file" accept="image/*" style="display: none" @change="handleAvatarChange" />
      <h2 class="profile-name">学员档案</h2>
      <div class="profile-level">
        <span class="level-badge">Lv.{{ characterData.角色基础?._等级 || 1 }}</span>
        <span class="potential-badge">潜力 {{ (characterData.角色基础?.$潜力 || 5.0).toFixed(1) }}</span>
      </div>
    </div>

    <!-- 核心属性卡片 -->
    <div class="stats-grid">
      <div class="stat-card charm">
        <div class="stat-icon"><i class="fas fa-heart"></i></div>
        <div class="stat-info">
          <div class="stat-label">魅力</div>
          <div class="stat-value">{{ characterData.核心状态?._魅力 || 10 }}</div>
        </div>
      </div>
      <div class="stat-card luck">
        <div class="stat-icon"><i class="fas fa-clover"></i></div>
        <div class="stat-info">
          <div class="stat-label">幸运</div>
          <div class="stat-value">{{ characterData.核心状态?._幸运 || 10 }}</div>
        </div>
      </div>
      <div class="stat-card combat">
        <div class="stat-icon"><i class="fas fa-fire"></i></div>
        <div class="stat-info">
          <div class="stat-label">性斗力</div>
          <div class="stat-value">{{ characterData.性斗系统?.$实时性斗力 || 0 }}</div>
        </div>
      </div>
      <div class="stat-card endurance">
        <div class="stat-icon"><i class="fas fa-shield-halved"></i></div>
        <div class="stat-info">
          <div class="stat-label">忍耐力</div>
          <div class="stat-value">{{ characterData.性斗系统?.$实时忍耐力 || 0 }}</div>
        </div>
      </div>
    </div>

    <!-- 核心状态 -->
    <div class="detail-card">
      <h3 class="detail-title"><i class="fas fa-chart-line"></i> 核心状态</h3>
      <div class="detail-list">
        <div class="progress-item">
          <div class="progress-header">
            <span><i class="fas fa-bolt"></i> 耐力</span>
            <span class="progress-value">
              {{ characterData.核心状态?._耐力 || 0 }} / {{ characterData.核心状态?._最大耐力 || 100 }}
            </span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill stamina"
              :style="{
                width: `${getPercentage(characterData.核心状态?._耐力 || 0, characterData.核心状态?._最大耐力 || 100)}%`,
              }"
            ></div>
          </div>
        </div>

        <div class="progress-item">
          <div class="progress-header">
            <span><i class="fas fa-heart-pulse"></i> 快感</span>
            <span class="progress-value">
              {{ characterData.核心状态?._快感 || 0 }} / {{ characterData.核心状态?._最大快感 || 100 }}
            </span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill lust"
              :style="{
                width: `${getPercentage(characterData.核心状态?._快感 || 0, characterData.核心状态?._最大快感 || 100)}%`,
              }"
            ></div>
          </div>
        </div>

        <div class="progress-item">
          <div class="progress-header">
            <span><i class="fas fa-brain"></i> 意志力</span>
            <span class="progress-value">{{ characterData.核心状态?._意志力 || 0 }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill willpower" :style="{ width: `${characterData.核心状态?._意志力 || 0}%` }"></div>
          </div>
        </div>

        <div class="progress-item">
          <div class="progress-header">
            <span><i class="fas fa-star"></i> 经验值</span>
            <span class="progress-value"> {{ getCurrentExp(characterData.角色基础?.经验值 || 0) }} / 100 </span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill exp"
              :style="{ width: `${getExpPercentage(getCurrentExp(characterData.角色基础?.经验值 || 0))}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 战斗属性 -->
    <div class="detail-card">
      <h3 class="detail-title"><i class="fas fa-swords"></i> 战斗属性</h3>
      <div class="attribute-grid">
        <div class="attribute-item">
          <span class="attribute-label">闪避率</span>
          <span class="attribute-value dodge">{{ characterData.核心状态?.$闪避率 || 0 }}%</span>
        </div>
        <div class="attribute-item">
          <span class="attribute-label">暴击率</span>
          <span class="attribute-value crit">{{ characterData.核心状态?.$暴击率 || 0 }}%</span>
        </div>
        <div class="attribute-item">
          <span class="attribute-label">堕落度</span>
          <span class="attribute-value corruption">{{ characterData.核心状态?._堕落度 || 0 }}%</span>
        </div>
        <div class="attribute-item">
          <span class="attribute-label">段位</span>
          <span class="attribute-value rank">{{ characterData.角色基础?._段位 || '无段位' }}</span>
        </div>
      </div>
    </div>

    <!-- 永久状态 -->
    <div class="detail-card" v-if="permanentStates && permanentStates.length > 0">
      <h3 class="detail-title"><i class="fas fa-gem"></i> 永久状态</h3>
      <div class="states-list">
        <span v-for="(state, index) in permanentStates" :key="index" class="state-tag permanent">
          <i class="fas fa-sparkles"></i> {{ state }}
        </span>
      </div>
      <!-- 加成统计 -->
      <div v-if="hasPermanentBonuses" class="bonus-section">
        <div class="bonus-header">加成效果</div>
        <div class="bonus-grid">
          <div v-for="(value, key) in permanentBonuses" :key="key" class="bonus-item" v-show="value !== 0">
            <span class="bonus-label">{{ formatBonusLabel(key) }}</span>
            <span class="bonus-value" :class="getBonusClass(value)">
              {{ formatBonusValue(value) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 临时状态 -->
    <div class="detail-card" v-if="hasTempStates">
      <h3 class="detail-title"><i class="fas fa-clock"></i> 临时状态</h3>
      <div class="states-list">
        <span v-for="(turns, state) in tempStates" :key="state" class="state-tag temp">
          <i class="fas fa-hourglass-half"></i> {{ state }}
          <span class="turns-badge">{{ turns }}回合</span>
        </span>
      </div>
      <!-- 临时加成统计 -->
      <div v-if="hasTempBonuses" class="bonus-section">
        <div class="bonus-header">临时加成</div>
        <div class="bonus-grid">
          <div v-for="(value, key) in tempBonuses" :key="key" class="bonus-item" v-show="value !== 0">
            <span class="bonus-label">{{ formatBonusLabel(key) }}</span>
            <span class="bonus-value" :class="getBonusClass(value)">
              {{ formatBonusValue(value) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const props = defineProps<{
  characterData: any;
  combatData: any;
}>();

const fileInputRef = ref<HTMLInputElement | null>(null);
const avatarUrl = ref<string>('');

// 永久状态
const permanentStates = computed(() => {
  return props.characterData._永久状态?.$状态列表 || [];
});

const permanentBonuses = computed(() => {
  return props.characterData._永久状态?.$加成统计 || {};
});

const hasPermanentBonuses = computed(() => {
  const bonuses = permanentBonuses.value;
  return Object.values(bonuses).some((v: any) => v !== 0);
});

// 临时状态
const tempStates = computed(() => {
  return props.characterData.$临时状态?.$状态列表 || {};
});

const hasTempStates = computed(() => {
  return Object.keys(tempStates.value).length > 0;
});

const tempBonuses = computed(() => {
  return props.characterData.$临时状态?.$加成统计 || {};
});

const hasTempBonuses = computed(() => {
  const bonuses = tempBonuses.value;
  return Object.values(bonuses).some((v: any) => v !== 0);
});

// 从 MVU 变量加载头像
function loadAvatarUrl() {
  try {
    const globalAny = window as any;

    // 从MVU变量读取
    if (globalAny.Mvu) {
      const mvuData = globalAny.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
      const saved = mvuData?.stat_data?.角色基础?.$头像URL;
      if (saved && typeof saved === 'string' && saved.trim()) {
        avatarUrl.value = saved;
        return;
      }
    }
  } catch (err) {
    console.warn('[状态栏] 读取头像失败:', err);
  }
  avatarUrl.value = '';
}

// 保存头像URL到MVU变量
async function saveAvatarUrl(url: string) {
  try {
    const globalAny = window as any;

    if (globalAny.Mvu) {
      const mvuData = globalAny.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
      if (mvuData && mvuData.stat_data) {
        if (!mvuData.stat_data.角色基础) {
          mvuData.stat_data.角色基础 = {};
        }
        mvuData.stat_data.角色基础.$头像URL = url;
        await globalAny.Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
      }
    }

    avatarUrl.value = url;
    toastr.success('头像上传成功', '成功', { timeOut: 2000 });
  } catch (err) {
    console.error('[状态栏] 保存头像失败:', err);
    toastr.error('头像保存失败', '错误', { timeOut: 3000 });
  }
}

function handleAvatarClick() {
  fileInputRef.value?.click();
}

function handleAvatarChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    toastr.error('请选择图片文件', '错误', { timeOut: 3000 });
    return;
  }

  // 检查文件大小（限制为5MB）
  if (file.size > 5 * 1024 * 1024) {
    toastr.error('图片大小不能超过5MB', '错误', { timeOut: 3000 });
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      saveAvatarUrl(reader.result);
    }
  };
  reader.readAsDataURL(file);

  // 清空input，允许重复选择同一文件
  target.value = '';
}

function handleImageError() {
  avatarUrl.value = '';
}

// 格式化加成标签
function formatBonusLabel(key: string): string {
  const labelMap: Record<string, string> = {
    $魅力加成: '魅力',
    $幸运加成: '幸运',
    $基础性斗力加成: '性斗力+',
    $基础性斗力成算: '性斗力%',
    $基础忍耐力加成: '忍耐力+',
    $基础忍耐力成算: '忍耐力%',
    $闪避率加成: '闪避率',
    $暴击率加成: '暴击率',
    $意志力加成: '意志力',
  };
  return labelMap[key] || key;
}

// 格式化加成值
function formatBonusValue(value: number): string {
  if (value === 0) return '0';
  if (value > 0) return `+${value}`;
  return `${value}`;
}

// 获取加成值的样式类
function getBonusClass(value: number): string {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
}

function getPercentage(current: number, max: number): number {
  if (max === 0) return 0;
  return Math.min(100, Math.max(0, (current / max) * 100));
}

// 获取当前经验值（满100后自动扣除）
function getCurrentExp(totalExp: number): number {
  // 每100经验升一级，当前等级的经验 = 总经验 % 100
  return totalExp % 100;
}

function getExpPercentage(current: number): number {
  // 经验值上限固定为100
  return getPercentage(current, 100);
}

onMounted(() => {
  loadAvatarUrl();

  // 监听MVU变量更新，同步头像
  const globalAny = window as any;
  if (globalAny.eventOn && globalAny.Mvu) {
    globalAny.eventOn(globalAny.Mvu.events.VARIABLE_UPDATE_ENDED, () => {
      loadAvatarUrl();
    });
  }
});
</script>

<style scoped lang="scss">
.profile-page {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 16px;
  margin-bottom: 24px;
}

.profile-avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 3px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.5);

    .avatar-upload-hint {
      opacity: 1;
    }
  }

  .avatar-inner {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: #1a1f35;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  i {
    font-size: 36px;
    color: rgba(255, 255, 255, 0.6);
  }

  .avatar-upload-hint {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
    border: 2px solid #1a1f35;
    z-index: 10;

    i {
      font-size: 12px;
      color: white;
    }
  }
}

.profile-name {
  margin-top: 12px;
  font-size: 18px;
  font-weight: 700;
  color: white;
  letter-spacing: 0.5px;
}

.profile-level {
  display: flex;
  gap: 8px;
  margin-top: 8px;

  .level-badge,
  .potential-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }

  .level-badge {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
  }

  .potential-badge {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  &.charm {
    background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(236, 72, 153, 0.05));
    .stat-icon {
      color: #ec4899;
    }
    .stat-value {
      color: #f472b6;
    }
  }

  &.luck {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(251, 191, 36, 0.05));
    .stat-icon {
      color: #fbbf24;
    }
    .stat-value {
      color: #fcd34d;
    }
  }

  &.combat {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05));
    .stat-icon {
      color: #ef4444;
    }
    .stat-value {
      color: #f87171;
    }
  }

  &.endurance {
    background: linear-gradient(135deg, rgba(52, 211, 153, 0.2), rgba(52, 211, 153, 0.05));
    .stat-icon {
      color: #34d399;
    }
    .stat-value {
      color: #6ee7b7;
    }
  }

  .stat-icon {
    font-size: 20px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-info {
    flex: 1;
  }

  .stat-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat-value {
    font-size: 20px;
    font-weight: 700;
  }
}

.detail-card {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 16px;
}

.detail-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  i {
    font-size: 14px;
    color: #667eea;
  }
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: white;

  span:first-child {
    display: flex;
    align-items: center;
    gap: 6px;

    i {
      font-size: 12px;
      opacity: 0.7;
    }
  }

  .progress-value {
    color: rgba(255, 255, 255, 0.5);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
  }
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;

  &.stamina {
    background: linear-gradient(90deg, #34d399, #10b981);
  }

  &.lust {
    background: linear-gradient(90deg, #f472b6, #ec4899);
  }

  &.willpower {
    background: linear-gradient(90deg, #60a5fa, #3b82f6);
  }

  &.exp {
    background: linear-gradient(90deg, #fbbf24, #f59e0b);
  }
}

.attribute-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.attribute-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.attribute-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.attribute-value {
  font-size: 14px;
  font-weight: 600;

  &.dodge {
    color: #60a5fa;
  }
  &.crit {
    color: #f87171;
  }
  &.corruption {
    color: #a78bfa;
  }
  &.rank {
    color: #fbbf24;
  }
}

.states-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.state-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;

  i {
    font-size: 10px;
  }

  &.permanent {
    background: linear-gradient(135deg, rgba(167, 139, 250, 0.3), rgba(139, 92, 246, 0.1));
    color: #c4b5fd;
    border: 1px solid rgba(167, 139, 250, 0.3);
  }

  &.temp {
    background: linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(59, 130, 246, 0.1));
    color: #93c5fd;
    border: 1px solid rgba(96, 165, 250, 0.3);
  }

  .turns-badge {
    background: rgba(0, 0, 0, 0.3);
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 10px;
    margin-left: 4px;
  }
}

.bonus-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.bonus-header {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.bonus-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.bonus-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  font-size: 12px;
}

.bonus-label {
  color: rgba(255, 255, 255, 0.6);
}

.bonus-value {
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;

  &.positive {
    color: #34d399;
  }

  &.negative {
    color: #f87171;
  }

  &.neutral {
    color: rgba(255, 255, 255, 0.4);
  }
}
</style>
