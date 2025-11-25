import { describe, it, expect } from 'vitest'
import type { Album } from '../types/album'
import {
	isNonEmptyString,
	isPositiveNumber,
	isValidUrl,
	isAlbum,
	validateAlbumForForm,
	isValidFrenchDateString,
	parseFrenchDate,
	validateAndParseFrenchDate,
	isValidGuidString,
	isValidIPv6String,
	sortAlbums,
	sortAlbumsByTitle,
	sortAlbumsByArtist,
	sortAlbumsByGenre,
} from './validators'

describe('isNonEmptyString', () => {
	it('returns true for non-empty strings', () => {
		expect(isNonEmptyString('hello')).toBe(true)
		expect(isNonEmptyString('  space  ')).toBe(true)
	})

	it('returns false for empty/whitespace strings', () => {
		expect(isNonEmptyString('')).toBe(false)
		expect(isNonEmptyString('  ')).toBe(false)
	})

	it('returns false for non-strings', () => {
		expect(isNonEmptyString(null)).toBe(false)
		expect(isNonEmptyString(undefined)).toBe(false)
		expect(isNonEmptyString(123)).toBe(false)
	})
})

describe('isPositiveNumber', () => {
	it('returns true for positive numbers', () => {
		expect(isPositiveNumber(0)).toBe(true)
		expect(isPositiveNumber(1)).toBe(true)
		expect(isPositiveNumber(99.99)).toBe(true)
	})

	it('returns false for negative numbers', () => {
		expect(isPositiveNumber(-1)).toBe(false)
		expect(isPositiveNumber(-0.01)).toBe(false)
	})

	it('returns false for non-finite numbers', () => {
		expect(isPositiveNumber(NaN)).toBe(false)
		expect(isPositiveNumber(Infinity)).toBe(false)
	})

	it('returns false for non-numbers', () => {
		expect(isPositiveNumber('123')).toBe(false)
		expect(isPositiveNumber(null)).toBe(false)
	})
})

describe('isValidUrl', () => {
	it('returns true for valid http/https URLs', () => {
		expect(isValidUrl('http://example.com')).toBe(true)
		expect(isValidUrl('https://example.com/path')).toBe(true)
		expect(isValidUrl('https://aka.ms/albums-daprlogo')).toBe(true)
	})

	it('returns false for invalid schemes', () => {
		expect(isValidUrl('ftp://example.com')).toBe(false)
		expect(isValidUrl('file:///path/to/file')).toBe(false)
	})

	it('returns false for empty/non-string input', () => {
		expect(isValidUrl('')).toBe(false)
		expect(isValidUrl('  ')).toBe(false)
		expect(isValidUrl(null)).toBe(false)
		expect(isValidUrl(123)).toBe(false)
	})
})

describe('isAlbum', () => {
	const validAlbum = {
		id: 1,
		title: 'Test Album',
		artist: 'Test Artist',
		price: 9.99,
		image_url: 'https://example.com/image.jpg',
	}

	it('returns true for valid album objects', () => {
		expect(isAlbum(validAlbum)).toBe(true)
	})

	it('returns false when required fields are missing', () => {
		expect(isAlbum({ ...validAlbum, id: undefined })).toBe(false)
		expect(isAlbum({ ...validAlbum, title: '' })).toBe(false)
		expect(isAlbum({ ...validAlbum, artist: '   ' })).toBe(false)
		expect(isAlbum({ ...validAlbum, price: -1 })).toBe(false)
		expect(isAlbum({ ...validAlbum, image_url: 'not-a-url' })).toBe(false)
	})

	it('returns false for non-objects', () => {
		expect(isAlbum(null)).toBe(false)
		expect(isAlbum('not an object')).toBe(false)
		expect(isAlbum(123)).toBe(false)
	})
})

describe('validateAlbumForForm', () => {
	it('returns valid=true for complete album', () => {
		const result = validateAlbumForForm({
			title: 'Album',
			artist: 'Artist',
			price: 9.99,
			image_url: 'https://example.com/img.jpg',
		})
		expect(result.valid).toBe(true)
		expect(result.errors).toEqual({})
	})

	it('collects all validation errors', () => {
		const result = validateAlbumForForm({
			title: '',
			artist: '  ',
			price: -5,
			image_url: 'not-a-url',
		})
		expect(result.valid).toBe(false)
		expect(Object.keys(result.errors).length).toBeGreaterThan(0)
		expect(result.errors.title).toBeDefined()
		expect(result.errors.artist).toBeDefined()
		expect(result.errors.price).toBeDefined()
		expect(result.errors.image_url).toBeDefined()
	})
})

