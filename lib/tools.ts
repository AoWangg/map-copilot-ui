import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 定义问卷数据的详细类型
export type SurveyData = {
  // 背景信息
  background: {
    gender: string;
    ageGroup: string;
    occupation: string;
    residenceAddress: string;
    commonTransportModes: string[];
  };

  // 情景信息
  scenario: {
    awarenessOfRouteAdjustment: string; // 对线路调整的了解程度
    planToUseAdjustedRoute: string; // 是否计划使用调整后的线路
    impactOnTravelRoute: string; // 对出行路线的影响
  };

  // 出行行为信息 - 李克特量表评分
  behavior: {
    attitude: {
      betterExperience: number; // 1. 出行体验变得更好
      moreReasonable: number; // 2. 线路更加合理
      wiseChoice: number; // 3. 明智且高效的选择
      moreComfortable: number; // 4. 更舒适/便捷
    };
    subjectiveNorm: {
      familyFriendsSuggestion: number; // 5. 家人朋友建议
      colleaguesOpinion: number; // 6. 同事认为积极改变
      othersPerception: number; // 7. 他人认为明智
      adaptationTrend: number; // 8. 大家都在适应
    };
    perceivedBehavioralControl: {
      understandNewRoute: number; // 9. 了解新线路
      easyToFindInfo: number; // 10. 轻松找到信息
      abilityToReplan: number; // 11. 重新规划能力
      adaptationAbility: number; // 12. 适应新路线能力
    };
    behavioralIntention: {
      planToUseMore: number; // 13. 打算更多使用
      willingToChoose: number; // 14. 愿意选择新公交
      adjustedCommute: number; // 15. 已调整通勤方式
    };
  };

  // 实际行为变化
  actualBehavior: {
    commuteChange: string; // 通勤方式变化
    timeChange: string; // 通勤时间变化
  };

  // 开放式问题
  openQuestions: {
    evaluationOfAdjustment: string; // 对调整的评价
    inconveniences: string; // 不便之处
    optimizationSuggestions: string; // 优化建议
  };
};

// 定义用户数据的类型
export type UserData = {
  lat: number;
  lng: number;
  data: string[];
  // 解析后的结构化数据
  parsedData: {
    birthYear: string;
    age: number;
    gender: string;
    residenceType: string;
    surveyDay: string;
    employmentStatus: string;
    occupation: string;
    workAddress: string;
    completeAddress: string;
    addressId: string;
    workDistrict: string; // 上班地行政区
    residenceDistrict: string; // 居住地行政区
    surveyData: SurveyData;
  };
};

/**
 * 解析CSV行数据
 * @param line CSV行字符串
 * @returns 解析后的字段数组
 */
