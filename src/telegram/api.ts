//api.ts

export const sendMessage = async (
  chatId: number,
  text: string,
  BOT_TOKEN: string,
  parseMode: "Markdown" | "HTML" | false = false
): Promise<void> => {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const payload = {
      chat_id: chatId,
      text,
      parse_mode: parseMode ? parseMode : undefined, 
  };

  try {
      await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
      });
  } catch (error) {
      console.error("Error sending message:", error);
  }
};

export const sendMainButton = async (
    chatId: number,
    BOT_TOKEN: string
  ): Promise<void> => {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const payload = {
      chat_id: chatId,
      text: "📜 Main Menu",
      reply_markup: {
        inline_keyboard: [[
          { text: 'Get $190 ', callback_data: "get_card"},
          { text: "☰", callback_data: "main_menu" }
        ]],
      },
    };
  
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Error sending main button:", error);
    }
  };

export const sendMenu = async (
  chatId: number,
  menuContent: any[],
  BOT_TOKEN: string
): Promise<void> => {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: "Choose an action:",
    reply_markup: {
      inline_keyboard: menuContent,
    },
  };

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Error sending menu:", error);
  }
};

export async function checkSubscription(userId: number, BOT_TOKEN: string, CHANNEL_CHAT_ID: string): Promise<boolean> {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${CHANNEL_CHAT_ID}&user_id=${userId}`;

  try {
    const response = await fetch(url);
    const data: any = await response.json();

    if (data.ok && data.result?.status === "member") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

export const getBotName = async (botToken: string): Promise<string> => {
  const url = `https://api.telegram.org/bot${botToken}/getMe`;
  
  try {
    const response = await fetch(url);
    const data:any  = await response.json();
    
    if (data.ok && data.result) {
      return data.result.first_name || 'Bot';
    } else {
      console.error('Error getting bot name:', data.description);
      return 'Bot';
    }
  } catch (error) {
    console.error('Error querying Telegram API:', error);
    return 'Bot';
  }
};
