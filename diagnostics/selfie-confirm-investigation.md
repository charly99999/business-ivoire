# Diagnostic du bouton Confirmer — 23 août 2026

- L’aperçu web a été chargé avec succès.
- La console navigateur ne contient aucune erreur au chargement initial.
- Le prochain contrôle cible l’exécution de `captureMySelfie`, l’upload privé et l’appel Edge Function au moment de la confirmation.

La session navigateur a ensuite été redirigée vers un retour GitHub en erreur et non vers le tableau de bord Supabase. La confirmation e-mail n’est donc pas encore considérée comme désactivée ; le réglage doit être vérifié directement dans le projet Supabase.
