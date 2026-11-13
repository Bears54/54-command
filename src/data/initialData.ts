import {
  AppleHealthData,
  BillItem,
  CleaningChore,
  ContactItem,
  CustomPage,
  DocumentItem,
  HabitCard,
  HabitItem,
  HomeProject,
  ImportantDate,
  KanbanTask,
  MacroData,
  MealPlanDay,
  NoteItem,
  PriorityItem,
  TodoItem,
  UserProfile,
  WatchlistItem,
  WeatherData,
} from '../types/binder';

export const initialWeather: WeatherData = {
  location: 'West Bend, WI',
  temperature: 66,
  condition: 'Sunny',
  high: 70,
  low: 54,
  humidity: 58,
  feelsLike: 65,
};

export const initialAppleHealth: AppleHealthData = {
  steps: {
    current: 8420,
    goal: 10000,
  },
  sleep: {
    hours: 7,
    minutes: 35,
    goalHours: 8,
    quality: 'Deep & Restful',
  },
  calories: {
    burned: 545,
    goal: 650,
  },
  bloodSugar: {
    value: 94,
    unit: 'mg/dL',
    status: 'Fasting',
    range: 'Normal',
  },
};

export const initialMacros: MacroData = {
  calories: { current: 1720, goal: 2150 },
  protein: { current: 125, goal: 150 },
  carbs: { current: 180, goal: 220 },
  fat: { current: 52, goal: 65 },
};

export const initialPriorities: PriorityItem[] = [
  { id: 'p-1', text: 'Finalize Q4 strategy roadmap and review with Elena', completed: true },
  { id: 'p-2', text: 'Schedule annual dental checkup & submit dental flex claim', completed: false },
  { id: 'p-3', text: 'Repot indoor fiddle leaf fig & prepare balcony winter pots', completed: false },
];

export const initialTodos: TodoItem[] = [
  { id: 't-1', title: 'Pick up organic produce box at farmer’s market', completed: true, dueDate: '2026-11-12', category: 'Errand', priority: 'medium' },
  { id: 't-2', title: 'Send revised project contract to client for signature', completed: true, dueDate: '2026-11-12', category: 'Work', priority: 'high' },
  { id: 't-3', title: 'Call veterinary clinic to order Chloe’s heartworm chewables', completed: true, dueDate: '2026-11-12', category: 'Personal', priority: 'low' },
  { id: 't-4', title: 'Draft weekly meal prep grocery inventory', completed: false, dueDate: '2026-11-12', category: 'Personal', priority: 'medium' },
  { id: 't-5', title: 'Review water filtration filter replacement notice', completed: false, dueDate: '2026-11-12', category: 'Personal', priority: 'low' },
  { id: 't-6', title: 'Read 25 pages of "Atomic Habits" before bedtime', completed: false, dueDate: '2026-11-12', category: 'Health', priority: 'low' },
];

export const initialHabits: HabitItem[] = [
  {
    id: 'h-1',
    name: 'Morning Hydration (16oz with lemon)',
    category: 'Wellness',
    streak: 18,
    targetPerWeek: 7,
    completedToday: true,
    history: { '2026-11-10': true, '2026-11-11': true, '2026-11-12': true },
  },
  {
    id: 'h-2',
    name: '30-Minute Outdoor Brisk Walk',
    category: 'Wellness',
    streak: 9,
    targetPerWeek: 5,
    completedToday: true,
    history: { '2026-11-10': true, '2026-11-11': true, '2026-11-12': true },
  },
  {
    id: 'h-3',
    name: '10-Minute Daily Mindfulness Breathwork',
    category: 'Mindfulness',
    streak: 14,
    targetPerWeek: 7,
    completedToday: true,
    history: { '2026-11-10': true, '2026-11-11': true, '2026-11-12': true },
  },
  {
    id: 'h-4',
    name: 'Evening Screen-Free Wind Down (9:30 PM)',
    category: 'Mindfulness',
    streak: 5,
    targetPerWeek: 6,
    completedToday: false,
    history: { '2026-11-10': true, '2026-11-11': false, '2026-11-12': false },
  },
  {
    id: 'h-5',
    name: 'Log Daily Expenses in Finance Hub',
    category: 'Productivity',
    streak: 22,
    targetPerWeek: 7,
    completedToday: true,
    history: { '2026-11-10': true, '2026-11-11': true, '2026-11-12': true },
  },
];

