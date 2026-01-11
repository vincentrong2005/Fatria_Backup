<template>
  <div class="skill-page">
    <!-- 资源显示 -->
    <div class="resource-header">
      <div class="resource-card skill-points">
        <i class="fas fa-book-sparkles"></i>
        <div class="resource-info">
          <span class="resource-label">技能点</span>
          <span class="resource-value">{{ skillPoints }}</span>
        </div>
      </div>
      <div class="resource-card gold">
        <i class="fas fa-coins"></i>
        <div class="resource-info">
          <span class="resource-label">金币</span>
          <span class="resource-value">{{ goldCoins }}</span>
        </div>
      </div>
    </div>

    <!-- 标签页切换 -->
    <div class="tab-bar">
      <button 
        class="tab-btn" 
        :class="{ active: currentTab === 'skills' }"
        @click="currentTab = 'skills'"
      >
        <i class="fas fa-hand-fist"></i> 我的技能
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: currentTab === 'gacha' }"
        @click="currentTab = 'gacha'"
      >
        <i class="fas fa-dice"></i> 技能抽取
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: currentTab === 'exchange' }"
        @click="currentTab = 'exchange'"
      >
        <i class="fas fa-exchange-alt"></i> 兑换
      </button>
    </div>

    <!-- 技能抽取页面 -->
    <div v-if="currentTab === 'gacha'" class="gacha-section">
      <div class="gacha-info">
        <h3><i class="fas fa-info-circle"></i> 抽取说明</h3>
        <div class="rate-list">
          <span class="rate-item rarity-c">C级 50%</span>
          <span class="rate-item rarity-b">B级 30%</span>
          <span class="rate-item rarity-a">A级 17.5%</span>
          <span class="rate-item rarity-s">S级 2%</span>
          <span class="rate-item rarity-ss">SS级 0.5%</span>
        </div>
        <p class="gacha-note">十连抽保底至少获得一个A级及以上技能</p>
      </div>

      <div class="gacha-buttons">
        <button 
          class="gacha-btn single"
          :disabled="skillPoints < 3"
          @click="performGacha(1)"
        >
          <i class="fas fa-dice-one"></i>
          <span class="btn-text">单抽</span>
          <span class="btn-cost">3 技能点</span>
        </button>
        <button 
          class="gacha-btn ten"
          :disabled="skillPoints < 30"
          @click="performGacha(10)"
        >
          <i class="fas fa-dice-d20"></i>
          <span class="btn-text">十连抽</span>
          <span class="btn-cost">30 技能点</span>
        </button>
      </div>

      <!-- 抽取结果展示 -->
      <div v-if="gachaResults.length > 0" class="gacha-results">
        <h3><i class="fas fa-gift"></i> 抽取结果（选择你想要的技能）</h3>
        <div class="result-grid">
          <div 
            v-for="(skill, index) in gachaResults" 
            :key="index"
            class="result-card"
            :class="[getRarityClass(skill.rarity), { selected: selectedSkills.has(skill.id) }]"
            @click="toggleSkillSelection(skill.id)"
          >
            <div class="result-checkbox">
              <i :class="selectedSkills.has(skill.id) ? 'fas fa-check-square' : 'far fa-square'"></i>
            </div>
            <div class="result-rarity">{{ skill.rarity }}</div>
            <div class="result-name">{{ skill.name }}</div>
            <div class="result-desc">{{ skill.effectDescription }}</div>
          </div>
        </div>
        <div class="result-actions">
          <button class="select-all-btn" @click="selectAllSkills">
            <i class="fas fa-check-double"></i> 全选
          </button>
          <button class="deselect-all-btn" @click="deselectAllSkills">
            <i class="fas fa-times"></i> 全不选
          </button>
          <button class="confirm-btn" @click="confirmGachaResults" :disabled="selectedSkills.size === 0">
            <i class="fas fa-check"></i> 确认获得 ({{ selectedSkills.size }}/{{ gachaResults.length }})
          </button>
        </div>
      </div>
    </div>

    <!-- 兑换页面 -->
    <div v-if="currentTab === 'exchange'" class="exchange-section">
      <div class="exchange-card">
        <div class="exchange-icon">
          <i class="fas fa-coins"></i>
          <i class="fas fa-arrow-right"></i>
          <i class="fas fa-book-sparkles"></i>
        </div>
        <h3>金币兑换技能点</h3>
        <p class="exchange-rate">3000 金币 = 1 技能点</p>
        <p class="exchange-note">注意：兑换不可逆，请谨慎操作</p>
        
        <div class="exchange-controls">
          <div class="quantity-control">
            <button class="qty-btn" @click="exchangeAmount = Math.max(1, exchangeAmount - 1)">-</button>
            <input type="number" v-model.number="exchangeAmount" min="1" :max="maxExchangeAmount" />
            <button class="qty-btn" @click="exchangeAmount = Math.min(maxExchangeAmount, exchangeAmount + 1)">+</button>
          </div>
          <div class="exchange-summary">
            <span>消耗: {{ exchangeAmount * 3000 }} 金币</span>
            <span>获得: {{ exchangeAmount }} 技能点</span>
          </div>
          <button 
            class="exchange-btn"
            :disabled="goldCoins < exchangeAmount * 3000"
            @click="performExchange"
          >
            <i class="fas fa-exchange-alt"></i> 确认兑换
          </button>
        </div>
      </div>
    </div>

    <!-- 技能列表页面 -->
    <div v-if="currentTab === 'skills'" class="skills-section">
      <h3 class="section-title">
        <i class="fas fa-hand-fist"></i> 
        主动技能 
        <span class="skill-count">({{ skillCount }} 个)</span>
      </h3>

      <div v-if="skillCount === 0" class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>暂无已学习的技能</p>
        <span class="empty-hint">在开局时选择技能或通过游戏获得</span>
      </div>

      <div v-else class="skill-list">
        <div 
          v-for="(skill, skillId) in activeSkills" 
          :key="skillId"
          class="skill-card"
          :class="getRarityClass(skill.基本信息?.稀有度)"
        >
          <!-- 技能头部 -->
          <div class="skill-header-row">
            <div class="skill-name-area">
              <span class="skill-name">{{ skill.基本信息?.技能名称 || '未知技能' }}</span>
              <span class="skill-rarity" :class="getRarityClass(skill.基本信息?.稀有度)">
                {{ skill.基本信息?.稀有度 || 'C' }}
              </span>
            </div>
            <div class="skill-level">
              Lv.{{ skill.基本信息?.技能等级 || 1 }}
            </div>
          </div>

          <!-- 技能描述 -->
          <p class="skill-description">{{ skill.基本信息?.技能描述 || '暂无描述' }}</p>

          <!-- 技能属性 -->
          <div class="skill-stats">
            <div class="stat-item cost">
              <i class="fas fa-bolt-lightning"></i>
              <span>{{ skill.冷却与消耗?.耐力消耗 || 0 }} 耐力</span>
            </div>
            <div class="stat-item cooldown" v-if="skill.冷却与消耗?.冷却回合数 > 0">
              <i class="fas fa-clock"></i>
              <span>{{ skill.冷却与消耗?.冷却回合数 || 0 }} 回合</span>
            </div>
            <div class="stat-item accuracy">
              <i class="fas fa-crosshairs"></i>
              <span>{{ skill.伤害与效果?.基础命中率 || 100 }}%</span>
            </div>
          </div>

          <!-- 伤害信息 -->
          <div class="skill-damage">
            <span class="damage-label">伤害来源:</span>
            <span class="damage-source">{{ skill.伤害与效果?.伤害来源 || '性斗力' }}</span>
            <span class="damage-value">×{{ skill.伤害与效果?.系数 || 100 }}%</span>
          </div>

          <!-- 特殊机制 -->
          <div class="skill-mechanics">
            <span v-if="skill.特殊机制?.是否忽视防御" class="mechanic-tag ignore-def">
              <i class="fas fa-shield-slash"></i> 无视防御
            </span>
            <span v-if="(skill.伤害与效果?.连击数 || 1) > 1" class="mechanic-tag hit-count">
              <i class="fas fa-burst"></i> {{ skill.伤害与效果?.连击数 }}连击
            </span>
            <span v-if="skill.伤害与效果?.暴击修正" class="mechanic-tag crit-mod">
              <i class="fas fa-crosshairs"></i> 暴击+{{ skill.伤害与效果?.暴击修正 }}%
            </span>
          </div>

          <!-- 操作按钮 -->
          <div class="skill-actions">
            <button 
              v-if="canUpgrade(skill)"
              class="upgrade-btn"
              @click="upgradeSkill(String(skillId), skill)"
              :disabled="skillPoints < getUpgradeCost(skill)"
            >
              <i class="fas fa-arrow-up"></i>
              升级 ({{ getUpgradeCost(skill) }} 点)
            </button>
            <button 
              class="forget-btn"
              @click="forgetSkill(String(skillId))"
            >
              <i class="fas fa-trash"></i>
              遗忘
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { performSingleGacha, performTenGacha, type GachaSkillData } from '../../data/skillGachaPool';

