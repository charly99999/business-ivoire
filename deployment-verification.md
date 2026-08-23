# Vérification Vercel — 23 août 2026

L’alias de production `https://business-ivoire.vercel.app/` répond en HTTP 200 et affiche l’accueil Business Ivoire après hydratation JavaScript. Le bundle web est servi avec le type `application/javascript` attendu.

Après ajustement du paquet statique, le contrôle direct de `https://business-ivoire.vercel.app/listing/test-route` répond également en HTTP 200 et sert l’entrée Expo. Les liens d’annonces peuvent donc être résolus par le routeur client après le chargement de l’application.
