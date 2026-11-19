/**
 * XADON AI · simple-mode (20 commands reply simple like .ping).
 * These commands bypass UI cards/footers and answer in clean unicode only:
 *   *_֎ text_*  (no cards, no branding spam — adults/simple phones).
 * The list below is exactly the 20 newly integrated CODY commands.
 */
const SIMPLE = new Set([
  'bank', 'mylink', 'preview', 'device', 'distance', 'getphone', 'hostcheck',
  'location', 'metadata', 'calculator', 'felo', 'movieintel', 'livematch',
  'esports', 'ringtone', 'tiktoksearch', 'antideletestatus', 'pin', 'pinchat',
  'chess',
]);
const isSimple = (name = '') => SIMPLE.has(String(name || '').toLowerCase());
module.exports = { SIMPLE: [...SIMPLE], isSimple };
