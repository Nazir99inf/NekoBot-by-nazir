const fs = require('node:fs');

const config = {
    owner: ["6285822146627"],
    name: "- nekoBot - by nazir Simple WhatsApp bo",
    sessions: "nazir-sessi",
    sticker: {
      packname: "Made by ",
      author: "nekoBot x nazir simple"
    },
   messages: {
      wait: "*( Loading )* Tunggu Sebentar...",
      owner: "*( Denied )* Kamu bukan owner ku !",
      premium: "*( Denied )* Fitur ini khusus user premium",
      group: "*( Denied )* Fitur ini khusus group",
   },
   database: "db-nazir",
   tz: "Asia/Makassar"
}

module.exports = config

let file = require.resolve(__filename);
fs.watchFile(file, () => {
   fs.unwatchFile(file);
  delete require.cache[file];
});
