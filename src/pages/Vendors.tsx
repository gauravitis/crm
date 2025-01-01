import React, { useState } from 'react';
import { VendorList } from '../components/vendors/VendorList';
import { VendorForm } from '../components/vendors/VendorForm';
import { useVendors } from '../hooks/useVendors';
import { Vendor } from '../types/vendor';
import { Plus } from 'lucide-react';

export const Vendors = () => {
  const { addVendor, updateVendor, deleteVendor } = useVendors();
  const [showForm, setShowForm] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | undefined>();

  const handleAddVendor = async (vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addVendor(vendorData);
    setShowForm(false);
    setSelectedVendor(undefined);
  };

  const handleUpdateVendor = async (vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedVendor) {
      await updateVendor(selectedVendor.id, vendorData);
      setShowForm(false);
      setSelectedVendor(undefined);
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowForm(true);
  };

  const handleDelete = async (vendor: Vendor) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      await deleteVendor(vendor.id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Vendors</h1>
        <button
          onClick={() => {
            setSelectedVendor(undefined);
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Vendor
        </button>
      </div>

      <VendorList onEdit={handleEdit} onDelete={handleDelete} />

      {showForm && (
        <VendorForm
          vendor={selectedVendor}
          onSubmit={selectedVendor ? handleUpdateVendor : handleAddVendor}
          onClose={() => {
            setShowForm(false);
            setSelectedVendor(undefined);
          }}
        />
      )}
    </div>
  );
};
