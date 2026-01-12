import { Link } from "react-router-dom";
import { Dumbbell, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 bg-[#0f172a] text-white">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#f97316] flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold">SportHub</span>
          </div>

          {/* Copyright */}
          <p className="text-sm text-white/60">
            © 2025 SportHub. All rights reserved.
          </p>

          {/* Links */}
          <div className="flex items-center gap-6">
            <button className="text-sm text-white/60 hover:text-white transition-colors">
              Terms of Service
            </button>
            <button className="text-sm text-white/60 hover:text-white transition-colors">
              Privacy Policy
            </button>
            <button className="text-sm text-white/60 hover:text-white transition-colors">
              Contact
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
