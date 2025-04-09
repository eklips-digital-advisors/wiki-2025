import type { Block } from 'payload'

export const Reports: Block = {
  slug: 'reports',
  interfaceName: 'ReportsBlock',
  fields: [
    {
      type: 'text',
      name: 'title',
      admin: {
        components: {
          Field: '@/blocks/ReportsBlock/AdminLabel#AdminLabel',
        }
      }
    },
  ],
}
