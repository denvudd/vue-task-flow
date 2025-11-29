<script setup lang="ts">
import { useEditor, EditorContent, VueRenderer } from '@tiptap/vue-3'
import { BubbleMenu, FloatingMenu } from '@tiptap/vue-3/menus'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Image from '@tiptap/extension-image'
import Mention from '@tiptap/extension-mention'
import { watch, onBeforeUnmount, computed } from 'vue'
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
  Minus,
  CheckSquare,
  ImageIcon,
} from 'lucide-vue-next'
import { generateMentionSuggestions, type MentionUser } from './suggestions'

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  valid?: boolean
  minHeight?: string
  mentionUsers?: MentionUser[]
}

const props = withDefaults(defineProps<Props>(), {
  minHeight: '200px',
  mentionUsers: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
}>()

// Build extensions array
const buildExtensions = () => {
  const extensions: any[] = [
    StarterKit,
    Placeholder.configure({
      placeholder: props.placeholder || 'Enter text...',
    }),
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Image.configure({
      inline: false,
      allowBase64: true,
      resize: {
        enabled: true,
        directions: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        minWidth: 100,
        minHeight: 100,
        alwaysPreserveAspectRatio: true,
      },
      HTMLAttributes: {
        style: 'max-width: 1200px; max-height: 1200px;',
      },
    }),
    Mention.configure({
      HTMLAttributes: {
        class: 'mention',
      },
      renderLabel({ node }) {
        return `@${node.attrs.label ?? node.attrs.id}`
      },
      suggestion: generateMentionSuggestions(props.mentionUsers),
    }),
  ]

  return extensions
}

const editor = useEditor({
  content: props.modelValue || '',
  extensions: buildExtensions(),
  editable: !props.disabled,
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
  onBlur: ({ event }) => {
    emit('blur', event as FocusEvent)
  },
  editorProps: {
    attributes: {
      class: 'prose prose-sm max-w-none focus:outline-none',
    },
  },
})

watch(
  () => props.modelValue,
  (value) => {
    const isSame = editor.value?.getHTML() === value
    const isFocused = editor.value?.isFocused

    // Don't update if content is the same or editor is focused (being edited)
    if (editor.value && !isSame && !isFocused) {
      editor.value.commands.setContent(value || '')
    }
  },
)

watch(
  () => props.disabled,
  (disabled) => {
    if (editor.value) {
      editor.value.setEditable(!disabled)
    }
  },
)

watch(
  () => props.placeholder,
  (placeholder) => {
    if (editor.value) {
      const placeholderExtension = editor.value.extensionManager.extensions.find(
        (ext) => ext.name === 'placeholder',
      )
      if (placeholderExtension) {
        editor.value.extensionManager.extensions = editor.value.extensionManager.extensions.map(
          (ext) =>
            ext.name === 'placeholder'
              ? Placeholder.configure({ placeholder: placeholder || 'Enter text...' })
              : ext,
        )
      }
    }
  },
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})

const isBold = computed(() => editor.value?.isActive('bold') ?? false)
const isItalic = computed(() => editor.value?.isActive('italic') ?? false)
const isStrike = computed(() => editor.value?.isActive('strike') ?? false)
const isHeading1 = computed(() => editor.value?.isActive('heading', { level: 1 }) ?? false)
const isHeading2 = computed(() => editor.value?.isActive('heading', { level: 2 }) ?? false)
const isHeading3 = computed(() => editor.value?.isActive('heading', { level: 3 }) ?? false)
const isBulletList = computed(() => editor.value?.isActive('bulletList') ?? false)
const isOrderedList = computed(() => editor.value?.isActive('orderedList') ?? false)
const isBlockquote = computed(() => editor.value?.isActive('blockquote') ?? false)
const isCode = computed(() => editor.value?.isActive('code') ?? false)
const isCodeBlock = computed(() => editor.value?.isActive('codeBlock') ?? false)
const isTaskList = computed(() => editor.value?.isActive('taskList') ?? false)

