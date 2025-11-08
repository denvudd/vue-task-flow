<script setup lang="ts">
import { Toast } from '@/components/ui'
import { toaster } from '@/composables/useToast'
</script>

<template>
  <router-view />
  <Toast :toaster="toaster" />
</template>

<style scoped></style>
