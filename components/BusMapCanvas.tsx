import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { useEffect, useState, useRef, useCallback } from "react";
import { Map, divIcon } from "leaflet";
import { cn } from "@/lib/utils";
import { PlaceCard } from "@/components/PlaceCard";
import type { GeoJsonObject } from "geojson";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { useChatContext } from "@copilotkit/react-ui";
import buslineData from "@/data/busline.json";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

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

export function MapCanvas({ className }: MapCanvasProps) {
  const [map, setMap] = useState<Map | null>(null);
  const { setOpen } = useChatContext();
  const isDesktop = useMediaQuery("(min-width: 900px)");
  const prevIsDesktop = useRef(isDesktop);
  const [highlightedLineName, setHighlightedLineName] = useState<
    string | null
  >();
  const [selectedLineInfo, setSelectedLineInfo] = useState(null);

  const onLineClick = useCallback(
    (event) => {
      const lineId = event.target.feature.properties.Layer;
      setHighlightedLineName(lineId);
      setSelectedLineInfo(event.target.feature.properties);
    },
    [map]
  );

  const geoJsonStyle = (feature) => {
    const isHighlighted = feature.properties.Layer === highlightedLineName;
    return {
      color: isHighlighted ? "red" : "blue",
      weight: isHighlighted ? 10 : 2,
      opacity: isHighlighted ? 1 : 0.5,
    };
  };

  useEffect(() => {
    if (prevIsDesktop.current !== isDesktop) {
      setOpen(isDesktop);
    }
    prevIsDesktop.current = isDesktop;
  }, [isDesktop, setOpen]);

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

  // 线路调整选择组件
  function LineAdjustmentSelector({ busName }: { busName: string }) {
    const [adjustmentChoice, setAdjustmentChoice] = useState<string>("");
    const [showAdjustmentInput, setShowAdjustmentInput] = useState(false);
    const [adjustmentPlan, setAdjustmentPlan] = useState("");
    const [adjustmentSubmitted, setAdjustmentSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleAdjustmentChoice = (choice: string) => {
      setAdjustmentChoice(choice);
      if (choice === "是") {
        setShowAdjustmentInput(true);
      } else {
        setShowAdjustmentInput(false);
        setAdjustmentSubmitted(true);
      }
    };

    const handleAdjustmentSubmit = () => {
      if (adjustmentPlan.trim()) {
        setAdjustmentSubmitted(true);
        setShowAdjustmentInput(false);
      }
    };

    const resetAdjustment = () => {
      setAdjustmentChoice("");
      setShowAdjustmentInput(false);
      setAdjustmentPlan("");
      setAdjustmentSubmitted(false);
    };

    const handleEvaluationClick = () => {
      setIsLoading(true);
      // 3秒后跳转
      setTimeout(() => {
        router.push("line-evaluation");
      }, 3000);
    };

    return (
      <div className="space-y-4">
        {/* 调整选择框 */}
        {!adjustmentSubmitted && (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg">线路调整</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adjustment-choice">
                  是否需要对线路 {busName} 进行调整？
                </Label>
                <Select
                  value={adjustmentChoice}
                  onValueChange={handleAdjustmentChoice}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="是">是</SelectItem>
                    <SelectItem value="否">否</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 调整方案输入框 */}
        {showAdjustmentInput && !adjustmentSubmitted && (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg">调整方案</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adjustment-plan">请输入调整方案：</Label>
                <textarea
                  id="adjustment-plan"
                  value={adjustmentPlan}
                  onChange={(e) => setAdjustmentPlan(e.target.value)}
                  placeholder="请详细描述您的调整方案..."
                  className="w-full min-h-[100px] p-3 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAdjustmentSubmit}
                  disabled={!adjustmentPlan.trim()}
                >
                  确定
                </Button>
                <Button variant="outline" onClick={resetAdjustment}>
                  取消
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 调整结果 */}
        {adjustmentSubmitted && (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg">调整结果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>线路：</strong> {busName}
                </p>
                <p className="text-sm">
                  <strong>调整选择：</strong> {adjustmentChoice}
                </p>
                {adjustmentChoice === "是" && adjustmentPlan && (
                  <div>
                    <p className="text-sm font-medium">调整方案：</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {adjustmentPlan}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={resetAdjustment}
                  disabled={isLoading}
                >
                  重新调整
                </Button>
                <Button
                  onClick={handleEvaluationClick}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      正在跳转...
                    </>
                  ) : (
                    "前往评估页面"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  useCopilotReadable({
    description: "这是用户当前选择的线路的信息，你要根据此信息来回答用户的问题",
    value: selectedLineInfo,
  });

  return (
    <div className="relative">
      {selectedLineInfo && (
        <div className="absolute top-12 left-12 z-10">
          <PlaceCard
            className="border-none overflow-y-auto shadow-none cursor-pointer hover:shadow-lg"
            selectedLineInfo={selectedLineInfo}
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
        <GeoJSON
          data={buslineData as any}
          style={geoJsonStyle}
          onEachFeature={(feature, layer) => {
            layer.on({
              click: onLineClick,
            });
          }}
        />
      </MapContainer>
    </div>
  );
}
