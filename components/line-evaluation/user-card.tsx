import { Card, CardTitle, CardContent } from "@/components/ui/card";
import {
  MapPin,
  User,
  Calendar,
  Building,
  Car,
  X,
  GripVertical,
} from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { UserData } from "@/lib/tools";
import type { DraggableAttributes } from "@dnd-kit/core";
import { UserChatDialog } from "./user-chat-dialog";

type UserCardProps = {
  selectedUser: UserData;
  className?: string;
  number?: number;
  actions?: ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClose?: () => void;
  dragAttributes?: DraggableAttributes;
  dragListeners?: Record<string, Function>;
  initialBusName?: string | null;
  adjustmentPlan?: string | null;
};

export function UserCard({
  selectedUser,
  actions,
  onMouseEnter,
  onMouseLeave,
  className,
  onClose,
  dragAttributes,
  dragListeners,
  initialBusName,
  adjustmentPlan,
}: UserCardProps) {
  const { parsedData } = selectedUser;

  // 获取出行方式
  const getTransportModes = () => {
    return selectedUser.parsedData.surveyData.background.commonTransportModes;
  };

  // 获取对公交调整的态度
  const getAttitude = () => {
    return selectedUser.parsedData.surveyData.openQuestions
      .evaluationOfAdjustment;
  };

  // 获取主要不便
  const getMainInconvenience = () => {
    return selectedUser.parsedData.surveyData.openQuestions.inconveniences;
  };

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-shadow duration-200 max-w-md",
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
                <User className="w-5 h-5" />
                用户信息
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <UserChatDialog
                user={selectedUser}
                initialBusName={initialBusName}
                adjustmentPlan={adjustmentPlan}
              />
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

          <div className="space-y-3 text-sm">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">年龄:</span>
                <span>{parsedData.age}岁</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">性别:</span>
                <span>{parsedData.gender}</span>
              </div>
            </div>

            {/* 职业信息 */}
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">职业:</span>
              <span>
                {parsedData.surveyData.background.occupation || "未提供"}
              </span>
            </div>

            {/* 地址信息 */}
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <span className="font-medium">地址:</span>
                <p className="text-xs text-muted-foreground mt-1">
                  {parsedData.completeAddress || "未提供"}
                </p>
              </div>
            </div>

            {/* 出行方式 */}
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">主要出行方式:</span>
              <span className="text-xs">{getTransportModes()}</span>
            </div>

            {/* 对公交调整的态度 */}
            <div className="border-t pt-3">
              <h4 className="font-medium text-sm mb-2">
                对公交线网调整的态度:
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {getAttitude()}
              </p>
            </div>

            {/* 主要不便 */}
            <div>
              <h4 className="font-medium text-sm mb-2">主要不便:</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {getMainInconvenience()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
