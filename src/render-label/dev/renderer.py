import importlib.util
import re
from pathlib import Path

from kivy.graphics import Color, Rectangle
from kivy.graphics.texture import Texture
from kivy.metrics import mm
from kivy.uix.label import Label
from kivy.uix.widget import Widget
from kivy.utils import escape_markup, get_color_from_hex

SIZES = {"xs": 2.5, "sm": 3.2, "md": 4, "lg": 5, "xl": 6}

# The other half of `shared/web/typography.ts` — Kivy has neither
# `text-transform` nor `vertical-align`, so casing is applied to the
# string and script is expressed as a size and a baseline offset, exactly
# as the web renderer does it.  These three numbers are the contract
# between the two files and have to be changed in both.
SCRIPT_SIZE_RATIO = 0.65
SCRIPT_OFFSET_RATIO = {"none": 0.0, "super": 0.33, "sub": -0.16}

# The five treatments a *piece* of a label can carry on its own, against
# the ones that stay whole-label: colour, font and size, which are what
# the one drawn string is drawn *as*.  The other half of
# `shared/web/textRuns.ts`.
EMPHASIS_KEYS = ("bold", "italic", "underline", "transform", "script")
DATA_FONTS = Path("/data/fonts")
BUNDLED_FONTS = Path("/usr/share/kbrd/fonts")
DEFAULT_FONT = "Inter_18pt-Regular.ttf"
COLOR_EMOJI_FONT = "NotoColorEmoji-Regular.ttf"
COLOR_EMOJI_STRIKE = 109

# `shared/dev/placement.py` lives next to this plugin, not inside the
# `kbrd_dev` package, so it is loaded the same way `render-rectangle`
# already loads it.
_PLACEMENT_PATH = (
    Path(__file__).resolve().parents[2] / "shared" / "dev" / "placement.py"
)
_SPEC = importlib.util.spec_from_file_location(
    "kbrd_shared_dev_placement", _PLACEMENT_PATH
)
_MODULE = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(_MODULE)
resolve_anchored_position = _MODULE.resolve_anchored_position


def transform_text(text, transform):
    """The text as it should actually be drawn.

    `capitalize` follows CSS's own rule — the first letter of every word,
    leaving the rest of each word alone — so a label already written
    "USB Hub" isn't quietly rewritten to "Usb Hub".  `str.title` lowercases
    the rest of each word, which is why this is hand-rolled; the split
    keeps the separators so the original spacing comes back untouched.
    """
    if transform == "uppercase":
        return text.upper()
    if transform == "lowercase":
        return text.lower()
    if transform == "capitalize":
        return "".join(
            word[:1].upper() + word[1:] if word.strip() else word
            for word in re.split(r"(\s+)", text)
        )
    return text


def resolve_runs(state):
    """The pieces a label is made of, and the fields they fall back on.

    A label whose emphasis is the same all the way through carries no
    `spans` at all — which is nearly all of them, and every label written
    before spans existed — and comes back as a single run built from the
    four flat fields.  `spans` only appears once two parts of a label are
    treated differently.

    Spans that run past the end of the text are clipped and text past the
    end of the spans falls back to the flat fields, so a `spans` that has
    drifted out of step with `text` degrades to the uniform label rather
    than losing characters.  This mirrors `resolveRuns` in
    `shared/web/textRuns.ts`, and counts in the same unit it does: code
    points, so an emoji is one position on both sides.
    """
    text = str(state.get("text", ""))
    script = state.get("script", "none")
    base = {
        "bold": bool(state.get("bold", False)),
        "italic": bool(state.get("italic", False)),
        "underline": bool(state.get("underline", False)),
        "transform": state.get("transform", "none"),
        "script": script if script in SCRIPT_OFFSET_RATIO else "none",
    }
    spans = state.get("spans")
    if not isinstance(spans, list) or not spans:
        return ([dict(base, text=text)] if text else []), base

    characters = list(text)
    runs = []
    at = 0
    for span in spans:
        if at >= len(characters):
            break
        if not isinstance(span, dict):
            continue
        try:
            length = max(0, int(span.get("length", 0)))
        except (TypeError, ValueError):
            continue
        if not length:
            continue
        piece = characters[at:at + length]
        at += len(piece)
        run = dict(base)
        for key in EMPHASIS_KEYS:
            if span.get(key) is not None:
                run[key] = span[key]
        for key in ("bold", "italic", "underline"):
            run[key] = bool(run[key])
        if run["script"] not in SCRIPT_OFFSET_RATIO:
            run["script"] = "none"
        runs.append(dict(run, text="".join(piece)))
    if at < len(characters):
        runs.append(dict(base, text="".join(characters[at:])))

    # No empty pieces and no two neighbours saying the same thing, so a
    # label whose runs collapse back into one takes the plain path below
    # rather than the markup one.
    merged = []
    for run in runs:
        if not run["text"]:
            continue
        same = merged and all(
            merged[-1][key] == run[key] for key in EMPHASIS_KEYS
        )
        if same:
            merged[-1]["text"] += run["text"]
        else:
            merged.append(run)
    return merged, base


