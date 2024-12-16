import type { AppProps } from 'next/app'
import '../styles/globals.css';
import { Toaster } from "@/components/ui/toaster"
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // **DO NOT REMOVE OR MODIFY**
  useEffect(() => {
    // Global error handler
    window.onerror = (message, source, lineno, colno, error) => {
      window.parent.postMessage({
        type: 'ERROR',
        error: {
          source,
          lineno,
          colno,
          message,
          stack: error?.stack
        }
      }, '*');
    };

    // Add unhandledrejection handler for async errors
    window.onunhandledrejection = (event) => {
      window.parent.postMessage({
        type: 'ERROR',
        error: {
          message: event.reason.message,
          stack: event.reason.stack
        }
      }, '*');
    };

    // Add fetch error handler
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          const error = new Error(`HTTP error! status: ${response.status}`);
          // Add file and line number info to error
          error.stack = `${args[0]}\n    at ${window.location.href}:${new Error().stack?.split('\n')[2]?.match(/:\d+/)?.[0] || ''}`;
          throw error;
        }
        return response;
      } catch (error) {
        window.parent.postMessage({
          type: 'ERROR',
          error: {
            message: (error as Error).message,
            stack: (error as Error).stack,
            url: args[0]?.toString()
          }
        }, '*');
        throw error;
      }
    };

    // Handle React errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Check if this is a React error
      const errorText = args.join(' ');
      if (errorText.includes('Error:') && (
        errorText.includes('Minified React error') || 
        errorText.includes('Error rendering page') ||
        errorText.includes('client-side exception')
      )) {
        window.parent.postMessage({
          type: 'ERROR',
          error: {
            message: errorText,
            stack: new Error().stack,
            isReactError: true
          }
        }, '*');
      }
      originalConsoleError.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  // **DO NOT REMOVE** Send URL to parent on navigation changes
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      window.parent.postMessage({
        type: 'URL_CHANGE',
        url: window.location.href,
      }, '*');
    };
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    // Get the color-scheme value from :root
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    const colorScheme = computedStyle.getPropertyValue('--mode').trim().replace(/"/g, '');
    if (colorScheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.add('light');
    }
    setMounted(true);
  }, []);

  // Prevent flash while theme loads
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Component {...pageProps} />
      <Toaster />
    </div>
  )
}