/** A review as shown on the website: no contact details, the reviewer's surname cut to an initial. */
export type PublicReview = {
  id: string; name: string; location: string; rating: number; title: string; text: string; date: string;
  shade?: string; projectType: string; verified: boolean; reply?: string;
};

/** An answered question as shown on the website. */
export type PublicQuestion = { id: string; name: string; question: string; answer: string; date: string };

/** What the Reviews section needs on first load: the summary and the first few of each. */
export type ReviewSummary = {
  count: number;
  /** Average rating to one decimal. */
  average: number;
  /** How many reviews gave 5, 4, 3, 2 and 1 stars, in that order. */
  distribution: readonly number[];
  reviews: readonly PublicReview[];
  questions: readonly PublicQuestion[];
  questionCount: number;
};

/** Reviews and questions shown in the page's HTML on load; the rest come with "Load more". */
export const REVIEWS_PAGE_SIZE = 5;
/** The rating summary and Google's star rating appear only from this many approved reviews. */
export const MIN_REVIEWS_FOR_SUMMARY = 3;

/** "Arun Kumar" → "Arun K.": first name and last initial. */
export function shortName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.` : parts[0];
}

export const emptySummary: ReviewSummary = { count: 0, average: 0, distribution: [0, 0, 0, 0, 0], reviews: [], questions: [], questionCount: 0 };