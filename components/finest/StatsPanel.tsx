'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Stats {
  totalBookings: number;
  upcomingCheckIns: number;
  activeRooms: number;
}

export function StatsPanel() {
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    upcomingCheckIns: 0,
    activeRooms: 0,
  });

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then(setStats);
  }, []);

  const chartData = [
    { name: 'Total Bookings', value: stats.totalBookings },
    { name: 'Upcoming Check‑ins', value: stats.upcomingCheckIns },
    { name: 'Active Rooms', value: stats.activeRooms },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Overview</h3>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalBookings}</div>
          <div className="text-sm text-gray-600">Total Bookings</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.upcomingCheckIns}</div>
          <div className="text-sm text-gray-600">Upcoming Check‑ins</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.activeRooms}</div>
          <div className="text-sm text-gray-600">Active Rooms</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}