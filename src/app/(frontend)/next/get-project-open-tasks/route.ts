import { NextRequest } from 'next/server'

type TeamworkTask = {
  id: string
  name: string
  url: string
  listName: string
  assignees: string
}

const isCompletedTask = (task: any) => {
  const status = String(task?.status || '').toLowerCase()

  return (
    status === 'completed' ||
    status === 'complete' ||
    status === 'done' ||
    status === 'closed' ||
    status === 'resolved' ||
    Boolean(task?.completed) ||
    Boolean(task?.isCompleted) ||
    Boolean(task?.completedAt) ||
    Boolean(task?.completedOn) ||
    Boolean(task?.dateCompleted) ||
    Boolean(task?.completedDate)
  )
}

const resolveTaskUrl = (task: any, baseUrl: string) => {
  const fallbackBase = baseUrl.replace(/\/$/, '')
  const taskId = task?.id || task?.taskId || task?._id || task?.uid

  return (
    task?.link ||
    task?.url ||
    task?.webLink ||
    task?.permalink ||
    (taskId ? `${fallbackBase}/app/tasks/${taskId}` : '')
  )
}

const resolveListNameFromTask = (task: any) =>
  String(
    task?.tasklist?.name ||
      task?.taskList?.name ||
      task?.taskListName ||
      task?.tasklistName ||
      task?.list?.name ||
      task?.['todo-list-name'] ||
      ''
  )

const resolveListIdFromTask = (task: any) =>
  String(
    task?.tasklist?.id ||
      task?.taskList?.id ||
      task?.tasklistId ||
      task?.taskListId ||
      task?.listId ||
      task?.['todo-list-id'] ||
      ''
  )

const resolveAssigneeNamesFromTask = (task: any) => {
  const responsibleNames =
    task?.['responsible-party-names'] ||
    task?.['responsible-party-name'] ||
    task?.responsiblePartyNames ||
    ''

  if (responsibleNames && String(responsibleNames).toLowerCase() !== 'unassigned') {
    return String(responsibleNames)
  }

  const names = new Set<string>()
  const assignees = Array.isArray(task?.assignees) ? task.assignees : []

  assignees.forEach((assignee: any) => {
    const name =
      assignee?.name ||
      assignee?.displayName ||
      assignee?.fullName ||
      [assignee?.firstName, assignee?.lastName].filter(Boolean).join(' ') ||
      ''

    if (name) {
      names.add(name)
    }
  })

  const responsibleParty = task?.responsibleParty
  const responsibleName =
    responsibleParty?.name ||
    [responsibleParty?.firstName, responsibleParty?.lastName].filter(Boolean).join(' ') ||
    [task?.assignedTo?.firstName, task?.assignedTo?.lastName].filter(Boolean).join(' ') ||
    task?.assignedTo?.name ||
    task?.assignee?.name ||
    task?.assignee ||
    task?.assignedToName ||
    ''

  if (responsibleName) {
    names.add(responsibleName)
  }

  return Array.from(names).join(', ')
}

const resolveAssigneeIdsFromTask = (task: any) => {
  const ids = new Set<string>()

  if (Array.isArray(task?.assignees)) {
    task.assignees.forEach((assignee: any) => {
      const id = assignee?.id || assignee?.userId || assignee?.personId
      if (id) ids.add(String(id))
    })
  }

  if (Array.isArray(task?.assigneeIds)) {
    task.assigneeIds.forEach((id: any) => {
      if (id) ids.add(String(id))
    })
  }

  if (Array.isArray(task?.['responsible-party-ids'])) {
    task['responsible-party-ids'].forEach((id: any) => {
      if (id) ids.add(String(id))
    })
  }

  const assignedId =
    task?.assignedToId ||
    task?.assignedTo?.id ||
    task?.assigneeId ||
    task?.assignee?.id ||
    task?.['responsible-party-id']

  if (assignedId) ids.add(String(assignedId))

  return Array.from(ids)
}

const fetchTasklistsMap = async (baseUrl: string, apiKey: string, projectId: string) => {
  const headers = {
    Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
    'Content-Type': 'application/json',
  }

  const urls = [
    `${baseUrl}/projects/api/v3/tasklists.json?projectIds=${projectId}&pageSize=500`,
    `${baseUrl}/tasklists.json?projectId=${projectId}`,
    `${baseUrl}/projects/${projectId}/tasklists.json`,
  ]

  for (const url of urls) {
    try {
      const response = await fetch(url, { headers })
      if (!response.ok) continue

      const data = await response.json()
      const listCandidates = [
        data?.tasklists,
        data?.taskLists,
        data?.data?.tasklists,
        data?.data?.taskLists,
        data?.data,
      ]
      const lists = listCandidates.find((candidate) => Array.isArray(candidate)) || []

      if (!Array.isArray(lists) || lists.length === 0) continue

      const map: Record<string, string> = {}
      lists.forEach((list: any) => {
        const id = String(
          list?.id || list?.tasklistId || list?.taskListId || list?.['tasklist-id'] || ''
        )
        const name = String(
          list?.name || list?.title || list?.['tasklist-name'] || list?.['todo-list-name'] || ''
        )
        if (id && name) {
          map[id] = name
        }
      })

      if (Object.keys(map).length > 0) {
        return map
      }
    } catch (error) {
      console.error('Failed to fetch tasklists:', error)
    }
  }

  return {}
}

