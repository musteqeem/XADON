 const groupId = m.from;
const userJid = "867051314767696@bot";

const result = await sock.groupParticipantsUpdate(
    groupId,
    [userJid],
    "add"
);

return result;