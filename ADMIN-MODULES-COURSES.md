# Gestion des modules et cours

La page `/admin/formations/:id` permet maintenant de :
- créer, modifier, supprimer et publier/dépublier les modules ;
- réorganiser les modules avec les boutons ↑ / ↓ ;
- créer, modifier, supprimer et publier/dépublier les cours ;
- réorganiser les cours à l'intérieur de leur module avec ↑ / ↓ ;
- modifier le contenu, les URLs vidéo/PDF et la durée d'un cours.

Les positions sont conservées dans les colonnes `position` de Supabase.
Les permissions d'écriture restent protégées par les politiques RLS d'administration existantes.
