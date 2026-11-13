import { 
  DayMealPlan, 
  FavoriteFoodItem, 
  FoodInventoryItem, 
  GroceryListItem, 
  RecipeCardItem 
} from '../types/mealPlanning';

export const initialDayMealPlans: DayMealPlan[] = [
  {
    dayName: 'Monday',
    dateStr: 'Nov 9, 2026',
    breakfast: [
      { id: 'm-1', name: 'Greek Yogurt Parfait w/ Blueberries & Chia', macros: { calories: 310, protein: 24, carbs: 32, fat: 8 }, serving: '1 Cup' }
    ],
    lunch: [
      { id: 'm-2', name: 'Grilled Lemon Herb Chicken & Quinoa Salad', macros: { calories: 480, protein: 44, carbs: 38, fat: 14 }, serving: '1 Bowl' }
    ],
    dinner: [
      { id: 'm-3', name: 'Wild Alaskan Salmon with Roasted Asparagus', macros: { calories: 540, protein: 46, carbs: 14, fat: 28 }, serving: '6 oz fillet' }
    ],
    snacks: [
      { id: 'm-4', name: 'Apple Slices with Creamy Almond Butter', macros: { calories: 210, protein: 6, carbs: 24, fat: 12 }, serving: '1 Medium Apple' }
    ]
  },
  {
    dayName: 'Tuesday',
    dateStr: 'Nov 10, 2026',
    breakfast: [
      { id: 'm-5', name: 'Scrambled Eggs with Spinach & Sourdough', macros: { calories: 340, protein: 22, carbs: 26, fat: 15 }, serving: '2 Eggs + 1 Slice' }
    ],
    lunch: [
      { id: 'm-6', name: 'Turkey, Avocado & Crisp Romaine Wrap', macros: { calories: 420, protein: 36, carbs: 28, fat: 18 }, serving: '1 Large Wrap' }
    ],
    dinner: [
      { id: 'm-7', name: 'Lean Grass-Fed Beef Stir-Fry with Broccoli', macros: { calories: 510, protein: 48, carbs: 22, fat: 22 }, serving: '1.5 Cups' }
    ],
    snacks: [
      { id: 'm-8', name: 'Vanilla Whey Protein Shake with Almond Milk', macros: { calories: 170, protein: 26, carbs: 5, fat: 3 }, serving: '1 Shake' }
    ]
  },
  {
    dayName: 'Wednesday',
    dateStr: 'Nov 11, 2026',
    breakfast: [
      { id: 'm-9', name: 'Warm Cinnamon Steel Cut Oatmeal with Walnuts', macros: { calories: 320, protein: 12, carbs: 46, fat: 11 }, serving: '1 Cup' }
    ],
    lunch: [
      { id: 'm-10', name: 'Mediterranean Tuna & Chickpea Salad Bowl', macros: { calories: 440, protein: 40, carbs: 34, fat: 14 }, serving: '1 Bowl' }
    ],
    dinner: [
      { id: 'm-11', name: 'Sheet Pan Garlic Herb Shrimp & Zucchini', macros: { calories: 420, protein: 38, carbs: 16, fat: 20 }, serving: '8 oz Shrimp' }
    ],
    snacks: [
      { id: 'm-12', name: 'Cottage Cheese with Sliced Strawberries', macros: { calories: 160, protein: 18, carbs: 14, fat: 3 }, serving: '1/2 Cup' }
    ]
  },
  {
    dayName: 'Thursday (Today)',
    dateStr: 'Nov 12, 2026',
    breakfast: [
      { id: 'm-13', name: 'Avocado Toast with Poached Egg & Hemp Hearts', macros: { calories: 360, protein: 18, carbs: 28, fat: 21 }, serving: '1 Slice Sourdough' }
    ],
    lunch: [
      { id: 'm-14', name: 'Grilled Chicken Breast over Baby Arugula', macros: { calories: 450, protein: 46, carbs: 12, fat: 22 }, serving: '6 oz Chicken' }
    ],
    dinner: [
      { id: 'm-15', name: 'Pan-Seared Halibut with Cauliflower Mash', macros: { calories: 490, protein: 44, carbs: 18, fat: 24 }, serving: '6 oz Halibut' }
    ],
    snacks: [
      { id: 'm-16', name: 'Raw Handful of Almonds & Dark Chocolate (85%)', macros: { calories: 190, protein: 5, carbs: 12, fat: 15 }, serving: '1 oz' }
    ]
  },
  {
    dayName: 'Friday',
    dateStr: 'Nov 13, 2026',
    breakfast: [
      { id: 'm-17', name: 'Green Superfood Smoothie with Collagen', macros: { calories: 290, protein: 28, carbs: 24, fat: 6 }, serving: '16 oz' }
    ],
    lunch: [
      { id: 'm-18', name: 'Warm Bison Bowl with Sweet Potato Mash', macros: { calories: 510, protein: 42, carbs: 44, fat: 16 }, serving: '1 Bowl' }
    ],
    dinner: [
      { id: 'm-19', name: 'Crispy Skin Chicken Thighs with Asparagus', macros: { calories: 530, protein: 44, carbs: 10, fat: 32 }, serving: '2 Thighs' }
    ],
    snacks: [
      { id: 'm-20', name: 'Celery Sticks with Natural Peanut Butter', macros: { calories: 180, protein: 7, carbs: 8, fat: 14 }, serving: '3 Stalks' }
    ]
  },
  {
    dayName: 'Saturday',
    dateStr: 'Nov 14, 2026',
    breakfast: [
      { id: 'm-21', name: 'Protein Oat Pancakes with Pure Maple Drizzle', macros: { calories: 380, protein: 30, carbs: 48, fat: 7 }, serving: '3 Pancakes' }
    ],
    lunch: [
      { id: 'm-22', name: 'Smoked Salmon Carpaccio on Toasted Bagel', macros: { calories: 440, protein: 32, carbs: 42, fat: 12 }, serving: '1 Bagel' }
    ],
    dinner: [
      { id: 'm-23', name: 'Grilled Ribeye Steak with Roasted Mushrooms', macros: { calories: 620, protein: 52, carbs: 8, fat: 38 }, serving: '8 oz Steak' }
    ],
    snacks: [
      { id: 'm-24', name: 'Greek Yogurt with Drizzle of Raw Honey', macros: { calories: 170, protein: 17, carbs: 18, fat: 2 }, serving: '3/4 Cup' }
    ]
  },
  {
    dayName: 'Sunday',
    dateStr: 'Nov 15, 2026',
    breakfast: [
      { id: 'm-25', name: 'Oven-Baked Vegetable Frittata with Feta', macros: { calories: 330, protein: 24, carbs: 10, fat: 20 }, serving: '1 Big Slice' }
    ],
    lunch: [
      { id: 'm-26', name: 'Slow-Cooker Pulled Pork over Slaw', macros: { calories: 470, protein: 42, carbs: 16, fat: 26 }, serving: '1 Cup' }
    ],
    dinner: [
      { id: 'm-27', name: 'Homemade Bone Broth Chicken Noodle Soup', macros: { calories: 390, protein: 36, carbs: 32, fat: 10 }, serving: '2 Bowls' }
    ],
    snacks: [
      { id: 'm-28', name: 'Herbal Peppermint Tea & Rice Cakes', macros: { calories: 90, protein: 2, carbs: 18, fat: 1 }, serving: '2 Cakes' }
    ]
  }
];

