<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
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
  Undo,
  Redo,
} from 'lucide-vue-next'

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  valid?: boolean
  minHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  minHeight: '200px',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
}>()

const editor = useEditor({
  content: props.modelValue || '',
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: props.placeholder || 'Enter text...',
    }),
  ],
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
    if (editor.value && editor.value.getHTML() !== value) {
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
const insertHorizontalRule = () => editor.value?.chain().focus().setHorizontalRule().run()
const undo = () => editor.value?.chain().focus().undo().run()
const redo = () => editor.value?.chain().focus().redo().run()
</script>

<template>
  <div
    :class="[
      'rich-text-editor-wrapper',
      'w-full rounded-lg border transition-colors focus-within:ring-2',
      invalid
        ? 'border-error-500 focus-within:border-error-500 focus-within:ring-error-500'
        : valid
          ? 'border-success-500 focus-within:border-success-500 focus-within:ring-success-500'
          : 'border-neutral-300 focus-within:border-primary-500 focus-within:ring-primary-500',
      disabled ? 'bg-neutral-100 cursor-not-allowed' : 'bg-white',
    ]"
  >
    <!-- Toolbar -->
    <div
      v-if="!disabled && editor"
      class="flex items-center gap-1 p-2 border-b border-neutral-200 flex-wrap"
    >
      <!-- Text formatting -->
      <div class="flex items-center gap-1 pr-2 border-r border-neutral-200">
        <button
          type="button"
          :class="[
            'p-1.5 rounded hover:bg-neutral-100 transition-colors',
            isBold ? 'bg-primary-100 text-primary-700' : 'text-neutral-600',
          ]"
          @click="toggleBold"
          title="Bold (Ctrl+B)"
        >
          <Bold class="size-4" />
        </button>
        <button
          type="button"
          :class="[
            'p-1.5 rounded hover:bg-neutral-100 transition-colors',
            isItalic ? 'bg-primary-100 text-primary-700' : 'text-neutral-600',
          ]"
          @click="toggleItalic"
          title="Italic (Ctrl+I)"
        >
          <Italic class="size-4" />
        </button>
        <button
          type="button"
          :class="[
            'p-1.5 rounded hover:bg-neutral-100 transition-colors',
            isStrike ? 'bg-primary-100 text-primary-700' : 'text-neutral-600',
          ]"
          @click="toggleStrike"
          title="Strikethrough"
        >
          <Strikethrough class="size-4" />
        </button>
      </div>

      <!-- Headings -->
      <div class="flex items-center gap-1 pr-2 border-r border-neutral-200">
        <button
          type="button"
          :class="[
            'p-1.5 rounded hover:bg-neutral-100 transition-colors',
            isHeading1 ? 'bg-primary-100 text-primary-700' : 'text-neutral-600',
          ]"
          @click="toggleHeading1"
          title="Heading 1"
        >
          <Heading1 class="size-4" />
        </button>
        <button
          type="button"
          :class="[
            'p-1.5 rounded hover:bg-neutral-100 transition-colors',
            isHeading2 ? 'bg-primary-100 text-primary-700' : 'text-neutral-600',
          ]"
          @click="toggleHeading2"
          title="Heading 2"
        >
          <Heading2 class="size-4" />
        </button>
        <button
          type="button"
          :class="[
            'p-1.5 rounded hover:bg-neutral-100 transition-colors',
            isHeading3 ? 'bg-primary-100 text-primary-700' : 'text-neutral-600',
          ]"
          @click="toggleHeading3"
          title="Heading 3"
        >
          <Heading3 class="size-4" />
        </button>
      </div>

      <!-- Lists -->
      <div class="flex items-center gap-1 pr-2 border-r border-neutral-200">
        <button
          type="button"
          :class="[
            'p-1.5 rounded hover:bg-neutral-100 transition-colors',
            isBulletList ? 'bg-primary-100 text-primary-700' : 'text-neutral-600',
          ]"
          @click="toggleBulletList"
          title="Bullet List"
        >
          <List class="size-4" />
        </button>
        <button
          type="button"
          :class="[
            'p-1.5 rounded hover:bg-neutral-100 transition-colors',
            isOrderedList ? 'bg-primary-100 text-primary-700' : 'text-neutral-600',
          ]"
          @click="toggleOrderedList"
          title="Numbered List"
        >
          <ListOrdered class="size-4" />
        </button>
      </div>

      <!-- Other formatting -->
      <div class="flex items-center gap-1 pr-2 border-r border-neutral-200">
        <button
          type="button"
          :class="[
            'p-1.5 rounded hover:bg-neutral-100 transition-colors',
            isBlockquote ? 'bg-primary-100 text-primary-700' : 'text-neutral-600',
          ]"
          @click="toggleBlockquote"
          title="Quote"
        >
          <Quote class="size-4" />
        </button>
        <button
          type="button"
          :class="[
            'p-1.5 rounded hover:bg-neutral-100 transition-colors',
            isCode ? 'bg-primary-100 text-primary-700' : 'text-neutral-600',
          ]"
          @click="toggleCode"
          title="Inline Code"
        >
          <Code class="size-4" />
        </button>
        <button
          type="button"
          :class="[
            'p-1.5 rounded hover:bg-neutral-100 transition-colors',
            isCodeBlock ? 'bg-primary-100 text-primary-700' : 'text-neutral-600',
          ]"
          @click="toggleCodeBlock"
          title="Code Block"
        >
          <Code class="size-4" />
        </button>
        <button
          type="button"
          class="p-1.5 rounded hover:bg-neutral-100 transition-colors text-neutral-600"
          @click="insertHorizontalRule"
          title="Horizontal Rule"
        >
          <Minus class="size-4" />
        </button>
      </div>

      <!-- Undo/Redo -->
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="p-1.5 rounded hover:bg-neutral-100 transition-colors text-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!editor?.can().undo()"
          @click="undo"
          title="Undo (Ctrl+Z)"
        >
          <Undo class="size-4" />
        </button>
        <button
          type="button"
          class="p-1.5 rounded hover:bg-neutral-100 transition-colors text-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!editor?.can().redo()"
          @click="redo"
          title="Redo (Ctrl+Y)"
        >
          <Redo class="size-4" />
        </button>
      </div>
    </div>

    <!-- Editor content -->
    <EditorContent :editor="editor" :style="{ minHeight }" />
  </div>
</template>

<style scoped>
:deep(.tiptap) {
  padding: 12px;
  min-height: v-bind(minHeight);
  outline: none;
}

.rich-text-editor-wrapper button {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1;
}
</style>
