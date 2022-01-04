interface RequestOptions {
	url: string
	method: 'GET' | 'POST' | 'DELETE'
	body?: { [key: string]: any } | FormData
}

interface FetchOptions {
	method: string
	headers?: {
		[key: string]: string
	}
	body?: string | FormData
	credentials?: RequestCredentials
}

export default async (opts: RequestOptions) => {
	let fetchOpts: FetchOptions = { method: opts.method }

	if (opts.body instanceof FormData) {
		fetchOpts.body = opts.body
	} else if (opts.body) {
		fetchOpts.body = JSON.stringify(opts.body)
	}

	return fetch(opts.url, fetchOpts).then((res) => {
		let result: Promise<any> | Error

		try {
			result = res.json()
		} catch (e: any) {
			result = new Error('Request Failed to Parse')
		}

		return Promise.resolve(result)
	})
}
