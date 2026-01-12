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

// 露娜拉克缇丝的CG配置
const luNaLaKeDiSiConfig: CharacterCGConfig = {
  characterName: '露娜拉克缇丝',
  male: {
    defeat: [
      {
        id: 'anal_licking_paizuri',
        name: '露娜拉克缇丝-舔肛乳交事件',
        description: '你被露娜击败，作为惩罚，她让你学狗趴下，从你身后一边为你乳交，一边用舌头深入你的后穴。',
        images: ['露娜拉克缇丝-舔肛乳交事件-1.png', '露娜拉克缇丝-舔肛乳交事件-2.png', '露娜拉克缇丝-舔肛乳交事件-3.png'],
      },
      {
        id: 'bra_face_footjob',
        name: '露娜拉克缇丝-胸罩盖脸足交事件',
        description: '你被露娜击败，作为惩罚，她把你放在身上一边用浓郁奶香和酸涩的巨大奶罩覆盖你的面部，一边从你背后用玉足足交榨取。',
        images: ['露娜拉克缇丝-胸罩盖脸足交事件-1.png', '露娜拉克缇丝-胸罩盖脸足交事件-2.png'],
      },
      {
        id: 'breast_aroma_handjob',
        name: '露娜拉克缇丝-乳香支配手淫事件',
        description: '你被露娜击败，作为惩罚你坐在她身上，头被她的奶子夹着，一边轻语为你手淫。',
        images: ['露娜拉克缇丝-乳香支配手淫事件-1.png', '露娜拉克缇丝-乳香支配手淫事件-2.png'],
      },
      {
        id: 'double_extraction',
        name: '露娜拉克缇丝-前后同榨事件',
        description: '你被露娜击败，作为惩罚你的阴茎被榨取器榨取，一边被尾巴插入开发屁穴。',
        images: ['露娜拉克缇丝-前后同榨事件.png'],
      },
      {
        id: 'shota_wall_milking',
        name: '露娜拉克缇丝-正太化按墙榨精事件',
        description: '你被露娜击败，作为惩罚，她把你变成小正太，用巨大乳房把你按在墙上，让你两脚悬空，并且用手淫，前内腺开发你。',
        images: ['露娜拉克缇丝-正太化按墙榨精事件-1.png', '露娜拉克缇丝-正太化按墙榨精事件-2.png', '露娜拉克缇丝-正太化按墙榨精事件-3.png'],
      },
      {
        id: 'nursing_tail_anal',
        name: '露娜拉克缇丝-哺乳与尾巴后穴开发事件',
        description: '你被露娜击败，作为惩罚她一边为你哺乳（增加0.1潜力），一边用尾巴搅动你的屁穴。',
        images: ['露娜拉克缇丝-哺乳与尾巴后穴开发事件-1.png', '露娜拉克缇丝-哺乳与尾巴后穴开发事件-2.png'],
      },
      {
        id: 'pussy_teasing',
        name: '露娜拉克缇丝-小穴摩擦事件',
        description: '你被露娜击败，作为惩罚，她用小穴摩擦你的下体但是禁止你进入。',
        images: ['露娜拉克缇丝-小穴摩擦事件.png'],
      },
      {
        id: 'anal_milking',
        name: '露娜拉克缇丝-肛交榨取事件',
        description: '你被露娜击败，今天没有惩罚，但是她想试试用后穴的快感，用屁穴榨精。',
        images: ['露娜拉克缇丝-肛交榨取事件-1.png', '露娜拉克缇丝-肛交榨取事件-2.png'],
      },
      {
        id: 'paizuri_service',
        name: '露娜拉克缇丝-乳交榨取事件',
        description: '你被露娜击败，今天没有惩罚，她会用乳房温柔侍奉你。',
        images: ['露娜拉克缇丝-乳交榨取事件.png'],
      },
      {
        id: 'succubus_transformation',
        name: '（稀有事件）露娜拉克缇丝-乳魔化事件',
        description: '你被露娜击败，作为惩罚你被她注入魅魔化因子，并且带你到镜子前一边让你观看自己性转雌堕与魅魔化的形态，一边开发你的乳首（让你分泌乳汁）和下体。',
        images: ['露娜拉克缇丝-乳魔化事件-1.png', '露娜拉克缇丝-乳魔化事件-2.png'],
        probability: 0.04,
      },
      {
        id: 'womb_regression',
        name: '（稀有事件）露娜拉克缇丝-胎内回归事件',
        description: '你被露娜击败，作为惩罚，她把你缩小塞入子宫，时间快进在一个月后，你会作为她的乳魔女儿降生。',
        images: ['露娜拉克缇丝-胎内回归事件.png'],
        probability: 0.04,
      },
    ],
    victory: [
      {
        id: 'paizuri_victory',
        name: '露娜拉克缇丝-乳交战胜事件',
        description: '你战胜了露娜，她会用乳交服侍您。',
        images: ['露娜拉克缇丝-乳交战胜事件.png'],
      },
      {
        id: 'anal_victory',
        name: '露娜拉克缇丝-肛交战胜事件',
        description: '你战胜了露娜，她会用后穴服侍您。',
        images: ['露娜拉克缇丝-肛交战胜事件-1.png', '露娜拉克缇丝-肛交战胜事件-2.png'],
      },
      {
        id: 'pussy_victory',
        name: '（稀有事件）露娜拉克缇丝-小穴战胜事件',
        description: '你战胜了露娜，她允许你插入她的小穴。',
        images: ['露娜拉克缇丝-小穴战胜事件.png'],
        probability: 0.15,
      },
    ],
  },
  female: {
    defeat: [
      {
        id: 'dogeza_submission',
        name: '露娜拉克缇丝-土下座臣服事件',
        description: '你被露娜击败，作为惩罚，她让你土下座后给予1000金币后让你离开。',
        images: ['露娜拉克缇丝-土下座臣服事件-1.png', '露娜拉克缇丝-土下座臣服事件-2.png'],
      },
      {
        id: 'yuri_sex',
        name: '露娜拉克缇丝-百合事件',
        description: '你被露娜击败，今天没有惩罚，她会和你进行百合性爱。',
        images: ['露娜拉克缇丝-百合事件.png'],
      },
      {
        id: 'breast_aroma_handjob_female',
        name: '露娜拉克缇丝-乳香支配手淫事件',
        description: '你被露娜击败，作为惩罚你坐在她身上，你被带上奶嘴和尿裤，头被她的奶子夹着，一边轻语为你手淫。',
        images: ['露娜拉克缇丝-乳香支配手淫事件-1.png', '露娜拉克缇丝-乳香支配手淫事件-2.png', '露娜拉克缇丝-乳香支配手淫事件-3.png'],
      },
      {
        id: 'handjob_event',
        name: '露娜拉克缇丝-手淫事件',
        description: '你被露娜击败，她会手淫让你高潮后让你离开。',
        images: ['露娜拉克缇丝-手淫事件.png'],
      },
      {
        id: 'loli_wall_training',
        name: '露娜拉克缇丝-萝莉化按墙调教事件',
        description: '你被露娜击败，作为惩罚，她把你变成萝莉，用巨大乳房把你按在墙上，让你两脚悬空，并且一边用假阳具插入你的小穴，一边用尾巴开发你的后穴。',
        images: ['露娜拉克缇丝-萝莉化按墙调教事件-1.png', '露娜拉克缇丝-萝莉化按墙调教事件-2.png'],
      },
      {
        id: 'nursing_tail_development',
        name: '露娜拉克缇丝-哺乳与尾巴后穴开发事件',
        description: '你被露娜击败，作为惩罚她一边为你哺乳（增加0.1潜力），一边用尾巴搅动你的屁穴和小穴。',
        images: ['露娜拉克缇丝-哺乳与尾巴后穴开发事件.png', '露娜拉克缇丝-哺乳与尾巴后穴开发事件-2.png'],
      },
      {
        id: 'cow_public_humiliation',
        name: '露娜拉克缇丝-母牛公开处刑事件',
        description: '你被露娜击败，作为惩罚，她把你的胸部变大，并且让你穿上奶牛服牵着你一起在广场逛街，结束后会给予3000金币补偿。',
        images: ['露娜拉克缇丝-母牛公开处刑事件.png'],
      },
      {
        id: 'puppy_play',
        name: '露娜拉克缇丝-母狗扮演事件',
        description: '你被露娜击败，你被她带上项圈，牵上狗绳，带上耳朵和尾巴肛塞，需要作为她的可爱小母狗一起度过3小时调教，她会温柔对待您。',
        images: ['露娜拉克缇丝-母狗扮演事件-1.png', '露娜拉克缇丝-母狗扮演事件-2.png'],
      },
      {
        id: 'forced_dildo_sitting',
        name: '露娜拉克缇丝-强制假阳具坐事件',
        description: '你被露娜击败，她让你坐在椅子的魔法假阳具上，并且给予奖励。',
        images: ['露娜拉克缇丝-强制假阳具坐事件.png'],
      },
      {
        id: 'succubus_riding',
        name: '（稀有事件）露娜拉克缇丝-乳魔骑乘事件',
        description: '你被露娜击败，作为惩罚她用扶她肉棒插入你的小穴，一边抽插注入魅魔化因子，一边刻画淫纹，即将成为她的乳魔妹妹。',
        images: ['露娜拉克缇丝-乳魔骑乘事件.png'],
        probability: 0.03,
      },
      {
        id: 'succubus_transformation_female',
        name: '（稀有事件）露娜拉克缇丝-乳魔化事件',
        description: '你被露娜击败，作为惩罚你被她注入魅魔化因子，并且带你到镜子前一边让你观看自己恶堕魅魔化的形态，你的头发变得像露娜一样紫色，一边开发你的乳房（让乳房变大和分泌乳汁）和小穴。',
        images: ['露娜拉克缇丝-乳魔化事件.png', '露娜拉克缇丝-乳魔化事件-1.png', '露娜拉克缇丝-乳魔化事件-2.png'],
        probability: 0.03,
      },
      {
        id: 'womb_regression_female',
        name: '（稀有事件）露娜拉克缇丝-胎内回归事件',
        description: '你被露娜击败，作为惩罚，她把你缩小塞入子宫，时间快进在一个月后，你会作为她的乳魔女儿降生。',
        images: ['露娜拉克缇丝-胎内回归事件.png'],
        probability: 0.03,
      },
    ],
    victory: [
      {
        id: 'yuri_victory',
        name: '露娜拉克缇丝-百合战胜事件',
        description: '你战胜了露娜，她会和你进行温柔的百合性爱。',
        images: ['露娜拉克缇丝-百合战胜事件.png'],
      },
      {
        id: 'puppy_play_victory',
        name: '（稀有事件）露娜拉克缇丝-母狗扮演战胜事件',
        description: '你战胜了露娜，她会在三小时内扮演你的小母狗（之后解除）。',
        images: ['露娜拉克缇丝-母狗扮演战胜事件.png'],
        probability: 0.15,
      },
    ],
  },
};

