import type { Block } from 'payload'

export const Stats: Block = {
  slug: 'stats',
  interfaceName: 'StatsBlock',
  fields: [
    {
      type: 'text',
      name: 'title',
      admin: {
        components: {
          Field: '@/blocks/StatsBlock/AdminLabel#AdminLabel',
        }
      }
    },
    {
      type: 'text',
      name: 'titleHeading',
      label: 'Title',
    }
  ],
}
