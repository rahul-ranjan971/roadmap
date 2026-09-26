import { useMemo } from 'react';
import { quotes } from '../data/quotes';
import { getQuoteIndexForDate } from '../utils/dateHelpers';

/**
 * Deterministic quote for today.
 * Same date = same quote. Next date = different quote.
 * Falls back to local data — no API dependency.
 */
export function useDayQuote(date = new Date()) {
  return useMemo(() => {
    const index = getQuoteIndexForDate(date, quotes.length);
    return quotes[index] || quotes[0];
  }, [date]);
}
