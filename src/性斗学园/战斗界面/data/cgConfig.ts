/**
 * CG配置数据
 * 用于战斗结束后显示对应的CG图片
 */

export interface CGEvent {
  id: string;
  name: string;
  description: string;
  images: string[]; // 图片文件名列表
  probability?: number; // 特殊概率，不填则为普通事件
}

export interface CharacterCGConfig {
  characterName: string; // 角色中文全名
  male: {
    defeat: CGEvent[]; // 男u战败事件
    victory: CGEvent[]; // 男u战胜事件
  };
  female: {
    defeat: CGEvent[]; // 女u战败事件
    victory: CGEvent[]; // 女u战胜事件
  };
}

// 星野光的CG配置
const xingYeGuangConfig: CharacterCGConfig = {
  characterName: '星野光',
  male: {
    defeat: [
      {
        id: 'leather_shoe_squeeze',
        name: '星野光-皮鞋压榨事件',
        description: '你被星野光击败，作为惩罚，她会用小皮鞋透过裤子摩擦你的下体。',
        images: ['星野光-皮鞋压榨事件-1.png', '星野光-皮鞋压榨事件-2.png'],
      },
      {
        id: 'butt_tease_denial',
        name: '星野光-淫臀摩擦寸止事件',
        description: '你被星野光击败，作为惩罚她坐在你身上，全部会用皮筋捆住你的下体，同时臀部寸止摩擦你的下体让你想射但是射不出。',
        images: ['星野光-淫臀摩擦寸止事件-1.png', '星野光-淫臀摩擦寸止-2.png'],
      },
      {
        id: 'anal_development',
        name: '星野光-后穴开发事件',
        description: '你被星野光击败，作为惩罚她会坐在你身上，同时用应援棒开发你的屁穴，并且玩弄全身。',
        images: ['星野光-后穴开发事件-1.png', '星野光-后穴开发事件-2.png'],
      },
      {
        id: 'footjob_milking',
        name: '星野光-足交榨精事件',
        description: '你被星野光击败，作为惩罚她会坐在你身上，同时用脚灵活榨精。',
        images: ['星野光-足交榨精事件-1.png', '星野光-足交榨精事件-2.png'],
      },
      {
        id: 'restraint_tease_denial',
        name: '星野光-拘束摩擦寸止事件',
        description: '你被星野光击败，作为惩罚她坐在你身上，全部会用皮筋捆住你的下体，同时用蜜穴摩擦寸止，让你的下体让你想射但是射不出。',
        images: ['星野光-拘束摩擦寸止事件.png'],
      },
      {
        id: 'loyalty_extraction',
        name: '星野光-榨取效忠事件',
        description: '你被星野光击败，作为惩罚她坐在你身上，小穴进行高速榨精，同时用白丝脚气味洗脑，并且希望你成为她的经纪人，若以成为经纪人则会用更加爱意方式调教。',
        images: ['星野光-榨取效忠事件.png'],
      },
      {
        id: 'forced_slave_brainwash',
        name: '（稀有事件）星野光-强制奴隶洗脑事件',
        description: '你被星野光击败，作为惩罚她会用演出完白丝脚洗脑你，并希望你签下奴隶条约。',
        images: ['星野光-强制奴隶洗脑事件.png'],
        probability: 0.06, // 6%概率
      },
      {
        id: 'handjob_milking',
        name: '星野光-手交榨精事件',
        description: '你被星野光击败，作为惩罚她会用手灵活榨精。',
        images: ['星野光-手交榨精事件-1.png', '星野光-手交榨精事件-2.png'],
      },
    ],
    victory: [
      {
        id: 'victory_reward',
        name: '星野光-战胜事件',
        description: '你战胜了星野光，作为奖励，她会让你处置调教作为奖励。',
        images: ['星野光-战胜事件.png'],
      },
    ],
  },
  female: {
    defeat: [
      {
        id: 'idol_invitation',
        name: '星野光-偶像邀约事件',
        description: '你被星野光击败，作为惩罚她将你捆绑起来并强制邀请你参加她的偶像活动，让你成为她的专属粉丝。',
        images: ['星野光-偶像邀约事件-1.png', '星野光-偶像邀约事件-2.png'],
      },
      {
        id: 'idol_riding',
        name: '星野光-偶像骑乘事件',
        description: '你被星野光击败，作为惩罚她把你当作偶像舞台，骑乘在你身上进行调教表演。',
        images: ['星野光-偶像骑乘事件-1.png', '星野光-偶像骑乘事件-2.png'],
      },
      {
        id: 'forced_foot_licking',
        name: '星野光-强制舔脚事件',
        description: '你被星野光击败，作为惩罚她将你用龟甲缚捆绑并命令你舔她的脚，让你成为她的忠实粉丝。',
        images: ['星野光-强制舔脚事件-1.png', '星野光-强制舔脚事件-2.png'],
      },
      {
        id: 'yuri_love',
        name: '星野光-百合欢爱事件',
        description: '你被星野光击败，作为惩罚她将你压在身下与你进行百合欢爱，让你体验偶像强势的一面。',
        images: ['星野光-百合欢爱事件-1.png', '星野光-百合欢爱事件-2.png', '星野光-百合欢爱事件-3.png'],
      },
    ],
    victory: [
      {
        id: 'victory_reward',
        name: '星野光-战胜事件',
        description: '你战胜了星野光，作为奖励她让你体验偶像的特别服务。',
        images: ['星野光-战胜事件-1.png', '星野光-战胜事件-2.png'],
      },
    ],
  },
};

