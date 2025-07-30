<template>
  <v-app>
    <router-view :key="$route.fullPath" />
  </v-app>
</template>

<!-- <script setup>
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
if (route.path === '/') {
  router.replace('/home')
}
</script> -->
<style>
body {
  font-family: 'Zen Old Mincho', serif;
}
</style>