describe('French date validation', () => {
	describe('isValidFrenchDateString', () => {
		it('returns true for valid French dates', () => {
			expect(isValidFrenchDateString('31/12/2024')).toBe(true)
			expect(isValidFrenchDateString('1/1/2025')).toBe(true)
			expect(isValidFrenchDateString('29/02/2024')).toBe(true) // leap year
			expect(isValidFrenchDateString('15-06-2024')).toBe(true) // with dashes
			expect(isValidFrenchDateString('15.06.2024')).toBe(true) // with dots
		})

		it('returns false for invalid dates', () => {
			expect(isValidFrenchDateString('32/12/2024')).toBe(false) // invalid day
			expect(isValidFrenchDateString('29/02/2023')).toBe(false) // not a leap year
			expect(isValidFrenchDateString('31/11/2024')).toBe(false) // November has 30 days
			expect(isValidFrenchDateString('31/04/2024')).toBe(false) // April has 30 days
		})

		it('returns false for malformed input', () => {
			expect(isValidFrenchDateString('12/13/2024')).toBe(false) // invalid month
			expect(isValidFrenchDateString('2024/12/31')).toBe(false) // wrong order
			expect(isValidFrenchDateString('')).toBe(false)
			expect(isValidFrenchDateString(null)).toBe(false)
			expect(isValidFrenchDateString(123)).toBe(false)
		})
	})

	describe('parseFrenchDate', () => {
		it('returns Date object for valid input', () => {
			const d = parseFrenchDate('01/01/2025')
			expect(d).toBeInstanceOf(Date)
			expect(d?.getFullYear()).toBe(2025)
			expect(d?.getMonth()).toBe(0) // 0-indexed
			expect(d?.getDate()).toBe(1)
		})

		it('handles different separators', () => {
			const d1 = parseFrenchDate('15/06/2024')
			const d2 = parseFrenchDate('15-06-2024')
			const d3 = parseFrenchDate('15.06.2024')
			expect(d1?.getTime()).toBe(d2?.getTime())
			expect(d2?.getTime()).toBe(d3?.getTime())
		})

		it('returns null for invalid input', () => {
			expect(parseFrenchDate('32/12/2024')).toBeNull()
			expect(parseFrenchDate('invalid')).toBeNull()
			expect(parseFrenchDate('')).toBeNull()
		})
	})

	describe('validateAndParseFrenchDate', () => {
		it('returns valid=true with date for correct input', () => {
			const result = validateAndParseFrenchDate('25/12/2024')
			expect(result.valid).toBe(true)
			expect(result.date).toBeInstanceOf(Date)
			expect(result.error).toBeUndefined()
		})

		it('returns valid=false with error message for invalid input', () => {
			const result = validateAndParseFrenchDate('31/02/2024')
			expect(result.valid).toBe(false)
			expect(result.date).toBeUndefined()
			expect(result.error).toBeDefined()
		})

		it('rejects non-string input', () => {
			const result = validateAndParseFrenchDate(123)
			expect(result.valid).toBe(false)
			expect(result.error).toContain('must be a string')
		})
	})
})

