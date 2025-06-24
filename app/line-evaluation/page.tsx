"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { MapProvider } from "@/lib/hooks/use-map";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth0 } from "@auth0/auth0-react";
// import McpServerManager from "@/components/McpServerManager";

let MapCanvas: any;
MapCanvas = dynamic(
  () =>
    import("@/components/map-canvas").then((module: any) => module.MapCanvas),
  {
    ssr: false,
  }
);

// 提取使用 useSearchParams 的组件
function LineEvaluationContent() {
  const searchParams = useSearchParams();
  const busName = searchParams.get("busName");
  const adjustmentChoice = searchParams.get("adjustmentChoice");
  const adjustmentPlan = searchParams.get("adjustmentPlan");

  return (
    <main className="h-screen w-screen">
      <MapCanvas
        initialBusName={busName}
        adjustmentChoice={adjustmentChoice}
        adjustmentPlan={adjustmentPlan}
      />
    </main>
  );
}

export default function Home() {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        正在跳转到登录...
      </div>
    );
  }

  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      transcribeAudioUrl="/api/transcribe"
      textToSpeechUrl="/api/tts"
    >
      {/* <McpServerManager /> */}
      <CopilotSidebar
        defaultOpen={true}
        clickOutsideToClose={false}
        labels={{
          title: "🧑‍⚕️ 城市公交线网评估结果分析平台",
          initial:
            "欢迎使用大模型智能体驱动的城市公交线网评估结果分析平台，你可以通过文字输入进行公交线网评估结果查询与分析",
        }}
        icons={{
          openIcon: "🚌",
        }}
        ResponseButton={({ onClick }) => (
          <Button onClick={onClick}>重新生成回答</Button>
        )}
      >
        <TooltipProvider>
          <MapProvider>
            <Suspense
              fallback={
                <div className="h-screen w-screen flex items-center justify-center">
                  加载中...
                </div>
              }
            >
              <LineEvaluationContent />
            </Suspense>
          </MapProvider>
        </TooltipProvider>
      </CopilotSidebar>
    </CopilotKit>
  );
}
