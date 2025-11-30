<script setup lang="ts">
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
} from 'lucide-vue-next'

interface Props {
  activeStates: {
    isBold: boolean
    isItalic: boolean
    isStrike: boolean
    isHeading1: boolean
    isHeading2: boolean
    isHeading3: boolean
    isBulletList: boolean
    isOrderedList: boolean
    isBlockquote: boolean
    isCode: boolean
  }
  commands: {
    toggleBold: () => void
    toggleItalic: () => void
    toggleStrike: () => void
    toggleHeading1: () => void
    toggleHeading2: () => void
    toggleHeading3: () => void
    toggleBulletList: () => void
    toggleOrderedList: () => void
    toggleBlockquote: () => void
    toggleCode: () => void
  }
}

defineProps<Props>()
</script>

<template>
  <div class="bubble-menu-content">
    <button
      @click="commands.toggleBold"
      :class="['menu-button', { 'is-active': activeStates.isBold }]"
      type="button"
      title="Bold"
    >
      <Bold :size="16" />
    </button>

    <button
      @click="commands.toggleItalic"
      :class="['menu-button', { 'is-active': activeStates.isItalic }]"
      type="button"
      title="Italic"
    >
      <Italic :size="16" />
    </button>

    <button
      @click="commands.toggleStrike"
      :class="['menu-button', { 'is-active': activeStates.isStrike }]"
      type="button"
      title="Strikethrough"
    >
      <Strikethrough :size="16" />
    </button>

    <div class="menu-divider"></div>

    <button
      @click="commands.toggleHeading1"
      :class="['menu-button', { 'is-active': activeStates.isHeading1 }]"
      type="button"
      title="Heading 1"
    >
      <Heading1 :size="16" />
    </button>

    <button
      @click="commands.toggleHeading2"
      :class="['menu-button', { 'is-active': activeStates.isHeading2 }]"
      type="button"
      title="Heading 2"
    >
      <Heading2 :size="16" />
    </button>

    <button
      @click="commands.toggleHeading3"
      :class="['menu-button', { 'is-active': activeStates.isHeading3 }]"
      type="button"
      title="Heading 3"
    >
      <Heading3 :size="16" />
    </button>

    <div class="menu-divider"></div>

    <button
      @click="commands.toggleBulletList"
      :class="['menu-button', { 'is-active': activeStates.isBulletList }]"
      type="button"
      title="Bullet List"
    >
      <List :size="16" />
    </button>

    <button
      @click="commands.toggleOrderedList"
      :class="['menu-button', { 'is-active': activeStates.isOrderedList }]"
      type="button"
      title="Ordered List"
    >
      <ListOrdered :size="16" />
    </button>

    <button
      @click="commands.toggleBlockquote"
      :class="['menu-button', { 'is-active': activeStates.isBlockquote }]"
      type="button"
      title="Quote"
    >
      <Quote :size="16" />
    </button>

    <button
      @click="commands.toggleCode"
      :class="['menu-button', { 'is-active': activeStates.isCode }]"
      type="button"
      title="Code"
    >
      <Code :size="16" />
    </button>
  </div>
</template>

<style scoped>
@reference "../../../../style.css";

.bubble-menu-content {
  @apply flex items-center gap-0.5 bg-white rounded-lg shadow-lg border border-neutral-200 p-1;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

.bubble-menu-content .menu-button {
  @apply flex items-center justify-center w-8 h-8 rounded-md;
  @apply text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900;
  @apply transition-all duration-150 ease-in-out;
  @apply focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 focus-visible:ring-offset-1;
  cursor: pointer;
}

.bubble-menu-content .menu-button.is-active {
  @apply bg-primary-100 text-primary-700;
}

.bubble-menu-content .menu-button.is-active:hover {
  @apply bg-primary-200 text-primary-800;
}

.bubble-menu-content .menu-button:active {
  @apply scale-95;
}

.bubble-menu-content .menu-divider {
  @apply w-px h-6 bg-neutral-200 mx-0.5;
}
</style>
