import { getStatusBg } from '@/blocks/PlanningBlock/utils/getStatusBg'

export const getEventBg = (arg: any, isInverted: boolean) => {
  if (arg?.event?.extendedProps?.type?.includes('vacation')) {
    return `default bg-slate-200 hover:bg-slate-300`
  } else if (arg?.event?.extendedProps?.type?.includes('designer')) {
    return `fc-event-regular h-[26px] bg-amber-300 hover:bg-amber-400`
  } else if (arg?.event?.extendedProps?.type?.includes('pm')) {
    return `fc-event-regular h-[26px] bg-indigo-300 hover:bg-indigo-400`
  } else if (arg?.event?.extendedProps?.type?.includes('default')) {
    return `default bg-indigo-200 hover:bg-indigo-300`
  } else if (isInverted && !arg.event.getResources()?.[0]?._resource?.parentId) {
    return `${getStatusBg(arg.event.title)} fc-event-regular h-[40px] inverted mr-[2px] ml-[4px]`
  } else {
    return `fc-event-regular h-[26px] bg-emerald-300 hover:bg-emerald-400`
  }
}
