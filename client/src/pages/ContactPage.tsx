/*
 * GADGET STYLE — Contact Page
 * Lumina Design: Clean form with glassmorphism
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Mail, MessageSquare, Send } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you within 48 hours.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
              <MessageSquare className="w-3.5 h-3.5" />
              Get in Touch
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold font-display mb-3">Contact Us</h1>
            <p className="text-muted-foreground">
              Have a question, partnership inquiry, or product suggestion? We'd love to hear from you.
            </p>
          </div>

          <div className="glass-card p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary transition-colors"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary transition-colors"
                  placeholder="What's this about?"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Tell us more..."
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Send Message
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">Or reach us directly at</p>
            <a href="mailto:hello@gadgetstyle.com.au" className="inline-flex items-center gap-2 text-primary hover:underline">
              <Mail className="w-4 h-4" />
              hello@gadgetstyle.com.au
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
