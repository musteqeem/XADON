$ const selected = [
    'https://picsum.photos/600/400?random=1',
    'https://picsum.photos/600/400?random=2',
    'https://picsum.photos/600/400?random=3',
    'https://picsum.photos/600/400?random=4',
    'https://picsum.photos/600/400?random=5',
    'https://picsum.photos/600/400?random=6',
    'https://picsum.photos/600/400?random=7',
    'https://picsum.photos/600/400?random=8',
    'https://picsum.photos/600/400?random=9',
    'https://picsum.photos/600/400?random=10'
]

const cards = []

for (let i = 0; i < selected.length; i++) {
    const response = await axios.get(selected[i], {
        responseType: 'arraybuffer',
        timeout: 15000
    })

    const imageMessage = (
        await generateWAMessageContent(
            { image: Buffer.from(response.data) },
            { upload: sock.waUploadToServer }
        )
    ).imageMessage

    cards.push({
        header: {
            title: `Image ${i + 1}`,
            subtitle: '',
            imageMessage,
            hasMediaAttachment: true
        },
        body: {
            text: `Test Image ${i + 1}`
        },
        footer: {
            text: 'abztech'
        },
        nativeFlowMessage: {
            buttons: [
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: 'Test',
                        id: `carousel_test_${i}_${Date.now()}`
                    })
                }
            ],
            messageParamsJson: '{}'
        }
    })
}

const msg = generateWAMessageFromContent(
    m.from,
    {
        interactiveMessage: {
            header: {
                hasMediaAttachment: false
            },
            body: {
                text: '*IMAGE CAROUSEL TEST*\n\nSwipe to browse'
            },
            footer: {
                text: 'xadon'
            },
            carouselMessage: {
                cards
            },
            contextInfo: {}
        }
    },
    {
        userJid: m.sender,
        messageId: generateMessageID()
    }
)

await sock.relayMessage(
    m.from,
    msg.message,
    {
        messageId: msg.key.id,
        additionalNodes: [
            {
                tag: 'biz',
                attrs: {},
                content: [
                    {
                        tag: 'interactive',
                        attrs: {
                            type: 'native_flow',
                            v: '1'
                        },
                        content: [
                            {
                                tag: 'native_flow',
                                attrs: {
                                    v: '9',
                                    name: 'mixed'
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
)