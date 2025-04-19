/**
 * Generates a URL-friendly slug from a given string.
 * Converts to lowercase, replaces spaces and non-alphanumeric chars with hyphens,
 * and removes leading/trailing hyphens.
 *
 * @param text The input string (e.g., book title).
 * @returns The generated slug string.
 */
export function generateSlug(text: string): string {
  if (!text) {
    return '';
  }

  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '') // Remove invalid chars
    .replace(/\s+/g, '-') // Collapse whitespace to single hyphen
    .replace(/-+/g, '-') // Collapse multiple hyphens to single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}