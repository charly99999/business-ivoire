# Architecture — Business Ivoire Mobile

## Portée de cette version

Cette application est une **première version mobile locale** construite avec Expo, React Native et TypeScript. Elle fournit les parcours visibles d’un réseau professionnel ivoirien : fil, création de publication, découverte, messagerie, Page professionnelle, tableau de bord, notifications, réglages et vérification par selfie en direct. Les interactions de démonstration sont persistées dans le stockage local de l’appareil.

Elle ne doit pas être considérée comme une plateforme sociale prête pour des utilisateurs réels tant que les services de compte, de base de données, de stockage sécurisé, de modération, de messagerie temps réel et de conformité ne sont pas livrés et audités.

## Architecture applicative

| Couche | Responsabilité | Implémentation actuelle |
|---|---|---|
| Navigation | Organiser les cinq espaces principaux et les écrans détaillés | Expo Router avec onglets Accueil, Découvrir, Créer, Messages et Profil |
| Présentation | Rendre une interface mobile portrait accessible et cohérente | Composants React Native, Safe Area et palette Business Ivoire |
| Domaine local | Manipuler publications, réactions, Page et conversations | `BusinessProvider` et contexte React |
| Persistance locale | Conserver les démonstrations entre deux ouvertures | AsyncStorage, sous une clé dédiée à Business Ivoire |
| Acquisition de médias | Gérer les deux règles de média distinctes | `expo-camera` pour le selfie et `expo-image-picker` uniquement pour la couverture |
| Configuration native | Déclarer le nom, les icônes et les permissions | `app.config.ts` |

## Modèle de données cible

Le modèle ci-dessous présente la structure recommandée pour la prochaine étape serveur. Les photos de profil issues du selfie doivent être séparées du contenu public et ne jamais être exposées sous une URL publique non contrôlée.

| Entité | Attributs principaux | Relations et règles |
|---|---|---|
| `user` | `id`, `email`, `phone`, `status`, `createdAt` | Possède un profil et peut administrer plusieurs Pages |
| `identity_selfie` | `id`, `userId`, `storageKey`, `capturedAt`, `verificationStatus`, `retentionUntil` | Uniquement créé par capture caméra ; accès restreint aux flux de sécurité |
| `profile` | `userId`, `displayName`, `bio`, `location`, `coverImageKey` | Référence une couverture sélectionnée et un selfie de vérification non public |
| `professional_page` | `id`, `ownerId`, `category`, `hours`, `contacts`, `visibility` | Sert de surface professionnelle publique |
| `post` | `id`, `authorId`, `body`, `type`, `publishedAt`, `visibility` | Réactions, commentaires et médias associés |
| `post_media` | `id`, `postId`, `storageKey`, `kind`, `moderationStatus` | Distingue photo, vidéo, Reel et direct |
| `conversation` | `id`, `kind`, `createdAt` | Membres et messages chiffrés en transit |
| `message` | `id`, `conversationId`, `senderId`, `body`, `sentAt`, `readAt` | Jamais livré directement par le client sans contrôle d’accès |
| `notification` | `id`, `userId`, `kind`, `payload`, `readAt` | Alimentée par événements serveur et diffusée par push |
| `analytics_event` | `id`, `pageId`, `kind`, `occurredAt`, `metadata` | Agrégée côté serveur avant affichage des métriques |

## Architecture de production recommandée

La version de production doit placer une API TypeScript derrière un service d’authentification, une base PostgreSQL et un stockage objet privé. L’application mobile échange avec l’API via HTTPS, obtient des jetons temporaires pour téléverser la couverture ou les médias publics, et utilise un flux séparé pour le selfie. Les notifications et la messagerie doivent être pilotées par des événements authentifiés ; aucune clé de stockage ni privilège d’administration ne doit être présente dans le binaire mobile.

## Plan de migration vers les utilisateurs existants

La migration doit commencer par l’inventaire des comptes et des contenus existants. Une table d’appariement entre les identifiants du système actuel et les nouveaux identifiants doit assurer la traçabilité. Les profils peuvent être importés avant les publications, mais les images de profil existantes ne doivent pas être transformées silencieusement en selfie vérifié : les membres doivent recevoir une demande de capture explicite au premier accès. Pendant la période de transition, le compte peut conserver un statut `identity_pending` afin de permettre l’accès aux contenus sans autoriser les actions à risque.

Après un pilote limité, il convient de comparer les totaux de comptes, Pages, publications, abonnements et contenus importés avec des rapports signés. Le basculement doit inclure une période de lecture seule de l’ancien système, une procédure de reprise et une fenêtre de support renforcée.
