import React, { useState, useRef } from 'react';
import {
  BookOpen,
  Plus,
  Camera,
  Trash2,
  Sparkles,
  Clock,
  Users,
  Flame,
  Link as LinkIcon,
  Star,
  Search,
  X,
  Utensils,
  Wand2,
  Loader2,
} from 'lucide-react';
import { RecipeCardItem, MacroNutrients } from '../../types/mealPlanning';
import { generateCoverImage } from '../../utils/coverImageApi';

interface RecipeBoxViewProps {
  recipes: RecipeCardItem[];
  onUpdateRecipes: (recipes: RecipeCardItem[]) => void;
  celebrate: () => void;
}

export const RecipeBoxView: React.FC<RecipeBoxViewProps> = ({
  recipes,
  onUpdateRecipes,
  celebrate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(recipes[0]?.id || null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importInput, setImportInput] = useState('');
  const [importCategory, setImportCategory] = useState('Dinner');
  const [parsedPreview, setParsedPreview] = useState<Partial<RecipeCardItem> | null>(null);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [generatingCoverId, setGeneratingCoverId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const handleGenerateCoverForRecipe = async (
    recipe: RecipeCardItem,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (generatingCoverId) return;
    setGeneratingCoverId(recipe.id);
    try {
      const { imageDataUrl } = await generateCoverImage({
        title: recipe.title,
        kind: 'recipe',
        subtitle: `${recipe.category} · ${recipe.ingredients.slice(0, 3).join(', ')}`,
      });
      onUpdateRecipes(
        recipes.map((r) => (r.id === recipe.id ? { ...r, imageSrc: imageDataUrl } : r))
      );
      celebrate();
      showToast(`Generated cover image for "${recipe.title}"!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate cover image.';
      showToast(msg);
    } finally {
      setGeneratingCoverId(null);
    }
  };

  const handlePhotoUpload = (recipeId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result as string;
      if (dataUrl) {
        onUpdateRecipes(
          recipes.map(r => (r.id === recipeId ? { ...r, imageSrc: dataUrl } : r))
        );
        celebrate();
        showToast('Recipe photo updated!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTitleChange = (recipeId: string, newTitle: string) => {
    onUpdateRecipes(
      recipes.map(r => (r.id === recipeId ? { ...r, title: newTitle } : r))
    );
  };

  const handleToggleFavorite = (recipeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateRecipes(
      recipes.map(r => (r.id === recipeId ? { ...r, isFavorite: !r.isFavorite } : r))
    );
  };

  const handleUpdateRecipeField = <K extends keyof RecipeCardItem>(
    recipeId: string,
    field: K,
    value: RecipeCardItem[K]
  ) => {
    onUpdateRecipes(
      recipes.map(r => (r.id === recipeId ? { ...r, [field]: value } : r))
    );
  };

  const handleUpdateMacro = (
    recipeId: string,
    macroKey: keyof MacroNutrients,
    value: number
  ) => {
    onUpdateRecipes(
      recipes.map(r => {
        if (r.id === recipeId) {
          return {
            ...r,
            macros: {
              ...r.macros,
              [macroKey]: value,
            },
          };
        }
        return r;
      })
    );
  };

  const handleIngredientChange = (recipeId: string, index: number, value: string) => {
    onUpdateRecipes(
      recipes.map(r => {
        if (r.id === recipeId) {
          const updated = [...r.ingredients];
          updated[index] = value;
          return { ...r, ingredients: updated };
        }
        return r;
      })
    );
  };

  const handleAddIngredient = (recipeId: string) => {
    onUpdateRecipes(
      recipes.map(r => {
        if (r.id === recipeId) {
          return { ...r, ingredients: [...r.ingredients, 'New ingredient'] };
        }
        return r;
      })
    );
  };

  const handleDeleteIngredient = (recipeId: string, index: number) => {
    onUpdateRecipes(
      recipes.map(r => {
        if (r.id === recipeId) {
          const updated = r.ingredients.filter((_, idx) => idx !== index);
          return { ...r, ingredients: updated };
        }
        return r;
      })
    );
  };

  const handleStepChange = (recipeId: string, index: number, value: string) => {
    onUpdateRecipes(
      recipes.map(r => {
        if (r.id === recipeId) {
          const updated = [...r.steps];
          updated[index] = value;
          return { ...r, steps: updated };
        }
        return r;
      })
    );
  };

  const handleAddStep = (recipeId: string) => {
    onUpdateRecipes(
      recipes.map(r => {
        if (r.id === recipeId) {
          return { ...r, steps: [...r.steps, 'Next cooking step'] };
        }
        return r;
      })
    );
  };

  const handleDeleteStep = (recipeId: string, index: number) => {
    onUpdateRecipes(
      recipes.map(r => {
        if (r.id === recipeId) {
          const updated = r.steps.filter((_, idx) => idx !== index);
          return { ...r, steps: updated };
        }
        return r;
      })
    );
  };

  const handleDeleteRecipe = (recipeId: string) => {
    onUpdateRecipes(recipes.filter(r => r.id !== recipeId));
    if (expandedRecipeId === recipeId) {
      setExpandedRecipeId(null);
    }
    showToast('Recipe deleted');
  };

  const handleAddNewBlankRecipe = () => {
    const newRecipe: RecipeCardItem = {
      id: `rec-${Date.now()}`,
      title: 'New Homemade Dish',
      prepTime: '15 Mins',
      cookTime: '20 Mins',
      servings: 4,
      category: 'Dinner',
      isFavorite: false,
      macros: { calories: 450, protein: 35, carbs: 25, fat: 18 },
      ingredients: ['1 lb main protein or vegetable', '2 tbsp extra virgin olive oil', 'Sea salt & cracked black pepper'],
      steps: ['Prepare ingredients and preheat cooking surface.', 'Cook until golden, aromatic, and cooked through.'],
      notes: 'Recipe note: season generously and serve warm.',
    };

    onUpdateRecipes([newRecipe, ...recipes]);
    setExpandedRecipeId(newRecipe.id);
    celebrate();
    showToast('Created new recipe card! Tap the photo area to upload a picture.');
  };

  const parsePastedContent = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      setParsedPreview(null);
      return;
    }

    const isUrl = /^https?:\/\//i.test(trimmed);

    if (isUrl) {
      try {
        const urlObj = new URL(trimmed);
        const pathSegments = urlObj.pathname.split('/').filter(Boolean);
        const lastSegment = pathSegments[pathSegments.length - 1] || 'Web Recipe';
        const formattedTitle = lastSegment
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());

        setParsedPreview({
          title: formattedTitle || 'Imported Web Recipe',
          category: importCategory,
          prepTime: '15 Mins',
          cookTime: '25 Mins',
          servings: 4,
          macros: { calories: 420, protein: 32, carbs: 28, fat: 16 },
          ingredients: [
            'Ingredients imported from web source',
            `Source URL: ${trimmed}`,
            'Add specific ingredients from recipe link',
          ],
          steps: [
            `Visit original recipe at ${trimmed}`,
            'Follow chef preparation and temperature directions.',
          ],
          notes: `Imported from: ${urlObj.hostname}`,
        });
      } catch {
        setParsedPreview(null);
      }
      return;
    }

    const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
    const titleCandidate = lines[0] || 'Imported Recipe';
    const ingredients: string[] = [];
    const steps: string[] = [];
    let currentMode: 'none' | 'ingredients' | 'steps' = 'none';

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();

      if (lower.includes('ingredient') || lower.startsWith('what you need')) {
        currentMode = 'ingredients';
        continue;
      } else if (lower.includes('instruction') || lower.includes('direction') || lower.includes('step') || lower.includes('method') || lower.includes('preparation')) {
        currentMode = 'steps';
        continue;
      }

      if (currentMode === 'ingredients') {
        const cleaned = line.replace(/^[•\-*\d.)\s]+/, '').trim();
        if (cleaned) ingredients.push(cleaned);
      } else if (currentMode === 'steps') {
        const cleaned = line.replace(/^(\d+[.)]|[-*])\s*/, '').trim();
        if (cleaned) steps.push(cleaned);
      } else {
        if (/^[•\-*]/.test(line)) {
          ingredients.push(line.replace(/^[•\-*]\s*/, ''));
        } else if (/^\d+[.)]/.test(line)) {
          steps.push(line.replace(/^\d+[.)]\s*/, ''));
        }
      }
    }

    setParsedPreview({
      title: titleCandidate,
      category: importCategory,
      prepTime: '15 Mins',
      cookTime: '25 Mins',
      servings: 4,
      macros: { calories: 420, protein: 34, carbs: 30, fat: 16 },
      ingredients: ingredients.length > 0 ? ingredients : [
        '1 lb main protein or vegetable',
        'Olive oil, garlic, sea salt, black pepper',
      ],
      steps: steps.length > 0 ? steps : [
        'Preheat pan or oven to target temperature.',
        'Combine ingredients and cook until tender and caramelized.',
      ],
      notes: 'Pasted and auto-structured into Recipe Box.',
    });
  };

  const handleConfirmImport = () => {
    if (!parsedPreview || !parsedPreview.title) return;

    const newRecipe: RecipeCardItem = {
      id: `rec-${Date.now()}`,
      title: parsedPreview.title,
      prepTime: parsedPreview.prepTime || '15 Mins',
      cookTime: parsedPreview.cookTime || '25 Mins',
      servings: parsedPreview.servings || 4,
      category: parsedPreview.category || importCategory,
      isFavorite: false,
      macros: parsedPreview.macros || { calories: 420, protein: 32, carbs: 28, fat: 16 },
      ingredients: parsedPreview.ingredients || ['Fresh ingredients'],
      steps: parsedPreview.steps || ['Prepare dish according to recipe steps.'],
      notes: parsedPreview.notes || '',
    };

    onUpdateRecipes([newRecipe, ...recipes]);
    setExpandedRecipeId(newRecipe.id);
    celebrate();
    setIsImportModalOpen(false);
    setImportInput('');
    setParsedPreview(null);
    showToast(`Imported "${newRecipe.title}" to Recipe Box!`);
  };

  const filteredRecipes = recipes.filter(r => {
    const matchesCategory = selectedCategory === 'All' ||
      (selectedCategory === 'Favorites' ? r.isFavorite : r.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.notes && r.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1c0f19] text-[#2d1b28] dark:text-[#efd0e5] text-xs font-semibold shadow-[0_0_24px_rgba(190,127,171,0.45)] border border-[#be7fab] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls Card */}
      <div className="hud-panel hud-corners washi-tape-top p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#e6c3db] dark:bg-[#be7fab]/20 text-[#2d1b28] dark:text-[#daabcb] border border-[#d29ec2] dark:border-[#be7fab]/45">
                <BookOpen className="w-4 h-4" />
              </span>
              <h2 className="font-display text-lg font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                Visual Recipe Box
              </h2>
            </div>
            <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/75 mt-0.5">
              Tap recipe photo to upload/swap picture, type directly to update titles, and edit ingredients/steps/macros in-place
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#efd0e5]/65 dark:bg-[#120a10] hover:bg-[#e6c3db] dark:hover:bg-[#241420] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg transition-all"
            >
              <LinkIcon className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />
              <span>Import URL / Text</span>
            </button>

            <button
              onClick={handleAddNewBlankRecipe}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#be7fab] hover:bg-[#d29ec2] text-[#120a10] rounded-lg transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Recipe Card</span>
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            {['All', 'Favorites', 'Dinner', 'Lunch', 'Breakfast'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#be7fab] text-[#120a10] font-bold'
                    : 'bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28]/75 dark:text-[#e6c3db]/75 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/30'
                }`}
              >
                {cat === 'Favorites' ? '★ Favorites' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#be7fab] dark:text-[#daabcb]/60" />
            <input
              type="text"
              placeholder="Search recipes or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#e6c3db]/40 focus:outline-none focus:ring-1 focus:ring-[#be7fab]"
            />
          </div>
        </div>
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map(recipe => {
          const isExpanded = expandedRecipeId === recipe.id;

          return (
            <div
              key={recipe.id}
              className="hud-panel hud-corners rounded-2xl overflow-hidden flex flex-col justify-between relative group"
            >
              {/* Tappable Recipe Photo Area */}
              <div
                onClick={() => fileInputRefs.current[recipe.id]?.click()}
                className="relative aspect-video w-full bg-[#e6c3db]/50 dark:bg-[#120a10] overflow-hidden border-b border-[#d29ec2] dark:border-[#be7fab]/30 cursor-pointer"
                title="Tap to upload or swap recipe photo"
              >
                <input
                  type="file"
                  accept="image/*"
                  ref={el => {
                    fileInputRefs.current[recipe.id] = el;
                  }}
                  onChange={(e) => handlePhotoUpload(recipe.id, e)}
                  className="hidden"
                />

                {recipe.imageSrc ? (
                  <img
                    src={recipe.imageSrc}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-linear-to-b from-[#efd0e5] to-[#e6c3db] dark:from-[#241420] dark:to-[#120a10] text-[#2d1b28] dark:text-[#e6c3db]">
                    <Utensils className="w-8 h-8 text-[#be7fab] mb-1.5" />
                    <span className="text-[11px] font-semibold text-[#2d1b28] dark:text-[#efd0e5]">
                      No Photo Added
                    </span>
                    <span className="text-[10px] text-[#2d1b28]/65 dark:text-[#e6c3db]/65 mt-0.5">
                      Tap anywhere on banner to upload picture
                    </span>
                  </div>
                )}

                <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={generatingCoverId === recipe.id}
                    onClick={(e) => handleGenerateCoverForRecipe(recipe, e)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#be7fab] hover:bg-[#d29ec2] disabled:opacity-60 text-[#120a10] border border-[#efd0e5]/50 text-[11px] font-bold shadow-[0_0_12px_rgba(190,127,171,0.5)] transition-all"
                    title="Generate a matching AI cover image"
                  >
                    {generatingCoverId === recipe.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Wand2 className="w-3.5 h-3.5" />
                    )}
                    <span>{generatingCoverId === recipe.id ? 'Generating...' : 'Generate Cover Image'}</span>
                  </button>

                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#120a10]/85 hover:bg-[#be7fab] text-[#efd0e5] hover:text-[#120a10] border border-[#be7fab]/50 text-[11px] font-bold backdrop-blur-xs transition-all">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{recipe.imageSrc ? 'Swap Photo' : 'Upload Photo'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleToggleFavorite(recipe.id, e)}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-[#120a10]/70 hover:bg-[#120a10] border border-[#be7fab]/45 text-[#efd0e5] backdrop-blur-xs transition-colors"
                  title="Toggle favorite"
                >
                  <Star className={`w-4 h-4 ${recipe.isFavorite ? 'text-[#daabcb] fill-[#daabcb]' : 'text-[#e6c3db]/60'}`} />
                </button>

                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#120a10]/80 border border-[#be7fab]/40 text-[#efd0e5] text-[10px] font-bold uppercase tracking-wider font-mono backdrop-blur-xs">
                  {recipe.category}
                </span>
              </div>

              {/* Recipe Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[#be7fab] dark:text-[#daabcb] uppercase tracking-wide font-mono">
                      Recipe Title (Type to edit)
                    </span>
                    <button
                      onClick={() => handleDeleteRecipe(recipe.id)}
                      className="opacity-0 group-hover:opacity-100 text-[#2d1b28]/45 dark:text-[#e6c3db]/45 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] p-0.5 transition-opacity"
                      title="Delete recipe card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={recipe.title}
                    onChange={(e) => handleTitleChange(recipe.id, e.target.value)}
                    className="w-full text-base font-display font-bold text-[#2d1b28] dark:text-[#efd0e5] bg-transparent border-b border-transparent hover:border-[#be7fab]/45 focus:border-[#be7fab] focus:outline-none transition-colors px-0 py-0.5"
                    placeholder="Enter recipe title..."
                  />

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#2d1b28]/80 dark:text-[#e6c3db]/80 font-mono tabular-nums">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#be7fab] dark:text-[#daabcb]" />
                      <span>{recipe.prepTime} · {recipe.cookTime}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#be7fab] dark:text-[#daabcb]" />
                      <span>{recipe.servings} Servings</span>
                    </div>

                    <div className="flex items-center gap-1 text-[#2d1b28] dark:text-[#efd0e5] font-bold">
                      <Flame className="w-3 h-3 text-[#be7fab]" />
                      <span>{recipe.macros.calories} cal</span>
                    </div>
                  </div>

                  {/* Editable Macros Strip */}
                  <div className="mt-2.5 p-2 bg-[#e6c3db]/50 dark:bg-[#120a10]/85 rounded-xl border border-[#d29ec2] dark:border-[#be7fab]/30 grid grid-cols-4 gap-1.5 text-[11px] font-mono tabular-nums">
                    <div>
                      <span className="text-[#2d1b28]/60 dark:text-[#e6c3db]/60 text-[9px] block uppercase">Protein (g)</span>
                      <input
                        type="number"
                        value={recipe.macros.protein}
                        onChange={(e) => handleUpdateMacro(recipe.id, 'protein', Number(e.target.value) || 0)}
                        className="w-full bg-transparent font-bold text-[#2d1b28] dark:text-[#efd0e5] focus:outline-none focus:border-b focus:border-[#be7fab]"
                      />
                    </div>
                    <div>
                      <span className="text-[#2d1b28]/60 dark:text-[#e6c3db]/60 text-[9px] block uppercase">Carbs (g)</span>
                      <input
                        type="number"
                        value={recipe.macros.carbs}
                        onChange={(e) => handleUpdateMacro(recipe.id, 'carbs', Number(e.target.value) || 0)}
                        className="w-full bg-transparent font-bold text-[#2d1b28] dark:text-[#efd0e5] focus:outline-none focus:border-b focus:border-[#be7fab]"
                      />
                    </div>
                    <div>
                      <span className="text-[#2d1b28]/60 dark:text-[#e6c3db]/60 text-[9px] block uppercase">Fat (g)</span>
                      <input
                        type="number"
                        value={recipe.macros.fat}
                        onChange={(e) => handleUpdateMacro(recipe.id, 'fat', Number(e.target.value) || 0)}
                        className="w-full bg-transparent font-bold text-[#2d1b28] dark:text-[#efd0e5] focus:outline-none focus:border-b focus:border-[#be7fab]"
                      />
                    </div>
                    <div>
                      <span className="text-[#2d1b28]/60 dark:text-[#e6c3db]/60 text-[9px] block uppercase">Calories</span>
                      <input
                        type="number"
                        value={recipe.macros.calories}
                        onChange={(e) => handleUpdateMacro(recipe.id, 'calories', Number(e.target.value) || 0)}
                        className="w-full bg-transparent font-bold text-[#be7fab] dark:text-[#daabcb] focus:outline-none focus:border-b focus:border-[#be7fab]"
                      />
                    </div>
                  </div>
                </div>

                {/* Collapsible Details */}
                <div className="border-t border-[#d29ec2]/60 dark:border-[#be7fab]/25 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                      Ingredients &amp; Steps ({recipe.ingredients.length} items)
                    </span>
                    <button
                      onClick={() => setExpandedRecipeId(isExpanded ? null : recipe.id)}
                      className="text-xs font-bold text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
                    >
                      {isExpanded ? 'Collapse' : 'Expand Card'}
                    </button>
                  </div>

                  {isExpanded ? (
                    <div className="space-y-4 pt-1 animate-in fade-in duration-150">
                      {/* Ingredients */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#be7fab] dark:text-[#daabcb] uppercase tracking-wide font-mono">
                            Ingredients (Tap to edit)
                          </span>
                          <button
                            onClick={() => handleAddIngredient(recipe.id)}
                            className="text-[10px] font-semibold text-[#be7fab] dark:text-[#daabcb] hover:underline flex items-center gap-0.5"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Row</span>
                          </button>
                        </div>

                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {recipe.ingredients.map((ing, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 group/ing">
                              <span className="text-[10px] text-[#be7fab] font-mono">•</span>
                              <input
                                type="text"
                                value={ing}
                                onChange={(e) => handleIngredientChange(recipe.id, idx, e.target.value)}
                                className="flex-1 text-xs text-[#2d1b28] dark:text-[#efd0e5] bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/30 hover:border-[#be7fab]/60 focus:border-[#be7fab] rounded-md px-2 py-1"
                              />
                              <button
                                onClick={() => handleDeleteIngredient(recipe.id, idx)}
                                className="opacity-0 group-hover/ing:opacity-100 text-[#2d1b28]/45 dark:text-[#e6c3db]/45 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] p-1 transition-opacity"
                                title="Remove ingredient"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Steps */}
                      <div className="space-y-1.5 pt-2 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#be7fab] dark:text-[#daabcb] uppercase tracking-wide font-mono">
                            Preparation Steps (Tap to edit)
                          </span>
                          <button
                            onClick={() => handleAddStep(recipe.id)}
                            className="text-[10px] font-semibold text-[#be7fab] dark:text-[#daabcb] hover:underline flex items-center gap-0.5"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Step</span>
                          </button>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {recipe.steps.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-2 group/step">
                              <span className="w-5 h-5 rounded-full bg-[#e6c3db] dark:bg-[#be7fab]/25 border border-[#be7fab] dark:border-[#be7fab]/50 text-[#2d1b28] dark:text-[#efd0e5] text-[10px] font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <textarea
                                value={step}
                                onChange={(e) => handleStepChange(recipe.id, idx, e.target.value)}
                                rows={2}
                                className="flex-1 text-xs text-[#2d1b28] dark:text-[#efd0e5] bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/30 hover:border-[#be7fab]/60 focus:border-[#be7fab] rounded-md px-2 py-1 resize-y"
                              />
                              <button
                                onClick={() => handleDeleteStep(recipe.id, idx)}
                                className="opacity-0 group-hover/step:opacity-100 text-[#2d1b28]/45 dark:text-[#e6c3db]/45 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] p-1 transition-opacity shrink-0 mt-1"
                                title="Remove step"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Chef Notes */}
                      <div className="pt-2 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20">
                        <span className="text-[10px] font-bold text-[#be7fab] dark:text-[#daabcb] uppercase tracking-wide font-mono block mb-1">
                          Chef Notes &amp; Pairings
                        </span>
                        <textarea
                          value={recipe.notes || ''}
                          onChange={(e) => handleUpdateRecipeField(recipe.id, 'notes', e.target.value)}
                          placeholder="e.g. Wine pairing, cooking tips, substitutions..."
                          rows={2}
                          className="w-full text-xs text-[#2d1b28] dark:text-[#efd0e5] bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/35 rounded-md px-2 py-1.5 focus:border-[#be7fab] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#e6c3db]/40"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/75">
                      <div className="text-[11px] line-clamp-2">
                        {recipe.ingredients.slice(0, 3).join(' · ')}
                        {recipe.ingredients.length > 3 ? '...' : ''}
                      </div>
                      {recipe.notes && (
                        <div className="text-[10px] text-[#2d1b28]/55 dark:text-[#e6c3db]/55 italic truncate mt-1">
                          Note: {recipe.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredRecipes.length === 0 && (
          <div className="col-span-full py-12 text-center text-xs text-[#2d1b28]/65 dark:text-[#e6c3db]/65 bg-white/75 dark:bg-[#1c0f19]/60 rounded-2xl border border-dashed border-[#d29ec2] dark:border-[#be7fab]/35">
            No recipes found matching your search. Tap &quot;+ New Recipe Card&quot;, &quot;Import URL / Text&quot;, or ask Gemini AI!
          </div>
        )}
      </div>

      {/* Modal: Import Recipe from URL or Text */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-black/75 backdrop-blur-xs">
          <div className="hud-panel hud-corners w-full max-w-lg p-5 bg-white dark:bg-[#1c0f19] border-[#be7fab] shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2] dark:border-[#be7fab]/30">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#e6c3db] dark:bg-[#be7fab]/20 text-[#2d1b28] dark:text-[#daabcb]">
                  <LinkIcon className="w-4 h-4" />
                </span>
                <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                  Import Recipe from URL or Copied Text
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-[#be7fab] dark:text-[#e6c3db]/70 hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Target Category
                </label>
                <select
                  value={importCategory}
                  onChange={(e) => setImportCategory(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5]"
                >
                  <option value="Dinner">Dinner</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Snacks & Smoothies">Snacks &amp; Smoothies</option>
                  <option value="Dessert">Dessert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Paste Recipe URL or Full Recipe Text
                </label>
                <textarea
                  placeholder="Paste a website link or paste copied text with Ingredients and Steps..."
                  value={importInput}
                  onChange={(e) => {
                    setImportInput(e.target.value);
                    parsePastedContent(e.target.value);
                  }}
                  rows={6}
                  className="w-full px-3 py-2 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#e6c3db]/40 focus:ring-1 focus:ring-[#be7fab] font-mono"
                />
              </div>

              {parsedPreview && (
                <div className="p-3 bg-[#e6c3db]/55 dark:bg-[#be7fab]/15 rounded-xl border border-[#be7fab] dark:border-[#be7fab]/45 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#be7fab] dark:text-[#daabcb] uppercase tracking-wide font-mono">
                      Auto-Parsed Preview
                    </span>
                    <span className="text-[10px] text-[#2d1b28] dark:text-[#efd0e5] font-mono">Ready to import</span>
                  </div>

                  <h4 className="text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5]">{parsedPreview.title}</h4>
                  <div className="text-[11px] text-[#2d1b28]/85 dark:text-[#e6c3db] font-mono tabular-nums">
                    {parsedPreview.prepTime} prep · {parsedPreview.servings} Servings · {parsedPreview.macros?.calories} kcal
                  </div>

                  <div className="text-[11px] text-[#2d1b28]/80 dark:text-[#e6c3db]/80">
                    <span className="font-semibold text-[#2d1b28] dark:text-[#efd0e5]">Ingredients ({parsedPreview.ingredients?.length}):</span>{' '}
                    {parsedPreview.ingredients?.slice(0, 3).join(', ')}...
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t border-[#d29ec2]/60 dark:border-[#be7fab]/25">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-[#2d1b28]/70 dark:text-[#e6c3db]/75 hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!parsedPreview}
                  onClick={handleConfirmImport}
                  className="px-4 py-1.5 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] disabled:opacity-40 rounded-lg transition-all"
                >
                  Import into Recipe Box
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
