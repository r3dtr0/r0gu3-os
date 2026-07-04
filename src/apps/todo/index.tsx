import { useState, useMemo } from 'react';
import {
  Plus, Trash2, Edit2, Check, X, Calendar, Flag,
  CheckCircle2, Circle,
  LayoutList
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  dueDate: string;
  createdAt: number;
  order: number;
}

const CATEGORIES = ['All', 'Personal', 'Work', 'Shopping', 'Health', 'Learning'];
const PRIORITY_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981',
};

function generateId() {
  return Math.random().toString(36).slice(2);
}

const DEFAULT_TASKS: Task[] = [
  { id: generateId(), title: 'Review pull request #42', category: 'Work', priority: 'high', completed: false, dueDate: '2025-07-05', createdAt: Date.now(), order: 0 },
  { id: generateId(), title: 'Buy groceries', category: 'Shopping', priority: 'medium', completed: false, dueDate: '2025-07-06', createdAt: Date.now(), order: 1 },
  { id: generateId(), title: 'Morning jog 5km', category: 'Health', priority: 'medium', completed: true, dueDate: '2025-07-04', createdAt: Date.now(), order: 2 },
  { id: generateId(), title: 'Learn Rust chapter 3', category: 'Learning', priority: 'low', completed: false, dueDate: '2025-07-10', createdAt: Date.now(), order: 3 },
  { id: generateId(), title: 'Call dentist for appointment', category: 'Personal', priority: 'high', completed: false, dueDate: '2025-07-08', createdAt: Date.now(), order: 4 },
  { id: generateId(), title: 'Deploy app to production', category: 'Work', priority: 'high', completed: false, dueDate: '2025-07-05', createdAt: Date.now(), order: 5 },
  { id: generateId(), title: 'Read article on WASM', category: 'Learning', priority: 'low', completed: true, dueDate: '2025-07-07', createdAt: Date.now(), order: 6 },
  { id: generateId(), title: 'Meditation session', category: 'Health', priority: 'low', completed: false, dueDate: '2025-07-05', createdAt: Date.now(), order: 7 },
];