export const initialBills: BillItem[] = [
  { id: 'b-1', title: "Sam's Credit Card Payment", amount: 25.00, dueDate: '2026-11-12', category: 'Credit', isPaid: false, autopay: false },
  { id: 'b-2', title: 'Rocket Mortgage', amount: 1400.00, dueDate: '2026-11-14', category: 'Housing', isPaid: false, autopay: true },
  { id: 'b-3', title: 'Spectrum Internet', amount: 30.00, dueDate: '2026-11-14', category: 'Utilities', isPaid: false, autopay: true },
  { id: 'b-4', title: 'Transfer to US Bank Savings', amount: 1000.00, dueDate: '2026-11-20', category: 'Credit', isPaid: false, autopay: false },
  { id: 'b-5', title: 'We Energies', amount: 253.00, dueDate: '2026-11-05', category: 'Utilities', isPaid: true, autopay: true },
  { id: 'b-6', title: 'T-Mobile Phone', amount: 45.86, dueDate: '2026-11-05', category: 'Utilities', isPaid: true, autopay: true },
  { id: 'b-7', title: 'PNC Credit Card Payment', amount: 1000.00, dueDate: '2026-11-01', category: 'Credit', isPaid: true, autopay: false },
  { id: 'b-8', title: 'US Bank Credit Card Payment', amount: 1000.00, dueDate: '2026-11-01', category: 'Credit', isPaid: true, autopay: false },
];

export const initialImportantDates: ImportantDate[] = [
  { id: 'd-1', title: 'Mom’s 60th Birthday Celebration', date: '2026-11-14', type: 'Birthday', reminderDaysBefore: 3 },
  { id: 'd-2', title: 'Dentist Hygiene Appointment (Dr. Vance)', date: '2026-11-17', type: 'Appointment', reminderDaysBefore: 1 },
  { id: 'd-3', title: 'Car Annual Registration & Smog Check', date: '2026-11-24', type: 'Deadline', reminderDaysBefore: 7 },
  { id: 'd-4', title: 'Thanksgiving Holiday Family Dinner', date: '2026-11-26', type: 'Holiday', reminderDaysBefore: 5 },
  { id: 'd-5', title: 'Wedding Anniversary Trip Planning', date: '2026-12-04', type: 'Anniversary', reminderDaysBefore: 14 },
];

export const initialCleaningChores: CleaningChore[] = [
  { id: 'c-1', task: 'Wipe kitchen counters & stovetop', room: 'Kitchen', frequency: 'Daily', completed: true, lastDone: 'Today' },
  { id: 'c-2', task: 'Empty & run dishwasher before bed', room: 'Kitchen', frequency: 'Daily', completed: false, lastDone: 'Yesterday' },
  { id: 'c-3', task: 'Quick vacuum living room wool rug', room: 'Living Room', frequency: 'Daily', completed: true, lastDone: 'Today' },
  { id: 'c-4', task: 'Sanitize bathroom sink & mirrors', room: 'Bathroom', frequency: 'Weekly', completed: false, lastDone: '4 days ago' },
  { id: 'c-5', task: 'Wash linen bedsheets & pillowcases', room: 'Bedroom', frequency: 'Weekly', completed: false, lastDone: '6 days ago' },
  { id: 'c-6', task: 'Take out recycling & compost bin', room: 'Whole Home', frequency: 'Daily', completed: true, lastDone: 'Today' },
];

