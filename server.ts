import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  GoogleGenAI,
  Type,
  type FunctionDeclaration,
  type GenerateContentResponse,
} from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const GEMINI_MODEL = 'gemini-4-hydrogen';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const addRecipeTool: FunctionDeclaration = {
  name: 'add_recipe_to_box',
  description:
    'Create and save a complete, editable recipe card in the user Recipe Box. Use this whenever the user asks to add, import, extract, or create a recipe from text, a name, a URL, or a photo of a dish or recipe card. Use Google Search first when looking up a real recipe by name or URL to ensure accurate ingredients and nutrition/macros.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Clear, appetizing recipe title.' },
      category: {
        type: Type.STRING,
        description:
          'Category such as Dinner, Lunch, Breakfast, Snacks & Smoothies, or Dessert.',
      },
      prepTime: { type: Type.STRING, description: 'Estimated prep time, e.g. "15 Mins".' },
      cookTime: { type: Type.STRING, description: 'Estimated cook time, e.g. "25 Mins".' },
      servings: { type: Type.NUMBER, description: 'Number of servings, e.g. 4.' },
      calories: { type: Type.NUMBER, description: 'Estimated calories per serving.' },
      protein: { type: Type.NUMBER, description: 'Estimated grams of protein per serving.' },
      carbs: { type: Type.NUMBER, description: 'Estimated grams of carbs per serving.' },
      fat: { type: Type.NUMBER, description: 'Estimated grams of fat per serving.' },
      ingredients: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'List of ingredients with exact quantities.',
      },
      steps: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Clear step-by-step cooking instructions.',
      },
      notes: {
        type: Type.STRING,
        description: 'Optional chef tips, pairings, or source notes.',
      },
    },
    required: [
      'title',
      'category',
      'prepTime',
      'cookTime',
      'servings',
      'calories',
      'protein',
      'carbs',
      'fat',
      'ingredients',
      'steps',
    ],
  },
};

const addWatchlistTool: FunctionDeclaration = {
  name: 'add_to_watchlist',
  description:
    'Add a movie, TV series, book, or podcast into the user Watchlist tracker. Use Google Search first when the user requests a movie or TV show by name or uploads a poster so seasonsCount, totalProgress (episode count), genre, and streaming platform are verified from live data.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Title of the movie, TV series, book, or podcast.' },
      type: {
        type: Type.STRING,
        description: 'Must be one of: "Series", "Movie", "Book", "Podcast".',
      },
      genre: { type: Type.STRING, description: 'Primary genre(s), e.g. "Sci-Fi / Thriller".' },
      platform: {
        type: Type.STRING,
        description: 'Streaming platform or format, e.g. "Netflix", "Apple TV+", "HBO Max", "Hulu".',
      },
      totalProgress: {
        type: Type.NUMBER,
        description: 'Total episodes (for Series), 1 (for Movie), or total pages/episodes.',
      },
      seasonsCount: {
        type: Type.NUMBER,
        description: 'Total number of aired seasons if it is a TV series.',
      },
      unit: {
        type: Type.STRING,
        description: 'Unit such as "episodes", "movie", or "pages".',
      },
      status: {
        type: Type.STRING,
        description: 'Status: "Want to Watch", "In Progress", or "Finished". Defaults to "Want to Watch".',
      },
      rating: {
        type: Type.NUMBER,
        description: 'Rating 1-5 (use 5 for acclaimed picks).',
      },
      notes: {
        type: Type.STRING,
        description: 'Brief synopsis or key details.',
      },
    },
    required: ['title', 'type', 'genre', 'totalProgress', 'unit'],
  },
};

const addKanbanTaskTool: FunctionDeclaration = {
  name: 'add_kanban_task',
  description:
    'Add a task card to the user Kanban Task Board and Daily To-Do list. Use this when the user asks to add tasks, reminders, or to-dos from text or a photo of a handwritten to-do list.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Concise actionable task title.' },
      description: { type: Type.STRING, description: 'Additional details or context.' },
      column: {
        type: Type.STRING,
        description: 'Target column: "overdue", "high", "medium", "low", or "done". Default "medium".',
      },
      priority: {
        type: Type.STRING,
        description: 'Priority level: "low", "medium", or "high".',
      },
      dueDate: {
        type: Type.STRING,
        description: 'Due date in YYYY-MM-DD format if specified or today 2026-11-13.',
      },
      frequency: {
        type: Type.STRING,
        description: '"Once", "Daily", "Weekly", or "Monthly".',
      },
      tags: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Short category tags like ["Home", "Errands"].',
      },
    },
    required: ['title', 'priority', 'column'],
  },
};

