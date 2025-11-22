/* eslint-disable @typescript-eslint/no-explicit-any */
import { VueRenderer } from '@tiptap/vue-3'

import MentionList from './MentionList.vue'

export interface MentionUser {
  id: string
  name: string
  avatar?: string | null
}

export const generateMentionSuggestions = (mentionUsers: MentionUser[]) => ({
  items: ({ query }: { query: string }) => {
    return mentionUsers
      .filter((user) => user.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .map((user) => ({
        id: user.id,
        label: user.name,
        avatar: user.avatar,
      }))
  },

  render: () => {
    let component: VueRenderer
    let popup: HTMLElement | null = null

    return {
      onStart: (props: any) => {
        component = new VueRenderer(MentionList, {
          props,
          editor: props.editor,
        })

        if (!component.element) return

        popup = component.element as HTMLElement
        popup.style.position = 'fixed'
        popup.style.zIndex = '9999'

        document.body.appendChild(popup)

        if (props.clientRect) {
          const rect = props.clientRect()
          popup.style.left = `${rect.left}px`
          popup.style.top = `${rect.bottom + 8}px`
        }
      },

      onUpdate(props: any) {
        component.updateProps(props)

        if (popup && props.clientRect) {
          const rect = props.clientRect()
          popup.style.left = `${rect.left}px`
          popup.style.top = `${rect.bottom + 8}px`
        }
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          return true
        }

        const result = component.ref?.onKeyDown(props)
        return result ?? false
      },

      onExit() {
        if (popup && popup.parentNode) {
          popup.parentNode.removeChild(popup)
        }
        if (component) {
          component.destroy()
        }
      },
    }
  },
})
