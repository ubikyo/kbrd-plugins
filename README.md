# KBRD Plugins

Plugins partagés par KBRD-WEB et KBRD-DEV.

Chaque plugin se trouve dans `src/<plugin>/` et contient :

- `plugin.json` : identifiant, nom, catégorie, version et configuration initiale ;
- `web/Editor.tsx` : formulaire de configuration Mantine ;
- `web/Renderer.tsx` : rendu SVG dans l'aperçu ;
- `dev/renderer.py` : rendu Kivy sur le clavier ;
- `dev/controller.py` : réactions `on_press` et `on_release` côté clavier.

Les plugins `label` et `image` fournissent les premières implémentations de
référence. Le plugin Image envoie ses fichiers à l'API dans `/data/medias` et
les référence par un nom de fichier généré. Les renderers et
controllers Python sont découverts dynamiquement depuis
`/usr/share/kbrd/plugins` par KBRD-DEV. Le renderer web d'un nouveau plugin doit
être ajouté à la liste exportée par `src/web.ts`.

Le plugin Label liste les polices `.ttf` et `.otf` placées dans `/data/fonts`,
ainsi que les polices livrées dans `/usr/share/kbrd/fonts`. Pour afficher des
emojis en couleurs, sélectionner `NotoColorEmoji` dans le champ **Font**. Cette
police est livrée dans l'image KBRD ; KBRD-DEV rasterise ses glyphes couleur
avec Pillow avant de les envoyer dans une texture Kivy.
