# Evenium - Master Plan de Reconstruction (V2)

Ce fichier est le guide de référence absolu (Master Prompt) pour recréer le projet **Evenium** de zéro. L'objectif est de repartir sur des bases saines (sans code "mélangé") tout en préservant **toutes les fonctionnalités existantes** et l'esthétique premium de la plateforme.

---

## 🎯 1. Vision et Objectif du Projet
**Evenium** est une plateforme digitale SaaS premium de mise en relation et de gestion d'événements (mariages, séminaires, etc.).
*   **Clients (Organisateurs)** : Planifient leur événement (budget, checklist, prestataires, invitations).
*   **Prestataires** : Gèrent leur activité (finances, devis, calendrier, catalogue).

**Design System Exigé :**
*   **Couleurs :** Noir profond, Blanc pur, et Or (`#D4AF37`).
*   **Style :** Minimaliste, luxueux, moderne.
*   **Interactions :** Très vivant (micro-animations, modales superposées pour éviter les rechargements, notifications/toasters).

---

## 🛠️ 2. Stack Technique à Initialiser
*   **Framework :** Next.js 14+ (App Router strict : `src/app`).
*   **Langage :** TypeScript.
*   **Style :** Tailwind CSS (vanille, pas de bibliothèques tierces complexes qui surchargent le code).
*   **Icônes :** `lucide-react`.
*   **Backend / DB :** Supabase (Authentification + Base de données PostgreSQL).

---

## 🗺️ 3. Architecture des Dossiers (À respecter strictement)
Le nouveau projet devra suivre cette structure claire :
```text
src/
├── app/
│   ├── (auth)/             # /login, /signup
│   ├── (public)/           # / (Landing page)
│   ├── admin/              # Espace Super Admin
│   ├── dashboard/          # Espace Client (Organisateur)
│   │   ├── events/[id]/    # Sous-routes: /budget, /checklist, /prestataires, /invitations
│   │   ├── messages/       # Messagerie
│   │   └── settings/       # Paramètres
│   ├── prestataire/        # Espace Prestataire
│   │   ├── finances/       # CA, Graphiques, Transactions
│   │   ├── catalogue/      # Services offerts
│   │   └── planning/       # Calendrier
│   ├── globals.css         # Thème et variables CSS (Or, Noir, Blanc)
│   └── layout.tsx          # Root Layout
├── components/
│   ├── ui/                 # Boutons, Modales, Inputs (Design System de base)
│   ├── layout/             # Sidebars, Navbars partagées
│   ├── dashboard/          # Composants spécifiques au client
│   └── prestataire/        # Composants spécifiques au prestataire
└── lib/
    └── supabase/           # Clients Supabase (browser, server, middleware)
```

---

## 🚀 4. Plan de Reconstruction Étape par Étape

**IMPORTANT POUR L'IA :** N'essayez pas de tout coder d'un coup. Suivez ces étapes une par une en validant chaque phase avec l'utilisateur.

### Étape 1 : Fondation et Design System
1. Initialiser le projet Next.js avec Tailwind.
2. Configurer `globals.css` avec la palette de couleurs (Noir, Blanc, Or `#D4AF37`).
3. Créer les composants UI de base : `Button` (avec variantes "primary gold", "outline", "ghost"), `Modal` (réutilisable avec animation d'ouverture), `Input`, et `Card`.
4. Configurer Supabase (variables d'environnement, client).

### Étape 2 : Authentification & Landing Page
1. Créer la Landing Page (vitrine) avec une esthétique premium.
2. Implémenter les pages `/login` et `/signup`.
3. Mettre en place le middleware Supabase pour protéger les routes (`/dashboard` et `/prestataire`).

### Étape 3 : Layouts Principaux
1. Créer le `Sidebar` et le `Header` pour le `/dashboard` (Client).
2. Créer le `Sidebar` et le `Header` pour le `/prestataire` (avec des liens différents).
3. S'assurer de l'étanchéité absolue entre ces deux espaces.

### Étape 4 : Développement de l'Espace Organisateur (Client)
*À implémenter en utilisant le Client-Side Rendering (`"use client"`) pour une grande interactivité, connecté ensuite à Supabase.*
1. **Création d'événement :** Formulaire multi-étapes (Type, Date, Formule Standard/Premium/Gold).
2. **Dashboard Événement (`/events/[id]`) :** Aperçu global.
3. **Checklist :** Ajout/Suppression de tâches avec barre de progression dynamique en Or.
4. **Budget :** Ajout de dépenses, jauges visuelles, calcul du reste à charge.
5. **Prestataires :** Liste avec distinction (Badges "Evenium" vs "Externe").
6. **Invitations :** Édition via modale et simulation d'envoi.

### Étape 5 : Développement de l'Espace Prestataire
1. **Finances (`/finances`) :** Dashboard avec graphiques, CRUD (Créer, Lire, Mettre à jour, Supprimer via Modale) sur l'historique des transactions.
2. **Catalogue & Devis :** Gestion des offres du prestataire.
3. **Planning :** Vue calendrier des réservations.

### Étape 6 : Fonctionnalités Transverses
1. **Messagerie :** Interface de chat (Client <-> Prestataire).
2. **Paramètres :** Profil et gestion de la facturation (ex: interface de cartes bancaires).

---

## 🛑 5. Règles d'Or pour le Code (Guidelines)
1. **Zéro rechargement :** Utilisez des `Modales` pour toute action de création ou modification (ex: Ajouter une transaction, Créer une invitation).
2. **Micro-interactions :** Ajoutez toujours des `toast` (notifications) après une action, et gérez les états de chargement (`isLoading` sur les boutons).
3. **Propreté :** Séparez bien la logique métier des composants visuels. Si un fichier dépasse 300 lignes, divisez-le en sous-composants dans un dossier dédié.
