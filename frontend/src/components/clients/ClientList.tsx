import React, { useState } from 'react';
import { Client } from '../../types';
import { formatDate } from '../../utils/helpers';
import { Edit2, Trash2, Eye } from 'lucide-react';
import ClientDetails from './ClientDetails';

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}

export default function ClientList({ clients, onEdit, onDelete }: ClientListProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-1/4 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name / Company
            </th>
            <th className="w-1/4 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="w-1/6 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="w-1/6 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="w-1/6 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clients.map((client) => (
            <tr key={client.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <button 
                    onClick={() => setSelectedClient(client)}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 text-left"
                  >
                    {client.name}
                  </button>
                  <div className="text-xs text-gray-500">{client.company}</div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-gray-500">{client.email}</div>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  client.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {client.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {formatDate(client.createdAt)}
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => setSelectedClient(client)}
                    className="text-gray-600 hover:text-blue-600"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEdit(client)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Edit Client"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(client.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete Client"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedClient && (
        <ClientDetails
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
}