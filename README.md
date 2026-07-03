# 🛍️ Eco Market — Site E-commerce Complet

## Structure des fichiers

```
eco-market/
├── index.html    → Site public (storefront)
├── admin.html    → Panel admin (séparé, accès direct)
├── store.js      → Base de données locale (localStorage)
└── styles.css    → Styles partagés
```

## Utilisation

1. **Télécharger** les 4 fichiers dans le même dossier
2. **Ouvrir** `index.html` dans votre navigateur → Site public
3. **Ouvrir** `admin.html` directement → Panel admin
4. Le lien "Admin" en bas à gauche du site pointe vers `admin.html`

## Fonctionnalités

### Site public (index.html)
- Hero animé avec gradient
- 2 catégories : Cosmétique 💄 + Articles Enfants 🧸
- Produits avec tags -%, NEW, favoris ❤️
- Recherche en temps réel
- Panier avec drawer, code promo, confirmation commande
- Responsive mobile

### Admin panel (admin.html)
- Dashboard : CA, commandes, stock faible
- Catégories : ajouter, modifier, activer/désactiver
- Produits : ajouter, modifier, filtre par catégorie, toggle actif
- Commandes : statuts (attente → expédié → livré), bouton WhatsApp
- Promotions : créer codes promo %, montant, par catégorie
- Réglages : nom du shop, WhatsApp

## Hébergement

Pour mettre en ligne, téléverser les 4 fichiers sur :
- Netlify (glisser-déposer le dossier)
- GitHub Pages
- Tout hébergeur web classique

