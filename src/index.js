addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
	console.log('request: ', request);

	return new Response(JSON.stringify(request), {
		headers: {
			'content-type': 'application/json;charset=UTF-8'
		}
	})
    try {
		
        // Coletar informações do navegador
        const fingerprint = await getFingerprint(request)
        
        // Salvar no banco de dados
        const response = await saveToFingerprintDb(fingerprint)
        
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

async function getFingerprint(request) {
    const fingerprint = {
        fingerprint_id: crypto.randomUUID(),
        browser_type: request.headers.get('User-Agent'),
        os: getOSFromUA(request.headers.get('User-Agent')),
        screen_resolution: `${screen.width}x${screen.height}`,
        device_memory: navigator.deviceMemory || null,
        hardware_concurrency: navigator.hardwareConcurrency || null,
        timezone_offset: new Date().getTimezoneOffset()
    }
    
    return fingerprint
}

async function saveToFingerprintDb(fingerprint) {
    const db = await D1DATABASE.prepare(`
        INSERT INTO fingerprints (
            fingerprint_id,
            browser_type,
            os,
            screen_resolution,
            device_memory,
            hardware_concurrency,
            timezone_offset
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    
    await db.bind(
        fingerprint.fingerprint_id,
        fingerprint.browser_type,
        fingerprint.os,
        fingerprint.screen_resolution,
        fingerprint.device_memory,
        fingerprint.hardware_concurrency,
        fingerprint.timezone_offset
    ).run()
    
    return true
}

function getOSFromUA(userAgent) {
    if (/Windows/.test(userAgent)) return 'Windows'
    if (/Mac OS X/.test(userAgent)) return 'macOS'
    if (/Linux/.test(userAgent)) return 'Linux'
    if (/Android/.test(userAgent)) return 'Android'
    return 'Outro'
}