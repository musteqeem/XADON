// XADON V8 · antiset — bulk-set every mode guard at once (on|warn|kick|off).
const { savePolicy } = require('../../message-handler');
const GUARDS = ['antilink', 'antibadword', 'antibot', 'antiug', 'antitag', 'antispam', 'antiflood', 'antiforward', 'antivv', 'antisticker', 'antiaudio', 'antiimage', 'antivideo', 'antidoc', 'anticontact', 'antipoll', 'antiforeign', 'antistatus', 'antimention', 'antiinvite', 'anticall', 'antichannel', 'antievent', 'antigif', 'antihidetag', 'antilocation', 'antinight', 'antipin', 'antireact', 'antishare', 'antigroupstatus', 'antistatusreply', 'antiphone', 'antiemail', 'antiemoji', 'antibug', 'antishort', 'antiduplicate', 'anticaps', 'antijoin', 'anticode', 'antifont', 'antiadmin', 'antibroadcast', 'anticloud', 'antiapk', 'antinsfw', 'antisurvey', 'antiwall', 'antibet'];
module.exports = {
  name: 'antiset', alias: ['antisall', 'bulkanti'], desc: 'Set ALL anti guards at once', usage: '.antiset on | .antiset warn | .antiset kick | .antiset off', group: true, admin: true, category: 'group',
  async run({ sock, m, args, reply, ui }) {
    const a = String(args[0] || '').toLowerCase();
    let val;
    if (/^(on|enable|yes|1|delete)$/.test(a)) val = true;
    else if (/^(off|disable|no|0)$/.test(a)) val = false;
    else if (/^warn/.test(a)) val = 'warn';
    else if (/^(kick|remove|ban)$/.test(a)) val = 'kick';
    else return reply(ui.notice('info', 'Anti set', 'Usage: .antiset on | warn | kick | off'));
    const meta = await sock.groupMetadata(m.chat).catch(() => null);
    const next = { groupName: meta?.subject || 'the group' };
    for (const g of GUARDS) next[g] = val;
    savePolicy(m.chat, next);
    const label = val === 'warn' ? 'WARN' : val === 'kick' ? 'KICK' : val ? 'ON' : 'OFF';
    return reply(ui.notice(val ? 'success' : 'warn', `All guards → ${label}`, `${GUARDS.length} guards updated at once.\nReview: .antilist`));
  },
};
