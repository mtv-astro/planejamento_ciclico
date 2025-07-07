// src/components/ui/WhatsAppButton.tsx
import React from "react";

const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/5548996946958"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50"
    >
      <img
        src="/public/img/whatsapplogo2.png"
        alt="WhatsApp"
        className="w-20 h-20 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
      />
    </a>
  );
};

export default WhatsAppButton;
