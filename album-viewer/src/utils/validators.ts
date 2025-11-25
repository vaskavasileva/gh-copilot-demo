import type { Album } from '../types/album'

// Simple runtime validators for album-viewer
// Keep these small and explicit so UI components can import and use them

export const isNonEmptyString = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0

export const isPositiveNumber = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0

export const isValidUrl = (v: unknown): v is string => {
  if (typeof v !== 'string' || v.trim() === '') return false
  try {
    const url = new URL(v)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export const isAlbum = (obj: unknown): obj is Album => {
  if (typeof obj !== 'object' || obj === null) return false
  const a = obj as Record<string, unknown>
  return (
    typeof a.id === 'number' &&
    isNonEmptyString(a.title) &&
    isNonEmptyString(a.artist) &&
    isPositiveNumber(a.price) &&
    isValidUrl(a.image_url)
  )
}

export const validateAlbumForForm = (partial: Partial<Album>) => {
  const errors: Record<string, string> = {}

  if (!isNonEmptyString(partial.title)) errors.title = 'Title is required'
  if (!isNonEmptyString(partial.artist)) errors.artist = 'Artist is required'
  if (partial.price === undefined || !isPositiveNumber(partial.price)) errors.price = 'Price must be a non-negative number'
  if (!isValidUrl(partial.image_url)) errors.image_url = 'Image must be a valid http/https URL'

  return { valid: Object.keys(errors).length === 0, errors }
}

// French date parsing helpers
// Accepts formats like "dd/mm/yyyy", "d/m/yyyy" and separators "/", "-", or "."
export const isValidFrenchDateString = (v: unknown): v is string => {
  if (typeof v !== 'string') return false
  const s = v.trim()
  if (s === '') return false
  // match day/month/year where year is 4 digits
  const re = /^(\d{1,2})[\.\-/](\d{1,2})[\.\-/](\d{4})$/
  const m = s.match(re)
  if (!m) return false
  const day = Number(m[1])
  const month = Number(m[2])
  const year = Number(m[3])
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return false
  if (month < 1 || month > 12) return false
  if (day < 1) return false
  const daysInMonth = new Date(year, month, 0).getDate()
  if (day > daysInMonth) return false
  return true
}

// Parse a validated French date string into a JS Date (local timezone).
// Returns `Date` on success or `null` for invalid input.
export const parseFrenchDate = (v: string): Date | null => {
  const s = v.trim()
  const re = /^(\d{1,2})[\.\-/](\d{1,2})[\.\-/](\d{4})$/
  const m = s.match(re)
  if (!m) return null
  const day = Number(m[1])
  const month = Number(m[2])
  const year = Number(m[3])
  // Basic validation
  if (month < 1 || month > 12) return null
  const daysInMonth = new Date(year, month, 0).getDate()
  if (day < 1 || day > daysInMonth) return null
  // Construct date in local timezone
  return new Date(year, month - 1, day)
}

// Convenience: validate unknown input and return structured result
export const validateAndParseFrenchDate = (v: unknown): { valid: boolean; date?: Date; error?: string } => {
  if (typeof v !== 'string') return { valid: false, error: 'Input must be a string in dd/mm/yyyy format' }
  if (!isValidFrenchDateString(v)) return { valid: false, error: 'Date must be in dd/mm/yyyy and be a real calendar date' }
  const d = parseFrenchDate(v)
  if (!d) return { valid: false, error: 'Unable to parse date' }
  return { valid: true, date: d }
}

// GUID (UUID) format validator
// Accepts canonical GUID/UUID formats like:
//  - "550e8400-e29b-41d4-a716-446655440000"
//  - with surrounding braces or parentheses (optional)
export const isValidGuidString = (v: unknown): v is string => {
  if (typeof v !== 'string') return false
  const s = v.trim()
  if (s === '') return false
  const re = /^[{(]?([0-9a-fA-F]{8})-([0-9a-fA-F]{4})-([0-9a-fA-F]{4})-([0-9a-fA-F]{4})-([0-9a-fA-F]{12})[)}]?$/
  return re.test(s)
}

// IPv6 validator
// Reasonable, practical validator that supports full, compressed (::) and
// IPv4-embedded forms. It does not try to canonicalize addresses — it only
// checks that the textual form is a valid IPv6 address.
const isValidIPv4 = (s: string): boolean => {
  const parts = s.split('.')
  if (parts.length !== 4) return false
  return parts.every(p => {
    if (!/^[0-9]+$/.test(p)) return false
    const n = Number(p)
    return n >= 0 && n <= 255 && String(n) === p
  })
}

const isHextet = (h: string) => /^[0-9a-fA-F]{1,4}$/.test(h)

export const isValidIPv6String = (v: unknown): v is string => {
  if (typeof v !== 'string') return false
  const s = v.trim()
  if (s === '') return false

  // Split on the "::" compression once
  const parts = s.split('::')
  if (parts.length > 2) return false

  const leftPart = parts[0] ?? ''
  const rightPart = parts[1] ?? ''
  const left = leftPart === '' ? [] : leftPart.split(':')
  const right = parts.length === 2 && rightPart !== '' ? rightPart.split(':') : []

  // Validate possible IPv4 embedded in last position of left or right
  let hasIPv4 = false
  if (right.length > 0) {
    const last = right[right.length - 1] ?? ''
    if (last.includes('.')) {
      if (!isValidIPv4(last)) return false
      hasIPv4 = true
    }
  }
  if (!hasIPv4 && left.length > 0) {
    const lastL = left[left.length - 1] ?? ''
    if (lastL && lastL.includes('.')) {
      if (!isValidIPv4(lastL)) return false
      hasIPv4 = true
    }
  }

  // Validate hextets (exclude any IPv4 part)
  const validateParts = (arr: string[]) => arr.every(p => p.length > 0 && isHextet(p))
  const leftToCheck = left.filter(p => !p.includes('.'))
  const rightToCheck = right.filter(p => !p.includes('.'))
  if (!validateParts(leftToCheck) || !validateParts(rightToCheck)) return false

  const leftCount = leftToCheck.length
  const rightCount = rightToCheck.length
  const ipv4Count = hasIPv4 ? 2 : 0

  if (parts.length === 2) {
    // '::' present: compressed zeros fill the gap; total hextets (counting ipv4 as 2)
    // must be <= 7 because at least one group is compressed
    if (leftCount + rightCount + ipv4Count > 7) return false
  } else {
    // no compression: total hextets must equal 8 (ipv4 counts as 2)
    if (leftCount + ipv4Count !== 8) return false
  }

  return true
}

// Sorting helpers for albums
// Supports sorting by `title` (aka name), `artist`, or `genre` (optional).
export type AlbumWithOptionalGenre = Album & { genre?: string }
export type AlbumSortKey = 'title' | 'name' | 'artist' | 'genre'
export type SortDirection = 'asc' | 'desc'

const getSortValue = (a: AlbumWithOptionalGenre, key: AlbumSortKey) => {
  if (key === 'name') key = 'title'
  if (key === 'title') return (a.title ?? '').toString().toLowerCase()
  if (key === 'artist') return (a.artist ?? '').toString().toLowerCase()
  // genre may be missing on some Album records; treat missing as empty string
  if (key === 'genre') return (a.genre ?? '').toString().toLowerCase()
  return ''
}

export const sortAlbums = (
  albums: AlbumWithOptionalGenre[],
  key: AlbumSortKey = 'title',
  direction: SortDirection = 'asc'
): AlbumWithOptionalGenre[] => {
  const dir = direction === 'asc' ? 1 : -1
  return [...albums].sort((x, y) => {
    const vx = getSortValue(x, key)
    const vy = getSortValue(y, key)
    if (vx === vy) return 0
    return vx.localeCompare(vy) * dir
  })
}

export const sortAlbumsByTitle = (albums: AlbumWithOptionalGenre[], direction: SortDirection = 'asc') =>
  sortAlbums(albums, 'title', direction)

export const sortAlbumsByArtist = (albums: AlbumWithOptionalGenre[], direction: SortDirection = 'asc') =>
  sortAlbums(albums, 'artist', direction)

export const sortAlbumsByGenre = (albums: AlbumWithOptionalGenre[], direction: SortDirection = 'asc') =>
  sortAlbums(albums, 'genre', direction)
