'use client';
import React, { createContext, useContext, useState } from 'react';

type TabsCtx = {
  value: string;
  setValue: (v: string) => void;
};
const TabsContext = createContext<TabsCtx | null>(null);
const useTabs = () => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs components must be used inside <Tabs>');
  return ctx;
};

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  children,
}: {
  defaultValue: string;
  value?: string;
  onValueChange?: (v: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? (controlledValue as string) : uncontrolled;

  const setValue = (v: string) => {
    if (!isControlled) setUncontrolled(v);
    onValueChange?.(v);
  };

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div role="tablist" className={className}>
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { value: active, setValue } = useTabs();
  const isActive = active === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`tab-panel-${value}`}
      onClick={() => setValue(value)}
      className={`px-3 py-1 rounded-t border-b-2 ${
        isActive ? 'border-blue-500 font-semibold' : 'border-transparent text-gray-500'
      } ${className || ''}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  forceMount,
  className,
  children,
}: {
  value: string;
  forceMount?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const { value: active } = useTabs();
  const isActive = active === value;

  if (!forceMount && !isActive) return null; // default behavior: unmount when inactive

  // forceMount => keep mounted but hidden when inactive
  return (
    <div
      role="tabpanel"
      id={`tab-panel-${value}`}
      aria-hidden={!isActive}
      className={`${!isActive ? 'hidden' : ''} ${className || ''}`}
    >
      {children}
    </div>
  );
}