const addGroceryItemsTool: FunctionDeclaration = {
  name: 'add_grocery_items',
  description:
    'Add one or more grocery items to the user Grocery List. Use this when the user lists ingredients, shares a grocery receipt photo, or shares a handwritten shopping list photo.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      items: {
        type: Type.ARRAY,
        description: 'List of grocery items to add.',
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Item name, e.g. "Organic Avocados".' },
            category: {
              type: Type.STRING,
              description:
                'One of: "Produce", "Meat & Seafood", "Dairy", "Bakery", "Pantry", "Beverages", "Household".',
            },
            quantity: { type: Type.STRING, description: 'Quantity string, e.g. "2 lbs" or "1 carton".' },
          },
          required: ['name', 'category', 'quantity'],
        },
      },
    },
    required: ['items'],
  },
};

const addNoteTool: FunctionDeclaration = {
  name: 'add_note',
  description:
    'Save an extracted note, journal entry, or transcribed handwritten note into the user Notes tab.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Descriptive note title.' },
      content: { type: Type.STRING, description: 'Complete transcribed or organized note body.' },
      category: {
        type: Type.STRING,
        description: 'Must be one of: "Personal", "Ideas", "Journal", "Recipes", "Lists".',
      },
      pinned: {
        type: Type.BOOLEAN,
        description: 'Whether to pin the note at the top.',
      },
    },
    required: ['title', 'content', 'category'],
  },
};

const SYSTEM_INSTRUCTION = `You are the built-in LifeBinder Mission Control AI Assistant powered by Gemini with Live Google Search Grounding and Image Understanding.

You have direct access to save items into the user's command center tabs:
1. Recipes (from prompts, dish names, pasted text, URLs, or uploaded photos of a recipe card or cooked dish) -> use Google Search to verify authentic ingredients, cook times, servings, and accurate nutrition/macros if searching by name, then call add_recipe_to_box.
2. Movies, TV Series, Books, or Podcasts (by name, recommendation, or uploaded poster photo) -> use Google Search to pull verified genres, streaming platform, total seasons (seasonsCount), and episode counts (totalProgress), then call add_to_watchlist.
3. Tasks or To-Dos (from text or uploaded photo of a handwritten checklist) -> call add_kanban_task (you can invoke it multiple times for multiple tasks).
4. Grocery items (from text, missing recipe ingredients, grocery receipts, or handwritten grocery lists) -> call add_grocery_items with clean item names, categories, and quantities.
5. Handwritten notes, ideas, or reminders (from text or uploaded photo of a handwritten note) -> call add_note with the transcribed text cleanly formatted.

When an image is attached, analyze every visual detail carefully: read handwritten notes word-for-word, extract line items and quantities from grocery receipts, identify cooked dishes or recipe cards, or recognize movie/TV show posters. The user's uploaded photo is automatically attached as the cover image on saved Recipe, Watchlist, and Note cards.

Keep your spoken/text summary concise, accurate, warm, and clear.`;

interface AssistantRequestBody {
  message?: string;
  history?: Array<{ role: 'user' | 'model'; text: string }>;
  imageBase64?: string;
  imageMimeType?: string;
}

interface CoverImageRequestBody {
  title?: string;
  kind?: 'recipe' | 'exercise' | 'watchlist' | 'custom';
  subtitle?: string;
  customPrompt?: string;
}

interface GroundedSource {
  title: string;
  uri: string;
}

function extractGroundedSources(responses: Array<GenerateContentResponse | undefined>): GroundedSource[] {
  const seen = new Set<string>();
  const sources: GroundedSource[] = [];

  for (const resp of responses) {
    const chunks = resp?.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (!Array.isArray(chunks)) continue;
    for (const chunk of chunks) {
      const uri = chunk?.web?.uri;
      if (uri && !seen.has(uri)) {
        seen.add(uri);
        let fallbackTitle = uri;
        try {
          fallbackTitle = new URL(uri).hostname;
        } catch {
          fallbackTitle = uri;
        }
        sources.push({
          title: chunk.web?.title || fallbackTitle,
          uri,
        });
      }
    }
  }
  return sources.slice(0, 6);
}

