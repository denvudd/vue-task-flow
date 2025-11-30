<script setup lang="ts">
import { Editable } from '@/components/ui'
import { useTicketDetails } from '@/composables/useTicketDetails'

const { title, setLocalTitle, updateTicketField } = useTicketDetails()

const handleTitleCommit = async (details: { value: string }) => {
  setLocalTitle(details.value)
  await updateTicketField({ title: details.value })
}
</script>

<template>
  <Editable
    :value="title"
    placeholder="Enter ticket title"
    @value-commit="handleTitleCommit"
    :with-controls="false"
    preview-class="text-3xl font-semibold w-full flex-1 h-12"
    input-class="text-3xl font-semibold w-full flex-1 h-12"
    root-class="w-full flex-1 animate-in fade-in duration-300"
  />
</template>
