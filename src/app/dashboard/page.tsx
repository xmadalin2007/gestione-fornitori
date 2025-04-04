'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '@/components/Dashboard';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUser = localStorage.getItem('currentUser');
    const year = localStorage.getItem('selectedYear') || new Date().getFullYear().toString();

    if (!loggedIn || !currentUser) {
      router.push('/');
      return;
    }

    setIsLoggedIn(true);
    setUsername(currentUser);
    setSelectedYear(year);
  }, [router]);

  if (!isLoggedIn) {
    return null;
  }

  return <Dashboard initialYear={selectedYear} username={username} />;
} 