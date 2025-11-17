/** @jsxImportSource react */
import * as React from 'react';

interface EmailVerificationTemplateProps {
  firstName: string;
}

export function EmailVerificationTemplate({ firstName }: EmailVerificationTemplateProps) {
  return (
    <div>
      <h1>Welcome, {firstName}!</h1>
    </div>
  );
}