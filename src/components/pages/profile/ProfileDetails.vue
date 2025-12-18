<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { Card } from '@/components/ui'

const { user, profile, loading } = useAuth()
</script>

<template>
  <Card>
    <div class="space-y-4">
      <div class="flex items-center gap-1.5">
        <h3 class="text-xl font-semibold text-neutral-900">Your Profile</h3>
        <div
          :class="[
            'rounded-md px-2 text-xs font-medium text-white p-0.5',
            {
              'bg-success-500': user?.email_confirmed_at,
              'bg-error-500': !user?.email_confirmed_at,
            },
          ]"
        >
          {{ user?.email_confirmed_at ? 'Verified' : 'Unverified' }}
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium text-neutral-700">Email</label>
          <p class="text-neutral-900">{{ user?.email }}</p>
        </div>

        <div>
          <label class="text-sm font-medium text-neutral-700">Username</label>
          <p class="text-neutral-900">{{ profile?.username || 'Not set' }}</p>
        </div>

        <div>
          <label class="text-sm font-medium text-neutral-700">Full Name</label>
          <p class="text-neutral-900">{{ profile?.full_name || 'Not set' }}</p>
        </div>

        <div>
          <label class="text-sm font-medium text-neutral-700">Member Since</label>
          <p class="text-neutral-900">
            {{
              profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'
            }}
          </p>
        </div>
      </div>
    </div>
  </Card>
</template>
