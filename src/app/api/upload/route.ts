import { NextResponse } from 'next/server';
import { ingestUploadedFile } from '@/lib/documents/ingest';
import { jsonError } from '@/lib/http';

export const runtime = 'nodejs';

export async function POST(req: Request) {
	try {
		const formData = await req.formData();
		const file = formData.get('file');

		if (!(file instanceof File)) {
			return NextResponse.json({ error: 'No file provided', success: false }, { status: 400 });
		}

		const result = await ingestUploadedFile(file);
		return NextResponse.json({ success: true, ...result });
	} catch (error) {
		const message = error instanceof Error ? error.message : '';
		const status = message.includes('Unsupported file') || message.includes('Could not extract') ? 400 : 500;
		return jsonError(error, status);
	}
}
