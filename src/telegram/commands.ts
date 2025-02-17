// commands.ts
import { sendMenu, sendMessage, sendMainButton, checkSubscription, getBotName } from "./api";
import { BotEnv } from "../env";
import menuItemsData from './menuItems.json';

// Формируем объект callbackTexts для быстрого доступа к текстам
const callbackTexts = menuItemsData.menuItems.reduce(
  (acc: { [key: string]: { response_text: string; parse_mode?: "Markdown" | "HTML" | null } }, item) => {
    //@ts-ignore
    acc[item.callback_data] = { response_text: item.response_text, parse_mode: item.parse_mode || null };
    return acc;
  },
  {}
);

// Формируем меню из данных JSON
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

// Обработчик сообщения от пользователя
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

        // Проверка подписки
        const isSubscribed = await checkSubscription(chatId, BOT_TOKEN, CHANNEL_CHAT_ID);
        if (!isSubscribed) {
            await sendMessage(
                chatId,
                `❌ Для использования бота подпишитесь на канал: ${LINK_SUBSCRIBED_CHANNEL}\n\nВаш бот: ${botName}`,
                BOT_TOKEN
            );
            // При старте показываем кнопку 'Обновить'
            const buttons = [
                [{ text: '🔄 Обновить', callback_data: 'update' }],
            ];

            await sendMenu(chatId, buttons, BOT_TOKEN);
            return new Response("User not subscribed");
        }

        // Обработка нажатий кнопок
        if (callbackData === 'main_menu') {
            // Показываем меню с кнопками из JSON
            await sendMenu(chatId, menuContent, BOT_TOKEN);
        } else if (callbackTexts[callbackData]) {
            // Если это команда из JSON
            const { response_text, parse_mode } = callbackTexts[callbackData];
            //@ts-ignore
            await sendMessage(chatId, response_text, BOT_TOKEN, parse_mode || null); // Используем parse_mode из JSON
            // После отправки текста показываем кнопку 'Главное меню'
            await sendMainButton(chatId, BOT_TOKEN);
        } else if (callbackData === 'help') {
            await sendMessage(chatId, "Помощь:\n/start - начать\n/help - помощь", BOT_TOKEN);
            await sendMainButton(chatId, BOT_TOKEN);
        } else if (callbackData === 'update') {
            await sendMessage(chatId, 'Данные обновлены!', BOT_TOKEN);
            await sendMainButton(chatId, BOT_TOKEN);
        } else {
            await sendMessage(chatId, 'Неизвестная команда.', BOT_TOKEN);
            await sendMainButton(chatId, BOT_TOKEN);
        }
    } else if (message) {
        const chatId = message.chat.id;

        if (message.text === '/start') {
            // Проверка подписки при старте
            const isSubscribed = await checkSubscription(chatId, BOT_TOKEN, CHANNEL_CHAT_ID);

            // console.log("Sending start message...");
            // console.log("Message content:", `Привет! Я бот 👉 ${botName}...`);

    await sendMessage(
        chatId,
        `Привет! Я бот 👉 ${formattedBotName}.  
        *💼 Есть бизнес — сократите расходы!*  
        *🛠️ Нет бизнеса — начните без расходов!*  
               
        🎯 Решения для вашего бизнеса, которые помогут экономить и зарабатывать:  
        ✅ **Станьте партнёром программы "Свой в бизнесе | PRIVACY развитие идей и дела".** 💸  
        💡 **Запустите сайт на CMS, готовый к рекламе (возможно бесплатно).**  
        🔹 **Принимайте платежи без абонентской платы через Telegram и сайт:**  
        ☁️ Облачная касса от 1.5% за платеж. 
            📜 Всё по 54-ФЗ. 
            🏦 Без кассового аппарата на старте.  
        🔹 **Облачная 1С без абонентской оплаты.**  
        🔹 **Комплексные решения:** сайт + 1С + реклама от **5000 рублей** в месяц.  
        🔹 **Возврат до 20 000 рублей на рекламу через Яндекс.Директ!**  
        🔹 ✨ **И многое другое...**

        💬 Хотите — берите, хотите — нет. Вы можете получить **500 рублей** за простое действие, а мы получим **1000 рублей** — это просто бонус.  
        ⎯⎯⎯⎯⎯⎯⎯⎯⎯  
        *Начните ваш бизнес — создавайте товары и услуги.* Реклама и продажи понадобятся вашему бизнесу. Сделайте первый шаг, и заработок станет результатом вашего развития. 😉`,
        BOT_TOKEN, "Markdown"
    ); 
         

            if (!isSubscribed) {
                await sendMessage(
                    chatId,
                    `❌ Для использования бота подпишитесь на канал: ${LINK_SUBSCRIBED_CHANNEL}`,
                    BOT_TOKEN
                );
                // При старте показываем кнопку 'Обновить'
                const buttons = [
                    [{ text: '🔄 Обновить', callback_data: 'update' }],
                ];

                await sendMenu(chatId, buttons, BOT_TOKEN);
                
                return new Response('User not subscribed');
            }

            // При успешной подписке показываем только кнопку 'Главное меню'
            await sendMainButton(chatId, BOT_TOKEN);
        } else if (message.text === '/help') {
            // Обработка команды /help
            await sendMessage(chatId, "Помощь:\n/start - начать\n/help - помощь", BOT_TOKEN);
            await sendMainButton(chatId, BOT_TOKEN);
        } else {
            // Обработка команды /help
            await sendMessage(chatId, "❓ Неизвестная команда. Помощь:\n/start - начать\n/help - помощь", BOT_TOKEN);
           
        }
    }

    return new Response('OK');
};
