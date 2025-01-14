import React from 'react';
import { Client } from '../../types/client';
import { formatDate } from '../../utils/helpers';
import { X, Mail, Phone, Building2, Calendar, MapPin } from 'lucide-react';

interface ClientDetailsProps {
  client: Client;
  onClose: () => void;
}

export default function ClientDetails({ client, onClose }: ClientDetailsProps) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
          <span className={`mt-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            client.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {client.status}
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center text-gray-700">
            <Building2 className="h-5 w-5 mr-3 text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900">Company</div>
              <div className="text-sm">{client.company}</div>
            </div>
          </div>

          <div className="flex items-center text-gray-700">
            <Mail className="h-5 w-5 mr-3 text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900">Email</div>
              <a href={`mailto:${client.email}`} className="text-sm text-blue-600 hover:text-blue-800">
                {client.email}
              </a>
            </div>
          </div>

          <div className="flex items-center text-gray-700">
            <Phone className="h-5 w-5 mr-3 text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900">Phone</div>
              <a href={`tel:${client.phone}`} className="text-sm text-blue-600 hover:text-blue-800">
                {client.phone}
              </a>
            </div>
          </div>

          {client.address && (
            <div className="flex items-start text-gray-700">
              <MapPin className="h-5 w-5 mr-3 mt-1 text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-900">Address</div>
                <div className="text-sm space-y-1">
                  <div>{client.address.street}</div>
                  <div>{client.address.city}, {client.address.state} {client.address.postalCode}</div>
                  <div>{client.address.country}</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center text-gray-700">
            <Calendar className="h-5 w-5 mr-3 text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900">Client Since</div>
              <div className="text-sm">{formatDate(client.createdAt)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
