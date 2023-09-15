import { createApp } from 'vue'

import secrets from './secrets'
import spotify from './apiCalls/spotify'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')

async function getProfile() {
    const accessToken = await spotify.getAccessToken(secrets.clientId, secrets.redirectUri)
    const profile = await spotify.getProfile(accessToken)
    console.log(profile)
}
getProfile()