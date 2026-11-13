import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  RotateCcw,
  Home,
  X,
  PartyPopper,
  ListTodo,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';

export type CleaningTab =
  | 'Today'
  | 'Daily'
  | 'Weekly'
  | 'Monthly'
  | 'Home Maintenance'
  | 'Home To-Dos'
  | '30-Day'
  | 'Chores'
  | 'Rooms';

export interface CleaningRoutineItem {
  id: string;
  title: string;
  room: string;
  tab: CleaningTab;
  priority: 'High' | 'Medium' | 'Low';
  estimatedMinutes: number;
  completed: boolean;
  lastDone?: string;
}

export interface RoomCardData {
  id: string;
  name: string;
  iconName: string;
  description: string;
  tasks: { id: string; text: string; done: boolean }[];
}

const STORAGE_CHORES_KEY = 'lifebinder_cleaning_v2_chores';
const STORAGE_ROOMS_KEY = 'lifebinder_cleaning_v2_rooms';

const initialRoutineItems: CleaningRoutineItem[] = [
  { id: 'c-1', title: 'Wipe kitchen quartz counters & sanitize sink', room: 'Kitchen', tab: 'Today', priority: 'High', estimatedMinutes: 10, completed: true, lastDone: 'Nov 12, 2026' },
  { id: 'c-2', title: 'Empty dishwasher & restock dish pods', room: 'Kitchen', tab: 'Today', priority: 'Medium', estimatedMinutes: 5, completed: true, lastDone: 'Nov 12, 2026' },
  { id: 'c-3', title: 'Make primary bed & fluff decorative pillows', room: 'Master Bedroom', tab: 'Today', priority: 'Medium', estimatedMinutes: 5, completed: true, lastDone: 'Nov 12, 2026' },
  { id: 'c-4', title: 'Evening 15-minute whole-home reset & tidy', room: 'Whole Home', tab: 'Today', priority: 'High', estimatedMinutes: 15, completed: false },

  { id: 'c-5', title: 'Sweep kitchen & dining hardwood floors', room: 'Kitchen', tab: 'Daily', priority: 'High', estimatedMinutes: 10, completed: true, lastDone: 'Nov 12' },
  { id: 'c-6', title: 'Squeegee primary shower glass after morning routine', room: 'Primary Bath', tab: 'Daily', priority: 'Medium', estimatedMinutes: 3, completed: false },
  { id: 'c-7', title: 'Sort incoming mail & recycle flyers', room: 'Entryway', tab: 'Daily', priority: 'Low', estimatedMinutes: 5, completed: true, lastDone: 'Nov 12' },
  { id: 'c-8', title: 'Wipe down dining room table after meals', room: 'Dining', tab: 'Daily', priority: 'Medium', estimatedMinutes: 5, completed: false },

  { id: 'c-9', title: 'Strip & wash all bed linens with linen spray', room: 'Master Bedroom', tab: 'Weekly', priority: 'High', estimatedMinutes: 30, completed: false },
  { id: 'c-10', title: 'Scrub & disinfect primary and guest toilet bowls', room: 'Bathrooms', tab: 'Weekly', priority: 'High', estimatedMinutes: 20, completed: true, lastDone: 'Nov 10' },
  { id: 'c-11', title: 'Mop all tile & sealed hardwood surfaces', room: 'Whole Home', tab: 'Weekly', priority: 'Medium', estimatedMinutes: 45, completed: false },
  { id: 'c-12', title: 'Empty and wipe inside of microwave & oven door', room: 'Kitchen', tab: 'Weekly', priority: 'Low', estimatedMinutes: 15, completed: false },

  { id: 'c-13', title: 'Deep clean refrigerator shelves & produce bins', room: 'Kitchen', tab: 'Monthly', priority: 'High', estimatedMinutes: 45, completed: false },
  { id: 'c-14', title: 'Wash shower curtain liners and bath mats', room: 'Bathrooms', tab: 'Monthly', priority: 'Medium', estimatedMinutes: 30, completed: true, lastDone: 'Nov 1' },
  { id: 'c-15', title: 'Dust high ceiling fans, vents, and crown molding', room: 'Whole Home', tab: 'Monthly', priority: 'Medium', estimatedMinutes: 35, completed: false },
  { id: 'c-16', title: 'Polish stainless steel appliances and hardware', room: 'Kitchen', tab: 'Monthly', priority: 'Low', estimatedMinutes: 20, completed: false },

  { id: 'c-17', title: 'Replace HVAC furnace filters (Merv 11 - 16x25x4)', room: 'Utility Room', tab: 'Home Maintenance', priority: 'High', estimatedMinutes: 15, completed: true, lastDone: 'Nov 5' },
  { id: 'c-18', title: 'Test smoke and carbon monoxide detector alarms', room: 'Whole Home', tab: 'Home Maintenance', priority: 'High', estimatedMinutes: 10, completed: false },
  { id: 'c-19', title: 'Inspect water heater pressure relief valve & flush drain', room: 'Basement / Utility', tab: 'Home Maintenance', priority: 'Medium', estimatedMinutes: 30, completed: false },
  { id: 'c-20', title: 'Clean exterior dryer exhaust duct and lint housing', room: 'Laundry', tab: 'Home Maintenance', priority: 'High', estimatedMinutes: 25, completed: false },

  { id: 'c-21', title: 'Touch up scuff marks on stairwell trim with warm eggshell paint', room: 'Entryway', tab: 'Home To-Dos', priority: 'Medium', estimatedMinutes: 40, completed: false },
  { id: 'c-22', title: 'Assemble drawer organizers for kitchen cooking utensils', room: 'Kitchen', tab: 'Home To-Dos', priority: 'Low', estimatedMinutes: 20, completed: true, lastDone: 'Nov 11' },
  { id: 'c-23', title: 'Repot fiddle leaf fig into ceramic planter', room: 'Living Room', tab: 'Home To-Dos', priority: 'Low', estimatedMinutes: 25, completed: false },

  { id: 'c-24', title: 'Declutter master bedroom wardrobe (donate seasonal clothes)', room: 'Master Bedroom', tab: '30-Day', priority: 'High', estimatedMinutes: 60, completed: false },
  { id: 'c-25', title: 'Run dishwasher and washing machine cleaning cycles with affresh', room: 'Appliances', tab: '30-Day', priority: 'Medium', estimatedMinutes: 10, completed: true, lastDone: 'Nov 2' },
  { id: 'c-26', title: 'Clean window sills, tracks, and wipe interior glass panes', room: 'Whole Home', tab: '30-Day', priority: 'Medium', estimatedMinutes: 50, completed: false },

  { id: 'c-27', title: 'Take recycling and trash bins down to the curb (Wednesday night)', room: 'Garage', tab: 'Chores', priority: 'High', estimatedMinutes: 5, completed: true, lastDone: 'Nov 11' },
  { id: 'c-28', title: 'Wash & fold laundry loads (whites, darks, gym apparel)', room: 'Laundry', tab: 'Chores', priority: 'High', estimatedMinutes: 40, completed: false },
  { id: 'c-29', title: 'Clean pet water fountain and food bowl mats', room: 'Kitchen', tab: 'Chores', priority: 'Medium', estimatedMinutes: 10, completed: true, lastDone: 'Nov 12' },
];

