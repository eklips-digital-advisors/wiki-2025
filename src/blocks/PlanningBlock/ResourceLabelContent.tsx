import { Button } from '@/components/ui/button'
import React from 'react'

export function resourceLabelContent(arg: any, handleAddProject: any) {
  if (!arg.resource._resource.parentId) {
    return (
      <div className="flex justify-between gap-2">
        {arg.resource.title}
        <Button
          className="p-0"
          variant="link"
          onClick={() => handleAddProject(arg.resource.id)}
        >
          Add project
        </Button>
      </div>
    )
  } else {
    return (
      <div className="flex justify-between gap-2">
        {arg.resource.title}
        <Button
          className="p-0"
          variant="link"
          onClick={() => handleAddProject(arg.resource.id)}
        >
          Remove project
        </Button>
      </div>
    )
  }
}
