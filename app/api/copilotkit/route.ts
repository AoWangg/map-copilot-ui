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

const runtime = new CopilotRuntime();

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