export function parseCsvLine(line: string): string[] {
  const regex = /(".*?"|[^",]+)(?=\s*,|\s*$)/g;
  const matches = line.match(regex) || [];
  return matches.map((field) => {
    // remove surrounding quotes and trim
    return field.replace(/^"|"$/g, "").trim();
  });
}

/**
 * 解析问卷数据
 * @param rawData 原始问卷数据对象
 * @returns 结构化的问卷数据
 */
export function parseSurveyData(rawData: Record<string, any>): SurveyData {
  return {
    background: {
      gender: rawData["1"] || "",
      ageGroup: rawData["2"] || "",
      occupation: rawData["3"] || "",
      residenceAddress: rawData["4"] || "",
      commonTransportModes: Array.isArray(rawData["5"])
        ? rawData["5"]
        : typeof rawData["5"] === "string"
        ? [rawData["5"]]
        : [],
    },

    scenario: {
      awarenessOfRouteAdjustment: rawData["6"] || "", // 对线路调整的了解程度
      planToUseAdjustedRoute: rawData["7"] || "", // 是否计划使用调整后的线路
      impactOnTravelRoute: rawData["8"] || "", // 对出行路线的影响
    },

    behavior: {
      attitude: {
        betterExperience: parseInt(rawData["9"]) || 0, // 1. 出行体验变得更好
        moreReasonable: parseInt(rawData["10"]) || 0, // 2. 线路更加合理
        wiseChoice: parseInt(rawData["11"]) || 0, // 3. 明智且高效的选择
        moreComfortable: parseInt(rawData["12"]) || 0, // 4. 更舒适/便捷
      },
      subjectiveNorm: {
        familyFriendsSuggestion: parseInt(rawData["13"]) || 0, // 5. 家人朋友建议
        colleaguesOpinion: parseInt(rawData["14"]) || 0, // 6. 同事认为积极改变
        othersPerception: parseInt(rawData["15"]) || 0, // 7. 他人认为明智
        adaptationTrend: parseInt(rawData["16"]) || 0, // 8. 大家都在适应
      },
      perceivedBehavioralControl: {
        understandNewRoute: parseInt(rawData["17"]) || 0, // 9. 了解新线路
        easyToFindInfo: parseInt(rawData["18"]) || 0, // 10. 轻松找到信息
        abilityToReplan: parseInt(rawData["19"]) || 0, // 11. 重新规划能力
        adaptationAbility: parseInt(rawData["20"]) || 0, // 12. 适应新路线能力
      },
      behavioralIntention: {
        planToUseMore: parseInt(rawData["21"]) || 0, // 13. 打算更多使用
        willingToChoose: parseInt(rawData["22"]) || 0, // 14. 愿意选择新公交
        adjustedCommute: parseInt(rawData["23"]) || 0, // 15. 已调整通勤方式
      },
    },

    actualBehavior: {
      commuteChange: rawData["29"] || "", // 通勤方式变化
      timeChange: rawData["30"] || "", // 通勤时间变化
    },

    openQuestions: {
      evaluationOfAdjustment: rawData["31"] || "", // 对调整的评价
      inconveniences: rawData["32"] || "", // 不便之处
      optimizationSuggestions: rawData["33"] || "", // 优化建议
    },
  };
}

/**
 * 计算李克特量表平均分
 * @param scores 评分数组
 * @returns 平均分
 */
export function calculateAverageScore(scores: number[]): number {
  const validScores = scores.filter((score) => score > 0);
  if (validScores.length === 0) return 0;
  return (
    validScores.reduce((sum, score) => sum + score, 0) / validScores.length
  );
}

/**
 * 获取行为态度总分
 * @param surveyData 问卷数据
 * @returns 态度维度总分
 */
export function getAttitudeScore(surveyData: SurveyData): number {
  const scores = [
    surveyData.behavior.attitude.betterExperience,
    surveyData.behavior.attitude.moreReasonable,
    surveyData.behavior.attitude.wiseChoice,
    surveyData.behavior.attitude.moreComfortable,
  ];
  return calculateAverageScore(scores);
}

/**
 * 获取主观规范总分
 * @param surveyData 问卷数据
 * @returns 主观规范维度总分
 */
export function getSubjectiveNormScore(surveyData: SurveyData): number {
  const scores = [
    surveyData.behavior.subjectiveNorm.familyFriendsSuggestion,
    surveyData.behavior.subjectiveNorm.colleaguesOpinion,
    surveyData.behavior.subjectiveNorm.othersPerception,
    surveyData.behavior.subjectiveNorm.adaptationTrend,
  ];
  return calculateAverageScore(scores);
}

/**
 * 获取感知行为控制总分
 * @param surveyData 问卷数据
 * @returns 感知行为控制维度总分
 */
export function getPerceivedBehavioralControlScore(
  surveyData: SurveyData
): number {
  const scores = [
    surveyData.behavior.perceivedBehavioralControl.understandNewRoute,
    surveyData.behavior.perceivedBehavioralControl.easyToFindInfo,
    surveyData.behavior.perceivedBehavioralControl.abilityToReplan,
    surveyData.behavior.perceivedBehavioralControl.adaptationAbility,
  ];
  return calculateAverageScore(scores);
}

/**
 * 获取行为意图总分
 * @param surveyData 问卷数据
 * @returns 行为意图维度总分
 */
export function getBehavioralIntentionScore(surveyData: SurveyData): number {
  const scores = [
    surveyData.behavior.behavioralIntention.planToUseMore,
    surveyData.behavior.behavioralIntention.willingToChoose,
    surveyData.behavior.behavioralIntention.adjustedCommute,
  ];
  return calculateAverageScore(scores);
}

/**
 * 从地址中提取行政区信息
 * @param address 地址字符串
 * @returns 行政区名称
 */
export function extractDistrict(address: string): string {
  if (!address) return "";

  // 上海市行政区列表
  const districts = [
    "黄浦区",
    "徐汇区",
    "长宁区",
    "静安区",
    "普陀区",
    "虹口区",
    "杨浦区",
    "闵行区",
    "宝山区",
    "嘉定区",
    "浦东新区",
    "金山区",
    "松江区",
    "青浦区",
    "奉贤区",
    "崇明区",
  ];

  for (const district of districts) {
    if (address.includes(district)) {
      return district;
    }
  }

  return "";
}

/**
 * 筛选条件类型定义
 */
export type FilterCriteria = {
  occupation?: string;
  gender?: string;
  ageRange?: string;
  minAttitudeScore?: number;
  maxAttitudeScore?: number;
  minBehavioralIntentionScore?: number;
  maxBehavioralIntentionScore?: number;
  awarenessOfRouteAdjustment?: string;
  planToUseAdjustedRoute?: string;
  commuteChange?: string;
  residenceDistrict?: string;
  workDistrict?: string;
  resetFilter?: boolean;
};

/**
 * 根据多个条件筛选用户数据
 * @param userData 原始用户数据
 * @param criteria 筛选条件
 * @returns 筛选后的用户数据
 */
export function filterUserData(
  userData: UserData[],
  criteria: FilterCriteria
): UserData[] {
  // 如果重置筛选，返回所有数据
  if (criteria.resetFilter) {
    return userData;
  }

  let filteredData = [...userData];

  // 按职业筛选
  if (criteria.occupation) {
    filteredData = filteredData.filter(
      (user) => user.parsedData.occupation === criteria.occupation
    );
  }

  // 按性别筛选
  if (criteria.gender) {
    filteredData = filteredData.filter(
      (user) => user.parsedData.gender === criteria.gender
    );
  }

  // 按年龄范围筛选
  if (criteria.ageRange) {
    const [minAge, maxAge] = criteria.ageRange.split("-").map(Number);
    filteredData = filteredData.filter((user) => {
      const age = user.parsedData.age;
      if (maxAge) {
        return age >= minAge && age <= maxAge;
      } else {
        return age >= minAge;
      }
    });
  }

  // 按态度评分筛选
  if (
    criteria.minAttitudeScore !== undefined ||
    criteria.maxAttitudeScore !== undefined
  ) {
    filteredData = filteredData.filter((user) => {
      const attitudeScore = getAttitudeScore(user.parsedData.surveyData);
      if (
        criteria.minAttitudeScore !== undefined &&
        criteria.maxAttitudeScore !== undefined
      ) {
        return (
          attitudeScore >= criteria.minAttitudeScore &&
          attitudeScore <= criteria.maxAttitudeScore
        );
      } else if (criteria.minAttitudeScore !== undefined) {
        return attitudeScore >= criteria.minAttitudeScore;
      } else if (criteria.maxAttitudeScore !== undefined) {
        return attitudeScore <= criteria.maxAttitudeScore;
      }
      return true;
    });
  }

  // 按行为意图评分筛选
  if (
    criteria.minBehavioralIntentionScore !== undefined ||
    criteria.maxBehavioralIntentionScore !== undefined
  ) {
    filteredData = filteredData.filter((user) => {
      const behavioralIntentionScore = getBehavioralIntentionScore(
        user.parsedData.surveyData
      );
      if (
        criteria.minBehavioralIntentionScore !== undefined &&
        criteria.maxBehavioralIntentionScore !== undefined
      ) {
        return (
          behavioralIntentionScore >= criteria.minBehavioralIntentionScore &&
          behavioralIntentionScore <= criteria.maxBehavioralIntentionScore
        );
      } else if (criteria.minBehavioralIntentionScore !== undefined) {
        return behavioralIntentionScore >= criteria.minBehavioralIntentionScore;
      } else if (criteria.maxBehavioralIntentionScore !== undefined) {
        return behavioralIntentionScore <= criteria.maxBehavioralIntentionScore;
      }
      return true;
    });
  }

  // 按对线路调整的了解程度筛选
  if (criteria.awarenessOfRouteAdjustment) {
    filteredData = filteredData.filter(
      (user) =>
        user.parsedData.surveyData.scenario.awarenessOfRouteAdjustment ===
        criteria.awarenessOfRouteAdjustment
    );
  }

  // 按是否计划使用调整后的线路筛选
  if (criteria.planToUseAdjustedRoute) {
    filteredData = filteredData.filter(
      (user) =>
        user.parsedData.surveyData.scenario.planToUseAdjustedRoute ===
        criteria.planToUseAdjustedRoute
    );
  }

  // 按通勤方式变化筛选
  if (criteria.commuteChange) {
    filteredData = filteredData.filter(
      (user) =>
        user.parsedData.surveyData.actualBehavior.commuteChange ===
        criteria.commuteChange
    );
  }

  // 按居住地行政区筛选
  if (criteria.residenceDistrict) {
    filteredData = filteredData.filter(
      (user) => user.parsedData.residenceDistrict === criteria.residenceDistrict
    );
  }

  // 按上班地行政区筛选
  if (criteria.workDistrict) {
    filteredData = filteredData.filter(
      (user) => user.parsedData.workDistrict === criteria.workDistrict
    );
  }

  return filteredData;
}

/**
 * 根据性别和职业生成用户 SVG 图标及尺寸
 * @param gender 性别（"男"/"女"）
 * @param occupation 职业
 * @returns { svg: string, size: number }
 */
export function createPersonIcon(
  gender: string,
  occupation: string,
  isSelected: boolean
): { svg: string; size: number } {
  let color = "#4CAF50"; // 默认绿色
  if (gender === "女") {
    color = "#E91E63"; // 粉色
  }
  let size = 24;
  if (occupation === "学生") {
    size = 20;
  } else if (occupation === "退休人员") {
    size = 28;
  }
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="5" fill="${color}"/>
      <path d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21" stroke="${color}" stroke-width="2" fill="none"/>
    </svg>
  `;
  return { svg, size };
}

/**
 * 统计每个乡镇的用户分布、低分用户数、通勤方式转变用户数
 * @param geojson 乡镇geojson
 * @param userData 用户数据
 * @param attitudeThreshold 态度评分低的阈值，默认3分
 * @returns 统计结果对象
 */
export function getTownStats(
  geojson: any,
  userData: UserData[],
  attitudeThreshold: number = 3
) {
  // turf 的 booleanPointInPolygon 需在调用处引入
  const booleanPointInPolygon = (globalThis as any).booleanPointInPolygon;
  if (!booleanPointInPolygon) {
    throw new Error("请在调用前确保 booleanPointInPolygon 已全局引入");
  }
  const townStats = geojson.features.map((feature: any) => {
    const name = feature.properties.Name;
    let userCount = 0;
    let lowAttitudeCount = 0;
    let commuteChangeCount = 0;
    userData.forEach((user) => {
      const pt = {
        type: "Point" as const,
        coordinates: [user.lng, user.lat],
      };
      if (booleanPointInPolygon(pt, feature)) {
        userCount++;
        if (getAttitudeScore(user.parsedData.surveyData) < attitudeThreshold) {
          lowAttitudeCount++;
        }
        const commuteChange =
          user.parsedData.surveyData.actualBehavior.commuteChange;
        if (
          commuteChange &&
          commuteChange !== "没有变化" &&
          commuteChange !== "无变化"
        ) {
          commuteChangeCount++;
        }
      }
    });
    return { name, userCount, lowAttitudeCount, commuteChangeCount };
  });
  const mostUsers = townStats.reduce(
    (a, b) => (a.userCount > b.userCount ? a : b),
    { userCount: -1 }
  );
  const mostLowAttitude = townStats.reduce(
    (a, b) => (a.lowAttitudeCount > b.lowAttitudeCount ? a : b),
    { lowAttitudeCount: -1 }
  );
  const mostCommuteChange = townStats.reduce(
    (a, b) => (a.commuteChangeCount > b.commuteChangeCount ? a : b),
    { commuteChangeCount: -1 }
  );
  return {
    受影响用户最多街道: mostUsers.name,
    受影响用户数: mostUsers.userCount,
    态度评分低用户最多街道: mostLowAttitude.name,
    态度评分低用户数: mostLowAttitude.lowAttitudeCount,
    通勤方式转变用户最多街道: mostCommuteChange.name,
    通勤方式转变用户数: mostCommuteChange.commuteChangeCount,
    详细分布: townStats.sort((a, b) => b.userCount - a.userCount),
  };
}
