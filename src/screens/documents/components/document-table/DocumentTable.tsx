import { Button } from '@/atoms/button/Button';
import { formatDate } from '@/utils/format-date';
import { formatFileSize } from '@/utils/format-file-size';
import { formatFileType } from '@/utils/format-file-type';
import type { IDocumentTableProps } from './types';

export const DocumentTable = ({ documents, deletingId, onOpen, onDelete }: IDocumentTableProps) => (
	<div className="overflow-hidden rounded-md border border-border bg-surface-panel shadow-sm">
		<div className="overflow-x-auto">
			<table className="min-w-full divide-y divide-border">
				<thead className="bg-accent">
					<tr>
						{['File Name', 'Type', 'Size', 'Chunks', 'Upload Date', 'Actions'].map((label) => (
							<th key={label} className="label-3-sb px-lg py-md text-left tracking-wider text-overcast uppercase">
								{label}
							</th>
						))}
					</tr>
				</thead>
				<tbody className="divide-y divide-border">
					{documents.map((document) => {
						const isPdf = document.file_name.toLowerCase().endsWith('.pdf');
						return (
							<tr key={document.id} className="hover:bg-accent">
								<td className="max-w-md px-lg py-md text-midnight">
									<div className="label-2-m break-words">{document.file_name}</div>
									{document.summary ? <p className="label-3 mt-xs line-clamp-2 font-normal text-overcast">{document.summary}</p> : null}
								</td>
								<td className="px-lg py-md">
									<span className="label-3-sb rounded-full bg-secondary px-sm py-xxs whitespace-nowrap text-secondary-foreground">
										{formatFileType(document.file_type, document.file_name)}
									</span>
								</td>
								<td className="label-2 px-lg py-md whitespace-nowrap text-overcast">{formatFileSize(document.file_size)}</td>
								<td className="label-2 px-lg py-md whitespace-nowrap text-overcast">{document.total_chunks}</td>
								<td className="label-2 px-lg py-md whitespace-nowrap text-overcast">{formatDate(document.upload_date)}</td>
								<td className="px-lg py-md">
									<div className="flex items-center gap-md whitespace-nowrap">
										<Button variant="link" size="sm" onClick={() => onOpen(document, isPdf)}>
											{isPdf ? 'Preview' : 'View'}
										</Button>
										{!isPdf && (document.file_url || document.file_path) && (
											<a
												href={document.file_url || `/api/documents?id=${document.id}&file=true`}
												download={document.file_name}
												className="label-3-m text-success hover:underline"
												target="_blank"
												rel="noopener noreferrer">
												Download
											</a>
										)}
										<Button variant="destructive" size="sm" onClick={() => onDelete(document.id, document.file_name)} disabled={deletingId === document.id}>
											{deletingId === document.id ? 'Deleting…' : 'Delete'}
										</Button>
									</div>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	</div>
);
