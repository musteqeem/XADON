/** XADON V9 · svcontact — save every group member as one .vcf contact file. */
module.exports = {
  name: 'svcontact',
  alias: ['savecontacts', 'gcontact', 'exportvcf'],
  desc: 'Export group members as vCard file',
  usage: '.svcontact',
  category: 'group',
  group: true,
  async run({ sock, m, reply, ui }) {
    let meta;
    try { meta = await sock.groupMetadata(m.chat); } catch { return reply(ui.notice('error', 'Failed', 'Could not read group members.')); }
    const parts = meta.participants || [];
    if (!parts.length) return reply(ui.notice('warn', 'Empty', 'No members found.'));
    const vcf = parts.map((p, i) => {
      const num = String(p.id || '').split('@')[0].split(':')[0];
      const name = p.notify || p.name || `Contact ${i + 1}`;
      return ['BEGIN:VCARD', 'VERSION:3.0', `FN:${name}`, `TEL;TYPE=CELL:+${num}`, 'END:VCARD'].join('\n');
    }).join('\n');
    await sock.sendMessage(m.chat, {
      document: Buffer.from(vcf),
      mimetype: 'text/vcard',
      fileName: `${String(meta.subject || 'group').replace(/[^\w\- ]+/g, '').slice(0, 30) || 'group'}-contacts.vcf`,
      caption: `◈ 𝗖𝗢𝗡𝗧𝗔𝗖𝗧𝗦 ⟶ ${parts.length} members saved\n\n${ui.footer()}`,
    }, { quoted: m.raw });
  },
};
