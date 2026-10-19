/**
 * Utilitaire d'export et d'impression PDF pour les devis Evenium.
 * Génère un document A4 haute définition au design luxueux et épuré.
 */

import { categoryDetailsForDisplay } from "@/lib/devis/categories";
import { lineBreakdown, resolveDeposit, resolveDiscount } from "@/lib/devis/pricing";

interface DevisPrintData {
  devis: any;
  items?: any[];
  options?: any[];
  provider?: any;
  event?: any;
  client?: any;
}

const escapeHtml = (v: unknown) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function generateDevisHTML(data: DevisPrintData): string {
  const { devis } = data;
  const items = data.items || devis.devis_items || [];
  const options = data.options || devis.devis_options || [];
  const provider = data.provider || devis.profiles || {};
  const event = data.event || devis.events || {};
  const client = data.client || devis.clientProfile || {};

  const reference = devis.reference || `DEV-${(devis.id || '').substring(0, 8).toUpperCase()}`;
  const dateEmission = devis.date_emission 
    ? new Date(devis.date_emission).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : devis.created_at 
    ? new Date(devis.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('fr-FR');
  
  const dateValidite = devis.valid_until 
    ? new Date(devis.valid_until).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '30 jours après émission';

  const formatMoney = (val?: number | null) => {
    if (val === undefined || val === null || isNaN(val)) return '0 FCFA';
    return `${Number(val).toLocaleString('fr-FR')} FCFA`;
  };

  const statusLabel = devis.status === 'En attente de validation' 
    ? 'En attente' 
    : (devis.status || 'Devis');

  const statusBadgeColor = devis.status === 'Accepté'
    ? 'background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0;'
    : devis.status === 'Refusé'
    ? 'background: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA;'
    : 'background: #FFFBEB; color: #B45309; border: 1px solid #FDE68A;';

  const providerName = provider.company_name || provider.full_name || provider.name || 'Prestataire Evenium';
  const providerCategory = provider.category || provider.role || 'Prestataire Partenaire';
  const clientName = client.full_name || event.client_name || event.organizer_name || 'Client Evenium';
  
  const eventGuests = typeof event.guests === 'object' && event.guests !== null
    ? event.guests.total || event.guestsCount || '-'
    : event.guests || event.guestsCount || '-';

  const discountAmount = resolveDiscount(devis);
  const depositAmount = resolveDeposit(devis);
  const soldeRestant = Math.max(0, Number(devis.total || 0) - depositAmount);
  const taxAmount = Number(devis.tax_amount || 0);
  const cautionAmount = Number(devis.caution_amount || 0);
  const detailGroups = categoryDetailsForDisplay(devis.category_details);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Devis_${reference}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1a1a1a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 13px;
      line-height: 1.5;
    }
    .invoice-container {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      padding: 8px;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 2px solid #F3E8D0;
    }
    .logo-title {
      font-family: "Playfair Display", Georgia, "Times New Roman", serif;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 2px;
      color: #0F0D0B;
      text-transform: uppercase;
      margin: 0;
    }
    .logo-gold {
      color: #B8860B;
    }
    .logo-sub {
      font-size: 9px;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: #B8860B;
      font-weight: 600;
      margin-top: 2px;
    }
    .doc-meta {
      text-align: right;
    }
    .doc-type {
      font-family: "Playfair Display", Georgia, serif;
      font-size: 24px;
      font-weight: 700;
      color: #0F0D0B;
      margin: 0 0 4px 0;
    }
    .doc-ref {
      font-size: 14px;
      font-weight: 700;
      color: #B8860B;
      margin: 0 0 6px 0;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .parties-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 12px 0;
      margin-left: -12px;
      margin-right: -12px;
      margin-bottom: 24px;
    }
    .party-card {
      width: 50%;
      vertical-align: top;
      background: #FAF9F6;
      border: 1px solid #EFEAE0;
      border-radius: 12px;
      padding: 14px 16px;
    }
    .party-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #B8860B;
      margin: 0 0 8px 0;
      border-bottom: 1px solid #E8DFCF;
      padding-bottom: 4px;
    }
    .party-name {
      font-size: 15px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 4px 0;
    }
    .party-info {
      font-size: 12px;
      color: #4B5563;
      margin: 2px 0;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #E5E7EB;
    }
    .items-table th {
      background: #0F0D0B;
      color: #F8F5EE;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.75px;
      padding: 10px 14px;
      text-align: left;
      font-weight: 600;
    }
    .items-table td {
      padding: 10px 14px;
      border-bottom: 1px solid #F3F4F6;
      vertical-align: middle;
      font-size: 12.5px;
    }
    .items-table tbody tr:nth-child(even) {
      background-color: #FAFAFA;
    }
    .item-title {
      font-weight: 600;
      color: #111827;
    }
    .item-desc {
      font-size: 11px;
      color: #6B7280;
      margin-top: 2px;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    
    .financials-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .conditions-box {
      width: 55%;
      vertical-align: top;
      padding-right: 18px;
    }
    .totals-box {
      width: 45%;
      vertical-align: top;
    }
    .totals-table {
      width: 100%;
      border-collapse: collapse;
      background: #FAF9F6;
      border: 1px solid #EAE3D4;
      border-radius: 12px;
      overflow: hidden;
    }
    .totals-table td {
      padding: 8px 14px;
      font-size: 12px;
      color: #4B5563;
      border-bottom: 1px solid #EFEAE0;
    }
    .grand-total {
      background: #0F0D0B !important;
      color: #FFFFFF !important;
    }
    .grand-total td {
      padding: 12px 14px !important;
      border-bottom: none !important;
      color: #FFFFFF !important;
    }
    .grand-total-amount {
      font-size: 18px !important;
      font-weight: 700 !important;
      color: #E2B957 !important;
    }
    .info-card {
      background: #FFFDF9;
      border: 1px solid #EFEAE0;
      border-radius: 10px;
      padding: 12px 14px;
      margin-bottom: 12px;
    }
    .info-card-title {
      font-size: 11px;
      font-weight: 700;
      color: #B8860B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 6px 0;
    }
    .signature-area {
      width: 100%;
      border-collapse: collapse;
      margin-top: 24px;
      margin-bottom: 20px;
    }
    .sig-block {
      width: 50%;
      vertical-align: top;
      padding: 12px 16px;
      border: 1px dashed #D1D5DB;
      border-radius: 8px;
      background: #FCFCFC;
      height: 90px;
    }
    .sig-title {
      font-size: 11px;
      font-weight: 700;
      color: #6B7280;
      margin-bottom: 4px;
    }
    .footer {
      border-top: 1px solid #E5E7EB;
      padding-top: 14px;
      margin-top: 20px;
      text-align: center;
      font-size: 10.5px;
      color: #9CA3AF;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    
    <!-- EN-TÊTE OFFICIEL -->
    <table class="header-table">
      <tr>
        <td style="vertical-align: middle;">
          <h1 class="logo-title">EVEN<span class="logo-gold">IUM</span></h1>
          <div class="logo-sub">Conciergerie & Événements de Prestige</div>
        </td>
        <td class="doc-meta" style="vertical-align: middle;">
          <div class="doc-type">PROPOSITION DE DEVIS</div>
          <div class="doc-ref">N° ${reference}</div>
          <span class="status-badge" style="${statusBadgeColor}">${statusLabel}</span>
          <div style="font-size: 11.5px; color: #6B7280; margin-top: 6px;">
            Émis le : <strong>${dateEmission}</strong><br/>
            Valable jusqu'au : <strong>${dateValidite}</strong>
          </div>
        </td>
      </tr>
    </table>

    <!-- PARTIES (PRESTATAIRE & CLIENT / EVENEMENT) -->
    <table class="parties-table">
      <tr>
        <td class="party-card">
          <div class="party-title">Émetteur / Prestataire</div>
          <div class="party-name">${providerName}</div>
          <div class="party-info"><strong>Spécialité :</strong> ${providerCategory}</div>
          ${provider.email ? `<div class="party-info"><strong>Email :</strong> ${provider.email}</div>` : ''}
          ${provider.phone ? `<div class="party-info"><strong>Téléphone :</strong> ${provider.phone}</div>` : ''}
          ${provider.zone ? `<div class="party-info"><strong>Zone d'activité :</strong> ${provider.zone}</div>` : ''}
          <div class="party-info" style="color: #B8860B; font-weight: 600; margin-top: 4px;">
            ★ Prestataire Partenaire Agréé Evenium
          </div>
        </td>
        <td class="party-card">
          <div class="party-title">Destinataire / Événement</div>
          <div class="party-name">${event.name || "Événement Privé"}</div>
          <div class="party-info"><strong>Client / Organisateur :</strong> ${clientName}</div>
          <div class="party-info"><strong>Type :</strong> ${escapeHtml(devis.event_type || event.type || 'Événement')}</div>
          ${(devis.event_date || event.date) ? `<div class="party-info"><strong>Date prévue :</strong> ${escapeHtml(devis.event_date || event.date)} ${event.time ? `à ${event.time}` : ''}</div>` : ''}
          ${(devis.event_location || event.location) ? `<div class="party-info"><strong>Lieu :</strong> ${escapeHtml(devis.event_location || event.location)}</div>` : ''}
          <div class="party-info"><strong>Nombre de convives :</strong> ${eventGuests}</div>
        </td>
      </tr>
    </table>

    ${(devis.service_name || devis.description || detailGroups.length) ? `
      <div class="info-card" style="margin-bottom: 20px;">
        <div class="info-card-title">Proposition${devis.service_name ? ` · ${escapeHtml(devis.service_name)}` : ''}</div>
        ${devis.description ? `<div style="font-size: 11.5px; color: #374151; white-space: pre-wrap; margin-bottom: 8px;">${escapeHtml(devis.description)}</div>` : ''}
        ${detailGroups.map((g) => `
          <div style="font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #8f6f33; margin: 8px 0 4px;">${escapeHtml(g.label)}</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            ${g.rows.map((r) => `<tr><td style="padding: 2px 0; color: #6B7280; width: 40%;">${escapeHtml(r.label)}</td><td style="padding: 2px 0; color: #111827; font-weight: 600;">${escapeHtml(r.value)}</td></tr>`).join('')}
          </table>`).join('')}
      </div>
    ` : ''}

    <!-- TABLEAU DES PRESTATIONS -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 45%;">Prestation & Description</th>
          <th class="text-center" style="width: 15%;">Quantité</th>
          <th class="text-right" style="width: 20%;">Prix unitaire</th>
          <th class="text-right" style="width: 20%;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${items.length === 0 ? `
          <tr>
            <td colspan="4" class="text-center" style="padding: 24px; color: #9CA3AF;">
              Prestation globale selon accord convenu
            </td>
          </tr>
        ` : items.map((it: any) => `
          <tr>
            <td>
              <div class="item-title">${it.designation || it.name || 'Prestation'}</div>
              ${it.description ? `<div class="item-desc">${escapeHtml(it.description)}</div>` : ''}
              ${it.pricing_mode ? `<div class="item-desc" style="color: #8f6f33;">${escapeHtml(lineBreakdown(it))}</div>` : ''}
            </td>
            <td class="text-center font-medium">${it.pricing_mode === 'forfait' ? 'Forfait' : `${it.quantity || 1}${it.unit && it.unit !== 'Forfait' ? ` ${escapeHtml(it.unit)}` : ''}`}</td>
            <td class="text-right">${formatMoney(it.unit_price || it.price)}</td>
            <td class="text-right font-bold" style="color: #111;">${formatMoney(it.total || ((it.quantity || 1) * (it.unit_price || it.price || 0)))}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- OPTIONS ET INCLUSIONS (SI PRÉSENTES) -->
    ${options.length > 0 ? `
      <div class="info-card" style="margin-bottom: 20px;">
        <div class="info-card-title">Options, Frais complémentaires et Inclusions</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11.5px;">
          ${options.map((opt: any) => `
            <tr>
              <td style="padding: 4px 0; color: #374151;">
                ${opt.is_included ? '✓' : '•'} <strong>${opt.name || opt.title}</strong>
              </td>
              <td class="text-right" style="padding: 4px 0; font-weight: 600; color: ${opt.is_included ? '#047857' : '#1F2937'};">
                ${opt.is_included ? 'INCLUS' : formatMoney(opt.price)}
              </td>
            </tr>
          `).join('')}
        </table>
      </div>
    ` : ''}

    <!-- SYNTHÈSE FINANCIÈRE & CONDITIONS -->
    <table class="financials-table">
      <tr>
        <td class="conditions-box">
          <div class="info-card">
            <div class="info-card-title">Conditions de règlement</div>
            <div style="font-size: 12px; color: #374151; line-height: 1.6;">
              ${depositAmount ? `
                <div>• <strong>Acompte de réservation :</strong> ${formatMoney(depositAmount)}</div>
                <div>• <strong>Solde restant :</strong> ${formatMoney(soldeRestant)} (dû selon échéancier)</div>
              ` : `
                <div>• Règlement selon modalités contractuelles de la plateforme Evenium.</div>
              `}
              ${cautionAmount > 0 ? `<div>• <strong>Caution (restituée, hors total) :</strong> ${formatMoney(cautionAmount)}</div>` : ''}
              <div style="margin-top: 4px;">• Validité ferme du devis : <strong>${dateValidite}</strong></div>
            </div>
          </div>

          ${devis.notes ? `
            <div class="info-card" style="margin-top: 10px;">
              <div class="info-card-title">Notes du prestataire</div>
              <div style="font-size: 11.5px; color: #4B5563; white-space: pre-wrap;">${devis.notes}</div>
            </div>
          ` : ''}
        </td>

        <td class="totals-box">
          <table class="totals-table">
            <tr>
              <td>Sous-total prestations</td>
              <td class="text-right font-medium">${formatMoney(devis.subtotal || devis.total)}</td>
            </tr>
            ${devis.extra_fees > 0 ? `
              <tr>
                <td>Frais annexes & déplacement</td>
                <td class="text-right font-medium">+${formatMoney(devis.extra_fees)}</td>
              </tr>
            ` : ''}
            ${discountAmount > 0 ? `
              <tr style="color: #047857;">
                <td>Remise exceptionnelle</td>
                <td class="text-right font-bold">-${formatMoney(discountAmount)}</td>
              </tr>
            ` : ''}
            ${taxAmount > 0 ? `
              <tr>
                <td>TVA (${Number(devis.tax_rate || 0)} %)</td>
                <td class="text-right font-medium">+${formatMoney(taxAmount)}</td>
              </tr>
            ` : ''}
            <tr class="grand-total">
              <td style="font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">TOTAL NET TTC</td>
              <td class="text-right grand-total-amount">${formatMoney(devis.total)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- SIGNATURES -->
    <table class="signature-area">
      <tr>
        <td class="sig-block" style="margin-right: 10px;">
          <div class="sig-title">Cachet / Signature du Prestataire :</div>
          <div style="font-size: 11px; color: #9CA3AF; margin-top: 36px;">Signé électroniquement via Evenium</div>
        </td>
        <td style="width: 20px;"></td>
        <td class="sig-block">
          <div class="sig-title">Mention "Bon pour accord" & Signature Client :</div>
          <div style="font-size: 11px; color: #9CA3AF; margin-top: 36px;">Date et signature du client</div>
        </td>
      </tr>
    </table>

    <!-- PIED DE PAGE -->
    <div class="footer">
      Evenium • Plateforme SaaS d'Organisation et de Conciergerie Événementielle Haut de Gamme.<br/>
      Ce devis constitue un engagement contractuel sous réserve d'acceptation mutuelle et du versement de l'acompte convenu.
    </div>

  </div>
</body>
</html>`;
}

/**
 * Lance l'impression/sauvegarde PDF via un iframe isolé pour garantir un résultat A4 parfait sans polluer la page.
 */
export function printDevisDocument(data: DevisPrintData): Promise<void> {
  return new Promise((resolve) => {
    const reference = data.devis?.reference || `DEV-${(data.devis?.id || '').substring(0, 8).toUpperCase()}`;
    const previousTitle = document.title;
    
    // Définir le titre du document pour que le nom de fichier PDF suggéré par le navigateur soit impeccable
    document.title = `Devis-${reference}`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    iframe.title = `Devis-${reference}`;

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.title = previousTitle;
      window.print();
      resolve();
      return;
    }

    const htmlContent = generateDevisHTML(data);
    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Attente du rendu complet des polices et styles
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.error("Print error inside iframe:", e);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          document.title = previousTitle;
          resolve();
        }, 1200);
      }
    }, 450);
  });
}
