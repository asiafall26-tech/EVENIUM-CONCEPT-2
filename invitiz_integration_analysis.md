# Analyse Stratégique : Intégration du système "Invitiz" dans Evenium (Option B)

## 1. L'Expérience Utilisateur (Le "Flow" Option B)
L'objectif est d'utiliser la psychologie pour augmenter les ventes : le client crée son invitation de A à Z avant de payer, ce qui crée un attachement.

**Phase 1 : Découverte & Création (Avant paiement)**
- L'utilisateur remplit les informations de base (Étape 1).
- Il choisit son Pack (Premium/Gold) et le format (Carte/Animée) (Étape 2).
- Il choisit son modèle graphique (Étape 3). **C'est ici qu'on intègre l'édition !** Lorsqu'il clique sur un modèle, il peut modifier le texte (Titre, Message) directement.
- Il prévisualise son invitation parfaite avec **ses propres informations**.

**Phase 2 : Le Verrou (Paiement)**
- À l'étape 4 (Récapitulatif), on lui indique clairement : *"Votre invitation est prête ! Validez votre commande pour générer le lien de partage."*
- Il valide (Étape 5 - Paiement).

**Phase 3 : Le Dashboard & Partage (Après paiement)**
- Il arrive sur son Dashboard (`/dashboard/events/[id]/invitations`).
- L'invitation est déjà faite. Le lien unique (`evenium.app/invite/ID`) est généré et débloqué.
- Il n'a plus qu'à cliquer sur **"Partager sur WhatsApp"**.
- (Il garde bien sûr la possibilité de corriger une faute de frappe s'il le souhaite).

## 2. Adaptation sans casser l'existant
Pour intégrer cela **sans rien gâcher** du code actuel :

1. **Le Contexte de création (`EventCreationContext.tsx`)** : Nous allons juste ajouter les champs `invitationTitle` et `invitationMessage` dans le "store" actuel. Ainsi, les données voyagent d'une étape à l'autre sans casser le tunnel existant.
2. **L'Étape 3 (`create/step-3/page.tsx`)** : Au lieu d'une simple image de prévisualisation, nous ajouterons les champs de texte dans le modal pour que l'utilisateur saisisse son message avant de passer à l'étape 4.
3. **Le Dashboard Invitation (`/dashboard/events/[id]/invitations`)** : Au lieu d'avoir un gros formulaire vide, il affichera directement le lien à partager (puisque le texte a déjà été rempli).
4. **Base de données** : Nous allons ajouter une table `guests` pour recueillir les réponses (RSVP) des invités qui cliqueront sur le lien.

## 3. Plan d'Action Technique (Dans l'ordre)

Voici l'ordre exact de développement pour ne pas se perdre :

*   **Étape 1 : Le Store & L'Étape 3** 
    Modifier `EventCreationContext` et `step-3` pour permettre au client de rédiger son invitation avant de payer.
*   **Étape 2 : Sauvegarde dans Supabase** 
    S'assurer que lors de la création finale (l'étape de paiement), le texte de l'invitation est bien enregistré dans la table `events`.
*   **Étape 3 : Le Dashboard Invitation & Invités** 
    Créer le fameux lien de partage dans le Dashboard et créer l'onglet pour voir les invités (RSVP).
*   **Étape 4 : Le Mini-site Public (`/invite/[id]`)** 
    Créer la belle page où les invités verront l'invitation finale et cliqueront sur "Oui, je serai présent".
