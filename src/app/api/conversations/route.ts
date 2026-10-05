import { NextResponse } from 'next/server';
import { deleteConversation, getConversation, listConversations } from '@/lib/conversations/repository';
import { jsonError } from '@/lib/http';

export const runtime = 'nodejs';

export async function GET(req: Request) {
	try {
		const id = new URL(req.url).searchParams.get('id');

		if (id) {
			const conversation = await getConversation(id);
			return NextResponse.json(conversation);
		}

		const conversations = await listConversations();
		return NextResponse.json({ conversations });
	} catch (error) {
		const message = error instanceof Error ? error.message : '';
		const status = message.includes('not found') ? 404 : 500;
		return jsonError(error, status);
	}
}

export async function DELETE(req: Request) {
	try {
		const id = new URL(req.url).searchParams.get('id');
		if (!id) {
			return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
		}

		await deleteConversation(id);
		return NextResponse.json({ success: true });
	} catch (error) {
		return jsonError(error);
	}
}
