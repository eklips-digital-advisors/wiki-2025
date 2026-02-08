'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AlertCircle, ExternalLink, LoaderCircle, RefreshCw } from 'lucide-react'

type TeamworkTask = {
  id: string
  name: string
  url: string
  listName: string
  assignees: string
  createdAt: string
}

type Props = {
  projectTeamworkId: string | number
}

const STALE_TASK_DAYS = 14
const WARNING_TASK_DAYS = 7
const TEAMWORK_TASK_CACHE_TTL_MS = process.env.NODE_ENV === 'development' ? 5 * 60 * 1000 : 60 * 1000
const MAX_PARALLEL_TASK_REQUESTS = process.env.NODE_ENV === 'development' ? 2 : 4

type TeamworkTaskCacheEntry = {
  tasks: TeamworkTask[]
  cachedAt: number
}

type TeamworkRequestError = Error & {
  status?: number
}

const teamworkTaskCache = new Map<string, TeamworkTaskCacheEntry>()
const teamworkTaskInFlight = new Map<string, Promise<TeamworkTask[]>>()
const teamworkTaskQueue: Array<() => void> = []
let activeTaskRequests = 0

const withTaskRequestLimit = async <T,>(task: () => Promise<T>): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const run = () => {
      activeTaskRequests += 1

      task()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          activeTaskRequests = Math.max(0, activeTaskRequests - 1)
          const next = teamworkTaskQueue.shift()
          if (next) next()
        })
    }

    if (activeTaskRequests < MAX_PARALLEL_TASK_REQUESTS) {
      run()
      return
    }

    teamworkTaskQueue.push(run)
  })

const hasFreshTaskCache = (cacheEntry: TeamworkTaskCacheEntry | undefined) =>
  Boolean(cacheEntry && Date.now() - cacheEntry.cachedAt < TEAMWORK_TASK_CACHE_TTL_MS)

const fetchTeamworkTasksForProject = async (
  projectId: string,
  force = false,
): Promise<TeamworkTask[]> => {
  const cached = teamworkTaskCache.get(projectId)
  if (!force && hasFreshTaskCache(cached)) {
    return cached?.tasks || []
  }

  const existingInFlight = teamworkTaskInFlight.get(projectId)
  if (existingInFlight) {
    return existingInFlight
  }

  const requestPromise = withTaskRequestLimit(async () => {
    const response = await fetch(`/next/get-project-open-tasks?id=${encodeURIComponent(projectId)}`)

    if (!response.ok) {
      const err: TeamworkRequestError = new Error(`Failed to load tasks: ${response.status}`)
      err.status = response.status
      throw err
    }

    const data = await response.json()
    const tasks = Array.isArray(data?.tasks) ? data.tasks : []

    teamworkTaskCache.set(projectId, {
      tasks,
      cachedAt: Date.now(),
    })

    return tasks
  }).finally(() => {
    teamworkTaskInFlight.delete(projectId)
  })

  teamworkTaskInFlight.set(projectId, requestPromise)
  return requestPromise
}

const getTaskAgeDays = (createdAt: string) => {
  if (!createdAt) return null

  const createdDate = new Date(createdAt)
  if (Number.isNaN(createdDate.getTime())) return null

  return Math.max(0, Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)))
}

const getAgeBadgeClassName = (ageDays: number | null) => {
  if (ageDays == null) return 'border-zinc-200 bg-zinc-100 text-zinc-500'
  if (ageDays > STALE_TASK_DAYS) return 'border-rose-200 bg-rose-100 text-rose-700'
  if (ageDays > WARNING_TASK_DAYS) return 'border-amber-200 bg-amber-100 text-amber-700'
  return 'border-emerald-200 bg-emerald-100 text-emerald-700'
}

