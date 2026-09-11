const STORAGE_KEY = "ilvs_reviews";

const DEFAULT_REVIEWS = [
  {
    id: "review-default-1",
    customerName: "Marcin",
    customerRole: "DJ / producent",
    content: "Świetna obsługa, szybka dostawa i bardzo dobre doradztwo przed zakupem.",
    rating: 5,
    createdAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "review-default-2",
    customerName: "Anna",
    customerRole: "realizatorka dźwięku",
    content: "Sklep wygląda profesjonalnie, a koszyk i filtrowanie są bardzo wygodne.",
    rating: 5,
    createdAt: "2026-01-02T10:00:00.000Z",
  },
  {
    id: "review-default-3",
    customerName: "Piotr",
    customerRole: "pasjonat audio",
    content: "Sprzęt dotarł następnego dnia. Na pewno wrócę po kolejne zakupy.",
    rating: 5,
    createdAt: "2026-01-03T10:00:00.000Z",
  },
];

export function getReviews() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_REVIEWS));
      return [...DEFAULT_REVIEWS];
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [...DEFAULT_REVIEWS];
  }
}

export function saveReviews(reviews) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  window.dispatchEvent(new CustomEvent("ilvs:reviews-updated"));
  return reviews;
}

export function addReview(review) {
  const reviews = getReviews();
  const nextReview = {
    id: `review-${Date.now()}`,
    customerName: String(review.customerName || "").trim(),
    customerRole: String(review.customerRole || "").trim(),
    content: String(review.content || "").trim(),
    rating: Math.min(5, Math.max(1, Number(review.rating) || 5)),
    createdAt: new Date().toISOString(),
  };

  saveReviews([nextReview, ...reviews]);
  return nextReview;
}

export function removeReview(reviewId) {
  const next = getReviews().filter((review) => review.id !== reviewId);
  saveReviews(next);
  return next;
}
