# KBRD Plugins

Plugins de [KBRD](https://github.com/ubikyo/kbrd).

Chaque plugin se trouve dans le dossier `src/<plugin>/` et contient :

|Fichier|Description|
|-|-|
|`plugin.json`|Description du plugin|
|`web/LayoutEditor.tsx`|Formulaire "Layout" (positionnement/nature de l'élément) dans `KBRD-WEB`|
|`web/MappingEditor.tsx`|Formulaire "Mapping" (comportement/contenu) dans `KBRD-WEB`|
|`web/Renderer.tsx`|Rendu du plugin dans `KBRD-WEB`|
|`dev/renderer.py`|Rendu du plugin dans `KBRD-DEV`|
|`dev/controller.py`|Actions réalisés dans `KBRD-DEV`|.

Un plugin sans formulaire pour l'un des deux modes réexporte le composant
partagé correspondant (`shared/web/EmptyLayoutEditor.tsx` ou
`EmptyMappingEditor.tsx`) plutôt que d'en dupliquer un vide.

`KBRD-WEB` choisit l'un des deux formulaires selon le mode actif
(Layout/Mapping) et ne rend un plugin déplaçable depuis la palette que si sa
`category` correspond au mode courant : `Layout` en mode Layout,
n'importe quelle autre catégorie (`Invoke`, `Display`, ...) en mode Mapping.

> [!IMPORTANT]
> Les renderers et controllers Python sont découverts dynamiquement depuis `/usr/share/kbrd/plugins` par `KBRD-DEV`. Les formulaires et le renderer web d'un nouveau plugin doivent être ajoutés à la liste exportée par `src/web.ts`.