def uniform_script(runs, base):
    """The one script the whole label is in, or `None` if it mixes them.

    The mirror of `uniformScript` in `shared/web/textRuns.ts`, and both
    renderers branch on it the same way: a label whose script is uniform
    — every label that isn't deliberately an "H₂O" — is drawn the way it
    always was, the whole string set at the shrunken size and the whole
    line moved off its baseline by our own ratios.  Only a mixed one has
    to say the script piece by piece.
    """
    if not runs:
        return base["script"]
    first = runs[0]["script"]
    return first if all(run["script"] == first for run in runs) else None


def markup_for(runs, font_size):
    """The runs as one Kivy markup string.

    Only used for a label that actually has two treatments in it — a
    uniform one is drawn through the Label's own `bold`/`italic`/
    `underline` properties instead, which is what it has always done and
    leaves nothing to escape.

    Casing is applied per piece and before escaping, exactly as the web
    renderer applies it per `<tspan>`: "capitalize" treats each piece's
    first word as a word of its own, so capitalising half a word
    capitalises that half's first letter.

    Script is the one treatment markup can't say exactly.  Kivy's own
    `[sup]`/`[sub]` fix the size at half and place the piece against the
    top or bottom of the line box, from the font's own metrics — not the
    ratios in `shared/web/typography.ts`.  `[size=]` inside the tag puts
    our size ratio back, which is the half that *can* be matched; the
    baseline offset is Kivy's, so a label that mixes scripts sits a
    little differently on the device than in the Composer's preview.  A
    label whose script is uniform never comes through here and stays
    exact.
    """
    # Kivy's `[size=]` wants an integer count of pixels.
    script_size = max(1, int(round(font_size * SCRIPT_SIZE_RATIO)))
    parts = []
    for run in runs:
        # Square brackets in the label's own text would otherwise be read
        # as markup — "[b]" typed by the user has to reach the screen as
        # "[b]".
        piece = escape_markup(transform_text(run["text"], run["transform"]))
        tag = {"super": "sup", "sub": "sub"}.get(run["script"])
        if tag:
            piece = "[{0}][size={1}]{2}[/size][/{0}]".format(
                tag, script_size, piece
            )
        for tag, key in (("b", "bold"), ("i", "italic"), ("u", "underline")):
            if run[key]:
                piece = "[{0}]{1}[/{0}]".format(tag, piece)
        parts.append(piece)
    return "".join(parts)


def font_path(filename):
    if not isinstance(filename, str) or Path(filename).name != filename:
        filename = DEFAULT_FONT
    for directory in (DATA_FONTS, BUNDLED_FONTS):
        path = directory / filename
        if path.is_file():
            return str(path)
    return "Roboto"


def emoji_texture(text, path):
    from PIL import Image, ImageDraw, ImageFont

    # Pillow's basic layout engine counts emoji presentation selectors as
    # separate glyph advances.  The bundled color font is already dedicated
    # to emoji rendering, so selectors are redundant and would offset glyphs
    # such as "❤️" by half of their reported width.
    text = text.replace("\ufe0e", "").replace("\ufe0f", "")
    font = ImageFont.truetype(path, COLOR_EMOJI_STRIKE)
    probe = Image.new("RGBA", (1, 1))
    draw = ImageDraw.Draw(probe)
    bounds = draw.textbbox((0, 0), text, font=font, embedded_color=True)
    width = max(1, bounds[2] - bounds[0])
    height = max(1, bounds[3] - bounds[1])
    image = Image.new("RGBA", (width, height))
    ImageDraw.Draw(image).text(
        (-bounds[0], -bounds[1]),
        text,
        font=font,
        embedded_color=True,
    )
    texture = Texture.create(size=image.size, colorfmt="rgba")
    texture.blit_buffer(image.tobytes(), colorfmt="rgba", bufferfmt="ubyte")
    texture.flip_vertical()
    return texture


