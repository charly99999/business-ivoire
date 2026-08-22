# Sécurité et confidentialité du selfie

## Principe fonctionnel retenu

Le parcours de vérification implémenté dans l’application ouvre exclusivement la **caméra frontale** et appelle la prise de photo de l’appareil. L’écran ne propose aucune entrée de sélection de galerie. La sélection d’images de bibliothèque est réservée au changement de photo de couverture de la Page professionnelle.

Cette séparation d’interface ne constitue pas, à elle seule, une preuve d’identité ni une protection complète contre la fraude. La vérification humaine, la prévention de présentation, la détection d’abus et la gestion des incidents doivent être conçues et évaluées dans le service backend avant une mise en production.

## Contrôles à implémenter avant la production

| Risque | Contrôle requis |
|---|---|
| Accès non autorisé au selfie | Stockage objet privé, chiffrement au repos, clés gérées, contrôle RBAC et journal d’accès immuable |
| Partage accidentel du selfie | Ne jamais retourner de lien public permanent ; délivrer des URL signées à durée très courte après autorisation serveur |
| Modification par le client | Émettre une intention de capture côté serveur, vérifier le type MIME, la taille, l’intégrité et l’origine du téléversement |
| Fraude par image présentée à la caméra | Évaluer une preuve de vie active, une détection d’injection et une revue des cas litigieux |
| Conservation excessive | Définir une durée de rétention, une base légale documentée, un mécanisme d’effacement et une procédure d’export conforme |
| Compromission de compte | Authentification forte, limitation de débit, alertes de session et ré-authentification pour toute recapture ou consultation sensible |
| Abus de la messagerie | Filtrage, signalement, blocage, journalisation et modération avec règles d’accès minimales |

## Limites de la version locale

Dans cette version, le selfie est conservé dans le stockage local de l’appareil pour démontrer le flux. Il n’est ni chiffré par une infrastructure applicative, ni synchronisé, ni administré par un serveur. Par conséquent, il ne convient pas de collecter de vrais selfies dans un contexte de production à partir de cette version seule.

## Déploiement recommandé

Le déploiement doit commencer par un environnement de préproduction isolé. Les secrets, les certificats, la base de données et le stockage doivent être configurés via la gestion sécurisée des variables d’environnement. La construction d’un binaire iOS ou Android doit être effectuée après une validation des permissions natives, des politiques de confidentialité, des tests d’autorisation et d’un audit de sécurité indépendant.
