<script>
import HelloWorld from './components/HelloWorld.vue'
import secrets from './secrets'
import spotify from './apiCalls/spotify';

export default {
    data: () => ({
        clientId: secrets.clientId,
        redirectURi: secrets.redirectUri
    }),
    components: {
        HelloWorld
    },
    methods: {
        userAuthorisation: spotify.userAuthorisation,
        print() {
            console.log(this.clientId),
            console.log(this.redirectURi)
        }
    }
}
</script>

<template>
<HelloWorld />
<button @click="userAuthorisation(clientId, redirectURi)">Click me to authorise</button>
</template>

<style>

</style>
