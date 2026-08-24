import { useState } from 'react';
import api from '../api/client';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await api.post('/newsletter', { email });
      setStatus('success');
      setMessage('Thanks for subscribing!');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong, please try again.');
    }
  };

  return (
    <form role="search" onSubmit={submit}>
      <div className="input-group">
        <input
          name="news-letter"
          className="form-control"
          placeholder="ENTER YOUR EMAIL"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <span className="input-group-btn">
          <button type="submit" className="btn-half site-button button-lg" disabled={status === 'loading'}>
            <span>{status === 'loading' ? 'Submitting...' : 'Submit'}</span>
            <em />
          </button>
        </span>
      </div>
      {message && (
        <p className={status === 'error' ? 'text-danger m-t10' : 'text-white m-t10'}>{message}</p>
      )}
    </form>
  );
}
