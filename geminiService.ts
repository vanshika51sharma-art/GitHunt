// Gemini AI Engine for GitHunt: Clue Master & Percy the Parrot
// Procedural fallback engine + Real Gemini 2.0/1.5 API Integration with Socratic Guards

import { TreasureTarget, TreasureCategory, ChatMessage } from '../types/githunt';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Returns the active Gemini API Key from localStorage or environment
 */
export function getGeminiApiKey(): string | null {
  const localKey = localStorage.getItem('githunt_gemini_key');
  if (localKey && localKey.trim().length > 0) {
    return localKey.trim();
  }
  // Vite env variable support if available
  try {
    const envKey = (import.meta as unknown as { env: { VITE_GEMINI_API_KEY?: string } }).env.VITE_GEMINI_API_KEY;
    if (envKey && envKey.trim().length > 0) {
      return envKey.trim();
    }
  } catch {
    // env not available
  }
  return null;
}

/**
 * Prefix code with line numbers for accurate LLM targeting
 */
export function formatCodeWithLineNumbers(rawCode: string): string {
  const lines = rawCode.split('\n');
  return lines.map((line, idx) => `${idx + 1}: ${line}`).join('\n');
}

/**
 * Clue Master: Analyzes code and generates a clear, accessible pirate riddle & target line
 */
