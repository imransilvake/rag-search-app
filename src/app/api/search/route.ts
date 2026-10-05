import { NextResponse } from 'next/server';
import { getConversation, persistSearchTurn } from '@/lib/conversations/repository';
import { chatWithDocuments, type ChatHistoryMessage } from '@/lib/rag/chat';
import { jsonError } from '@/lib/http';

export const runtime = 'nodejs';

export async function POST(req: Request) {
	try {
		const body = (await req.json()) as {
			query?: unknown;
			conversationId?: unknown;
		};

		if (typeof body.query !== 'string') {
			return NextResponse.json({ error: 'Query is required' }, { status: 400 });
		}

		const conversationId = typeof body.conversationId === 'string' ? body.conversationId : null;

		let history: ChatHistoryMessage[] = [];
		if (conversationId) {
			const conversation = await getConversation(conversationId);
			history = conversation.messages.map((message) => ({
				role: message.role,
				content: message.content
			}));
		}

		const result = await chatWithDocuments({
			query: body.query,
			history
		});

		const savedConversationId = await persistSearchTurn({
			conversationId,
			query: body.query.trim(),
			answer: result.answer,
			sources: result.sources
		});

		return NextResponse.json({
			...result,
			conversationId: savedConversationId
		});
	} catch (error) {
		return jsonError(error);
	}
}
