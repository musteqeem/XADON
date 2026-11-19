module.exports = {
    name: 'mylink',
    alias: ['chatlink', 'clink'],
    desc: 'Get your direct WhatsApp chat link',
    category: 'tools',

    execute: async (sock, m, { reply }) => {
        try {
            // Only allow in private chat
            if (m.isGroup) {
                return reply('ಠ_ಠ _*Use this command in private chat*_');
            }

            // Get sender number
            const number = (m.sender || '').split('@')[0];

            if (!number) {
                return reply('_*㉨⁠ Unable to fetch your number*_');
            }

            // Generate link
            const link = `https://wa.me/${number}`;

            return reply(`╭─❍ *YOUR DM LINK*\n│\n│ 彡 ${link}\n│\n│ ಥ⁠‿⁠ಥ _*Share this link so anyone can chat you directly*_.\n╰──────────────────`);
        } catch (e) {
            return reply('_*ಠ_ಠ Error generating link*_');
        }
    }
};
