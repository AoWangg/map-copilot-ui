import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin, Info, X, GripVertical } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { DraggableAttributes } from "@dnd-kit/core";

type PlaceCardProps = {
  selectedLineInfo: any;
  className?: string;
  number?: number;
  actions?: ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClose?: () => void;
  adjustmentChoice?: string | null;
  adjustmentPlan?: string | null;
  dragAttributes?: DraggableAttributes;
  dragListeners?: Record<string, Function>;
};

export function PlaceCard({
  selectedLineInfo,
  actions,
  onMouseEnter,
  onMouseLeave,
  className,
  number,
  onClose,
  adjustmentChoice,
  adjustmentPlan,
  dragAttributes,
  dragListeners,
}: PlaceCardProps) {
  return (
    <Card
      className={cn(
        "hover:shadow-md transition-shadow duration-200",
        className
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <div
                  className="w-4 h-4 text-gray-400 cursor-move flex items-center justify-center"
                  {...dragAttributes}
                  {...dragListeners}
                >
                  <GripVertical className="w-4 h-4" />
                </div>
                {selectedLineInfo.BusName}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {actions}
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="关闭"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{selectedLineInfo.BusName}</span>
            </div>
            <p>方向: {selectedLineInfo.Dir_Name}</p>
            <p>起点: {selectedLineInfo.S_Station}</p>
            <p>终点: {selectedLineInfo.E_Station}</p>
            <p>长度: {selectedLineInfo.length} 米</p>
          </div>

          {/* 调整信息显示 */}
          {adjustmentChoice && (
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-blue-700">调整信息</span>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>调整选择：</strong> {adjustmentChoice}
                </p>
                {adjustmentChoice === "是" && adjustmentPlan && (
                  <div>
                    <p>
                      <strong>调整方案：</strong>
                    </p>
                    <p className="text-muted-foreground mt-1 bg-gray-50 p-2 rounded">
                      {adjustmentPlan}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
