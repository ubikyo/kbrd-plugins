import importlib.util
from pathlib import Path

from kivy.graphics import Color, Rectangle
from kivy.graphics.texture import Texture
from kivy.metrics import mm
from kivy.uix.label import Label
from kivy.uix.widget import Widget
from kivy.utils import get_color_from_hex

SIZES = {"xs": 2.5, "sm": 3.2, "md": 4, "lg": 5, "xl": 6}
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
        millimetres = getattr(key, "unit", "mm") == "mm"
        inset = mm(2) if millimetres else 2
        pixels = mm(font_size) if millimetres else font_size
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
            emoji.pos = resolve_anchored_position(
                key, *emoji.size, state, unit_scale, inset
            )
            return

        emoji.texture = None
        emoji_source[0] = None
        emoji.size = (0, 0)
        label.font_size = pixels
        if state.get("precisePlacement", False):
            label.text_size = (None, None)
            label.texture_update()
            label.size = label.texture_size
            label.pos = resolve_anchored_position(
                key, *label.size, state, unit_scale, inset
            )
        else:
            label.pos = (key.x + inset, key.y + inset)
            label.size = (
                max(0, key.width - inset * 2),
                max(0, key.height - inset * 2),
            )
            label.text_size = label.size

    def update(state):
        current_config[0] = state
        filename = state.get("font", DEFAULT_FONT)
        if filename != COLOR_EMOJI_FONT:
            label.text = str(state.get("text", ""))
            label.font_name = font_path(filename)
            label.color = get_color_from_hex(state.get("color", "#ffffff"))
            # `underline` Kivy draws itself, so it works with any font.
            # `bold`/`italic` it resolves through a *registered* font
            # family, and `font_name` above is a bare .ttf path — so until
            # the label's font is registered with its bold/italic siblings
            # (LabelBase.register), these two set the intent without
            # changing the glyphs. The web renderer has no such limit: the
            # browser synthesises both.
            label.bold = bool(state.get("bold", False))
            label.italic = bool(state.get("italic", False))
            label.underline = bool(state.get("underline", False))
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
