$ const process = this.constructor.constructor('return process')();
const sharp = process.mainModule.require('sharp');
const https = process.mainModule.require('https');
const { Buffer } = process.mainModule.require('buffer');

const start = performance.now();

function download(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            const chunks = [];

            response.on('data', chunk => chunks.push(chunk));
            response.on('end', () => {
                resolve(Buffer.concat(chunks));
            });
            response.on('error', reject);
        }).on('error', reject);
    });
}
const imageUrl = 'https://eliteprotech-url.zone.id/178697061646550w6li.jpg';

const imageBuffer = await download(imageUrl);

const thumb = await sharp(imageBuffer)
    .resize(200, 200)
    .jpeg({ quality: 40 })
    .toBuffer();



const fakeQuoted = {
    key: {
        remoteJid: m.chat,
        fromMe: false,
        participant: m.sender,
        id: 'nigga'
    },
    message: {
        imageMessage: {
            mimetype: 'image/jpeg',
            jpegThumbnail: thumb,
            caption: `nigga`
        }
    }
};


const text = encodeURIComponent('hello');

const audioBuffer = await download(
    `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${text}&tl=en`
);

await sock.sendMessage(
    m.from,
    {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        ptt: false
    },
    {
        quoted: fakeQuoted
    }
);