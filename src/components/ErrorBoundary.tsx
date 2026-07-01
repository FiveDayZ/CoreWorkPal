import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional override for the fallback UI. */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

/**
 * Catches render-time errors anywhere in its subtree and shows a recovery UI
 * instead of letting the whole window go blank.
 *
 * Without this, a single thrown error (e.g. reading a field off `null` while
 * data is still loading) crashes the entire Tauri webview with no way back
 * short of restarting the window. Wrap each window's page content so a failure
 * in one page is contained.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message ?? "未知错误" };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ErrorBoundary caught a render error:", error, info);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, message: "" });
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback !== undefined) {
      return this.props.fallback;
    }

    return (
      <div
        className="cwp-error-boundary"
        role="alert"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: 32,
          height: "100%",
          textAlign: "center",
          color: "var(--color-text)",
        }}
      >
        <div style={{ fontSize: 40, lineHeight: 1 }}>:(</div>
        <h2 style={{ margin: 0, fontSize: 18 }}>这一块出了点问题</h2>
        <p style={{ margin: 0, opacity: 0.7, fontSize: 13, maxWidth: 360 }}>
          页面渲染时发生了错误。可以尝试重新加载，或返回其他页面继续使用。
        </p>
        <button
          type="button"
          onClick={this.handleReset}
          style={{
            marginTop: 4,
            padding: "8px 18px",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            background: "var(--color-surface-800)",
            color: "var(--color-text)",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          重试
        </button>
      </div>
    );
  }
}
