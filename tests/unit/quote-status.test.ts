import { describe, expect, it } from 'vitest'
import { effectiveQuoteStatus, storedQuoteStatus } from '../../src/domain/quote-status'
import type { SavedQuote } from '../../src/domain/types'

const quote = (status?: SavedQuote['status'], validUntil = '2026-09-11') => ({ status, validUntil } as SavedQuote)

describe('quote status', () => {
  it('treats legacy quotes as drafts', () => expect(storedQuoteStatus(quote())).toBe('DRAFT'))
  it('expires only drafts and sent quotes after their valid day', () => { expect(effectiveQuoteStatus(quote('DRAFT', '2026-09-10'), '2026-09-11')).toBe('EXPIRED'); expect(effectiveQuoteStatus(quote('SENT', '2026-09-11'), '2026-09-11')).toBe('SENT') })
  it('keeps accepted and rejected quotes final after expiry', () => { expect(effectiveQuoteStatus(quote('ACCEPTED', '2026-01-01'), '2026-09-11')).toBe('ACCEPTED'); expect(effectiveQuoteStatus(quote('REJECTED', '2026-01-01'), '2026-09-11')).toBe('REJECTED') })
})