const initialRoomsData: RoomCardData[] = [
  {
    id: 'room-1',
    name: 'Kitchen',
    iconName: 'Utensils',
    description: 'Quartz counters, sink basin, stovetop, oven and pantry cleanliness',
    tasks: [
      { id: 'kt-1', text: 'Sanitize quartz countertops and backsplashes', done: true },
      { id: 'kt-2', text: 'Scrub stainless steel sink & polish faucet fixtures', done: true },
      { id: 'kt-3', text: 'Degrease gas range burners and wipe control knobs', done: true },
      { id: 'kt-4', text: 'Wipe cabinet face panels and refrigerator doors', done: false },
      { id: 'kt-5', text: 'Mop floor under island stools and dining threshold', done: false },
    ],
  },
  {
    id: 'room-2',
    name: 'Master Bedroom',
    iconName: 'Bed',
    description: 'Restful sanctuary, crisp linens, tidy nightstands and dust-free closet',
    tasks: [
      { id: 'mb-1', text: 'Strip duvet cover and wash eucalyptus sheet set', done: true },
      { id: 'mb-2', text: 'Dust bedside tables and lamp bases', done: true },
      { id: 'mb-3', text: 'Vacuum under bed frame and closet baseboards', done: false },
      { id: 'mb-4', text: 'Clear top of dresser and return stray items to closet', done: false },
    ],
  },
  {
    id: 'room-3',
    name: 'Primary Bath',
    iconName: 'Droplets',
    description: 'Tile grout, glass enclosure, double vanity and plush fresh towels',
    tasks: [
      { id: 'pb-1', text: 'Scrub shower walls, tile grout and glass enclosure', done: true },
      { id: 'pb-2', text: 'Disinfect double sinks, mirrors, and vanity surface', done: true },
      { id: 'pb-3', text: 'Sanitize toilet bowl, tank, and base thoroughly', done: true },
      { id: 'pb-4', text: 'Restock plush bath sheets and hand soaps', done: true },
      { id: 'pb-5', text: 'Wash and shake out absorbent memory foam bath rugs', done: true },
    ],
  },
  {
    id: 'room-4',
    name: 'Guest Bath',
    iconName: 'Bath',
    description: 'Welcoming powder room, fresh hand towels and sparkling mirrors',
    tasks: [
      { id: 'gb-1', text: 'Clean porcelain pedestal sink and wipe mirror', done: true },
      { id: 'gb-2', text: 'Sanitize toilet bowl and replace toilet paper roll', done: true },
      { id: 'gb-3', text: 'Empty small wastebasket and replace compostable liner', done: false },
      { id: 'gb-4', text: 'Hang crisp waffle-weave hand towels', done: false },
    ],
  },
  {
    id: 'room-5',
    name: 'Living Room',
    iconName: 'Sofa',
    description: 'Plush seating, entertainment console, coffee table and soft lighting',
    tasks: [
      { id: 'lr-1', text: 'Vacuum sofa cushions and fluff feather throw pillows', done: true },
      { id: 'lr-2', text: 'Dust TV screen, audio soundbar, and console media shelf', done: true },
      { id: 'lr-3', text: 'Condition genuine leather accent chairs', done: false },
      { id: 'lr-4', text: 'Vacuum area rug and sweep perimeter hardwood floors', done: false },
    ],
  },
  {
    id: 'room-6',
    name: 'Laundry & Utility',
    iconName: 'Shirt',
    description: 'Washer/dryer hygiene, folding surface, detergent stock and lint exhaust',
    tasks: [
      { id: 'lu-1', text: 'Wipe rubber door gasket on front-load washing machine', done: true },
      { id: 'lu-2', text: 'Vacuum behind dryer and empty secondary lint trap', done: true },
      { id: 'lu-3', text: 'Wipe down folding counter surface & sink', done: true },
      { id: 'lu-4', text: 'Organize detergent pods, wool dryer balls, and stain sprays', done: false },
    ],
  },
  {
    id: 'room-7',
    name: 'Garage & Workshop',
    iconName: 'Warehouse',
    description: 'Floor sweeping, workbench organization, recycling bins and tool racks',
    tasks: [
      { id: 'gw-1', text: 'Sweep concrete slab floor with heavy-duty push broom', done: true },
      { id: 'gw-2', text: 'Organize workbench tools onto magnetic pegboard', done: true },
      { id: 'gw-3', text: 'Break down Amazon cardboard boxes for weekly recycling', done: false },
      { id: 'gw-4', text: 'Check garage freezer thermometer (-2°F target)', done: false },
    ],
  },
  {
    id: 'room-8',
    name: 'Dining & Entryway',
    iconName: 'Door',
    description: 'Coat hooks, key tray, welcome mat, dining chandelier and floor luster',
    tasks: [
      { id: 'de-1', text: 'Shake out outdoor welcome mat and sweep front porch', done: true },
      { id: 'de-2', text: 'Tidy entryway shoe bench and coat hooks', done: true },
      { id: 'de-3', text: 'Dust glass chandelier over dining table', done: false },
      { id: 'de-4', text: 'Damp-mop entryway tile threshold', done: false },
    ],
  },
];