// 雪莉克里姆希尔德的CG配置
const xueLiKeLinMuXiErDeConfig: CharacterCGConfig = {
  characterName: '雪莉克里姆希尔德',
  male: {
    defeat: [
      {
        id: 'chastity_footjob',
        name: '雪莉-带锁足交事件',
        description: '你被雪莉击败，作为惩罚她会给你带上贞操锁，一边展示黑丝包裹的小穴色诱，一边为你足交，但是让你难以射精。',
        images: ['雪莉-带锁足交事件-1.png', '雪莉-带锁足交事件-2.png', '雪莉-带锁足交事件-3.png'],
      },
      {
        id: 'sock_sniffing_footjob',
        name: '雪莉-闻袜足交事件',
        description: '你被雪莉击败，作为惩罚，你被她强制闻她的黑丝，一边被她黑丝与裸足的双重足穴榨取。',
        images: ['雪莉-闻袜足交事件-1.png', '雪莉-闻袜足交事件-2.png'],
      },
      {
        id: 'humiliation_footjob',
        name: '雪莉-羞辱足交事件',
        description: '你被雪莉击败，作为惩罚她站起来用黑丝脚碾压坐在地下的你的肉棒让其射精。',
        images: ['雪莉-羞辱足交事件-1.png', '雪莉-羞辱足交事件-2.png'],
      },
      {
        id: 'humiliation_event',
        name: '雪莉-羞辱事件',
        description: '你被雪莉击败，她用黑丝玉足轻踩你头，并且询问你是否愿意加入成为女权协会的狗。',
        images: ['雪莉-羞辱事件-1.png', '雪莉-羞辱事件-2.png'],
      },
      {
        id: 'puppy_training',
        name: '雪莉-小狗驯服事件',
        description: '你被雪莉击败，作为惩罚她给你穿上狗耳，尾巴阳具，以及项圈狗链。',
        images: ['雪莉-小狗驯服事件.png'],
      },
      {
        id: 'shoe_sock_brainwash',
        name: '雪莉-鞋袜气味洗脑事件',
        description: '你被雪莉击败，作为惩罚她坐在桌上用两个脚掌闭合成足穴并且拿出散发诱人酸涩的运动鞋诱惑洗脑你。',
        images: ['雪莉-鞋袜气味洗脑事件-1.png', '雪莉-鞋袜气味洗脑事件-2.png'],
      },
      {
        id: 'onahole_milking',
        name: '雪莉-飞机杯榨取事件',
        description: '你被雪莉击败，作为惩罚她用来自女权协会某人的倒模飞机杯榨取。',
        images: ['雪莉-飞机杯榨取事件.png'],
      },
      {
        id: 'library_footjob',
        name: '雪莉-图书馆足交事件',
        description: '你被雪莉击败，作为惩罚她把你带到图书馆，在桌下为你足交，不要被其他人发现哦。',
        images: ['雪莉-图书馆足交事件-1.png', '雪莉-图书馆足交事件-2.png'],
      },
      {
        id: 'restraint_ejaculation_control',
        name: '雪莉-约束射精管理事件',
        description: '你被雪莉击败，作为惩罚她用蕾丝项圈绑住你的下体，一边舔弄撸动肉棒。',
        images: ['雪莉-约束射精管理事件-1.png', '雪莉-约束射精管理事件-2.png'],
      },
      {
        id: 'urethra_straw_torture',
        name: '雪莉-马眼责吸管事件',
        description: '你被雪莉击败，作为惩罚她使用金属纤细吸管，插入你的马眼，一边撸动肉棒，一边搅动马眼，并且吸取汁液。',
        images: ['雪莉-马眼责吸管事件.png'],
      },
      {
        id: 'footjob_milking',
        name: '雪莉-足交榨精事件',
        description: '你被雪莉击败，她将用玉足榨取你一次。',
        images: ['雪莉-足交榨精事件.png'],
      },
      {
        id: 'forced_shoejob',
        name: '雪莉-强制鞋交事件',
        description: '你被雪莉击败，她将用小皮鞋套弄你的肉棒，用鞋穴让你染上恋物癖。',
        images: ['雪莉-强制鞋交事件.png'],
      },
      {
        id: 'panty_footjob',
        name: '（稀有事件）雪莉-内裤足交事件',
        description: '你被雪莉击败，作为惩罚她会在肉棒上套着粉红内裤，为你足交。',
        images: ['雪莉-内裤足交事件.png'],
        probability: 0.08,
      },
      {
        id: 'locker_room_training',
        name: '（稀有事件）雪莉-换衣间气味调教事件',
        description: '你被雪莉击败，作为惩罚你被带到女权协会的更衣室，里面堆满了各种没洗的丝袜内裤和胸罩，并且准备对你开始小狗调教。',
        images: ['雪莉-换衣间气味调教事件-1.png', '雪莉-换衣间气味调教事件-2.png'],
        probability: 0.08,
      },
    ],
    victory: [
      {
        id: 'puppy_victory',
        name: '雪莉-小狗战胜事件',
        description: '你战胜了雪莉，作为奖励你可以给她带着项圈，调教她一次。',
        images: ['雪莉-小狗战胜事件.png', '雪莉-小狗战胜事件-1.png'],
      },
      {
        id: 'footjob_service',
        name: '雪莉-足交服务事件',
        description: '你战胜了雪莉，作为奖励她用美脚为你温柔服务。',
        images: ['雪莉-战胜足交服务事件.png'],
      },
    ],
  },
  female: {
    defeat: [
      {
        id: 'yuri_training_sex',
        name: '雪莉-百合调教性爱事件',
        description: '你被雪莉击败，作为惩罚她会穿上色情衣物和你进行贝合性爱。',
        images: ['雪莉-百合调教性爱事件-1.png', '雪莉-百合调教性爱事件-2.png', '雪莉-百合调教性爱事件-3.png'],
      },
      {
        id: 'humiliation_event_female',
        name: '雪莉-羞辱事件',
        description: '你被雪莉击败，她用黑丝玉足轻踩你头，并且询问你是否愿意加入女权协会。',
        images: ['雪莉-羞辱事件-1.png', '雪莉-羞辱事件-2.png'],
      },
      {
        id: 'puppy_training_female',
        name: '雪莉-小狗驯服事件',
        description: '你被雪莉击败，作为惩罚她给你穿上狗耳，尾巴阳具，以及项圈狗链。',
        images: ['雪莉-小狗驯服事件-1.png', '雪莉-小狗驯服事件-2.png'],
      },
      {
        id: 'shoe_sock_brainwash_female',
        name: '雪莉-鞋袜气味洗脑事件',
        description: '你被雪莉击败，作为惩罚她坐在桌上用两个脚掌闭合成足穴并且拿出散发诱人酸涩的运动鞋诱惑洗脑你。',
        images: ['雪莉-鞋袜气味洗脑事件-1.png', '雪莉-鞋袜气味洗脑事件-2.png'],
      },
      {
        id: 'kiss_gift',
        name: '（稀有事件）雪莉-献吻事件',
        description: '你被雪莉击败，今天没有惩罚，她给你献上一吻鼓励你继续加油。',
        images: ['雪莉-献吻事件-1.png'],
        probability: 0.08,
      },
      {
        id: 'locker_room_training_female',
        name: '（稀有事件）雪莉-换衣间气味调教事件',
        description: '你被雪莉击败，作为惩罚你被带到女权协会的更衣室，里面堆满了各种没洗的丝袜内裤和胸罩，并且准备对你开始小狗调教。',
        images: ['雪莉-换衣间气味调教事件-1.png', '雪莉-换衣间气味调教事件-2.png', '雪莉-换衣间气味调教事件-3.png'],
        probability: 0.10,
      },
    ],
    victory: [
      {
        id: 'puppy_victory_female',
        name: '雪莉-小狗战胜事件',
        description: '你战胜了雪莉，作为奖励你可以给她打赏项圈调教她一次。',
        images: ['雪莉-小狗战胜事件-1.png', '雪莉-小狗战胜事件-2.png'],
      },
      {
        id: 'yuri_kiss_victory',
        name: '雪莉-百合之吻战胜事件',
        description: '你战胜了雪莉，作为奖励她献上了少女的香吻。',
        images: ['雪莉-百合之吻战胜事件-1.png'],
      },
    ],
  },
};

// 所有角色的CG配置
export const CG_CONFIGS: CharacterCGConfig[] = [
  xingYeGuangConfig,
  aiLinHaiDeConfig,
  luNaLaKeDiSiConfig,
  xueLiKeLinMuXiErDeConfig,
];

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
