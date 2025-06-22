import { useState } from "react";
import { useRouter } from "next/navigation";
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

type LineAdjustmentSelectorProps = {
  busName: string;
};

export function LineAdjustmentSelector({
  busName,
}: LineAdjustmentSelectorProps) {
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
    <div className="space-y-4 relative">
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

      {/* 调整方案输入框 */}
      {showAdjustmentInput && !adjustmentSubmitted && (
        <AdjustmentPlanInput
          adjustmentPlan={adjustmentPlan}
          setAdjustmentPlan={setAdjustmentPlan}
          onSubmit={handleAdjustmentSubmit}
          onCancel={resetAdjustment}
        />
      )}

      {/* 调整结果 */}
      {adjustmentSubmitted && (
        <AdjustmentResult
          busName={busName}
          adjustmentChoice={adjustmentChoice}
          adjustmentPlan={adjustmentPlan}
          isLoading={isLoading}
          onReset={resetAdjustment}
          onEvaluationClick={handleEvaluationClick}
        />
      )}
    </div>
  );
}

type AdjustmentPlanInputProps = {
  adjustmentPlan: string;
  setAdjustmentPlan: (plan: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export function AdjustmentPlanInput({
  adjustmentPlan,
  setAdjustmentPlan,
  onSubmit,
  onCancel,
}: AdjustmentPlanInputProps) {
  return (
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
          <Button onClick={onSubmit} disabled={!adjustmentPlan.trim()}>
            确定
          </Button>
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

type AdjustmentResultProps = {
  busName: string;
  adjustmentChoice: string;
  adjustmentPlan: string;
  isLoading: boolean;
  onReset: () => void;
  onEvaluationClick: () => void;
};

export function AdjustmentResult({
  busName,
  adjustmentChoice,
  adjustmentPlan,
  isLoading,
  onReset,
  onEvaluationClick,
}: AdjustmentResultProps) {
  return (
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
          <Button variant="outline" onClick={onReset} disabled={isLoading}>
            重新调整
          </Button>
          <Button
            onClick={onEvaluationClick}
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
  );
}
