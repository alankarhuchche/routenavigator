/** Parse ETA strings like "2 min", "38 min", "4 hr", "2-4 hr", "1-2 days" into upper-bound minutes. */
export function etaToMinutes(eta: string): number | null {
  const match = eta.match(/(\d+)(?:\s*-\s*(\d+))?\s*(min|hr|day)/i)
  if (!match) return null
  const upper = Number(match[2] ?? match[1])
  const unit = match[3].toLowerCase()
  if (unit === 'min') return upper
  if (unit === 'hr') return upper * 60
  return upper * 24 * 60
}
