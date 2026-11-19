.eval const quotedMsg = m;

const keyword = /\b(await|export|import|throw|try|catch|finally|new|delete|do|while|if|else|switch|case|default|for|each|in|of|with|async|class|const|extends|function|let|this|typeof|var|void|break|continue|return|yield)\b/y;
const method = /\b(?:async\s+)?function\s+[A-Za-z_$][\w$]*\s*\([^)]*\)|[A-Za-z_$][\w$]*\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/y;
const string = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/y;
const number = /\b(?:0x[a-fA-F0-9]+|0b[01]+|0o[0-7]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/y;
const comment = /((\/\/ ?.*)|(\/\*[^*]*\*+(?:[^\/*][^*]*\*+)*\/))/y;

function tokenize(code, language = 'javascript') {
	const rules = [
		{ type: 'COMMENT', regex: comment },
		{ type: 'STR', regex: string },
		{ type: 'NUMBER', regex: number },
		{ type: 'KEYWORD', regex: keyword },
		{ type: 'METHOD', regex: method },
	];
	const tokens = [];
	let index = 0;
	while (index < code.length) {
		let matched = false;
		for (const rule of rules) {
			rule.regex.lastIndex = index;
			const match = rule.regex.exec(code);
			if (!match) continue;
			tokens.push({ content: match[0], type: rule.type });
			index += match[0].length;
			matched = true;
			break;
		}
		if (!matched) {
			tokens.push({ content: code[index], type: 'DEFAULT' });
			index++;
		}
	}
	return {
		view_model: {
			primitive: {
				language,
				code_blocks: mergeAdjacent(tokens),
				__typename: 'GenAICodeUXPrimitive',
			},
			__typename: 'GenAISingleLayoutViewModel',
		},
	};
}

function mergeAdjacent(tokens) {
	const merged = [];
	for (const token of tokens) {
		const last = merged[merged.length - 1];
		if (last && last.type === token.type) {
			last.content += token.content;
		} else {
			merged.push({ content: token.content, type: token.type });
		}
	}
	return merged;
}

const messageContextInfo = {
	botMessageSecret: crypto.getRandomValues(new Uint8Array(32)),
};

const unified = {
	response_id: crypto.randomUUID(),
	sections: [
		{
			view_model: {
				primitive: {
					text: `# ELITE-PRO-V2\n## Rich Message Test\n### by cyrilix`,
					__typename: 'GenAIMarkdownTextUXPrimitive',
				},
				__typename: 'GenAISingleLayoutViewModel',
			},
		},
		{
			view_model: {
				primitive: {
					rows: [
						{ is_header: true, cells: ['Feature', 'Status'] },
						{ is_header: false, cells: ['Markdown', '✅'] },
						{ is_header: false, cells: ['Tables', '✅'] },
						{ is_header: false, cells: ['Code', '✅'] },
					],
					__typename: 'GenATableUXPrimitive',
				},
				__typename: 'GenAISingleLayoutViewModel',
			},
		},
		tokenize(m.quoted?.text || '// test code here'),
	],
};

const richResponseMessage = {
	submessages: [],
	messageType: 1,
	unifiedResponse: {
		data: Buffer.from(JSON.stringify(unified)),
	},
};

const generatedMessage = generateWAMessageFromContent(
	m.chat,
	{
		messageContextInfo,
		botForwardedMessage: {
			message: {
				richResponseMessage: {
					...richResponseMessage,
					contextInfo: {
						forwardingScore: 1,
						isForwarded: true,
						forwardedAiBotMessageInfo: { botJid: '867051314767696@bot' },
						forwardOrigin: 4,
						botMessageSharingInfo: { botEntryPointOrigin: 2, forwardScore: 1 },
						...(quotedMsg ? {
							stanzaId: quotedMsg.key.id,
							participant: quotedMsg.participant || quotedMsg.key.participant || quotedMsg.key.remoteJid,
							quotedMessage: quotedMsg.message,
							quotedType: 0,
						} : {}),
					},
				},
			},
		},
	},
	{}
);

await EliteProTech.relayMessage(m.chat, generatedMessage.message, {
	messageId: generatedMessage.key.id,
});