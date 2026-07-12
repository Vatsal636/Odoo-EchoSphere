import './globals.css';
import { AuthProvider } from '@/lib/auth';
import AppLayout from '@/components/AppLayout';
import EsgAssistant from '../components/EsgAssistant';

export const metadata = {
  title: 'EcoSphere - ESG Management Platform',
  description: 'Environmental, Social and Governance Management Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
        <EsgAssistant />
      </body>
    </html>
  );
}
