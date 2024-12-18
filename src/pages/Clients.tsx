import React, { useState } from 'react';
import { Client } from '../types/client';
import { useClients } from '../hooks/useClients';
import ClientList from '../components/clients/ClientList';
import ClientModal from '../components/clients/ClientModal';
import { Plus, Loader } from 'lucide-react';

export default function Clients() {
  const { clients, loading, error, addClient, updateClient, deleteClient } = useClients();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const handleSubmit = async (data: Partial<Client>) => {
    try {
      if (editingClient) {
        await updateClient(editingClient.id, data);
      } else {
        await addClient(data as Omit<Client, 'id' | 'createdAt'>);
      }
      setIsModalOpen(false);
      setEditingClient(null);
    } catch (err) {
      console.error('Error handling client:', err);
      alert('Failed to save client. Please try again.');
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteClient(id);
      } catch (err) {
        console.error('Error deleting client:', err);
        alert('Failed to delete client. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
        <button
          onClick={() => {
            setEditingClient(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Client
        </button>
      </div>

      {clients && clients.length > 0 ? (
        <ClientList
          clients={clients}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No clients found. Add your first client to get started!</p>
        </div>
      )}

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClient(null);
        }}
        onSubmit={handleSubmit}
        client={editingClient}
      />
    </div>
  );
}