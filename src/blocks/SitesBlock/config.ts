import type { Block } from 'payload'

export const Sites: Block = {
  slug: 'sites',
  interfaceName: 'SitesBlock',
  fields: [
    {
      type: 'text',
      name: 'title',
      admin: {
        components: {
          Field: '@/blocks/SitesBlock/AdminLabel#AdminLabel',
        }
      }
    }
  ],
}
