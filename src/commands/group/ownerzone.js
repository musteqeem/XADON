// XADON V11 · PREMIUM — ownerzone: owner-only bunker mode.
// When ON, every non-owner message is deleted (commands still pass so
// admins can switch it back off). Owner circle = hard-owner/mod/sudo.
// Usage: .ownerzone on | .ownerzone off | .ownerzone status
const { savePolicy, groupPolicy } = require('../../message-handler');
module.exports = {
  name: 'ownerzone',
  alias: ['bunker', 'ownersonly'],
  desc: 'Owner-only bunker (delete all non-owner messages)',
  usage: '.ownerzone on | .ownerzone off | .ownerzone status',
  group: true, admin: true, botAdmin: true, category: 'group',
  async run({ m, args, reply, ui }) {
    const cur = !!groupPolicy(m.chat).ownerzone;
    const a = String(args[0] || '').toLowerCase();
    if (!a || a === 'status' || a === 'info') {
      return reply(ui.card({
        icon: '⛨', title: 'Ownerzone', subtitle: cur ? 'BUNKER ACTIVE' : 'open',
        rows: [['mode', cur ? 'owner-only' : 'everyone talks']],
        body: '.ownerzone on · .ownerzone off\nBot must stay admin to delete intruders.',
      }));
    }
    const val = /^(on|enable|yes|1)$/.test(a) ? true : /^(off|disable|no|0)$/.test(a) ? false : !cur;
    savePolicy(m.chat, { ownerzone: val });
    return reply(ui.notice(val ? 'error' : 'success', val ? 'BUNKER SEALED ⛨' : 'Bunker open',
      val ? 'Only the owner circle can talk now.' : 'Everyone can talk again.'));
  },
};
