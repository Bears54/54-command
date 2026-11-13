import { HomeProject, NoteItem, PageId, WatchlistMediaItem } from '../types/binder';
import { RecipeCardItem } from '../types/mealPlanning';

export type GlobalSearchCategory = 'Project' | 'Note' | 'Recipe' | 'Watchlist';

export interface GlobalSearchResult {
  id: string;
  category: GlobalSearchCategory;
  title: string;
  subtitle: string;
  meta: string;
  targetPage: PageId;
  mealsSubTab?: 'recipes';
  score: number;
  matchedIndices: number[];
}

function computeEditDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      if (a[i - 1] === b[j - 1]) {
        dp[j] = prev;
      } else {
        dp[j] = 1 + Math.min(prev, dp[j], dp[j - 1]);
      }
      prev = temp;
    }
  }
  return dp[n];
}

interface MatchOutput {
  score: number;
  indices: number[];
}

/**
 * Multi-signal fuzzy matcher:
 * 1. Exact prefix & substring boosts
 * 2. Word-boundary & contiguous character run rewards
 * 3. Ordered subsequence matching (e.g. "lndpd" -> "Build Laundry Pedestal")
 * 4. Typo tolerance via bounded word-level Levenshtein distance
 */
export function fuzzyMatchText(rawQuery: string, rawTarget: string): MatchOutput | null {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return null;

  const target = rawTarget.toLowerCase();
  if (!target) return null;

  // 1. Exact substring check (highest precision)
  const directIdx = target.indexOf(query);
  if (directIdx !== -1) {
    const isStart = directIdx === 0;
    const isBoundary =
      directIdx > 0 && /[\s\-_/,.:;]/.test(target[directIdx - 1]);
    const indices = Array.from({ length: query.length }, (_, i) => directIdx + i);
    const lengthBonus = Math.round((query.length / Math.max(target.length, 1)) * 30);
    const base = isStart ? 240 : isBoundary ? 200 : 155;
    return { score: base + lengthBonus, indices };
  }

  // 2. Ordered subsequence match across the whole target string
  let qIdx = 0;
  const matchedIndices: number[] = [];
  let consecutive = 0;
  let score = 0;

  for (let tIdx = 0; tIdx < target.length && qIdx < query.length; tIdx++) {
    if (target[tIdx] === query[qIdx]) {
      matchedIndices.push(tIdx);
      let charScore = 10;
      if (tIdx === 0) charScore += 22;
      else if (/[\s\-_/,.:;]/.test(target[tIdx - 1])) charScore += 18;
      if (consecutive > 0) charScore += Math.min(consecutive * 12, 36);
      score += charScore;
      consecutive++;
      qIdx++;
    } else {
      if (query[qIdx] === ' ') {
        qIdx++;
        tIdx--;
      } else {
        consecutive = 0;
      }
    }
  }

  if (qIdx === query.length && matchedIndices.length > 0) {
    const span = matchedIndices[matchedIndices.length - 1] - matchedIndices[0] + 1;
    const compactnessPenalty = Math.max(0, span - query.length) * 1.5;
    return {
      score: Math.max(45, Math.round(score - compactnessPenalty)),
      indices: matchedIndices,
    };
  }

  // 3. Multi-token query or typo tolerance on words (for 3+ char queries)
  const queryTokens = query.split(/\s+/).filter(Boolean);
  const targetWords = target.split(/[\s\-_/,.:;]+/).filter(Boolean);

  if (queryTokens.length > 1) {
    let totalScore = 0;
    let allTokensMatched = true;
    const tokenIndices: number[] = [];

    for (const token of queryTokens) {
      const sub = fuzzyMatchText(token, target);
      if (!sub) {
        allTokensMatched = false;
        break;
      }
      totalScore += sub.score;
      tokenIndices.push(...sub.indices);
    }

    if (allTokensMatched) {
      return {
        score: Math.round(totalScore / queryTokens.length) + 25,
        indices: Array.from(new Set(tokenIndices)).sort((a, b) => a - b),
      };
    }
  }

  if (query.length >= 3) {
    let bestWordScore = 0;
    let bestIndices: number[] = [];

    for (const word of targetWords) {
      if (word.length < 3) continue;
      const maxDist = query.length <= 4 ? 1 : 2;
      const dist = computeEditDistance(query, word.slice(0, Math.min(word.length, query.length + maxDist)));
      const fullDist = computeEditDistance(query, word);
      const bestDist = Math.min(dist, fullDist);

      if (bestDist <= maxDist) {
        const candidateScore = 110 - bestDist * 32;
        if (candidateScore > bestWordScore) {
          bestWordScore = candidateScore;
          const wordStart = target.indexOf(word);
          if (wordStart !== -1) {
            bestIndices = Array.from(
              { length: Math.min(word.length, query.length) },
              (_, i) => wordStart + i
            );
          }
        }
      }
    }

    if (bestWordScore > 0) {
      return { score: bestWordScore, indices: bestIndices };
    }
  }

  return null;
}

