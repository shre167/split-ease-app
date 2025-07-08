import React from 'react';

const LoginHeader = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>SplitEase</h1>
      <p style={styles.subtitle}>Smart expense splitting for modern life</p>
      
      <div style={styles.featuresContainer}>
        <div style={styles.feature}>
          <h3 style={styles.featureTitle}>Split Bills Effortlessly</h3>
          <p style={styles.featureText}>Automatically calculate who owes what and settle up with integrated payments.</p>
        </div>
        
        <div style={styles.feature}>
          <h3 style={styles.featureTitle}>Track Group Expenses</h3>
          <p style={styles.featureText}>Keep track of shared expenses with friends, roommates, and colleagues.</p>
        </div>
        
        <div style={styles.feature}>
          <h3 style={styles.featureTitle}>Smart Notifications</h3>
          <p style={styles.featureText}>Get reminded when it's time to settle up or when expenses are added.</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center' as const,
    padding: '2rem 1rem',
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '2rem',
  },
  featuresContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1.5rem',
    marginTop: '2rem',
  },
  feature: {
    flex: 1,
    textAlign: 'center' as const,
  },
  featureTitle: {
    fontSize: '1.1rem',
    fontWeight: '600' as const,
    marginBottom: '0.5rem',
    color: '#1a1a1a',
  },
  featureText: {
    fontSize: '0.9rem',
    color: '#666',
    lineHeight: '1.5',
  },
};

export default LoginHeader;