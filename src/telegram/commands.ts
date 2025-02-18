// commands.ts
import { sendMenu, sendMessage, sendMainButton, checkSubscription, getBotName } from "./api";
import { BotEnv } from "../env";
import menuItemsData from './menuItems.json';

// Creating a callbackTexts object for quick access to texts
const callbackTexts = menuItemsData.menuItems.reduce(
  (acc: { [key: string]: { response_text: string; parse_mode?: "Markdown" | "HTML" | null } }, item) => {
    //@ts-ignore
    acc[item.callback_data] = { response_text: item.response_text, parse_mode: item.parse_mode || null };
    return acc;
  },
  {}
);

// Creating menu from JSON data
const menuContent = menuItemsData.menuItems.map(item => [{
    text: item.text,
    callback_data: item.callback_data
}]);

interface TelegramMessage {
    message?: {
        chat: { id: number };
        text: string;
        message_id: number;
        from: { id: number };
    };
    callback_query?: {
        data: string;
        from: { id: number };
    };
}

// User message handler
export const handleTelegramMessage = async (
    body: TelegramMessage,
    env: BotEnv
): Promise<Response> => {
    const BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
    const CHANNEL_CHAT_ID = env.CHANNEL_CHAT_ID;
    const LINK_SUBSCRIBED_CHANNEL = env.LINK_SUBSCRIBED_CHANNEL;
    const message = body.message;
    const callbackQuery = body.callback_query;

    let botName = "...";
    try {
        botName = await getBotName(BOT_TOKEN) || " ";
    } catch (error) {
        console.error("Error fetching bot name:", error);
    }
    const formattedBotName = botName.replace('_', '\\_');

    if (callbackQuery) {
        const chatId = callbackQuery.from.id;
        const callbackData = callbackQuery.data;

        // Subscription check
        const isSubscribed = await checkSubscription(chatId, BOT_TOKEN, CHANNEL_CHAT_ID);
        if (!isSubscribed) {
            await sendMessage(
                chatId,
                `❌ To use the bot, subscribe to the channel: ${LINK_SUBSCRIBED_CHANNEL}\n\nYour bot: ${botName}`,
                BOT_TOKEN
            );
            // Show 'Refresh' button at start
            const buttons = [
                [{ text: '🔄 Refresh', callback_data: 'update' }],
            ];

            await sendMenu(chatId, buttons, BOT_TOKEN);
            return new Response("User not subscribed");
        }

        // Handling button clicks
        if (callbackData === 'get_first_content') {
            // Show menu with buttons from JSON
            await sendMessage(
                chatId,
                `Hello! I am the bot 👉 ${formattedBotName}.  
                *💼 Have a business? Reduce costs!*  
                *🛠️ No business? Start without expenses!*  
                \n🎯 Solutions for your business to save and earn money:  
                ✅ **Become a partner of the "Your Business | PRIVACY Idea & Business Development" program.** 💸  
                💡 **Launch a CMS-based site ready for advertising (possibly for free).**  
                🔹 **Accept payments without a subscription fee via Telegram and website:**  
                ☁️ Cloud-based cashier from 1.5% per payment. 
                    📜 Fully compliant with regulations. 
                    🏦 No cash register required at the start.  
                🔹 **Cloud-based 1C without subscription fees.**  
                🔹 **Comprehensive solutions:** website + 1C + advertising from **5000 rubles** per month.  
                🔹 **Get up to 20,000 rubles cashback for advertising through Yandex.Direct!**  
                🔹 ✨ **And much more...**

                💬 Want it? Take it. Don't want it? No problem. You can get **500 rubles** for a simple action, and we get **1000 rubles** — just a bonus.  
                ⎯⎯⎯⎯⎯⎯⎯⎯⎯  
                *Start your business — create products and services.* Advertising and sales will be needed for your business. Take the first step, and earnings will follow your growth. 😉
                
                [🛒 Buy Now](https://storelikepinterest.pages.dev/init-payment/product-1/) — Click here to make a payment and start your business!`,
                BOT_TOKEN, "Markdown"
            ); 
        }
        if (callbackData === 'main_menu') {
            // Show menu with buttons from JSON
            await sendMenu(chatId, menuContent, BOT_TOKEN);
        } else if (callbackTexts[callbackData]) {
            // If it's a command from JSON
            const { response_text, parse_mode } = callbackTexts[callbackData];
            //@ts-ignore
            await sendMessage(chatId, response_text, BOT_TOKEN, parse_mode || null); // Use parse_mode from JSON
            // Show 'Main Menu' button after sending text
            await sendMainButton(chatId, BOT_TOKEN);
        } else if (callbackData === 'help') {
            await sendMessage(chatId, "Help:\n/start - start\n/help - help", BOT_TOKEN);
            await sendMainButton(chatId, BOT_TOKEN);
        } else if (callbackData === 'update') {
            await sendMessage(chatId, 'Data updated!', BOT_TOKEN);
            await sendMainButton(chatId, BOT_TOKEN);
        } else {
            await sendMessage(chatId, 'Unknown command.', BOT_TOKEN);
            await sendMainButton(chatId, BOT_TOKEN);
        }
    } else if (message) {
        const chatId = message.chat.id;

        if (message.text === '/start') {
            // Subscription check at start
            const isSubscribed = await checkSubscription(chatId, BOT_TOKEN, CHANNEL_CHAT_ID);

            await sendMessage(
                chatId,
                `Hello! I am the bot 👉 ${formattedBotName}.  
                *💼 Have a business? Reduce costs!*  
                *🛠️ No business? Start without expenses!*  
                \n🎯 Solutions for your business to save and earn money:  
                ✅ **Become a partner of the "Your Business | PRIVACY Idea & Business Development" program.** 💸  
                💡 **Launch a CMS-based site ready for advertising (possibly for free).**  
                🔹 **Accept payments without a subscription fee via Telegram and website:**  
                ☁️ Cloud-based cashier from 1.5% per payment. 
                    📜 Fully compliant with regulations. 
                    🏦 No cash register required at the start.  
                🔹 **Cloud-based 1C without subscription fees.**  
                🔹 **Comprehensive solutions:** website + 1C + advertising from **5000 rubles** per month.  
                🔹 **Get up to 20,000 rubles cashback for advertising through Yandex.Direct!**  
                🔹 ✨ **And much more...**

                💬 Want it? Take it. Don't want it? No problem. You can get **500 rubles** for a simple action, and we get **1000 rubles** — just a bonus.  
                ⎯⎯⎯⎯⎯⎯⎯⎯⎯  
                *Start your business — create products and services.* Advertising and sales will be needed for your business. Take the first step, and earnings will follow your growth. 😉`,
                BOT_TOKEN, "Markdown"
            ); 
            
            if (!isSubscribed) {
                await sendMessage(
                    chatId,
                    `❌ To use the bot, subscribe to the channel: ${LINK_SUBSCRIBED_CHANNEL}`,
                    BOT_TOKEN
                );
                // Show 'Refresh' button at start
                const buttons = [
                    [{ text: '🔄 Refresh', callback_data: 'update' }],
                ];

                await sendMenu(chatId, buttons, BOT_TOKEN);
                
                return new Response('User not subscribed');
            }

            // Show only 'Main Menu' button upon successful subscription
            await sendMainButton(chatId, BOT_TOKEN);
        } else if (message.text === '/help') {
            // Handling /help command
            await sendMessage(chatId, "Help:\n/start - start\n/help - help", BOT_TOKEN);
            await sendMainButton(chatId, BOT_TOKEN);
        } else {
            // Handling unknown commands
            await sendMessage(chatId, "❓ Unknown command. Help:\n/start - start\n/help - help", BOT_TOKEN);
        }
    }

    return new Response('OK');
};
