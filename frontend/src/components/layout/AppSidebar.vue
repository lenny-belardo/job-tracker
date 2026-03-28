<template>
    <aside class="w-64 bg-white border-r border-gray-200 min-h-screen">
        <nav class="p-4 space-y-2">
            <router-link
                to="/"
                class="block px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                :class="{ 'bg-primary-50 text-primary-700': $route.path === '/' }"
            >
                📊 Dashboard
            </router-link>

            <router-link
                to="/companies"
                class="block px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                :class="{ 'bg-primary-50 text-primary-700': $route.path === '/companies' }"
            >
                🏢 Companies
            </router-link>

            <router-link
                to="/applications"
                class="block px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                :class="{ 'bg-primary-50 text-primary-700': $route.path === '/applications' }"
            >
                📝 Applications
            </router-link>
        </nav>
    </aside>
</template>
