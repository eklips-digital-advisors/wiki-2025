import { getStatusBg } from '@/blocks/PlanningBlock/utils/getStatusBg'

export const getEventBg = (arg: any, isInverted: boolean) => {
  if (arg?.event?.extendedProps?.type?.includes('vacation')) {
    return `default bg-stripes`
  } else if (arg?.event?.extendedProps?.type?.includes('designer')) {
    return `fc-event-regular h-[26px] bg-amber-300 hover:bg-amber-400`
  } else if (arg?.event?.extendedProps?.type?.includes('backend')) {
    return `fc-event-regular h-[26px] bg-blue-300 hover:bg-blue-400`
  } else if (arg?.event?.extendedProps?.type?.includes('qa')) {
    return `fc-event-regular h-[26px] bg-cyan-300 hover:bg-cyan-400`
  } else if (arg?.event?.extendedProps?.type?.includes('im')) {
    return `fc-event-regular h-[26px] bg-lime-300 hover:bg-lime-400`
  } else if (arg?.event?.extendedProps?.type?.includes('sm')) {
    return `fc-event-regular h-[26px] bg-red-300 hover:bg-red-400`
  } else if (arg?.event?.extendedProps?.type?.includes('pm')) {
    return `fc-event-regular h-[26px] bg-indigo-300 hover:bg-indigo-400`
  } else if (arg?.event?.extendedProps?.type?.includes('default')) {
    return `default bg-indigo-200 hover:bg-indigo-300`
  } else if (
    arg.event.getResources()?.[0]?._resource?.extendedProps?.projectType?.includes('vacation')
  ) {
    return `fc-event-regular h-[26px] bg-stripes`
  } else if (isInverted && !arg.event.getResources()?.[0]?._resource?.parentId) {
    return `${getStatusBg(arg.event.title)} fc-event-regular h-[40px] inverted mr-[2px] ml-[4px]`
  } else {
    return `fc-event-regular h-[26px] bg-emerald-300 hover:bg-emerald-400`
  }
}
