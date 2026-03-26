<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth.store';

const authStore = useAuthStore();

onMounted(() => {
  // try to restore session on app load
  if (authStore.accessToken) {
    authStore.fetchProfile();
  }
});
</script>
