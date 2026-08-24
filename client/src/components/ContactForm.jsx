import { useState } from 'react';
import api from '../api/client';

const initialState = { name: '', email: '', message: '' };

export default function ContactForm() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      await api.post('/contact', form);
      setStatus('success');
      setForm(initialState);
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <form className="contact-form cons-contact-form" onSubmit={submit}>
      <div className="contact-one m-b30">
        <div className="section-head text-left">
          <h2 className="m-b5">Get In Touch</h2>
        </div>

        {status === 'success' && (
          <div className="alert alert-success">
            Thanks for reaching out — we&rsquo;ll get back to you shortly.
          </div>
        )}
        {status === 'error' && <div className="alert alert-danger">{error}</div>}

        <div className="form-group">
          <input
            name="name"
            type="text"
            required
            className="form-control"
            placeholder="Name"
            value={form.name}
            onChange={onChange}
          />
        </div>

        <div className="form-group">
          <input
            name="email"
            type="email"
            className="form-control"
            required
            placeholder="Email"
            value={form.email}
            onChange={onChange}
          />
        </div>

        <div className="form-group">
          <textarea
            name="message"
            rows="4"
            className="form-control"
            required
            placeholder="Message"
            value={form.message}
            onChange={onChange}
          />
        </div>

        <div className="text-right">
          <button
            name="submit"
            type="submit"
            className="btn-half site-button button-lg m-b15"
            disabled={status === 'loading'}
          >
            <span>{status === 'loading' ? 'Sending...' : 'Submit'}</span>
            <em />
          </button>
        </div>
      </div>
    </form>
  );
}
