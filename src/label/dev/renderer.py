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
COLOR_EMOJI_FONT = "NotoColorEmoji.ttf"
COLOR_EMOJI_STRIKE = 109


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

    def aligned_position(width, height, inset, state):
        if state.get("precisePlacement", False):
            precise_x = max(0, min(100, float(state.get("x", 50)))) / 100
            precise_y = max(0, min(100, float(state.get("y", 50)))) / 100
            return (
                key.x + max(0, key.width - width) * precise_x,
                key.y + max(0, key.height - height) * (1 - precise_y),
            )
        horizontal = state.get("horizontalPosition", "center")
        if horizontal == "left":
            x = key.x + inset
        elif horizontal == "right":
            x = key.right - inset - width
        else:
            x = key.x + (key.width - width) / 2

        vertical = state.get("verticalPosition", "middle")
        if vertical == "top":
            y = key.top - inset - height
        elif vertical == "bottom":
            y = key.y + inset
        else:
            y = key.y + (key.height - height) / 2
        return x, y

    def sync(*args):
        state = current_config[0]
        font_size = SIZES.get(state.get("size"), 4)
        millimetres = getattr(key, "unit", "mm") == "mm"
        inset = mm(2) if millimetres else 2
        pixels = mm(font_size) if millimetres else font_size
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
            emoji.pos = aligned_position(*emoji.size, inset, state)
            return

        emoji.texture = None
        emoji_source[0] = None
        emoji.size = (0, 0)
        label.font_size = pixels
        if state.get("precisePlacement", False):
            label.text_size = (None, None)
            label.texture_update()
            label.size = label.texture_size
            label.pos = aligned_position(*label.size, inset, state)
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
