import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import ItemForm from './ItemForm';
import { Item } from '../../types/item';

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Item, 'id' | 'createdAt'>) => void;
  initialData?: Item;
}

export const CreateItemModal: React.FC<CreateItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] md:max-w-[80vw] lg:max-w-[1200px] w-full">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {initialData ? 'Edit Item' : 'Create New Item'}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto">
          <ItemForm
            onSubmit={onSubmit}
            onCancel={onClose}
            initialData={initialData}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
