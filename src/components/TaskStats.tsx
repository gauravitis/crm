import React, { useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { AlertCircle, CheckCircle2, Clock, BarChart2 } from 'lucide-react';
import OverdueTasksModal from './OverdueTasksModal';

export default function TaskStats() {
  const { stats, tasks } = useTaskStore();
  const [showOverdueTasks, setShowOverdueTasks] = useState(false);

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: BarChart2,
      color: 'bg-blue-100 text-blue-800',
      onClick: undefined,
    },
    {
      title: 'In Progress',
      value: stats.byStatus['in-progress'],
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-800',
      onClick: undefined,
    },
    {
      title: 'Completed',
      value: stats.byStatus.done,
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-800',
      onClick: undefined,
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: AlertCircle,
      color: 'bg-red-100 text-red-800',
      onClick: () => setShowOverdueTasks(true),
    },
  ];

  // Get overdue tasks
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== 'done';
  });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            onClick={stat.onClick}
            className={`
              bg-white rounded-lg p-4 shadow-sm border flex items-center justify-between
              ${stat.onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
            `}
          >
            <div>
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className="text-2xl font-semibold mt-1">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-full ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <OverdueTasksModal
        isOpen={showOverdueTasks}
        onClose={() => setShowOverdueTasks(false)}
        tasks={overdueTasks}
      />
    </>
  );
}