const fetchPeopleMap = async (baseUrl: string, apiKey: string) => {
  const headers = {
    Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
    'Content-Type': 'application/json',
  }

  try {
    const response = await fetch(`${baseUrl}/people.json`, { headers })
    if (!response.ok) {
      return {}
    }

    const data = await response.json()
    const people = data?.people || data?.data?.people || data?.data || []

    if (!Array.isArray(people)) {
      return {}
    }

    const map: Record<string, string> = {}
    people.forEach((person: any) => {
      const id = String(person?.id || person?.personId || person?.userId || '')
      const name =
        person?.name ||
        person?.displayName ||
        person?.fullName ||
        [person?.firstName, person?.lastName].filter(Boolean).join(' ') ||
        [person?.['first-name'], person?.['last-name']].filter(Boolean).join(' ') ||
        ''

      if (id && name) {
        map[id] = name
      }
    })

    return map
  } catch (error) {
    console.error('Failed to fetch people:', error)
    return {}
  }
}

const normalizeTask = (
  task: any,
  baseUrl: string,
  listNameById: Record<string, string>,
  assigneeNameById: Record<string, string>
): TeamworkTask | null => {
  const id = String(task?.id || task?.taskId || task?._id || task?.uid || '')
  const name = String(task?.name || task?.title || task?.content || 'Untitled task')
  const url = resolveTaskUrl(task, baseUrl)
  const listId = resolveListIdFromTask(task)
  const listName = resolveListNameFromTask(task) || (listId ? listNameById[listId] || '' : '')
  const assigneesFromTask = resolveAssigneeNamesFromTask(task)
  const assigneeIds = resolveAssigneeIdsFromTask(task)
  const assignees =
    assigneesFromTask ||
    assigneeIds
      .map((assigneeId) => assigneeNameById[assigneeId])
      .filter(Boolean)
      .join(', ')

  if (!id || !url) {
    return null
  }

  return { id, name, url, listName, assignees }
}

export async function GET(req: NextRequest) {
  const API_KEY = process.env.TEAMWORK_API_KEY
  const BASE_URL = process.env.TEAMWORK_BASE_URL

  if (!API_KEY || !BASE_URL) {
    return new Response(
      JSON.stringify({ error: 'Missing TEAMWORK_API_KEY or TEAMWORK_BASE_URL' }),
      { status: 500 }
    )
  }

  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('id')

  if (!projectId) {
    return new Response(JSON.stringify({ error: 'Missing project ID' }), { status: 400 })
  }

  const query = new URLSearchParams({
    projectIds: projectId,
    pageSize: '500',
    taskFilter: 'all',
  })

  const API_URL = `${BASE_URL}/projects/api/v3/tasks.json?${query.toString()}`

  try {
    const headers = {
      Authorization: `Basic ${Buffer.from(`${API_KEY}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    }

    const response = await fetch(API_URL, { headers })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    const rawTasks =
      (Array.isArray(data?.tasks) && data.tasks) ||
      (Array.isArray(data?.data?.tasks) && data.data.tasks) ||
      (Array.isArray(data?.data) && data.data) ||
      []

    const needsListLookup = rawTasks.some((task: any) => {
      const listName = resolveListNameFromTask(task)
      const listId = resolveListIdFromTask(task)
      return !listName && Boolean(listId)
    })
    const needsAssigneeLookup = rawTasks.some((task: any) => {
      const assignees = resolveAssigneeNamesFromTask(task)
      const ids = resolveAssigneeIdsFromTask(task)
      return !assignees && ids.length > 0
    })

    const [listNameById, assigneeNameById] = await Promise.all([
      needsListLookup ? fetchTasklistsMap(BASE_URL, API_KEY, projectId) : Promise.resolve({}),
      needsAssigneeLookup ? fetchPeopleMap(BASE_URL, API_KEY) : Promise.resolve({}),
    ])

    const tasks = rawTasks
      .filter((task: any) => !isCompletedTask(task))
      .map((task: any) => normalizeTask(task, BASE_URL, listNameById, assigneeNameById))
      .filter((task: TeamworkTask | null): task is TeamworkTask => Boolean(task))

    return new Response(JSON.stringify({ tasks }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Failed to fetch teamwork tasks:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch tasks' }), { status: 500 })
  }
}