const props = defineProps<{
  characterData: any;
}>();

// 当前标签页
const currentTab = ref<'skills' | 'gacha' | 'exchange'>('skills');

// 抽取结果
const gachaResults = ref<GachaSkillData[]>([]);

// 选中的技能（用于抽取后选择）
const selectedSkills = ref<Set<string>>(new Set());

// 兑换数量
const exchangeAmount = ref(1);

// 技能点
const skillPoints = computed(() => {
  return props.characterData.核心状态?.$技能点 || 0;
});

// 金币
const goldCoins = computed(() => {
  return props.characterData.物品系统?.学园金币 || 0;
});

// 最大可兑换数量
const maxExchangeAmount = computed(() => {
  return Math.floor(goldCoins.value / 3000) || 1;
});

// 主动技能
const activeSkills = computed(() => {
  return props.characterData.技能系统?.主动技能 || {};
});

// 技能数量
const skillCount = computed(() => {
  return Object.keys(activeSkills.value).length;
});

// 获取稀有度样式类
function getRarityClass(rarity: string): string {
  const rarityMap: Record<string, string> = {
    'C': 'rarity-c',
    'B': 'rarity-b',
    'A': 'rarity-a',
    'S': 'rarity-s',
    'SS': 'rarity-ss',
  };
  return rarityMap[rarity] || 'rarity-c';
}

