// addEventListener('fetch', event => {
//     event.respondWith(handleRequest(event.request))
// })

export default {
	async fetch(request, env) {
		const { pathname } = new URL(request.url);
		console.log(pathname);


		try {
			const headers = Object.fromEntries(request.headers.entries());
			const fingerprint = await getFingerprint(headers)
	
			await saveToFingerprintDb(fingerprint, env)
	
			return new Response(JSON.stringify({
				success: true,
				message: 'Fingerprint registrado com sucesso',
				fingerprintId: fingerprint.fingerprint_id
			}), {
				headers: {
					'content-type': 'application/json;charset=UTF-8'
				}
			})
		} catch (error) {
			console.error('Erro:', error)
			return new Response(JSON.stringify({
				success: false,
				message: 'Erro ao registrar fingerprint',
				error: error.message
			}), {
				status: 500,
				headers: {
					'content-type': 'application/json;charset=UTF-8'
				}
			})
		}
	}
}

async function getFingerprint(request) {
	const fingerprint = {
		fingerprint_id: crypto.randomUUID(),
		browser_type: request['user-agent'],
		os: request['sec-ch-ua-platform'],
		host: request['host'],
		language: request['accept-language'],
		timezone_offset: new Date().getTimezoneOffset()
	}

	return fingerprint
}

async function saveToFingerprintDb(fingerprint, env) {
	const db = await env.DB.prepare(`
        INSERT INTO example (
            fingerprint_id,
            browser_type,
            os,
            host,
            language,
            timezone_offset
        ) VALUES (?, ?, ?, ?, ?, ?)
    `)

	await db.bind(
		fingerprint.fingerprint_id,
		fingerprint.browser_type,
		fingerprint.os,
		fingerprint.host,
		fingerprint.language,
		fingerprint.timezone_offset
	).run()

	return true
}
