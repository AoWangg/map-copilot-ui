import { useEffect, useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { PlaceCard } from "@/components/bus-line/place-card";
import { LineAdjustmentSelector } from "@/components/bus-line/line-adjustment-selector";
import type { GeoJsonObject } from "geojson";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { useChatContext } from "@copilotkit/react-ui";
import buslineData from "@/data/busline.json";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { DndContext, useDraggable, DragEndEvent } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export type MapCanvasProps = {
  className?: string;
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

export function MapCanvas({ className }: MapCanvasProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const polylinesRef = useRef<Map<string, any>>(new Map()); // 存储所有线路的引用
  const { setOpen } = useChatContext();
  const [highlightedLineName, setHighlightedLineName] = useState<
    string | null
  >();
  const [selectedLineInfo, setSelectedLineInfo] = useState(null);
  const router = useRouter();

  // 添加卡片位置状态
  const [lineCardPosition, setLineCardPosition] = useState({ x: 48, y: 96 }); // top-24 left-12 对应的像素值

  // 添加一个 ref 来跟踪当前高亮的线路
  const highlightedPolylinesRef = useRef<Set<any>>(new Set());

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

      // 添加公交线路数据
      addBusLines(map);
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
      polylinesRef.current.clear();
    };
  }, []);

  // 添加公交线路到地图
  const addBusLines = useCallback((map: any) => {
    if (!map || !buslineData) return;

    // 1. 先加载区多边形
    fetch("/gis/qu.geojson")
      .then((res) => res.json())
      .then((geojson) => {
        geojson.features.forEach((feature: any) => {
          if (feature.geometry.type === "MultiPolygon") {
            feature.geometry.coordinates.forEach((polygon: any) => {
              const path = polygon[0].map(([lng, lat]: [number, number]) => [
                lng,
                lat,
              ]);
              const districtPolygon = new window.AMap.Polygon({
                path,
                strokeColor: "#0052D9",
                strokeWeight: 2,
                fillColor: "#79bbff",
                fillOpacity: 0.2,
              });
              mapRef.current.add(districtPolygon);
            });
          }
        });
      });

    // 2. 再添加公交线路
    const buslineDataTyped = buslineData as BusLineData;
    buslineDataTyped.features.forEach((feature) => {
      const geometry = feature.geometry;
      const properties = feature.properties;

      if (geometry.type === "MultiLineString" && "coordinates" in geometry) {
        const coordinates = geometry.coordinates as number[][][];

        coordinates.forEach((lineString) => {
          const path = lineString.map((coord: number[]) => [
            coord[0],
            coord[1],
          ]);

          const polyline = new window.AMap.Polyline({
            path: path,
            strokeColor: "#808080",
            strokeWeight: 2,
            strokeOpacity: 0.8,
          });

          // 添加点击事件
          polyline.on("click", () => {
            setHighlightedLineName(properties.Layer);
            setSelectedLineInfo(properties);
            setLineCardPosition({ x: 48, y: 96 }); // 重置位置到初始状态
          });

          map.add(polyline);

          // 存储线路引用，使用Layer作为key
          if (!polylinesRef.current.has(properties.Layer)) {
            polylinesRef.current.set(properties.Layer, []);
          }
          polylinesRef.current.get(properties.Layer)!.push(polyline);
        });
      }
    });
  }, []);

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

  useCopilotAction({
    name: "查询线路",
    description: "根据用户的问题查询线路",
    parameters: [
      {
        name: "busName",
        type: "string",
        description: "线路的名称",
        required: true,
      },
    ],
    handler: async ({ busName }) => {
      const line = (buslineData as BusLineData).features.find(
        (feature) => feature.properties.BusName === busName
      );
      if (line) {
        setHighlightedLineName(line.properties.Layer);
        setSelectedLineInfo(line.properties);
        setLineCardPosition({ x: 48, y: 96 }); // 重置位置
      }
    },
  });

  useCopilotAction({
    name: "调整线路",
    description: "引导用户选择是否要调整线路",
    parameters: [
      {
        name: "busName",
        type: "string",
        description: "线路的名称，比如101路",
        required: true,
      },
    ],
    handler: async ({ busName }) => {
      const line = (buslineData as BusLineData).features.find(
        (feature) => feature.properties.BusName === busName
      );
      if (line) {
        setHighlightedLineName(line.properties.Layer);
        setSelectedLineInfo(line.properties);
        setLineCardPosition({ x: 48, y: 96 }); // 重置位置
      }
    },
    render: ({ status, args }) => {
      const { busName } = args;

      if (status === "inProgress") {
        return <div>正在调整线路 {busName}...</div>;
      } else {
        return (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                已成功选择线路：{busName}
              </p>
            </div>

            {/* 线路调整选择组件 */}
            <LineAdjustmentSelector busName={busName} />
          </div>
        );
      }
    },
  });

  useCopilotReadable({
    description: "这是用户当前选择的线路的信息，你要根据此信息来回答用户的问题",
    value: selectedLineInfo,
  });

  // 添加关闭选中线路的函数
  const handleCloseSelectedLine = useCallback(() => {
    setSelectedLineInfo(null);
    setHighlightedLineName(null);
    setLineCardPosition({ x: 48, y: 96 }); // 重置位置
  }, []);

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
          dragAttributes={attributes}
          dragListeners={listeners}
        />
      </div>
    );
  };

  // 处理拖拽结束事件
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;

    if (active.id === "line-card") {
      setLineCardPosition((prev) => ({
        x: prev.x + delta.x,
        y: prev.y + delta.y,
      }));
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="relative">
        {/* 返回按钮 - 移到主组件级别 */}
        <div
          className="absolute top-6 left-12 z-20 cursor-pointer flex items-center gap-2 flex-row bg-white rounded-md p-2 shadow-md"
          onClick={() => router.back()}
        >
          <ArrowLeftIcon className="w-4 h-4" />
          返回
        </div>

        {selectedLineInfo && (
          <DraggableLineCard
            lineInfo={selectedLineInfo}
            position={lineCardPosition}
            onPositionChange={(position) => setLineCardPosition(position)}
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