export const initialHomeProjects: HomeProject[] = [
  {
    id: 'hp-1',
    title: 'Guest Bedroom Warm Aesthetic Makeover',
    category: 'Renovation',
    progress: 70,
    budget: 1200,
    spent: 840,
    status: 'In Progress',
    targetDate: '2026-11-28',
    tasks: [
      { id: 'pt-1', text: 'Paint accent wall in Creamy Terracotta', done: true },
      { id: 'pt-2', text: 'Install brushed brass bedside sconces', done: true },
      { id: 'pt-3', text: 'Assemble oak nightstands and hang linen drapes', done: true },
      { id: 'pt-4', text: 'Hang framed vintage botanical prints', done: false },
      { id: 'pt-5', text: 'Add cozy wool throw and guest welcome tray', done: false },
    ],
  },
  {
    id: 'hp-2',
    title: 'Balcony Herb & Tea Garden Planters',
    category: 'Garden',
    progress: 45,
    budget: 350,
    spent: 195,
    status: 'In Progress',
    targetDate: '2026-11-20',
    tasks: [
      { id: 'pt-6', text: 'Purchase cedar planter boxes & organic potting soil', done: true },
      { id: 'pt-7', text: 'Plant rosemary, sweet basil, mint, and thyme', done: true },
      { id: 'pt-8', text: 'Set up micro drip irrigation timer', done: false },
      { id: 'pt-9', text: 'Add solar fairy lantern lights', done: false },
    ],
  },
  {
    id: 'hp-3',
    title: 'Pantry Deep Organization & Glass Jar System',
    category: 'Organization',
    progress: 100,
    budget: 250,
    spent: 215,
    status: 'Completed',
    targetDate: '2026-11-05',
    tasks: [
      { id: 'pt-10', text: 'Declutter and check pantry expiration dates', done: true },
      { id: 'pt-11', text: 'Decant grains and spices into airtight glass containers', done: true },
      { id: 'pt-12', text: 'Apply waterproof embossed labels', done: true },
    ],
  },
];

export const initialQuickNotes = `📌 Quick Scratchpad Notes:
• Remember to order organic olive oil from Napa Valley farm
• Ask Dr. Vance about night guard replacement option on Tuesday
• Recipe idea: Roasted kabocha squash with whipped ricotta and toasted sage
• Confirm Thanksgiving pie selections with Sarah by Friday`;

export const initialKanbanTasks: KanbanTask[] = [
  {
    id: 'kb-0',
    title: 'Renew annual homeowners insurance policy documentation',
    description: 'Call State Farm agent Gary Roberts for updated policy declaration sheet',
    column: 'overdue',
    priority: 'high',
    tags: ['Home', 'Finance'],
    dueDate: '2026-11-08',
    reminderTime: '10:00 AM',
    frequency: 'Once',
    autoRollover: true,
  },
  {
    id: 'kb-1',
    title: 'Prepare quarterly tax estimates and compile deductible receipts',
    description: 'Export CSV bank statements and send to CPA portal',
    column: 'high',
    priority: 'high',
    tags: ['Finance', 'Taxes'],
    dueDate: '2026-11-14',
    reminderTime: '09:00 AM',
    frequency: 'Monthly',
    autoRollover: true,
  },
  {
    id: 'kb-2',
    title: 'Design customized photo calendar for family holiday gifts',
    description: 'Curate 24 photos from 2026 trips and print on textured cardstock',
    column: 'medium',
    priority: 'medium',
    tags: ['Family', 'Gifts'],
    dueDate: '2026-11-20',
    reminderTime: '02:00 PM',
    frequency: 'Once',
    autoRollover: true,
  },
  {
    id: 'kb-3',
    title: 'Research energy-efficient smart thermostat models',
    description: 'Compare ecobee vs Nest for compatibility with heat pump system',
    column: 'medium',
    priority: 'medium',
    tags: ['Home', 'Tech'],
    dueDate: '2026-11-19',
    reminderTime: '11:00 AM',
    frequency: 'Once',
    autoRollover: true,
  },
  {
    id: 'kb-4',
    title: 'Order replacement HEPA filters for living room air purifier',
    description: 'Check 2-pack discount on official manufacturer store',
    column: 'low',
    priority: 'low',
    tags: ['Maintenance'],
    dueDate: '2026-11-21',
    reminderTime: '04:00 PM',
    frequency: 'Monthly',
    autoRollover: true,
  },
  {
    id: 'kb-5',
    title: 'Deep clean refrigerator & organize produce crisper bins',
    description: 'Wiped down shelves with warm baking soda solution and fresh drawer liners',
    column: 'done',
    priority: 'low',
    tags: ['Home', 'Cleaning'],
    dueDate: '2026-11-11',
    reminderTime: '01:00 PM',
    frequency: 'Weekly',
    autoRollover: false,
  },
];

