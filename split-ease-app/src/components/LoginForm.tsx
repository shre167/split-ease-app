import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Welcome back</h2>
      <p style={styles.subtitle}>Sign in to your SplitEase account</p>
      
      <form style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Email</label>
          <input 
            type="email" 
            placeholder="Enter your email" 
            style={styles.input}
            required
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <div style={styles.passwordWrapper}>
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Enter your password" 
              style={styles.input}
              required
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              style={styles.toggleButton}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        
        <div style={styles.optionsRow}>
          <label style={styles.rememberMe}>
            <input type="checkbox" style={styles.checkbox} />
            Remember me
          </label>
          <a href="#" style={styles.forgotPassword}>Forgot password?</a>
        </div>
        
        <button type="submit" style={styles.submitButton}>Sign in</button>
        
        <div style={styles.divider}>
          <span style={styles.dividerText}>or</span>
        </div>
        
        <button type="button" style={styles.googleButton}>
          Continue with Google
        </button>
        
        <p style={styles.signupText}>
          Don't have an account? <a href="#" style={styles.signupLink}>Sign Up</a>
        </p>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '2rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600' as const,
    marginBottom: '0.5rem',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.2rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '500' as const,
    color: '#333',
  },
  input: {
    padding: '0.8rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '0.9rem',
    width: '100%',
  },
  passwordWrapper: {
    position: 'relative' as const,
  },
  toggleButton: {
    position: 'absolute' as const,
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#666',
  },
  optionsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rememberMe: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    color: '#666',
  },
  checkbox: {
    width: '1rem',
    height: '1rem',
  },
  forgotPassword: {
    fontSize: '0.9rem',
    color: '#0066cc',
    textDecoration: 'none',
  },
  submitButton: {
    backgroundColor: '#0066cc',
    color: 'white',
    padding: '0.8rem',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600' as const,
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '1rem 0',
  },
  dividerText: {
    padding: '0 1rem',
    color: '#999',
    fontSize: '0.8rem',
  },
  googleButton: {
    backgroundColor: 'white',
    color: '#333',
    padding: '0.8rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontWeight: '600' as const,
    cursor: 'pointer',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  signupText: {
    textAlign: 'center' as const,
    fontSize: '0.9rem',
    color: '#666',
    marginTop: '1rem',
  },
  signupLink: {
    color: '#0066cc',
    fontWeight: '500' as const,
    textDecoration: 'none',
  },
};

export default LoginForm;