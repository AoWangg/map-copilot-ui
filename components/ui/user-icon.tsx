import { divIcon } from "leaflet";

// 职业编码映射表
export const occupationMapping: Record<string, string> = {
  "1": "学生",
  "2": "工人",
  "3": "职员",
  "4": "教师",
  "5": "医生",
  "6": "退休",
  "7": "其他",
  // 可以根据实际数据添加更多映射
};

// 根据职业编码确定图标颜色
const getOccupationColor = (occCode: string) => {
  const occupation = occupationMapping[occCode] || "其他";

  switch (occupation) {
    case "学生":
      return "#3B82F6"; // 蓝色
    case "工人":
      return "#EF4444"; // 红色
    case "职员":
      return "#10B981"; // 绿色
    case "教师":
      return "#8B5CF6"; // 紫色
    case "医生":
      return "#F59E0B"; // 橙色
    case "退休":
      return "#6B7280"; // 灰色
    default:
      return "#6366F1"; // 默认紫色
  }
};

// 创建自定义小人图标
export const createPersonIcon = (gender: string, occupationCode: string) => {
  const color = getOccupationColor(occupationCode);
  const isFemale = gender === "女";

  // 创建小人图标的HTML
  const iconHtml = `
    <div style="
      width: 24px;
      height: 24px;
      background: ${color};
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
    ">
      <div style="
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        position: absolute;
        top: 2px;
      "></div>
      <div style="
        width: 12px;
        height: 12px;
        background: white;
        border-radius: 50% 50% 0 0;
        position: absolute;
        top: 8px;
        left: 6px;
      "></div>
      ${
        isFemale
          ? `
        <div style="
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 1px;
          left: 3px;
        "></div>
        <div style="
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 1px;
          right: 3px;
        "></div>
      `
          : ""
      }
    </div>
  `;

  return divIcon({
    html: iconHtml,
    className: "custom-person-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// 获取职业名称的辅助函数
export const getOccupationName = (occupationCode: string) => {
  return occupationMapping[occupationCode] || "其他";
};
