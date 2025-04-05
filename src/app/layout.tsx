import './globals.css';
import { ClientLayout } from '@/components/layout/client-layout';

export const metadata = {
  title: 'AgriGenie - AI-Powered Smart Farming Platform',
  description: 'AgriGenie is an AI-powered smart farming and direct marketplace application helping farmers with AI-driven insights, analytics, and a direct marketplace to maximize yield and profit.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
