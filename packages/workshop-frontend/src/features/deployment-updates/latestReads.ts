/**
 * Runs reads of one value so that only the latest one started is applied. A caller whose read a
 * later one replaced settles with that later read instead, success or failure, since what the
 * caller saved is shown only once the read that replaced its own has been applied.
 */
export const latestReads = <T>(apply: (value: T) => void) => {
  let latest: Promise<void> = Promise.resolve()
  return async (read: () => Promise<T>): Promise<void> => {
    const mine: Promise<void> = read().then((value) => {
      if (latest === mine) apply(value)
    })
    latest = mine
    let awaited = mine
    for (;;) {
      try {
        await awaited
      } catch (err) {
        if (latest === awaited) throw err
      }
      if (latest === awaited) return
      awaited = latest
    }
  }
}
