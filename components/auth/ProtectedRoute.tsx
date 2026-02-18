'use client';

import React from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    // UI-only mode: skip auth checks, just render children
    return <>{children}</>;
}