// 是否可以升级
function canUpgrade(skill: any): boolean {
  const level = skill?.基本信息?.技能等级 || 1;
  return level < 5;
}

// 获取升级所需点数
function getUpgradeCost(skill: any): number {
  const level = skill?.基本信息?.技能等级 || 1;
  // 升级费用：等级 + 1
  return level + 1;
}

// 生成技能描述（根据当前技能数据）
// 只更新数值部分，保留原有描述格式
function generateSkillDescription(skill: any, originalDesc: string): string {
  const damageInfo = skill.伤害与效果 || {};
  const newCoefficient = damageInfo.系数 || 100;
  
  // 使用正则表达式只替换描述中的伤害数值部分
  // 匹配 "造成XXX%" 格式
  const updatedDesc = originalDesc.replace(/造成(\d+)%/, `造成${newCoefficient}%`);
  
  return updatedDesc;
}

// 升级技能
async function upgradeSkill(skillId: string, skill: any) {
  const cost = getUpgradeCost(skill);
  if (skillPoints.value < cost) return;
  
  try {
    const globalAny = window as any;
    if (!globalAny.Mvu) return;
    
    const mvuData = globalAny.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData || !mvuData.stat_data) return;
    
    // 确保路径存在
    if (!mvuData.stat_data.技能系统) mvuData.stat_data.技能系统 = {};
    if (!mvuData.stat_data.技能系统.主动技能) mvuData.stat_data.技能系统.主动技能 = {};
    if (!mvuData.stat_data.技能系统.主动技能[skillId]) {
      mvuData.stat_data.技能系统.主动技能[skillId] = JSON.parse(JSON.stringify(skill));
    }
    
    const skillData = mvuData.stat_data.技能系统.主动技能[skillId];
    
    // 确保基本信息存在
    if (!skillData.基本信息) skillData.基本信息 = {};
    
    // 保存原始描述用于后续更新
    const originalDesc = skillData.基本信息.技能描述 || '';
    
    // 提升等级
    const currentLevel = skillData.基本信息.技能等级 || 1;
    skillData.基本信息.技能等级 = Math.min(5, currentLevel + 1);
    
    // 根据等级调整属性
    if (!skillData.冷却与消耗) skillData.冷却与消耗 = {};
    if (!skillData.伤害与效果) skillData.伤害与效果 = {};
    
    // 每级增加系数：当前值 × 1.05（向下取整）
    const currentCoefficient = skillData.伤害与效果.系数 || 100;
    skillData.伤害与效果.系数 = Math.floor(currentCoefficient * 1.05);
    
    // 每2级减少消耗1点
    if (currentLevel % 2 === 0) {
      skillData.冷却与消耗.耐力消耗 = Math.max(0, (skillData.冷却与消耗.耐力消耗 || 0) - 1);
    }
    
    // 更新技能描述（只更新数值，保留原有格式）
    skillData.基本信息.技能描述 = generateSkillDescription(skillData, originalDesc);
    
    // 减少技能点
    if (!mvuData.stat_data.核心状态) mvuData.stat_data.核心状态 = {};
    mvuData.stat_data.核心状态.$技能点 = (mvuData.stat_data.核心状态.$技能点 || 0) - cost;
    
    // 写回MVU
    await globalAny.Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
    
    // 显示成功提示
    if (typeof toastr !== 'undefined') {
      toastr.success(`技能升级成功！等级 ${currentLevel + 1}`, '成功', { timeOut: 1500 });
    }
  } catch (error) {
    console.error('[技能] 升级失败:', error);
    if (typeof toastr !== 'undefined') {
      toastr.error('技能升级失败', '错误', { timeOut: 2000 });
    }
  }
}

