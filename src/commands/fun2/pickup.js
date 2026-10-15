// XADON AI · FUN — premium unicode card, no emojis.
const P = ['Are you Wi-Fi? Because I feel a strong connection.', 'Are you a keyboard? Because you are my type.', 'Do you like coffee? Because you keep me awake.'];
module.exports = {
  name: 'pickup',
  alias: ['pickupx'],
  desc: 'Pickup line drop',
  category: 'fun2',
  async run({ reply, ui }) {
    const { fonts } = ui;
    return reply([`◈ ${fonts.bold('PICKUP LINE')}`, '', fonts.italic(P[Date.now() % P.length]), '', ui.footer()].join('\n'));
  },
};