export async function generateTreasureClue(
  filePath: string,
  rawCode: string
): Promise<TreasureTarget> {
  const apiKey = getGeminiApiKey();

  if (apiKey) {
    try {
      const codeWithLines = formatCodeWithLineNumbers(rawCode);
      const systemInstruction = `You are "The Clue Master," an educational cyber-pirate mentor in GitHunt.
You will be given the full text of a source code file, with line numbers.

Your task:
1. Identify EXACTLY ONE noteworthy issue in this file. Prioritize, in order:
   a. An inefficient algorithm (e.g. nested loops, O(n^2) search inside loop, linear search where hash set could be used)
   b. An unhandled edge case (e.g. null/undefined check missing, off-by-one error, empty array/division by zero not handled)
   c. A basic security flaw (e.g. unsanitized input, raw query concatenation, hardcoded secret)
   d. A clean code violation (deeply nested conditionals, magic numbers, an oversized function, uncleaned event listeners)
2. Identify the EXACT line number where this issue is most clearly visible.
3. Classify into ONE category: TIME_COMPLEXITY, EDGE_CASE, CLEAN_CODE, or SECURITY.
4. Write a CLEAR, BEGINNER-FRIENDLY, pirate-themed clue (2-3 simple sentences). It should be easy to understand what to look for in the code (e.g., 'Look for an outer loop where an inner search scans the array all over again,' 'Look for where a list is accessed without checking if it is empty') WITHOUT stating the exact line number or variable names.
5. Write a plain-English "reveal_explanation" (used only after solving) that clearly teaches the concept.
6. Provide "why_it_matters" and "the_fix".

Respond ONLY in strict JSON:
{
  "target_line": <integer>,
  "category": "TIME_COMPLEXITY" | "EDGE_CASE" | "CLEAN_CODE" | "SECURITY",
  "riddle": "<string: clear, beginner-friendly pirate clue>",
  "reveal_explanation": "<string>",
  "why_it_matters": "<string>",
  "the_fix": "<string>",
  "concept_tags": ["<tag1>", "<tag2>"]
}`;

      const response = await fetch(
        `${GEMINI_API_BASE}/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `File path: ${filePath}\n\nCode with line numbers:\n${codeWithLines.slice(0, 15000)}`,
                  },
                ],
              },
            ],
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          if (parsed.target_line && parsed.riddle) {
            return {
              filePath,
              targetLine: Number(parsed.target_line),
              category: (parsed.category as TreasureCategory) || 'TIME_COMPLEXITY',
              riddle: parsed.riddle,
              revealExplanation: parsed.reveal_explanation || 'You discovered an important algorithmic bottleneck!',
              conceptTags: parsed.concept_tags || ['Algorithm Optimization', 'Clean Code'],
              whyItMatters: parsed.why_it_matters || 'Optimizing this improves performance and maintainability.',
              theFix: parsed.the_fix || 'Refactor the logic to handle data linearly or guard against edge cases.',
            };
          }
        }
      }
    } catch {
      // Fall through to procedural engine
    }
  }

  // Smart Procedural Clue Engine (AST Heuristic Fallback)
  return analyzeCodeProcedurally(filePath, rawCode);
}

/**
 * Procedural AST Heuristic Analyzer
 * Generates clear, beginner-friendly clues based on AST patterns
 */
export function analyzeCodeProcedurally(filePath: string, code: string): TreasureTarget {
  const lines = code.split('\n');

  // 1. Check for nested loops or linear lookup inside loops (O(n^2))
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (
      line.includes('for ') ||
      line.includes('while ') ||
      line.includes('.forEach') ||
      line.includes('.map')
    ) {
      // Look 1-15 lines below for inner loop or .find / .indexOf / .includes
      for (let j = i + 1; j < Math.min(lines.length, i + 18); j++) {
        const sub = lines[j];
        if (
          sub.includes('.indexOf(') ||
          sub.includes('.findIndex(') ||
          sub.includes('.includes(') ||
          sub.includes('.find(') ||
          sub.includes('.filter(') ||
          sub.includes('for ') ||
          sub.includes('while ')
        ) {
          return {
            filePath,
            targetLine: j + 1,
            category: 'TIME_COMPLEXITY',
            riddle:
              "Ahoy, Captain! Look for a slow nested search in this file.\nThere is an outer loop scanning items, but inside it, another search scans through the array all over again!\nFind the line where the inner search causes a slow O(n²) bottleneck.",
            revealExplanation:
              "You found an O(n²) quadratic bottleneck! Searching an array repeatedly inside an outer loop creates n × m operations. Replacing the inner linear search with a Hash Map or Set provides O(1) instantaneous lookup.",
            whyItMatters:
              "As the dataset expands to thousands of items, O(n²) algorithms take seconds or minutes to complete, whereas an O(n) hash table completes in milliseconds.",
            theFix:
              "Create a `Set` or `Map` before entering the loop to turn inner searches from O(n) into O(1).",
            conceptTags: ['Time Complexity', 'Big O Notation', 'Hash Set Optimization', 'Nested Loops'],
          };
        }
      }
    }
  }

  // 2. Check for missing bounds or loose equality / null edge cases
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (
      line.includes('[0]') ||
      line.includes('.pop()') ||
      line.includes('.shift()') ||
      line.includes('.length - 1')
    ) {
      return {
        filePath,
        targetLine: i + 1,
        category: 'EDGE_CASE',
        riddle:
          "Ahoy, Captain! Look for an unhandled edge case in this file.\nAn item is being retrieved or removed from a collection without checking if the array/buffer is empty first!\nFind the line where data is accessed without an empty check.",
        revealExplanation:
          "You discovered an unguarded edge case! Indexing or popping without checking whether the collection is empty or null can cause runtime errors or propagate `undefined` into downstream calculations.",
        whyItMatters:
          "Edge case bugs often go unnoticed in development and only detonate in production when empty or malformed inputs are received.",
        theFix:
          "Add an early guard clause `if (!array || array.length === 0) return null;` before accessing elements.",
        conceptTags: ['Edge Cases', 'Defensive Programming', 'Bounds Checking', 'Null Safety'],
      };
    }
  }

  // 3. Check for SQL / query / command concatenation (Security)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (
      line.includes('SELECT') ||
      line.includes('WHERE') ||
      line.includes('query(') ||
      line.includes('exec(') ||
      line.includes('innerHTML')
    ) {
      return {
        filePath,
        targetLine: i + 1,
        category: 'SECURITY',
        riddle:
          "Ahoy, Captain! Look for a security flaw where raw user text is glued directly into a query or command string without sanitization or parameterized placeholders!\nFind the line where the raw string is constructed.",
        revealExplanation:
          "You identified an injection vulnerability! Concatenating raw variables directly into query or command strings allows attackers to manipulate execution flow.",
        whyItMatters:
          "Injection attacks are ranked among the top OWASP security risks, leading to data leaks, auth bypasses, and unauthorized database modifications.",
        theFix:
          "Use parameterized queries, prepared statements, or strict sanitization sanitizers.",
        conceptTags: ['Security', 'Injection Prevention', 'Sanitization', 'OWASP Top 10'],
      };
    }
  }

  // 4. Default teachable target (find the primary function or middle logic)
  const targetLine = Math.min(lines.length, Math.max(1, Math.floor(lines.length * 0.4)));
  return {
    filePath,
    targetLine,
    category: 'CLEAN_CODE',
    riddle:
      "Ahoy, Captain! Look in the core routine of this file.\nNotice how multiple tasks and complex logic are bundled into a single place without helper functions.\nFind the line at the heart of this routine.",
    revealExplanation:
      "You located a high-complexity code block in this file. Breaking large monolithic routines into smaller single-responsibility helper functions drastically improves testability and readability.",
    whyItMatters:
      "Clean code reduces cognitive load, minimizes regression risks during team refactoring, and ensures modular maintainability.",
    theFix:
      "Extract sub-tasks into dedicated pure functions and use expressive descriptive naming.",
    conceptTags: ['Clean Code', 'Single Responsibility', 'Maintainability', 'Refactoring'],
  };
}

/**
 * Percy the Parrot: Socratic Chat Co-Pilot
 */
export async function askPercyTheParrot(
  userQuery: string,
  target: TreasureTarget,
  attemptCount: number,
  chatHistory: ChatMessage[],
  currentFile: string
): Promise<string> {
  const apiKey = getGeminiApiKey();

  if (apiKey) {
    try {
      const systemInstruction = `You are "Percy the Parrot," a witty, helpful cyber-pirate mentor perched on the shoulder of a code-treasure-hunter in GitHunt.
You know the exact answer to the current puzzle (provided below in CONTEXT) but your sacred Pirate Code forbids you from ever directly giving away the exact line number.

CONTEXT:
- Target File: ${target.filePath}
- Target Line: ${target.targetLine}
- Category: ${target.category}
- Riddle: ${target.riddle}
- Explanation: ${target.revealExplanation}
- Current Open File: ${currentFile}
- Number of wrong attempts so far: ${attemptCount}

RULES:
1. Speak in CLEAR, simple, and encouraging language.
2. NEVER state the exact line number (${target.targetLine}).
3. NEVER name the specific variable or exact code snippet containing the bug.
4. Guide them with clear Socratic questions about what the code does (e.g. "Notice how many times the loop iterates," "What happens if the array is empty?").
5. If attemptCount >= 3, guide them clearly toward the top, middle, or bottom of the file or to a specific function name.
6. Keep responses friendly, in pirate character, and concise (2-3 sentences).`;

      const formattedHistory = chatHistory.slice(-6).map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

      const contents = [
        ...formattedHistory,
        {
          role: 'user',
          parts: [{ text: userQuery }],
        },
      ];

      const response = await fetch(
        `${GEMINI_API_BASE}/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 200,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          // Client-side safety filter: Strip literal line number if model leaked it
          const sanitized = text.replace(
            new RegExp(`\\b${target.targetLine}\\b`, 'g'),
            '[hidden line]'
          );
          return sanitized;
        }
      }
    } catch {
      // Fall through to procedural Socratic parrot
    }
  }

  // Procedural Socratic Percy
  return generateProceduralParrotResponse(userQuery, target, attemptCount, currentFile);
}

