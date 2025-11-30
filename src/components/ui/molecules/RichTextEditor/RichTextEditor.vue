<script setup lang="ts">
import { EditorContent } from '@tiptap/vue-3'
import { BubbleMenu, FloatingMenu } from '@tiptap/vue-3/menus'
import { computed } from 'vue'
import { useRichTextEditor } from './useRichTextEditor'
import BubbleMenuButtons from './BubbleMenuButtons.vue'
import FloatingMenuButtons from './FloatingMenuButtons.vue'
import type { MentionUser } from './suggestions'

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  valid?: boolean
  minHeight?: string
  mentionUsers?: MentionUser[]
  ticketId?: string
  collaborativeEnabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  minHeight: '200px',
  mentionUsers: () => [],
  collaborativeEnabled: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
}>()

const {
  editor: editorRef,
  activeStates,
  commands,
} = useRichTextEditor({
  modelValue: computed(() => props.modelValue),
  placeholder: computed(() => props.placeholder),
  disabled: computed(() => props.disabled),
  mentionUsers: computed(() => props.mentionUsers),
  ticketId: computed(() => props.ticketId),
  collaborativeEnabled: computed(() => props.collaborativeEnabled),
  onUpdate: (html) => {
    emit('update:modelValue', html)
  },
  onBlur: (event) => {
    emit('blur', event)
  },
})

const editor = computed(() => editorRef.value ?? undefined)
</script>

<template>
  <div
    :class="[
      'rich-text-editor-wrapper',
      'w-full rounded-lg border transition-colors',
      invalid
        ? 'border-error-500 focus-within:border-error-500 focus-within:ring-error-500'
        : 'border-none',
      disabled ? 'bg-neutral-100 cursor-not-allowed' : 'bg-transparent',
    ]"
  >
    <EditorContent :editor="editor" :style="{ minHeight }" />

    <BubbleMenu
      v-if="editor"
      :editor="editor"
      :options="{ placement: 'top' }"
      class="bubble-menu-wrapper"
    >
      <BubbleMenuButtons :active-states="activeStates" :commands="commands" />
    </BubbleMenu>

    <FloatingMenu
      v-if="editor"
      :editor="editor"
      :options="{ placement: 'bottom' }"
      class="floating-menu-wrapper"
    >
      <FloatingMenuButtons :active-states="activeStates" :commands="commands" />
    </FloatingMenu>
  </div>
</template>

<style scoped>
@reference "../../../../style.css";

:deep(.tiptap) {
  padding: 12px;
  min-height: v-bind(minHeight);
  outline: none;
}

.rich-text-editor-wrapper button {
  @apply focus-visible:outline-none;
}

.rich-text-editor-wrapper :deep(.tiptap) {
  @apply text-sm text-neutral-900;
  line-height: 1.6;
  @apply outline-none;
}

.rich-text-editor-wrapper :deep(.tiptap:focus) {
  @apply outline-none;
}

