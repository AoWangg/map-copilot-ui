import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from "react-leaflet";
import { useEffect, useState, useRef, useCallback } from "react";
import { Map } from "leaflet";
import { cn } from "@/lib/utils";
import {
  getAttitudeScore,
  getBehavioralIntentionScore,
  parseCsvLine,
  parseSurveyData,
  UserData,
  extractDistrict,
  filterUserData,
  FilterCriteria,
} from "@/lib/tools";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { useChatContext } from "@copilotkit/react-ui";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { UserCard } from "./UserCard";
import { createPersonIcon } from "./ui/user-icon";

export type MapCanvasProps = {
  className?: string;
};

export function MapCanvas({ className }: MapCanvasProps) {
  const [map, setMap] = useState<Map | null>(null);
  const { setOpen } = useChatContext();
  const isDesktop = useMediaQuery("(min-width: 900px)");
  const prevIsDesktop = useRef(isDesktop);
  const [userData, setUserData] = useState<UserData[]>([]);
  const [originalUserData, setOriginalUserData] = useState<UserData[]>([]); // 保存原始数据
  const [csvHeader, setCsvHeader] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/llm_data.csv");
        if (!response.ok) {
          console.error("Failed to fetch CSV data");
          return;
        }
        const text = await response.text();
        const lines = text.trim().split("\n");
        // Remove BOM if present
        const headerLine =
          lines[0].charCodeAt(0) === 0xfeff ? lines[0].substring(1) : lines[0];
        const header = parseCsvLine(headerLine);
        setCsvHeader(header);

        const wgsxIndex = header.indexOf("WGSX");
        const wgsyIndex = header.indexOf("WGSY");

        if (wgsxIndex === -1 || wgsyIndex === -1) {
          console.error(
            "WGSX or WGSY column not found in CSV header. Parsed header:",
            header
          );
          return;
        }

        const data = lines
          .slice(1)
          .map((line) => {
            const values = parseCsvLine(line);

            const lat = parseFloat(values[wgsyIndex]);
            const lng = parseFloat(values[wgsxIndex]);

            if (
              !isNaN(lat) &&
              !isNaN(lng) &&
              Math.abs(lat) < 90 &&
              Math.abs(lng) < 180
            ) {
              // 解析调查数据
              let surveyData = {};
              try {
                const dataField = values[header.indexOf("data")];
                if (dataField) {
                  surveyData = JSON.parse(dataField.replace(/'/g, '"'));
                }
              } catch (error) {
                console.warn("Failed to parse survey data:", error);
              }

              const workAddress = values[header.indexOf("完整地址")] || "";
              const completeAddress = values[header.indexOf("完整地址")] || "";
              const workDistrict =
                values[header.indexOf("单位（学校）地址-行政区县")] ||
                extractDistrict(workAddress);
              const residenceDistrict = extractDistrict(completeAddress);

              const parsedData = {
                birthYear: values[header.indexOf("出生年月（年月日）")] || "",
                age: parseInt(values[header.indexOf("年龄（实岁）")]) || 0,
                gender: values[header.indexOf("性别00")] === "1" ? "女" : "男",
                residenceType: values[header.indexOf("居住情况")] || "",
                surveyDay: values[header.indexOf("调查星期")] || "",
                employmentStatus: values[header.indexOf("就业/学状态")] || "",
                occupation: values[header.indexOf("职业（身份）")] || "",
                workAddress: workAddress,
                completeAddress: completeAddress,
                addressId: values[header.indexOf("地址ID")] || "",
                workDistrict: workDistrict, // 上班地行政区
                residenceDistrict: residenceDistrict, // 居住地行政区
                surveyData: parseSurveyData(surveyData),
              };

              return { lat, lng, data: values, parsedData };
            }
            return null;
          })
          .filter((item): item is UserData => item !== null);

        setUserData(data);
        setOriginalUserData(data); // 保存原始数据
      } catch (error) {
        console.error("Error fetching or parsing user data:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (prevIsDesktop.current !== isDesktop) {
      setOpen(isDesktop);
    }
    prevIsDesktop.current = isDesktop;
  }, [isDesktop, setOpen]);

  useCopilotReadable({
    description: `你是一位公交用户，你的个人信息如下，你要根据你的个人信息，以第一人称视角来回答用户的问题`,
    value: selectedUser,
  });

  useCopilotAction({
    name: "筛选用户",
    description:
      "根据多个条件筛选用户数据，支持职业、性别、年龄、问卷评分、居住地、上班地等条件",
    parameters: [
      {
        name: "occupation",
        type: "string",
        description: "用户的职业（如：学生、上班族、退休人员等）",
        required: false,
      },
      {
        name: "gender",
        type: "string",
        description: "用户性别（男/女）",
        required: false,
      },
      {
        name: "ageRange",
        type: "string",
        description: "年龄范围（如：18-25、26-35、36-50、50以上）",
        required: false,
      },
      {
        name: "minAttitudeScore",
        type: "number",
        description: "态度评分最小值（1-5分）",
        required: false,
      },
      {
        name: "maxAttitudeScore",
        type: "number",
        description: "态度评分最大值（1-5分）",
        required: false,
      },
      {
        name: "minBehavioralIntentionScore",
        type: "number",
        description: "行为意图评分最小值（1-5分）",
        required: false,
      },
      {
        name: "maxBehavioralIntentionScore",
        type: "number",
        description: "行为意图评分最大值（1-5分）",
        required: false,
      },
      {
        name: "awarenessOfRouteAdjustment",
        type: "string",
        description: "对线路调整的了解程度",
        required: false,
      },
      {
        name: "planToUseAdjustedRoute",
        type: "string",
        description: "是否计划使用调整后的线路",
        required: false,
      },
      {
        name: "commuteChange",
        type: "string",
        description: "通勤方式变化",
        required: false,
      },
      {
        name: "residenceDistrict",
        type: "string",
        description: "居住地行政区（如：黄浦区、徐汇区、闵行区、浦东新区等）",
        required: false,
      },
      {
        name: "workDistrict",
        type: "string",
        description: "上班地行政区（如：黄浦区、徐汇区、闵行区、浦东新区等）",
        required: false,
      },
      {
        name: "resetFilter",
        type: "boolean",
        description: "是否重置所有筛选条件，显示所有用户",
        required: false,
      },
    ],
    handler: async (criteria: FilterCriteria) => {
      // 使用工具函数进行筛选
      const filteredData = filterUserData(originalUserData, criteria);

      // 更新筛选后的数据
      setUserData(filteredData);

      // 如果筛选后只有一个用户，自动选中该用户
      if (filteredData.length === 1) {
        setSelectedUser(filteredData[0]);
      } else {
        setSelectedUser(null);
      }
    },
  });

  // 处理地图点击事件
  const handleMapClick = () => {
    setSelectedUser(null);
  };

  // 处理用户卡片点击事件（阻止冒泡）
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const onUserClick = (user: UserData) => {
    setSelectedUser(user);
  };

  return (
    <div className="relative" onClick={handleMapClick}>
      {selectedUser && (
        <div className="absolute top-12 left-12 z-10" onClick={handleCardClick}>
          <UserCard
            className="border-none overflow-y-auto shadow-none cursor-pointer hover:shadow-lg"
            selectedUser={selectedUser}
          />
        </div>
      )}
      <MapContainer
        className={cn("w-screen h-screen", className)}
        style={{ zIndex: 0 }}
        center={[31.2304, 121.4737]}
        zoom={10}
        zoomAnimationThreshold={100}
        zoomControl={false}
        ref={setMap}
      >
        <TileLayer
          url="https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}"
          subdomains={["1", "2", "3", "4"]}
          maxZoom={18}
          minZoom={3}
        />
        {userData.map((user, index) => (
          <Marker
            key={index}
            position={[user.lat, user.lng]}
            icon={createPersonIcon(
              user.parsedData.gender,
              user.parsedData.occupation
            )}
            eventHandlers={{
              click: (e) => {
                e.originalEvent.stopPropagation();
                onUserClick(user);
              },
            }}
          ></Marker>
        ))}
      </MapContainer>
    </div>
  );
}
