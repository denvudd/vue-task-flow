import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Image from '@tiptap/extension-image'
import Mention from '@tiptap/extension-mention'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import type { MentionUser } from './suggestions'
import { generateMentionSuggestions } from './suggestions'
import type * as Y from 'yjs'
import type { HocuspocusProvider } from '@hocuspocus/provider'
import type { AnyExtension } from '@tiptap/core'

interface BuildEditorExtensionsOptions {
  placeholder: string
  mentionUsers: MentionUser[]
  ydoc?: Y.Doc
  provider?: HocuspocusProvider
  userName?: string
  userColor?: string
}

export const buildEditorExtensions = ({
  placeholder,
  mentionUsers,
  ydoc,
  provider,
  userName,
  userColor,
}: BuildEditorExtensionsOptions): AnyExtension[] => {
  const isCollaborative = !!ydoc && !!provider

  const extensions: AnyExtension[] = [
    StarterKit,
    Placeholder.configure({
      placeholder: placeholder || 'Enter text...',
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
      suggestion: generateMentionSuggestions(mentionUsers),
    }),
  ]

  // Add collaboration extensions if collaborative editing is enabled
  // Note: Collaboration extension automatically replaces History extension from StarterKit
  if (isCollaborative && ydoc && provider) {
    extensions.push(
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCaret.configure({
        provider,
        user: {
          name: userName || 'Anonymous',
          color: userColor || '#0d0d0d',
        },
        selectionRender: (user) => {
          return {
            nodeName: 'span',
            class: 'collaboration-carets__selection',
            style: `background-color: ${user.color}`,
            'data-user': user.name,
          }
        },
        render: (user) => {
          const cursor = document.createElement('span')
          cursor.classList.add('collaboration-carets__caret')
          cursor.setAttribute('style', `border-color: ${user.color}`)

          const label = document.createElement('div')
          label.classList.add('collaboration-carets__label')
          label.setAttribute('style', `background-color: ${user.color}`)
          label.insertBefore(document.createTextNode(user.name), null)

          cursor.insertBefore(label, null)
          return cursor
        },
      }),
    )
  }

  return extensions
}