export const initialFavoriteFoods: FavoriteFoodItem[] = [
  {
    id: 'fav-1',
    name: 'Wild Salmon Fillet (Pan-Seared)',
    category: 'High Protein',
    serving: '6 oz',
    macros: { calories: 360, protein: 42, carbs: 0, fat: 18 }
  },
  {
    id: 'fav-2',
    name: 'Greek Yogurt (0% or 2% Plain)',
    category: 'High Protein',
    serving: '1 Cup (227g)',
    macros: { calories: 140, protein: 22, carbs: 8, fat: 2 }
  },
  {
    id: 'fav-3',
    name: 'Organic Pasture-Raised Eggs (3 Large)',
    category: 'High Protein',
    serving: '3 Whole Eggs',
    macros: { calories: 210, protein: 18, carbs: 1, fat: 15 }
  },
  {
    id: 'fav-4',
    name: 'Grilled Herb Chicken Breast',
    category: 'High Protein',
    serving: '6 oz',
    macros: { calories: 280, protein: 50, carbs: 0, fat: 6 }
  },
  {
    id: 'fav-5',
    name: 'Mediterranean Quinoa Power Bowl',
    category: 'Lunches & Bowls',
    serving: '1 Full Bowl',
    macros: { calories: 460, protein: 26, carbs: 54, fat: 16 }
  },
  {
    id: 'fav-6',
    name: 'Avocado Toast with Everything Seasoning',
    category: 'Smoothies & Breakfast',
    serving: '1 Thick Sourdough Slice',
    macros: { calories: 260, protein: 7, carbs: 28, fat: 14 }
  },
  {
    id: 'fav-7',
    name: 'Chocolate Almond Protein Smoothie',
    category: 'Smoothies & Breakfast',
    serving: '16 oz Shaker',
    macros: { calories: 310, protein: 32, carbs: 22, fat: 9 }
  },
  {
    id: 'fav-8',
    name: 'Roasted Brussels Sprouts & Bacon',
    category: 'Dinners',
    serving: '1 Cup',
    macros: { calories: 190, protein: 9, carbs: 14, fat: 12 }
  },
  {
    id: 'fav-9',
    name: 'Raw Almonds & Dark Chocolate 85%',
    category: 'Wholesome Snacks',
    serving: '1 oz Almonds + 1 Sq',
    macros: { calories: 210, protein: 6, carbs: 12, fat: 16 }
  },
  {
    id: 'fav-10',
    name: 'Grass-Fed Beef Meatballs in Marinara',
    category: 'Dinners',
    serving: '4 Meatballs',
    macros: { calories: 380, protein: 34, carbs: 12, fat: 21 }
  }
];

