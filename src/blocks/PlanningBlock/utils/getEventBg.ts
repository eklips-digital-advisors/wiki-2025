import { getStatusBg } from '@/blocks/PlanningBlock/utils/getStatusBg'

export const getEventBg = (arg: any, isInverted: boolean) => {
  const event = arg?.event
  const eventType = event?.extendedProps?.type
  const resource = event?.getResources?.()?.[0]?._resource
  const projectType = resource?.extendedProps?.projectType

  if (eventType?.includes?.('vacation')) {
    return `default bg-stripes`
  }

  if (projectType?.includes?.('vacation')) {
    return `fc-event-regular h-[26px] bg-stripes`
  }

  // 2. Rollipõhised värvid
  if (eventType?.includes?.('designer')) {
    return `fc-event-regular h-[26px] bg-amber-300 hover:bg-amber-400`
  } else if (eventType?.includes?.('backend')) {
    return `fc-event-regular h-[26px] bg-blue-300 hover:bg-blue-400`
  } else if (eventType?.includes?.('qa')) {
    return `fc-event-regular h-[26px] bg-cyan-300 hover:bg-cyan-400`
  } else if (eventType?.includes?.('im')) {
    return `fc-event-regular h-[26px] bg-lime-300 hover:bg-lime-400`
  } else if (eventType?.includes?.('sm')) {
    return `fc-event-regular h-[26px] bg-red-300 hover:bg-red-400`
  } else if (eventType?.includes?.('pm')) {
    return `fc-event-regular h-[26px] bg-indigo-300 hover:bg-indigo-400`
  } else if (eventType?.includes?.('default')) {
    return `default bg-indigo-200 hover:bg-indigo-300`
  }

  // 3. Inverted case
  if (isInverted && !resource?.parentId) {
    return `${getStatusBg(event.title)} fc-event-regular h-[40px] inverted mr-[2px] ml-[4px]`
  }

  // 4. Default
  return `fc-event-regular h-[26px] bg-emerald-300 hover:bg-emerald-400`
}
