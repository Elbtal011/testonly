import React from 'react';
import { CreditCard, Download, ChevronRight } from 'lucide-react';

export const Billing: React.FC = () => {
  const invoices = [
    {
      id: 1,
      date: '2024-03-01',
      amount: '€49.99',
      status: 'Bezahlt',
      downloadUrl: '#',
    },
    {
      id: 2,
      date: '2024-02-01',
      amount: '€49.99',
      status: 'Bezahlt',
      downloadUrl: '#',
    },
    {
      id: 3,
      date: '2024-01-01',
      amount: '€49.99',
      status: 'Bezahlt',
      downloadUrl: '#',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Abrechnung</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Aktueller Plan</h2>
            <p className="mt-1 text-sm text-gray-500">Professional Plan</p>
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Plan ändern
          </button>
        </div>

        <div className="mt-6">
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Visa ending in 4242</span>
          </div>
          <button className="mt-2 text-sm text-indigo-600 hover:text-indigo-500">
            Zahlungsmethode aktualisieren
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Abrechnungsverlauf</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-sm text-gray-900">{new Date(invoice.date).toLocaleDateString()}</div>
                <span className="mx-2 text-gray-500">•</span>
                <div className="text-sm font-medium text-gray-900">{invoice.amount}</div>
                <span className="mx-2 text-gray-500">•</span>
                <div className="text-sm text-gray-500">{invoice.status}</div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="text-gray-400 hover:text-gray-500">
                  <Download className="h-5 w-5" />
                </button>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};