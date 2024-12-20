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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Item' : 'Create New Item'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
              placeholder="Item name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="catalogueId">Catalogue ID</Label>
            <Input
              id="catalogueId"
              {...register('catalogueId', { required: 'Catalogue ID is required' })}
              placeholder="Catalogue ID"
              className={errors.catalogueId ? 'border-red-500' : ''}
            />
            {errors.catalogueId && (
              <p className="text-sm text-red-500">{errors.catalogueId.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              {...register('sku', { required: 'SKU is required' })}
              placeholder="SKU"
              className={errors.sku ? 'border-red-500' : ''}
            />
            {errors.sku && (
              <p className="text-sm text-red-500">{errors.sku.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="packSize">Pack Size</Label>
            <Input
              id="packSize"
              {...register('packSize', { required: 'Pack Size is required' })}
              placeholder="Pack Size"
              className={errors.packSize ? 'border-red-500' : ''}
            />
            {errors.packSize && (
              <p className="text-sm text-red-500">{errors.packSize.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hsnCode">HSN Code</Label>
            <Input
              id="hsnCode"
              {...register('hsnCode', { required: 'HSN Code is required' })}
              placeholder="HSN Code"
              className={errors.hsnCode ? 'border-red-500' : ''}
            />
            {errors.hsnCode && (
              <p className="text-sm text-red-500">{errors.hsnCode.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchNo">Batch Number</Label>
            <Input
              id="batchNo"
              {...register('batchNo', { required: 'Batch Number is required' })}
              placeholder="Batch Number"
              className={errors.batchNo ? 'border-red-500' : ''}
            />
            {errors.batchNo && (
              <p className="text-sm text-red-500">{errors.batchNo.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mfgDate">Manufacturing Date</Label>
            <Input
              id="mfgDate"
              type="date"
              {...register('mfgDate')}
              placeholder="Manufacturing Date"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expDate">Expiry Date</Label>
            <Input
              id="expDate"
              type="date"
              {...register('expDate')}
              placeholder="Expiry Date"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              {...register('brand', { required: 'Brand is required' })}
              placeholder="Brand"
              className={errors.brand ? 'border-red-500' : ''}
            />
            {errors.brand && (
              <p className="text-sm text-red-500">{errors.brand.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              {...register('price', { 
                required: 'Price is required',
                min: { value: 0, message: 'Price must be positive' }
              })}
              placeholder="Item price"
              className={errors.price ? 'border-red-500' : ''}
            />
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              {...register('quantity', { 
                required: 'Quantity is required',
                min: { value: 0, message: 'Quantity must be positive' }
              })}
              placeholder="Item quantity"
              className={errors.quantity ? 'border-red-500' : ''}
            />
            {errors.quantity && (
              <p className="text-sm text-red-500">{errors.quantity.message as string}</p>
            )}
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full">
              {initialData ? 'Update Item' : 'Create Item'}
            </Button>
            <Button type="button" onClick={onCancel} className="w-full mt-2">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
