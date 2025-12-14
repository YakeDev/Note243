# Note243 — Documentation de l’Interface Administrateur

## 1. Introduction
L’interface Administrateur de Note243 est un espace sécurisé permettant de superviser l’ensemble du système : gestion des entreprises, modération des avis, traitement des signalements, organisation des catégories, suivi des utilisateurs et contrôle de la qualité des données. Elle constitue l’outil central de gouvernance de la plateforme.

---

## 2. Structure générale de l’interface Admin

### 2.1 Tableau de bord (Dashboard)
Le tableau de bord fournit une vue globale de l’activité du système :
- Nombre total d’établissements enregistrés  
- Nombre total d’avis publiés  
- Nombre de signalements en attente  
- Revendications d’établissements à valider  
- Comptes entreprises en attente de validation  
- Statistiques globales (avis récents, notes moyennes, tendances)

---

## 3. Gestion des établissements (Entreprises / Services / Produits)

### 3.1 Ajouter un établissement
L’administrateur peut créer manuellement :
- Une entreprise  
- Un service  
- Un commerce  
- Un produit (pour les entreprises qui en proposent)  

Données à remplir :
- Nom de l’établissement  
- Catégorie  
- Adresse  
- Numéro de téléphone  
- Description  
- Horaires  
- Localisation (carte)  
- Images / Logo  
- Type : entreprise / service / produit  
- Statut : actif, inactif ou certifié

### 3.2 Modifier un établissement
- Mise à jour des informations générales  
- Modification des images, horaires, description  
- Changement de propriétaire (si revendication acceptée)

### 3.3 Supprimer ou suspendre un établissement
- Suppression définitive (administration uniquement)  
- Suspension temporaire pour non-conformité

---

## 4. Gestion des revendications de fiches
Fonction permettant aux entreprises de prouver la propriété de leur fiche.

L’admin peut :
- Voir les revendications en attente  
- Vérifier les documents (RCCM, patente…)  
- Valider la revendication  
- Refuser la revendication  
- Attribuer automatiquement le badge “Note243 certifié”

---

## 5. Gestion des comptes Entreprises

### 5.1 Valider les nouveaux comptes
- Vérification des informations fournies  
- Activation ou rejet du compte  
- Assignation du rôle “owner”

### 5.2 Suspendre un compte entreprise
- Suspension temporaire  
- Suspension définitive  
- Historique des sanctions

---

## 6. Gestion des avis (Modération)

### 6.1 Liste des avis
- Filtrer par établissement, utilisateur, date ou note  
- Tri par avis signalés en priorité

### 6.2 Actions de modération
- Supprimer un avis  
- Masquer un avis  
- Restaurer un avis  
- Marquer un avis comme “suspect”

### 6.3 Publier un avis (fonction interne)
L’administrateur peut ajouter un avis manuel :
- Pour tester le système  
- Pour créer des données initiales  
- Pour corriger des erreurs

---

## 7. Gestion des signalements
Lorsqu’un utilisateur signale un avis, l’administrateur peut :
- Lire le commentaire signalé  
- Voir la raison du signalement  
- Statuer :  
  - Avis justifié → supprimer  
  - Avis douteux → masquer  
  - Avis valide → rejeter le signalement  
- Consulter l’historique des signalements

---

## 8. Gestion des catégories d’établissement

### 8.1 Créer une catégorie
- Nom  
- Description  
- Icône / image

### 8.2 Modifier une catégorie
### 8.3 Supprimer une catégorie (si non utilisée)
### 8.4 Gérer des sous-catégories (optionnel)
Exemples :  
- Restaurants → Fast-food, Grillades, Pizzerias  
- Services → Photocopies, Pressing, Transport

---

## 9. Gestion des utilisateurs (grand public)

### 9.1 Voir tous les utilisateurs
Filtres :
- Par date d’inscription  
- Par activité  
- Par nombre d’avis  
- Par signalements reçus

### 9.2 Suspendre un utilisateur
- Suspension temporaire  
- Suspension définitive  
- Historique des sanctions

### 9.3 Restaurer un utilisateur

---

## 10. Outils internes d’administration

### 10.1 Paramètres du système
- Logo et couleurs  
- Configuration de l’emailing (notifs de nouveaux avis, de validation…)  
- Textes légaux (conditions, politique de confidentialité)  
- Gestion des périodes de maintenance

### 10.2 Gestion des administrateurs
- Ajouter un admin  
- Supprimer un admin  
- Rôles :  
  - Super Admin  
  - Modérateur  
  - Administrateur technique

### 10.3 Journal d’audit (Audit Log)
- Historique des actions de modération  
- Historique des connexions administrateurs  
- Modifications effectuées dans le système

---

## 11. Système d’authentification
- Connexion sécurisée (email + mot de passe)  
- Double authentification (optionnel)  
- Gestion des rôles et permissions

---

## 12. Fonctionnalités futures possibles
- Gestion des abonnements premium des entreprises  
- Notifications SMS pour entreprises  
- Statistiques avancées (heatmaps, analyses d’avis, tendances IA)  
- Système anti-faux avis (IA + scoring comportemental)

---

## 13. Résumé des responsabilités de l’administrateur
| Domaine | Actions principales |
|--------|---------------------|
| Etablissements | Ajouter, modifier, supprimer, certifier |
| Produits/Services | Créer, modifier, supprimer |
| Entreprises | Valider, suspendre, gérer propriétaires |
| Avis | Modérer, supprimer, restaurer |
| Signalements | Analyser et statuer |
| Catégories | Créer, modifier, supprimer |
| Utilisateurs | Suspendre, restaurer |
| Système | Paramètres, admins, audit, sécurité |
