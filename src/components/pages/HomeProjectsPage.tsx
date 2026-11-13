import React, { useState, useEffect } from 'react';
import {
  Hammer,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  X,
  PartyPopper,
  RotateCcw,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';

export interface HomeProjectCard {
  id: string;
  title: string;
  category: 'DIY' | 'Woodworking' | 'Organization' | 'Renovation' | 'Garden';
  budget: number;
  spent: number;
  targetDate: string;
  notes?: string;
  steps: { id: string; text: string; done: boolean }[];
}

const STORAGE_KEY = 'lifebinder_projects_v2';

const initialProjectCards: HomeProjectCard[] = [
  {
    id: 'proj-laundry-pedestal',
    title: 'BUILD LAUNDRY PEDESTAL',
    category: 'Woodworking',
    budget: 350,
    spent: 185,
    targetDate: '2026-11-28',
    notes: '2x10 structural framing, heavy-duty full extension drawer slides, satin cabinet finish to match washer and dryer.',
    steps: [
      { id: 'step-1', text: 'GO GET MATERIAL', done: true },
      { id: 'step-2', text: 'BUILD FRAME', done: true },
      { id: 'step-3', text: 'BUILD DRAWERS', done: false },
      { id: 'step-4', text: 'SAND & PAINT', done: false },
      { id: 'step-5', text: 'INSTALL', done: false },
    ],
  },
  {
    id: 'proj-garage-shelving',
    title: 'GARAGE STORAGE SHELVING',
    category: 'Organization',
    budget: 450,
    spent: 410,
    targetDate: '2026-11-05',
    notes: 'Floor-to-ceiling 2x4 uprights anchored into wall studs, hold 27-gallon heavy-duty storage bins.',
    steps: [
      { id: 'gs-1', text: 'MEASURE WALL STUDS & CLEAR ZONE', done: true },
      { id: 'gs-2', text: 'PURCHASE 2X4 LUMBER & FASTENERS', done: true },
      { id: 'gs-3', text: 'BUILD SUPPORT LADDER BRACKETS', done: true },
      { id: 'gs-4', text: 'INSTALL PLYWOOD SHELF DECKS', done: true },
      { id: 'gs-5', text: 'LABEL HEAVY-DUTY TOTES', done: true },
    ],
  },
  {
    id: 'proj-pantry-pullouts',
    title: 'PANTRY SLIDE-OUT DRAWERS',
    category: 'DIY',
    budget: 280,
    spent: 140,
    targetDate: '2026-12-10',
    notes: 'Baltic birch drawer boxes with soft-close undermount slides for lower pantry cabinets.',
    steps: [
      { id: 'pp-1', text: 'MEASURE CABINET INTERIOR WIDTHS', done: true },
      { id: 'pp-2', text: 'ORDER SOFT-CLOSE DRAWER SLIDES', done: true },
      { id: 'pp-3', text: 'CUT BALTIC BIRCH BOX SIDES & BASES', done: false },
      { id: 'pp-4', text: 'APPLY FOOD-SAFE POLYURETHANE FINISH', done: false },
      { id: 'pp-5', text: 'MOUNT BRACKETS & LEVEL DRAWERS', done: false },
    ],
  },
  {
    id: 'proj-closet-builtins',
    title: 'MASTER CLOSET BUILT-IN SYSTEM',
    category: 'Renovation',
    budget: 850,
    spent: 320,
    targetDate: '2026-12-20',
    notes: 'Dual hanging rods, central 5-shelf shoe organizer tower, brushed hardware wardrobe rods.',
    steps: [
      { id: 'cb-1', text: 'DEMO EXISTING WIRE SHELVING & PATCH DRYWALL', done: true },
      { id: 'cb-2', text: 'PAINT ACCENT WALL', done: true },
      { id: 'cb-3', text: 'ASSEMBLE CENTRAL VERTICAL TOWER', done: false },
      { id: 'cb-4', text: 'MOUNT DUAL CLOTHING RODS', done: false },
      { id: 'cb-5', text: 'INSTALL TOP STORAGE SHELF MOLDING', done: false },
    ],
  },
];

export const HomeProjectsPage: React.FC = () => {
  const { celebrate } = useBinder();

  const [projects, setProjects] = useState<HomeProjectCard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialProjectCards;
    } catch {
      return initialProjectCards;
    }
  });

  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<HomeProjectCard['category']>('Woodworking');
  const [newBudget, setNewBudget] = useState('350');
  const [newTargetDate, setNewTargetDate] = useState('2026-12-15');
  const [newNotes, setNewNotes] = useState('');
  const [newStepsText, setNewStepsText] = useState('GO GET MATERIAL\nBUILD FRAME\nSAND & PAINT\nINSTALL');

  const [addingStepProjectId, setAddingStepProjectId] = useState<string | null>(null);
  const [newInlineStepText, setNewInlineStepText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const handleToggleStep = (projectId: string, stepId: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === projectId) {
          const updatedSteps = proj.steps.map((s) =>
            s.id === stepId ? { ...s, done: !s.done } : s
          );

          const prevAllDone = proj.steps.every((s) => s.done);
          const nextAllDone = updatedSteps.every((s) => s.done);

          if (!prevAllDone && nextAllDone) {
            celebrate();
            showToast(`🎉 "${proj.title}" is 100% Finished & Installed!`);
          } else {
            const toggledStep = updatedSteps.find((s) => s.id === stepId);
            if (toggledStep?.done) celebrate();
          }

          return { ...proj, steps: updatedSteps };
        }
        return proj;
      })
    );
  };

  const handleAddInlineStep = (projectId: string) => {
    if (!newInlineStepText.trim()) return;

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === projectId) {
          const newStep = {
            id: `step-${Date.now()}`,
            text: newInlineStepText.trim().toUpperCase(),
            done: false,
          };
          return { ...proj, steps: [...proj.steps, newStep] };
        }
        return proj;
      })
    );

    setNewInlineStepText('');
    setAddingStepProjectId(null);
    celebrate();
    showToast('New step added to project!');
  };

  const handleDeleteStep = (projectId: string, stepId: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === projectId) {
          return { ...proj, steps: proj.steps.filter((s) => s.id !== stepId) };
        }
        return proj;
      })
    );
  };

  const handleResetSteps = (projectId: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === projectId) {
          return {
            ...proj,
            steps: proj.steps.map((s) => ({ ...s, done: false })),
          };
        }
        return proj;
      })
    );
    showToast('Project steps reset');
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    showToast('Project deleted');
  };

  const handleSaveNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const parsedSteps = newStepsText
      .split('\n')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
      .map((s, idx) => ({
        id: `step-${Date.now()}-${idx}`,
        text: s,
        done: false,
      }));

    const newProject: HomeProjectCard = {
      id: `proj-${Date.now()}`,
      title: newTitle.trim().toUpperCase(),
      category: newCategory,
      budget: parseFloat(newBudget) || 300,
      spent: 0,
      targetDate: newTargetDate || '2026-12-15',
      notes: newNotes.trim() || undefined,
      steps:
        parsedSteps.length > 0
          ? parsedSteps
          : [
              { id: `step-${Date.now()}-1`, text: 'GO GET MATERIAL', done: false },
              { id: `step-${Date.now()}-2`, text: 'BUILD & ASSEMBLE', done: false },
              { id: `step-${Date.now()}-3`, text: 'FINISH & INSTALL', done: false },
            ],
    };

    setProjects([newProject, ...projects]);
    celebrate();
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewNotes('');
    showToast(`Created project: "${newProject.title}"!`);
  };

  const filteredProjects = projects.filter((p) => {
    if (filterCategory === 'All') return true;
    return p.category === filterCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1c0f19] text-[#2d1b28] dark:text-[#efd0e5] text-xs font-semibold shadow-lg dark:shadow-[0_0_24px_rgba(190,127,171,0.45)] border border-[#be7fab] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <PartyPopper className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/30">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#be7fab]/20 border border-[#be7fab]/45 text-[#be7fab] dark:text-[#daabcb]">
              <Hammer className="w-5 h-5" />
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
              Home Projects & Workshop
            </h1>
          </div>
          <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/80 mt-1">
            Visual build modules with step trackers, budget allocation, and completion celebration
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl shadow-[0_0_16px_rgba(190,127,171,0.4)] transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="hud-panel p-1 max-w-fit">
          <div className="flex items-center gap-1 text-xs font-semibold overflow-x-auto">
            {['All', 'Woodworking', 'DIY', 'Organization', 'Renovation'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  filterCategory === cat
                    ? 'bg-[#be7fab] text-[#120a10] shadow-[0_0_12px_rgba(190,127,171,0.4)] font-bold'
                    : 'text-[#2d1b28]/80 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-[#be7fab] dark:text-[#daabcb] font-mono tabular-nums font-semibold">
          <span>
            {projects.filter((p) => p.steps.every((s) => s.done)).length} of {projects.length} projects completed
          </span>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredProjects.map((proj) => {
          const totalSteps = proj.steps.length;
          const completedSteps = proj.steps.filter((s) => s.done).length;
          const isAllDone = totalSteps > 0 && completedSteps === totalSteps;
          const percent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

          return (
            <div
              key={proj.id}
              className={`hud-panel hud-corners washi-tape-top p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 relative ${
                isAllDone
                  ? '!border-[#be7fab] ring-2 ring-[#be7fab]/55 !bg-[#be7fab]/18 shadow-[0_0_28px_rgba(190,127,171,0.35)]'
                  : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-[#d29ec2]/55 dark:border-[#be7fab]/25">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                        {proj.title}
                      </h3>
                      {isAllDone && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#be7fab] text-[#120a10] shadow-[0_0_10px_rgba(190,127,171,0.6)]">
                          🎉 Finished
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-[#2d1b28]/70 dark:text-[#e6c3db]/75 mt-0.5 flex items-center gap-2 font-mono tabular-nums">
                      <span>{proj.category}</span>
                      <span>·</span>
                      <span>Target: {proj.targetDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleResetSteps(proj.id)}
                      className="p-1 text-[#be7fab] dark:text-[#d29ec2]/75 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:bg-[#be7fab]/20 rounded-md transition-colors"
                      title="Reset project steps"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      className="p-1 text-[#be7fab] dark:text-[#d29ec2]/75 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:bg-[#be7fab]/20 rounded-md transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Counter */}
                <div className="my-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                    <span className="font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                      {completedSteps} / {totalSteps} steps
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

                {/* Budget vs Spent Pill */}
                <div className="mb-3 p-2 bg-[#e6c3db]/55 dark:bg-[#120a10]/85 rounded-xl border border-[#d29ec2]/60 dark:border-[#be7fab]/25 flex items-center justify-between text-[11px] font-mono tabular-nums text-[#2d1b28]/80 dark:text-[#e6c3db]">
                  <span>
                    Spent: <strong className="text-[#2d1b28] dark:text-[#efd0e5]">${proj.spent}</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Budget: <strong className="text-[#2d1b28] dark:text-[#efd0e5]">${proj.budget}</strong>
                  </span>
                  <span>·</span>
                  <span className="text-[#be7fab] dark:text-[#daabcb] font-semibold">${proj.budget - proj.spent} left</span>
                </div>

                {/* Checkable Steps */}
                <div className="space-y-2">
                  {proj.steps.map((step) => (
                    <div
                      key={step.id}
                      className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition-all group ${
                        step.done
                          ? 'bg-[#be7fab]/15 border-[#be7fab]/45 text-[#2d1b28]/60 dark:text-[#e6c3db]/70 line-through'
                          : 'bg-[#e6c3db]/45 dark:bg-[#120a10]/85 border-[#d29ec2]/60 dark:border-[#be7fab]/25 hover:border-[#be7fab] text-[#2d1b28] dark:text-[#efd0e5]'
                      }`}
                    >
                      <div
                        onClick={() => handleToggleStep(proj.id, step.id)}
                        className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                      >
                        <button type="button" className="shrink-0 transition-transform active:scale-90">
                          {step.done ? (
                            <CheckCircle2 className="w-4 h-4 text-[#be7fab] fill-[#be7fab]/25" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#be7fab] dark:text-[#d29ec2]/55 group-hover:text-[#2d1b28] dark:group-hover:text-[#efd0e5]" />
                          )}
                        </button>

                        <span className="text-xs font-semibold tracking-wide uppercase leading-tight truncate">
                          {step.text}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteStep(proj.id, step.id)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-[#be7fab] dark:text-[#d29ec2]/60 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] transition-opacity shrink-0"
                        title="Remove step"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Inline Step */}
                {addingStepProjectId === proj.id ? (
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="STEP NAME (UPPERCASE)..."
                      value={newInlineStepText}
                      onChange={(e) => setNewInlineStepText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddInlineStep(proj.id);
                      }}
                      className="flex-1 px-2.5 py-1 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5] font-mono uppercase"
                      autoFocus
                    />
                    <button
                      onClick={() => handleAddInlineStep(proj.id)}
                      className="px-2.5 py-1 text-xs font-bold bg-[#be7fab] text-[#120a10] rounded-lg hover:bg-[#d29ec2]"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setAddingStepProjectId(null)}
                      className="p-1 text-[#be7fab] dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAddingStepProjectId(proj.id);
                      setNewInlineStepText('');
                    }}
                    className="mt-2.5 w-full py-1.5 text-[11px] font-semibold text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] border border-dashed border-[#d29ec2] dark:border-[#be7fab]/35 hover:border-[#be7fab] rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Step to Project</span>
                  </button>
                )}

                {proj.notes && (
                  <div className="mt-3 p-2 rounded-lg bg-[#e6c3db]/45 dark:bg-[#120a10]/65 border border-[#d29ec2]/50 dark:border-[#be7fab]/20 text-[11px] text-[#2d1b28]/80 dark:text-[#e6c3db]/80 italic leading-snug">
                    {proj.notes}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-2.5 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20 flex items-center justify-between text-[10px] text-[#2d1b28]/70 dark:text-[#e6c3db]/70 font-mono tabular-nums">
                <span>Workshop Project Module</span>
                {isAllDone ? (
                  <span className="font-bold text-[#2d1b28] dark:text-[#efd0e5]">100% Finished</span>
                ) : (
                  <span>{totalSteps - completedSteps} steps remaining</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Project */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-[#120a10]/80 backdrop-blur-sm">
          <div className="hud-panel hud-corners w-full max-w-md p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/25">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#be7fab]/20 text-[#be7fab] dark:text-[#daabcb]">
                  <Hammer className="w-4 h-4" />
                </span>
                <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                  Create Home Improvement Project
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#be7fab] dark:text-[#d29ec2] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewProject} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Project Title (e.g. BUILD LAUNDRY PEDESTAL)
                </label>
                <input
                  type="text"
                  placeholder="e.g. BUILD FLOATING DESK"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab] dark:focus:border-[#efd0e5] uppercase font-mono font-bold"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as HomeProjectCard['category'])}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                  >
                    <option value="Woodworking">Woodworking</option>
                    <option value="DIY">DIY</option>
                    <option value="Organization">Organization</option>
                    <option value="Renovation">Renovation</option>
                    <option value="Garden">Garden</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={newTargetDate}
                  onChange={(e) => setNewTargetDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Checklist Steps (1 per line, in order)
                </label>
                <textarea
                  value={newStepsText}
                  onChange={(e) => setNewStepsText(e.target.value)}
                  rows={4}
                  placeholder="GO GET MATERIAL&#10;BUILD FRAME&#10;BUILD DRAWERS&#10;SAND & PAINT&#10;INSTALL"
                  className="w-full px-3 py-2 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg resize-none font-mono uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Materials & Workshop Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2x10 lumber, pocket screws, soft-close slides"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-[#2d1b28]/75 dark:text-[#e6c3db] hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-lg"
                >
                  Create Project Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