// 执行抽取
async function performGacha(count: number) {
  const cost = count === 1 ? 3 : 30;
  if (skillPoints.value < cost) return;
  
  try {
    const globalAny = window as any;
    if (!globalAny.Mvu) return;
    
    const mvuData = globalAny.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData || !mvuData.stat_data) return;
    
    // 扣除技能点
    if (!mvuData.stat_data.核心状态) mvuData.stat_data.核心状态 = {};
    mvuData.stat_data.核心状态.$技能点 = (mvuData.stat_data.核心状态.$技能点 || 0) - cost;
    
    // 写回MVU
    await globalAny.Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
    
    // 执行抽取
    if (count === 1) {
      gachaResults.value = [performSingleGacha()];
    } else {
      gachaResults.value = performTenGacha();
    }
    
    // 清空之前的选择
    selectedSkills.value.clear();
    
    if (typeof toastr !== 'undefined') {
      toastr.info(`抽取完成！消耗${cost}技能点`, '抽取', { timeOut: 1500 });
    }
  } catch (error) {
    console.error('[技能] 抽取失败:', error);
    if (typeof toastr !== 'undefined') {
      toastr.error('抽取失败', '错误', { timeOut: 2000 });
    }
  }
}

// 切换技能选择状态
function toggleSkillSelection(skillId: string) {
  if (selectedSkills.value.has(skillId)) {
    selectedSkills.value.delete(skillId);
  } else {
    selectedSkills.value.add(skillId);
  }
}

// 全选技能
function selectAllSkills() {
  selectedSkills.value.clear();
  gachaResults.value.forEach(skill => {
    selectedSkills.value.add(skill.id);
  });
}

// 全不选
function deselectAllSkills() {
  selectedSkills.value.clear();
}

