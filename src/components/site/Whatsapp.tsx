import { MessageCircle } from "lucide-react";

export const WHATSAPP_NUMBER = "2348161300992"; // +234 8161300992

export function WhatsappFloat() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello EMEEBS Ventures, I'd like to make an enquiry.")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 group"
    >
      <span className="absolute inset-0 rounded-full bg-emerald animate-ping opacity-30" />
      <span className="relative flex items-center gap-2 rounded-full bg-emerald hover:bg-emerald-light text-white pl-4 pr-5 py-3.5 shadow-premium transition-all">
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline text-sm font-semibold">Chat with us</span>
      </span>
    </a>
  );
}
