import type { Block } from 'payload'
import { statsBlockTypeOptions } from '@/blocks/StatsBlock/typeOptions'

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
      type: 'array',
      name: 'statBlocks',
      label: 'Blocks',
      fields: [
        {
          type: 'text',
          name: 'titleHeading',
          label: 'Title',
        },
        {
          type: 'select',
          name: 'type',
          options: statsBlockTypeOptions
        }
      ]
    }
  ],
}
