$ try {
  const sharp = process.mainModule.require("sharp");
  const crypto = process.mainModule.require("crypto");

  const colors = [
    { name: "Red", r: 220, g: 0, b: 0 },
    { name: "Yellow", r: 255, g: 210, b: 0 },
    { name: "Green", r: 0, g: 180, b: 70 },
    { name: "Blue", r: 0, g: 110, b: 220 },
    { name: "Purple", r: 150, g: 50, b: 200 },
    { name: "Orange", r: 255, g: 120, b: 0 }
  ];

  const stickers = [];

  let packMedia = null;

  for (const color of colors) {
    const webpBuffer = await sharp({
      create: {
        width: 512,
        height: 512,
        channels: 4,
        background: {
          r: color.r,
          g: color.g,
          b: color.b,
          alpha: 1
        }
      }
    })
      .webp({ quality: 90 })
      .toBuffer();

    const media = await prepareWAMessageMedia(
      {
        sticker: webpBuffer,
        mimetype: "image/webp"
      },
      {
        upload: sock.waUploadToServer
      }
    );

    const stickerMessage = media.stickerMessage;

    if (!stickerMessage) {
      throw new Error(`Failed to upload ${color.name}`);
    }

    /*
     * Keep the first uploaded media as the
     * pack-level media, matching your working
     * stickerPackMessage structure.
     */
    if (!packMedia) {
      packMedia = stickerMessage;
    }

    stickers.push({
      fileName: `${crypto.randomUUID()}.webp`,
      isAnimated: false,
      emojis: [""],
      accessibilityLabel: color.name,
      isLottie: false,
      mimetype: "image/webp"
    });
  }

  const stickerPackMessage =
    proto.Message.StickerPackMessage.fromObject({
      stickerPackId: crypto.randomUUID(),

      name: "XADON Colors",

      publisher: "musteqeem",

      stickers,

      /*
       * These are kept exactly in the same
       * position/structure as your working code.
       */
      fileLength: packMedia.fileLength,
      fileSha256: packMedia.fileSha256,
      fileEncSha256: packMedia.fileEncSha256,
      mediaKey: packMedia.mediaKey,
      directPath: packMedia.directPath,

      contextInfo: {},

      packDescription: "XADON Color Pack",

      mediaKeyTimestamp: packMedia.mediaKeyTimestamp,

      stickerPackSize: packMedia.fileLength,

      stickerPackOrigin: 2
    });

  const msg = generateWAMessageFromContent(
    m.from,
    {
      stickerPackMessage
    },
    {
      userJid: m.sender,
      messageId: generateMessageID()
    }
  );

  await sock.relayMessage(
    m.from,
    msg.message,
    {
      messageId: msg.key.id,

      additionalNodes: [
        {
          tag: "biz",
          attrs: {},
          content: [
            {
              tag: "interactive",
              attrs: {
                type: "native_flow",
                v: "1"
              },
              content: [
                {
                  tag: "native_flow",
                  attrs: {
                    v: "9",
                    name: "mixed"
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  );

  await sock.sendMessage(m.from, {
    react: {
      text: "✅",
      key: m.key
    }
  });

} catch (e) {
  await m.reply(String(e.stack || e));
}