import * as React from 'react';

export default function WelcomeEmail({ name }: { name?: string }) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: 1.5 }}>
      <h2>Welcome to SuVerse{name ? `, ${name}` : ''}!</h2>
      <p>Your account has been created successfully.</p>
      <p>You can log in to your dashboard and start working with tax credits.</p>
      <p>— SuVerse Team</p>
    </div>
  );
}
