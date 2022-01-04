import { CloudinaryFolder } from '../enums'

export function extractPublicId(url: string, folder?: CloudinaryFolder): string {
	const id = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'))
	return folder ? `${folder}/${id}` : id
}