const toggleBold = () => editor.value?.chain().focus().toggleBold().run()
const toggleItalic = () => editor.value?.chain().focus().toggleItalic().run()
const toggleStrike = () => editor.value?.chain().focus().toggleStrike().run()
const toggleHeading1 = () => editor.value?.chain().focus().toggleHeading({ level: 1 }).run()
const toggleHeading2 = () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run()
const toggleHeading3 = () => editor.value?.chain().focus().toggleHeading({ level: 3 }).run()
const toggleBulletList = () => editor.value?.chain().focus().toggleBulletList().run()
const toggleOrderedList = () => editor.value?.chain().focus().toggleOrderedList().run()
const toggleBlockquote = () => editor.value?.chain().focus().toggleBlockquote().run()
const toggleCode = () => editor.value?.chain().focus().toggleCode().run()
const toggleCodeBlock = () => editor.value?.chain().focus().toggleCodeBlock().run()
const toggleTaskList = () => editor.value?.chain().focus().toggleTaskList().run()
const insertHorizontalRule = () => editor.value?.chain().focus().setHorizontalRule().run()
const addImage = () => {
  const url = window.prompt('Enter image URL:')
  if (url) {
    editor.value?.chain().focus().setImage({ src: url }).run()
  }
}
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
      <div class="bubble-menu-content">
        <button
          @click="toggleBold"
          :class="['menu-button', { 'is-active': isBold }]"
          type="button"
          title="Bold"
        >
          <Bold :size="16" />
        </button>

        <button
          @click="toggleItalic"
          :class="['menu-button', { 'is-active': isItalic }]"
          type="button"
          title="Italic"
        >
          <Italic :size="16" />
        </button>

        <button
          @click="toggleStrike"
          :class="['menu-button', { 'is-active': isStrike }]"
          type="button"
          title="Strikethrough"
        >
          <Strikethrough :size="16" />
        </button>

        <div class="menu-divider"></div>

        <button
          @click="toggleHeading1"
          :class="['menu-button', { 'is-active': isHeading1 }]"
          type="button"
          title="Heading 1"
        >
          <Heading1 :size="16" />
        </button>

        <button
          @click="toggleHeading2"
          :class="['menu-button', { 'is-active': isHeading2 }]"
          type="button"
          title="Heading 2"
        >
          <Heading2 :size="16" />
        </button>

        <button
          @click="toggleHeading3"
          :class="['menu-button', { 'is-active': isHeading3 }]"
          type="button"
          title="Heading 3"
        >
          <Heading3 :size="16" />
        </button>

        <div class="menu-divider"></div>

        <button
          @click="toggleBulletList"
          :class="['menu-button', { 'is-active': isBulletList }]"
          type="button"
          title="Bullet List"
        >
          <List :size="16" />
        </button>

        <button
          @click="toggleOrderedList"
          :class="['menu-button', { 'is-active': isOrderedList }]"
          type="button"
          title="Ordered List"
        >
          <ListOrdered :size="16" />
        </button>

        <button
          @click="toggleBlockquote"
          :class="['menu-button', { 'is-active': isBlockquote }]"
          type="button"
          title="Quote"
        >
          <Quote :size="16" />
        </button>

        <button
          @click="toggleCode"
          :class="['menu-button', { 'is-active': isCode }]"
          type="button"
          title="Code"
        >
          <Code :size="16" />
        </button>
      </div>
    </BubbleMenu>

    <FloatingMenu
      v-if="editor"
      :editor="editor"
      :options="{ placement: 'bottom' }"
      class="floating-menu-wrapper"
    >
      <div class="floating-menu-content">
        <button
          @click="toggleHeading1"
          :class="['floating-menu-button', { 'is-active': isHeading1 }]"
          type="button"
          title="Heading 1"
        >
          <Heading1 :size="18" />
          <span class="button-label">Heading 1</span>
        </button>

        <button
          @click="toggleHeading2"
          :class="['floating-menu-button', { 'is-active': isHeading2 }]"
          type="button"
          title="Heading 2"
        >
          <Heading2 :size="18" />
          <span class="button-label">Heading 2</span>
        </button>

        <button
          @click="toggleHeading3"
          :class="['floating-menu-button', { 'is-active': isHeading3 }]"
          type="button"
          title="Heading 3"
        >
          <Heading3 :size="18" />
          <span class="button-label">Heading 3</span>
        </button>

        <div class="menu-divider"></div>

        <button
          @click="toggleBulletList"
          :class="['floating-menu-button', { 'is-active': isBulletList }]"
          type="button"
          title="Bullet List"
        >
          <List :size="18" />
          <span class="button-label">Bullet List</span>
        </button>

        <button
          @click="toggleOrderedList"
          :class="['floating-menu-button', { 'is-active': isOrderedList }]"
          type="button"
          title="Ordered List"
        >
          <ListOrdered :size="18" />
          <span class="button-label">Numbered List</span>
        </button>

        <button
          @click="toggleBlockquote"
          :class="['floating-menu-button', { 'is-active': isBlockquote }]"
          type="button"
          title="Quote"
        >
          <Quote :size="18" />
          <span class="button-label">Quote</span>
        </button>

        <button
          @click="toggleCodeBlock"
          :class="['floating-menu-button', { 'is-active': isCodeBlock }]"
          type="button"
          title="Code Block"
        >
          <Code :size="18" />
          <span class="button-label">Code Block</span>
        </button>

        <div class="menu-divider"></div>

        <button
          @click="insertHorizontalRule"
          class="floating-menu-button"
          type="button"
          title="Horizontal Rule"
        >
          <Minus :size="18" />
          <span class="button-label">Divider</span>
        </button>

        <button
          @click="toggleTaskList"
          :class="['floating-menu-button', { 'is-active': isTaskList }]"
          type="button"
          title="Task List"
        >
          <CheckSquare :size="18" />
          <span class="button-label">Task List</span>
        </button>

        <button @click="addImage" class="floating-menu-button" type="button" title="Image">
          <ImageIcon :size="18" />
          <span class="button-label">Image</span>
        </button>
      </div>
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

/* Bubble Menu Styles */
.bubble-menu-wrapper {
  @apply z-50 animate-in fade-in zoom-in duration-200;
}

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

/* Floating Menu Styles */
.floating-menu-wrapper {
  @apply z-9999 animate-in fade-in zoom-in duration-200;
}

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
