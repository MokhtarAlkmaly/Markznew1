import React, { useEffect, useState } from 'react';
import { useOnline, useOrientation, useSafeArea, useIsInstalledPWA } from '../hooks/useMobileOptimizations';

/**
 * Mobile Status Bar Component
 * يعرض حالة الاتصال والمعلومات الأخرى
 */
export const MobileStatusBar: React.FC = () => {
  const isOnline = useOnline();
  const isInstalledPWA = useIsInstalledPWA();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-emerald-600 text-white px-4 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-300' : 'bg-red-300'}`} />
        <span>{isOnline ? 'متصل' : 'غير متصل'}</span>
      </div>
      {isInstalledPWA && (
        <span className="text-xs bg-emerald-700 px-2 py-1 rounded">تطبيق</span>
      )}
    </div>
  );
};

/**
 * Safe Area Container Component
 * يعامل safe area insets بشكل صحيح
 */
interface SafeAreaContainerProps {
  children: React.ReactNode;
  className?: string;
  includeTop?: boolean;
  includeBottom?: boolean;
}

export const SafeAreaContainer: React.FC<SafeAreaContainerProps> = ({
  children,
  className = '',
  includeTop = true,
  includeBottom = true,
}) => {
  const safeArea = useSafeArea();

  return (
    <div
      className={`w-full ${className}`}
      style={{
        paddingTop: includeTop ? `${Math.max(1, safeArea.top)}px` : '0',
        paddingBottom: includeBottom ? `${Math.max(1, safeArea.bottom)}px` : '0',
        paddingLeft: `${Math.max(16, safeArea.left)}px`,
        paddingRight: `${Math.max(16, safeArea.right)}px`,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Responsive Layout Component
 * يتغير التخطيط حسب اتجاه الشاشة
 */
interface ResponsiveLayoutProps {
  children: React.ReactNode;
  portraitClassName?: string;
  landscapeClassName?: string;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  portraitClassName = '',
  landscapeClassName = '',
}) => {
  const orientation = useOrientation();

  return (
    <div className={orientation === 'portrait' ? portraitClassName : landscapeClassName}>
      {children}
    </div>
  );
};

/**
 * Touch-Friendly Button Component
 */
interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  variant = 'primary',
  loading = false,
  children,
  ...props
}) => {
  const variants = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:scale-95',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-95',
  };

  return (
    <button
      className={`
        min-h-[44px] min-w-[44px] px-4 py-2 rounded-lg font-medium
        transition-all duration-200 active:scale-95 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
      `}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="animate-spin">⏳</span>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};

/**
 * Touch-Friendly Input Component
 */
interface TouchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const TouchInput: React.FC<TouchInputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={`
          w-full min-h-[44px] px-4 py-2 rounded-lg
          border-2 border-gray-300 focus:border-emerald-600
          text-base font-readex transition-colors
          ${error ? 'border-red-600' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-red-600 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

/**
 * Offline Indicator Component
 */
export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnline();
  const [showMessage, setShowMessage] = useState(!isOnline);

  useEffect(() => {
    setShowMessage(!isOnline);
    if (!isOnline) {
      const timer = setTimeout(() => setShowMessage(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-red-600 text-white p-4 flex items-center justify-center gap-2 animate-pulse">
      <span className="w-2 h-2 bg-red-300 rounded-full animate-pulse" />
      <span className="text-sm">بدون اتصال إنترنت - البيانات محفوظة محلياً</span>
    </div>
  );
};

/**
 * Install PWA Prompt Component
 */
interface InstallPromptProps {
  onDismiss?: () => void;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({ onDismiss }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!showPrompt) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    onDismiss?.();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-emerald-600 p-4 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-gray-800">ثبت التطبيق</h3>
          <p className="text-sm text-gray-600">استخدم التطبيق بسهولة على جهازك</p>
        </div>
        <div className="flex gap-2">
          <TouchButton variant="secondary" onClick={handleDismiss}>
            لاحقاً
          </TouchButton>
          <TouchButton onClick={handleInstall}>
            تثبيت
          </TouchButton>
        </div>
      </div>
    </div>
  );
};

/**
 * Loading Skeleton Component
 */
export const SkeletonLoader: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-12 bg-gray-300 rounded-lg" />
        </div>
      ))}
    </div>
  );
};
