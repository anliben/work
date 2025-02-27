export default {
	async fetch(request, env) {
		const { pathname } = new URL(request.url);

		switch (pathname) {
			case '/create':
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
				break;
			case '/list':
				try {
					const response = await getFingerprintData(env)
					if (response.success) {
						return new Response(JSON.stringify(response.data), {
							headers: {
								'content-type': 'application/json;charset=UTF-8'
							}
						})
					} else {
						throw new Error("Erro ao buscar fingerprints");
					}
				} catch (error) {
					return new Response(JSON.stringify({
						success: false,
						message: 'Erro ao buscar fingerprints',
						error: error.message
					}), {
						status: 500,
						headers: {
							'content-type': 'application/json;charset=UTF-8'
						}
					})
				}
				break;
			default:
				return new Response(JSON.stringify({
					message: 'Protegido por Cloudflare',
				}), {
					status: 200,
					headers: {
						'content-type': 'application/json;charset=UTF-8'
					}
				})
				break;
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

async function getFingerprintData(env, query = "SELECT * FROM example") {
	try {
		const db = await env.DB.prepare(query);
		const result = await db.all();
		return {
			success: true,
			data: result
		};
	} catch (error) {
		return {
			success: false,
			error: error.message
		};
	}
}
