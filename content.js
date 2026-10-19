'use strict';
// One ordered repair/verification task line; content remains separate from state.
const OFFER_CONTENT = {
  "mission": "让每一项能力，都有证据可验证。",
  "proposition": "面试 = 能力证据交换",
  "views": {
    "driver": {
      "name": "DRIVER VIEW",
      "message": "我的问题不是怎么包装，而是哪里还缺证据。",
      "labels": [
        "症状",
        "原因",
        "QUICK FIX",
        "LONG-TERM UPGRADE"
      ]
    },
    "scout": {
      "name": "SCOUT VIEW",
      "message": "不听故事有多顺，只看证据能不能成立。",
      "labels": [
        "我看到什么",
        "我要追问什么",
        "什么才算证据",
        "我的判断"
      ]
    }
  },
  "preflight": [
    "JD / 岗位目标已锁定",
    "经历与角色边界已确认",
    "时间 / 硬性条件已检查"
  ],
  "dimensions": [
    [
      "CONTRIBUTION",
      "个人贡献"
    ],
    [
      "EVIDENCE",
      "验证证据"
    ],
    [
      "CAUSALITY",
      "结果归因"
    ],
    [
      "GAP",
      "缺口可补性"
    ]
  ],
  "faults": [
    {
      "code": "TARGET",
      "name": "动机泛化",
      "part": "barrel",
      "anchor": [
        556,
        201
      ],
      "driver": [
        "“行业有前景”“岗位很适合我”，但听起来像所有人都能说。",
        "缺少“自己遇到的问题 → 为什么选择这个方向 → 与岗位的直接关联”。",
        "切身问题 → 真实行动 → 岗位连接",
        "积累真实的行业投入和相关实践，让“热情”有行为证据。"
      ],
      "scout": [
        "方向正确，但动机高度模板化。",
        "你为什么是现在开始做这件事？\n为这个方向，你已经投入过什么？",
        "不是“我很感兴趣”，而是持续投入过的真实行为。",
        "热情可以加分，但不能替代证据。"
      ],
      "quick": [
        "structure"
      ],
      "long": [
        "role",
        "industry"
      ]
    },
    {
      "code": "OUTPUT",
      "name": "结果缺失",
      "part": "turret",
      "anchor": [
        354,
        226
      ],
      "driver": [
        "可以讲清“我做了什么”，但说不清项目最终产生了什么变化。",
        "过程不等于结果，方案做完不代表成果成立。",
        "补齐结果指标 / 测试结果 / 用户反馈 / 上线状态。",
        "真正完成一个能被验证的项目，用真实反馈替代“如果继续做，我会……”。"
      ],
      "scout": [
        "流程完整、框架清晰，但看不到交付。",
        "最后上线了吗？\n谁用了？\n有什么变化？\n怎么验证？",
        "作品 / 测试 / 用户反馈 / 量化结果",
        "有经历 ≠ 有交付能力。\n思路清晰 ≠ 业绩成立。"
      ],
      "quick": [
        "proofkit"
      ],
      "long": [
        "project",
        "portfolio"
      ]
    },
    {
      "code": "ARMOR",
      "name": "追问坍塌",
      "part": "armor",
      "anchor": [
        397,
        325
      ],
      "driver": [
        "第一层故事讲得完整，但被问“谁在用？你具体做了什么？”就开始变虚。",
        "“我做过”不等于“我做成了”。",
        "给案例做“最强追问预演”，提前找到最容易被打穿的反例。",
        "沉淀真正属于自己的案例证据：个人决策、作品、用户、反馈、复盘。"
      ],
      "scout": [
        "故事讲得很好，但归属和真实深度不确定。",
        "哪一步是你做的？\n哪一步是团队完成的？\n最难的决策是什么？\n你能现场证明哪一部分？",
        "能够清楚区分：\n做过 / 知道怎么做 / 尚未做过",
        "说清边界通常比“什么都认领”更可信。"
      ],
      "quick": [
        "level",
        "stress"
      ],
      "long": [
        "project",
        "review"
      ]
    },
    {
      "code": "RADAR",
      "name": "口径模糊",
      "part": "radar",
      "anchor": [
        286,
        154
      ],
      "driver": [
        "“增长30%”“新增很多用户”——数字有了，却越讲越危险。",
        "没有解释统计对象 / 周期 / 基线 / 本人贡献。",
        "所有数字按四问检查：\n谁？多久？和什么比？我贡献多少？",
        "建立结果记录习惯，在项目过程中就记录指标、基线和个人贡献。"
      ],
      "scout": [
        "数字漂亮，但解释链条不完整。",
        "统计对象是谁？\n周期多长？\n基线是什么？\n哪部分能归因于你？",
        "口径清楚 + 判断依据清楚 + 归因克制",
        "数字不是越大越好，越能解释越可信。"
      ],
      "quick": [
        "structure",
        "proofkit"
      ],
      "long": [
        "review"
      ]
    }
  ],
  "components": {
    "structure": {
      "name": "三句结构",
      "summary": "为什么 → 我做了什么 → 结果",
      "details": [
        "60 秒先抛最强案例",
        "回答前先说结论"
      ]
    },
    "level": {
      "name": "证据分级",
      "summary": "仅设想 / 做过无验证 / 已验证",
      "details": []
    },
    "stress": {
      "name": "最强追问",
      "summary": "提前找到最容易被打穿的点",
      "details": [
        "AI 模拟",
        "录音复盘",
        "反例预演"
      ]
    },
    "proofkit": {
      "name": "证据包",
      "summary": "截图 / 原文件 / 链接 / Demo",
      "details": [
        "设计 → 代码 → 接口 → 测试 → 结果"
      ]
    },
    "project": {
      "name": "真实项目",
      "summary": "先完成，再完善",
      "details": []
    },
    "portfolio": {
      "name": "作品资产",
      "summary": "GitHub / 作品集 / 案例组合",
      "details": []
    },
    "role": {
      "name": "岗位能力",
      "summary": "行业认知 / 技术深挖 / 场景理解 / 个人能力标签",
      "details": [
        "行业认知",
        "技术深挖",
        "场景理解",
        "个人能力标签"
      ]
    },
    "review": {
      "name": "复盘系统",
      "summary": "证据等级 / 追问风险等级 / 面试 Gap / 下一轮更新",
      "details": [
        "证据等级",
        "追问风险等级",
        "面试 Gap",
        "下一轮更新"
      ]
    },
    "industry": {
      "name": "行业认知",
      "summary": "理解行业问题、岗位场景与选择依据。",
      "details": []
    }
  },
  "reviewLoop": [
    "经历",
    "证据库",
    "追问预演",
    "面试",
    "Gap",
    "补证据"
  ]
};
