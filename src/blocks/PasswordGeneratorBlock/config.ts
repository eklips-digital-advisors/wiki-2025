import type { Block } from 'payload'

export const PasswordGeneratorBlock: Block = {
  slug: 'passwordGeneratorBlock',
  interfaceName: 'PasswordGeneratorBlock',
  fields: [
    {
      type: 'text',
      name: 'title',
      admin: {
        components: {
          Field: '@/blocks/PasswordGeneratorBlock/AdminLabel#AdminLabel',
        }
      }
    }
  ],
}
