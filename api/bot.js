const { Telegraf } = require('telegraf');

     const bot = new Telegraf(process.env.BOT_TOKEN);

     bot.command('start', (ctx) => {
         ctx.reply('Welcome to Space Energy Collector!', {
             reply_markup: {
                 inline_keyboard: [
                     [{ text: 'Play Space Energy Collector', callback_game: { game_short_name: '@Game_Cosmic_kollector_Energy_bot' } }]
                 ]
             }
         });
     });

     bot.on('callback_query', (ctx) => {
         if (ctx.callbackQuery.game_short_name === '@Game_Cosmic_kollector_Energy_bot') {
             ctx.answerCallbackQuery({
                 url: 'https://space-energy-collector-dlvyt5sbe-anastasia-chizhovas-projects.vercel.app' // Замени на твой Vercel URL
             });
         }
     });

     module.exports = async (req, res) => {
         try {
             await bot.handleUpdate(req.body);
             res.status(200).end();
         } catch (error) {
             console.error(error);
             res.status(500).end();
         }
     };
