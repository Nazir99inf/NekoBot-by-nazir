const axios = require("axios");

module.exports = {
    command: "script",
    alias: ["sc", "scbot"],
    category: ["info"],
    description: "Dapatkan Script bot secara gratis",
    async run(m, { sock, Func }) {
       let data = await axios.get('https://api.github.com/repos/AxellNetwork/NekoBot').then(a => a.data);
        let cap = "*– 乂 informasi - Script*\n"
           cap += `> *- Nama :* ${data.name}\n`
           cap += `> *- Pemilik :* ${data.owner.login}\n`
           cap += `> *- Star :* ${data.stargazers_count}\n`
           cap += `> *- Forks :* ${data.forks}\n`
           cap += `> *- Dibuat sejak :* ${Func.ago(data.created_at)}\n`
           cap += `> *- Terakhir update :* ${Func.ago(data.updated_at)}\n`
           cap += `> *- Terakhir publish :* ${Func.ago(data.pushed_at)}\n`
          cap += `> *- Link :*https://github.com/Nazir99inf/NekoBot-by-nazir*\n`
          cap += "\n\n*– ✅ Support Multi type ( Case & Plugins )*\n"
          cap += "*– ✅ Support Pairing code*\n"
          cap += "*– ✅ Script file under 100kb*\n"
          cap += "*– ✅  Auto Reload File scrape*"
          cap += "\n\n*- Note :* ini hanya base dari script bot kami, oleh karena kami membebaskan pengguna agar dapat recode ulang script ini secara gratis ( tanpa menghilangkan sumber dari script ini )\n\n*– Forum Update :*\nhttps://whatsapp.com/channel/0029VauJgduEwEjwwVwLnw37"

      m.reply(cap);
    }
}
