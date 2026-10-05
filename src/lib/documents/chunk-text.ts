import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { getEncoding } from 'js-tiktoken';

/** Token-based defaults (~512 tokens with ~12.5% overlap). */
const DEFAULT_CHUNK_SIZE = 512;
const DEFAULT_CHUNK_OVERLAP = 64;

const encoding = getEncoding('cl100k_base');

export async function chunkText(text: string, options?: { chunkSize?: number; chunkOverlap?: number }): Promise<string[]> {
	const splitter = new RecursiveCharacterTextSplitter({
		chunkSize: options?.chunkSize ?? DEFAULT_CHUNK_SIZE,
		chunkOverlap: options?.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP,
		lengthFunction: (value) => encoding.encode(value).length
	});
	return splitter.splitText(text);
}
