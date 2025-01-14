import React, { useState } from 'react';
import { Client } from '../../types';
import { formatDate } from '../../utils/helpers';
import { Edit2, Trash2 } from 'lucide-react';
import ClientDetails from './ClientDetails';

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}

export default function ClientList({ clients, onEdit, onDelete }: ClientListProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clients.map((client) => (
            <tr key={client.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <button 
                  onClick={() => setSelectedClient(client)}
                  className="text-sm font-medium text-gray-900 hover:text-blue-600"
                >
                  {client.name}
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{client.company}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{client.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  client.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {client.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(client.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(client)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(client.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
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