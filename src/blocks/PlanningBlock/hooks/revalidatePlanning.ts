import type { CollectionAfterChangeHook } from 'payload'
import { revalidatePath } from 'next/cache'
export const revalidatePlanning: CollectionAfterChangeHook = async ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating path: /planning`)
    revalidatePath('/planning')
  }

  return doc
}
