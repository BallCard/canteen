import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, _info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#F7F8FA] p-6">
          <div className="bg-white rounded-3xl p-8 max-w-md shadow-premium">
            <h2 className="text-lg font-black text-[#1A1A1A] mb-2">页面出错了</h2>
            <p className="text-sm text-gray-500 mb-4 font-medium break-all">{this.state.error?.message || "未知错误"}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-6 py-2 bg-zju-green text-white rounded-xl font-black text-xs tracking-wider"
            >
              重试
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
