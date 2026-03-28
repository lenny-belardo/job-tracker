<template>
    <div class="flex min-h-screen bg-gray-50">
        <AppSidebar />

        <div class="flex-1 flex flex-col">
            <AppHeader />

            <main class="flex-1 p-6">
                <router-view />
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import AppHeader from './AppHeader.vue';
import AppSidebar from './AppSidebar.vue';
</script>