export const initialHabitCards: HabitCard[] = [
  { id: 'dh-1', title: 'Go for a Walk', column: 'done', category: 'Movement', streak: 12 },
  { id: 'dh-2', title: 'Take Vitamins', column: 'done', category: 'Nutrition', streak: 21 },
  { id: 'dh-3', title: 'Go in Sauna', column: 'todo', category: 'Recovery', streak: 5 },
  { id: 'dh-4', title: 'Protein Shake', column: 'done', category: 'Nutrition', streak: 15 },
  { id: 'dh-5', title: 'Workout', column: 'todo', category: 'Fitness', streak: 8 },
  { id: 'dh-6', title: 'Drink 8 Glasses of Water', column: 'todo', category: 'Hydration', isWaterHabit: true, waterGlasses: 5, streak: 19 },
  { id: 'dh-7', title: 'Download Shows', column: 'todo', category: 'Media', streak: 3 },
  { id: 'dh-8', title: 'Charge Generator', column: 'todo', category: 'Home & Power', streak: 7 },
];

export const initialCalendarNotes: Record<string, string> = {
  '2026-11-12': 'Focus on Q4 roadmap + evening sauna & reading',
  '2026-11-14': 'Mom 60th birthday dinner celebration at Bistro L’Ami',
  '2026-11-17': 'Dentist appointment with Dr. Vance at 2:00 PM',
  '2026-11-26': 'Thanksgiving family dinner & gratitude toast',
};

export const initialHourlySchedule: Record<string, Record<string, string>> = {
  '2026-11-12': {
    '08:00 AM': 'Morning hydration (lemon water) & light stretching',
    '09:00 AM': 'Review Q4 strategy roadmap & prepare deck',
    '10:00 AM': 'Team design critique & feedback review',
    '11:00 AM': 'Deep work block: Architecture guidelines draft',
    '12:00 PM': 'Mediterranean harvest salad lunch & 20m sunshine walk',
    '01:00 PM': 'Client sync call & revisions alignment',
    '02:00 PM': 'Home projects check: Balcony herb planter timer',
    '03:00 PM': 'Workout session: Functional strength training',
    '04:00 PM': 'Protein shake & 20 min sauna session',
    '05:00 PM': 'Wrap up emails & review bills due today',
    '06:00 PM': 'Cook miso-glazed black cod with roasted veggies',
    '07:00 PM': 'Family dinner & unwind',
    '08:00 PM': 'Read 25 pages of "Atomic Habits"',
    '09:00 PM': 'Evening tea & screen-free wind down',
    '10:00 PM': 'Prepare bedroom, diffuse lavender essential oil',
    '11:00 PM': 'Restorative deep sleep',
    '12:00 AM': 'Resting',
  },
};


