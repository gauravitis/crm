import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface ItemFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export default function ItemForm({ onSubmit, onCancel, initialData }: ItemFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {}
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Item' : 'Create New Item'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            <div className="space-y-4">
              <Label htmlFor="name" className="text-base font-medium">Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                placeholder="Item name"
                className={`h-12 text-lg ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message as string}</p>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="catalogueId" className="text-base font-medium">Catalogue ID</Label>
              <Input
                id="catalogueId"
                {...register('catalogueId')}
                placeholder="Catalogue ID"
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="casNumber" className="text-base font-medium">CAS Number</Label>
              <Input
                id="casNumber"
                {...register('casNumber')}
                placeholder="CAS Number"
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="packSize" className="text-base font-medium">Pack Size</Label>
              <Input
                id="packSize"
                {...register('packSize')}
                placeholder="Pack Size"
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="hsnCode" className="text-base font-medium">HSN Code</Label>
              <Input
                id="hsnCode"
                {...register('hsnCode')}
                placeholder="HSN Code"
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="brand" className="text-base font-medium">Brand/Make</Label>
              <Input
                id="brand"
                {...register('brand')}
                placeholder="Brand/Make"
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="price" className="text-base font-medium">Price *</Label>
              <Input
                id="price"
                type="number"
                {...register('price', { 
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be positive' }
                })}
                placeholder="Item price"
                className={`h-12 text-lg ${errors.price ? 'border-red-500' : ''}`}
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message as string}</p>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="quantity" className="text-base font-medium">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                {...register('quantity', { 
                  required: 'Quantity is required',
                  min: { value: 0, message: 'Quantity must be positive' }
                })}
                placeholder="Item quantity"
                className={`h-12 text-lg ${errors.quantity ? 'border-red-500' : ''}`}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity.message as string}</p>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="batchNo" className="text-base font-medium">Batch Number</Label>
              <Input
                id="batchNo"
                {...register('batchNo')}
                placeholder="Batch Number"
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="mfgDate" className="text-base font-medium">Manufacturing Date</Label>
              <Input
                id="mfgDate"
                type="date"
                {...register('mfgDate')}
                className="h-12 text-lg cursor-pointer"
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="expDate" className="text-base font-medium">Expiry Date</Label>
              <Input
                id="expDate"
                type="date"
                {...register('expDate')}
                className="h-12 text-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button type="button" onClick={onCancel} variant="outline" className="flex-1 h-12 text-lg font-medium">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 h-12 text-lg font-medium">
              {initialData ? 'Update Item' : 'Create Item'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
