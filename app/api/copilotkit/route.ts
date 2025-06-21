import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
  OpenAIAdapter,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import OpenAI from "openai";

const BASE_URL = "http://127.0.0.1:8000";

const openai = new OpenAI({
  apiKey: "sk-94b8a8c203764fd5ba6be83ed52a4a4c",
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

const serviceAdapter = new OpenAIAdapter({
  openai,
  model: "qwen-plus",
});

// const runtime = new CopilotRuntime({
//   remoteActions: [
//     {
//       url: `${BASE_URL}/copilotkit`,
//     },
//   ],
// });

const runtime = new CopilotRuntime({
  // ... existing configuration
  actions: ({ properties, url }) => {
    // Note that actions returns not an array, but an array **generator**.
    // You can use the input parameters to the actions generator to expose different backend actions to the Copilot at different times:
    // `url` is the current URL on the frontend application.
    // `properties` contains custom properties you can pass from the frontend application.

    return [
      {
        name: "fetchNameForUserId",
        description: "Fetches user name from the database for a given ID.",
        parameters: [
          {
            name: "userId",
            type: "string",
            description: "The ID of the user to fetch data for.",
            required: true,
          },
        ],
        handler: async ({ userId }: { userId: string }) => {
          // do something with the userId
          // return the user data
          return {
            name: "Darth Doe",
          };
        },
      },
    ];
  },
});

// ... rest of your route definition

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
