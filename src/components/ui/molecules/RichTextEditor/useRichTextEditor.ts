import { useEditor, type Editor } from '@tiptap/vue-3'
import { watch, onBeforeUnmount, computed, type Ref, type MaybeRef, toValue } from 'vue'
import { buildEditorExtensions } from './editorExtensions'
import { useCollaboration } from './useCollaboration'
import { useAuth } from '@/composables/useAuth'
import uniqolor from 'uniqolor'
import type { MentionUser } from './suggestions'

interface UseRichTextEditorOptions {
  modelValue?: MaybeRef<string | undefined>
  placeholder?: MaybeRef<string | undefined>
  disabled?: MaybeRef<boolean | undefined>
  mentionUsers?: MaybeRef<MentionUser[] | undefined>
  ticketId?: MaybeRef<string | undefined>
  collaborativeEnabled?: MaybeRef<boolean | undefined>
  onUpdate?: (html: string) => void
  onBlur?: (event: FocusEvent) => void
}

export function useRichTextEditor(options: UseRichTextEditorOptions) {
  const ticketId = toValue(options.ticketId)
  const collaborativeEnabled = toValue(options.collaborativeEnabled) ?? true

  const { profile, user } = useAuth()

  const userName = computed(() => {
    if (profile.value?.full_name) {
      return profile.value.full_name
    }
    if (profile.value?.username) {
      return profile.value.username
    }
    if (user.value?.email) {
      return user.value.email.split('@')[0]
    }
    return user.value?.id || 'Anonymous'
  })

  const userColor = computed(() => {
    if (user.value?.id) {
      return uniqolor(user.value.id).color
    }

    return '#0d0d0d'
  })

  const collaboration = collaborativeEnabled && ticketId ? useCollaboration(ticketId) : undefined

  const editor = useEditor({
    // Don't set initial content when using collaboration (Yjs will sync it)
    // The Collaboration extension will automatically load content from Y.Doc
    content: collaboration ? undefined : toValue(options.modelValue) || '',
    extensions: buildEditorExtensions({
      placeholder: toValue(options.placeholder) || 'Enter text...',
      mentionUsers: toValue(options.mentionUsers) || [],
      ydoc: collaboration?.ydoc,
      provider: collaboration?.provider,
      userName: userName.value,
      userColor: userColor.value,
    }),
    editable: !toValue(options.disabled),
    onUpdate: ({ editor }) => {
      options.onUpdate?.(editor.getHTML())
    },
    onBlur: ({ event }) => {
      options.onBlur?.(event as FocusEvent)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
      },
    },
  })

  // Note: When collaborative editing is enabled, we should not update content
  // via setContent as Yjs handles synchronization automatically
  watch(
    () => toValue(options.modelValue),
    (value) => {
      if (collaboration) {
        return
      }

      const isSame = editor.value?.getHTML() === value
      const isFocused = editor.value?.isFocused

      if (editor.value && !isSame && !isFocused) {
        editor.value.commands.setContent(value || '')
      }
    },
  )

  watch(
    () => toValue(options.disabled),
    (disabled) => {
      if (editor.value) {
        editor.value.setEditable(!disabled)
      }
    },
  )

  onBeforeUnmount(() => {
    editor.value?.destroy()
  })

  const activeStates = computed(() => ({
    isBold: editor.value?.isActive('bold') ?? false,
    isItalic: editor.value?.isActive('italic') ?? false,
    isStrike: editor.value?.isActive('strike') ?? false,
    isHeading1: editor.value?.isActive('heading', { level: 1 }) ?? false,
    isHeading2: editor.value?.isActive('heading', { level: 2 }) ?? false,
    isHeading3: editor.value?.isActive('heading', { level: 3 }) ?? false,
    isBulletList: editor.value?.isActive('bulletList') ?? false,
    isOrderedList: editor.value?.isActive('orderedList') ?? false,
    isBlockquote: editor.value?.isActive('blockquote') ?? false,
    isCode: editor.value?.isActive('code') ?? false,
    isCodeBlock: editor.value?.isActive('codeBlock') ?? false,
    isTaskList: editor.value?.isActive('taskList') ?? false,
  }))

  const commands = {
    toggleBold: () => editor.value?.chain().focus().toggleBold().run(),
    toggleItalic: () => editor.value?.chain().focus().toggleItalic().run(),
    toggleStrike: () => editor.value?.chain().focus().toggleStrike().run(),
    toggleHeading1: () => editor.value?.chain().focus().toggleHeading({ level: 1 }).run(),
    toggleHeading2: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run(),
    toggleHeading3: () => editor.value?.chain().focus().toggleHeading({ level: 3 }).run(),
    toggleBulletList: () => editor.value?.chain().focus().toggleBulletList().run(),
    toggleOrderedList: () => editor.value?.chain().focus().toggleOrderedList().run(),
    toggleBlockquote: () => editor.value?.chain().focus().toggleBlockquote().run(),
    toggleCode: () => editor.value?.chain().focus().toggleCode().run(),
    toggleCodeBlock: () => editor.value?.chain().focus().toggleCodeBlock().run(),
    toggleTaskList: () => editor.value?.chain().focus().toggleTaskList().run(),
    insertHorizontalRule: () => editor.value?.chain().focus().setHorizontalRule().run(),
    addImage: () => {
      const url = window.prompt('Enter image URL:')
      if (url) {
        editor.value?.chain().focus().setImage({ src: url }).run()
      }
    },
  }

  return {
    editor: editor as Ref<Editor | null>,
    activeStates,
    commands,
  }
}
