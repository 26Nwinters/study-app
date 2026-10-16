import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Study Space failed to render:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ minHeight: '100vh', padding: '32px 20px', background: '#111712', color: '#e7ece5', fontFamily: 'system-ui, sans-serif' }}>
          <section style={{ maxWidth: '680px', margin: '8vh auto', padding: '24px', border: '1px solid #694b3d', borderRadius: '16px', background: '#171f19' }}>
            <p style={{ color: '#b3c99b', letterSpacing: '0.12em', fontSize: '12px' }}>STUDY SPACE</p>
            <h1 style={{ fontSize: '26px' }}>The app hit an error while opening.</h1>
            <p style={{ color: '#c6cec4', lineHeight: 1.6 }}>This message helps us find the cause. Your saved study data has not been intentionally deleted.</p>
            <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', padding: '14px', borderRadius: '10px', background: '#0c100d', color: '#f2c6a8' }}>{String(this.state.error?.message || this.state.error || 'Unknown rendering error')}</pre>
            <p style={{ color: '#a7b2a5', fontSize: '14px' }}>Please send this error message to the person helping you troubleshoot.</p>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode><AppErrorBoundary><App /></AppErrorBoundary></React.StrictMode>
  );
}
