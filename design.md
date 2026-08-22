# Plan d’interface mobile — Business Ivoire

## Intention produit

Business Ivoire est un réseau professionnel local, conçu pour les opportunités immobilières et entrepreneuriales en Côte d’Ivoire. L’expérience privilégie la confiance, la découverte rapide de contenus utiles et la gestion d’une présence professionnelle. L’application cible un usage mobile en portrait, d’une seule main, avec des actions importantes atteignables dans la zone basse de l’écran.

L’identité est volontairement distincte des réseaux sociaux généralistes : une base ivoire très claire, un bleu lagune pour les actions de confiance, un orange terre cuite pour les opportunités et des surfaces sobres pour les contenus professionnels.

## Écrans

| Écran | Contenu principal | Fonctions clés |
|---|---|---|
| Accueil / Fil | En-tête, recherche, stories, création rapide, publications et signaux d’opportunité | Consulter, réagir, commenter, enregistrer et publier |
| Création de publication | Champ de texte, ajout d’image, choix du type de contenu et bouton publier | Créer un contenu local dans le fil |
| Découvrir | Recherche, catégories Immobilier / Entrepreneuriat, groupes et profils suggérés | Rechercher et rejoindre des communautés |
| Messages | Liste de conversations, aperçu du dernier message et état de lecture | Ouvrir un échange et envoyer un message local |
| Notifications | Mentions, commentaires, nouvelles demandes et groupes | Consulter, marquer comme lu et rejoindre un contexte |
| Page professionnelle | Couverture, identité, catégorie, contacts, horaires, contenu et boutons d’action | Modifier la page, ouvrir le tableau de bord et ajouter une story |
| Tableau de bord | Objectif hebdomadaire, filtres de période, indicateurs et dernière publication | Suivre vues, interactions, followers et objectif |
| Menu | Raccourcis, enregistrements, souvenirs, groupes, paramètres et aide | Accéder aux espaces secondaires |
| Paramètres et confidentialité | Cartes Audience, verrouillage, détails, publications, stories, followers | Visualiser les catégories de réglages |
| Démarrage et selfie | Explication de la règle, demande de caméra, prévisualisation et confirmation | Enregistrer uniquement une photo prise en direct |

## Parcours prioritaires

Le parcours principal démarre par le fil, où la personne peut découvrir des annonces et publier une opportunité. Elle peut ensuite ouvrir une page professionnelle, consulter le tableau de bord puis revenir au fil par la barre d’onglets.

Le parcours d’identité commence au démarrage : l’utilisateur lit la raison de la vérification, autorise l’accès caméra, prend un selfie en direct, le confirme puis le voit apparaître sur son profil. La galerie n’est jamais proposée dans ce parcours. Dans cette première version, le selfie est conservé de manière locale et les mécanismes de stockage serveur chiffré, rétention, modération et contrôle d’accès sont documentés comme prérequis de production.

Le parcours de messagerie permet de passer de la liste des conversations à un échange puis d’envoyer un nouveau message. Le parcours professionnel permet de la Page au tableau de bord, puis au détail de la dernière publication.

## Navigation et structure

La barre d’onglets fixe comprend **Accueil**, **Découvrir**, **Créer**, **Messages** et **Profil**. Elle est complétée par un bouton de notification dans l’en-tête et un menu contextuel dans le profil. Les parcours secondaires sont ouverts en pile de navigation afin de conserver un retour immédiat et prévisible.

Les cibles tactiles auront une taille d’au moins 44 points et les actions destructrices ou sensibles seront confirmées. Les états de pression seront discrets ; les validations importantes pourront utiliser un retour haptique léger sur appareil compatible.

## Couleurs et typographie

| Rôle | Couleur | Usage |
|---|---|---|
| Bleu lagune | `#0B6E8A` | Actions principales, onglet actif, liens de confiance |
| Orange terre cuite | `#E8752B` | Badges d’opportunité, appels à l’action secondaires |
| Ivoire | `#F7F5EF` | Arrière-plan principal et respiration visuelle |
| Graphite | `#16202A` | Titres et textes prioritaires |
| Gris ardoise | `#667085` | Métadonnées et textes secondaires |
| Vert confiance | `#1D8A5B` | États positifs et progression d’objectif |

La typographie privilégie les polices système iOS et Android pour la lisibilité, une hiérarchie nette et de bonnes performances. Les cartes utilisent des angles de 16 à 20 points, des bordures subtiles et des ombres très légères.

## Données et portée de la première version

La première version utilise des données de démonstration et une persistance locale pour les réactions, les publications créées et les messages. Elle implémente réellement la navigation et les interactions mobiles. L’authentification distante, les conversations temps réel, les notifications push, la base PostgreSQL, le stockage distant des images et la migration de comptes existants sont hors de portée de cette version locale et devront être ajoutés avec un backend avant toute mise en production.

## Exigences spécifiques au selfie

La capture d’identité doit exclusivement utiliser la caméra frontale et ne doit pas exposer de sélection depuis la galerie. Avant activation, l’écran explique la finalité et demande l’autorisation du système. En production, la photo devra être chiffrée au repos, isolée du contenu public, protégée par un contrôle d’accès strict, soumise à une politique de conservation limitée et traitée conformément aux obligations applicables de protection des données.
