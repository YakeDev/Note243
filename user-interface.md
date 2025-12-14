# Note243 — Documentation de l’Espace Utilisateur

## 1. Introduction
L’espace Utilisateur est l’interface destinée au grand public. Il permet de rechercher des établissements, consulter des avis, publier des retours d’expérience, gérer son profil et interagir avec les contenus de la plateforme Note243.  
Il a été conçu pour être simple, rapide et mobile-first.

---

## 2. Structure générale de l’Espace Utilisateur

### 2.1 Page d’accueil
Contenu :
- Barre de recherche (nom, catégorie, quartier)
- Suggestions d’établissements populaires
- Boutons rapides pour les catégories (restaurants, cliniques, services, boutiques…)
- CTA : “Laisser un avis”
- Mode sombre (si activé)

Fonctions clés :
- Accès rapide aux catégories
- Navigation fluide mobile-first
- Résultats instantanés (pré-remplissage)

---

## 3. Recherche d’établissements

### 3.1 Fonctions de recherche
- Recherche par texte (nom de l’établissement)
- Recherche par catégorie
- Recherche par quartier (si disponible)
- Filtres avancés :  
  - Note minimum  
  - Établissements certifiés  
  - Popularité  

### 3.2 Résultats de recherche
Chaque établissement s’affiche avec :
- Nom  
- Note moyenne (étoiles)  
- Catégorie  
- Quartier/adresse  
- Nombre d’avis  
- Badge “certifié” si applicable

---

## 4. Fiche d’établissement

### 4.1 Informations affichées
La fiche met en avant :
- Nom, catégorie et description  
- Localisation (Google Maps)  
- Numéro de téléphone  
- Horaires d’ouverture  
- Photos / galerie  
- Note globale  
- Avis récents  
- Bouton “Laisser un avis”  

### 4.2 Actions utilisateur
- Lire les avis  
- Filtrer les avis (récents, positifs, négatifs)  
- Ajouter aux favoris  
- Signaler un avis  
- Voir le profil entreprise (si revendiqué)

---

## 5. Gestion des avis utilisateurs

### 5.1 Publier un avis
Actions possibles :
- Sélectionner une note (1 à 5 étoiles)
- Rédiger un commentaire court (ex : 200 caractères)
- Publier l’avis

Cas particulier :
- Si l’utilisateur n’est pas connecté → redirection vers Connexion/Inscription

### 5.2 Modifier un avis
- L’utilisateur peut mettre à jour son commentaire
- Peut ajuster la note
- Historique non public conservé côté système

### 5.3 Supprimer un avis
- Suppression définitive par l’utilisateur
- L’établissement perd ce point dans sa note globale

---

## 6. Favoris

### 6.1 Ajouter un établissement aux favoris
- Depuis les résultats de recherche
- Depuis une fiche établissement

### 6.2 Gérer les favoris
- Voir la liste complète
- Accès rapide aux établissements favoris
- Retirer un élément de la liste

---

## 7. Signalement d’avis
Fonction destinée à garantir la qualité et la sécurité des contenus.

L’utilisateur peut :
- Signaler un avis inapproprié  
- Préciser la raison (insulte, faux avis, spam, conflit d’intérêt…)  
- Voir le statut du signalement (optionnel, selon version)

---

## 8. Authentification (Connexion / Inscription)

### 8.1 Inscription
Méthodes disponibles :
- Email  
- Téléphone (optionnel)  

Données demandées :
- Nom  
- Email ou numéro  
- Mot de passe  

### 8.2 Connexion
- Email + mot de passe  
- Récupération du mot de passe oublié  

### 8.3 Déconnexion

---

## 9. Profil Utilisateur

### 9.1 Informations personnelles
- Nom  
- Photo de profil  
- Email  
- Numéro (optionnel)  
- Date d’inscription  

### 9.2 Historique d’activité
- Mes avis  
- Mes modifications  
- Mes établissements favoris  
- Mes signalements effectués (optionnel)

### 9.3 Paramètres
- Modifier les informations personnelles  
- Modifier le mot de passe  
- Activer/désactiver mode sombre  
- Choisir langue :  
  - Français  
  - Swahili  

### 9.4 Suppression de compte
- Suppression définitive depuis les paramètres  
- Suppression des données personnelles selon RGPD local

---

## 10. Notifications Utilisateur (optionnel selon MVP)
- Notification d’une réponse d’entreprise  
- Notification d’un badge obtenu  
- Notification d’un nouvel avis dans un favori  

Méthodes possibles :
- Email  
- SMS (futur)  

---

## 11. Expérience Mobile First
Tous les écrans sont optimisés pour :
- Smartphones Android / iPhone  
- Navigation rapide  
- Grands boutons et zones cliquables  
- Temps de parcours minimal pour publier un avis (3 étapes max)

---

## 12. Récapitulatif des fonctionnalités Utilisateur

| Domaine | Fonctionnalités |
|---------|----------------|
| Navigation | Accueil, Recherche, Catégories |
| Établissements | Voir fiche, appeler, consulter carte |
| Avis | Lire, filtrer, publier, modifier, supprimer |
| Signalements | Signaler un avis suspect |
| Favoris | Ajouter, consulter, retirer |
| Profil | Gérer informations, voir activité |
| Authentification | Connexion, inscription, logout |
| Paramètres | Mot de passe, langue, mode sombre |