// 确认抽取结果，将选中的技能添加到玩家技能列表
async function confirmGachaResults() {
  if (selectedSkills.value.size === 0) {
    if (typeof toastr !== 'undefined') {
      toastr.warning('请至少选择一个技能', '提示', { timeOut: 2000 });
    }
    return;
  }
  
  try {
    const globalAny = window as any;
    if (!globalAny.Mvu) return;
    
    const mvuData = globalAny.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData || !mvuData.stat_data) return;
    
    // 确保技能系统存在
    if (!mvuData.stat_data.技能系统) mvuData.stat_data.技能系统 = {};
    if (!mvuData.stat_data.技能系统.主动技能) mvuData.stat_data.技能系统.主动技能 = {};
    
    // 只添加选中的技能
    const selectedSkillsList = gachaResults.value.filter(skill => selectedSkills.value.has(skill.id));
    for (const skill of selectedSkillsList) {
      const skillData = {
        基本信息: {
          技能ID: skill.id,
          技能名称: skill.name,
          技能描述: skill.effectDescription,
          稀有度: skill.rarity,
          技能等级: 1,
          技能类型: skill.type,
        },
        冷却与消耗: {
          耐力消耗: skill.staminaCost,
          冷却回合数: skill.cooldown,
        },
        伤害与效果: {
          伤害来源: skill.damageSource,
          系数: skill.coefficient,
          基础命中率: skill.accuracy,
          暴击修正: skill.critModifier,
          连击数: skill.hitCount,
          效果列表: {},
        },
      };
      
      // 添加buff效果
      if (skill.buffs && skill.buffs.length > 0) {
        skill.buffs.forEach((buff, index) => {
          (skillData.伤害与效果.效果列表 as any)[`effect_${index}`] = {
            效果类型: buff.type,
            效果值: buff.value,
            是否为百分比: buff.isPercent,
            持续回合数: buff.duration,
            是否作用敌人: buff.isTargetEnemy,
          };
        });
      }
      
      // 使用技能ID作为键，如果已存在则覆盖
      mvuData.stat_data.技能系统.主动技能[skill.id] = skillData;
    }
    
    // 写回MVU
    await globalAny.Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
    
    // 清空结果和选择
    const count = selectedSkills.value.size;
    gachaResults.value = [];
    selectedSkills.value.clear();
    
    if (typeof toastr !== 'undefined') {
      toastr.success(`成功获得${count}个技能！`, '成功', { timeOut: 1500 });
    }
  } catch (error) {
    console.error('[技能] 确认抽取失败:', error);
    if (typeof toastr !== 'undefined') {
      toastr.error('确认失败', '错误', { timeOut: 2000 });
    }
  }
}

// 执行金币兑换技能点
async function performExchange() {
  const goldCost = exchangeAmount.value * 3000;
  if (goldCoins.value < goldCost) return;
  
  try {
    const globalAny = window as any;
    if (!globalAny.Mvu) return;
    
    const mvuData = globalAny.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData || !mvuData.stat_data) return;
    
    // 扣除金币
    if (!mvuData.stat_data.物品系统) mvuData.stat_data.物品系统 = {};
    mvuData.stat_data.物品系统.学园金币 = (mvuData.stat_data.物品系统.学园金币 || 0) - goldCost;
    
    // 增加技能点
    if (!mvuData.stat_data.核心状态) mvuData.stat_data.核心状态 = {};
    mvuData.stat_data.核心状态.$技能点 = (mvuData.stat_data.核心状态.$技能点 || 0) + exchangeAmount.value;
    
    // 写回MVU
    await globalAny.Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
    
    if (typeof toastr !== 'undefined') {
      toastr.success(`兑换成功！消耗${goldCost}金币，获得${exchangeAmount.value}技能点`, '成功', { timeOut: 1500 });
    }
    
    // 重置兑换数量
    exchangeAmount.value = 1;
  } catch (error) {
    console.error('[技能] 兑换失败:', error);
    if (typeof toastr !== 'undefined') {
      toastr.error('兑换失败', '错误', { timeOut: 2000 });
    }
  }
}

// 遗忘技能（带确认对话框）
async function forgetSkill(skillId: string) {
  const skill = activeSkills.value[skillId];
  const skillName = skill?.基本信息?.技能名称 || '未知技能';
  
  // 使用原生confirm对话框进行确认
  const confirmed = confirm(`确定要遗忘技能「${skillName}」吗？\n\n此操作不可逆！`);
  
  if (!confirmed) {
    return;
  }
  
  try {
    const globalAny = window as any;
    if (!globalAny.Mvu) return;
    
    const mvuData = globalAny.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData || !mvuData.stat_data) return;
    
    // 删除技能
    if (mvuData.stat_data.技能系统?.主动技能?.[skillId]) {
      delete mvuData.stat_data.技能系统.主动技能[skillId];
    }
    
    // 写回MVU
    await globalAny.Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
    
    if (typeof toastr !== 'undefined') {
      toastr.success(`技能「${skillName}」已遗忘`, '成功', { timeOut: 1500 });
    }
  } catch (error) {
    console.error('[技能] 遗忘失败:', error);
    if (typeof toastr !== 'undefined') {
      toastr.error('遗忘失败', '错误', { timeOut: 2000 });
    }
  }
}
</script>

<style scoped lang="scss">
.skill-page {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
}

.skill-header {
  margin-bottom: 20px;
}

.skill-points-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(139, 92, 246, 0.08));
  border: 1px solid rgba(139, 92, 246, 0.4);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  
  > i {
    font-size: 28px;
    color: #a78bfa;
  }
  
  .points-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .points-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .points-value {
    font-size: 28px;
    font-weight: 700;
    color: #c4b5fd;
  }
}