export default function Todo() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('rogue_todo');
      return saved ? JSON.parse(saved) : DEFAULT_TASKS;
    } catch { return DEFAULT_TASKS; }
  });
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'Personal',
    priority: 'medium' as Task['priority'],
    dueDate: '',
  });

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem('rogue_todo', JSON.stringify(newTasks));
  };

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (filter === 'active') result = result.filter(t => !t.completed);
    if (filter === 'completed') result = result.filter(t => t.completed);
    if (categoryFilter !== 'All') result = result.filter(t => t.category === categoryFilter);
    return result.sort((a, b) => a.order - b.order);
  }, [tasks, filter, categoryFilter]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, pct };
  }, [tasks]);

  const addTask = () => {
    if (!newTask.title.trim()) return;
    const task: Task = {
      id: generateId(),
      title: newTask.title.trim(),
      category: newTask.category,
      priority: newTask.priority,
      completed: false,
      dueDate: newTask.dueDate,
      createdAt: Date.now(),
      order: tasks.length,
    };
    saveTasks([...tasks, task]);
    setNewTask({ title: '', category: 'Personal', priority: 'medium', dueDate: '' });
    setShowAddForm(false);
  };

  const toggleTask = (id: string) => {
    saveTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter(t => t.id !== id));
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditValue(task.title);
  };

  const saveEdit = (id: string) => {
    if (!editValue.trim()) return;
    saveTasks(tasks.map(t => t.id === id ? { ...t, title: editValue.trim() } : t));
    setEditingId(null);
  };

  return (
    <div className="flex h-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      {/* Sidebar */}
      <div className="w-56 flex flex-col border-r flex-shrink-0" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Tasks</h2>

          {/* Progress */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{stats.completed}/{stats.total} done</span>
              <span className="text-[11px] font-medium" style={{ color: 'var(--accent-cyan)' }}>{stats.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.pct}%`, background: 'linear-gradient(to right, var(--accent-cyan), var(--accent-lime))' }}
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-2">
          {(['all', 'active', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs capitalize transition"
              style={{
                background: filter === f ? 'rgba(0,240,255,0.08)' : 'transparent',
                color: filter === f ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              }}
            >
              {f === 'all' && <LayoutList size={13} />}
              {f === 'active' && <Circle size={13} />}
              {f === 'completed' && <CheckCircle2 size={13} />}
              {f}
              <span className="ml-auto text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {f === 'all' ? tasks.length : f === 'active' ? tasks.filter(t => !t.completed).length : tasks.filter(t => t.completed).length}
              </span>
            </button>
          ))}
        </div>

        {/* Categories */}
        <div className="px-4 py-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Categories</h3>
        </div>
        <div className="px-2 pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs transition"
              style={{
                background: categoryFilter === cat ? 'rgba(0,240,255,0.08)' : 'transparent',
                color: categoryFilter === cat ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              }}
            >
              {cat}
              <span className="ml-auto text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {cat === 'All' ? tasks.length : tasks.filter(t => t.category === cat).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <h1 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {categoryFilter === 'All' ? 'All Tasks' : categoryFilter}
          </h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition"
            style={{ background: 'var(--accent-cyan)', color: '#000' }}
          >
            <Plus size={14} />
            Add Task
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="px-6 py-3 border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="What needs to be done?"
                className="flex-1 rounded-md px-3 py-2 text-xs outline-none border"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                onKeyDown={e => e.key === 'Enter' && addTask()}
                autoFocus
              />
              <input
                type="date"
                value={newTask.dueDate}
                onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="rounded-md px-2 py-2 text-xs outline-none border"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={newTask.category}
                onChange={e => setNewTask({ ...newTask, category: e.target.value })}
                className="rounded-md px-2 py-1.5 text-xs outline-none border"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              >
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex items-center gap-1">
                {(['low', 'medium', 'high'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setNewTask({ ...newTask, priority: p })}
                    className="px-2 py-1 rounded text-[10px] capitalize border transition"
                    style={{
                      borderColor: newTask.priority === p ? PRIORITY_COLORS[p] : 'var(--border-subtle)',
                      color: newTask.priority === p ? PRIORITY_COLORS[p] : 'var(--text-muted)',
                      background: newTask.priority === p ? PRIORITY_COLORS[p] + '18' : 'transparent',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button onClick={addTask} className="ml-auto px-3 py-1 rounded text-xs" style={{ background: 'var(--accent-cyan)', color: '#000' }}>
                Add
              </button>
              <button onClick={() => setShowAddForm(false)} className="px-2 py-1 rounded text-xs" style={{ color: 'var(--text-muted)' }}>
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="flex-1 overflow-y-auto">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <CheckCircle2 size={48} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
              <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>No tasks found</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div
                key={task.id}
                className="flex items-center gap-3 px-6 py-3 border-b transition hover:bg-white/[0.02] group"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className="flex-shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 size={18} style={{ color: 'var(--accent-lime)' }} />
                  ) : (
                    <Circle size={18} style={{ color: 'var(--text-muted)' }} />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  {editingId === task.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveEdit(task.id)}
                        className="flex-1 rounded px-2 py-1 text-xs outline-none border"
                        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                        autoFocus
                      />
                      <button onClick={() => saveEdit(task.id)} className="p-1 rounded hover:bg-white/10">
                        <Check size={12} style={{ color: 'var(--accent-lime)' }} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1 rounded hover:bg-white/10">
                        <X size={12} style={{ color: 'var(--text-muted)' }} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p
                        className="text-xs transition"
                        style={{
                          color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: task.completed ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                        >
                          {task.category}
                        </span>
                        {task.dueDate && (
                          <span className="flex items-center gap-0.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            <Calendar size={9} />
                            {task.dueDate}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Flag size={12} style={{ color: PRIORITY_COLORS[task.priority] }} />
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => startEdit(task)} className="p-1 rounded hover:bg-white/10">
                      <Edit2 size={11} style={{ color: 'var(--text-muted)' }} />
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="p-1 rounded hover:bg-red-500/20">
                      <Trash2 size={11} style={{ color: '#ef4444' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