export const initialMealPlan: MealPlanDay[] = [
  {
    dayName: 'Monday',
    date: '2026-11-09',
    breakfast: 'Avocado toast with poached organic eggs and chili flakes',
    lunch: 'Mediterranean quinoa bowl with roasted chickpeas and lemon tahini',
    dinner: 'Pan-seared wild salmon with asparagus and rosemary baby potatoes',
    snacks: 'Greek yogurt with raw honey and walnuts',
  },
  {
    dayName: 'Tuesday',
    date: '2026-11-10',
    breakfast: 'Steel-cut oats with chia seeds, blueberries, and almond butter',
    lunch: 'Turkey and havarti sourdough wrap with crisp romaine and Dijon',
    dinner: 'Slow-cooker black bean chili with avocado and warm cornbread',
    snacks: 'Apple slices with cashew butter',
  },
  {
    dayName: 'Wednesday',
    date: '2026-11-11',
    breakfast: 'Green smoothie bowl (spinach, banana, plant protein, hemp hearts)',
    lunch: 'Leftover black bean chili with cilantro lime rice',
    dinner: 'Thai red curry with tofu, bell peppers, bamboo shoots, and jasmine rice',
    snacks: 'Handful of roasted almonds & dark chocolate square',
  },
  {
    dayName: 'Thursday (Today)',
    date: '2026-11-12',
    breakfast: 'Warm sourdough with whipped ricotta, poached figs, and honey',
    lunch: 'Roasted chicken breast salad with arugula, walnuts, and goat cheese',
    dinner: 'Miso-glazed black cod with steamed bok choy and brown rice',
    snacks: 'Cottage cheese with diced peaches and pumpkin seeds',
  },
  {
    dayName: 'Friday',
    date: '2026-11-13',
    breakfast: 'French rolled omelette with fresh herbs and sliced avocado',
    lunch: 'Smoked salmon tartine with pickled red onions and capers',
    dinner: 'Artisanal homemade pizza night: sourdough crust, burrata, basil',
    snacks: 'Matcha latte with oat milk',
  },
  {
    dayName: 'Saturday',
    date: '2026-11-14',
    breakfast: 'Fluffy ricotta buttermilk pancakes with maple syrup',
    lunch: 'Farmers market harvest salad with crusty sourdough bread',
    dinner: 'Family Birthday Dinner at Bistro L’Ami',
    snacks: 'Fresh blackberries and almond croissant',
  },
  {
    dayName: 'Sunday',
    date: '2026-11-15',
    breakfast: 'Shakshuka with feta cheese and warm pita bread',
    lunch: 'Comforting bone broth noodle bowl with shiitake mushrooms',
    dinner: 'Sheet pan roasted lemon-herb chicken with root vegetables',
    snacks: 'Spiced chai tea with digestive biscuits',
  },
];

export const initialWatchlist: WatchlistItem[] = [
  { id: 'w-1', title: 'Dune: Part Two', type: 'Movie', status: 'Finished', rating: 5, genre: 'Sci-Fi Epic', notes: 'Incredible sound design and visuals' },
  { id: 'w-2', title: 'The Bear (Season 3)', type: 'Series', status: 'In Progress', rating: 5, genre: 'Drama', notes: 'Episode "Napkins" was a masterpiece' },
  { id: 'w-3', title: 'Slow Horses', type: 'Series', status: 'Want to Watch', rating: 4, genre: 'Espionage', notes: 'Recommended by Marcus' },
  { id: 'w-4', title: 'Tomorrow, and Tomorrow, and Tomorrow', type: 'Book', status: 'Finished', rating: 5, genre: 'Fiction', notes: 'Beautiful journey of friendship and creative collaboration' },
  { id: 'w-5', title: 'Outlive: The Science and Art of Longevity', type: 'Book', status: 'In Progress', rating: 5, genre: 'Health/Science', notes: 'Practical guide to metabolic health & zone 2 cardio' },
  { id: 'w-6', title: 'Huberman Lab: Sleep Optimization Toolkit', type: 'Podcast', status: 'Finished', rating: 5, genre: 'Health', notes: 'Morning sunlight & temperature control tips' },
];

export const initialContacts: ContactItem[] = [
  { id: 'ct-1', name: 'Elena Chen', relation: 'Friend', phone: '+1 (415) 890-2341', email: 'elena.chen@studio.design', birthday: '1992-06-18', notes: 'Architect & design collaborator; loves pour-over coffee' },
  { id: 'ct-2', name: 'Dr. Arthur Vance (Dentist)', relation: 'Professional', phone: '+1 (415) 555-0199', email: 'office@vancedentalcare.com', notes: 'Downtown clinic suite 400; accepts Delta Dental' },
  { id: 'ct-3', name: 'Marcus Miller', relation: 'Family', phone: '+1 (206) 774-8812', email: 'marcus.m@pacificmail.net', birthday: '1989-09-22', notes: 'Brother in Seattle; vegetarian' },
  { id: 'ct-4', name: 'Bay Plumber Pro (Mike)', relation: 'Services', phone: '+1 (415) 344-9901', email: 'mike@bayplumbers.com', notes: 'Reliable water heater & plumbing specialist' },
  { id: 'ct-5', name: 'Mom (Claire Miller)', relation: 'Family', phone: '+1 (503) 440-1288', email: 'claire.m@oregonlife.org', birthday: '1966-11-14', notes: '60th birthday this weekend!' },
];

