import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Incident Center AI',
  description: 'Multi-agent orchestration for AI Ops incident management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