describe('GUID validation', () => {
	it('returns true for valid GUIDs', () => {
		expect(isValidGuidString('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
		expect(isValidGuidString('{550e8400-e29b-41d4-a716-446655440000}')).toBe(true)
		expect(isValidGuidString('(550e8400-e29b-41d4-a716-446655440000)')).toBe(true)
	})

	it('returns false for invalid GUIDs', () => {
		expect(isValidGuidString('550e8400-e29b-41d4-a716')).toBe(false) // too short
		expect(isValidGuidString('550e8400-e29b-41d4-a716-446655440000-extra')).toBe(false) // too long
		expect(isValidGuidString('not-a-guid')).toBe(false)
		expect(isValidGuidString('')).toBe(false)
		expect(isValidGuidString(null)).toBe(false)
	})

	it('accepts both uppercase and lowercase hex digits', () => {
		expect(isValidGuidString('550e8400-E29B-41D4-A716-446655440000')).toBe(true)
		expect(isValidGuidString('550E8400-e29b-41d4-a716-446655440000')).toBe(true)
	})
})

describe('IPv6 validation', () => {
	it('returns true for full IPv6 addresses', () => {
		expect(isValidIPv6String('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true)
		expect(isValidIPv6String('2001:db8:85a3:0:0:8a2e:370:7334')).toBe(true)
	})

	it('returns true for compressed IPv6 addresses', () => {
		expect(isValidIPv6String('2001:db8::1')).toBe(true)
		expect(isValidIPv6String('::1')).toBe(true)
		expect(isValidIPv6String('::')).toBe(true)
		expect(isValidIPv6String('2001:db8::8a2e:370:7334')).toBe(true)
	})

	it('returns true for IPv4-embedded IPv6 addresses', () => {
		expect(isValidIPv6String('::ffff:192.0.2.128')).toBe(true)
		expect(isValidIPv6String('64:ff9b::192.0.2.33')).toBe(true)
	})

	it('returns false for invalid IPv6 addresses', () => {
		expect(isValidIPv6String('2001:db8::8a2e::7334')).toBe(false) // multiple ::
		expect(isValidIPv6String('02001:0db8:0000:0000:0000:ff00:0042:8329')).toBe(false) // digit too long
		expect(isValidIPv6String('2001:db8:85a3::8a2e:370k:7334')).toBe(false) // invalid character
		expect(isValidIPv6String('::ffff:999.0.2.128')).toBe(false) // invalid IPv4
		expect(isValidIPv6String('')).toBe(false)
		expect(isValidIPv6String(null)).toBe(false)
	})
})

describe('Album sorting', () => {
	const sampleAlbums: Array<Album & { genre?: string }> = [
		{ id: 3, title: 'Zebra Album', artist: 'Charlie', price: 9.99, image_url: 'https://example.com/3.jpg', genre: 'Rock' },
		{ id: 1, title: 'Apple Album', artist: 'Alice', price: 10.99, image_url: 'https://example.com/1.jpg', genre: 'Pop' },
		{ id: 2, title: 'Banana Album', artist: 'Bob', price: 11.99, image_url: 'https://example.com/2.jpg', genre: 'Jazz' },
	]

	it('sorts by title ascending by default', () => {
		const sorted = sortAlbumsByTitle(sampleAlbums)
		expect(sorted[0]!.title).toBe('Apple Album')
		expect(sorted[1]!.title).toBe('Banana Album')
		expect(sorted[2]!.title).toBe('Zebra Album')
	})

	it('sorts by title descending', () => {
		const sorted = sortAlbumsByTitle(sampleAlbums, 'desc')
		expect(sorted[0]!.title).toBe('Zebra Album')
		expect(sorted[1]!.title).toBe('Banana Album')
		expect(sorted[2]!.title).toBe('Apple Album')
	})

	it('sorts by artist ascending', () => {
		const sorted = sortAlbumsByArtist(sampleAlbums)
		expect(sorted[0]!.artist).toBe('Alice')
		expect(sorted[1]!.artist).toBe('Bob')
		expect(sorted[2]!.artist).toBe('Charlie')
	})

	it('sorts by artist descending', () => {
		const sorted = sortAlbumsByArtist(sampleAlbums, 'desc')
		expect(sorted[0]!.artist).toBe('Charlie')
		expect(sorted[1]!.artist).toBe('Bob')
		expect(sorted[2]!.artist).toBe('Alice')
	})

	it('sorts by genre ascending', () => {
		const sorted = sortAlbumsByGenre(sampleAlbums)
		expect(sorted[0]!.genre).toBe('Jazz')
		expect(sorted[1]!.genre).toBe('Pop')
		expect(sorted[2]!.genre).toBe('Rock')
	})

	it('does not mutate the original array', () => {
		const original = [...sampleAlbums]
		const sorted = sortAlbumsByTitle(sampleAlbums)
		expect(sampleAlbums).toEqual(original)
		expect(sorted[0]!.id).toBe(1) // first item in sorted is id 1
	})

	it('sorts case-insensitively', () => {
		const mixed = [
			{ id: 1, title: 'zulu', artist: 'Artist', price: 9.99, image_url: 'https://example.com/1.jpg' },
			{ id: 2, title: 'Apple', artist: 'Artist', price: 9.99, image_url: 'https://example.com/2.jpg' },
			{ id: 3, title: 'BANANA', artist: 'Artist', price: 9.99, image_url: 'https://example.com/3.jpg' },
		]
		const sorted = sortAlbums(mixed, 'title')
		expect(sorted[0]!.title).toBe('Apple')
		expect(sorted[1]!.title).toBe('BANANA')
		expect(sorted[2]!.title).toBe('zulu')
	})

	it('uses generic sortAlbums with key and direction params', () => {
		const sorted = sortAlbums(sampleAlbums, 'artist', 'desc')
		expect(sorted[0]!.artist).toBe('Charlie')
		expect(sorted[2]!.artist).toBe('Alice')
	})

	it('handles albums with missing genre gracefully', () => {
		const albumsWithMissingGenre = [
			{ id: 1, title: 'A', artist: 'Artist', price: 9.99, image_url: 'https://example.com/1.jpg' },
			{ id: 2, title: 'B', artist: 'Artist', price: 9.99, image_url: 'https://example.com/2.jpg', genre: 'Rock' },
		]
		const sorted = sortAlbumsByGenre(albumsWithMissingGenre)
		expect(sorted[0]!.id).toBe(1) // missing genre sorts first
		expect(sorted[1]!.id).toBe(2)
	})
})
