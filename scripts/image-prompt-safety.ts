/** Internal workflow/editorial state must never be rendered into generated art. */
const INTERNAL_STATUS_LANGUAGE =
  /\b(?:provisional|unapproved|approved|approval|moderator|review|verification)\b/i;

export const NO_RENDERED_TEXT_INSTRUCTION =
  'No text, typography, captions, labels, title cards, banners, signs, logos, UI, watermarks, or written words anywhere in the image';

/**
 * Removes comma/semicolon/sentence-delimited clauses that contain internal
 * moderation state, then appends a mandatory no-text instruction.
 *
 * Apply this at the API boundary so future prompt construction paths cannot
 * accidentally leak editorial metadata into generated images.
 */
export function prepareImagePrompt(prompt: string): string {
  const visualClauses = prompt
    .split(/[,;.!?]+/)
    .map((clause) => clause.trim())
    .filter(Boolean)
    .filter((clause) => !INTERNAL_STATUS_LANGUAGE.test(clause));

  if (visualClauses.length === 0) {
    throw new Error('Image prompt contained only internal moderation/status language.');
  }

  const cleanPrompt = visualClauses.join(', ');
  if (cleanPrompt.toLowerCase().includes(NO_RENDERED_TEXT_INSTRUCTION.toLowerCase())) {
    return cleanPrompt;
  }

  return `${cleanPrompt}. ${NO_RENDERED_TEXT_INSTRUCTION}.`;
}
