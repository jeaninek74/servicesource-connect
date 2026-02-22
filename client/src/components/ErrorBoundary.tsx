import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** If true, shows a small inline fallback instead of full-page error */
  inline?: boolean;
  /** Label shown in inline fallback (e.g. "this section") */
  label?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

const MAX_AUTO_RETRIES = 2;

class ErrorBoundary extends Component<Props, State> {
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary] Caught render error:", error.message, info.componentStack);
    // Auto-retry up to MAX_AUTO_RETRIES times with exponential backoff
    if (this.state.retryCount < MAX_AUTO_RETRIES) {
      const delay = Math.pow(2, this.state.retryCount) * 500;
      this.retryTimer = setTimeout(() => {
        this.setState((prev) => ({
          hasError: false,
          error: null,
          retryCount: prev.retryCount + 1,
        }));
      }, delay);
    }
  }

  componentWillUnmount() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
  }

  handleManualRetry = () => {
    this.setState({ hasError: false, error: null, retryCount: 0 });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const isAutoRetrying = this.state.retryCount < MAX_AUTO_RETRIES;
    const { inline, label } = this.props;

    // Inline fallback — keeps the rest of the page working
    if (inline) {
      return (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <span>
            {isAutoRetrying
              ? `Recovering ${label ?? "this section"}…`
              : `Could not load ${label ?? "this section"}.`}
          </span>
          {!isAutoRetrying && (
            <button
              onClick={this.handleManualRetry}
              className="ml-auto text-xs underline hover:no-underline"
            >
              Retry
            </button>
          )}
        </div>
      );
    }

    // Full-page fallback
    return (
      <div className="flex items-center justify-center min-h-screen p-8 bg-background">
        <div className="flex flex-col items-center w-full max-w-2xl p-8">
          <AlertTriangle size={48} className="text-destructive mb-6 flex-shrink-0" />
          <h2 className="text-xl mb-2 font-semibold text-foreground">Something went wrong</h2>
          {isAutoRetrying ? (
            <p className="text-muted-foreground mb-6 text-center">Attempting to recover automatically…</p>
          ) : (
            <>
              <p className="text-muted-foreground mb-4 text-center">
                The page encountered an unexpected error. You can try again or return to the dashboard.
              </p>
              <div className="p-4 w-full rounded bg-muted overflow-auto mb-6 max-h-40">
                <pre className="text-xs text-muted-foreground whitespace-break-spaces">
                  {this.state.error?.message}
                </pre>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={this.handleManualRetry}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg",
                    "bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
                  )}
                >
                  <RotateCcw size={16} />
                  Try Again
                </button>
                <a
                  href="/dashboard"
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg",
                    "border border-border text-foreground hover:bg-muted cursor-pointer"
                  )}
                >
                  Go to Dashboard
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;;
