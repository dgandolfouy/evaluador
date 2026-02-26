import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    if (confirm('¿Estás seguro? Esto borrará todos los datos guardados localmente y restaurará la aplicación al estado inicial.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-2xl max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-black text-white mb-2 uppercase">Algo salió mal</h1>
            <p className="text-slate-400 text-sm mb-6">
              La aplicación ha encontrado un error inesperado.
              <br />
              <span className="text-xs font-mono bg-slate-950 px-2 py-1 rounded mt-2 inline-block text-red-400">
                {error?.message}
              </span>
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={this.handleReload}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw size={16} /> Recargar Página
              </button>
              
              <button 
                onClick={this.handleReset}
                className="w-full bg-red-950/30 hover:bg-red-900/50 text-red-500 py-4 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 transition-all border border-red-500/20"
              >
                <Trash2 size={16} /> Borrar Datos y Restaurar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}