.rich-text-editor-wrapper :deep(.tiptap p.is-editor-empty:first-child::before) {
  @apply text-neutral-400;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* Paragraphs */
.rich-text-editor-wrapper :deep(.tiptap p) {
  @apply text-base leading-relaxed text-neutral-800;
  margin: 0.75em 0;
}

.rich-text-editor-wrapper :deep(.tiptap p:first-child) {
  margin-top: 0;
}

.rich-text-editor-wrapper :deep(.tiptap p:last-child) {
  margin-bottom: 0;
}

/* Text formatting */
.rich-text-editor-wrapper :deep(.tiptap strong) {
  @apply font-semibold text-neutral-900;
}

.rich-text-editor-wrapper :deep(.tiptap em) {
  @apply italic;
}

.rich-text-editor-wrapper :deep(.tiptap s) {
  @apply line-through text-neutral-600;
}

/* Headings */
.rich-text-editor-wrapper :deep(.tiptap h1) {
  @apply text-3xl font-bold text-neutral-900;
  line-height: 1.3;
  margin: 1.5em 0 0.5em 0;
  letter-spacing: -0.02em;
}

.rich-text-editor-wrapper :deep(.tiptap h1:first-child) {
  margin-top: 0;
}

.rich-text-editor-wrapper :deep(.tiptap h2) {
  @apply text-2xl font-bold text-neutral-900;
  line-height: 1.3;
  margin: 1.25em 0 0.5em 0;
  letter-spacing: -0.01em;
}

.rich-text-editor-wrapper :deep(.tiptap h2:first-child) {
  margin-top: 0;
}

.rich-text-editor-wrapper :deep(.tiptap h3) {
  @apply text-xl font-semibold text-neutral-900;
  line-height: 1.4;
  margin: 1em 0 0.5em 0;
}

.rich-text-editor-wrapper :deep(.tiptap h3:first-child) {
  margin-top: 0;
}

/* Lists */
.rich-text-editor-wrapper :deep(.tiptap ul),
.rich-text-editor-wrapper :deep(.tiptap ol) {
  @apply text-neutral-800;
  padding-left: 1.75em;
  margin: 1em 0;
}

.rich-text-editor-wrapper :deep(.tiptap ul) {
  list-style-type: disc;
}

.rich-text-editor-wrapper :deep(.tiptap ol) {
  list-style-type: decimal;
}

.rich-text-editor-wrapper :deep(.tiptap li) {
  @apply leading-relaxed;
  margin: 0.375em 0;
  padding-left: 0.25em;
}

.rich-text-editor-wrapper :deep(.tiptap li p) {
  margin: 0.25em 0;
}

.rich-text-editor-wrapper :deep(.tiptap ul ul),
.rich-text-editor-wrapper :deep(.tiptap ul ol),
.rich-text-editor-wrapper :deep(.tiptap ol ul),
.rich-text-editor-wrapper :deep(.tiptap ol ol) {
  margin: 0.5em 0;
}

/* Task List */
.rich-text-editor-wrapper :deep(.tiptap ul[data-type='taskList']) {
  list-style-type: none;
  padding-left: 0;
  margin: 1em 0;
}

.rich-text-editor-wrapper :deep(.tiptap ul[data-type='taskList'] li) {
  @apply flex items-start gap-2;
  margin: 0.5em 0;
  padding-left: 0;
}

.rich-text-editor-wrapper :deep(.tiptap ul[data-type='taskList'] li > label) {
  @apply flex items-start;
  flex-shrink: 0;
  margin-top: 0.35em;
  user-select: none;
}

.rich-text-editor-wrapper
  :deep(.tiptap ul[data-type='taskList'] li > label > input[type='checkbox']) {
  @apply w-4 h-4 rounded border-2 border-neutral-300;
  @apply cursor-pointer transition-all duration-150;
  @apply focus:ring-1 focus:ring-primary-500 focus:ring-offset-1;
  appearance: none;
  background-color: white;
  position: relative;
  flex-shrink: 0;
}

.rich-text-editor-wrapper
  :deep(.tiptap ul[data-type='taskList'] > label > input[type='checkbox']:hover) {
  @apply border-primary-400;
}

.rich-text-editor-wrapper
  :deep(.tiptap ul[data-type='taskList'] li > label > input[type='checkbox']:checked) {
  @apply bg-primary-600 border-primary-600;
}

.rich-text-editor-wrapper
  :deep(.tiptap ul[data-type='taskList'] li > label > input[type='checkbox']:checked::after) {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40%;
  height: 60%;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: translate(-50%, -60%) rotate(45deg);
}

.rich-text-editor-wrapper :deep(.tiptap ul[data-type='taskList'] > div) {
  flex: 1;
  min-width: 0;
}

.rich-text-editor-wrapper :deep(.tiptap ul[data-type='taskList'] > div > p) {
  margin: 0;
  line-height: 1.5;
}

.rich-text-editor-wrapper :deep(.tiptap ul[data-type='taskList'] li[data-checked='true'] > div) {
  @apply text-neutral-500;
  text-decoration: line-through;
}

.rich-text-editor-wrapper :deep(.tiptap ul[data-type='taskList'] ul[data-type='taskList']) {
  padding-left: 1.5em;
  margin: 0.25em 0;
}

/* Blockquote */
.rich-text-editor-wrapper :deep(.tiptap blockquote) {
  @apply border-l-[3px] border-neutral-400 pl-4 pr-4 py-2 my-4;
  @apply bg-neutral-50 text-neutral-700;
  font-style: normal;
  border-radius: 0 4px 4px 0;
}

.rich-text-editor-wrapper :deep(.tiptap blockquote p) {
  @apply text-neutral-700;
  font-style: italic;
  margin: 0.5em 0;
}

.rich-text-editor-wrapper :deep(.tiptap blockquote p:first-child) {
  margin-top: 0;
}

.rich-text-editor-wrapper :deep(.tiptap blockquote p:last-child) {
  margin-bottom: 0;
}

/* Code */
.rich-text-editor-wrapper :deep(.tiptap code) {
  @apply bg-red-50 text-red-700 px-1.5 py-0.5 rounded text-sm;
  font-family: 'SF Mono', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
  font-weight: 500;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.rich-text-editor-wrapper :deep(.tiptap pre) {
  @apply bg-neutral-900 text-neutral-100 p-4 rounded-lg my-4 overflow-x-auto;
  font-family: 'SF Mono', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.7;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.rich-text-editor-wrapper :deep(.tiptap pre code) {
  @apply bg-transparent text-neutral-100 p-0 border-0;
  font-size: inherit;
}

/* Horizontal Rule */
.rich-text-editor-wrapper :deep(.tiptap hr) {
  @apply border-0 border-t-2 border-neutral-200 my-8;
  background: none;
}

/* Images */
.rich-text-editor-wrapper :deep(.tiptap img) {
  @apply rounded-lg my-4;
  max-width: 100%;
  height: auto;
  display: block;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.rich-text-editor-wrapper :deep(.tiptap img:hover) {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.1);
  border-color: rgba(0, 0, 0, 0.1);
}

.rich-text-editor-wrapper :deep(.tiptap img.ProseMirror-selectednode) {
  @apply ring-1 ring-primary-500;
  outline: none;
}

/* Resizable Image Wrapper */
.rich-text-editor-wrapper :deep(.tiptap [data-resize-wrapper]) {
  position: relative;
  display: inline-block;
  max-width: min(100%, 1200px);
  max-height: 1200px;
  margin: 1em 0;
}

.rich-text-editor-wrapper :deep(.tiptap [data-resize-state='true'] [data-resize-wrapper]) {
  outline: 1px solid rgba(59, 130, 246, 0.5);
  border-radius: 0.125rem;
}

.rich-text-editor-wrapper :deep(.tiptap [data-resize-wrapper] img) {
  display: block;
  width: 100%;
  height: auto;
  margin: 0;
}

/* Resize Handles */
.rich-text-editor-wrapper :deep(.tiptap [data-resize-handle]) {
  position: absolute;
  background: rgba(59, 130, 246, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 2px;
  z-index: 10;
  transition: background 0.2s ease;
}

.rich-text-editor-wrapper :deep(.tiptap [data-resize-handle]:hover) {
  background: rgba(59, 130, 246, 1);
}

/* Corner handles */
.rich-text-editor-wrapper :deep(.tiptap [data-resize-handle='top-left']),
.rich-text-editor-wrapper :deep(.tiptap [data-resize-handle='top-right']),
.rich-text-editor-wrapper :deep(.tiptap [data-resize-handle='bottom-left']),
.rich-text-editor-wrapper :deep(.tiptap [data-resize-handle='bottom-right']) {
  width: 8px;
  height: 8px;
}

.rich-text-editor-wrapper :deep(.tiptap [data-resize-handle='top-left']) {
  top: -4px;
  left: -4px;
  cursor: nwse-resize;
}

.rich-text-editor-wrapper :deep(.tiptap [data-resize-handle='top-right']) {
  top: -4px;
  right: -4px;
  cursor: nesw-resize;
}

.rich-text-editor-wrapper :deep(.tiptap [data-resize-handle='bottom-left']) {
  bottom: -4px;
  left: -4px;
  cursor: nesw-resize;
}

.rich-text-editor-wrapper :deep(.tiptap [data-resize-handle='bottom-right']) {
  bottom: -4px;
  right: -4px;
  cursor: nwse-resize;
}

/* Edge handles */
.rich-text-editor-wrapper :deep(.tiptap [data-resize-handle='top']),
.rich-text-editor-wrapper :deep(.tiptap [data-resize-handle='bottom']) {
  height: 6px;
  left: 8px;
  right: 8px;
}

.rich-text-editor-wrapper :deep(.tiptap [data-resize-handle='top']) {
  top: -3px;
  cursor: ns-resize;
}

.rich-text-editor-wrapper :deep(.tiptap [data-resize-handle='bottom']) {
  bottom: -3px;
  cursor: ns-resize;
}

.rich-text-editor-wrapper :deep(.tiptap [data-resize-handle='left']),
.rich-text-editor-wrapper :deep(.tiptap [data-resize-handle='right']) {
  width: 6px;
  top: 8px;
  bottom: 8px;
}

.rich-text-editor-wrapper :deep(.tiptap [data-resize-handle='left']) {
  left: -3px;
  cursor: ew-resize;
}

.rich-text-editor-wrapper :deep(.tiptap [data-resize-handle='right']) {
  right: -3px;
  cursor: ew-resize;
}

/* Links */
.rich-text-editor-wrapper :deep(.tiptap a) {
  @apply text-primary-600 underline cursor-pointer;
  text-decoration-color: rgba(59, 130, 246, 0.4);
  text-underline-offset: 2px;
  transition: all 0.2s ease;
}

.rich-text-editor-wrapper :deep(.tiptap a:hover) {
  @apply text-primary-700;
  text-decoration-color: rgba(59, 130, 246, 0.8);
}

/* Mentions */
.rich-text-editor-wrapper :deep(.tiptap .mention) {
  @apply bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded font-medium;
  @apply cursor-pointer transition-colors;
  text-decoration: none;
}

.rich-text-editor-wrapper :deep(.tiptap .mention:hover) {
  @apply bg-primary-200 text-primary-800;
}

/* Selection */
.rich-text-editor-wrapper :deep(.tiptap ::selection) {
  @apply bg-primary-100;
}

/* Collaboration Caret Styles */
.rich-text-editor-wrapper :deep(.tiptap .collaboration-carets__caret) {
  @apply border-l border-r border-neutral-900;
  @apply -ml-px -mr-px pointer-events-none relative;
  @apply animate-in fade-in;
  word-break: normal;
}

.rich-text-editor-wrapper :deep(.tiptap .collaboration-carets__label) {
  @apply rounded-sm rounded-tl-none text-xs font-semibold text-neutral-900;
  @apply px-1.5 py-0.5 absolute -top-[1.4em] -left-px;
  @apply select-none whitespace-nowrap;
  @apply animate-in fade-in;
  font-style: normal;
  line-height: normal;
  pointer-events: none;
}

/* Bubble Menu Styles */
.bubble-menu-wrapper {
  @apply z-50 animate-in fade-in zoom-in duration-200;
}

/* Floating Menu Styles */
.floating-menu-wrapper {
  @apply z-9999 animate-in fade-in zoom-in duration-200;
}
</style>