.skills-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 16px;
  
  i {
    color: #667eea;
  }
  
  .skill-count {
    font-size: 12px;
    font-weight: normal;
    color: rgba(255, 255, 255, 0.4);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  
  i {
    font-size: 36px;
    color: rgba(255, 255, 255, 0.2);
    margin-bottom: 12px;
  }
  
  p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.4);
    margin: 0;
  }
  
  .empty-hint {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.25);
    margin-top: 6px;
  }
}

.skill-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.skill-card {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
  
  &.rarity-c { border-left: 3px solid #9ca3af; }
  &.rarity-b { border-left: 3px solid #60a5fa; }
  &.rarity-a { border-left: 3px solid #a78bfa; }
  &.rarity-s { border-left: 3px solid #fbbf24; }
  &.rarity-ss { border-left: 3px solid #f472b6; }
}

.skill-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.skill-name-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skill-name {
  font-size: 16px;
  font-weight: 700;
  color: white;
}

.skill-rarity {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  
  &.rarity-c { background: rgba(156, 163, 175, 0.3); color: #d1d5db; }
  &.rarity-b { background: rgba(96, 165, 250, 0.3); color: #93c5fd; }
  &.rarity-a { background: rgba(167, 139, 250, 0.3); color: #c4b5fd; }
  &.rarity-s { background: rgba(251, 191, 36, 0.3); color: #fcd34d; }
  &.rarity-ss { background: rgba(244, 114, 182, 0.3); color: #f9a8d4; }
}

.skill-level {
  font-size: 13px;
  font-weight: 600;
  color: #667eea;
  background: rgba(102, 126, 234, 0.2);
  padding: 4px 10px;
  border-radius: 8px;
}

.skill-description {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.skill-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 6px;
  
  i { font-size: 10px; }
  
  &.cost {
    background: rgba(52, 211, 153, 0.2);
    color: #6ee7b7;
    border: 1px solid rgba(52, 211, 153, 0.3);
  }
  
  &.cooldown {
    background: rgba(96, 165, 250, 0.2);
    color: #93c5fd;
    border: 1px solid rgba(96, 165, 250, 0.3);
  }
  
  &.accuracy {
    background: rgba(251, 191, 36, 0.2);
    color: #fcd34d;
    border: 1px solid rgba(251, 191, 36, 0.3);
  }
}

.skill-damage {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  margin-bottom: 10px;
  padding: 8px 10px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  
  .damage-label {
    color: rgba(255, 255, 255, 0.5);
  }
  
  .damage-source {
    color: #f87171;
    font-weight: 500;
  }
  
  .damage-value {
    color: #fcd34d;
    font-weight: 600;
  }
}

.skill-mechanics {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.mechanic-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 4px;
  
  i { font-size: 9px; }
  
  &.ignore-def {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }
  
  &.hit-count {
    background: rgba(251, 146, 60, 0.2);
    color: #fdba74;
    border: 1px solid rgba(251, 146, 60, 0.3);
  }
  
  &.crit-mod {
    background: rgba(167, 139, 250, 0.2);
    color: #c4b5fd;
    border: 1px solid rgba(167, 139, 250, 0.3);
  }
}

.skill-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.upgrade-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.forget-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #f87171;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(239, 68, 68, 0.3);
    transform: scale(1.05);
  }
}

// 资源头部
.resource-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.resource-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  
  > i {
    font-size: 20px;
  }
  
  .resource-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .resource-label {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
  }
  
  .resource-value {
    font-size: 18px;
    font-weight: 700;
  }
  
  &.skill-points {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(139, 92, 246, 0.08));
    border: 1px solid rgba(139, 92, 246, 0.3);
    
    > i { color: #a78bfa; }
    .resource-value { color: #c4b5fd; }
  }
  
  &.gold {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.25), rgba(251, 191, 36, 0.08));
    border: 1px solid rgba(251, 191, 36, 0.3);
    
    > i { color: #fbbf24; }
    .resource-value { color: #fcd34d; }
  }
}

// 标签页
.tab-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  i { font-size: 12px; }
  
  &:hover {
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.05);
  }
  
  &.active {
    color: white;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(139, 92, 246, 0.2));
  }
}

// 抽取页面
.gacha-section {
  padding: 16px 0;
}

.gacha-info {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  margin-bottom: 16px;
  
  h3 {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 12px 0;
    
    i { margin-right: 6px; color: #60a5fa; }
  }
}

.rate-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.rate-item {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 500;
  
  &.rarity-c { background: rgba(156, 163, 175, 0.2); color: #d1d5db; }
  &.rarity-b { background: rgba(96, 165, 250, 0.2); color: #93c5fd; }
  &.rarity-a { background: rgba(167, 139, 250, 0.2); color: #c4b5fd; }
  &.rarity-s { background: rgba(251, 191, 36, 0.2); color: #fcd34d; }
  &.rarity-ss { background: rgba(244, 114, 182, 0.2); color: #f9a8d4; }
}

.gacha-note {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

.gacha-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.gacha-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 16px;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  i { font-size: 28px; }
  
  .btn-text {
    font-size: 14px;
    font-weight: 600;
  }
  
  .btn-cost {
    font-size: 11px;
    opacity: 0.7;
  }
  
  &.single {
    background: linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(96, 165, 250, 0.1));
    border: 1px solid rgba(96, 165, 250, 0.4);
    color: #93c5fd;
  }
  
  &.ten {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(251, 191, 36, 0.1));
    border: 1px solid rgba(251, 191, 36, 0.4);
    color: #fcd34d;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.gacha-results {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  
  h3 {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 16px 0;
    
    i { margin-right: 6px; color: #34d399; }
  }
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.result-card {
  position: relative;
  padding: 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateY(-2px);
  }
  
  &.selected {
    background: rgba(139, 92, 246, 0.15);
    border-color: rgba(139, 92, 246, 0.5);
    box-shadow: 0 0 12px rgba(139, 92, 246, 0.3);
  }
  
  .result-checkbox {
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 16px;
    color: #a78bfa;
  }
  
  .result-rarity {
    font-size: 10px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  
  .result-name {
    font-size: 13px;
    font-weight: 600;
    color: white;
    margin-bottom: 4px;
    padding-right: 24px;
  }
  
  .result-desc {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.4;
  }
  
  &.rarity-c { border-left: 3px solid #9ca3af; .result-rarity { color: #d1d5db; } }
  &.rarity-b { border-left: 3px solid #60a5fa; .result-rarity { color: #93c5fd; } }
  &.rarity-a { border-left: 3px solid #a78bfa; .result-rarity { color: #c4b5fd; } }
  &.rarity-s { border-left: 3px solid #fbbf24; .result-rarity { color: #fcd34d; } }
  &.rarity-ss { border-left: 3px solid #f472b6; .result-rarity { color: #f9a8d4; } }
}

.result-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.select-all-btn,
.deselect-all-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.select-all-btn {
  background: rgba(96, 165, 250, 0.2);
  border: 1px solid rgba(96, 165, 250, 0.4);
  color: #93c5fd;
  
  &:hover {
    background: rgba(96, 165, 250, 0.3);
    transform: scale(1.02);
  }
}

.deselect-all-btn {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #f87171;
  
  &:hover {
    background: rgba(239, 68, 68, 0.3);
    transform: scale(1.02);
  }
}

.confirm-btn {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #34d399, #10b981);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    transform: scale(1.02);
    box-shadow: 0 4px 16px rgba(52, 211, 153, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// 兑换页面
.exchange-section {
  padding: 16px 0;
}

.exchange-card {
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  text-align: center;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: white;
    margin: 16px 0 8px 0;
  }
}

.exchange-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 28px;
  
  .fa-coins { color: #fbbf24; }
  .fa-arrow-right { color: rgba(255, 255, 255, 0.3); font-size: 20px; }
  .fa-book-sparkles { color: #a78bfa; }
}

.exchange-rate {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 4px 0;
}

.exchange-note {
  font-size: 11px;
  color: rgba(239, 68, 68, 0.8);
  margin: 0 0 20px 0;
}

.exchange-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quantity-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  
  input {
    width: 80px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
    font-size: 16px;
    font-weight: 600;
    text-align: center;
    
    &:focus {
      outline: none;
      border-color: rgba(139, 92, 246, 0.5);
    }
  }
}

.qty-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

.exchange-summary {
  display: flex;
  justify-content: center;
  gap: 24px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.exchange-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    transform: scale(1.02);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>