const formatCreatedAt = (createdAt: string) => {
  if (!createdAt) return ''

  const createdDate = new Date(createdAt)
  if (Number.isNaN(createdDate.getTime())) return ''

  return createdDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const TeamworkTasksDropdown = ({ projectTeamworkId }: Props) => {
  const projectId = String(projectTeamworkId || '')
  const [teamworkTasks, setTeamworkTasks] = React.useState<TeamworkTask[]>([])
  const [teamworkTasksStatus, setTeamworkTasksStatus] = React.useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [errorCode, setErrorCode] = React.useState<number | null>(null)
  const [isTriggerVisible, setIsTriggerVisible] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)

  const loadTeamworkTasks = React.useCallback(
    async (force = false) => {
      if (!projectId) return

      const cached = teamworkTaskCache.get(projectId)
      if (hasFreshTaskCache(cached)) {
        setTeamworkTasks(cached?.tasks || [])
        setTeamworkTasksStatus('success')
        setErrorCode(null)

        if (!force) return
      }

      setTeamworkTasksStatus('loading')

      try {
        const tasks = await fetchTeamworkTasksForProject(projectId, force)

        setTeamworkTasks(tasks)
        setTeamworkTasksStatus('success')
        setErrorCode(null)
      } catch (error) {
        const nextErrorCode = (error as TeamworkRequestError)?.status || null
        if (cached) {
          setTeamworkTasks(cached.tasks)
          setTeamworkTasksStatus('success')
        } else {
          setTeamworkTasks([])
          setTeamworkTasksStatus('error')
        }
        setErrorCode(nextErrorCode)
      }
    },
    [projectId],
  )

  React.useEffect(() => {
    if (!projectId) {
      setTeamworkTasks([])
      setTeamworkTasksStatus('idle')
      setErrorCode(null)
      setIsTriggerVisible(false)
      return
    }

    const cached = teamworkTaskCache.get(projectId)
    if (hasFreshTaskCache(cached)) {
      setTeamworkTasks(cached?.tasks || [])
      setTeamworkTasksStatus('success')
      setErrorCode(null)
    } else {
      setTeamworkTasks([])
      setTeamworkTasksStatus('idle')
      setErrorCode(null)
    }
  }, [projectId])

  React.useEffect(() => {
    if (!projectId) return

    const node = triggerRef.current
    if (!node || typeof window === 'undefined') return
    if (typeof window.IntersectionObserver === 'undefined') {
      setIsTriggerVisible(true)
      return
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsTriggerVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '160px 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [projectId])

  React.useEffect(() => {
    if (!isTriggerVisible) return
    if (teamworkTasksStatus !== 'idle') return

    void loadTeamworkTasks(false)
  }, [isTriggerVisible, teamworkTasksStatus, loadTeamworkTasks])

  React.useEffect(() => {
    if (teamworkTasksStatus !== 'error') return
    if (errorCode !== 429) return

    const retryTimeout = window.setTimeout(() => {
      void loadTeamworkTasks(false)
    }, 2500)

    return () => window.clearTimeout(retryTimeout)
  }, [teamworkTasksStatus, errorCode, loadTeamworkTasks])

  const badgeText =
    teamworkTasksStatus === 'success'
      ? String(teamworkTasks.length)
      : teamworkTasksStatus === 'error' && errorCode === 429
        ? '!'
        : '...'

  const errorMessage =
    errorCode === 429
      ? 'Teamwork rate limit reached. Retrying shortly...'
      : 'Failed to load tasks.'

  const sortedTasks = React.useMemo(() => {
    return [...teamworkTasks].sort((a, b) => {
      const ageA = getTaskAgeDays(a.createdAt)
      const ageB = getTaskAgeDays(b.createdAt)
      const staleA = ageA != null && ageA > STALE_TASK_DAYS
      const staleB = ageB != null && ageB > STALE_TASK_DAYS

      if (staleA !== staleB) return staleA ? -1 : 1
      if (ageA == null && ageB == null) return a.name.localeCompare(b.name)
      if (ageA == null) return 1
      if (ageB == null) return -1

      return ageB - ageA
    })
  }, [teamworkTasks])

  const groupedTasks = React.useMemo(() => {
    const groups = new Map<string, TeamworkTask[]>()

    sortedTasks.forEach((task) => {
      const listName = task.listName?.trim() || 'No list'
      const existingGroup = groups.get(listName) || []
      existingGroup.push(task)
      groups.set(listName, existingGroup)
    })

    return Array.from(groups.entries()).sort(([left], [right]) => left.localeCompare(right))
  }, [sortedTasks])

  const teamworkProjectUrl = React.useMemo(() => {
    const firstTaskUrl = sortedTasks[0]?.url
    if (!firstTaskUrl) return ''

    try {
      const parsedUrl = new URL(firstTaskUrl)
      const parsedProjectId = encodeURIComponent(projectId)
      return `${parsedUrl.origin}/app/projects/${parsedProjectId}/tasks`
    } catch {
      return ''
    }
  }, [projectId, sortedTasks])

  if (!projectId) {
    return null
  }

  return (
    <DropdownMenu
      onOpenChange={(isOpen) => {
        if (isOpen && teamworkTasksStatus === 'idle') {
          void loadTeamworkTasks()
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          ref={triggerRef}
          variant="link"
          size="clear"
          className="cursor-pointer"
          aria-label="View teamwork tasks dropdown"
        >
          <span className="inline-flex h-[20px] w-[20px] items-center justify-center rounded-full bg-zinc-200 text-[10px] leading-none text-zinc-700">
            {badgeText}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="bg-white z-[60] w-[440px] max-w-[calc(100vw-2rem)] p-0"
      >
        <div className="sticky top-0 z-10 border-b bg-white px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Open tasks</p>
              <p className="text-xs text-zinc-500">
                {teamworkTasksStatus === 'success' ? `${teamworkTasks.length} total` : 'Loading count'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {teamworkProjectUrl && (
                <a
                  href={teamworkProjectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-zinc-600 underline hover:text-zinc-900"
                >
                  Open all
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900"
                onClick={() => void loadTeamworkTasks(true)}
                aria-label="Refresh teamwork tasks"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${teamworkTasksStatus === 'loading' ? 'animate-spin' : ''}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto p-1">
          {teamworkTasksStatus === 'loading' && (
            <div className="flex items-center gap-2 px-2 py-2 text-sm text-zinc-500">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Loading tasks...
            </div>
          )}

          {teamworkTasksStatus === 'error' && (
            <div className="px-2 py-2">
              <div className="mb-2 flex items-center gap-2 text-sm text-rose-600">
                <AlertCircle className="h-4 w-4" />
                {errorMessage}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => void loadTeamworkTasks(true)}
              >
                Retry
              </Button>
            </div>
          )}

          {teamworkTasksStatus === 'success' && teamworkTasks.length === 0 && (
            <div className="px-2 py-2 text-sm text-zinc-500">No open tasks.</div>
          )}

          {teamworkTasksStatus === 'success' &&
            groupedTasks.map(([listName, listTasks], groupIndex) => (
              <div key={listName}>
                {groupIndex > 0 && <DropdownMenuSeparator />}
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                  {listName}
                </p>
                {listTasks.map((task) => {
                  const assigneeNames = task.assignees
                    .split(',')
                    .map((name) => name.trim())
                    .filter(Boolean)
                  const shownAssignees = assigneeNames.slice(0, 2)
                  const hiddenAssigneeCount = Math.max(0, assigneeNames.length - shownAssignees.length)
                  const ageDays = getTaskAgeDays(task.createdAt)
                  const createdLabel = formatCreatedAt(task.createdAt)
                  const ageLabel = ageDays == null ? 'N/A' : `${ageDays}d`

                  return (
                    <DropdownMenuItem
                      key={task.id}
                      className="cursor-pointer p-0 hover:bg-zinc-100 focus:bg-zinc-100 items-start"
                      asChild
                    >
                      <a
                        className="flex w-full flex-col gap-1 px-2 py-2"
                        href={task.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-zinc-900">{task.name}</span>
                          <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-zinc-400" />
                        </span>
                        <span className="flex flex-wrap items-center gap-1">
                          <Badge variant="outline" className={`text-[10px] ${getAgeBadgeClassName(ageDays)}`}>
                            {ageLabel}
                          </Badge>
                          {createdLabel && <span className="text-[10px] text-zinc-500">{createdLabel}</span>}
                          {shownAssignees.map((name) => (
                            <Badge key={`${task.id}-${name}`} variant="outline" className="text-[10px]">
                              {name}
                            </Badge>
                          ))}
                          {hiddenAssigneeCount > 0 && (
                            <Badge variant="outline" className="text-[10px]">
                              +{hiddenAssigneeCount}
                            </Badge>
                          )}
                        </span>
                      </a>
                    </DropdownMenuItem>
                  )
                })}
              </div>
            ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
