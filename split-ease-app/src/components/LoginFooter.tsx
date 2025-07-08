import React from 'react';

const LoginFooter = () => {
  return (
    <div style={styles.container}>
      <div style={styles.features}>
        <div style={styles.feature}>
          <h3 style={styles.featureTitle}>Bank-level Security</h3>
          <p style={styles.featureText}>Your data is encrypted and protected</p>
        </div>
        
        <div style={styles.feature}>
          <h3 style={styles.featureTitle}>Instant Settlements</h3>
          <p style={styles.featureText}>Split and settle expenses instantly</p>
        </div>
        
        <div style={styles.feature}>
          <h3 style={styles.featureTitle}>Privacy First</h3>
          <p style={styles.featureText}>Your personal data stays private</p>
        </div>
      </div>
      
      <div style={styles.footer}>
        <p style={styles.copyright}>
          © 2024 SplitEase. All rights reserved.
          <span style={styles.separator}> • </span>
          <a href="#" style={styles.link}>Privacy Policy</a>
          <span style={styles.separator}> • </span>
          <a href="#" style={styles.link}>Terms of Service</a>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#f8f8f8',
    padding: '2rem 1rem',
    marginTop: '2rem',
  },
  features: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    maxWidth: '800px',
    margin: '0 auto 2rem',
  },
  feature: {
    flex: 1,
    textAlign: 'center' as const,
  },
  featureTitle: {
    fontSize: '1rem',
    fontWeight: '600' as const,
    marginBottom: '0.5rem',
    color: '#1a1a1a',
  },
  featureText: {
    fontSize: '0.9rem',
    color: '#666',
  },
  footer: {
    textAlign: 'center' as const,
  },
  copyright: {
    fontSize: '0.8rem',
    color: '#666',
  },
  separator: {
    margin: '0 0.3rem',
  },
  link: {
    color: '#0066cc',
    textDecoration: 'none',
  },
};

export default LoginFooter;