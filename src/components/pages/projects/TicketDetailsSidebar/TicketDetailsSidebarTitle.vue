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
    preview-class="flex text-3xl font-bold! w-full flex-1 px-0! leading-tight!"
    input-class="text-3xl relative block font-bold! w-full focus:ring-0! focus:ring-offset-0! px-0! bg-transparent! font-bold leading-tight!"
    root-class="w-full flex-1 animate-in fade-in duration-300 py-0! font-bold! leading-tight! min-w-0 block"
    text-area
  />
</template>
