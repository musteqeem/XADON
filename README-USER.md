# XADON AI — User Guide (no coding needed)

Welcome! Your bot is ready. You do NOT need to be a developer.

## 1) Install (2 minutes)
1. Install Node.js 20+ from https://nodejs.org
2. Unzip this file, open the `bot` folder in a terminal
3. Run:
```
npm install
cp .env.example .env
npm start
```
4. Enter your WhatsApp number when asked, then enter the 8-letter pairing code on WhatsApp > Linked devices > Link with phone number.

## 2) Everyday commands
- `.menu` — all commands
- `.ping` — speed check
- `.ai hello` — smart AI (add GROQ_API_KEY in .env for full power)
- `.nodax hello` — human-like Nodax chat (works with no key; faster with GROQ_API_KEY)
- `.imagine a lion at sunset` — make a picture
- `.creen a robot dancing in Lagos` — make a video (free studio link; MP4 auto-delivery when CREEN_API_KEY is set)
- `.sticker` (reply to photo) — make sticker
- `.vv` (reply to view-once) — open view-once

## 3) Menu media and group greetings
The default menu uses `assets/xadon-menu-premium.png`. The bundled `assets/xadon-menu-premium.mp4` and `assets/xadon-menu-premium.gif` can also be selected:
```
.setmenuimg https://example.com/menu.gif
.setmenuimg https://example.com/menu.mp4
```
You can also reply to an image, GIF, or video with `.setmenuimg` (owner only). `.menu` detects the media type and sends it as an image, animated GIF, or video.

Welcome and goodbye templates preserve line breaks. Use a real multiline message or `\\n`:
```
.welcome on Hi @user
Welcome to @group
Today is @date at @time
```
Supported placeholders: `@user`, `@group`, `@date`, `@time`, `@bot`, `@number`, `@userpp`, `@groupp`, and `@members`. If a profile picture is available, it is sent with the greeting; otherwise the message safely falls back to text.

## 4) Reply style (for adults / simple taste)
Pick how the bot talks:
```
.setformat list
.setformat raw     → plain text only, no cards (best for elders)
.setformat clean   → simple ─── dividers only
.setformat elder   → big spaced plain text
.setformat retro   → old-school [ BOT ] text
.setformat default → back to premium cards
```

## 4) Boss commands (owner only, 10)
`.boss` shows the panel: bossmode, bossblast (announce to all groups), bosshide, bosskill, bosslock, bossmute, bossunmute, bossnick, bossclean, bossstats.

## 5) Premium investigation tools (built-in now)
`.proto` (reply to msg = deep protocol dump), `.msginfo` (export msg JSON), `.jidinfo` (inspect contact), `.gallery` (swipeable photos).

## 6) Need help?
- `.help ping` — help for any command
- `.support` / `.owner` — contact owner
- Never share your `.env` or `session/` folder.

Enjoy — XADON AI.

## Browser Session ID

The XADON pair site generates a full multi-file auth bundle prefixed with `xadon~`. Paste the complete token into `SESSION_ID` in `.env` and start the bot. The importer also accepts the older creds-only base64 format. Keep the value private; it grants access to the WhatsApp account.
