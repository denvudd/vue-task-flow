<script setup lang="ts">
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  CheckSquare,
  ImageIcon,
} from 'lucide-vue-next'

interface Props {
  activeStates: {
    isHeading1: boolean
    isHeading2: boolean
    isHeading3: boolean
    isBulletList: boolean
    isOrderedList: boolean
    isBlockquote: boolean
    isCodeBlock: boolean
    isTaskList: boolean
  }
  commands: {
    toggleHeading1: () => void
    toggleHeading2: () => void
    toggleHeading3: () => void
    toggleBulletList: () => void
    toggleOrderedList: () => void
    toggleBlockquote: () => void
    toggleCodeBlock: () => void
    insertHorizontalRule: () => void
    toggleTaskList: () => void
    addImage: () => void
  }
}

defineProps<Props>()
</script>

<template>
  <div class="floating-menu-content">
    <button
      @click="commands.toggleHeading1"
      :class="['floating-menu-button', { 'is-active': activeStates.isHeading1 }]"
      type="button"
      title="Heading 1"
    >
      <Heading1 :size="18" />
      <span class="button-label">Heading 1</span>
    </button>

    <button
      @click="commands.toggleHeading2"
      :class="['floating-menu-button', { 'is-active': activeStates.isHeading2 }]"
      type="button"
      title="Heading 2"
    >
      <Heading2 :size="18" />
      <span class="button-label">Heading 2</span>
    </button>

    <button
      @click="commands.toggleHeading3"
      :class="['floating-menu-button', { 'is-active': activeStates.isHeading3 }]"
      type="button"
      title="Heading 3"
    >
      <Heading3 :size="18" />
      <span class="button-label">Heading 3</span>
    </button>

    <div class="menu-divider"></div>

    <button
      @click="commands.toggleBulletList"
      :class="['floating-menu-button', { 'is-active': activeStates.isBulletList }]"
      type="button"
      title="Bullet List"
    >
      <List :size="18" />
      <span class="button-label">Bullet List</span>
    </button>

    <button
      @click="commands.toggleOrderedList"
      :class="['floating-menu-button', { 'is-active': activeStates.isOrderedList }]"
      type="button"
      title="Ordered List"
    >
      <ListOrdered :size="18" />
      <span class="button-label">Numbered List</span>
    </button>

    <button
      @click="commands.toggleBlockquote"
      :class="['floating-menu-button', { 'is-active': activeStates.isBlockquote }]"
      type="button"
      title="Quote"
    >
      <Quote :size="18" />
      <span class="button-label">Quote</span>
    </button>

    <button
      @click="commands.toggleCodeBlock"
      :class="['floating-menu-button', { 'is-active': activeStates.isCodeBlock }]"
      type="button"
      title="Code Block"
    >
      <Code :size="18" />
      <span class="button-label">Code Block</span>
    </button>

    <div class="menu-divider"></div>

    <button
      @click="commands.insertHorizontalRule"
      class="floating-menu-button"
      type="button"
      title="Horizontal Rule"
    >
      <Minus :size="18" />
      <span class="button-label">Divider</span>
    </button>

    <button
      @click="commands.toggleTaskList"
      :class="['floating-menu-button', { 'is-active': activeStates.isTaskList }]"
      type="button"
      title="Task List"
    >
      <CheckSquare :size="18" />
      <span class="button-label">Task List</span>
    </button>

    <button @click="commands.addImage" class="floating-menu-button" type="button" title="Image">
      <ImageIcon :size="18" />
      <span class="button-label">Image</span>
    </button>
  </div>
</template>

<style scoped>
@reference "../../../../style.css";

.floating-menu-content {
  @apply flex flex-col gap-0.5 bg-white rounded-lg shadow-lg border border-neutral-200 p-1;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.1);
  min-width: 200px;
}

.floating-menu-content .floating-menu-button {
  @apply flex items-center gap-3 px-3 py-2 rounded-md;
  @apply text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900;
  @apply transition-all duration-150 ease-in-out;
  @apply focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 focus-visible:ring-offset-1;
  cursor: pointer;
  text-align: left;
}

.floating-menu-content .floating-menu-button .button-label {
  @apply text-sm font-medium;
}

.floating-menu-content .floating-menu-button.is-active {
  @apply bg-primary-50 text-primary-700;
}

.floating-menu-content .floating-menu-button.is-active:hover {
  @apply bg-primary-100 text-primary-800;
}

.floating-menu-content .floating-menu-button:active {
  @apply scale-[0.98];
}

.floating-menu-content .menu-divider {
  @apply h-px w-full bg-neutral-200 my-0.5;
}
</style>
