import { handleTelegramMessage } from "./telegram/commands";
import { getEnv } from "./env";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "POST") {
      try {
        const body: any = await request.json();      
        return await handleTelegramMessage(body, getEnv(env));
      } catch (err) {
        console.error("Ошибка обработки запроса:", err);
        return new Response("Ошибка сервера", { status: 500 });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
};

