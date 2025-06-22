"use client";

import dynamic from "next/dynamic";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { MapProvider } from "@/lib/hooks/use-map";

let MapCanvas: any;
MapCanvas = dynamic(
  () =>
    import("@/components/bus-map-canvas").then((module: any) => module.MapCanvas),
  {
    ssr: false,
  }
);

export default function Home() {
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      transcribeAudioUrl="/api/transcribe"
      textToSpeechUrl="/api/tts"
    >
      {/* <McpServerManager /> */}
      <CopilotSidebar
        defaultOpen={false}
        clickOutsideToClose={false}
        labels={{
          title: "🚌 城市公交线网评估平台",
          initial:
            "欢迎使用大模型智能体驱动的城市公交线网评估平台，你可以通过文字输入进行公交线网查询与分析",
        }}
        icons={{
          openIcon: "🚌",
        }}
      >
        <TooltipProvider>
          <MapProvider>
            <main className="h-screen w-screen">
              <MapCanvas />
            </main>
          </MapProvider>
        </TooltipProvider>
      </CopilotSidebar>
    </CopilotKit>
  );
}
