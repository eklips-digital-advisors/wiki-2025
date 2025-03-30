import { getStatusBg } from '@/blocks/PlanningBlock/utils/getStatusBg'

export const getEventBg = (arg: any, isInverted: boolean) => {
  if (isInverted && !arg.event.getResources()?.[0]?._resource?.parentId) {
    return `${getStatusBg(arg.event.title)} text-white h-[40px] inverted`
  } else {
    return `h-[26px] bg-emerald-900 hover:bg-emerald-800 text-white`
  }
}
