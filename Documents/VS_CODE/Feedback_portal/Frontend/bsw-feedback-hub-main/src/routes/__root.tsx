import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "../lib/auth-context";
import { FeedbackProvider } from "../lib/feedback-store";
import { Navbar } from "../components/Navbar";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-white">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-white">Page not found</h2>
        <p className="mt-2 text-sm text-gray-300">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-[#1a936f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#157a5b]"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    // ── Development-only logging ────────────────────────────────────────────
    // import.meta.env.DEV is a Vite-injected boolean that is statically
    // replaced with `false` in production builds. Vite's tree-shaker then
    // removes the entire block, so stack traces are NEVER emitted to the
    // browser console in production — not even as dead code in the bundle.
    //
    // Why not process.env.NODE_ENV? This is a Vite project; process.env is
    // not polyfilled at runtime. import.meta.env is the correct Vite API.
    //
    // Why inside useEffect (not at render top-level)?
    //   - Fires exactly once per distinct error, not on every re-render.
    //   - React StrictMode double-invokes render functions in development;
    //     a top-level console.error would log twice for the same error.
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("[ErrorBoundary]", error);
    }

    // Send to Lovable's telemetry regardless of environment — this calls
    // window.__lovableEvents?.captureException (no-ops when not in the editor)
    // and does NOT write to the DOM or expose data to the end user.
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-white">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-gray-300">
          Something went wrong on our end. Try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-[#1a936f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#157a5b]"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-slate-700/60 bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700/60"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BSW Feedback Portal" },
      {
        name: "description",
        content:
          "Share your feedback with BSW — we've got your back. A single portal for concerns across services, courses, hostels and more.",
      },
      { name: "author", content: "BSW" },
      { property: "og:title", content: "BSW Feedback Portal" },
      {
        property: "og:description",
        content: "Share your feedback with BSW — we've got your back.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-[#121826] text-white antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FeedbackProvider>
          <div className="flex min-h-screen flex-col bg-[#121826]">
            <Navbar />
            <Outlet />
          </div>
        </FeedbackProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
