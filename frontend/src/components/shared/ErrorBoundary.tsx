import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../ui/Button';

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

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center px-4 gap-4">
          <div className="text-[64px] text-[#C7C7CC]">⚠️</div>
          <h1 className="text-[22px] font-bold text-[#1C1C1E] text-center">Something went wrong</h1>
          <p className="text-[17px] text-[#8E8E93] text-center max-w-[260px]">
            {this.state.error?.message ?? 'An unexpected error occurred'}
          </p>
          <Button onClick={() => window.location.reload()}>Reload App</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
