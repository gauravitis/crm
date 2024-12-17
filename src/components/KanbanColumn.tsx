import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Column } from '../types/task';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  column: Column;
}

const columnColors: Record<string, string> = {
  todo: 'bg-gray-100',
  'in-progress': 'bg-blue-50',
  review: 'bg-yellow-50',
  done: 'bg-green-50',
};

export default function KanbanColumn({ column }: KanbanColumnProps) {
  return (
    <div className={`w-80 rounded-lg p-4 ${columnColors[column.id]}`}>
      <h2 className="font-semibold text-gray-700 mb-4 flex items-center justify-between">
        {column.title}
        <span className="bg-gray-200 rounded-full px-2 py-1 text-sm">
          {column.tasks.length}
        </span>
      </h2>
      <Droppable droppableId={column.id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="min-h-[200px]"
          >
            {column.tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