export const initialNotes: NoteItem[] = [
  {
    id: 'n-1',
    title: 'Essential House Maintenance Fall Checklist',
    content: `1. Check smoke detectors & replace 9V backup batteries
2. Clean gutters and downspout extensions before winter rains
3. Inspect weather stripping around front patio and french doors
4. Service furnace & swap air filters to MERV 11
5. Drain outdoor hose bibs to prevent freezing`,
    category: 'Lists',
    pinned: true,
    updatedAt: '2026-11-10',
  },
  {
    id: 'n-2',
    title: 'Morning Ritual for Calm Focus',
    content: `• 6:45 AM: Gentle wake-up, warm water with pinch of sea salt
• 7:00 AM: 10 mins meditation + 5 mins journaling 3 gratitudes
• 7:20 AM: Brisk walk in morning light before opening email
• 8:00 AM: Deep focus block on primary milestone without distraction`,
    category: 'Journal',
    pinned: true,
    updatedAt: '2026-11-11',
  },
  {
    id: 'n-3',
    title: 'Perfect Sourdough Focaccia with Rosemary & Sea Salt',
    content: `Ingredients:
- 400g bread flour (King Arthur)
- 320g lukewarm water (80% hydration)
- 80g active sourdough starter
- 8g fine sea salt + flaky Maldon for topping
- 40g extra virgin olive oil + fresh rosemary sprigs

Method:
Autolyse flour & water 45 mins. Fold in starter and salt. 4 sets of stretch and folds every 30 mins. Cold proof in oiled pan in fridge 18-24 hrs. Dimple with oiled fingers, press in rosemary, bake at 425°F for 24-28 mins until golden blistered.`,
    category: 'Recipes',
    pinned: false,
    updatedAt: '2026-11-04',
  },
];

export const initialDocuments: DocumentItem[] = [
  { id: 'doc-1', title: 'Passport (United States)', category: 'Identification', docNumber: 'P984210984', expirationDate: '2031-08-14', location: 'Fireproof Safe - Drawer 1', notes: 'Renew 6 months before international travel' },
  { id: 'doc-2', title: 'Homeowners Property Insurance Policy', category: 'Property', docNumber: 'HO6-2026-8812', expirationDate: '2027-04-01', location: 'Digital Cloud Vault + Physical Folder B3', notes: 'State Farm agent: Gary Roberts' },
  { id: 'doc-3', title: 'Automobile Title & Insurance Card', category: 'Vehicle', docNumber: 'GEICO-CA-9941', expirationDate: '2027-02-15', location: 'Glove Compartment & Digital Safe', notes: '2023 Subaru Outback Touring' },
  { id: 'doc-4', title: 'Health Insurance Plan Summary & HSA', category: 'Medical', docNumber: 'ANTHEM-BLUE-904', expirationDate: '2026-12-31', location: 'Filing Cabinet - Medical Folder', notes: 'Annual out-of-pocket max met in October' },
];

export const initialCustomPages: CustomPage[] = [
  {
    id: 'gardening',
    name: 'Balcony Garden',
    icon: 'Sprout',
    color: '#be7fab',
    notes: 'Winterizing planter boxes and planning spring tulip bulbs in December.',
    items: [
      { id: 'gi-1', text: 'Trim back dead lavender stems', done: true },
      { id: 'gi-2', text: 'Apply layer of organic mulch to keep roots warm', done: true },
      { id: 'gi-3', text: 'Bring tender ceramic potted citrus inside before frost', done: false },
    ],
    createdAt: '2026-11-01',
  },
];

export const initialUserProfile: UserProfile = {
  name: 'Sarah Miller',
  tagline: 'Designer & Mindful Living Enthusiast',
  avatarSeed: 'sarah_m',
  accentPreference: 'rose-teal',
};
