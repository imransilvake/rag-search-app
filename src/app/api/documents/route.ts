import { NextResponse } from 'next/server';
import { deleteDocument, downloadStoredFile, getDocumentDetail, getDocumentMetadata, listDocuments } from '@/lib/documents/repository';
import { jsonError } from '@/lib/http';

export const runtime = 'nodejs';

const handleFileResponse = async (documentId: string, viewInline: boolean) => {
	const meta = await getDocumentMetadata(documentId);
	const fileName = meta.file_name || 'document';
	const fileType = meta.file_type || 'application/octet-stream';
	const filePath = meta.file_path || `${documentId}.${fileName.split('.').pop() || 'pdf'}`;

	const blob = await downloadStoredFile(filePath);
	const buffer = Buffer.from(await blob.arrayBuffer());

	if (buffer.length === 0) {
		return NextResponse.json({ error: 'File is empty' }, { status: 500 });
	}

	const isPdf = fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
	const disposition = viewInline && isPdf ? `inline; filename="${fileName}"` : `attachment; filename="${fileName}"`;

	return new NextResponse(new Uint8Array(buffer), {
		headers: {
			'Content-Type': fileType,
			'Content-Disposition': disposition,
			'Content-Length': buffer.length.toString(),
			...(viewInline && isPdf ? { 'X-Content-Type-Options': 'nosniff' } : {})
		}
	});
};

export const GET = async (request: Request) => {
	try {
		const url = new URL(request.url);
		const id = url.searchParams.get('id');
		const wantsFile = url.searchParams.get('file') === 'true';
		const viewInline = url.searchParams.get('view') === 'true';

		if (id && wantsFile) {
			return await handleFileResponse(id, viewInline);
		}

		if (id) {
			const detail = await getDocumentDetail(id);
			return NextResponse.json(detail);
		}

		const documents = await listDocuments();
		return NextResponse.json({ documents });
	} catch (error) {
		const message = error instanceof Error ? error.message : '';
		const status = message.includes('not found') || message.includes('not stored') ? 404 : 500;
		return jsonError(error, status);
	}
};

export const DELETE = async (request: Request) => {
	try {
		const id = new URL(request.url).searchParams.get('id');
		if (!id) {
			return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
		}

		const result = await deleteDocument(id);
		return NextResponse.json({ success: true, ...result });
	} catch (error) {
		return jsonError(error);
	}
};
