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
              <Label htmlFor="name" className="text-base font-medium">Name</Label>
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
                {...register('catalogueId', { required: 'Catalogue ID is required' })}
                placeholder="Catalogue ID"
                className={`h-12 text-lg ${errors.catalogueId ? 'border-red-500' : ''}`}
              />
              {errors.catalogueId && (
                <p className="text-sm text-red-500">{errors.catalogueId.message as string}</p>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="casNumber" className="text-base font-medium">CAS Number</Label>
              <Input
                id="casNumber"
                {...register('casNumber', { required: 'CAS Number is required' })}
                placeholder="CAS Number"
                className={`h-12 text-lg ${errors.casNumber ? 'border-red-500' : ''}`}
              />
              {errors.casNumber && (
                <p className="text-sm text-red-500">{errors.casNumber.message as string}</p>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="sku" className="text-base font-medium">CAS</Label>
              <Input
                id="sku"
                {...register('sku', { required: 'CAS is required' })}
                placeholder="CAS"
                className={`h-12 text-lg ${errors.sku ? 'border-red-500' : ''}`}
              />
              {errors.sku && (
                <p className="text-sm text-red-500">{errors.sku.message as string}</p>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="packSize" className="text-base font-medium">Pack Size</Label>
              <Input
                id="packSize"
                {...register('packSize', { required: 'Pack Size is required' })}
                placeholder="Pack Size"
                className={`h-12 text-lg ${errors.packSize ? 'border-red-500' : ''}`}
              />
              {errors.packSize && (
                <p className="text-sm text-red-500">{errors.packSize.message as string}</p>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="hsnCode" className="text-base font-medium">HSN Code</Label>
              <Input
                id="hsnCode"
                {...register('hsnCode', { required: 'HSN Code is required' })}
                placeholder="HSN Code"
                className={`h-12 text-lg ${errors.hsnCode ? 'border-red-500' : ''}`}
              />
              {errors.hsnCode && (
                <p className="text-sm text-red-500">{errors.hsnCode.message as string}</p>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="batchNo" className="text-base font-medium">Batch Number</Label>
              <Input
                id="batchNo"
                {...register('batchNo', { required: 'Batch Number is required' })}
                placeholder="Batch Number"
                className={`h-12 text-lg ${errors.batchNo ? 'border-red-500' : ''}`}
              />
              {errors.batchNo && (
                <p className="text-sm text-red-500">{errors.batchNo.message as string}</p>
              )}
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

            <div className="space-y-4">
              <Label htmlFor="brand" className="text-base font-medium">Brand</Label>
              <Input
                id="brand"
                {...register('brand', { required: 'Brand is required' })}
                placeholder="Brand"
                className={`h-12 text-lg ${errors.brand ? 'border-red-500' : ''}`}
              />
              {errors.brand && (
                <p className="text-sm text-red-500">{errors.brand.message as string}</p>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="price" className="text-base font-medium">Price</Label>
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
              <Label htmlFor="quantity" className="text-base font-medium">Quantity</Label>
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
          </div>

          <div className="flex gap-4 pt-6">
            <Button type="submit" className="flex-1 h-12 text-lg font-medium">
              {initialData ? 'Update Item' : 'Create Item'}
            </Button>
            <Button type="button" onClick={onCancel} variant="outline" className="flex-1 h-12 text-lg font-medium">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
