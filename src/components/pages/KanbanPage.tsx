import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Trash2,
  ArrowRight,
  ArrowLeft,
  X,
  RotateCw,
  Calendar,
  Bell,
  Repeat,
  LayoutGrid,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';
import { KanbanTask } from '../../types/binder';

export const KanbanPage: React.FC = () => {
  const {
    kanbanTasks,
    moveKanbanTask,
    addKanbanTask,
    deleteKanbanTask,
    autoRolloverEnabled,
    setAutoRolloverEnabled,
    rolloverUnfinishedTasks,
    celebrate,
  } = useBinder();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetColumn, setTargetColumn] = useState<KanbanTask['column']>('medium');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority] = useState<KanbanTask['priority']>('medium');
  const [frequency, setFrequency] = useState<KanbanTask['frequency']>('Once');
  const [dueDate, setDueDate] = useState('2026-11-12');
  const [reminderTime, setReminderTime] = useState('10:00 AM');
  const [tagsStr, setTagsStr] = useState('Personal, Home');

  // 5 Columns styled strictly using the 5-shade rose-mauve palette
  const columns: { id: KanbanTask['column']; label: string; color: string; badgeClass: string }[] = [
    { id: 'overdue', label: 'Overdue', color: '#be7fab', badgeClass: 'bg-[#be7fab] text-[#120a10]' },
    { id: 'high', label: 'High Priority', color: '#daabcb', badgeClass: 'bg-[#be7fab]/20 dark:bg-[#daabcb]/25 text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#daabcb]/50' },
    { id: 'medium', label: 'Medium Priority', color: '#d29ec2', badgeClass: 'bg-[#d29ec2]/25 text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#d29ec2]/50' },
    { id: 'low', label: 'Low Priority', color: '#e6c3db', badgeClass: 'bg-[#e6c3db]/65 dark:bg-[#e6c3db]/20 text-[#2d1b28] dark:text-[#e6c3db] border border-[#d29ec2] dark:border-[#e6c3db]/40' },
    { id: 'done', label: 'Completed', color: '#be7fab', badgeClass: 'bg-[#be7fab]/25 dark:bg-[#efd0e5]/25 text-[#2d1b28] dark:text-[#efd0e5] border border-[#be7fab]/40 dark:border-[#efd0e5]/50' },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const tags = tagsStr.split(',').map(s => s.trim()).filter(Boolean);
    addKanbanTask({
      title: title.trim(),
      description: description.trim() || undefined,
      column: targetColumn,
      priority,
      frequency,
      dueDate: dueDate || undefined,
      reminderTime: reminderTime || undefined,
      tags,
      autoRollover: true,
    });
    setTitle('');
    setDescription('');
    setIsAddModalOpen(false);
    celebrate();
  };

  const openAddForColumn = (col: KanbanTask['column']) => {
    setTargetColumn(col);
    setIsAddModalOpen(true);
  };

  const columnOrder: KanbanTask['column'][] = ['overdue', 'high', 'medium', 'low', 'done'];

  const moveColumnStep = (taskId: string, currentCol: KanbanTask['column'], direction: 'prev' | 'next') => {
    const currentIndex = columnOrder.indexOf(currentCol);
    if (direction === 'prev' && currentIndex > 0) {
      moveKanbanTask(taskId, columnOrder[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < columnOrder.length - 1) {
      moveKanbanTask(taskId, columnOrder[currentIndex + 1]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header with Auto-Rollover Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/30">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#be7fab]/20 text-[#be7fab] dark:text-[#daabcb] border border-[#be7fab]/50 shadow-[0_0_14px_rgba(190,127,171,0.3)]">
              <LayoutGrid className="w-5 h-5" />
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
              Task Kanban Board
            </h2>
          </div>
          <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/75 mt-1">
            Priority queues, due date tracking, frequency tags, and automatic rollover
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 p-1.5 px-3 rounded-xl bg-white dark:bg-[#1c0f19] border border-[#d29ec2] dark:border-[#be7fab]/45 shadow-xs">
            <button
              onClick={() => {
                const nextVal = !autoRolloverEnabled;
                setAutoRolloverEnabled(nextVal);
                if (nextVal) rolloverUnfinishedTasks();
              }}
              className="flex items-center gap-2 text-xs font-semibold text-[#2d1b28] dark:text-[#efd0e5]"
              title="Automatically rolls over unfinished past-due tasks into Overdue"
            >
              <div className={`w-8 h-4 rounded-full transition-colors relative flex items-center ${
                autoRolloverEnabled ? 'bg-[#be7fab]' : 'bg-[#e6c3db] dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/40'
              }`}>
                <div className={`w-3 h-3 rounded-full bg-white dark:bg-[#efd0e5] transition-transform ${
                  autoRolloverEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                }`} />
              </div>
              <span className="flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />
                <span>Auto-Rollover</span>
              </span>
            </button>
            <button
              onClick={rolloverUnfinishedTasks}
              className="text-[10px] text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:underline font-bold pl-2 border-l border-[#d29ec2]/60 dark:border-[#be7fab]/30"
              title="Scan and rollover unfinished tasks past due date"
            >
              Run Now
            </button>
          </div>

          <button
            onClick={() => openAddForColumn('medium')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl shadow-[0_0_15px_rgba(190,127,171,0.4)] transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* 5 Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
        {columns.map(col => {
          const colTasks = kanbanTasks.filter(t => t.column === col.id);

          return (
            <div
              key={col.id}
              className="hud-panel hud-corners p-3.5 flex flex-col min-h-[560px] border-t-4"
              style={{ borderTopColor: col.color }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/55 dark:border-[#be7fab]/25 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
                    {col.label}
                  </span>
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full tabular-nums ${col.badgeClass}`}>
                    {colTasks.length}
                  </span>
                </div>

                <button
                  onClick={() => openAddForColumn(col.id)}
                  className="p-1 text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:bg-[#be7fab]/20 rounded-md transition-colors"
                  title={`Add task to ${col.label}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto pr-0.5">
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl bg-[#e6c3db]/45 dark:bg-[#241420]/95 border border-[#d29ec2]/65 dark:border-[#d29ec2]/30 hover:border-[#be7fab] transition-all group"
                  >
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#be7fab]/20 text-[#2d1b28] dark:text-[#daabcb] border border-[#be7fab]/35 flex items-center gap-1 uppercase tracking-wider font-mono">
                        <Repeat className="w-2.5 h-2.5" /> {task.frequency || 'Once'}
                      </span>

                      <button
                        onClick={() => deleteKanbanTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#2d1b28]/50 dark:text-[#e6c3db]/45 hover:text-[#2d1b28] dark:hover:text-[#efd0e5] transition-opacity"
                        title="Delete task"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5] leading-snug">
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]/75 mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="mt-2.5 pt-2 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20 flex flex-wrap items-center justify-between text-[10px] text-[#2d1b28]/70 dark:text-[#e6c3db]/70 gap-1 font-mono">
                      {task.dueDate && (
                        <span className={`flex items-center gap-1 font-semibold ${
                          task.column === 'overdue' ? 'text-[#be7fab] dark:text-[#daabcb]' : 'text-[#2d1b28]/80 dark:text-[#e6c3db]'
                        }`}>
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>{task.dueDate}</span>
                        </span>
                      )}
                      {task.reminderTime && (
                        <span className="flex items-center gap-1 text-[#be7fab] dark:text-[#daabcb] ml-auto">
                          <Bell className="w-2.5 h-2.5" />
                          <span>{task.reminderTime}</span>
                        </span>
                      )}
                    </div>

                    {task.tags && task.tags.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1">
                        {task.tags.map((tag, idx) => (
                          <span key={idx} className="text-[9px] font-mono text-[#be7fab] dark:text-[#d29ec2]/80">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-2.5 pt-2 border-t border-[#d29ec2]/50 dark:border-[#be7fab]/20 flex items-center justify-between text-[10px] text-[#2d1b28]/75 dark:text-[#e6c3db]/75">
                      {col.id !== 'overdue' ? (
                        <button
                          onClick={() => moveColumnStep(task.id, col.id, 'prev')}
                          className="hover:text-[#2d1b28] dark:hover:text-[#efd0e5] flex items-center gap-0.5 font-medium"
                        >
                          <ArrowLeft className="w-2.5 h-2.5" /> Back
                        </button>
                      ) : <div />}

                      {col.id !== 'done' ? (
                        <button
                          onClick={() => moveColumnStep(task.id, col.id, 'next')}
                          className="text-[#be7fab] dark:text-[#daabcb] hover:text-[#2d1b28] dark:hover:text-[#efd0e5] hover:underline flex items-center gap-0.5 font-bold ml-auto"
                        >
                          Advance <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      ) : (
                        <span className="text-[#2d1b28] dark:text-[#efd0e5] font-bold ml-auto flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#be7fab]" /> Done
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="h-36 border-2 border-dashed border-[#d29ec2]/65 dark:border-[#be7fab]/25 rounded-xl flex items-center justify-center text-xs text-[#2d1b28]/55 dark:text-[#e6c3db]/55 italic">
                    No tasks in {col.label}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Kanban Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d1b28]/55 dark:bg-black/75 backdrop-blur-xs">
          <div className="hud-panel hud-corners w-full max-w-sm p-5 bg-white dark:bg-[#1c0f19] border-[#be7fab] shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2]/60 dark:border-[#be7fab]/30">
              <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                Create Kanban Task
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#be7fab] dark:text-[#e6c3db]/70 hover:text-[#2d1b28] dark:hover:text-[#efd0e5]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., File tax receipts, Service air purifier"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 focus:outline-none focus:ring-1 focus:ring-[#be7fab]"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Details, links, or notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Initial Column
                  </label>
                  <select
                    value={targetColumn}
                    onChange={(e) => setTargetColumn(e.target.value as KanbanTask['column'])}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5]"
                  >
                    <option value="overdue">Overdue</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                    <option value="done">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as KanbanTask['frequency'])}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5]"
                  >
                    <option value="Once">Once</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                    Reminder Time
                  </label>
                  <input
                    type="text"
                    placeholder="10:00 AM"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2d1b28]/85 dark:text-[#e6c3db] mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Home, Finance, Taxes"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg text-[#2d1b28] dark:text-[#efd0e5]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-[#2d1b28]/75 dark:text-[#e6c3db]/75 hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-lg"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
