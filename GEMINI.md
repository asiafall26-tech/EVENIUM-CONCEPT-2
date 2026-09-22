# Evenium - Guide de Projet & Instructions IA

Ce fichier sert de point de référence central pour comprendre le projet **Evenium**. Il est particulièrement destiné aux futurs assistants IA (comme Gemini) pour comprendre le contexte, l'architecture et les décisions prises jusqu'à présent.

## 🎯 Ce que fait l'application
**Evenium** est une plateforme digitale SaaS premium dédiée à l'organisation d'événements (mariages, séminaires, anniversaires, etc.). Elle met en relation deux types d'utilisateurs :
1. **Les Organisateurs (Clients)** : Qui planifient leurs événements de A à Z.
2. **Les Prestataires** : Qui proposent leurs services (traiteurs, photographes, salles, etc.) et gèrent leur activité.

La plateforme permet de centraliser la gestion d'un événement, du suivi du budget aux invitations, en passant par la communication directe avec les prestataires.

---

## ✨ Fonctionnalités implémentées (Front-End)

Toute l'interface utilisateur a été conçue de manière hautement interactive en utilisant des états React simulés côté client, sans base de données connectée pour le moment.

### 1. Espace Public & Auth
- Landing page vitrine avec présentation des offres.
- Pages de connexion et d'inscription modernes avec options sociales (Google/Apple).

### 2. Espace Organisateur (`/dashboard`)
- **Création d'événement** : Formulaire multi-étapes avec sélection de formule (Standard, Premium, Gold). Les informations clés et la formule sont verrouillées après simulation de paiement pour éviter la fraude.
- **Tableau de bord de l'événement (`/events/[id]`)** : Vue globale (Aperçu) avec raccourcis.
- **Checklist (`/events/[id]/checklist`)** : Page dédiée pour ajouter, supprimer et cocher des tâches avec une barre de progression dynamique.
- **Budget (`/events/[id]/budget`)** : Suivi financier avec jauges visuelles, ajout de dépenses et calcul automatique du reste à charge.
- **Prestataires (`/events/[id]/prestataires`)** : Catalogue et gestion des prestataires associés à l'événement. Distinction claire via des badges entre les prestataires certifiés ("Evenium") et externes ("Externe").
- **Invitations (`/events/[id]/invitations`)** : Sélection de modèles d'invitations (designs), édition de texte via modale et simulation d'envoi.
- **Messagerie Globale (`/dashboard/messages`)** : Interface de chat permettant d'envoyer et recevoir des messages des prestataires.
- **Paramètres (`/dashboard/settings`)** : Gestion du profil et de la facturation (ajout de cartes bancaires avec animation de sauvegarde).

### 3. Espace Prestataire (`/prestataire`)
- **Vue Globale** : Suivi des demandes de devis et statistiques rapides.
- **Finances (`/prestataire/finances`)** : Dashboard complet avec graphiques des revenus/dépenses. Possibilité d'**ajouter, modifier ou supprimer** une transaction de l'historique, avec mise à jour automatique des KPIs.
- **Catalogue & Devis** : Gestion des services offerts par le prestataire.
- **Planning** : Vue calendrier des événements confirmés.

### 4. Espace Admin (`/admin`)
- Interfaces de base pour gérer la plateforme globale (utilisateurs, finances SaaS).

---

## 📁 Structure des fichiers

Le projet suit l'architecture Next.js **App Router** (`/src/app`) :

```
src/
├── app/
│   ├── (auth)/             # Routes de connexion (login, signup)
│   ├── (public)/           # Routes publiques (landing page)
│   ├── admin/              # Espace Super Admin
│   ├── dashboard/          # Espace Organisateur (Client)
│   │   ├── events/[id]/    # Sous-routes spécifiques à un événement (budget, checklist, etc.)
│   │   ├── messages/       # Messagerie
│   │   └── settings/       # Paramètres globaux
│   ├── prestataire/        # Espace Prestataire (finances, catalogue, etc.)
│   ├── globals.css         # Styles globaux (Tailwind)
│   └── layout.tsx          # Root Layout
├── components/
│   ├── dashboard/          # Composants spécifiques (Sidebar, Nav)
│   ├── ui/                 # Composants réutilisables
│   └── layout/             # Layouts partagés
└── data/
    └── mock/               # Fichiers de données simulées (events.ts, etc.) pour remplacer la DB
```

---

## 🛠️ Technologies utilisées
- **Framework** : Next.js 14+ (App Router).
- **UI & Logique** : React (Client Components avec `use client`).
- **Style** : Tailwind CSS (Vanille, sans bibliothèques de composants lourdes).
- **Icônes** : Lucide React.
- **Déploiement cible** : Vercel (recommandé).

---

## 🎨 Décisions de Design
1. **Esthétique Premium** : Utilisation d'une charte graphique luxueuse (Noir, Blanc, Or `#D4AF37`). Les boutons, les cartes et les dégradés reflètent cette approche haut de gamme.
2. **Micro-interactions** : Le Front-End est conçu pour être "vivant". Utilisation intensive des états `useState` pour les modales, les toasters, et les barres de progression.
3. **Modales pour le CRUD** : Les actions de création, d'édition et de suppression (ex: Transactions, Cartes bancaires, Invitations) se font principalement via des modales (pop-ups) superposées pour éviter les rechargements de page.
4. **Client-Side Rendering (CSR)** : Actuellement, la plupart des vues du tableau de bord sont des composants clients (`"use client"`) pour permettre cette haute interactivité avec des données "mockées".

---

## 🤖 Instructions pour un futur modèle IA

Si vous (l'IA) lisez ce fichier lors d'une future session pour reprendre le développement du projet, voici les règles à suivre :

1. **Intégration Backend (Prochaine Phase)** : 
   - Le Front-End est validé. Votre objectif principal sera probablement de remplacer les `useState` locaux et le dossier `src/data/mock/` par de vrais appels API ou une base de données (ex: Supabase, PostgreSQL, Prisma).
   - Conservez l'UX actuelle (les modales, les chargements, les animations) lors de l'implémentation du backend. Gérez les états de chargement (`isLoading`) pendant les requêtes.

2. **Routage et Hooks** : 
   - Faites attention à l'App Router de Next.js. Si vous utilisez `useParams()`, n'oubliez pas d'envelopper l'utilisation dans le hook `use()` ou de respecter la signature des paramètres de page asynchrones selon la version de Next.js.

3. **Style** : 
   - Gardez l'esthétique premium intacte. Ne remplacez pas les couleurs personnalisées par des couleurs génériques de Tailwind. Continuez d'utiliser Lucide React pour les icônes.

4. **Compréhension du Métier** : 
   - Un "Événement" a un cycle de vie, un "Budget" défini par le client, et des "Prestataires" assignés.
   - Il faut maintenir la stricte étanchéité (routage et logique) entre l'espace `/dashboard` (Le Client payeur) et l'espace `/prestataire` (Le vendeur de services).
