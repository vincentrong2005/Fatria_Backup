const fs = require('fs');

// 读取文件
const filePath = 'd:/SillyTavern/tavern_helper_template/src/性斗学园/战斗界面/enemySkillDatabase.ts';
let content = fs.readFileSync(filePath, 'utf8');

// 定义稀有度分配函数 - 基于前后文分析
function assignRarityForSkill(beforeText, afterText) {
  // 从afterText中提取技能信息（向后看到下一个技能或结束）
  const skillEndMatch = afterText.match(/^[\s\S]*?(?=\n\s+\w+_\d+:\s+\{|$)/);
  const skillText = beforeText + (skillEndMatch ? skillEndMatch[0] : afterText.substring(0, 500));
  
  // 提取伤害系数
  const coeffMatches = skillText.match(/coefficient:\s*([\d.]+)/g);
  let maxCoeff = 0;
  if (coeffMatches) {
    coeffMatches.forEach(match => {
      const coeff = parseFloat(match.split(':')[1].trim());
      if (coeff > maxCoeff) maxCoeff = coeff;
    });
  }

  // 检查是否有buffs（非空数组）
  const buffsMatch = skillText.match(/buffs:\s*\[([\s\S]*?)\]/);
  const hasBuffs = buffsMatch && buffsMatch[1].trim().length > 10; // 至少有一些内容
  
  // 检查是否是终极技能
  const isUltimate = skillText.includes('SkillType.ULTIMATE');

  // 检查连击数
  const hitCountMatch = skillText.match(/hitCount:\s*(\d+)/);
  const hitCount = hitCountMatch ? parseInt(hitCountMatch[1]) : 1;

  // 分配稀有度
  if (isUltimate || maxCoeff >= 4.0 || (hasBuffs && maxCoeff >= 3.0)) {
    return 'SS';
  } else if (maxCoeff >= 3.0 || (hasBuffs && maxCoeff >= 2.0) || hitCount >= 3) {
    return 'S';
  } else if (maxCoeff >= 2.0 || (hasBuffs && maxCoeff >= 1.5)) {
    return 'A';
  } else if (maxCoeff >= 1.0 || hasBuffs) {
    return 'B';
  } else {
    return 'C';
  }
}

let addedCount = 0;
let skippedCount = 0;

// 使用正则表达式替换
const result = content.replace(
  /(type:\s*SkillType\.\w+,)(\n\s+)((?!rarity:))/g,
  (match, typeDecl, newlineAndIndent, nextChar, offset) => {
    // 检查是否已经有rarity（向后看几行）
    const afterText = content.substring(offset + match.length, offset + match.length + 200);
    if (afterText.match(/^\s*rarity:/)) {
      skippedCount++;
      return match;
    }

    // 获取前文用于分析
    const beforeText = content.substring(Math.max(0, offset - 500), offset + match.length);
    const rarity = assignRarityForSkill(beforeText, afterText);
    
    addedCount++;
    return `${typeDecl}${newlineAndIndent}rarity: '${rarity}',${newlineAndIndent}`;
  }
);

// 写回文件
fs.writeFileSync(filePath, result, 'utf8');

console.log(`✅ Rarity assignment complete!`);
console.log(`   Added rarity to: ${addedCount} skills`);
console.log(`   Skipped (already has rarity): ${skippedCount} skills`);
