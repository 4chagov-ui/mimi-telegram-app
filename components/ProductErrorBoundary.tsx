'use client';

import React from 'react';
import Link from 'next/link';

type Props = { children: React.ReactNode };

type State = { hasError: boolean };

export class ProductErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('ProductErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
          <p className="text-center text-tg-text">Что-то пошло не так</p>
          <Link
            href="/catalog"
            className="rounded-lg bg-tg-button px-4 py-3 text-tg-button-text"
          >
            В каталог
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}
