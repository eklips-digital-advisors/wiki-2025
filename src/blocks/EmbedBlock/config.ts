import type { Block } from 'payload'

export const EmbedBlock: Block = {
  slug: 'embedBlock',
  interfaceName: 'EmbedBlock',
  fields: [
    {
      name: 'embed',
      type: 'text',
      admin: {
        components: {
          Field: '@/blocks/EmbedBlock/AdminComponent#EmbedBlockAdmin',
        },
      },
    },
  ],
}
