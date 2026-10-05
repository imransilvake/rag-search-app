import { NextResponse } from 'next/server';

export const jsonError = (error: unknown, status = 500) => {
	const message = error instanceof Error ? error.message : 'Unexpected error';
	return NextResponse.json({ error: message, success: false }, { status });
};