// 艾琳海德的CG配置
const aiLinHaiDeConfig: CharacterCGConfig = {
  characterName: '艾琳海德',
  male: {
    defeat: [
      {
        id: 'human_chair',
        name: '艾琳海德-人肉座椅事件',
        description: '你被艾琳海德击败，作为处罚你需要作为她的人肉椅子3小时，她会坐在你身上处理公务。',
        images: ['艾琳海德-人肉座椅事件-1.png', '艾琳海德-人肉座椅事件-2.png'],
      },
      {
        id: 'whip_punishment',
        name: '艾琳海德-鞭打事件',
        description: '你被艾琳海德击败，作为处罚你需要被她充满媚药的软鞭鞭打15分钟。',
        images: ['艾琳海德-鞭打事件.png'],
      },
      {
        id: 'armpit_milking',
        name: '艾琳海德-腋下榨精事件',
        description: '你被艾琳海德击败，作为处罚你需要被她有着少女清香以及略微酸涩的腋交榨精事件。',
        images: ['艾琳海德-腋下榨精事件-1.png', '艾琳海德-腋下榨精事件-2.png'],
      },
      {
        id: 'imprisonment',
        name: '艾琳海德-监禁事件',
        description: '你被艾琳海德击败，并且不知道为何惹火了她，她决定把你送到bf社的调教座椅上调教3小时。',
        images: ['艾琳海德-监禁室事件.png'],
      },
      {
        id: 'ass_face_punishment',
        name: '艾琳海德-臀下处罚事件',
        description: '你被艾琳海德击败，作为处罚她用充满气息的臀下压迫摩擦你的脸部，一边玩弄你的下体。',
        images: ['艾琳海德-臀下惩罚事件.png'],
      },
      {
        id: 'foot_trampling',
        name: '艾琳海德-玉足踩踏事件',
        description: '你被艾琳海德击败，作为处罚她用穿着黑丝和高跟的脚，希望你能够好好道歉，否则会有更多惩罚。',
        images: ['艾琳海德-玉足踩踏事件-1.png'],
      },
      {
        id: 'hypnosis',
        name: '艾琳海德-催眠事件',
        description: '你被艾琳海德击败，作为处罚你被她轻松催眠，并且植入性癖，但是对你的好感提升了20。',
        images: ['艾琳海德-催眠事件.png'],
      },
      {
        id: 'thighjob',
        name: '艾琳海德-素股事件',
        description: '你被艾琳海德击败，作为处罚你被她的黑丝大腿素股榨精一次。',
        images: ['艾琳海德-素股榨精事件.png'],
      },
      {
        id: 'normal_punishment',
        name: '艾琳海德-普通惩罚事件',
        description: '你被艾琳海德击败，作为处罚她对你进行了普通的惩罚。',
        images: ['艾琳海德-普通惩罚事件.png'],
      },
    ],
    victory: [
      {
        id: 'victory_reward',
        name: '艾琳海德-战胜事件',
        description: '你战胜艾琳海德，她可以为你口交一次，至于其他要求只能取决于对你的好感。',
        images: ['艾琳海德-战胜事件.png'],
      },
    ],
  },
  female: {
    defeat: [
      {
        id: 'human_chair',
        name: '艾琳海德-人肉座椅事件',
        description: '你被艾琳海德击败，作为处罚你需要赤身裸体地四肢跪地，头戴眼罩，口里含着她的袜子作为她的人肉椅子3小时，她会坐在你身上处理公务。',
        images: ['艾琳海德-人肉座椅事件-1.png', '艾琳海德-人肉座椅事件-2.png'],
      },
      {
        id: 'bondage_yuri_discipline',
        name: '艾琳海德-捆绑百合调教事件',
        description: '你被艾琳海德击败，作为处罚你需要被龟甲缚并且在床上玩弄。',
        images: ['艾琳海德-捆绑百合调教事件-1.png', '艾琳海德-捆绑百合调教-2事件.png', '艾琳海德-捆绑百合调教事件事件-2.png'],
      },
      {
        id: 'armpit_domination',
        name: '艾琳海德-腋下支配事件',
        description: '你被艾琳海德击败，作为处罚你需要被她有着少女清香以及略微酸涩的腋下洗脑。',
        images: ['艾琳海德-腋下支配事件事件.png'],
      },
      {
        id: 'normal_punishment',
        name: '艾琳海德-普通惩罚事件',
        description: '你被艾琳海德击败，她轻松放过了你，让你多点练习。',
        images: ['艾琳海德-普通惩罚事件.png'],
      },
      {
        id: 'ass_face_punishment',
        name: '艾琳海德-臀下处罚事件',
        description: '你被艾琳海德击败，作为处罚她用充满气息的臀下压迫摩擦你的脸部，一边玩弄你的下体。',
        images: ['艾琳海德-臀下处罚事件.png'],
      },
      {
        id: 'hypnosis',
        name: '艾琳海德-催眠事件',
        description: '你被艾琳海德击败，作为处罚你被她轻松催眠，无条件听命于她。并且植入性癖，但是对你的好感提升了20。',
        images: ['艾琳海德-催眠事件.png'],
      },
    ],
    victory: [
      {
        id: 'victory_reward',
        name: '艾琳海德-战胜事件',
        description: '你战胜艾琳海德，她带上了项圈让你惩罚她一次(学院规矩)。',
        images: ['艾琳海德-战胜事件.png'],
      },
    ],
  },
};

