import type { Block } from 'payload'

export const Planning: Block = {
  slug: 'planning',
  interfaceName: 'PlanningBlock',
  fields: [
    {
      type: 'text',
      name: 'title',
      admin: {
        components: {
          Field: '@/blocks/PlanningBlock/AdminLabel#AdminLabel',
        }
      }
    }
  ],
}
