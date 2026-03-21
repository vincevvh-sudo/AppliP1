# Sauvegarde — Royaume des Lettres (CP)

**Date :** 8 février 2026

## Fichiers sauvegardés

- `app/` (composants, pages, données)
- `public/` (images, assets)
- `utils/`
- `package.json`, `tsconfig.json`, `next.config.ts`, `README.md`

## Modifications réalisées (résumé)

### Données & évaluations (`app/data/`)
- **eval-data.ts** : syllabeUtiliseSonsAppris, variété entre eval 1/2/3, syllabes avec sons déjà vus, pools élargis
- **mots-phono-image.ts** : retrait maman/papa/bébé, mots complexes, moto retiré (M et O), règle retiré (L), valise→voiture, pastèque ajoutée
- **sons-data.ts** : e-accent avec « é, è, ê »
- **syllabe-pronciation.ts** : getTexteReconnaissance (son seul, sans « comme dans »), « e » prononcé « è »

### Exercice Reconnaissance (`app/components/JeuxSons.tsx`)
- Prononciation uniquement du son/syllabe
- Options avec variantes accentuées (é, è, ê) pour les mots comme « rêve »
- Affichage de la lettre présente dans le mot (ex. « ê » pour « rêve »)

### Règles appliquées
- Syllabes à écrire = sons déjà vus (ordre)
- Pas de mot écrit quand il est prononcé
- Mots sans sons complexes (on, ou, oi, an, in) avant leur apprentissage
- Pools enrichis pour varier les évaluations
