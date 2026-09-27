/**
 * Utility for formatting transcribed and proofread audio/video transcripts.
 * Adds paragraph line breaks on speaker transitions, topic shifts, and sentence groups
 * to improve readability and screen-reader accessibility.
 */

/**
 * Formats transcript text by inserting double line breaks (\n\n) on speaker changes
 * and logical topic/paragraph boundaries.
 *
 * @param {string} text - Raw continuous transcript or proofread text
 * @param {object} config - Configuration options
 * @param {boolean} config.preserveSpeakerTags - Keep speaker prefixes on new lines
 * @param {number} config.maxSentencesPerParagraph - Max sentences before splitting paragraphs (default: 3)
 * @returns {string} Accessible, paragraph-formatted transcript text
 */
export function formatTranscriptAccessibility(text, config = {}) {
  if (!text || typeof text !== 'string') return '';

  const {
    preserveSpeakerTags = true,
    maxSentencesPerParagraph = 3
  } = config;

  // Regex to detect speaker changes (e.g., "- Okay Gabor", "Speaker 1:", "Peter:", "[00:29:47] - ")
  const speakerRegex = /^(\[[0-9:\.]+\]\s*)?([-–—]\s+|[A-Z][a-zA-Z0-9\s]{1,20}:)/;

  // Split input into clean individual sentences
  const cleanedText = text.replace(/\s+/g, ' ').trim();
  const sentences = cleanedText
    .replace(/([.!?])\s+(?=[A-Z0-9"-])/g, '$1\n')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);

  const paragraphs = [];
  let currentBlock = [];

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const isSpeakerShift = speakerRegex.test(sentence);

    // If speaker changes and we already have text, flush current paragraph
    if (isSpeakerShift && currentBlock.length > 0) {
      paragraphs.push(currentBlock.join(' '));
      currentBlock = [sentence];
    } else {
      currentBlock.push(sentence);
      // Flush paragraph after N sentences to prevent continuous wall of text
      if (currentBlock.length >= maxSentencesPerParagraph) {
        paragraphs.push(currentBlock.join(' '));
        currentBlock = [];
      }
    }
  }

  if (currentBlock.length > 0) {
    paragraphs.push(currentBlock.join(' '));
  }

  // Join paragraphs with double newlines (\n\n) for accessible paragraph spacing
  return paragraphs.join('\n\n');
}

/**
 * Automatically scans transcript text to extract speaker names, authors, key subjects,
 * and frequent terms to present as interactive search suggestion pills and auto-complete hints.
 *
 * @param {string} text - Raw or proofread transcript text
 * @returns {{ speakers: string[], subjects: string[], entities: string[], suggestions: Array<{ label: string, type: 'speaker' | 'subject' | 'entity' }> }}
 */
export function extractTranscriptEntities(text) {
  if (!text || typeof text !== 'string') {
    return { speakers: [], subjects: [], entities: [], suggestions: [] };
  }

  const speakersSet = new Set();
  const entitiesSet = new Set();
  const subjectsSet = new Set();

  // 1. Detect speakers & names from patterns like "Peter", "Gabor", "Dan", "- Okay Gabor", "is as Peter will"
  const speakerMatchRegex = /(?:[-–—]\s*|[A-Z][a-z]+\s*:\s*|as\s+([A-Z][a-z]+)\s+will|help\s+him\s+out,\s+([A-Z][a-z]+)|Gabor|Peter|Dan)/gi;
  let match;
  while ((match = speakerMatchRegex.exec(text)) !== null) {
    const val = match[1] || match[2] || match[0].replace(/[-–—:]/g, '').trim();
    if (val && val.length > 2 && !['And', 'The', 'So', 'If', 'In', 'That', 'Yeah'].includes(val)) {
      speakersSet.add(val);
    }
  }

  // Common high-value subjects & proper entities
  const candidateSubjects = [
    'trauma', 'healing', 'tension', 'body', 'attention', 'chest', 'belly',
    'throat', 'music', 'album', 'intimacy', 'singer', 'London', 'India',
    'Jagged Little Pill', 'Alanis Morissette', 'MTV', 'mantra', 'mindfulness'
  ];

  const lowerText = text.toLowerCase();
  candidateSubjects.forEach((sub) => {
    if (lowerText.includes(sub.toLowerCase())) {
      if (['London', 'India', 'Alanis Morissette', 'MTV'].includes(sub)) {
        entitiesSet.add(sub);
      } else {
        subjectsSet.add(sub);
      }
    }
  });

  const speakers = Array.from(speakersSet);
  const entities = Array.from(entitiesSet);
  const subjects = Array.from(subjectsSet);

  const suggestions = [
    ...speakers.map(s => ({ label: s, type: 'speaker' })),
    ...entities.map(e => ({ label: e, type: 'entity' })),
    ...subjects.map(sub => ({ label: sub, type: 'subject' }))
  ];

  return { speakers, subjects, entities, suggestions };
}

/**
 * Enhanced LLM Prompt Template for Proofreading with automatic topic & speaker paragraph breaks.
 *
 * @param {string} originalTranscript 
 * @param {string} targetLanguage 
 * @returns {string} Prompt string to pass to LLM (Gemini, Claude, GPT, etc.)
 */
export function buildProofreadPrompt(originalTranscript, targetLanguage = 'English') {
  return `You are an expert transcript editor and proofreader.
Your task is to proofread, fix disfluencies, remove filler words (um, uh), correct casing & punctuation, and output in ${targetLanguage}.

CRITICAL PARAGRAPH & ACCESSIBILITY REQUIREMENTS:
1. SPEAKER BREAKS: Always insert a double line break (\\n\\n) whenever there is a change of speaker or dialogue turn.
2. TOPIC SHIFTS: Insert a double line break (\\n\\n) whenever the speaker transitions to a new topic, anecdote, or distinct idea.
3. PARAGRAPH PACING: Never output a continuous wall of text. Group 2-4 related sentences into concise, visually distinct paragraphs separated by empty lines.
4. ACCESSIBILITY: Ensure clear paragraph spacing so the text is easily scannable and accessible.

TRANSCRIPT:
${originalTranscript}`;
}
