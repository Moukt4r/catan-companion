import type { AppProps } from 'next/app';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from 'next-themes';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <ErrorBoundary>
          <Component {...pageProps} />
        </ErrorBoundary>
      </div>
    </ThemeProvider>
  );
}