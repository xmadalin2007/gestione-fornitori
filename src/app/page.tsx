'use client';

import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm';

export default function Home() {
  const router = useRouter();

  return <LoginForm />;
}
