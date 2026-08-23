# Audit de référence — Afrique Business V2

Source auditée : https://afrique-business-v2-marcarnaudkonan2-7721s-projects.vercel.app/ (projet Vercel `afrique-business-v2`, build Vite).

La référence Vercel expose une application web Vite au thème sombre vert et or. Son écran d’accueil comporte un fil de publications, une identité visible (avatar, nom et badge), un horodatage et des actions de réaction, commentaire et partage.

La navigation mobile comporte quatre entrées explicites : **Accueil**, **Annonces**, **Publier** et **Profil**. Cet audit servira à distinguer les composants de confiance à réintégrer de ceux qui restent des données de démonstration.

L’écran **Annonces** présente une grille simple avec image, titre, prix FCFA et ville, ainsi qu’un accès direct à la publication. Le formulaire **Publier** couvre titre, description, prix FCFA, ville et une image, mais la promesse d’une publication Facebook automatique est spécifique à une démonstration et ne doit pas être reprise sans une intégration explicitement approuvée.

Le profil Afrique Business V2 est protégé par une connexion, tandis que le fil et les annonces sont publics. Business Ivoire doit conserver ce principe avec un parcours de connexion plus robuste et une capture selfie obligatoire avant les actions sensibles.
