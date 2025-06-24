import { useEffect, useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  parseCsvLine,
  parseSurveyData,
  UserData,
  extractDistrict,
  filterUserData,
  FilterCriteria,
  createPersonIcon,
  getTownStats,
} from "@/lib/tools";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { useChatContext } from "@copilotkit/react-ui";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { UserCard } from "./line-evaluation/user-card";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import buslineData from "@/data/busline.json";
import type { GeoJsonObject } from "geojson";
import { PlaceCard } from "./bus-line/place-card";
import { DndContext, useDraggable, DragEndEvent } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";

export type MapCanvasProps = {
  className?: string;
  initialBusName?: string | null;
  adjustmentChoice?: string | null;
  adjustmentPlan?: string | null;
};

type BusLineData = {
  features: {
    properties: {
      BusName: string;
      Layer: string;
      Dir_Name: string;
    };
    geometry: GeoJsonObject;
  }[];
};

// 声明高德地图的全局类型
declare global {
  interface Window {
    AMap: any;
  }
}

export function MapCanvas({
  className,
  initialBusName,
  adjustmentChoice,
  adjustmentPlan,
}: MapCanvasProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map()); // 存储所有标记的引用
  const polylinesRef = useRef<Map<string, any>>(new Map()); // 存储所有线路的引用
  const { setOpen } = useChatContext();
  const isDesktop = useMediaQuery("(min-width: 900px)");
  const prevIsDesktop = useRef(isDesktop);
  const [userData, setUserData] = useState<UserData[]>([]);
  const [originalUserData, setOriginalUserData] = useState<UserData[]>([]); // 保存原始数据
  const [csvHeader, setCsvHeader] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [highlightedLineName, setHighlightedLineName] = useState<
    string | null
  >();
  const [selectedLineInfo, setSelectedLineInfo] = useState(null);
  const router = useRouter();

  // 添加卡片位置状态
  const [userCardPosition, setUserCardPosition] = useState({ x: 48, y: 96 }); // top-24 left-12 对应的像素值
  const [lineCardPosition, setLineCardPosition] = useState({ x: 48, y: 96 });

  // 添加一个 ref 来跟踪当前高亮的线路
  const highlightedPolylinesRef = useRef<Set<any>>(new Set());

  // 处理初始线路信息
  useEffect(() => {
    if (initialBusName) {
      const line = (buslineData as BusLineData).features.find(
        (feature) => feature.properties.BusName === initialBusName
      );
      if (line) {
        setHighlightedLineName(line.properties.Layer);
        setSelectedLineInfo(line.properties);
      }
    }
  }, [initialBusName]);

  // 初始化高德地图
  useEffect(() => {
    const initMap = async () => {
      if (!mapContainerRef.current || mapRef.current) return;

      // 动态加载高德地图脚本
      if (!window.AMap) {
        const script = document.createElement("script");
        script.src =
          "https://webapi.amap.com/maps?v=1.4.15&key=43e6e0dda5bfd63e76d87ad55f2c6ee5";
        script.async = true;
        script.onload = () => {
          createMap();
        };
        document.head.appendChild(script);
      } else {
        createMap();
      }
    };

    const createMap = () => {
      if (!mapContainerRef.current) return;

      // 创建地图实例
      const map = new window.AMap.Map(mapContainerRef.current, {
        resizeEnable: true,
        mapStyle: `amap://styles/whitesmoke`,
        center: [121.4737, 31.2304], // 上海坐标
        zoom: 10,
        zoomControl: false,
      });

      mapRef.current = map;
      setIsMapLoaded(true);

      // 添加公交线路数据
      addBusLines(map);

      // 移除地图点击事件，不再自动关闭用户卡片
      // map.on("click", () => {
      //   setSelectedUser(null);
      // });
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
      markersRef.current.clear();
      polylinesRef.current.clear();
    };
  }, []);

  // 添加用户标记到地图
  const addUserMarkers = useCallback((map: any, users: UserData[]) => {
    if (!map || !users.length) return;
    // 清除现有标记
    markersRef.current.forEach((marker) => {
      map.remove(marker);
    });
    markersRef.current.clear();
    users.forEach((user, index) => {
      // 使用工具函数生成 SVG 和 size
      const { svg, size } = createPersonIcon(
        user.parsedData.gender,
        user.parsedData.occupation
      );
      // 创建高德地图标记
      const marker = new window.AMap.Marker({
        position: [user.lng, user.lat],
        icon: new window.AMap.Icon({
          size: new window.AMap.Size(size, size),
          image: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
          imageSize: new window.AMap.Size(size, size),
        }),
        offset: new window.AMap.Pixel(-12, -12), // 调整图标位置
      });
      // 添加点击事件
      marker.on("click", () => {
        setSelectedUser(user);
      });
      map.add(marker);
      markersRef.current.set(`${user.lat}-${user.lng}-${index}`, marker);
    });
  }, []);

  // 添加公交线路到地图
  const addBusLines = useCallback(
    (map: any) => {
      if (!map || !buslineData || !initialBusName) return;
      const buslineDataTyped = buslineData as BusLineData;
      // 只查找传入的线路
      const targetFeature = buslineDataTyped.features.find(
        (feature) => feature.properties.BusName === initialBusName
      );
      if (!targetFeature) return;
      const geometry = targetFeature.geometry;
      const properties = targetFeature.properties;
      if (geometry.type === "MultiLineString" && "coordinates" in geometry) {
        const coordinates = geometry.coordinates as number[][][];
        coordinates.forEach((lineString) => {
          const path = lineString.map((coord: number[]) => [
            coord[0],
            coord[1],
          ]);
          const polyline = new window.AMap.Polyline({
            path: path,
            strokeColor: "#FF6B35", // 直接使用高亮颜色
            strokeWeight: 4,
            strokeOpacity: 1,
          });
          map.add(polyline);
          // 存储线路引用，使用Layer作为key
          if (!polylinesRef.current.has(properties.Layer)) {
            polylinesRef.current.set(properties.Layer, []);
          }
          polylinesRef.current.get(properties.Layer)!.push(polyline);
          polyline.on("click", () => {
            setHighlightedLineName(properties.Layer);
            setSelectedLineInfo(properties);
          });
          // 记录当前高亮的线路
          highlightedPolylinesRef.current.add(polyline);
        });
      }
    },
    [initialBusName]
  );

  // 优化后的高亮线路 useEffect
  useEffect(() => {
    if (!mapRef.current || !polylinesRef.current) return;

    // 先恢复之前高亮线路的样式
    highlightedPolylinesRef.current.forEach((polyline: any) => {
      polyline.setOptions({
        strokeColor: "#808080",
        strokeWeight: 2,
        strokeOpacity: 0.8,
      });
    });
    highlightedPolylinesRef.current.clear();

    // 只高亮新选中的线路
    if (highlightedLineName && polylinesRef.current.has(highlightedLineName)) {
      const polylines = polylinesRef.current.get(highlightedLineName);
      polylines.forEach((polyline: any) => {
        polyline.setOptions({
          strokeColor: "#FF6B35",
          strokeWeight: 4,
          strokeOpacity: 1,
        });
        // 记录当前高亮的线路
        highlightedPolylinesRef.current.add(polyline);
      });
    }
  }, [highlightedLineName]);

  // 当用户数据或地图加载状态改变时，更新标记
  useEffect(() => {
    if (mapRef.current && isMapLoaded && userData.length > 0) {
      addUserMarkers(mapRef.current, userData);
    }
  }, [userData, isMapLoaded, addUserMarkers]);

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
    description: `上海市进行了一项公交线路调整，${initialBusName}线路调整了，调整方案是${adjustmentPlan}，
    上海市对此次公交线路调整进行了问卷调查，受影响并填写问卷的用户有${userData.length}人，
    你十分了解此次公交线网调整方案以及调整结果，可以根据用户的问题，给出合理的回答`,
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

  useCopilotAction({
    name: "统计街道用户分布",
    description:
      "统计哪个街道受影响用户最多，哪个街道态度评分低的人最多。返回街道名称和数量。",
    parameters: [
      {
        name: "attitudeThreshold",
        type: "number",
        description: "态度评分低的阈值，默认3分",
        required: false,
      },
    ],
    handler: async ({
      attitudeThreshold = 3,
    }: {
      attitudeThreshold?: number;
    }) => {
      // 1. 加载街道geojson
      const res = await fetch("/gis/twon.geojson");
      const geojson = await res.json();
      // 2. 统计分布，传入 turf 的 booleanPointInPolygon
      (globalThis as any).booleanPointInPolygon = booleanPointInPolygon;
      return getTownStats(geojson, userData, attitudeThreshold);
    },
  });

  // 添加关闭选中用户的函数
  const handleCloseSelectedUser = useCallback(() => {
    setSelectedUser(null);
    setUserCardPosition({ x: 48, y: 96 }); // 重置位置
  }, []);

  // 添加关闭选中线路的函数
  const handleCloseSelectedLine = useCallback(() => {
    setSelectedLineInfo(null);
    setHighlightedLineName(null);
    setLineCardPosition({ x: 48, y: 96 }); // 重置位置
  }, []);

  // 处理用户卡片点击事件（阻止冒泡）
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // 可拖拽的用户卡片组件
  const DraggableUserCard = ({
    user,
    position,
    onPositionChange,
  }: {
    user: UserData;
    position: { x: number; y: number };
    onPositionChange: (position: { x: number; y: number }) => void;
  }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: "user-card",
    });

    const style = {
      transform: CSS.Translate.toString(transform),
      left: position.x,
      top: position.y,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="absolute z-10"
        onClick={handleCardClick}
      >
        <UserCard
          className="border-none overflow-y-auto cursor-pointer shadow-lg"
          selectedUser={user}
          onClose={handleCloseSelectedUser}
          dragAttributes={attributes}
          dragListeners={listeners}
          initialBusName={initialBusName}
          adjustmentPlan={adjustmentPlan}
        />
      </div>
    );
  };

  // 可拖拽的线路卡片组件
  const DraggableLineCard = ({
    lineInfo,
    position,
    onPositionChange,
  }: {
    lineInfo: any;
    position: { x: number; y: number };
    onPositionChange: (position: { x: number; y: number }) => void;
  }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: "line-card",
    });

    const style = {
      transform: CSS.Translate.toString(transform),
      left: position.x,
      top: position.y,
    };

    return (
      <div ref={setNodeRef} style={style} className="absolute z-10">
        <PlaceCard
          className="border-none overflow-y-auto cursor-pointer shadow-lg"
          selectedLineInfo={lineInfo}
          onClose={handleCloseSelectedLine}
          adjustmentChoice={adjustmentChoice}
          adjustmentPlan={adjustmentPlan}
          dragAttributes={attributes}
          dragListeners={listeners}
        />
      </div>
    );
  };

  // 处理拖拽结束事件
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;

    if (active.id === "user-card") {
      setUserCardPosition((prev) => ({
        x: prev.x + delta.x,
        y: prev.y + delta.y,
      }));
    } else if (active.id === "line-card") {
      setLineCardPosition((prev) => ({
        x: prev.x + delta.x,
        y: prev.y + delta.y,
      }));
    }
  };

  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || userData.length === 0) return;

    let polygons: any[] = [];

    fetch("/gis/twon.geojson")
      .then((res) => res.json())
      .then((geojson) => {
        // 清除旧的多边形
        if ((window as any).townPolygons) {
          (window as any).townPolygons.forEach((polygon: any) =>
            mapRef.current.remove(polygon)
          );
        }
        (window as any).townPolygons = [];

        geojson.features.forEach((feature: any) => {
          // 统计该乡镇内的用户数量
          const count = userData.filter((user) => {
            const pt = {
              type: "Point" as const,
              coordinates: [user.lng, user.lat],
            };
            return booleanPointInPolygon(pt, feature);
          }).length;

          // 根据数量设置颜色
          let fillColor = "#e0e0e0";
          if (count > 20) fillColor = "#ff5722";
          else if (count > 10) fillColor = "#ff9800";
          else if (count > 0) fillColor = "#ffc107";

          // 处理 MultiPolygon
          const polygonsCoords = feature.geometry.coordinates;
          polygonsCoords.forEach((polygonCoords: any) => {
            // polygonCoords 是一个二维数组
            const path = polygonCoords[0].map((c: number[]) => [c[0], c[1]]);
            const polygon = new window.AMap.Polygon({
              path,
              strokeColor: "#333",
              strokeWeight: 1,
              fillColor,
              fillOpacity: 0.5,
              zIndex: 1,
            });
            mapRef.current.add(polygon);
            polygons.push(polygon);

            // 鼠标悬停显示乡镇名和用户数
            polygon.on("mouseover", (e: any) => {
              const infoWindow = new window.AMap.InfoWindow({
                content: `${feature.properties.Name}<br/>受影响用户数：${count}`,
                offset: new window.AMap.Pixel(0, -30),
                closeWhenClickMap: true,
              });
              infoWindow.open(mapRef.current, e.lnglat);
              polygon._infoWindow = infoWindow;
            });
            polygon.on("mouseout", () => {
              if (polygon._infoWindow) {
                polygon._infoWindow.close();
              }
            });
          });
        });

        (window as any).townPolygons = polygons;
      });
  }, [isMapLoaded, userData]);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="relative">
        <div
          className="absolute top-6 left-12 z-10 cursor-pointer flex items-center gap-2 flex-row bg-white rounded-md p-2 shadow-md"
          onClick={() => router.back()}
        >
          <ArrowLeftIcon className="w-4 h-4" />
          返回
        </div>
        {selectedUser && (
          <DraggableUserCard
            user={selectedUser}
            position={userCardPosition}
            onPositionChange={setUserCardPosition}
          />
        )}
        {selectedLineInfo && (
          <DraggableLineCard
            lineInfo={selectedLineInfo}
            position={lineCardPosition}
            onPositionChange={setLineCardPosition}
          />
        )}

        {/* 高德地图容器 */}
        <div
          ref={mapContainerRef}
          className={cn("w-screen h-screen", className)}
          style={{ zIndex: 0 }}
        />
      </div>
    </DndContext>
  );
}