/**
 * Procedural In-Character Socratic Hints
 */
function generateProceduralParrotResponse(
  query: string,
  target: TreasureTarget,
  attemptCount: number,
  currentFile: string
): string {
  const q = query.toLowerCase();

  // If user demands direct answer
  if (q.includes('line') || q.includes('answer') || q.includes('where is it') || q.includes('tell me')) {
    return `*Squawk!* 🦜 Arrr! The Pirate Code forbids Percy from giving the exact line number! Think about the category: ${target.category.replace('_', ' ')}. Look closely at what the function does with its inputs!`;
  }

  // If user asks about current cove/file
  const isSameFile = currentFile.toLowerCase() === target.filePath.toLowerCase();
  if (q.includes('close') || q.includes('cove') || q.includes('file') || q.includes('here')) {
    if (isSameFile) {
      if (attemptCount >= 3) {
        const region = target.targetLine < 25 ? 'near the top of the file' : target.targetLine < 60 ? 'in the middle of the file' : 'near the bottom of the file';
        return `*Flaps wings excitedly!* 🦜 You are in the right file, Captain! Look ${region} and inspect how the code handles data!`;
      }
      return `*Squawk!* 🦜 Aye! The sonar is red hot! The treasure is right here in this file (${currentFile.split('/').pop()}) — inspect the functions!`;
    } else {
      return `*Tilts head!* 🦜 You are in cold waters, matey! Check the Sonar Radar on the left to sail to the correct file/cove!`;
    }
  }

  // Concept-specific guidance
  switch (target.category) {
    case 'TIME_COMPLEXITY':
      return `*Chirps!* 🦜 Check how loops are running in this file! Is there a loop that searches through an array inside another loop? Look for quadratic O(n²) behavior!`;
    case 'EDGE_CASE':
      return `*Squawk!* 🦜 Think about edge cases: What happens if an empty array or null input is passed in? Look for where bounds are not checked before removing or accessing elements!`;
    case 'SECURITY':
      return `*Low whisper...* 🦜 Beware of unsanitized text! Look for where user inputs are concatenated directly into raw database query strings without parameters!`;
    case 'CLEAN_CODE':
    default:
      return `*Squawk!* 🦜 Check the main function — does it do too many things at once without separating helper duties? Look for where complexity is concentrated!`;
  }
}