def render(key, config):
    current_config = [config]
    container = Widget(size_hint=(None, None))
    label = Label()
    container.add_widget(label)
    with container.canvas:
        Color(1, 1, 1, 1)
        emoji = Rectangle(pos=container.pos, size=(0, 0))

    emoji_source = [None]

    def sync(*args):
        state = current_config[0]
        size = state.get("size", "md")
        font_size = (
            float(size)
            if isinstance(size, (int, float))
            else SIZES.get(size, 4)
        )
        runs, base = resolve_runs(state)
        script = uniform_script(runs, base)
        millimetres = getattr(key, "unit", "mm") == "mm"
        inset = mm(2) if millimetres else 2
        full = mm(font_size) if millimetres else font_size
        if script is None:
            # A label that mixes scripts says them piece by piece, inside
            # the markup — so the Label itself stays at full size and on
            # its own baseline, and `markup_for` moves the pieces.
            pixels = full
            rise = 0.0
        else:
            pixels = full * SCRIPT_SIZE_RATIO if script != "none" else full
            # Positive is up, which is also Kivy's own y direction — so
            # this is added to the label's position as it stands, unlike
            # the web renderer's `dy` (SVG's y grows the other way).
            # Taken from the *full* size rather than the shrunken one, so
            # raising a label doesn't also shrink the distance it's
            # raised by.
            rise = full * SCRIPT_OFFSET_RATIO[script]
        # Pixels per unit of whatever the display is measured in — what a
        # millimetre coordinate of the config is worth on screen.
        unit_scale = mm(1) if millimetres else 1.0
        container.pos = key.pos
        container.size = key.size

        filename = state.get("font", DEFAULT_FONT)
        if filename == COLOR_EMOJI_FONT:
            label.text = ""
            source = (str(state.get("text", "")), font_path(filename))
            if source != emoji_source[0]:
                emoji_source[0] = source
                try:
                    emoji.texture = emoji_texture(*source)
                except Exception:
                    emoji.texture = None
            if emoji.texture is None:
                emoji.size = (0, 0)
                return
            scale = pixels / COLOR_EMOJI_STRIKE
            emoji.size = (
                emoji.texture.width * scale,
                emoji.texture.height * scale,
            )
            # Casing means nothing to an emoji, but script does: the
            # glyph shrinks with `pixels` above and rides the same
            # baseline offset as any other label.
            anchored = resolve_anchored_position(
                key, *emoji.size, state, unit_scale, inset
            )
            emoji.pos = (anchored[0], anchored[1] + rise)
            return

        emoji.texture = None
        emoji_source[0] = None
        emoji.size = (0, 0)
        label.font_size = pixels
        # The text is set here rather than in `update` because a mixed
        # script needs `[size=]` in pixels, and `full` is only known once
        # the key's own unit is.
        #
        # `underline` Kivy draws itself, so it works with any font.
        # `bold`/`italic` it resolves through a *registered* font family,
        # and `font_name` is a bare .ttf path — so until the label's font
        # is registered with its bold/italic siblings (LabelBase.register),
        # these two set the intent without changing the glyphs.  The web
        # renderer has no such limit: the browser synthesises both.
        # Markup's `[b]`/`[i]` go through the same resolution and share
        # the limit exactly.
        if len(runs) > 1:
            # Two treatments in one label, which only markup can say.
            # The properties are cleared rather than left alone: they
            # apply to the whole string and would compound with the tags.
            label.markup = True
            label.text = markup_for(runs, full)
            label.bold = False
            label.italic = False
            label.underline = False
        else:
            # The uniform label — every label written before spans
            # existed, and most written since — drawn exactly as it was
            # before, with no markup to escape.
            run = runs[0] if runs else dict(base, text="")
            label.markup = False
            label.text = transform_text(run["text"], run["transform"])
            label.bold = bool(run["bold"])
            label.italic = bool(run["italic"])
            label.underline = bool(run["underline"])
        if state.get("precisePlacement", False):
            label.text_size = (None, None)
            label.texture_update()
            label.size = label.texture_size
            anchored = resolve_anchored_position(
                key, *label.size, state, unit_scale, inset
            )
            label.pos = (anchored[0], anchored[1] + rise)
        else:
            label.pos = (key.x + inset, key.y + inset + rise)
            label.size = (
                max(0, key.width - inset * 2),
                max(0, key.height - inset * 2),
            )
            label.text_size = label.size

    def update(state):
        current_config[0] = state
        filename = state.get("font", DEFAULT_FONT)
        if filename != COLOR_EMOJI_FONT:
            label.font_name = font_path(filename)
            label.color = get_color_from_hex(state.get("color", "#ffffff"))
            # The text itself is `sync`'s, which runs at the end of this
            # and again whenever the key moves or resizes.
            label.halign = {
                "left": "left",
                "center": "center",
                "right": "right",
            }.get(state.get("horizontalPosition"), "center")
            label.valign = {
                "top": "top",
                "middle": "middle",
                "bottom": "bottom",
            }.get(state.get("verticalPosition"), "middle")
        sync()

    key.bind(pos=sync, size=sync)
    container.kbrd_update = update
    update(config)
    key.add_widget(container)
    return container
