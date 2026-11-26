"use client";

import React, { useState } from "react";
import { CreditCard, Lock, ShieldCheck } from "lucide-react";

export interface CreditCardData {
  cardHolder: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
}

interface CreditCardFieldsProps {
  cardData: CreditCardData;
  onChange: (data: CreditCardData) => void;
  error?: string | null;
  compact?: boolean;
}

export function validateCreditCard(data: CreditCardData): string | null {
  if (!data.cardHolder.trim()) {
    return "Veuillez renseigner le nom figurant sur la carte bancaire.";
  }
  const cleanNumber = data.cardNumber.replace(/\s+/g, "");
  if (!/^\d{16}$/.test(cleanNumber)) {
    return "Le numéro de carte doit comporter 16 chiffres.";
  }
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(data.cardExpiry)) {
    return "La date d'expiration doit être au format MM/AA valide (ex: 08/28).";
  }
  // Check if expiry is in the past
  const [expMonth, expYear] = data.cardExpiry.split("/").map(Number);
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    return "Cette carte bancaire a expiré.";
  }
  if (!/^\d{3,4}$/.test(data.cardCvc)) {
    return "Le code de sécurité CVC doit comporter 3 chiffres (ou 4 pour Amex).";
  }
  return null;
}

export default function CreditCardFields({
  cardData,
  onChange,
  error,
  compact = false,
}: CreditCardFieldsProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(" ") || raw;
    onChange({ ...cardData, cardNumber: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length > 2) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    onChange({ ...cardData, cardExpiry: raw });
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    onChange({ ...cardData, cardCvc: raw });
  };

  return (
    <div className={`space-y-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-50/40 via-white to-gray-50 border border-[#b8924a]/30 transition-all ${compact ? 'text-xs' : ''}`}>
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#b8924a]/10 text-[#8f6f33] flex items-center justify-center">
            <CreditCard size={15} />
          </div>
          <div>
            <h5 className="font-serif font-bold text-gray-900 text-xs sm:text-sm">
              Coordonnées de la Carte Bancaire
            </h5>
            <p className="text-[10px] text-gray-400">Visa, Mastercard, American Express</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <Lock size={10} />
          <span>SSL 256-bit</span>
        </div>
      </div>

      {error && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] leading-tight">
          {error}
        </div>
      )}

      {/* Nom du titulaire */}
      <div>
        <label className="block text-[11px] font-medium text-gray-700 mb-1">
          Nom complet sur la carte
        </label>
        <input
          type="text"
          value={cardData.cardHolder}
          onChange={(e) => onChange({ ...cardData, cardHolder: e.target.value })}
          onFocus={() => setFocusedField("holder")}
          onBlur={() => setFocusedField(null)}
          placeholder="Ex: AMADOU NDIAYE"
          autoComplete="cc-name"
          className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 uppercase placeholder:normal-case placeholder:text-gray-400 focus:border-[#b8924a] focus:ring-1 focus:ring-[#b8924a] outline-none transition"
        />
      </div>

      {/* Numéro de carte */}
      <div>
        <label className="block text-[11px] font-medium text-gray-700 mb-1">
          Numéro de carte (16 chiffres)
        </label>
        <div className="relative">
          <input
            type="tel"
            inputMode="numeric"
            value={cardData.cardNumber}
            onChange={handleCardNumberChange}
            onFocus={() => setFocusedField("number")}
            onBlur={() => setFocusedField(null)}
            placeholder="4000 1234 5678 9010"
            autoComplete="cc-number"
            className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-mono tracking-widest text-gray-900 placeholder:text-gray-400 focus:border-[#b8924a] focus:ring-1 focus:ring-[#b8924a] outline-none transition pr-10"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <ShieldCheck size={16} className={cardData.cardNumber.replace(/\s+/g, "").length === 16 ? "text-emerald-600" : "text-gray-300"} />
          </div>
        </div>
      </div>

      {/* Date d'expiration & CVC */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-medium text-gray-700 mb-1">
            Expiration (MM/AA)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={cardData.cardExpiry}
            onChange={handleExpiryChange}
            onFocus={() => setFocusedField("expiry")}
            onBlur={() => setFocusedField(null)}
            placeholder="08/28"
            autoComplete="cc-exp"
            maxLength={5}
            className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-mono text-center text-gray-900 placeholder:text-gray-400 focus:border-[#b8924a] focus:ring-1 focus:ring-[#b8924a] outline-none transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-gray-700 mb-1">
            Code CVC / CVV
          </label>
          <input
            type="password"
            inputMode="numeric"
            value={cardData.cardCvc}
            onChange={handleCvcChange}
            onFocus={() => setFocusedField("cvc")}
            onBlur={() => setFocusedField(null)}
            placeholder="123"
            autoComplete="cc-csc"
            maxLength={4}
            className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-mono text-center text-gray-900 placeholder:text-gray-400 focus:border-[#b8924a] focus:ring-1 focus:ring-[#b8924a] outline-none transition"
          />
        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-center pt-1">
        Transactions sécurisées et chiffrées selon la norme bancaire PCI-DSS.
      </p>
    </div>
  );
}
