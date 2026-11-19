try {
  await client.relayMessage(
    m.chat,
    {
  messageContextInfo: {
    threadId: [],
    deviceListMetadata: {
      senderKeyIndexes: [],
      recipientKeyIndexes: []
    },
    deviceListMetadataVersion: 2,
    botMetadata: {
      messageDisclaimerText: "",
      botResponseId: "abztech-whatsapp-1788103139454"
    }
  },
  botForwardedMessage: {
    message: {
      richResponseMessage: {
        submessages: [
          {
            messageType: 2,
            messageText: "ABZTECH • WHATSAPP"
          }
        ],
        messageType: 1,
        unifiedResponse: {
          data: Buffer.from(JSON.stringify({
  response_id: "abztech-whatsapp-1788103139454",
  sections: [
    {
      view_model: {
        primitive: {
          __typename: "GenAIaeacdsnwHtmlPrimitive",
          payload: "<style>\n* {\n  box-sizing: border-box;\n  -webkit-tap-highlight-color: transparent;\n  margin: 0;\n  padding: 0;\n}\n\nhtml,\nbody {\n  background: transparent;\n  font-family: &#x27;Segoe UI&#x27;, Helvetica, Arial, sans-serif;\n  color: #e9edef;\n  overflow: hidden;\n  font-size: 12px;\n}\n\n.wrap {\n  width: 100%;\n  max-width: 400px;\n  margin: auto;\n  padding: 4px;\n}\n\n.card {\n  position: relative;\n  overflow: hidden;\n  border-radius: 10px;\n  background: #0b141a;\n  border: 1px solid #202c33;\n  box-shadow: 0 8px 24px rgba(0,0,0,.6);\n  display: flex;\n  flex-direction: column;\n  height: 620px;\n}\n\n/* HEADER */\n.header {\n  background: #202c33;\n  padding: 9px 12px;\n  display: flex;\n  align-items: center;\n  gap: 9px;\n}\n\n.avatar {\n  width: 34px;\n  height: 34px;\n  border-radius: 50%;\n  background: linear-gradient(135deg,#6e7b8b,#4a5568);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-weight: 700;\n  font-size: 15px;\n  color: #fff;\n}\n\n.header-info {\n  flex: 1;\n}\n\n.header-name {\n  font-size: 14px;\n  font-weight: 600;\n}\n\n.header-status {\n  font-size: 10px;\n  color: #8696a0;\n}\n\n.header-icons {\n  display: flex;\n  align-items: center;\n  gap: 15px;\n  color: #aebac1;\n}\n\n.header-btn {\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.svg-icon {\n  width: 18px;\n  height: 18px;\n  fill: currentColor;\n}\n\n/* CHAT */\n.chat-area {\n  position: relative;\n  flex: 1;\n  background: #0b141a;\n  padding: 12px;\n  overflow-y: auto;\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n\n.message-row {\n  display: flex;\n  justify-content: flex-end;\n  width: 100%;\n}\n\n.bubble {\n  max-width: 78%;\n  background: #005c4b;\n  padding: 6px 8px;\n  border-radius: 7px;\n  border-top-right-radius: 2px;\n  font-size: 12px;\n  line-height: 1.3;\n  word-break: break-word;\n}\n\n.msg-time {\n  font-size: 8px;\n  color: #99c8bd;\n  margin-left: 6px;\n}\n\n.ticks {\n  color: #53bdeb;\n}\n\n/* INPUT */\n.input-bar {\n  background: #202c33;\n  padding: 6px;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.input-box {\n  position: relative;\n  flex: 1;\n  height: 46px;\n  background: #2a3942;\n  border-radius: 12px;\n  padding: 0 11px;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.input-emoji {\n  width: 23px;\n  height: 23px;\n  flex-shrink: 0;\n  color: #aebac1;\n  cursor: pointer;\n}\n\n.input-emoji svg {\n  width: 23px;\n  height: 23px;\n  fill: currentColor;\n}\n\n.textarea-mock {\n  flex: 1;\n  width: 100%;\n  height: 27px;\n  background: transparent;\n  border: none;\n  outline: none;\n  color: #e9edef;\n  font-size: 12px;\n  font-family: inherit;\n  resize: none;\n  padding: 2px 0;\n  line-height: 20px;\n  overflow: hidden;\n  user-select: text;\n  -webkit-user-select: text;\n}\n\n.textarea-mock::placeholder {\n  color: #8696a0;\n}\n\n/* SEND */\n.send-btn {\n  width: 40px;\n  height: 40px;\n  flex-shrink: 0;\n  border: 0;\n  border-radius: 50%;\n  background: #00a884;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n}\n\n.send-btn:active {\n  transform: scale(.9);\n}\n\n.send-icon {\n  width: 21px;\n  height: 21px;\n  fill: #111b21;\n}\n\n/* EMOJI PICKER */\n.emoji-picker {\n  position: absolute;\n  left: 6px;\n  bottom: 54px;\n  width: calc(100% - 12px);\n  max-height: 170px;\n  overflow-y: auto;\n  padding: 8px;\n  background: #202c33;\n  border: 1px solid #35434b;\n  border-radius: 10px;\n  box-shadow: 0 6px 20px rgba(0,0,0,.5);\n  display: none;\n  z-index: 20;\n}\n\n.emoji-picker.show {\n  display: block;\n}\n\n.emoji-grid {\n  display: grid;\n  grid-template-columns: repeat(8,1fr);\n  gap: 3px;\n}\n\n.emoji {\n  height: 28px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 18px;\n  cursor: pointer;\n  border-radius: 5px;\n}\n\n.emoji:active {\n  background: #2a3942;\n  transform: scale(.9);\n}\n\n/* MENU */\n.menu-popup {\n  position: absolute;\n  right: 8px;\n  top: 50px;\n  background: #233038;\n  border-radius: 7px;\n  min-width: 130px;\n  padding: 4px 0;\n  box-shadow: 0 5px 16px rgba(0,0,0,.5);\n  display: none;\n  z-index: 30;\n}\n\n.menu-popup.show {\n  display: block;\n}\n\n.menu-item {\n  padding: 9px 12px;\n  font-size: 12px;\n  cursor: pointer;\n}\n\n.menu-item:active {\n  background: #2a3942;\n}\n\n/* BOTTOM NAV */\n.custom-nav {\n  background: #202c33;\n  border-top: 1px solid #2a3942;\n  padding: 7px 12px;\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n}\n\n.nav-icons {\n  display: flex;\n  align-items: center;\n  gap: 18px;\n  color: #8696a0;\n}\n\n.nav-btn {\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n}\n\n.nav-btn:active {\n  transform: scale(.88);\n}\n\n.nav-icons .svg-icon {\n  width: 21px;\n  height: 21px;\n}\n\n.hidden-file {\n  display: none;\n}\n</style>\n\n<div class=\"wrap\">\n<div class=\"card\">\n\n  <!-- HEADER -->\n  <div class=\"header\">\n\n    <div class=\"avatar\">R</div>\n\n    <div class=\"header-info\">\n      <div class=\"header-name\">Raja Kamal</div>\n      <div class=\"header-status\">online</div>\n    </div>\n\n    <div class=\"header-icons\">\n\n      <div class=\"header-btn\" id=\"videoBtn\">\n        <svg class=\"svg-icon\" viewBox=\"0 0 24 24\">\n          <path d=\"M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z\"/>\n        </svg>\n      </div>\n\n      <div class=\"header-btn\" id=\"phoneBtn\">\n        <svg class=\"svg-icon\" viewBox=\"0 0 24 24\">\n          <path d=\"M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C8.61 21 3 15.39 3 8.5c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z\"/>\n        </svg>\n      </div>\n\n      <div class=\"header-btn\" id=\"menuBtn\">\n        <svg class=\"svg-icon\" viewBox=\"0 0 24 24\">\n          <path d=\"M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z\"/>\n        </svg>\n      </div>\n\n    </div>\n  </div>\n\n  <!-- MENU -->\n  <div class=\"menu-popup\" id=\"menuPopup\">\n    <div class=\"menu-item\" id=\"contactItem\">Contact info</div>\n    <div class=\"menu-item\" id=\"searchItem\">Search</div>\n    <div class=\"menu-item\" id=\"clearItem\">Clear chat</div>\n  </div>\n\n  <!-- EMPTY CHAT -->\n  <div class=\"chat-area\" id=\"chatArea\"></div>\n\n  <!-- INPUT -->\n  <div class=\"input-bar\">\n\n    <div class=\"input-box\">\n\n      <div class=\"input-emoji\" id=\"emojiBtn\">\n        <svg viewBox=\"0 0 24 24\">\n          <path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-7c.83 0 1.5-.67 1.5-1.5S8.83 10 8 10s-1.5.67-1.5 1.5S7.17 13 8 13zm8 0c.83 0 1.5-.67 1.5-1.5S16.83 10 16 10s-1.5.67-1.5 1.5S15.17 13 16 13zm-4 4c2.05 0 3.8-1.24 4.56-3H7.44c.76 1.76 2.51 3 4.56 3z\"/>\n        </svg>\n      </div>\n\n      <textarea\n        id=\"messageInput\"\n        class=\"textarea-mock\"\n        placeholder=\"Message\"\n        rows=\"1\"></textarea>\n\n      <div class=\"emoji-picker\" id=\"emojiPicker\">\n\n        <div class=\"emoji-grid\">\n          <span class=\"emoji\">😀</span>\n          <span class=\"emoji\">😃</span>\n          <span class=\"emoji\">😄</span>\n          <span class=\"emoji\">😁</span>\n          <span class=\"emoji\">😆</span>\n          <span class=\"emoji\">😅</span>\n          <span class=\"emoji\">😂</span>\n          <span class=\"emoji\">🤣</span>\n          <span class=\"emoji\">😊</span>\n          <span class=\"emoji\">😇</span>\n          <span class=\"emoji\">🙂</span>\n          <span class=\"emoji\">🙃</span>\n          <span class=\"emoji\">😉</span>\n          <span class=\"emoji\">😍</span>\n          <span class=\"emoji\">🥰</span>\n          <span class=\"emoji\">😘</span>\n          <span class=\"emoji\">😎</span>\n          <span class=\"emoji\">🤩</span>\n          <span class=\"emoji\">🥳</span>\n          <span class=\"emoji\">🤔</span>\n          <span class=\"emoji\">🤨</span>\n          <span class=\"emoji\">😐</span>\n          <span class=\"emoji\">🙄</span>\n          <span class=\"emoji\">😏</span>\n          <span class=\"emoji\">😴</span>\n          <span class=\"emoji\">🤯</span>\n          <span class=\"emoji\">😱</span>\n          <span class=\"emoji\">😭</span>\n          <span class=\"emoji\">😡</span>\n          <span class=\"emoji\">❤️</span>\n          <span class=\"emoji\">🧡</span>\n          <span class=\"emoji\">💛</span>\n          <span class=\"emoji\">💚</span>\n          <span class=\"emoji\">💙</span>\n          <span class=\"emoji\">💜</span>\n          <span class=\"emoji\">🖤</span>\n          <span class=\"emoji\">🤍</span>\n          <span class=\"emoji\">👍</span>\n          <span class=\"emoji\">👎</span>\n          <span class=\"emoji\">👏</span>\n          <span class=\"emoji\">🙌</span>\n          <span class=\"emoji\">🙏</span>\n          <span class=\"emoji\">🔥</span>\n          <span class=\"emoji\">✨</span>\n          <span class=\"emoji\">🎉</span>\n          <span class=\"emoji\">💯</span>\n          <span class=\"emoji\">🚀</span>\n          <span class=\"emoji\">💀</span>\n          <span class=\"emoji\">👀</span>\n          <span class=\"emoji\">💔</span>\n          <span class=\"emoji\">✅</span>\n          <span class=\"emoji\">❌</span>\n          <span class=\"emoji\">⭐</span>\n        </div>\n\n      </div>\n\n    </div>\n\n    <button\n      id=\"sendButton\"\n      class=\"send-btn\"\n      type=\"button\">\n\n      <svg class=\"send-icon\" viewBox=\"0 0 24 24\">\n        <path d=\"M2.01 21L23 12 2.01 3 2 10l15-2-15 2z\"/>\n      </svg>\n\n    </button>\n\n  </div>\n\n  <!-- BOTTOM NAV -->\n  <div class=\"custom-nav\">\n\n    <div class=\"nav-icons\">\n\n      <div class=\"nav-btn\" id=\"bottomEmojiBtn\">\n        <svg class=\"svg-icon\" viewBox=\"0 0 24 24\">\n          <path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-7c.83 0 1.5-.67 1.5-1.5S8.83 10 8 10s-1.5.67-1.5 1.5S7.17 13 8 13zm8 0c.83 0 1.5-.67 1.5-1.5S16.83 10 16 10s-1.5.67-1.5 1.5S15.17 13 16 13zm-4 4c2.05 0 3.8-1.24 4.56-3H7.44c.76 1.76 2.51 3 4.56 3z\"/>\n        </svg>\n      </div>\n\n      <div class=\"nav-btn\" id=\"cameraBtn\">\n        <svg class=\"svg-icon\" viewBox=\"0 0 24 24\">\n          <path d=\"M12 15.2c1.77 0 3.2-1.43 3.2-3.2s-1.43-3.2-3.2-3.2-3.2 1.43-3.2 3.2 1.43 3.2 3.2 3.2zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z\"/>\n        </svg>\n      </div>\n\n      <div class=\"nav-btn\" id=\"moonBtn\">\n        <svg class=\"svg-icon\" viewBox=\"0 0 24 24\">\n          <path d=\"M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z\"/>\n        </svg>\n      </div>\n\n    </div>\n  </div>\n\n  <input\n    type=\"file\"\n    id=\"cameraInput\"\n    class=\"hidden-file\"\n    accept=\"image/*\"\n    capture=\"environment\">\n\n</div>\n</div>\n\n<script>\n(function() {\n\n  const input = document.getElementById(\"messageInput\");\n  const send = document.getElementById(\"sendButton\");\n  const chat = document.getElementById(\"chatArea\");\n\n  const emojiBtn = document.getElementById(\"emojiBtn\");\n  const bottomEmojiBtn = document.getElementById(\"bottomEmojiBtn\");\n  const emojiPicker = document.getElementById(\"emojiPicker\");\n\n  const menuBtn = document.getElementById(\"menuBtn\");\n  const menuPopup = document.getElementById(\"menuPopup\");\n\n  const cameraBtn = document.getElementById(\"cameraBtn\");\n  const cameraInput = document.getElementById(\"cameraInput\");\n\n  const phoneBtn = document.getElementById(\"phoneBtn\");\n  const videoBtn = document.getElementById(\"videoBtn\");\n\n  const moonBtn = document.getElementById(\"moonBtn\");\n\n  function toggleEmoji() {\n    emojiPicker.classList.toggle(\"show\");\n    menuPopup.classList.remove(\"show\");\n    input.focus();\n  }\n\n  emojiBtn.addEventListener(\"click\", toggleEmoji);\n  bottomEmojiBtn.addEventListener(\"click\", toggleEmoji);\n\n  document.querySelectorAll(\".emoji\").forEach(function(emoji) {\n    emoji.addEventListener(\"click\", function() {\n\n      const start = input.selectionStart;\n      const end = input.selectionEnd;\n\n      input.value =\n        input.value.substring(0, start) +\n        this.textContent +\n        input.value.substring(end);\n\n      input.selectionStart =\n        input.selectionEnd =\n        start + this.textContent.length;\n\n      input.focus();\n    });\n  });\n\n  menuBtn.addEventListener(\"click\", function() {\n    menuPopup.classList.toggle(\"show\");\n    emojiPicker.classList.remove(\"show\");\n  });\n\n  document.getElementById(\"contactItem\").addEventListener(\"click\", function() {\n    alert(\"Contact info\");\n    menuPopup.classList.remove(\"show\");\n  });\n\n  document.getElementById(\"searchItem\").addEventListener(\"click\", function() {\n    input.focus();\n    menuPopup.classList.remove(\"show\");\n  });\n\n  document.getElementById(\"clearItem\").addEventListener(\"click\", function() {\n    chat.innerHTML = \"\";\n    menuPopup.classList.remove(\"show\");\n  });\n\n  cameraBtn.addEventListener(\"click\", function() {\n    cameraInput.click();\n  });\n\n  cameraInput.addEventListener(\"change\", function() {\n\n    if (!this.files || !this.files.length) return;\n\n    const file = this.files[0];\n\n    const row = document.createElement(\"div\");\n    row.className = \"message-row\";\n\n    const bubble = document.createElement(\"div\");\n    bubble.className = \"bubble\";\n\n    bubble.textContent = \"📷 \" + file.name;\n\n    row.appendChild(bubble);\n    chat.appendChild(row);\n\n    chat.scrollTop = chat.scrollHeight;\n  });\n\n  phoneBtn.addEventListener(\"click\", function() {\n    alert(\"Calling Raja Kamal...\");\n  });\n\n  videoBtn.addEventListener(\"click\", function() {\n    alert(\"Starting video call...\");\n  });\n\n  function sendMessage() {\n\n    const text = input.value.trim();\n\n    if (!text) return;\n\n    const row = document.createElement(\"div\");\n    row.className = \"message-row\";\n\n    const bubble = document.createElement(\"div\");\n    bubble.className = \"bubble\";\n\n    const message = document.createElement(\"span\");\n    message.textContent = text;\n\n    const time = document.createElement(\"span\");\n    time.className = \"msg-time\";\n\n    const now = new Date();\n\n    time.textContent =\n      now.getHours().toString().padStart(2, \"0\") +\n      \":\" +\n      now.getMinutes().toString().padStart(2, \"0\") +\n      \" \";\n\n    const ticks = document.createElement(\"span\");\n    ticks.className = \"ticks\";\n    ticks.textContent = \"✓✓\";\n\n    time.appendChild(ticks);\n\n    bubble.appendChild(message);\n    bubble.appendChild(time);\n\n    row.appendChild(bubble);\n    chat.appendChild(row);\n\n    input.value = \"\";\n\n    emojiPicker.classList.remove(\"show\");\n\n    chat.scrollTop = chat.scrollHeight;\n  }\n\n  send.addEventListener(\"click\", sendMessage);\n\n  input.addEventListener(\"keydown\", function(e) {\n\n    if (e.key === \"Enter\" && !e.shiftKey) {\n      e.preventDefault();\n      sendMessage();\n    }\n\n  });\n\n  moonBtn.addEventListener(\"click\", function() {\n\n    const card = document.querySelector(\".card\");\n\n    if (card.style.filter === \"brightness(0.7)\") {\n      card.style.filter = \"brightness(1)\";\n    } else {\n      card.style.filter = \"brightness(0.7)\";\n    }\n\n  });\n\n})();\n</script>",
          trusted_sources: [
            "abztech"
          ]
        },
        __typename: "GenAISingleLayoutViewModel"
      }
    }
  ]
}), "utf-8").toString("base64")
        },
        contextInfo: {
          mentionedJid: [],
          groupMentions: [],
          statusAttributions: [],
          forwardingScore: 1,
          isForwarded: true,
          forwardedAiBotMessageInfo: {
            botJid: "867051314767696@bot"
          },
          forwardOrigin: 4
        }
      }
    }
  }
},
    {
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

  await client.sendMessage(m.chat, {
    react: {
      text: "✅",
      key: m.key
    }
  });
} catch (e) {
  await m.reply(String(e.stack || e));
}