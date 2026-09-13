# KBRD Plugins

Plugins de [KBRD](https://github.com/ubikyo/kbrd).

Chaque plugin se trouve dans le dossier `src/<plugin>/` et contient :

|Fichier|Description|
|-|-|
|`plugin.json`|Description du plugin|
|`web/LayoutEditor.tsx`|Formulaire "Layout" (positionnement/nature de l'élément) dans `KBRD-WEB`|
|`web/LayerEditor.tsx`|Formulaire "Layer" (comportement/contenu) dans `KBRD-WEB`|
|`web/Renderer.tsx`|Rendu du plugin dans `KBRD-WEB`|
|`dev/renderer.py`|Rendu du plugin dans `KBRD-DEV`|
|`dev/controller.py`|Actions réalisés dans `KBRD-DEV`|.

Un plugin sans formulaire pour l'un des deux modes réexporte le composant
partagé correspondant (`shared/web/EmptyLayoutEditor.tsx` ou
`EmptyLayerEditor.tsx`) plutôt que d'en dupliquer un vide.

`KBRD-WEB` choisit l'un des deux formulaires selon le mode actif
(Layout/Layer) et ne rend un plugin déplaçable depuis la palette que si sa
`category` correspond au mode courant : `Layout` en mode Layout,
n'importe quelle autre catégorie (`Invoke`, `Display`, ...) en mode Layer.

> [!IMPORTANT]
> Les renderers et controllers Python sont découverts dynamiquement depuis `/usr/share/kbrd/plugins` par `KBRD-DEV`. Les formulaires et le renderer web d'un nouveau plugin doivent être ajoutés à la liste exportée par `src/web.ts`.

## Storybook

Tous les composants React de ce dépôt sont montés dans un Storybook, sans
`KBRD-WEB`, sans API et sans clavier :

    npm install
    npm run storybook     # http://localhost:6006
    npm run build-storybook

Trois sections :

|Section|Contenu|
|-|-|
|`UX/`|Les contrôles de base (`src/shared/web/ux/`) : champs compacts, bascules, sélecteurs|
|`Blocks/`|Les groupes de propriétés (`src/shared/web/blocks/`) composés à partir des précédents|
|`Plugins/`|Les `LayerEditor` de chaque plugin|

Une story de block affiche le `stored` réel à côté du contrôle : c'est toute la
différence entre « réglé à la valeur par défaut » et « pas réglé du tout », donc
entre un groupe ouvert et un groupe fermé. `+` écrit des clés, `×` les
supprime, et les valeurs affichées ne bougent ni dans un cas ni dans l'autre.

Le thème Mantine de l'application vit ici (`src/shared/web/theme.ts`, exporté
sous `@kbrd/plugins/theme`) plutôt que dans `KBRD-WEB`, qui l'importe. Les
contrôles de `ux/` sont entièrement stylés en `--kbrd-color-body` /
`--kbrd-border-color` : sans ce thème, une story n'afficherait que des boîtes
invisibles. Une seule copie, importée des deux côtés, garantit que les stories
montrent les composants tels que l'application les dessine.

Plusieurs éditeurs vont chercher leurs propres options auprès de `KBRD-API`
(polices, layouts, layers, applications, navigateurs). Storybook n'en a pas
derrière lui : `.storybook/api-stub.ts` intercepte ces quelques routes, tout le
reste passant au vrai `fetch`.

> [!IMPORTANT]
> Les stories vivent à côté du composant qu'elles décrivent
> (`Composant.stories.tsx`). Un nouveau composant partagé ou un nouveau plugin
> vient avec la sienne.
