'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

type TeamworkTask = {
  id: string
  name: string
  url: string
  listName: string
  assignees: string
}

type Props = {
  projectTeamworkId: string | number
}

export const TeamworkTasksDropdown = ({ projectTeamworkId }: Props) => {
  const [teamworkTasks, setTeamworkTasks] = React.useState<TeamworkTask[]>([])
  const [teamworkTasksStatus, setTeamworkTasksStatus] = React.useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')

  const loadTeamworkTasks = React.useCallback(async () => {
    if (!projectTeamworkId) return

    setTeamworkTasksStatus('loading')

    try {
      const response = await fetch(
        `/next/get-project-open-tasks?id=${encodeURIComponent(String(projectTeamworkId))}`
      )

      if (!response.ok) {
        throw new Error(`Failed to load tasks: ${response.status}`)
      }

      const data = await response.json()
      const tasks = Array.isArray(data?.tasks) ? data.tasks : []

      setTeamworkTasks(tasks)
      setTeamworkTasksStatus('success')
    } catch (error) {
      console.error('Failed to fetch teamwork tasks:', error)
      setTeamworkTasksStatus('error')
    }
  }, [projectTeamworkId])

  React.useEffect(() => {
    setTeamworkTasks([])
    setTeamworkTasksStatus('idle')
  }, [projectTeamworkId])

  React.useEffect(() => {
    if (!projectTeamworkId) return
    if (teamworkTasksStatus !== 'idle') return

    loadTeamworkTasks()
  }, [loadTeamworkTasks, projectTeamworkId, teamworkTasksStatus])

  if (teamworkTasksStatus !== 'success' || teamworkTasks.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="link"
          size="clear"
          className="cursor-pointer"
          aria-label="View teamwork tasks"
        >
          <span className="rounded-full bg-zinc-200 px-1.5 text-[10px] leading-4 text-zinc-700">
            {teamworkTasks.length}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-white z-[60] max-h-80 overflow-y-auto">
        {teamworkTasks.map((task) => {
          const assigneeNames = task.assignees
            .split(',')
            .map((name) => name.trim())
            .filter(Boolean)

          return (
            <DropdownMenuItem
              key={task.id}
              className="cursor-pointer flex-col items-start gap-1 hover:bg-zinc-100"
              asChild
            >
              <a
                className="flex flex-row items-center gap-1"
                href={task.url}
                target="_blank"
                rel="noreferrer"
              >
                <h3 className="font-medium">{task.name}</h3>
                <span className="flex items-center gap-1">
                  {assigneeNames.length > 0 && (
                    <span className="flex flex-wrap gap-1">
                      {assigneeNames.map((name) => (
                        <Badge key={`${task.id}-${name}`} variant="outline" className="text-[10px]">
                          {name}
                        </Badge>
                      ))}
                    </span>
                  )}
                  {task.listName && <span className="text-xs text-zinc-500">{task.listName}</span>}
                </span>
              </a>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
