<script setup lang="ts">
import { ref, computed, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import {
  Dialog,
  Field,
  FieldInput,
  TicketStatusSelect,
  TicketPrioritySelect,
  TicketTypeSelect,
  Button,
} from '@/components/ui'
import { createTicketSchema } from '@/validation/projects'
import { TICKET_STATUSES, TICKET_PRIORITIES, TICKET_TYPES } from '@/constants/tickets'
import { useCreateTicket } from '@/composables/useTickets'
import { useAuth } from '@/composables/useAuth'
import { Plus } from 'lucide-vue-next'
import { useUpsertTicketDocument } from '@/composables/useTicketDocumens'
import { Buffer } from 'buffer'
import { ROUTES } from '@/lib/routing'
import type { Tables } from '@/types/supabase'

interface Props {
  tickets: Tables<'tickets'>[]
  projectId?: string
}

const props = defineProps<Props>()
const route = useRoute()
const router = useRouter()

const projectId = computed(() => {
  return props.projectId || (route.params.id as string)
})

const { user } = useAuth()
const { mutateAsync: createTicket, isPending: isSubmitting } = useCreateTicket()
const { mutateAsync: upsertTicketDocument, isPending: isUpserting } = useUpsertTicketDocument()

const isOpen = ref(false)

const { handleSubmit, errors, defineField, resetForm } = useForm({
  validationSchema: toTypedSchema(createTicketSchema),
  validateOnMount: false,
})

const [createTitle, createTitleAttrs] = defineField('title')
const [createStatus, createStatusAttrs] = defineField('status')
const [createPriority, createPriorityAttrs] = defineField('priority')
const [createType, createTypeAttrs] = defineField('type')
const [createDueDate, createDueDateAttrs] = defineField('due_date') as [
  Ref<string | undefined>,
  any,
]

const handleSubmitForm = handleSubmit(async (values) => {
  if (!user.value) {
    console.error('User not authenticated')
    return
  }

  try {
    const maxOrderIndex =
      props.tickets && props.tickets.length > 0
        ? Math.max(...props.tickets.map((t) => t.order_index ?? 0))
        : -1
    const newOrderIndex = maxOrderIndex + 1

    const ticketBody = {
      title: values.title,
      status: values.status || TICKET_STATUSES.TODO,
      priority: values.priority || TICKET_PRIORITIES.MEDIUM,
      type: values.type || TICKET_TYPES.TASK,
      due_date: values.due_date ? new Date(values.due_date).toISOString() : null,
      project_id: projectId.value,
      creator_id: user.value.id,
      order_index: newOrderIndex,
    }

    const ticket = await createTicket(ticketBody)

    // TODO: handle default editor description to work and sync with ydoc
    // const DEFAULT_PROJECT_DESCRIPTION =
    //   '\x415350386d614346436741424151646b5a575a686457783041514152682f795a6f49554b41414d4a63474679595764795958426f522f795a6f49554b41414d48614756685a476c755a7763412f4a6d6768516f54426751412f4a6d6768516f5545465268633273675a47567a59334a70634852706232346f4150795a6f49554b457756735a585a6c62414639415163412f4a6d6768516f53426751412f4a6d6768516f6d4e46427962335a705a4755675957346762335a6c636e5a705a586367623259676447686c49485268633273675957356b49484a6c624746305a5751675a47563059576c73637936422f4a6d6768516f53415948386d614346436c7342414172482f4a6d67685170622f4a6d67685170634177646f5a57466b6157356e427744386d614346436d6347424144386d614346436d674a553356694c5852686332747a4b4144386d614346436d6346624756325a577742665147482f4a6d676851706341776c7759584a685a334a6863476a482f4a6d676851706e2f4a6d67685170634177683059584e7254476c7a644163412f4a6d67685170304177683059584e725358526c625163412f4a6d676851703141776c7759584a685a334a686347676f4150795a6f49554b6451646a6147566a6132566b41586b484150795a6f49554b646759454150795a6f49554b654156556279316b623466386d614346436e5544434852686332744a64475674427744386d614346436e344443584268636d466e636d4677614367412f4a6d676851702b42324e6f5a574e725a575142655163412f4a6d676851702f426751412f4a6d676851714241514a55623448386d614346436f4d42416f54386d614346436f55424179316b623466386d614346436e3444434852686332744a64475674427744386d614346436f6b4241776c7759584a685a334a686347676f4150795a6f49554b695145485932686c5932746c5a414635427744386d614346436f6f42426751412f4a6d676851714d415156556279316b627748386d61434643674d41456c734d68414543'

    // const buffer = Buffer.from(DEFAULT_PROJECT_DESCRIPTION)

    // const base64Content = buffer.toString('base64')

    // await upsertTicketDocument({
    //   ticket_id: ticket.id,
    //   ydoc_state: DEFAULT_PROJECT_DESCRIPTION,
    //   updated_at: new Date().toISOString(),
    // })

    handleSuccess()
    router.push({
      query: {
        ticket: ticket.id,
      },
    })
  } catch (err) {
    console.error('Error creating ticket:', err)
  }
})

const handleCancel = () => {
  isOpen.value = false
  resetForm()
}

const handleSuccess = () => {
  isOpen.value = false
  resetForm()
}

const open = () => {
  isOpen.value = true
}
</script>

<template>
  <div>
    <slot name="trigger" :open="open">
      <Button size="sm" @click="open">
        <Plus class="w-4 h-4 mr-1" />
        New
      </Button>
    </slot>

    <Dialog v-model:open="isOpen" size="lg">
      <template #title>New ticket</template>
      <template #description>Fill in the details to create a new ticket</template>

      <form @submit.prevent="handleSubmitForm" class="space-y-4">
        <Field label="Title" required :invalid="!!errors.title">
          <FieldInput
            v-model="createTitle"
            v-bind="createTitleAttrs"
            placeholder="Enter ticket title"
            :invalid="!!errors.title"
          />
          <template #errorText>{{ errors.title }}</template>
        </Field>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Status" :invalid="!!errors.status">
            <TicketStatusSelect
              :value="createStatus"
              :invalid="!!errors.status"
              @update:value="(val) => (createStatus = val || undefined)"
            />
            <template #errorText>{{ errors.status }}</template>
          </Field>

          <Field label="Priority" :invalid="!!errors.priority">
            <TicketPrioritySelect
              :value="createPriority"
              :invalid="!!errors.priority"
              @update:value="(val) => (createPriority = val || undefined)"
            />
            <template #errorText>{{ errors.priority }}</template>
          </Field>

          <Field label="Type" :invalid="!!errors.type">
            <TicketTypeSelect
              :value="createType"
              :invalid="!!errors.type"
              @update:value="(val) => (createType = val || undefined)"
            />
            <template #errorText>{{ errors.type }}</template>
          </Field>
        </div>

        <Field label="Due Date" :invalid="!!errors.due_date">
          <FieldInput
            v-model="createDueDate"
            v-bind="createDueDateAttrs"
            type="date"
            :invalid="!!errors.due_date"
          />
          <template #errorText>{{ errors.due_date }}</template>
        </Field>
      </form>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button variant="outline" @click="handleCancel"> Cancel </Button>
          <Button type="submit" @click="handleSubmitForm" :disabled="isSubmitting">
            {{ isSubmitting ? 'Creating...' : 'Create Ticket' }}
          </Button>
        </div>
      </template>
    </Dialog>
  </div>
</template>
