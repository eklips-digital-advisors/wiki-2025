import { getStatusBg } from '@/blocks/PlanningBlock/utils/getStatusBg'

export const getEventBg = (arg: any, isInverted: boolean) => {
  if (arg?.event?.extendedProps?.type?.includes('vacation')) {
    return `default bg-emerald-200 hover:bg-emerald-300`
  } else if (arg?.event?.extendedProps?.type?.includes('default')) {
    return `default bg-indigo-200 hover:bg-indigo-300`
  } else if (isInverted && !arg.event.getResources()?.[0]?._resource?.parentId) {
    return `${getStatusBg(arg.event.title)} fc-event-regular text-white h-[40px] inverted`
  } else {
    return `fc-event-regular h-[26px] bg-emerald-900 hover:bg-emerald-800 text-white`
  }
}
