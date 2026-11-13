import React, { useState } from 'react';
import {
  CheckSquare,
  ArrowRight,
  Plus,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';

export const TodayTodosWidget: React.FC = () => {
  const { todos, toggleTodo, addTodo, setActivePage } = useBinder();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCat, setNewCat] = useState<'Personal' | 'Work' | 'Errand' | 'Health'>('Personal');

  const todayTodos = todos.filter(t => t.dueDate === '2026-11-12');
  const completedCount = todayTodos.filter(t => t.completed).length;
  const totalCount = todayTodos.length;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTodo({
      title: newTitle.trim(),
      completed: false,
      dueDate: '2026-11-12',
      category: newCat,
      priority: 'medium',
    });
    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <div className="hud-panel hud-corners washi-tape-top p-4 sm:p-5 flex flex-col justify-between transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#d29ec2] dark:border-[#be7fab]/30">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-[#be7fab]/20 text-[#be7fab] dark:text-[#daabcb] border border-[#be7fab]/50 shadow-[0_0_12px_rgba(190,127,171,0.25)]">
            <CheckSquare className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
              Today&apos;s To-Dos
            </h3>
            <p className="text-[11px] text-[#2d1b28]/75 dark:text-[#e6c3db]/75 font-medium">
              Daily action checklist
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#e6c3db] dark:bg-[#be7fab]/20 text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#d29ec2]/45 tabular-nums">
            {completedCount}/{totalCount}
          </span>
          <button
            onClick={() => setActivePage('kanban')}
            className="flex items-center gap-1 text-xs font-bold text-[#120a10] px-2.5 py-1.5 rounded-xl bg-[#be7fab] hover:bg-[#d29ec2] transition-all active:scale-95 shadow-[0_0_12px_rgba(190,127,171,0.35)]"
            title="Open Kanban Tasks page"
          >
            <span>Kanban</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Checklist */}
      <div className="my-3 space-y-2 max-h-56 overflow-y-auto pr-1">
        {todayTodos.map(todo => (
          <div
            key={todo.id}
            className={`group flex items-start gap-2.5 p-2.5 rounded-xl transition-all border ${
              todo.completed
                ? 'bg-[#efd0e5]/50 dark:bg-[#120a10]/50 text-[#2d1b28]/60 dark:text-[#e6c3db]/55 border-[#d29ec2]/60 dark:border-[#be7fab]/20'
                : 'bg-[#e6c3db]/70 dark:bg-[#241420]/90 text-[#2d1b28] dark:text-[#efd0e5] border-[#d29ec2] dark:border-[#d29ec2]/35 hover:border-[#be7fab]'
            }`}
          >
            <button
              onClick={() => toggleTodo(todo.id)}
              className="mt-0.5 shrink-0 transition-transform active:scale-90"
              aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
            >
              {todo.completed ? (
                <CheckCircle2 className="w-4.5 h-4.5 text-[#be7fab] fill-[#be7fab]/25" />
              ) : (
                <Circle className="w-4.5 h-4.5 text-[#be7fab]/70 dark:text-[#d29ec2]/70 group-hover:text-[#be7fab]" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <span
                onClick={() => toggleTodo(todo.id)}
                className={`text-xs font-semibold cursor-pointer leading-snug block truncate ${
                  todo.completed ? 'line-through text-[#2d1b28]/55 dark:text-[#e6c3db]/55' : 'text-[#2d1b28] dark:text-[#efd0e5]'
                }`}
              >
                {todo.title}
              </span>
            </div>

            <span className="text-[10px] text-[#2d1b28] dark:text-[#efd0e5] font-bold font-mono px-2 py-0.5 rounded-full bg-white/80 dark:bg-[#be7fab]/20 border border-[#d29ec2] dark:border-[#d29ec2]/40 shrink-0">
              {todo.category}
            </span>
          </div>
        ))}

        {todayTodos.length === 0 && (
          <p className="text-xs text-[#2d1b28]/65 dark:text-[#e6c3db]/65 italic py-2">No tasks scheduled for today.</p>
        )}
      </div>

      {/* Add To-Do Footer */}
      <div className="pt-2 border-t border-[#d29ec2] dark:border-[#be7fab]/25">
        {isAdding ? (
          <form onSubmit={handleAdd} className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="What needs to get done?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 text-xs px-2.5 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#be7fab]/50 rounded-lg text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#e6c3db]/45 focus:outline-none focus:ring-1 focus:ring-[#be7fab]"
                autoFocus
              />
              <select
                value={newCat}
                onChange={(e) => setNewCat(e.target.value as 'Personal' | 'Work' | 'Errand' | 'Health')}
                className="text-xs px-2 py-1.5 bg-[#efd0e5]/55 dark:bg-[#120a10] border border-[#be7fab]/50 rounded-lg text-[#2d1b28] dark:text-[#efd0e5]"
              >
                <option value="Personal">Personal</option>
                <option value="Work">Work</option>
                <option value="Errand">Errand</option>
                <option value="Health">Health</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2.5 py-1 text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/75 hover:text-[#2d1b28] dark:hover:text-[#efd0e5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-lg shadow-2xs"
              >
                Add To-Do
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-[#be7fab] dark:text-[#daabcb] hover:bg-[#be7fab]/15 rounded-xl border border-dashed border-[#be7fab]/55 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Today&apos;s To-Do</span>
          </button>
        )}
      </div>
    </div>
  );
};
