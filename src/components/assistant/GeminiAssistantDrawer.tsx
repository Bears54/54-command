import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Camera,
  Image as ImageIcon,
  Loader2,
  ChefHat,
  Tv,
  CheckSquare,
  ShoppingCart,
  StickyNote,
  ArrowRight,
  Trash2,
  Globe,
  Wand2,
  ExternalLink,
  Check,
  Download,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';
import { NoteItem, PageId } from '../../types/binder';
import { CoverKind, generateCoverImage } from '../../utils/coverImageApi';

interface GeminiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ActionResultBadge {
  type: 'recipe' | 'watchlist' | 'kanban' | 'groceries' | 'note';
  label: string;
  targetPage: PageId;
  mealsTab?: 'planner' | 'inventory' | 'recipes';
  entityId?: string;
  entityTitle?: string;
  subtitle?: string;
  hasCover?: boolean;
}

interface GroundedSource {
  title: string;
  uri: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  imagePreviewUrl?: string;
  actions?: ActionResultBadge[];
  sources?: GroundedSource[];
  generatedCover?: {
    imageDataUrl: string;
    title: string;
    kind: CoverKind;
  };
  error?: boolean;
}

export const GeminiAssistantDrawer: React.FC<GeminiAssistantDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    setActivePage,
    setActiveMealsTab,
    addRecipeCard,
    setRecipes,
    recipes,
    addWatchlistMediaItem,
    setWatchlistMedia,
    watchlistMedia,
    addKanbanTask,
    addTodo,
    addGroceryItems,
    addNote,
    celebrate,
  } = useBinder();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Mission Control AI online with Image Understanding, Live Google Search Grounding, and Custom Cover Generation. Send a dish/movie name, paste a recipe URL, snap/upload a photo of a recipe card, handwritten note, receipt, or show poster—I will extract & save everything to the matching tab.',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<{
    dataUrl: string;
    base64: string;
    mimeType: string;
    name: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cover Image Generator Studio inside Gemini Drawer
  const [isCoverStudioOpen, setIsCoverStudioOpen] = useState(false);
  const [coverPrompt, setCoverPrompt] = useState('');
  const [coverKind, setCoverKind] = useState<CoverKind>('recipe');
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [generatingBadgeKey, setGeneratingBadgeKey] = useState<string | null>(null);
  const [applyTargetMap, setApplyTargetMap] = useState<Record<string, string>>({});
  const [appliedMsgIds, setAppliedMsgIds] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const scrollEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isGeneratingCover]);

  if (!isOpen) return null;

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (!dataUrl) return;
      const commaIdx = dataUrl.indexOf(',');
      const base64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
      setAttachedImage({
        dataUrl,
        base64,
        mimeType: file.type || 'image/jpeg',
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const executeReturnedActions = (
    serverActions: Array<{ type: string; payload: Record<string, unknown> }>,
    attachedDataUrl?: string
  ): ActionResultBadge[] => {
    const badges: ActionResultBadge[] = [];

    for (const act of serverActions) {
      const p = act.payload || {};

      if (act.type === 'add_recipe_to_box') {
        const created = addRecipeCard({
          title: String(p.title || 'AI Imported Recipe'),
          category: String(p.category || 'Dinner'),
          prepTime: String(p.prepTime || '15 Mins'),
          cookTime: String(p.cookTime || '25 Mins'),
          servings: Number(p.servings) || 4,
          imageSrc: attachedDataUrl || undefined,
          macros: {
            calories: Number(p.calories) || 420,
            protein: Number(p.protein) || 30,
            carbs: Number(p.carbs) || 35,
            fat: Number(p.fat) || 16,
          },
          ingredients: Array.isArray(p.ingredients)
            ? p.ingredients.map(String)
            : ['See recipe instructions'],
          steps: Array.isArray(p.steps)
            ? p.steps.map(String)
            : ['Prepare and cook according to notes.'],
          notes: p.notes ? String(p.notes) : 'Added via Gemini AI Assistant.',
          isFavorite: false,
        });
        badges.push({
          type: 'recipe',
          label: `Recipe Saved: ${created.title}`,
          targetPage: 'meals',
          mealsTab: 'recipes',
          entityId: created.id,
          entityTitle: created.title,
          subtitle: created.category,
          hasCover: Boolean(attachedDataUrl),
        });
      } else if (act.type === 'add_to_watchlist') {
        const rawType = String(p.type || 'Series');
        const validType: 'Series' | 'Movie' | 'Book' | 'Podcast' =
          rawType === 'Movie' || rawType === 'Book' || rawType === 'Podcast'
            ? rawType
            : 'Series';
        const rawStatus = String(p.status || 'Want to Watch');
        const validStatus: 'Want to Watch' | 'In Progress' | 'Finished' =
          rawStatus === 'In Progress' || rawStatus === 'Finished'
            ? rawStatus
            : 'Want to Watch';

        const created = addWatchlistMediaItem({
          title: String(p.title || 'New Title'),
          type: validType,
          genre: String(p.genre || 'Entertainment'),
          platform: p.platform ? String(p.platform) : 'Streaming',
          totalProgress: Number(p.totalProgress) || (validType === 'Movie' ? 1 : 8),
          currentProgress: validStatus === 'Finished' ? Number(p.totalProgress) || 1 : 0,
          seasonsCount: p.seasonsCount ? Number(p.seasonsCount) : undefined,
          unit: String(
            p.unit ||
              (validType === 'Movie' ? 'movie' : validType === 'Book' ? 'pages' : 'episodes')
          ),
          status: validStatus,
          rating: Number(p.rating) || 5,
          notes: p.notes ? String(p.notes) : undefined,
          imageSrc: attachedDataUrl || undefined,
        });
        badges.push({
          type: 'watchlist',
          label: `Watchlist Saved: ${created.title}`,
          targetPage: 'watchlist',
          entityId: created.id,
          entityTitle: created.title,
          subtitle: `${created.type} · ${created.genre}`,
          hasCover: Boolean(attachedDataUrl),
        });
      } else if (act.type === 'add_kanban_task') {
        const rawCol = String(p.column || 'medium');
        const validCol =
          rawCol === 'overdue' ||
          rawCol === 'high' ||
          rawCol === 'medium' ||
          rawCol === 'low' ||
          rawCol === 'done'
            ? rawCol
            : 'medium';
        const rawPri = String(p.priority || 'medium');
        const validPri =
          rawPri === 'low' || rawPri === 'medium' || rawPri === 'high'
            ? rawPri
            : 'medium';
        const rawFreq = String(p.frequency || 'Once');
        const validFreq =
          rawFreq === 'Daily' || rawFreq === 'Weekly' || rawFreq === 'Monthly'
            ? rawFreq
            : 'Once';

        const taskTitle = String(p.title || 'New Task');
        addKanbanTask({
          title: taskTitle,
          description: p.description ? String(p.description) : undefined,
          column: validCol,
          priority: validPri,
          dueDate: p.dueDate ? String(p.dueDate) : '2026-11-12',
          frequency: validFreq,
          tags: Array.isArray(p.tags) ? p.tags.map(String) : ['AI Assistant'],
          autoRollover: true,
        });
        addTodo({
          title: taskTitle,
          completed: false,
          dueDate: '2026-11-12',
          category: 'Personal',
          priority: validPri,
        });
        badges.push({
          type: 'kanban',
          label: `Task Saved: ${taskTitle}`,
          targetPage: 'kanban',
        });
      } else if (act.type === 'add_grocery_items') {
        const items = Array.isArray(p.items)
          ? (p.items as Array<Record<string, unknown>>).map((it) => ({
              name: String(it.name || 'Grocery Item'),
              category: String(it.category || 'Pantry'),
              quantity: String(it.quantity || '1'),
              sourceLocation: 'Gemini Vision / Assistant',
            }))
          : [];
        if (items.length > 0) {
          addGroceryItems(items);
          badges.push({
            type: 'groceries',
            label: `Grocery List (+${items.length} Item${items.length > 1 ? 's' : ''})`,
            targetPage: 'meals',
            mealsTab: 'inventory',
          });
        }
      } else if (act.type === 'add_note') {
        const rawCat = String(p.category || 'Personal');
        const validCat: NoteItem['category'] =
          rawCat === 'Ideas' ||
          rawCat === 'Journal' ||
          rawCat === 'Recipes' ||
          rawCat === 'Lists'
            ? rawCat
            : 'Personal';
        const noteTitle = String(p.title || 'Captured Note');
        addNote({
          title: noteTitle,
          content: String(p.content || ''),
          category: validCat,
          pinned: Boolean(p.pinned),
          imageSrc: attachedDataUrl || undefined,
        });
        badges.push({
          type: 'note',
          label: `Note Saved: ${noteTitle}`,
          targetPage: 'notes',
        });
      }
    }

    if (badges.length > 0) {
      celebrate();
    }
    return badges;
  };

  const sendMessage = async (overridePrompt?: string) => {
    const textToSend = (overridePrompt ?? inputText).trim();
    if (!textToSend && !attachedImage) return;
    if (isLoading) return;

    const currentImage = attachedImage;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text:
        textToSend ||
        'Read this uploaded photo and save the recipe, note, groceries, tasks, or watchlist show to the matching tab.',
      imagePreviewUrl: currentImage?.dataUrl,
    };

    const historyForApi = messages
      .filter((m) => m.id !== 'welcome' && !m.error)
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, userMsg]);
    if (!overridePrompt) setInputText('');
    setAttachedImage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.text,
          history: historyForApi,
          imageBase64: currentImage?.base64,
          imageMimeType: currentImage?.mimeType,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gemini request failed');
      }

      const actionBadges = Array.isArray(data.actions)
        ? executeReturnedActions(data.actions, currentImage?.dataUrl)
        : [];

      const modelMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'model',
        text: data.reply || 'Done!',
        actions: actionBadges,
        sources: Array.isArray(data.sources) ? data.sources : undefined,
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: unknown) {
      const errorText =
        err instanceof Error ? err.message : 'Something went wrong calling Gemini.';
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: 'model',
          text: errorText,
          error: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCoverInDrawer = async (e: React.FormEvent) => {
    e.preventDefault();
    const promptVal = (coverPrompt || inputText).trim();
    if (!promptVal || isGeneratingCover) return;

    setIsGeneratingCover(true);
    try {
      const res = await generateCoverImage({
        title: promptVal,
        kind: coverKind,
        customPrompt: promptVal,
      });

      const modelMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'model',
        text: res.caption,
        generatedCover: {
          imageDataUrl: res.imageDataUrl,
          title: promptVal,
          kind: coverKind,
        },
      };
      setMessages((prev) => [...prev, modelMsg]);
      setCoverPrompt('');
      setIsCoverStudioOpen(false);
      celebrate();
    } catch (err: unknown) {
      const errorText =
        err instanceof Error ? err.message : 'Failed to generate cover image.';
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'model',
          text: errorText,
          error: true,
        },
      ]);
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const handleGenerateCoverForActionBadge = async (
    msgId: string,
    badgeIndex: number,
    badge: ActionResultBadge
  ) => {
    if (!badge.entityId || !badge.entityTitle) return;
    const key = `${msgId}-${badgeIndex}`;
    setGeneratingBadgeKey(key);

    try {
      const kind: CoverKind = badge.type === 'watchlist' ? 'watchlist' : 'recipe';
      const res = await generateCoverImage({
        title: badge.entityTitle,
        kind,
        subtitle: badge.subtitle,
      });

      if (badge.type === 'recipe') {
        setRecipes((prev) =>
          prev.map((r) =>
            r.id === badge.entityId ? { ...r, imageSrc: res.imageDataUrl } : r
          )
        );
      } else if (badge.type === 'watchlist') {
        setWatchlistMedia((prev) =>
          prev.map((w) =>
            w.id === badge.entityId ? { ...w, imageSrc: res.imageDataUrl } : w
          )
        );
      }

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== msgId || !m.actions) return m;
          return {
            ...m,
            actions: m.actions.map((a, i) =>
              i === badgeIndex ? { ...a, hasCover: true } : a
            ),
          };
        })
      );
      celebrate();
    } catch (err) {
      console.error('Cover generation failed:', err);
    } finally {
      setGeneratingBadgeKey(null);
    }
  };

  const handleApplyGeneratedCoverToCard = (
    msgId: string,
    imageDataUrl: string,
    targetKey: string
  ) => {
    if (!targetKey) return;
    const [kind, id] = targetKey.split('::');
    if (kind === 'recipe') {
      const target = recipes.find((r) => r.id === id);
      setRecipes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, imageSrc: imageDataUrl } : r))
      );
      setAppliedMsgIds((prev) => ({
        ...prev,
        [msgId]: `Applied cover to "${target?.title || 'Recipe'}"`,
      }));
      celebrate();
    } else if (kind === 'watchlist') {
      const target = watchlistMedia.find((w) => w.id === id);
      setWatchlistMedia((prev) =>
        prev.map((w) => (w.id === id ? { ...w, imageSrc: imageDataUrl } : w))
      );
      setAppliedMsgIds((prev) => ({
        ...prev,
        [msgId]: `Applied poster to "${target?.title || 'Watchlist'}"`,
      }));
      celebrate();
    }
  };

  const quickPrompts = [
    'Add Severance to my Watchlist',
    'Add Marry Me Chicken recipe with macros',
    'Add healthy groceries for a Greek bowl',
    'Create a High Priority task to prep meals tomorrow',
  ];

  const getBadgeIcon = (type: ActionResultBadge['type']) => {
    switch (type) {
      case 'recipe':
        return <ChefHat className="w-3.5 h-3.5 text-[#be7fab]" />;
      case 'watchlist':
        return <Tv className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />;
      case 'kanban':
        return <CheckSquare className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#d29ec2]" />;
      case 'groceries':
        return <ShoppingCart className="w-3.5 h-3.5 text-[#2d1b28] dark:text-[#efd0e5]" />;
      case 'note':
        return <StickyNote className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#2d1b28]/55 dark:bg-[#120a10]/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md h-full bg-white dark:bg-[#1c0f19] border-l border-[#d29ec2] dark:border-[#be7fab]/60 shadow-[0_0_45px_rgba(190,127,171,0.28)] flex flex-col relative">
        {/* Illuminated Header */}
        <div className="px-5 py-4 border-b border-[#d29ec2] dark:border-[#be7fab]/40 bg-[#e6c3db]/75 dark:bg-[#160b14] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#be7fab] text-[#120a10] flex items-center justify-center shadow-[0_0_16px_rgba(190,127,171,0.55)]">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-wide">
                Gemini AI Assistant
              </h2>
              <p className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]/80 flex items-center gap-1">
                <Globe className="w-3 h-3 text-[#be7fab]" />
                <span>Vision · Google Search · Cover Art</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsCoverStudioOpen((prev) => !prev)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                isCoverStudioOpen
                  ? 'bg-[#be7fab] text-[#120a10] border-[#be7fab]'
                  : 'bg-white dark:bg-[#1c0f19] text-[#be7fab] dark:text-[#daabcb] border-[#d29ec2] dark:border-[#be7fab]/45 hover:bg-[#be7fab]/20'
              }`}
              title="Generate Custom Cover Image"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cover Image</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-[#2d1b28] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:bg-[#be7fab]/20 rounded-xl border border-[#d29ec2] dark:border-[#d29ec2]/30 transition-colors"
              aria-label="Close Gemini drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cover Image Generator Panel inside Drawer */}
        {isCoverStudioOpen && (
          <form
            onSubmit={handleGenerateCoverInDrawer}
            className="p-3.5 border-b border-[#be7fab]/45 bg-[#efd0e5]/75 dark:bg-[#120a10] space-y-2.5 animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#2d1b28] dark:text-[#efd0e5] flex items-center gap-1.5 font-mono uppercase">
                <Wand2 className="w-3.5 h-3.5 text-[#be7fab]" />
                <span>Generate Cover Image</span>
              </span>
              <select
                value={coverKind}
                onChange={(e) => setCoverKind(e.target.value as CoverKind)}
                className="text-[11px] px-2 py-1 rounded-lg bg-white dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/45 text-[#2d1b28] dark:text-[#efd0e5] font-semibold"
              >
                <option value="recipe">Recipe Cover</option>
                <option value="watchlist">Watchlist Poster</option>
                <option value="exercise">Exercise Card</option>
                <option value="custom">Custom Artwork</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={coverPrompt}
                onChange={(e) => setCoverPrompt(e.target.value)}
                placeholder="Describe dish, movie, exercise, or vibe..."
                className="flex-1 min-w-0 px-3 py-1.5 text-xs bg-white dark:bg-[#1c0f19] border border-[#be7fab]/60 rounded-xl text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#e6c3db]/45 focus:outline-none focus:ring-1 focus:ring-[#be7fab]"
                autoFocus
              />
              <button
                type="submit"
                disabled={isGeneratingCover || !(coverPrompt || inputText).trim()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#be7fab] hover:bg-[#d29ec2] disabled:opacity-45 text-[#120a10] text-xs font-bold shrink-0"
              >
                {isGeneratingCover ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
                <span>Generate</span>
              </button>
            </div>
          </form>
        )}

        {/* Quick-Action Suggestion Strip */}
        <div className="px-4 py-2.5 border-b border-[#d29ec2] dark:border-[#d29ec2]/25 bg-[#efd0e5]/60 dark:bg-[#120a10]/60 flex items-center gap-2 overflow-x-auto">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => sendMessage(prompt)}
              className="text-[11px] font-medium text-[#2d1b28] dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] bg-white dark:bg-[#1c0f19] hover:bg-[#be7fab]/25 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg px-2.5 py-1 whitespace-nowrap shrink-0 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#efd0e5]/35 dark:bg-transparent">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed border ${
                  msg.role === 'user'
                    ? 'bg-[#be7fab] text-[#120a10] font-semibold border-[#be7fab] dark:border-[#efd0e5]/40 shadow-[0_0_16px_rgba(190,127,171,0.28)]'
                    : msg.error
                    ? 'bg-[#e6c3db] dark:bg-[#2a1220] text-[#2d1b28] dark:text-[#efd0e5] border-[#be7fab]'
                    : 'bg-white dark:bg-[#120a10]/85 text-[#2d1b28] dark:text-[#efd0e5] border-[#d29ec2] dark:border-[#d29ec2]/40'
                }`}
              >
                {msg.imagePreviewUrl && (
                  <div className="mb-2 rounded-xl overflow-hidden border border-[#d29ec2] dark:border-[#efd0e5]/30">
                    <img
                      src={msg.imagePreviewUrl}
                      alt="Uploaded attachment"
                      className="max-h-44 w-full object-cover"
                    />
                  </div>
                )}

                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Generated Custom Cover Artwork Preview inside Drawer */}
                {msg.generatedCover && (
                  <div className="mt-2.5 pt-2.5 border-t border-[#d29ec2]/60 dark:border-[#be7fab]/30 space-y-2">
                    <div className="rounded-xl overflow-hidden border border-[#be7fab] bg-[#120a10]">
                      <img
                        src={msg.generatedCover.imageDataUrl}
                        alt={msg.generatedCover.title}
                        className="w-full max-h-56 object-contain"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <select
                        value={applyTargetMap[msg.id] || ''}
                        onChange={(e) =>
                          setApplyTargetMap((prev) => ({
                            ...prev,
                            [msg.id]: e.target.value,
                          }))
                        }
                        className="flex-1 min-w-[140px] text-[11px] px-2 py-1.5 rounded-lg bg-[#efd0e5]/55 dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/45 text-[#2d1b28] dark:text-[#efd0e5]"
                      >
                        <option value="">Attach to existing card...</option>
                        {recipes.map((r) => (
                          <option key={r.id} value={`recipe::${r.id}`}>
                            Recipe: {r.title}
                          </option>
                        ))}
                        {watchlistMedia.map((w) => (
                          <option key={w.id} value={`watchlist::${w.id}`}>
                            Watchlist: {w.title}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        disabled={!applyTargetMap[msg.id]}
                        onClick={() =>
                          handleApplyGeneratedCoverToCard(
                            msg.id,
                            msg.generatedCover!.imageDataUrl,
                            applyTargetMap[msg.id]
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-[#be7fab] hover:bg-[#d29ec2] disabled:opacity-40 text-[#120a10] text-[11px] font-bold"
                      >
                        Apply
                      </button>

                      <a
                        href={msg.generatedCover.imageDataUrl}
                        download={`${msg.generatedCover.title
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')}-cover.svg`}
                        className="p-1.5 rounded-lg bg-[#e6c3db]/70 dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/45 text-[#2d1b28] dark:text-[#daabcb]"
                        title="Download generated cover"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {appliedMsgIds[msg.id] && (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#be7fab] dark:text-[#daabcb]">
                        <Check className="w-3.5 h-3.5" />
                        <span>{appliedMsgIds[msg.id]}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Direct App Action Confirmations */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[#d29ec2] dark:border-[#d29ec2]/30 space-y-1.5">
                    {msg.actions.map((act, idx) => {
                      const badgeKey = `${msg.id}-${idx}`;
                      const isGeneratingThis = generatingBadgeKey === badgeKey;
                      const canGenerateCover =
                        (act.type === 'recipe' || act.type === 'watchlist') &&
                        Boolean(act.entityId);

                      return (
                        <div key={idx} className="space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (act.mealsTab) setActiveMealsTab(act.mealsTab);
                              setActivePage(act.targetPage);
                              onClose();
                            }}
                            className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-[#e6c3db] dark:bg-[#1c0f19] hover:bg-[#be7fab]/30 border border-[#be7fab]/50 text-[#2d1b28] dark:text-[#efd0e5] text-[11px] font-semibold transition-all"
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              {getBadgeIcon(act.type)}
                              <span className="truncate">{act.label}</span>
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb] shrink-0" />
                          </button>

                          {canGenerateCover && (
                            <button
                              type="button"
                              disabled={isGeneratingThis}
                              onClick={() =>
                                handleGenerateCoverForActionBadge(msg.id, idx, act)
                              }
                              className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#efd0e5]/60 dark:bg-[#1c0f19] hover:bg-[#be7fab]/25 border border-dashed border-[#be7fab]/55 text-[#2d1b28] dark:text-[#daabcb] text-[10px] font-bold transition-colors"
                            >
                              {isGeneratingThis ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span>Generating Cover Image...</span>
                                </>
                              ) : (
                                <>
                                  <Wand2 className="w-3 h-3 text-[#be7fab]" />
                                  <span>
                                    {act.hasCover
                                      ? 'Regenerate Cover Image'
                                      : 'Generate Cover Image for Card'}
                                  </span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Grounded Google Search Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[#d29ec2]/60 dark:border-[#be7fab]/25 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[#be7fab] dark:text-[#daabcb] font-bold">
                      <Globe className="w-3 h-3" />
                      <span>Google Search Sources</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#efd0e5]/60 dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/35 text-[10px] text-[#2d1b28] dark:text-[#e6c3db] hover:border-[#be7fab] max-w-full truncate"
                        >
                          <span className="truncate max-w-[180px]">{src.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0 text-[#be7fab]" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {(isLoading || isGeneratingCover) && (
            <div className="flex items-start">
              <div className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#120a10]/85 border border-[#be7fab]/45 text-[#2d1b28] dark:text-[#e6c3db] text-xs flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#be7fab]" />
                <span>
                  {isGeneratingCover
                    ? 'Generating custom cover image...'
                    : 'Searching & syncing with LifeBinder...'}
                </span>
              </div>
            </div>
          )}
          <div ref={scrollEndRef} />
        </div>

        {/* Attached Image Preview Bar */}
        {attachedImage && (
          <div className="px-4 py-2 border-t border-[#d29ec2] dark:border-[#d29ec2]/30 bg-[#e6c3db]/75 dark:bg-[#160b14] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={attachedImage.dataUrl}
                alt="Attachment preview"
                className="w-11 h-11 rounded-lg object-cover border border-[#be7fab]"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#2d1b28] dark:text-[#efd0e5] truncate">
                  {attachedImage.name}
                </p>
                <p className="text-[10px] text-[#2d1b28]/75 dark:text-[#e6c3db]">
                  Extracts items automatically &amp; attaches photo as card cover
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="p-1.5 text-[#2d1b28]/75 dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] rounded-lg hover:bg-[#be7fab]/20"
              title="Remove attachment"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Composer Bar with Camera, Photo Upload & Cover Generator */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="p-3.5 border-t border-[#d29ec2] dark:border-[#be7fab]/45 bg-[#e6c3db]/75 dark:bg-[#160b14] space-y-2"
        >
          {/* Hidden Inputs for Camera Snap & Photo Library Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelected}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelected}
            className="hidden"
          />

          <div className="flex items-center justify-between gap-2 text-[10px] text-[#2d1b28]/75 dark:text-[#e6c3db]/80">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-[#1c0f19] hover:bg-[#be7fab]/25 text-[#be7fab] dark:text-[#daabcb] font-bold border border-[#d29ec2] dark:border-[#be7fab]/45 transition-colors"
                title="Take a photo with camera"
              >
                <Camera className="w-3 h-3" />
                <span>Camera</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-[#1c0f19] hover:bg-[#be7fab]/25 text-[#be7fab] dark:text-[#daabcb] font-bold border border-[#d29ec2] dark:border-[#be7fab]/45 transition-colors"
                title="Upload recipe card, note, receipt, or poster"
              >
                <ImageIcon className="w-3 h-3" />
                <span>Upload Photo</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsCoverStudioOpen((prev) => !prev)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-[#1c0f19] hover:bg-[#be7fab]/25 text-[#be7fab] dark:text-[#daabcb] font-bold border border-[#d29ec2] dark:border-[#be7fab]/45 transition-colors"
            >
              <Wand2 className="w-3 h-3" />
              <span>Generate Cover Image</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Gemini to search & save show, recipe, receipt, note..."
              className="flex-1 min-w-0 px-3 py-2 text-xs bg-white dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#d29ec2]/50 rounded-xl text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#e6c3db]/50 focus:outline-none focus:border-[#be7fab] focus:ring-1 focus:ring-[#be7fab]"
            />

            <button
              type="submit"
              disabled={isLoading || (!inputText.trim() && !attachedImage)}
              className="p-2.5 rounded-xl bg-[#be7fab] hover:bg-[#d29ec2] disabled:opacity-40 text-[#120a10] font-bold shadow-[0_0_15px_rgba(190,127,171,0.5)] transition-all shrink-0"
              aria-label="Send to Gemini"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
