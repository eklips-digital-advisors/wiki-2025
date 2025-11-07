import React from 'react'
import { TableProperties } from 'lucide-react'
import { Site } from '@/payload-types'
import { getLabel } from '@/utilities/getLabel'
import { fontDeliveryOptions, fontLicenceOptions } from '@/collections/Sites/selectOptions'
// import { Site } from '@/types' // wherever your Site interface lives

type Font = NonNullable<Site['fonts']>[number]

type FontsTableProps = {
  fonts?: Site['fonts'] | null
}

export const FontsTable: React.FC<FontsTableProps> = ({ fonts }) => {
  const items: Font[] = Array.isArray(fonts) ? fonts : []

  return (
    <span className="group relative inline-block">
      <TableProperties className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700" />

      <span className="absolute left-0 top-0 mt-2 w-[460px] max-h-[260px] overflow-auto bg-white border border-gray-300 shadow-lg rounded-lg p-2 z-50 opacity-0 invisible group-hover:visible group-hover:opacity-100 group-hover:scale-100 transition-opacity duration-300 text-sm">
        {items.length ? (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-400">
                <th className="py-1 pr-2">Family</th>
                <th className="py-1 pr-2">Provider</th>
                <th className="py-1 pr-2">Delivery</th>
                <th className="py-1">Licence</th>
              </tr>
            </thead>
            <tbody>
              {items.map((font, idx) => (
                <tr
                  key={font.id ?? `${font.family}-${font.provider ?? 'na'}-${idx}`}
                  className="border-b last:border-0 border-zinc-100 align-top"
                >
                  <td className="py-1 pr-2 text-zinc-800 break-all">{font.family}</td>
                  <td className="py-1 pr-2 text-zinc-500">{font.provider}</td>
                  <td className="py-1 pr-2 text-xs text-zinc-400">{getLabel(font.delivery, fontDeliveryOptions)}</td>
                  <td className="py-1 pr-2 text-xs text-zinc-400">{font.licence && getLabel(font.licence, fontLicenceOptions)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-xs text-zinc-400 px-1 py-2">No fonts detected</div>
        )}
      </span>
    </span>
  )
}

export default FontsTable
