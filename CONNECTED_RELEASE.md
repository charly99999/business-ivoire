# Business Ivoire — version connectée

## Fonctionnalités persistantes

La version connectée utilise l’authentification OAuth fournie par le projet, une base MySQL gérée et le stockage applicatif pour les médias. Les profils, Pages professionnelles, publications, réactions, commentaires, abonnements, groupes, conversations, messages et notifications sont enregistrés côté serveur. L’accès aux routes métier est protégé par la session utilisateur.

## Protection des données

Le selfie est capturé uniquement avec la caméra frontale dans l’écran dédié. Il est envoyé au stockage serveur avec une clé séparée du profil public. Les API de découverte, fil, commentaires, messagerie et notifications n’exposent ni l’URL ni la clé du selfie, ni le téléphone ou l’e-mail privés d’un autre membre. Les opérations d’écriture sont validées côté serveur et limitées en fréquence.

## Limites à traiter avant une exploitation réglementée

Un selfie enregistré n’est pas une vérification d’identité légale : un contrôle de preuve de vie, un processus KYC humain et une politique de conservation/suppression doivent être ajoutés avant toute validation officielle. La vidéo native pour Reels/Live, la modération automatisée et humaine, les notifications push temps réel, les signalements, les outils d’administration et les tests multi-comptes en production restent des travaux nécessaires. Les paiements, abonnements et promotions payantes restent désactivés.

## Vérifications effectuées

Les tests de politique média et la compilation TypeScript passent. Les réponses locales de l’API (`/api/health`) et de l’aperçu Expo ont été vérifiées avec le code HTTP 200 après redémarrage.
