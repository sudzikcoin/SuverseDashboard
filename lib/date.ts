export function isValidDate(d: Date): boolean {
  return !isNaN(d.getTime())
}

export function formatDate(input: unknown, fallback = "—"): string {
  if (!input) return fallback

  let date: Date

  if (input instanceof Date) {
    date = input
  } else if (typeof input === 'string') {
    date = new Date(input)
    if (!isValidDate(date)) {
      const numericDate = new Date(Number(input))
      if (!isValidDate(numericDate)) {
        return fallback
      }
      date = numericDate
    }
  } else if (typeof input === 'number') {
    date = new Date(input)
  } else {
    return fallback
  }

  if (!isValidDate(date)) {
    return fallback
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit"
  })
}
