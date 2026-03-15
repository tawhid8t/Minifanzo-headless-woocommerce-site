/**
 * components/ui/ContactForm.jsx
 * Simple contact form — used on homepage
 */
"use client";
import { useState } from "react";
import toast        from "react-hot-toast";
import { FiSend }   from "react-icons/fi";

export default function ContactForm() {
  const [form, setForm]     = useState({ name: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    // TODO: Send via WhatsApp API / Email service / WP Contact Form 7
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Message sent! We'll reply on WhatsApp soon. 📩");
    setForm({ name: "", phone: "", message: "" });
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5">Your Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Karim Hossain"
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5">Phone / WhatsApp</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="01700-000000"
            className="input-field"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1.5">Message</label>
        <textarea
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Write your message or order inquiry here…"
          className="input-field resize-none"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full justify-center"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <FiSend />
        )}
        {loading ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
