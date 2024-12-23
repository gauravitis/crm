import React from 'react';
import { Task } from '../types/task';
import { format } from 'date-fns';
import { AlertCircle } from 'lucide-react';

interface OverdueTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

export default function OverdueTasksModal({ isOpen, onClose, tasks }: OverdueTasksModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <h2 className="text-lg font-semibold">Overdue Tasks</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 p-4">
          {tasks.length === 0 ? (
            <p className="text-center text-gray-500">No overdue tasks found.</p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{task.title}</h3>
                    <span className={`px-2 py-1 rounded text-sm ${
                      task.priority === 'high' 
                        ? 'bg-red-100 text-red-800'
                        : task.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Due: {format(new Date(task.dueDate || ''), 'MMM d, yyyy')}
                    </span>
                    <span className={`px-2 py-1 rounded ${
                      task.status === 'todo'
                        ? 'bg-gray-100 text-gray-800'
                        : task.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800'
                        : task.status === 'review'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {task.status.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="border-t p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
