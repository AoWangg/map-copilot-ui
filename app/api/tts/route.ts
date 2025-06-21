import { OpenAI } from "openai";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: "sk-94b8a8c203764fd5ba6be83ed52a4a4c",
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const text = url.searchParams.get("text"); // 'text' is the query parameter name

  if (!text) {
    return new Response("Text parameter is missing", { status: 400 });
  }

  const response = await openai.audio.speech.create({
    voice: "alloy",
    input: text,
    model: "qwen-tts",
  });

  return response;
}
