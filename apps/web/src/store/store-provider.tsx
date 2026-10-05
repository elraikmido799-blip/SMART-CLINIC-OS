'use client';

import { useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from './store';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // useState بيعمل الـStore مرة واحدة بس طول ما الصفحة مفتوحة
  const [store] = useState(makeStore);
  return <Provider store={store}>{children}</Provider>;
}
