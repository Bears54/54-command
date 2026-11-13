import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Circle,
  Sparkles,
  Refrigerator,
  Snowflake,
  Warehouse,
  Wine,
  Package,
  Search,
  X,
  Copy,
  FolderPlus,
} from 'lucide-react';
import {
  FoodInventoryItem,
  GroceryListItem,
  InventoryLocation,
} from '../../types/mealPlanning';

interface FoodInventoryViewProps {
  inventoryItems: FoodInventoryItem[];
  onUpdateInventory: (items: FoodInventoryItem[]) => void;
  groceryList: GroceryListItem[];
  onUpdateGroceryList: (items: GroceryListItem[]) => void;
  celebrate: () => void;
}

interface LocationTabConfig {
  id: InventoryLocation;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const LOCATION_TABS: LocationTabConfig[] = [
  {
    id: 'kitchen-fridge',
    label: 'Kitchen Fridge',
    shortLabel: 'Fridge',
    icon: Refrigerator,
    description: 'Fresh dairy, fresh produce, eggs, greens & condiments',
  },
  {
    id: 'kitchen-freezer',
    label: 'Kitchen Freezer',
    shortLabel: 'Freezer',
    icon: Snowflake,
    description: 'Weekly meal prep, frozen berries, seafood portions & breads',
  },
  {
    id: 'garage-fridge',
    label: 'Garage Fridge',
    shortLabel: 'Garage Fridge',
    icon: Warehouse,
    description: 'Bulk beverages, cold brew jugs, sparkling waters & surplus produce',
  },
  {
    id: 'garage-freezer',
    label: 'Garage Freezer',
    shortLabel: 'Garage Freezer',
    icon: Snowflake,
    description: 'Bulk chicken, ground bison, frozen seafood & prep stocks',
  },
  {
    id: 'garage-full-freezer',
    label: 'Garage Full Freezer',
    shortLabel: 'Full Freezer',
    icon: Package,
    description: 'Full butcher beef share, pork chops, whole turkeys & bone broth reserve',
  },
  {
    id: 'behind-the-bar',
    label: 'Behind the Bar',
    shortLabel: 'Bar',
    icon: Wine,
    description: 'Spirits, premium tonics, bitters, organic cocktail garnishes & glassware',
  },
  {
    id: 'pantry',
    label: 'Pantry',
    shortLabel: 'Pantry',
    icon: Package,
    description: 'Cold-pressed olive oils, grains, superfoods, nuts, spices & dry goods',
  },
];

export const FoodInventoryView: React.FC<FoodInventoryViewProps> = ({
  inventoryItems,
  onUpdateInventory,
  groceryList,
  onUpdateGroceryList,
  celebrate,
}) => {
  const [activeLocation, setActiveLocation] = useState<InventoryLocation>('kitchen-fridge');
  const [inventorySearch, setInventorySearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [newGroceryName, setNewGroceryName] = useState('');
  const [newGroceryCat, setNewGroceryCat] = useState('Produce');
  const [newGroceryQty, setNewGroceryQty] = useState('1');
  const [groceryFilterCat, setGroceryFilterCat] = useState('All');

  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Produce');
  const [newItemQty, setNewItemQty] = useState<number>(1);
  const [newItemUnit, setNewItemUnit] = useState('units');
  const [newItemExp, setNewItemExp] = useState('');
  const [newItemNotes, setNewItemNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    onUpdateInventory(
      inventoryItems.map(item => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const handleAddToGroceryList = (item: FoodInventoryItem) => {
    const activeLocConfig = LOCATION_TABS.find(l => l.id === item.location);
    const locationName = activeLocConfig ? activeLocConfig.label : item.location;

    const existing = groceryList.find(
      g => g.name.toLowerCase() === item.name.toLowerCase() && !g.checked
    );

    if (existing) {
      showToast(`"${item.name}" is already on your Grocery List!`);
      return;
    }

    const newGrocery: GroceryListItem = {
      id: `g-${Date.now()}`,
      name: item.name,
      category: item.category || 'Pantry',
      quantity: `${item.quantity > 0 ? item.quantity : 1} ${item.unit || 'pack'}`,
      checked: false,
      sourceLocation: locationName,
    };

    onUpdateGroceryList([newGrocery, ...groceryList]);
    celebrate();
    showToast(`Added "${item.name}" to Grocery List (restock: ${locationName})`);
  };

  const handleDeleteItem = (id: string) => {
    onUpdateInventory(inventoryItems.filter(item => item.id !== id));
  };

  const handleSaveNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: FoodInventoryItem = {
      id: `inv-${Date.now()}`,
      name: newItemName.trim(),
      location: activeLocation,
      category: newItemCategory,
      quantity: Number(newItemQty) || 1,
      unit: newItemUnit.trim() || 'units',
      expirationDate: newItemExp.trim() || undefined,
      notes: newItemNotes.trim() || undefined,
    };

    onUpdateInventory([...inventoryItems, newItem]);
    celebrate();
    setIsAddItemModalOpen(false);
    setNewItemName('');
    setNewItemExp('');
    setNewItemNotes('');
    showToast(`Added "${newItem.name}" to ${LOCATION_TABS.find(l => l.id === activeLocation)?.label}!`);
  };

  const handleToggleGrocery = (id: string) => {
    onUpdateGroceryList(
      groceryList.map(g => {
        if (g.id === id) {
          const next = !g.checked;
          if (next) celebrate();
          return { ...g, checked: next };
        }
        return g;
      })
    );
  };

  const handleAddGrocery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroceryName.trim()) return;

    const newG: GroceryListItem = {
      id: `g-${Date.now()}`,
      name: newGroceryName.trim(),
      category: newGroceryCat,
      quantity: newGroceryQty.trim() || '1 item',
      checked: false,
    };

    onUpdateGroceryList([newG, ...groceryList]);
    celebrate();
    setNewGroceryName('');
    setNewGroceryQty('1');
    showToast(`Added "${newG.name}" to Grocery List`);
  };

  const handleDeleteGrocery = (id: string) => {
    onUpdateGroceryList(groceryList.filter(g => g.id !== id));
  };

  const handleClearCompletedGroceries = () => {
    const uncompleted = groceryList.filter(g => !g.checked);
    onUpdateGroceryList(uncompleted);
    showToast('Cleared checked items from list');
  };

  const handleCopyGroceryList = () => {
    const lines = groceryList
      .filter(g => !g.checked)
      .map(g => `• [ ] ${g.name} (${g.quantity}) - ${g.category}`);
    navigator.clipboard.writeText(`GROCERY LIST:\n${lines.join('\n')}`);
    showToast('Grocery list copied to clipboard!');
  };

  const activeLocationConfig = LOCATION_TABS.find(l => l.id === activeLocation)!;
  const itemsInActiveLocation = inventoryItems.filter(item => {
    const matchesLoc = item.location === activeLocation;
    const matchesSearch = item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      item.category.toLowerCase().includes(inventorySearch.toLowerCase());
    return matchesLoc && matchesSearch;
  });

  const filteredGroceries = groceryList.filter(g => {
    if (groceryFilterCat === 'All') return true;
    return g.category === groceryFilterCat;
  });

  const checkedGroceryCount = groceryList.filter(g => g.checked).length;

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1c0f19] text-[#2d1b28] dark:text-[#efd0e5] text-xs font-semibold shadow-[0_0_24px_rgba(190,127,171,0.45)] border border-[#be7fab] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 7 Tabbed Inventory Locations */}
        <div className="lg:col-span-7 space-y-4">
          <div className="hud-panel hud-corners washi-tape-top p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#e6c3db] dark:bg-[#be7fab]/20 text-[#2d1b28] dark:text-[#daabcb] border border-[#d29ec2] dark:border-[#be7fab]/45">
                    <Refrigerator className="w-4 h-4" />
                  </span>
                  <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                    Food Inventory Counters
                  </h3>
                </div>
                <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/75 mt-0.5">
                  Real-time stock counts across 7 home storage locations with 1-click grocery replenishment
                </p>
              </div>

              <button
                onClick={() => setIsAddItemModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#be7fab] text-[#120a10] hover:bg-[#d29ec2] rounded-lg transition-all whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item to {activeLocationConfig.shortLabel}</span>
              </button>
            </div>

            {/* 7 Location Tabs */}
            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1.5">
              {LOCATION_TABS.map(tab => {
                const IconComponent = tab.icon;
                const count = inventoryItems.filter(i => i.location === tab.id).length;
                const isActive = activeLocation === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveLocation(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                      isActive
                        ? 'bg-[#be7fab] text-[#120a10] border-[#be7fab] shadow-[0_0_14px_rgba(190,127,171,0.4)] font-bold'
                        : 'bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28]/80 dark:text-[#e6c3db]/80 border-[#d29ec2] dark:border-[#be7fab]/30 hover:border-[#be7fab] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-[#120a10]' : 'text-[#be7fab] dark:text-[#daabcb]'}`} />
                    <span>{tab.label}</span>
                    <span className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-[#120a10]/20 text-[#120a10]' : 'bg-[#e6c3db] dark:bg-[#241420] text-[#2d1b28] dark:text-[#daabcb]'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="text-xs">
                <span className="font-bold text-[#2d1b28] dark:text-[#efd0e5]">{activeLocationConfig.label}:</span>{' '}
                <span className="text-[#2d1b28]/75 dark:text-[#e6c3db]/75 text-[11px]">{activeLocationConfig.description}</span>
              </div>

              <div className="relative w-full sm:w-52">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#be7fab] dark:text-[#daabcb]/60" />
                <input
                  type="text"
                  placeholder="Filter stock..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#e6c3db]/40 focus:outline-none focus:ring-1 focus:ring-[#be7fab]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {itemsInActiveLocation.map(item => {
              const isLowStock = item.quantity <= 1;

              return (
                <div
                  key={item.id}
                  className={`hud-panel p-3.5 rounded-xl flex flex-col justify-between transition-all group ${
                    isLowStock
                      ? 'border-[#be7fab] shadow-[0_0_16px_rgba(190,127,171,0.25)]'
                      : 'border-[#d29ec2] dark:border-[#d29ec2]/35 hover:border-[#be7fab]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-[#be7fab] dark:text-[#daabcb] uppercase tracking-wide font-mono">
                          {item.category}
                        </span>
                        <h4 className="text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] leading-snug mt-0.5">
                          {item.name}
                        </h4>
                      </div>

                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-[#2d1b28]/45 dark:text-[#e6c3db]/45 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] p-0.5 transition-opacity"
                        title="Delete item from inventory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-2 text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]/75 space-y-0.5">
                      {item.expirationDate && (
                        <div className="flex items-center gap-1.5 font-mono tabular-nums">
                          <span className="text-[#2d1b28]/55 dark:text-[#e6c3db]/55">Expires:</span>
                          <span className={`font-semibold ${isLowStock ? 'text-[#be7fab] dark:text-[#daabcb]' : 'text-[#2d1b28] dark:text-[#efd0e5]'}`}>
                            {item.expirationDate}
                          </span>
                        </div>
                      )}
                      {item.notes && (
                        <div className="text-[10px] text-[#2d1b28]/60 dark:text-[#e6c3db]/60 italic">
                          {item.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 bg-[#efd0e5]/65 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/35 rounded-lg px-2 py-1">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="p-0.5 text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] transition-colors"
                        title="Decrease count"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="text-xs font-bold font-mono tabular-nums text-[#2d1b28] dark:text-[#efd0e5] min-w-5 text-center">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="p-0.5 text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] transition-colors"
                        title="Increase count"
                      >
                        <Plus className="w-3 h-3" />
                      </button>

                      <span className="text-[10px] text-[#2d1b28]/65 dark:text-[#e6c3db]/65 ml-0.5 truncate max-w-16">
                        {item.unit}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToGroceryList(item)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#e6c3db] dark:bg-[#be7fab]/20 hover:bg-[#be7fab] text-[#2d1b28] dark:text-[#efd0e5] hover:text-[#120a10] rounded-lg text-xs font-bold border border-[#d29ec2] dark:border-[#be7fab]/45 transition-all"
                      title="Add this item to market grocery checklist"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>Add to Grocery List</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {itemsInActiveLocation.length === 0 && (
              <div className="col-span-full py-8 text-center text-xs text-[#2d1b28]/65 dark:text-[#e6c3db]/65 bg-white/75 dark:bg-[#1c0f19]/60 rounded-xl border border-dashed border-[#d29ec2] dark:border-[#be7fab]/35">
                No items currently logged in {activeLocationConfig.label}.
                <div className="mt-2">
                  <button
                    onClick={() => setIsAddItemModalOpen(true)}
                    className="text-[#be7fab] dark:text-[#daabcb] font-semibold hover:underline"
                  >
                    + Add your first item
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Grocery List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="hud-panel hud-corners washi-tape-top p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#e6c3db] dark:bg-[#be7fab]/20 text-[#2d1b28] dark:text-[#daabcb] border border-[#d29ec2] dark:border-[#be7fab]/45">
                  <ShoppingCart className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                    Interactive Grocery List
                  </h3>
                  <span className="text-[11px] text-[#2d1b28]/70 dark:text-[#e6c3db]/75 font-mono tabular-nums">
                    {checkedGroceryCount} of {groceryList.length} items checked
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyGroceryList}
                  className="p-1.5 text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:bg-[#be7fab]/20 rounded-lg transition-colors"
                  title="Copy list to clipboard"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {checkedGroceryCount > 0 && (
                  <button
                    onClick={handleClearCompletedGroceries}
                    className="text-[10px] font-semibold text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:underline px-2 py-1"
                  >
                    Clear Checked
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleAddGrocery} className="my-3 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add item (e.g., Organic Honey, Avocados)..."
                  value={newGroceryName}
                  onChange={(e) => setNewGroceryName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#e6c3db]/40 focus:outline-none focus:ring-1 focus:ring-[#be7fab]"
                />
                <input
                  type="text"
                  placeholder="Qty (2 lbs)"
                  value={newGroceryQty}
                  onChange={(e) => setNewGroceryQty(e.target.value)}
                  className="w-20 px-2 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <select
                  value={newGroceryCat}
                  onChange={(e) => setNewGroceryCat(e.target.value)}
                  className="px-2.5 py-1 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5] font-medium"
                >
                  <option value="Produce">Produce</option>
                  <option value="Meat & Seafood">Meat &amp; Seafood</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Pantry">Pantry</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Household">Household</option>
                </select>

                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-lg transition-all"
                >
                  + Add to List
                </button>
              </div>
            </form>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
              {['All', 'Produce', 'Meat & Seafood', 'Dairy', 'Bakery', 'Pantry', 'Beverages'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setGroceryFilterCat(cat)}
                  className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                    groceryFilterCat === cat
                      ? 'bg-[#be7fab] text-[#120a10] font-bold'
                      : 'bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28]/75 dark:text-[#e6c3db]/75 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="mt-3 space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredGroceries.map(item => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all group ${
                    item.checked
                      ? 'bg-[#e6c3db]/35 dark:bg-[#120a10]/50 border-[#d29ec2]/50 dark:border-[#be7fab]/20 text-[#2d1b28]/45 dark:text-[#e6c3db]/45'
                      : 'bg-[#e6c3db]/50 dark:bg-[#241420]/90 border-[#d29ec2] dark:border-[#d29ec2]/35 hover:border-[#be7fab] text-[#2d1b28] dark:text-[#efd0e5]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      onClick={() => handleToggleGrocery(item.id)}
                      className="shrink-0 transition-transform active:scale-95"
                    >
                      {item.checked ? (
                        <CheckCircle2 className="w-4.5 h-4.5 text-[#be7fab] fill-[#be7fab]/25" />
                      ) : (
                        <Circle className="w-4.5 h-4.5 text-[#be7fab] dark:text-[#d29ec2]/70 group-hover:text-[#2d1b28] dark:group-hover:text-[#be7fab]" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className={`text-xs font-semibold leading-tight truncate ${item.checked ? 'line-through text-[#2d1b28]/45 dark:text-[#e6c3db]/45' : 'text-[#2d1b28] dark:text-[#efd0e5]'}`}>
                        {item.name}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-[#2d1b28]/70 dark:text-[#e6c3db]/70 font-mono tabular-nums mt-0.5 flex-wrap">
                        <span>{item.quantity}</span>
                        <span>·</span>
                        <span>{item.category}</span>
                        {item.sourceLocation && (
                          <>
                            <span>·</span>
                            <span className="text-[#be7fab] dark:text-[#daabcb] font-medium">
                              {item.sourceLocation}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteGrocery(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-[#2d1b28]/45 dark:text-[#e6c3db]/45 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] p-1 transition-opacity shrink-0"
                    title="Remove from list"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {filteredGroceries.length === 0 && (
                <div className="py-6 text-center text-xs text-[#2d1b28]/65 dark:text-[#e6c3db]/65 bg-[#e6c3db]/35 dark:bg-[#120a10]/50 rounded-xl border border-dashed border-[#d29ec2] dark:border-[#be7fab]/35">
                  No items in this category. Use &quot;Add to Grocery List&quot; or type an item above!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add Item to Inventory */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-black/75 backdrop-blur-xs">
          <div className="hud-panel hud-corners w-full max-w-md p-5 bg-white dark:bg-[#1c0f19] border-[#be7fab] shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2] dark:border-[#be7fab]/30">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#e6c3db] dark:bg-[#be7fab]/20 text-[#2d1b28] dark:text-[#daabcb]">
                  <FolderPlus className="w-4 h-4" />
                </span>
                <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                  Add Stock to {activeLocationConfig.label}
                </h3>
              </div>
              <button
                onClick={() => setIsAddItemModalOpen(false)}
                className="text-[#be7fab] dark:text-[#e6c3db]/70 hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewItem} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Item Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grass-Fed Ribeye Steaks (16 oz)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5] focus:ring-1 focus:ring-[#be7fab]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5]"
                  >
                    <option value="Produce">Produce</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Poultry">Poultry</option>
                    <option value="Meat">Meat</option>
                    <option value="Seafood">Seafood</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Frozen Fruit">Frozen Fruit</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Spirits">Spirits</option>
                    <option value="Mixers">Mixers</option>
                    <option value="Grains">Grains</option>
                    <option value="Superfoods">Superfoods</option>
                    <option value="Nuts">Nuts</option>
                    <option value="Oils">Oils</option>
                    <option value="Pantry">Pantry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Expiration / Best By
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dec 2026, 2027"
                    value={newItemExp}
                    onChange={(e) => setNewItemExp(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(Number(e.target.value))}
                    min="0"
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg font-mono text-[#2d1b28] dark:text-[#efd0e5]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Unit Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. cartons, lbs, bags, bottles"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vacuum sealed, freezer top shelf"
                  value={newItemNotes}
                  onChange={(e) => setNewItemNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#d29ec2]/60 dark:border-[#be7fab]/25">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-[#2d1b28]/70 dark:text-[#e6c3db]/75 hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-lg"
                >
                  Save Stock Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
