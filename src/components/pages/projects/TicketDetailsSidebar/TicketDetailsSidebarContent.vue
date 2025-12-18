<script setup lang="ts">
import { Field, RichTextEditor } from '@/components/ui'
import { useI18n } from 'vue-i18n'
import { useTicketDetails } from '@/composables/useTicketDetails'

const { description, mentionUsers, currentTicketId, setLocalDescription, updateTicketField } =
  useTicketDetails()
const { t } = useI18n()

const handleDescriptionChange = (value: string) => {
  setLocalDescription(value)
}

const handleDescriptionBlur = async () => {
  await updateTicketField({ description: description.value || null })
}
</script>

<template>
  <div class="space-y-6">
    <Field>
      <RichTextEditor
        :model-value="description"
        @update:model-value="handleDescriptionChange"
        @blur="handleDescriptionBlur"
        :placeholder="t('ticketDetails.content.placeholder')"
        min-height="200px"
        :mention-users="mentionUsers"
        :ticket-id="currentTicketId ?? ''"
        :collaborative-enabled="true"
      />
    </Field>
  </div>
</template>
