<template>
    <div v-if="message" class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
        <p class="text-sm">
            {{ message }}
        </p>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    message?: string | null;
}>();
</script>
