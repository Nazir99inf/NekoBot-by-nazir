const color = require('chalk');

module.exports = (m) => {
      let info = ""
         info += color.magenta.bold("Chat NekoBot-Nazir\n")
        info += color.yellow.bold(` - Dari : ${color.red.bold(m.isGroup ? "Group Chat" : "Private Chat")}\n`)
        if (m.isGroup) {
        info += color.yellow.bold(` - Pada : ${color.white.bold(m.metadata.subject)}\n`)
        info += color.yellow.bold(` - Tipe : ${color.cyan.bold(m.type)}\n`)
        info += color.yellow.bold(` - Pengirim : ${color.white.bold(m.pushName)}\n`)
       } else {
        info += color.white.bold(` - Nama : ${color.green.bold(m.pushName)}\n`)     
       }
       info += m.body.startsWith(m.body) ? color.green.bold(m.body) : color.white.bold(m.body)
    
       console.log(info)     
}