export const initialFoodInventories: FoodInventoryItem[] = [
  // Kitchen Fridge
  { id: 'inv-1', name: 'Organic Whole Milk', location: 'kitchen-fridge', category: 'Dairy', quantity: 2, unit: 'gallons', expirationDate: 'Nov 20, 2026' },
  { id: 'inv-2', name: 'Pasture-Raised Organic Eggs', location: 'kitchen-fridge', category: 'Dairy', quantity: 3, unit: 'cartons (18ct)', expirationDate: 'Dec 1, 2026' },
  { id: 'inv-3', name: 'Fage 2% Greek Yogurt', location: 'kitchen-fridge', category: 'Dairy', quantity: 2, unit: '32 oz tubs', expirationDate: 'Nov 26, 2026' },
  { id: 'inv-4', name: 'Baby Spinach & Arugula Mix', location: 'kitchen-fridge', category: 'Produce', quantity: 1, unit: 'tub (16 oz)', expirationDate: 'Nov 17, 2026' },
  { id: 'inv-5', name: 'Fresh Asparagus Spears', location: 'kitchen-fridge', category: 'Produce', quantity: 2, unit: 'bunches', expirationDate: 'Nov 18, 2026' },
  { id: 'inv-6', name: 'Kerrygold Salted Butter', location: 'kitchen-fridge', category: 'Dairy', quantity: 4, unit: 'bars', expirationDate: 'Jan 15, 2027' },

  // Kitchen Freezer
  { id: 'inv-7', name: 'Organic Frozen Blueberries', location: 'kitchen-freezer', category: 'Frozen Fruit', quantity: 3, unit: '3 lb bags', expirationDate: 'Aug 2027' },
  { id: 'inv-8', name: 'Frozen Wild Salmon Fillets', location: 'kitchen-freezer', category: 'Seafood', quantity: 6, unit: 'portions (6 oz)', expirationDate: 'May 2027' },
  { id: 'inv-9', name: 'Ezekiel Sprouted Grain Bread', location: 'kitchen-freezer', category: 'Bakery', quantity: 2, unit: 'loaves', expirationDate: 'Mar 2027' },
  { id: 'inv-10', name: 'Steamed Edamame in Pods', location: 'kitchen-freezer', category: 'Produce', quantity: 4, unit: 'steam bags', expirationDate: 'Jul 2027' },

  // Garage Fridge
  { id: 'inv-11', name: 'Pellegrino Sparkling Mineral Water', location: 'garage-fridge', category: 'Beverages', quantity: 18, unit: 'bottles (750ml)', expirationDate: '2028' },
  { id: 'inv-12', name: 'Cold Brew Coffee Keg / Pitcher', location: 'garage-fridge', category: 'Beverages', quantity: 1, unit: 'gallon', expirationDate: 'Nov 22, 2026' },
  { id: 'inv-13', name: 'Gatorade Zero & Electrolytes', location: 'garage-fridge', category: 'Beverages', quantity: 12, unit: 'bottles', expirationDate: 'Oct 2027' },
  { id: 'inv-14', name: 'Diet Dr Pepper & Sparkling Cans', location: 'garage-fridge', category: 'Beverages', quantity: 24, unit: 'cans', expirationDate: 'Sep 2027' },

  // Garage Freezer
  { id: 'inv-15', name: 'Costco Organic Chicken Breasts', location: 'garage-freezer', category: 'Poultry', quantity: 4, unit: 'twin packs (8 lbs)', expirationDate: 'Dec 2027' },
  { id: 'inv-16', name: 'Ground Grass-Fed Bison 90/10', location: 'garage-freezer', category: 'Meat', quantity: 6, unit: '1 lb bricks', expirationDate: 'Nov 2027' },
  { id: 'inv-17', name: 'Frozen Jumbo Gulf Shrimp (Raw)', location: 'garage-freezer', category: 'Seafood', quantity: 2, unit: '2 lb bags', expirationDate: 'Oct 2027' },

  // Garage Full Freezer
  { id: 'inv-18', name: 'Half Beef Share (Ribeye, Chuck, Steaks)', location: 'garage-full-freezer', category: 'Butcher Stock', quantity: 18, unit: 'butcher packs', expirationDate: '2027' },
  { id: 'inv-19', name: 'Berkshire Pork Chops (Thick Cut)', location: 'garage-full-freezer', category: 'Pork', quantity: 8, unit: 'pairs', expirationDate: '2027' },
  { id: 'inv-20', name: 'Organic Turkey Breast Roasts', location: 'garage-full-freezer', category: 'Poultry', quantity: 3, unit: 'whole roasts', expirationDate: 'Nov 2027' },
  { id: 'inv-21', name: 'Homemade Bone Broth Cubes', location: 'garage-full-freezer', category: 'Broth', quantity: 8, unit: 'quart containers', expirationDate: 'Jan 2028' },

  // Behind the Bar
  { id: 'inv-22', name: 'Casamigos Blanco Tequila', location: 'behind-the-bar', category: 'Spirits', quantity: 2, unit: '750ml bottles', expirationDate: 'Indefinite' },
  { id: 'inv-23', name: 'Woodford Reserve Bourbon', location: 'behind-the-bar', category: 'Spirits', quantity: 1, unit: 'bottle (1L)', expirationDate: 'Indefinite' },
  { id: 'inv-24', name: 'Fever-Tree Club Soda & Tonic', location: 'behind-the-bar', category: 'Mixers', quantity: 16, unit: 'mini bottles', expirationDate: '2027' },
  { id: 'inv-25', name: 'Bitters & Organic Cocktail Cherries', location: 'behind-the-bar', category: 'Garnish', quantity: 2, unit: 'jars', expirationDate: '2028' },

  // Pantry
  { id: 'inv-26', name: 'Extra Virgin Greek Olive Oil (Cold Pressed)', location: 'pantry', category: 'Oils', quantity: 3, unit: '1L tins', expirationDate: 'Jun 2028' },
  { id: 'inv-27', name: 'Organic Tri-Color Quinoa', location: 'pantry', category: 'Grains', quantity: 2, unit: '4 lb bags', expirationDate: '2028' },
  { id: 'inv-28', name: 'Jasmine Rice (Royal Basmati)', location: 'pantry', category: 'Grains', quantity: 1, unit: '20 lb bag', expirationDate: '2029' },
  { id: 'inv-29', name: 'Organic Raw Chia Seeds & Flaxseed', location: 'pantry', category: 'Superfoods', quantity: 2, unit: '2 lb bags', expirationDate: '2027' },
  { id: 'inv-30', name: 'Kirkland Raw Almonds & Walnuts', location: 'pantry', category: 'Nuts', quantity: 2, unit: '3 lb bags', expirationDate: 'Aug 2027' },
  { id: 'inv-31', name: 'Pure Grade A Dark Maple Syrup', location: 'pantry', category: 'Sweeteners', quantity: 2, unit: '32 oz jugs', expirationDate: '2028' }
];

