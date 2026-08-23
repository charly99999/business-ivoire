# Préparation à grande échelle

La version actuelle protège les entrées, limite les écritures et utilise des index pour les parcours sociaux principaux. Cela rend la démonstration et une première communauté exploitables, mais **ne suffit pas à garantir un lancement à des millions d’utilisateurs**.

Avant un déploiement à grande échelle, l’équipe doit placer l’API derrière un équilibrage de charge avec plusieurs instances, déplacer la limitation de débit vers Redis ou un service managé, ajouter une pagination par curseur pour chaque liste, mettre en cache les lectures fréquentes et déplacer les traitements de médias/notifications dans des files de tâches. Les sauvegardes, la réplication de base, l’observabilité, les alertes et les tests de charge doivent être validés avec des seuils de capacité propres à l’infrastructure choisie.

Le parcours d’authentification externe affiche désormais un état récupérable lorsque le fournisseur ne répond pas. Cette indisponibilité en amont ne peut toutefois pas être corrigée uniquement dans le code de l’application ; elle exige une surveillance du fournisseur, des reprises contrôlées et, à terme, une stratégie d’identité de secours.
