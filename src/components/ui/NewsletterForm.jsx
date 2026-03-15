/**
 * components/ui/NewsletterForm.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Newsletter Signup Form — MiniFanzo
 *
 * Simple email capture form.
 * Currently shows a success state on submit.
 * To integrate with Mailchimp / ConvertKit, add an API route.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { FiMail, FiArrowRight, FiCheck } from "react-icons/fi";

export default function NewsletterForm() {
  const [email,     setEmail]     = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    // Simulate API call — replace with real newsletter API
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 animate-scale-in">
        <div className="w-14 h-14 bg-accent/20 rounded-full flex items-center justify-center">
          <FiCheck className="w-7 h-7 text-accent" strokeWidth={3} />
        </div>
        <p className="text-white font-semibold text-lg">You're in! 🎉</p>
        <p className="text-white/60 text-sm">Check your inbox for exclusive deals.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto w-full">
      <div className="relative flex-1">
        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white border-0
                     text-gray-800 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-accent px-6 py-3.5 text-sm whitespace-nowrap"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            Subscribe
            <FiArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