function sanitizeSvg(rawSvg: string, width: number, height: number, title: string): string {
  const trimmed = rawSvg.trim();
  const startIdx = trimmed.indexOf('<svg');
  const endIdx = trimmed.lastIndexOf('</svg>');

  if (startIdx >= 0 && endIdx > startIdx) {
    let svg = trimmed.slice(startIdx, endIdx + 6);
    svg = svg.replace(/<script[\s\S]*?<\/script>/gi, '');
    svg = svg.replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
    svg = svg.replace(/javascript:/gi, '');
    if (!/xmlns\s*=/.test(svg)) {
      svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!/viewBox\s*=/.test(svg)) {
      svg = svg.replace('<svg', `<svg viewBox="0 0 ${width} ${height}"`);
    }
    return svg;
  }

  const safeTitle = title.replace(/[<>&"']/g, '').slice(0, 42) || 'Mission Control Cover';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1c0f19"/>
        <stop offset="55%" stop-color="#2d1b28"/>
        <stop offset="100%" stop-color="#be7fab"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="42%" r="45%">
        <stop offset="0%" stop-color="#efd0e5" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="#120a10" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <circle cx="${width / 2}" cy="${height * 0.44}" r="${Math.min(width, height) * 0.34}" fill="url(#glow)"/>
    <circle cx="${width / 2}" cy="${height * 0.44}" r="${Math.min(width, height) * 0.19}" fill="none" stroke="#daabcb" stroke-width="2" stroke-dasharray="6 6"/>
    <text x="${width / 2}" y="${height * 0.78}" text-anchor="middle" fill="#efd0e5" font-family="system-ui, sans-serif" font-size="26" font-weight="700">${safeTitle}</text>
  </svg>`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  app.post('/api/gemini/assistant', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured in Settings > Secrets.',
        });
      }

      const body = (req.body || {}) as AssistantRequestBody;
      const userMessage =
        (body.message || '').trim() ||
        (body.imageBase64
          ? 'Please analyze this image carefully and save the extracted recipe, groceries, notes, tasks, or watchlist show into my planner.'
          : '');

      if (!userMessage && !body.imageBase64) {
        return res.status(400).json({ error: 'Please enter a message or attach an image.' });
      }

      const historyContents = (body.history || []).slice(-10).map((turn) => ({
        role: turn.role,
        parts: [{ text: turn.text }],
      }));

      const currentParts: Array<
        { text: string } | { inlineData: { mimeType: string; data: string } }
      > = [];
      if (body.imageBase64 && body.imageMimeType) {
        currentParts.push({
          inlineData: {
            mimeType: body.imageMimeType,
            data: body.imageBase64,
          },
        });
      }
      currentParts.push({ text: userMessage });

      // Hybrid mode: Google Search Grounding + Direct App Function Calling
      const tools = [
        { googleSearch: {} },
        {
          functionDeclarations: [
            addRecipeTool,
            addWatchlistTool,
            addKanbanTaskTool,
            addGroceryItemsTool,
            addNoteTool,
          ],
        },
      ];
      const toolConfig = { includeServerSideToolInvocations: true };

      const contents = [
        ...historyContents,
        { role: 'user', parts: currentParts },
      ];

      const response1 = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools,
          toolConfig,
        },
      });

      const collectedActions: Array<{ type: string; payload: Record<string, unknown> }> = [];
      const functionCalls = response1.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
        const functionResponseParts = functionCalls.map((fc) => {
          const args = (fc.args || {}) as Record<string, unknown>;
          collectedActions.push({
            type: fc.name || 'unknown',
            payload: args,
          });
          return {
            functionResponse: {
              id: fc.id,
              name: fc.name || 'unknown',
              response: {
                status: 'success',
                saved: true,
                summary: `Successfully saved via ${fc.name}`,
              },
            },
          };
        });

        const previousContent = response1.candidates?.[0]?.content;
        let response2: GenerateContentResponse | undefined;
        let finalReply = response1.text || '';

        if (previousContent) {
          response2 = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
              ...contents,
              previousContent,
              {
                role: 'user',
                parts: functionResponseParts,
              },
            ],
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              tools,
              toolConfig,
            },
          });
          finalReply = response2.text || finalReply;
        }

        if (!finalReply.trim()) {
          finalReply = `Done! I synced ${collectedActions.length} update${
            collectedActions.length > 1 ? 's' : ''
          } into your LifeBinder.`;
        }

        const sources = extractGroundedSources([response1, response2]);

        return res.json({
          reply: finalReply,
          actions: collectedActions,
          sources,
        });
      }

      const sources = extractGroundedSources([response1]);
      return res.json({
        reply: response1.text || 'I processed your request.',
        actions: [],
        sources,
      });
    } catch (err: unknown) {
      console.error('Gemini assistant error:', err);
      const message =
        err instanceof Error ? err.message : 'Failed to communicate with Gemini API.';
      return res.status(500).json({ error: message });
    }
  });

  app.post('/api/gemini/cover-image', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured in Settings > Secrets.',
        });
      }

      const body = (req.body || {}) as CoverImageRequestBody;
      const title = (body.title || body.customPrompt || '').trim();
      const kind = body.kind || 'custom';
      const subtitle = (body.subtitle || '').trim();

      if (!title) {
        return res.status(400).json({ error: 'Please provide a title or visual prompt.' });
      }

      const dimensions =
        kind === 'watchlist'
          ? { width: 600, height: 800, ratioDesc: 'vertical 3:4 theatrical poster' }
          : kind === 'custom'
          ? { width: 800, height: 600, ratioDesc: '4:3 aesthetic cover artwork' }
          : { width: 800, height: 500, ratioDesc: '16:10 editorial banner cover' };

      const domainDirection =
        kind === 'recipe'
          ? 'Bespoke editorial food & culinary illustration showing plated food, aromatic herbs, steam, ceramic dishware, warm golden lighting accented with deep plum & rose-mauve highlights.'
          : kind === 'exercise'
          ? 'Sleek futuristic fitness & athletic illustration featuring a dynamic stylized silhouette performing the movement, glowing motion arcs, subtle anatomical energy lines in rose-mauve neon on deep plum.'
          : kind === 'watchlist'
          ? 'Dramatic atmospheric cinema poster illustration with expressive focal silhouette/scene art, volumetric spotlight rays, moody film framing, and refined title treatment.'
          : 'Tactile luxury editorial illustration matching the prompt with rich layered geometry, atmospheric glow, and cohesive composition.';

      const coverPrompt = `Generate a high-craft, visually stunning bespoke SVG cover illustration for:
Title: "${title}"
Kind: ${kind} (${dimensions.ratioDesc})
${subtitle ? `Context / Genre / Target: ${subtitle}` : ''}
${body.customPrompt ? `Custom Creative Direction: ${body.customPrompt}` : ''}

Design Guidelines:
- Canvas: exact viewBox="0 0 ${dimensions.width} ${dimensions.height}", xmlns="http://www.w3.org/2000/svg".
- Art Direction: ${domainDirection}
- Palette harmonizing with the user's dark rose-mauve Mission Control theme (#120a10 deep plum-black, #1c0f19 midnight plum, #be7fab deep berry mauve, #d29ec2 muted mauve, #daabcb medium rose, #e6c3db soft petal, #efd0e5 blush glow, plus tasteful natural culinary/cinematic warm highlights where appropriate).
- Include <defs> with linearGradient and radialGradient depth, rich foreground/midground/background vector shapes, decorative frame corners or lighting beams, and crisp typography displaying the title cleanly with high contrast.
- Return valid standalone SVG markup only in the "svg" field (no markdown code fences, no script tags).`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: coverPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              svg: {
                type: Type.STRING,
                description: 'Complete valid <svg>...</svg> markup.',
              },
              caption: {
                type: Type.STRING,
                description: 'Short 1-sentence description of the generated cover illustration.',
              },
            },
            required: ['svg', 'caption'],
          },
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim()) as {
        svg?: string;
        caption?: string;
      };

      const cleanSvg = sanitizeSvg(
        parsed.svg || '',
        dimensions.width,
        dimensions.height,
        title
      );
      const imageDataUrl = `data:image/svg+xml;base64,${Buffer.from(cleanSvg, 'utf8').toString('base64')}`;

      return res.json({
        imageDataUrl,
        caption: parsed.caption || `Generated custom ${kind} cover art for "${title}"`,
      });
    } catch (err: unknown) {
      console.error('Gemini cover image error:', err);
      const message =
        err instanceof Error ? err.message : 'Failed to generate cover image.';
      return res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LifeBinder Mission Control server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
