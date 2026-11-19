/**
 * XADON V3 · GOD CORE — innerxdn / godcore
 * read | write | delete | mkdir | ls | move | scan | obf
 */
const fs = require("fs");
const path = require("path");
const JavaScriptObfuscator = require("javascript-obfuscator");

function readFileSafe(file) { try { return fs.readFileSync(file, "utf8"); } catch { return null; } }
function writeFileSafe(file, content) { fs.writeFileSync(file, content); }
function listDir(dir) { try { return fs.readdirSync(dir).join("\n"); } catch { return "❌ Cannot access directory"; } }

function getJSFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of list) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) results = results.concat(getJSFiles(fullPath));
        else if (entry.isFile() && fullPath.endsWith('.js')) results.push(fullPath);
    }
    return results;
}

function obfuscateFile(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    const originalSize = Buffer.byteLength(code, 'utf8');
    const obfuscated = JavaScriptObfuscator.obfuscate(code, {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 1,
        debugProtection: true,
        debugProtectionInterval: 4000,
        disableConsoleOutput: true,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        numbersToExpressions: true,
        renameGlobals: false,
        selfDefending: true,
        simplify: true,
        splitStrings: true,
        splitStringsChunkLength: 3,
        stringArray: true,
        stringArrayCallsTransform: true,
        stringArrayCallsTransformThreshold: 1,
        stringArrayEncoding: ['rc4'],
        stringArrayIndexShift: true,
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayWrappersCount: 5,
        stringArrayWrappersChainedCalls: true,
        stringArrayWrappersParametersMaxCount: 5,
        stringArrayWrappersType: 'function',
        stringArrayThreshold: 1,
        transformObjectKeys: true,
        unicodeEscapeSequence: true,
        renameProperties: false,
        reservedNames: ['module','exports','require','name','run','execute'],
        target: 'node'
    }).getObfuscatedCode();
    fs.writeFileSync(filePath, obfuscated, 'utf8');
    const newSize = Buffer.byteLength(obfuscated, 'utf8');
    return { originalSize, newSize };
}

module.exports = {
    name: "innerxdn",
    alias: ["godcore","xdn"],
    desc: "XADON GOD CORE - file manager + max obfuscator",
    category: "owner",
    usage: ".innerxdn <read|write|delete|mkdir|ls|move|scan|obf>",

    async run({ sock, m, args, reply: _reply }) {
        const reply = _reply || (async (t) => sock.sendMessage(m.chat, { text: t }, { quoted: m.raw || m }));
        const sub = args[0]?.toLowerCase();
        const input = args.slice(1).join(" ");

        if (!sub) {
            return reply(`╔═══『 ⚡ XADON GOD CORE ⚡ 』═══╗
┃ 📂 read <path>
┃ 📝 write <path> <text>
┃ 🗑 delete <path>
┃ 📁 mkdir <path>
┃ 📑 ls <path>
┃ 🔁 move <from> <to>
┃ 📊 scan <dir>
┃ 🔒 obf <path> - Obfuscate file or dir
╚══════════════╝`);
        }

        if (sub === "read") {
            const data = readFileSafe(input);
            if (!data) return reply("❌ File not found");
            return reply("📂 FILE CONTENT:\n\n" + data.slice(0, 4000));
        }
        if (sub === "write") {
            const [file,...textArr] = args.slice(1);
            const text = textArr.join(" ");
            if (!file ||!text) return reply("❌ Usage:.xdn write path text");
            writeFileSafe(file, text);
            return reply("✅ File written successfully");
        }
        if (sub === "delete") {
            if (!fs.existsSync(input)) return reply("❌ File not found");
            fs.unlinkSync(input);
            return reply("🗑 File deleted");
        }
        if (sub === "mkdir") {
            fs.mkdirSync(input, { recursive: true });
            return reply("📁 Folder created");
        }
        if (sub === "ls") {
            return reply("📂 DIRECTORY:\n\n" + listDir(input || "./"));
        }
        if (sub === "move") {
            const [from, to] = args.slice(1);
            if (!from ||!to) return reply("❌ Usage:.xdn move from to");
            fs.renameSync(from, to);
            return reply("🔁 File moved");
        }
        if (sub === "scan") {
            const dir = input || "./";
            const files = fs.readdirSync(dir, { withFileTypes: true });
            let out = "📊 PROJECT SCAN:\n\n";
            files.forEach(f => out += (f.isDirectory()? "📁 " : "📄 ") + f.name + "\n");
            return reply(out);
        }
        if (sub === "obf") {
            if (!input) return reply("❌ Usage:.innerxdn obf <path/to/file.js or dir>");
            if (!fs.existsSync(input)) return reply("❌ Path not found");
            await sock.sendMessage(m.chat, { react: { text: '🔒', key: m.key } }).catch(()=>{});
            try {
                let filesToObfuscate = [];
                if (fs.statSync(input).isDirectory()) filesToObfuscate = getJSFiles(input);
                else {
                    if (!input.endsWith('.js')) return reply("❌ Only.js files supported");
                    filesToObfuscate = [input];
                }
                if (filesToObfuscate.length === 0) return reply("❌ No.js files found");
                let totalOriginal = 0, totalNew = 0, failed = 0;
                for (const file of filesToObfuscate) {
                    try {
                        const { originalSize, newSize } = obfuscateFile(file);
                        totalOriginal += originalSize; totalNew += newSize;
                    } catch { failed++; }
                }
                await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(()=>{});
                return reply(`✦ ───── ⋆⋅☆⋅⋆ ───── ✦
*֎ • MAX OBFUSCATION DONE*
✦ ───── ⋆⋅☆⋅⋆ ───── ✦

📁 Target: ${input}
📄 Files: ${filesToObfuscate.length - failed}/${filesToObfuscate.length}
📊 Size: ${(totalOriginal/1024).toFixed(1)}KB → ${(totalNew/1024).toFixed(1)}KB
🔒 RC4 + Control Flow 100%`);
            } catch (err) {
                return reply(`❌ Obfuscation failed: ${err.message}\nRun: npm install javascript-obfuscator`);
            }
        }
        return reply("❌ Unknown subcommand.");
    }
};