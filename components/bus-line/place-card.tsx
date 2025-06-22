import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin, Info } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PlaceCardProps = {
  selectedLineInfo: any;
  className?: string;
  number?: number;
  actions?: ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export function PlaceCard({
  selectedLineInfo,
  actions,
  onMouseEnter,
  onMouseLeave,
  className,
  number,
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
                {selectedLineInfo.BusName}
              </CardTitle>
            </div>
            {actions}
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
        </div>
      </CardContent>
    </Card>
  );
}
