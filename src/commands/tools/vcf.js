// XADON AI command: vcf — Create a contact card text file.
module.exports = {
  name: 'vcf',
  desc: 'Create a contact card text file',
  usage: '.vcf',
  async run(ctx) { return require('../../lib/extra-commands')('vcf', ctx); },
};
