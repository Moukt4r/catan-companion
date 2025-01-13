import type { AppProps } from 'next/app';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <Component {...pageProps} />
      </div>
    </ErrorBoundary>
  );
}