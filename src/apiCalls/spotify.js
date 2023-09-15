function generateRandomString(length) {
    let text = ''
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}

async function generateCodeChallenge(codeVerifier) {
    const base64encode = (string) => btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')

    const encoder = new TextEncoder()
    const data = encoder.encode(codeVerifier)
    const digest = await window.crypto.subtle.digest('SHA-256', data)

    return base64encode(digest)
}

async function userAuthorisation(clientId, redirectUri) {
    const codeVerifier = generateRandomString(128)
    const codeChallenge = await generateCodeChallenge(codeVerifier)

    let state = generateRandomString(16)
    let scope = 'user-read-private user-read-email playlist-read-private'
    localStorage.setItem('code_verifier', codeVerifier)

    let args = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        scope: scope,
        redirect_uri: redirectUri,
        state: state,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge
    });

    window.location = 'https://accounts.spotify.com/authorize?' + args;
}

/**
 * called on every page load
 * needs to get code if the user if redirected from the auth
 */
async function getAccessToken(clientId, redirectUri) {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.size) return
    let code = urlParams.get('code');

    const codeVerifier = localStorage.getItem('code_verifier');

    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier
    });

    return fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('HTTP status ' + response.status)
            }
            return response.json()
        })
        .then(data => {
            localStorage.setItem('access_token', data.access_token)
            return data.access_token
        })
        .catch(error => {
            console.error('Error:', error)
        });
}

async function getProfile(accessToken) {
    accessToken = accessToken || localStorage.getItem('access_token');
    let response = null

    try {
        response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: 'Bearer ' + accessToken
            }
        });
    } catch (e) {
        console.log(e)
    }

    return response.json()
}

export default {
    userAuthorisation,
    getAccessToken,
    getProfile
}