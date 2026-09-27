// Sonar Distance Radar Engine for GitHunt
// Deterministic path similarity & line fathom proximity calculator

import { Temperature, SonarState, PirateRank } from '../types/githunt';

/**
 * Calculates path similarity and temperature between current file and target treasure file
 */
export function calculateSonarState(
  currentFilePath: string,
  targetFilePath: string,
  currentLine?: number,
  targetLine?: number
): SonarState {
  if (!currentFilePath || !targetFilePath) {
    return {
      currentFilePath: currentFilePath || '',
      temperature: 'frozen',
      similarityPercent: 0,
      fathomsDistance: null,
      statusMessage: '🧊 FROZEN — No coordinates locked on radar.',
    };
  }

  const normCurrent = currentFilePath.replace(/\\/g, '/').toLowerCase();
  const normTarget = targetFilePath.replace(/\\/g, '/').toLowerCase();

  // 1. Exact file match -> BURNING HOT!
  if (normCurrent === normTarget) {
    let lineDist: number | null = null;
    let message = "🔥 BURNING HOT! Ye be inside the treasure cove!";

    if (currentLine !== undefined && targetLine !== undefined && currentLine > 0) {
      lineDist = Math.abs(currentLine - targetLine);
      if (lineDist === 0) {
        message = "💥 X MARKS THE EXACT SPOT! Dig here!";
      } else if (lineDist <= 3) {
        message = `🔥 SCORCHING! The treasure be right here (${lineDist} fathom${lineDist === 1 ? '' : 's'} ${currentLine < targetLine ? 'below' : 'above'})!`;
      } else if (lineDist <= 10) {
        message = `🌡️ VERY WARM! Dig roughly ${lineDist} fathoms ${currentLine < targetLine ? 'further down' : 'higher up'}!`;
      } else {
        message = `🔥 HOT! The treasure be in this file, roughly ${lineDist} lines away!`;
      }
    }

    return {
      currentFilePath,
      temperature: 'hot',
      similarityPercent: 96,
      fathomsDistance: lineDist,
      statusMessage: message,
    };
  }

  // 2. Tokenize path segments
  const currentParts = normCurrent.split('/').filter(Boolean);
  const targetParts = normTarget.split('/').filter(Boolean);

  const currentDirParts = currentParts.slice(0, -1);
  const targetDirParts = targetParts.slice(0, -1);

  // Check matching directory prefix
  let matchingPrefixCount = 0;
  const minDirLen = Math.min(currentDirParts.length, targetDirParts.length);

  for (let i = 0; i < minDirLen; i++) {
    if (currentDirParts[i] === targetDirParts[i]) {
      matchingPrefixCount++;
    } else {
      break;
    }
  }

  const isSameDirectory = currentDirParts.join('/') === targetDirParts.join('/');
  const maxParts = Math.max(currentParts.length, targetParts.length);

  let similarityScore = 0;

  if (isSameDirectory && currentDirParts.length > 0) {
    // Same directory!
    similarityScore = 78;
  } else if (matchingPrefixCount > 0) {
    // Shared ancestor folders
    const prefixRatio = matchingPrefixCount / maxParts;
    similarityScore = Math.round(25 + prefixRatio * 45);
  } else {
    // Unrelated top-level directories
    similarityScore = 8;
  }

  // Determine temperature tier
  let temperature: Temperature = 'frozen';
  let statusMessage = '🧊 FROZEN — Waters be quiet. Seek a different shore.';

  if (similarityScore >= 70) {
    temperature = 'warm';
    statusMessage = '🌡️ WARM! Ye are anchored in the target cove/directory!';
  } else if (similarityScore >= 30) {
    temperature = 'cold';
    statusMessage = '❄️ COLD! Sailing in the right region, but not the correct bay.';
  } else {
    temperature = 'frozen';
    statusMessage = '🧊 FROZEN! Far off course, Captain. Check your map.';
  }

  return {
    currentFilePath,
    temperature,
    similarityPercent: similarityScore,
    fathomsDistance: null,
    statusMessage,
  };
}

/**
 * Calculates score based on the PRD formula:
 * score = base_points - (hints_used * 100) - (wrong_attempts * 50) + speed_bonus
 */
export function calculateGameScore(
  timeSpentSeconds: number,
  wrongAttempts: number,
  hintsUsed: number
) {
  const basePoints = 1000;
  const hintPenalty = hintsUsed * 80;
  const attemptPenalty = wrongAttempts * 40;
  
  // Speed bonus if found quickly (< 3 min)
  let speedBonus = 0;
  if (timeSpentSeconds < 60) {
    speedBonus = 250;
  } else if (timeSpentSeconds < 120) {
    speedBonus = 150;
  } else if (timeSpentSeconds < 180) {
    speedBonus = 75;
  }

  const doubloons = Math.max(100, basePoints - hintPenalty - attemptPenalty + speedBonus);
  const accuracyPercent = Math.max(10, Math.round(100 / (wrongAttempts + 1)));

  let rank: PirateRank = {
    title: 'Rookie Deckhand',
    badge: '🏴‍☠️',
    color: '#94A3B8',
    tier: 'Deckhand',
  };

  if (doubloons >= 950) {
    rank = {
      title: 'Grand Pirate King of Clean Code',
      badge: '👑',
      color: '#F59E0B',
      tier: 'Legendary' as const,
    };
  } else if (doubloons >= 800) {
    rank = {
      title: 'Master Code Buccaneer',
      badge: '🥇',
      color: '#FBBF24',
      tier: 'Master' as const,
    };
  } else if (doubloons >= 600) {
    rank = {
      title: 'Swashbuckling Architect',
      badge: '🥈',
      color: '#38BDF8',
      tier: 'Veteran' as const,
    };
  } else if (doubloons >= 400) {
    rank = {
      title: 'Able-Bodied Code Mariner',
      badge: '🥉',
      color: '#34D399',
      tier: 'Swashbuckler' as const,
    };
  }

  return {
    doubloons,
    timeSpentSeconds,
    wrongAttempts,
    hintsUsed,
    accuracyPercent,
    pirateRank: rank,
  };
}