export interface GlobalSearchSources {
  homeProjects: HomeProject[];
  notes: NoteItem[];
  recipes: RecipeCardItem[];
  watchlistMedia: WatchlistMediaItem[];
}

export function searchGlobalItems(
  query: string,
  sources: GlobalSearchSources,
  limit: number = 24
): GlobalSearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const results: GlobalSearchResult[] = [];

  // 1. Projects
  for (const project of sources.homeProjects) {
    const titleMatch = fuzzyMatchText(trimmed, project.title);
    const categoryMatch = fuzzyMatchText(trimmed, project.category);
    const taskMatches = project.tasks
      .map((t) => fuzzyMatchText(trimmed, t.text))
      .filter((m): m is MatchOutput => m !== null);
    const bestTaskScore = taskMatches.reduce((max, m) => Math.max(max, m.score), 0);

    const bestScore = Math.max(
      titleMatch ? titleMatch.score + 30 : 0,
      categoryMatch ? Math.round(categoryMatch.score * 0.72) : 0,
      bestTaskScore ? Math.round(bestTaskScore * 0.8) : 0
    );

    if (bestScore > 0) {
      const doneCount = project.tasks.filter((t) => t.done).length;
      results.push({
        id: `project-${project.id}`,
        category: 'Project',
        title: project.title,
        subtitle: `${project.category} · ${project.status}`,
        meta: `${doneCount}/${project.tasks.length} steps (${project.progress}%)`,
        targetPage: 'projects',
        score: bestScore,
        matchedIndices: titleMatch ? titleMatch.indices : [],
      });
    }
  }

  // 2. Notes
  for (const note of sources.notes) {
    const titleMatch = fuzzyMatchText(trimmed, note.title);
    const contentMatch = fuzzyMatchText(trimmed, note.content);
    const categoryMatch = fuzzyMatchText(trimmed, note.category);

    const bestScore = Math.max(
      titleMatch ? titleMatch.score + 30 : 0,
      contentMatch ? Math.round(contentMatch.score * 0.78) : 0,
      categoryMatch ? Math.round(categoryMatch.score * 0.7) : 0
    );

    if (bestScore > 0) {
      const snippet = note.content.replace(/\s+/g, ' ').trim();
      results.push({
        id: `note-${note.id}`,
        category: 'Note',
        title: note.title,
        subtitle: snippet.length > 68 ? `${snippet.slice(0, 68)}…` : snippet,
        meta: note.category,
        targetPage: 'notes',
        score: bestScore,
        matchedIndices: titleMatch ? titleMatch.indices : [],
      });
    }
  }

  // 3. Recipes
  for (const recipe of sources.recipes) {
    const titleMatch = fuzzyMatchText(trimmed, recipe.title);
    const categoryMatch = fuzzyMatchText(trimmed, recipe.category);
    const ingredientScore = recipe.ingredients.reduce((max, ing) => {
      const m = fuzzyMatchText(trimmed, ing);
      return m ? Math.max(max, m.score) : max;
    }, 0);

    const bestScore = Math.max(
      titleMatch ? titleMatch.score + 30 : 0,
      categoryMatch ? Math.round(categoryMatch.score * 0.75) : 0,
      ingredientScore ? Math.round(ingredientScore * 0.82) : 0
    );

    if (bestScore > 0) {
      results.push({
        id: `recipe-${recipe.id}`,
        category: 'Recipe',
        title: recipe.title,
        subtitle: `${recipe.category} · ${recipe.prepTime} prep`,
        meta: `${recipe.macros.calories} kcal · ${recipe.macros.protein}g P`,
        targetPage: 'meals',
        mealsSubTab: 'recipes',
        score: bestScore,
        matchedIndices: titleMatch ? titleMatch.indices : [],
      });
    }
  }

  // 4. Watchlist
  for (const media of sources.watchlistMedia) {
    const titleMatch = fuzzyMatchText(trimmed, media.title);
    const genreMatch = fuzzyMatchText(trimmed, media.genre || '');
    const platformMatch = fuzzyMatchText(trimmed, media.platform || '');
    const notesMatch = fuzzyMatchText(trimmed, media.notes || '');

    const bestScore = Math.max(
      titleMatch ? titleMatch.score + 30 : 0,
      genreMatch ? Math.round(genreMatch.score * 0.78) : 0,
      platformMatch ? Math.round(platformMatch.score * 0.74) : 0,
      notesMatch ? Math.round(notesMatch.score * 0.68) : 0
    );

    if (bestScore > 0) {
      results.push({
        id: `watchlist-${media.id}`,
        category: 'Watchlist',
        title: media.title,
        subtitle: `${media.type} · ${media.genre}${media.platform ? ` · ${media.platform}` : ''}`,
        meta: `${media.status} (${media.currentProgress}/${media.totalProgress})`,
        targetPage: 'watchlist',
        score: bestScore,
        matchedIndices: titleMatch ? titleMatch.indices : [],
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
