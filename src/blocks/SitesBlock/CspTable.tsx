import React from 'react'
import { TableProperties } from 'lucide-react'
import { SiteItem } from '@/blocks/SitesBlock/sites-types'

type CspData = SiteItem['csp']

export const CspTable = ({ cspData }: { cspData: CspData }) => {
  if (!cspData) return null

  // Parse CSP string into an object
  const cspEntries = cspData.split('; ').map(entry => {
    const [directive, ...sources] = entry.split(' ')
    return { directive, sources }
  })

  return (
    <span className="group relative inline-block">
      <TableProperties className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700" />

      <span className="absolute right-[20px] top-1/2 mt-2 w-100 h-60 overflow-auto transform -translate-y-1/2 bg-white border border-gray-300 shadow-lg rounded-lg p-2 z-50 opacity-0 invisible group-hover:visible group-hover:opacity-100 group-hover:scale-100 transition-opacity transition-transform duration-300">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border border-gray-200">Directive</th>
              <th className="p-2 border border-gray-200">Sources</th>
            </tr>
          </thead>
          <tbody>
            {cspEntries.map(({ directive, sources } : {directive: string, sources: string[]}, index: number) => (
              <tr key={index} className="border-t border-gray-200">
                <td className="p-2 border border-gray-200 font-medium text-gray-700">{directive}</td>
                <td className="p-2 border border-gray-200 text-gray-600">
                  <ul className="list-disc pl-4">
                    {sources.map((source: string, i: number) => (
                      <li key={i} className="break-all">{source}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </span>
    </span>
  )
}

export default CspTable
