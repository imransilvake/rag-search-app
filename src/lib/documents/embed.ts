import { EMBEDDING_MODEL, getOpenAI } from '@/lib/openai/client';

/** Max strings per embeddings.create call (payload / rate-limit safety). */
const EMBED_BATCH_SIZE = 64;

/** Embed many strings in batched API calls; preserves input order. */
export async function embedTexts(inputs: string[]): Promise<number[][]> {
	if (inputs.length === 0) return [];

	const openai = getOpenAI();
	const embeddings: number[][] = [];

	for (let start = 0; start < inputs.length; start += EMBED_BATCH_SIZE) {
		const batch = inputs.slice(start, start + EMBED_BATCH_SIZE);
		const response = await openai.embeddings.create({
			model: EMBEDDING_MODEL,
			input: batch
		});

		const byIndex = new Map(response.data.map((item) => [item.index, item.embedding]));
		for (let i = 0; i < batch.length; i++) {
			const embedding = byIndex.get(i);
			if (!embedding) {
				throw new Error(`Missing embedding for batch item ${start + i}`);
			}
			embeddings.push(embedding);
		}
	}

	return embeddings;
}

/** Embed a single string with the same model used for query + ingest. */
export async function embedText(input: string): Promise<number[]> {
	const [embedding] = await embedTexts([input]);
	return embedding;
}
