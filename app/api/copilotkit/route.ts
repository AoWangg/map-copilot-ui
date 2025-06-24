import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import OpenAI from "openai";
import { NextRequest } from "next/server";

const openai = new OpenAI({
  apiKey: "sk-94b8a8c203764fd5ba6be83ed52a4a4c",
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});
const serviceAdapter = new OpenAIAdapter({
  openai,
  model: "qwen-plus",
});

const AMAP_KEY = "ba4a49acc350b56513915a3b2b2d5b8f";

const runtime = new CopilotRuntime({
  actions: () => {
    return [
      {
        name: "planDrivingRoute",
        description: "使用高德地图API进行驾车路径规划，返回路线方案。",
        parameters: [
          {
            name: "origin",
            type: "string",
            description:
              "起点经纬度，格式为 '经度,纬度'，如 '116.481028,39.989643'",
            required: true,
          },
          {
            name: "destination",
            type: "string",
            description:
              "终点经纬度，格式为 '经度,纬度'，如 '114.465302,40.004717'",
            required: true,
          },
        ],
        handler: async ({
          origin,
          destination,
        }: {
          origin: string;
          destination: string;
        }) => {
          const url = `https://restapi.amap.com/v3/direction/driving?origin=${origin}&destination=${destination}&key=${AMAP_KEY}`;
          const res = await fetch(url);
          const data = await res.json();
          return data;
        },
      },
    ];
  },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
