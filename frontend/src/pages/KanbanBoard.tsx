import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useTaskStore } from '../store/taskStore';
import KanbanColumn from '../components/KanbanColumn';
import TaskModal from '../components/TaskModal';
import TaskStats from '../components/TaskStats';
import { Column, Status, Priority, Task } from '../types/task';
import { Search, Filter, Calendar, PlusCircle } from 'lucide-react';

const columns: Column[] = [
  { id: 'todo', title: 'To Do', tasks: [] },
  { id: 'in-progress', title: 'In Progress', tasks: [] },
  { id: 'review', title: 'Review', tasks: [] },
  { id: 'done', title: 'Done', tasks: [] },
];

export default function KanbanBoard() {
  const { tasks, moveTask, fetchTasks, isLoading } = useTaskStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'none'>('none');

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter and sort tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  // Sort tasks if needed
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate' && a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return 0;
  });

  // Organize tasks into columns
  const organizedColumns = columns.map((col) => ({
    ...col,
    tasks: sortedTasks.filter((task) => task.status === col.id),
  }));

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    moveTask(draggableId, destination.droppableId as Status);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-h-screen">
      {/* Header and Controls */}
      <div className="p-6 bg-white border-b flex-shrink-0">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <PlusCircle size={20} />
                Add Task
              </button>
            </div>

            <TaskStats />
            
            {/* Search and Filters */}
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'priority' | 'none')}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">Sort By</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="p-6 h-full">
          <div className="max-w-[1600px] mx-auto h-full">
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-4 gap-6 h-full">
                {organizedColumns.map((column) => (
                  <KanbanColumn key={column.id} column={column} />
                ))}
              </div>
            </DragDropContext>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <TaskModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
    </div>
  );
}
