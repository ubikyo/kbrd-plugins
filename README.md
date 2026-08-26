# KBRD Plugins

> [!NOTE]
> TODO

Plugins partagés par KBRD-WEB et KBRD-DEV.

Chaque plugin se trouve dans `src/<plugin>/` et contient :

- `plugin.json` : identifiant, nom, catégorie, version et configuration initiale ;
- `web/Editor.tsx` : formulaire de configuration Mantine ;
- `web/Renderer.tsx` : rendu SVG dans l'aperçu ;
- `dev/renderer.py` : rendu Kivy sur le clavier ;
- `dev/controller.py` : réactions `on_press` et `on_release` côté clavier.

Les plugins `label` et `image` fournissent les premières implémentations de
référence. Le plugin Image envoie ses fichiers à l'API dans `/data/media` et
les référence par un nom de fichier généré. Les renderers et
controllers Python sont découverts dynamiquement depuis
`/usr/share/kbrd/plugins` par KBRD-DEV. Le renderer web d'un nouveau plugin doit
être ajouté à la liste exportée par `src/web.ts`.