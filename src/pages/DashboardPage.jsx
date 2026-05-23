import React from 'react';
import { getCookie } from '../utils/cookieAuth';
import { modules } from '../utils/moduleRegistry';
import Navbar from '../components/Navbar';
import ModuleCard from '../components/ModuleCard';

export default function DashboardPage() {
  const studentName = getCookie('studentName');

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar isAdmin={false} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Welcome, <span className="text-blue-600">{studentName}</span>!
          </h1>
          <p className="text-lg text-slate-600">
            Select a module below to start exploring physics simulations.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              id={module.id}
              title={module.title}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
