import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task, Priority } from '../types/task';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import TaskModal from './TaskModal';

interface TaskCardProps {
  task: Task;
  index: number;
}

const priorityColors: Record<Priority, string> = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

export default function TaskCard({ task, index }: TaskCardProps) {
  const { deleteTask } = useTaskStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id);
    }
  };

  return (
    <>
      <Draggable draggableId={task.id} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="bg-white p-4 rounded-lg shadow-sm mb-2 border border-gray-200 hover:shadow-md transition-shadow relative group"
          >
            <div className="absolute top-2 right-2">
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical size={16} />
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border py-1 min-w-[120px] z-10">
                    <button
                      onClick={() => {
                        setShowEditModal(true);
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-900 pr-8">{task.title}</h3>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  priorityColors[task.priority]
                }`}
              >
                {task.priority}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
            
            {task.dueDate && (
              <div className="text-xs text-gray-500">
                Due: {new Date(task.dueDate).toLocaleDateString('en-GB')}
              </div>
            )}
            
            {task.assigneeId && (
              <div className="mt-2 flex items-center">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                  {task.assigneeId.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        )}
      </Draggable>

      {showEditModal && (
        <TaskModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          task={task}
        />
      )}
    </>
  );
}
