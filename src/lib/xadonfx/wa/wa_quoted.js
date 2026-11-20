.eval (async () => {
  const q = await m.getQuotedObj()
  const media = q?.quoted

  if (!media) {
    return m.reply(`No quoted message found. q=${q?.mtype}`)
  }

  const caption = media.caption || ''

  switch (media.mtype) {
    case 'conversation':
      return m.reply(media.text || '')

    case 'extendedTextMessage':
      return m.reply(media.text || '')

    case 'imageMessage': {
      const buffer = await media.download()

      return EliteProTech.sendMessage(
        m.chat,
        {
          image: buffer,
          caption
        },
        { quoted: m }
      )
    }

    case 'videoMessage': {
      const buffer = await media.download()

      return EliteProTech.sendMessage(
        m.chat,
        {
          video: buffer,
          caption
        },
        { quoted: m }
      )
    }

    case 'audioMessage': {
      const buffer = await media.download()

      return EliteProTech.sendMessage(
        m.chat,
        {
          audio: buffer,
          mimetype: media.mimetype || 'audio/mp4',
          ptt: media.ptt || false
        },
        { quoted: m }
      )
    }

    case 'documentMessage': {
      const buffer = await media.download()

      return EliteProTech.sendMessage(
        m.chat,
        {
          document: buffer,
          mimetype: media.mimetype || 'application/octet-stream',
          fileName: media.fileName || 'document',
          caption
        },
        { quoted: m }
      )
    }

    case 'stickerMessage': {
      const buffer = await media.download()

      return EliteProTech.sendMessage(
        m.chat,
        {
          sticker: buffer
        },
        { quoted: m }
      )
    }

    default:
      return m.reply(`Unsupported message type: ${media.mtype}`)
  }
})()