export const initialGroceryList: GroceryListItem[] = [
  { id: 'g-1', name: 'Wild Salmon Fillets (Fresh)', category: 'Meat & Seafood', quantity: '2 lbs', checked: false },
  { id: 'g-2', name: 'Fresh Asparagus', category: 'Produce', quantity: '2 bunches', checked: false },
  { id: 'g-3', name: 'Organic Baby Spinach', category: 'Produce', quantity: '1 tub', checked: true },
  { id: 'g-4', name: 'Sourdough Country Loaf', category: 'Bakery', quantity: '1 loaf', checked: false },
  { id: 'g-5', name: 'Fage Greek Yogurt 2%', category: 'Dairy', quantity: '2 tubs', checked: true },
  { id: 'g-6', name: 'Avocados (Hass)', category: 'Produce', quantity: '6 count', checked: false },
  { id: 'g-7', name: 'Raw Honey', category: 'Pantry', quantity: '1 jar', checked: false, sourceLocation: 'Pantry' },
  { id: 'g-8', name: 'San Pellegrino Sparkling Water', category: 'Beverages', quantity: '1 case (12ct)', checked: false, sourceLocation: 'Garage Fridge' }
];

export const initialRecipeCards: RecipeCardItem[] = [
  {
    id: 'rec-1',
    title: 'Sheet Pan Lemon Garlic Salmon & Asparagus',
    prepTime: '10 Mins',
    cookTime: '15 Mins',
    servings: 4,
    category: 'Dinner / Seafood',
    isFavorite: true,
    macros: { calories: 480, protein: 44, carbs: 9, fat: 28 },
    ingredients: [
      '4 wild salmon fillets (approx. 6 oz each)',
      '1 lb fresh asparagus, woody ends trimmed',
      '3 cloves fresh garlic, finely minced',
      '2 tbsp extra virgin olive oil',
      '1 fresh lemon, thinly sliced plus juice of 1/2 lemon',
      '1 tsp smoked paprika & cracked black pepper',
      'Flaky Maldon sea salt to taste'
    ],
    steps: [
      'Preheat oven to 400°F (200°C) and line a large baking sheet with parchment paper.',
      'Arrange salmon fillets in the center and spread trimmed asparagus around the perimeter.',
      'In a small bowl, whisk olive oil, minced garlic, lemon juice, paprika, salt, and pepper.',
      'Brush garlic herb oil generously over the salmon and toss with asparagus.',
      'Top each salmon fillet with 2 lemon wheels.',
      'Bake for 12–15 minutes until salmon is tender and flakes easily with a fork.'
    ],
    notes: 'Pairs wonderfully with a side of quinoa or warm cauliflower purée.'
  },
  {
    id: 'rec-2',
    title: 'Mediterranean Quinoa Power Bowl',
    prepTime: '15 Mins',
    cookTime: '15 Mins',
    servings: 2,
    category: 'Lunch / Grain Bowl',
    isFavorite: true,
    macros: { calories: 440, protein: 28, carbs: 42, fat: 18 },
    ingredients: [
      '1 cup cooked tri-color quinoa, cooled',
      '2 grilled chicken breasts (or canned wild tuna), cubed',
      '1 cup Persian cucumbers, diced',
      '1 cup cherry tomatoes, halved',
      '1/4 cup Kalamata olives, pitted & halved',
      '1/4 cup crumbled sheep milk feta cheese',
      '2 tbsp extra virgin olive oil & red wine vinegar'
    ],
    steps: [
      'Cook quinoa according to package directions, fluff with fork, and let cool.',
      'Divide quinoa between two tactile lunch bowls.',
      'Top with diced cucumber, cherry tomatoes, Kalamata olives, and grilled chicken.',
      'Sprinkle crumbled feta over the bowls.',
      'Drizzle with olive oil and red wine vinegar, finishing with a pinch of dried oregano.'
    ],
    notes: 'Keeps fresh in the fridge for up to 4 days for effortless weekly meal prep.'
  },
  {
    id: 'rec-3',
    title: 'Berry Chia Protein Overnight Oats',
    prepTime: '5 Mins',
    cookTime: '0 Mins (Chill Overnight)',
    servings: 1,
    category: 'Breakfast',
    isFavorite: false,
    macros: { calories: 340, protein: 26, carbs: 42, fat: 8 },
    ingredients: [
      '1/2 cup rolled old-fashioned oats',
      '1 tbsp organic black chia seeds',
      '1 scoop vanilla whey or collagen peptides',
      '3/4 cup unsweetened almond milk',
      '1/4 cup plain Greek yogurt',
      '1/2 cup fresh wild blueberries'
    ],
    steps: [
      'In a wide-mouth mason jar, combine oats, chia seeds, and protein powder.',
      'Pour in almond milk and Greek yogurt; stir thoroughly with a spoon until combined.',
      'Fold in fresh blueberries.',
      'Seal lid and refrigerate overnight (at least 6 hours).',
      'Enjoy chilled in the morning with a sprinkle of toasted walnuts or hemp seeds.'
    ],
    notes: 'High in soluble fiber to maintain steady morning blood glucose.'
  }
];
