import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, ListTodo } from 'lucide-react';

const ToDoList = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Review Chapter 4 Physics formulas', completed: false },
    { id: 2, text: 'Take biology mock test', completed: false },
    { id: 3, text: 'Read NoteVault PRD carefully', completed: true },
  ]);
  const [newTask, setNewTask] = useState('');

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask.trim(), completed: false }]);
      setNewTask('');
    }
  };

  return (
    <div className="cinematic-glass p-6 rounded-3xl flex flex-col gap-4 relative overflow-hidden premium-surface min-h-[300px]">
      <div className="flex items-center gap-2 mb-2 z-10 p-2">
        <ListTodo size={18} className="text-slate-400" />
        <h2 className="text-sm font-semibold text-white tracking-wide">Daily Tasks</h2>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 px-2">
        {tasks.map(task => (
          <div 
            key={task.id} 
            onClick={() => toggleTask(task.id)}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-slate-700/50 hover:bg-white/[0.04] transition-all cursor-pointer group"
          >
            {task.completed ? (
               <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
            ) : (
               <Circle size={18} className="text-slate-500 group-hover:text-slate-400 flex-shrink-0" />
            )}
            <span className={`text-sm transition-all ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200 group-hover:text-white'}`}>
              {task.text}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={addTask} className="mt-2 px-2 z-10 flex">
        <div className="relative w-full input-wrapper">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="mono-input-line pl-2 pr-10"
          />
          <button 
            type="submit" 
            disabled={!newTask.trim()}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-100 disabled:opacity-30 transition-colors"
          >
            <Plus size={18} />
          </button>
          <div className="input-focus-line"></div>
        </div>
      </form>
    </div>
  );
};

export default ToDoList;
