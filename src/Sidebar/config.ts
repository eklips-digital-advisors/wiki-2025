import type { GlobalConfig } from 'payload'
import { revalidateSidebar } from '@/Sidebar/hooks/revalidateSidebar'
export const Sidebar: GlobalConfig = {
  slug: 'sidebar',
  fields: [
    {
      type: 'array',
      name: 'items',
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Sidebar/RowLabel#RowLabelSidebar',
        },
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
  ],
  hooks: {
    afterChange: [revalidateSidebar],
  },
}
