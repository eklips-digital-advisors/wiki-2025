import type { GlobalConfig } from 'payload'
import { revalidateSidebar } from '@/Sidebar/hooks/revalidateSidebar'
export const Sidebar: GlobalConfig = {
  slug: 'sidebar',
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'array',
      name: 'items',
      admin: {
        description: '1st level of sidebar',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          type: 'array',
          name: 'subItems',
          admin: {
            components: {
              RowLabel: '@/Sidebar/RowLabel#RowLabelSidebar',
            },
            description: '2nd level of sidebar',
          },
          fields: [
            {
              name: 'categoriesOrder',
              type: 'relationship',
              relationTo: 'categories',
              required: true,
            },
            {
              name: 'postsOrder',
              type: 'relationship',
              relationTo: 'posts',
              required: true,
              unique: true,
              hasMany: true,
              admin: {
                isSortable: true,
              },
              filterOptions: ({ siblingData }) => {
                return {
                  // @ts-expect-error I dont know why
                  categories: { in: siblingData?.categoriesOrder },
                };
              },
            },
          ]
        },
      ]
    },
  ],
  hooks: {
    afterChange: [revalidateSidebar],
  },
}
