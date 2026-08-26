# KBRD Plugins

Plugins de [KBRD](https://github.com/ubikyo/kbrd).

Chaque plugin se trouve dans le dossier `src/<plugin>/` et contient :

|Fichier|Description|
|-|-|
|`plugin.json`|Description du plugin|
|`web/Editor.tsx`|Formulaire de configuration dans `KBRD-WEB`|
|`web/Renderer.tsx`|Rendu du plugin dans `KBRD-WEB`|
|`dev/renderer.py`|Rendu du plugin dans `KBRD-DEV`|
|`dev/controller.py`|Actions réalisés dans `KBRD-DEV`|.

> [!IMPORTANT]
> Les renderers et controllers Python sont découverts dynamiquement depuis `/usr/share/kbrd/plugins` par `KBRD-DEV`. Le renderer web d'un nouveau plugin doit être ajouté à la liste exportée par `src/web.ts`.