export const CleaningPage: React.FC = () => {
  const { celebrate } = useBinder();

  const [activeTab, setActiveTab] = useState<CleaningTab>('Rooms');

  const [routineItems, setRoutineItems] = useState<CleaningRoutineItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CHORES_KEY);
      return saved ? JSON.parse(saved) : initialRoutineItems;
    } catch {
      return initialRoutineItems;
    }
  });

  const [roomsData, setRoomsData] = useState<RoomCardData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ROOMS_KEY);
      return saved ? JSON.parse(saved) : initialRoomsData;
    } catch {
      return initialRoomsData;
    }
  });

  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [builderTitle, setBuilderTitle] = useState('');
  const [builderRoom, setBuilderRoom] = useState('Kitchen');
  const [builderTab, setBuilderTab] = useState<CleaningTab>('Daily');
  const [builderPriority, setBuilderPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [builderMinutes, setBuilderMinutes] = useState<number>(15);

  const [isNewRoomModalOpen, setIsNewRoomModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [newRoomTasks, setNewRoomTasks] = useState('Deep clean surfaces\nEmpty wastebaskets\nVacuum and mop floors');

  const [addingTaskRoomId, setAddingTaskRoomId] = useState<string | null>(null);
  const [newRoomTaskText, setNewRoomTaskText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_CHORES_KEY, JSON.stringify(routineItems));
  }, [routineItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_ROOMS_KEY, JSON.stringify(roomsData));
  }, [roomsData]);

  const handleToggleRoutineItem = (id: string) => {
    setRoutineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextVal = !item.completed;
          if (nextVal) celebrate();
          return {
            ...item,
            completed: nextVal,
            lastDone: nextVal ? 'Today' : item.lastDone,
          };
        }
        return item;
      })
    );
  };

  const handleDeleteRoutineItem = (id: string) => {
    setRoutineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveRoutineItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderTitle.trim()) return;

    const newItem: CleaningRoutineItem = {
      id: `c-${Date.now()}`,
      title: builderTitle.trim(),
      room: builderRoom,
      tab: builderTab,
      priority: builderPriority,
      estimatedMinutes: Number(builderMinutes) || 15,
      completed: false,
    };

    setRoutineItems((prev) => [newItem, ...prev]);
    celebrate();
    setIsBuilderOpen(false);
    setBuilderTitle('');
    showToast(`Task auto-sorted into "${builderTab}" with ${builderPriority} priority!`);
  };

  const handleToggleRoomTask = (roomId: string, taskId: string) => {
    setRoomsData((prev) =>
      prev.map((room) => {
        if (room.id === roomId) {
          const updatedTasks = room.tasks.map((t) =>
            t.id === taskId ? { ...t, done: !t.done } : t
          );

          const prevAllDone = room.tasks.every((t) => t.done);
          const nextAllDone = updatedTasks.every((t) => t.done);

          if (!prevAllDone && nextAllDone) {
            celebrate();
            showToast(`🎉 ${room.name} is 100% Cleaned & Pristine!`);
          } else {
            const toggledTask = updatedTasks.find((t) => t.id === taskId);
            if (toggledTask?.done) celebrate();
          }

          return { ...room, tasks: updatedTasks };
        }
        return room;
      })
    );
  };

  const handleAddRoomTask = (roomId: string) => {
    if (!newRoomTaskText.trim()) return;

    setRoomsData((prev) =>
      prev.map((room) => {
        if (room.id === roomId) {
          const newTask = {
            id: `rt-${Date.now()}`,
            text: newRoomTaskText.trim(),
            done: false,
          };
          return { ...room, tasks: [...room.tasks, newTask] };
        }
        return room;
      })
    );

    setNewRoomTaskText('');
    setAddingTaskRoomId(null);
    celebrate();
    showToast('Task added to room checklist!');
  };

  const handleDeleteRoomTask = (roomId: string, taskId: string) => {
    setRoomsData((prev) =>
      prev.map((room) => {
        if (room.id === roomId) {
          return { ...room, tasks: room.tasks.filter((t) => t.id !== taskId) };
        }
        return room;
      })
    );
  };

  const handleSaveNewRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    const parsedTasks = newRoomTasks
      .split('\n')
      .filter(Boolean)
      .map((t, idx) => ({
        id: `rt-${Date.now()}-${idx}`,
        text: t.trim(),
        done: false,
      }));

    const newRoom: RoomCardData = {
      id: `room-${Date.now()}`,
      name: newRoomName.trim(),
      iconName: 'Home',
      description: newRoomDesc.trim() || 'Custom sanctuary living space',
      tasks:
        parsedTasks.length > 0
          ? parsedTasks
          : [{ id: `rt-${Date.now()}-0`, text: 'Daily wipe and tidy', done: false }],
    };

    setRoomsData((prev) => [...prev, newRoom]);
    celebrate();
    setIsNewRoomModalOpen(false);
    setNewRoomName('');
    setNewRoomDesc('');
    showToast(`Created new room card: "${newRoom.name}"!`);
  };

  const handleResetRoomTasks = (roomId: string) => {
    setRoomsData((prev) =>
      prev.map((room) => {
        if (room.id === roomId) {
          return {
            ...room,
            tasks: room.tasks.map((t) => ({ ...t, done: false })),
          };
        }
        return room;
      })
    );
    showToast('Room tasks reset for next rotation');
  };

  const TABS: CleaningTab[] = [
    'Rooms',
    'Today',
    'Daily',
    'Weekly',
    'Monthly',
    'Home Maintenance',
    'Home To-Dos',
    '30-Day',
    'Chores',
  ];

  const currentTabItems =
    activeTab === 'Chores'
      ? routineItems
      : routineItems.filter((item) => item.tab === activeTab);

  const completedRoutineCount = currentTabItems.filter((i) => i.completed).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1c0f19] text-[#2d1b28] dark:text-[#efd0e5] text-xs font-semibold shadow-[0_0_24px_rgba(190,127,171,0.45)] border border-[#be7fab] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <PartyPopper className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/30">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#be7fab]/20 border border-[#be7fab]/45 text-[#be7fab] dark:text-[#daabcb]">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
              Cleaning &amp; Sanctuary Hub
            </h1>
          </div>
          <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/80 mt-1">
            Interactive room checklist modules, auto-sorted routine scheduler, and home maintenance telemetry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBuilderOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#be7fab] hover:bg-[#d29ec2] text-[#120a10] rounded-xl shadow-[0_0_16px_rgba(190,127,171,0.4)] transition-all active:scale-95"
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Routine Builder</span>
          </button>

          {activeTab === 'Rooms' && (
            <button
              onClick={() => setIsNewRoomModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white dark:bg-[#1c0f19] hover:bg-[#e6c3db] dark:hover:bg-[#241420] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-xl transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />
              <span>Add Room</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Ribbon */}
      <div className="hud-panel p-1.5">
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
          {TABS.map((tab) => {
            const count =
              tab === 'Rooms'
                ? roomsData.length
                : tab === 'Chores'
                ? routineItems.length
                : routineItems.filter((i) => i.tab === tab).length;

            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-[#be7fab] text-[#120a10] border-[#be7fab] dark:border-[#efd0e5]/50 shadow-[0_0_14px_rgba(190,127,171,0.45)] font-bold'
                    : 'bg-[#e6c3db]/60 dark:bg-[#120a10]/70 text-[#2d1b28]/80 dark:text-[#e6c3db] border-[#d29ec2]/60 dark:border-[#be7fab]/25 hover:border-[#be7fab] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-[#120a10]/20 dark:bg-[#120a10]/30 text-[#120a10]'
                      : 'bg-[#be7fab]/20 dark:bg-[#be7fab]/15 text-[#2d1b28] dark:text-[#daabcb]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ROOMS TAB */}
      {activeTab === 'Rooms' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#2d1b28]/80 dark:text-[#e6c3db]/85">
            <span>
              Rooms illuminate with a <strong className="text-[#2d1b28] dark:text-[#efd0e5]">glowing #be7fab aura &amp; 🎉 celebration</strong> when 100% of tasks are checked off.
            </span>
            <span className="font-mono tabular-nums font-semibold text-[#be7fab] dark:text-[#daabcb]">
              {roomsData.filter((r) => r.tasks.every((t) => t.done)).length} of {roomsData.length} rooms completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {roomsData.map((room) => {
              const totalTasks = room.tasks.length;
              const completedTasks = room.tasks.filter((t) => t.done).length;
              const isAllDone = totalTasks > 0 && completedTasks === totalTasks;
              const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

              return (
                <div
                  key={room.id}
                  className={`hud-panel hud-corners washi-tape-top p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 relative ${
                    isAllDone
                      ? '!border-[#be7fab] ring-2 ring-[#be7fab]/55 !bg-[#e6c3db]/80 dark:!bg-[#be7fab]/18 shadow-[0_0_28px_rgba(190,127,171,0.35)]'
                      : ''
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between pb-3 border-b border-[#d29ec2]/50 dark:border-[#be7fab]/25">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                            {room.name}
                          </h3>
                          {isAllDone && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#be7fab] text-[#120a10] shadow-[0_0_10px_rgba(190,127,171,0.6)]">
                              🎉 100% Clean
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#2d1b28]/70 dark:text-[#e6c3db]/75 mt-0.5 line-clamp-1">
                          {room.description}
                        </p>
                      </div>

                      <button
                        onClick={() => handleResetRoomTasks(room.id)}
                        className="p-1 text-[#2d1b28]/65 dark:text-[#d29ec2]/75 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:bg-[#be7fab]/20 rounded-md transition-colors"
                        title="Reset room checklist for next rotation"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="my-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                        <span className="font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                          {completedTasks} / {totalTasks} tasks
                        </span>
                        <span className={`text-[11px] font-semibold ${isAllDone ? 'text-[#2d1b28] dark:text-[#efd0e5]' : 'text-[#be7fab] dark:text-[#daabcb]'}`}>
                          {percent}% Complete
                        </span>
                      </div>

                      <div className="w-full h-2 bg-[#e6c3db] dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/25 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300 bg-linear-to-r from-[#be7fab] to-[#daabcb] dark:to-[#efd0e5] shadow-[0_0_10px_rgba(190,127,171,0.65)]"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mt-3.5">
                      {room.tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition-all group ${
                            task.done
                              ? 'bg-[#e6c3db]/70 dark:bg-[#be7fab]/15 border-[#be7fab]/45 text-[#2d1b28]/60 dark:text-[#e6c3db]/70 line-through'
                              : 'bg-[#e6c3db]/45 dark:bg-[#120a10]/85 border-[#d29ec2]/65 dark:border-[#be7fab]/25 hover:border-[#be7fab] text-[#2d1b28] dark:text-[#efd0e5]'
                          }`}
                        >
                          <div
                            onClick={() => handleToggleRoomTask(room.id, task.id)}
                            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                          >
                            <button type="button" className="shrink-0 transition-transform active:scale-90">
                              {task.done ? (
                                <CheckCircle2 className="w-4 h-4 text-[#be7fab] fill-[#be7fab]/25" />
                              ) : (
                                <Circle className="w-4 h-4 text-[#be7fab]/65 dark:text-[#d29ec2]/55 group-hover:text-[#be7fab] dark:group-hover:text-[#efd0e5]" />
                              )}
                            </button>

                            <span className="text-xs font-medium leading-tight truncate">
                              {task.text}
                            </span>
                          </div>

                          <button
                            onClick={() => handleDeleteRoomTask(room.id, task.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-[#2d1b28]/60 dark:text-[#d29ec2]/60 hover:text-[#be7fab] dark:hover:text-[#efd0e5] transition-opacity shrink-0"
                            title="Remove task"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {addingTaskRoomId === room.id ? (
                      <div className="mt-2.5 flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="Task name..."
                          value={newRoomTaskText}
                          onChange={(e) => setNewRoomTaskText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddRoomTask(room.id);
                          }}
                          className="flex-1 px-2.5 py-1 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
                          autoFocus
                        />
                        <button
                          onClick={() => handleAddRoomTask(room.id)}
                          className="px-2.5 py-1 text-xs font-bold bg-[#be7fab] text-[#120a10] rounded-lg hover:bg-[#d29ec2]"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setAddingTaskRoomId(null)}
                          className="p-1 text-[#2d1b28]/70 dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setAddingTaskRoomId(room.id);
                          setNewRoomTaskText('');
                        }}
                        className="mt-2.5 w-full py-1.5 text-[11px] font-semibold text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] border border-dashed border-[#be7fab]/45 dark:border-[#be7fab]/35 hover:border-[#be7fab] rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Task to Room</span>
                      </button>
                    )}
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-[#d29ec2]/45 dark:border-[#be7fab]/20 flex items-center justify-between text-[10px] text-[#2d1b28]/65 dark:text-[#e6c3db]/70">
                    <span>HUD Room Module</span>
                    {isAllDone ? (
                      <span className="font-bold text-[#be7fab] dark:text-[#efd0e5]">Ready for relaxation</span>
                    ) : (
                      <span>{totalTasks - completedTasks} remaining</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ROUTINE FREQUENCY TABS */}
      {activeTab !== 'Rooms' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2">
            <div>
              <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                {activeTab === 'Chores' ? 'All Scheduled Chores' : `${activeTab} Rotation`}
              </h3>
              <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/80">
                Tasks in this tab are auto-sorted by frequency and priority
              </p>
            </div>

            <div className="text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] font-mono tabular-nums">
              <span>Progress: {completedRoutineCount} / {currentTabItems.length} completed</span>
            </div>
          </div>

          <div className="w-full h-2.5 bg-[#e6c3db] dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-[#be7fab] to-[#daabcb] dark:to-[#efd0e5] rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(190,127,171,0.65)]"
              style={{
                width: `${currentTabItems.length > 0 ? (completedRoutineCount / currentTabItems.length) * 100 : 0}%`,
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {currentTabItems.map((item) => {
              const priorityStyle =
                item.priority === 'High'
                  ? 'text-[#120a10] bg-[#be7fab] border-[#be7fab] dark:border-[#efd0e5]/50'
                  : item.priority === 'Medium'
                  ? 'text-[#2d1b28] dark:text-[#efd0e5] bg-[#d29ec2]/40 dark:bg-[#d29ec2]/25 border-[#d29ec2]/70 dark:border-[#d29ec2]/50'
                  : 'text-[#2d1b28] dark:text-[#e6c3db] bg-[#efd0e5] dark:bg-[#120a10] border-[#d29ec2] dark:border-[#be7fab]/30';

              return (
                <div
                  key={item.id}
                  className={`hud-panel p-3.5 flex items-start justify-between gap-3 transition-all group ${
                    item.completed ? 'opacity-70 !border-[#be7fab]/35' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => handleToggleRoutineItem(item.id)}
                      className="shrink-0 mt-0.5 transition-transform active:scale-90"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-[#be7fab] fill-[#be7fab]/25" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#be7fab]/65 dark:text-[#d29ec2]/55 group-hover:text-[#be7fab] dark:group-hover:text-[#efd0e5]" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <span
                        className={`text-xs font-semibold block leading-snug ${
                          item.completed ? 'line-through text-[#2d1b28]/55 dark:text-[#d29ec2]/60' : 'text-[#2d1b28] dark:text-[#efd0e5]'
                        }`}
                      >
                        {item.title}
                      </span>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-[10px] text-[#2d1b28]/70 dark:text-[#e6c3db]/75 font-mono tabular-nums">
                        <span className="font-semibold text-[#be7fab] dark:text-[#daabcb]">{item.room}</span>
                        <span>·</span>
                        <span>{item.estimatedMinutes} mins</span>
                        <span>·</span>
                        <span className={`px-1.5 py-0.5 rounded font-bold border ${priorityStyle}`}>
                          {item.priority}
                        </span>
                        {item.lastDone && (
                          <>
                            <span>·</span>
                            <span>Done: {item.lastDone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteRoutineItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#2d1b28]/60 dark:text-[#d29ec2]/70 hover:text-[#be7fab] dark:hover:text-[#efd0e5] transition-opacity shrink-0"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            {currentTabItems.length === 0 && (
              <div className="col-span-full py-12 text-center text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/75 bg-white/75 dark:bg-[#1c0f19]/60 rounded-2xl border border-dashed border-[#be7fab]/45 dark:border-[#be7fab]/35">
                No tasks currently in {activeTab}. Use the <strong className="text-[#2d1b28] dark:text-[#efd0e5]">Routine Builder</strong> to auto-sort new chores!
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ROUTINE BUILDER */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-[#120a10]/80 backdrop-blur-sm">
          <div className="hud-panel hud-corners w-full max-w-md p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/50 dark:border-[#be7fab]/25">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#be7fab]/20 text-[#be7fab] dark:text-[#daabcb]">
                  <ListTodo className="w-4 h-4" />
                </span>
                <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                  Cleaning Routine Builder
                </h3>
              </div>
              <button onClick={() => setIsBuilderOpen(false)} className="text-[#2d1b28]/70 dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRoutineItem} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Task Description
                </label>
                <input
                  type="text"
                  placeholder="e.g., Clean dishwasher filter, Wipe HVAC registers"
                  value={builderTitle}
                  onChange={(e) => setBuilderTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Room / Area
                  </label>
                  <select
                    value={builderRoom}
                    onChange={(e) => setBuilderRoom(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                  >
                    <option value="Kitchen">Kitchen</option>
                    <option value="Master Bedroom">Master Bedroom</option>
                    <option value="Primary Bath">Primary Bath</option>
                    <option value="Guest Bath">Guest Bath</option>
                    <option value="Living Room">Living Room</option>
                    <option value="Laundry">Laundry</option>
                    <option value="Garage">Garage</option>
                    <option value="Utility Room">Utility Room</option>
                    <option value="Basement">Basement</option>
                    <option value="Whole Home">Whole Home</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Frequency Target
                  </label>
                  <select
                    value={builderTab}
                    onChange={(e) => setBuilderTab(e.target.value as CleaningTab)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                  >
                    <option value="Today">Today</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Home Maintenance">Home Maintenance</option>
                    <option value="Home To-Dos">Home To-Dos</option>
                    <option value="30-Day">30-Day</option>
                    <option value="Chores">Chores</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Priority Level
                  </label>
                  <select
                    value={builderPriority}
                    onChange={(e) => setBuilderPriority(e.target.value as 'High' | 'Medium' | 'Low')}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Estimated Duration (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={builderMinutes}
                    onChange={(e) => setBuilderMinutes(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-[#e6c3db]/75 dark:bg-[#be7fab]/15 rounded-xl border border-[#be7fab]/35 text-[11px] text-[#2d1b28] dark:text-[#efd0e5]">
                <strong>Routine Auto-Sorting:</strong> This chore routes directly into <strong className="text-[#be7fab] dark:text-[#daabcb]">{builderTab}</strong> with <strong className="text-[#be7fab] dark:text-[#daabcb]">{builderPriority}</strong> priority.
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#d29ec2]/45 dark:border-[#be7fab]/20">
                <button
                  type="button"
                  onClick={() => setIsBuilderOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-lg"
                >
                  Save &amp; Auto-Sort Chore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW ROOM CARD */}
      {isNewRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-[#120a10]/80 backdrop-blur-sm">
          <div className="hud-panel hud-corners w-full max-w-md p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/50 dark:border-[#be7fab]/25">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#be7fab]/20 text-[#be7fab] dark:text-[#daabcb]">
                  <Home className="w-4 h-4" />
                </span>
                <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                  Create New Room Card
                </h3>
              </div>
              <button onClick={() => setIsNewRoomModalOpen(false)} className="text-[#2d1b28]/70 dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewRoom} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Sunroom, Home Gym, Screened Porch"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5]"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Description / Focus
                </label>
                <input
                  type="text"
                  placeholder="e.g., Equipment sanitization, yoga mat wipe down, mirrors"
                  value={newRoomDesc}
                  onChange={(e) => setNewRoomDesc(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Checklist Tasks (1 per line)
                </label>
                <textarea
                  value={newRoomTasks}
                  onChange={(e) => setNewRoomTasks(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg resize-none font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#d29ec2]/45 dark:border-[#be7fab]/20">
                <button
                  type="button"
                  onClick={() => setIsNewRoomModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-lg"
                >
                  Create Room Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