// 所有角色的CG配置
export const CG_CONFIGS: CharacterCGConfig[] = [xingYeGuangConfig, aiLinHaiDeConfig];

// 根据角色名称获取CG配置
export function getCGConfigByCharacter(characterName: string): CharacterCGConfig | null {
  console.log('[CG配置] 开始查找角色CG配置，角色名称:', characterName);
  console.log('[CG配置] 可用配置列表:', CG_CONFIGS.map(c => c.characterName));
  
  // 模糊匹配角色名称
  const config = CG_CONFIGS.find((cfg) => {
    const match = characterName.includes(cfg.characterName) || cfg.characterName.includes(characterName);
    console.log(`[CG配置] 匹配检查: "${characterName}" vs "${cfg.characterName}" = ${match}`);
    return match;
  });
  
  if (config) {
    console.log('[CG配置] 找到匹配的配置:', config.characterName);
  } else {
    console.warn('[CG配置] 未找到匹配的配置');
  }
  
  return config || null;
}

// 选择CG事件
export function selectCGEvent(
  characterName: string,
  playerGender: '男' | '女',
  isVictory: boolean
): { event: CGEvent; imageUrl: string; description: string } | null {
  console.log('[CG选择] ========== 开始选择CG事件 ==========');
  console.log('[CG选择] 参数 - 角色:', characterName, '性别:', playerGender, '胜利:', isVictory);
  
  const config = getCGConfigByCharacter(characterName);
  if (!config) {
    console.warn('[CG选择] 未找到角色配置，返回null');
    return null;
  }

  // 根据性别和胜负选择事件池
  const genderKey = playerGender === '男' ? 'male' : 'female';
  const resultKey = isVictory ? 'victory' : 'defeat';
  console.log('[CG选择] 选择事件池 - 性别key:', genderKey, '结果key:', resultKey);
  
  const events = config[genderKey][resultKey];
  console.log('[CG选择] 事件池内容:', events);
  console.log('[CG选择] 事件池数量:', events?.length || 0);

  if (!events || events.length === 0) {
    console.warn('[CG选择] 事件池为空，返回null');
    return null;
  }

  // 分离稀有事件和普通事件
  const rareEvents = events.filter((e) => e.probability !== undefined);
  const normalEvents = events.filter((e) => e.probability === undefined);
  console.log('[CG选择] 稀有事件数量:', rareEvents.length, '普通事件数量:', normalEvents.length);

  let selectedEvent: CGEvent | null = null;

  // 先尝试稀有事件
  for (const rareEvent of rareEvents) {
    const roll = Math.random();
    console.log(`[CG选择] 稀有事件检查: "${rareEvent.name}" 概率:${rareEvent.probability} 随机值:${roll}`);
    if (roll < rareEvent.probability!) {
      selectedEvent = rareEvent;
      console.log('[CG选择] ✓ 触发稀有事件:', rareEvent.name);
      break;
    }
  }

  // 如果没有触发稀有事件，从普通事件中随机选择
  if (!selectedEvent && normalEvents.length > 0) {
    const randomIndex = Math.floor(Math.random() * normalEvents.length);
    selectedEvent = normalEvents[randomIndex];
    console.log('[CG选择] 选择普通事件 (索引', randomIndex, '):', selectedEvent.name);
  }

  if (!selectedEvent) {
    console.warn('[CG选择] 未选择到任何事件，返回null');
    return null;
  }

  // 从事件的图片列表中随机选择一张
  const randomImageIndex = Math.floor(Math.random() * selectedEvent.images.length);
  const randomImage = selectedEvent.images[randomImageIndex];
  console.log('[CG选择] 图片列表:', selectedEvent.images);
  console.log('[CG选择] 选择图片 (索引', randomImageIndex, '):', randomImage);

  // 构建图片URL
  const genderFolder = playerGender === '男' ? '男u' : '女u';
  const resultFolder = isVictory ? '战胜事件' : '战败事件';
  const imageUrl = `https://raw.githubusercontent.com/vincentrong2005/Fatria/main/图片素材/性斗学园/cg/${config.characterName}/${genderFolder}/${resultFolder}/${randomImage}`;
  
  console.log('[CG选择] 生成的图片URL:', imageUrl);
  console.log('[CG选择] 事件描述:', selectedEvent.description);
  console.log('[CG选择] ========== CG事件选择完成 ==========');

  return {
    event: selectedEvent,
    imageUrl,
    description: selectedEvent.description,
  };
}
