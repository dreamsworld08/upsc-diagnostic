import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'UPSC Diagnostic Tool — Free Counseling Assessment',
  description:
    'Get a personalised diagnosis of your UPSC preparation. Identify your weaknesses and receive a targeted program recommendation in under 3 minutes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-[#1e3a6e] text-white shadow-md">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#b8962e] flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
              U
            </div>
            <div>
              <p className="font-bold text-base leading-tight">UPSC Diagnostic Tool</p>
              <p className="text-blue-200 text-xs">Free Counseling Assessment</p>
            </div>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
        <footer className="text-center text-xs text-gray-400 py-6">
          Your data is confidential and used only for counseling purposes.
        </footer>
      </body>
    </html>
  );
}
