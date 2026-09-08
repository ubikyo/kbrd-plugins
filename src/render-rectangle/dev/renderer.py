import importlib.util
from pathlib import Path

from kivy.metrics import mm

from kbrd_dev.render_spec import RenderSpec

# `shared/dev/placement.py` lives next to this plugin, not inside the
# `kbrd_dev` package, so it is loaded the same way `render-key-symbol`
# already loads a sibling plugin's renderer.
_PLACEMENT_PATH = (
    Path(__file__).resolve().parents[2] / "shared" / "dev" / "placement.py"
)
_SPEC = importlib.util.spec_from_file_location(
    "kbrd_shared_dev_placement", _PLACEMENT_PATH
)
_MODULE = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(_MODULE)
measure = _MODULE.measure
resolve_anchored_position = _MODULE.resolve_anchored_position

# What a rectangle is filled with when it carries neither a Background
# group nor the `color` that block replaced.
DEFAULT_FILL = "#ffffff"

# What a fresh Dimension group seeds each side with, and so what a
# rectangle storing no size of its own comes out as — see `DEFAULT_SIZE`
# in the web block, which has to agree.
DEFAULT_SIZE = {"%": 50.0, "mm": 8.0}


def render(key, config):
    # Pixels per unit of whatever the display is measured in — what a
    # millimetre in the config is worth on screen.
    unit_scale = mm(1) if getattr(key, "unit", "mm") == "mm" else 1.0

    dimension_unit = config.get("dimensionUnit", "%")
    default_size = DEFAULT_SIZE.get(dimension_unit, DEFAULT_SIZE["%"])
    width = max(
        0.0,
        measure(
            dimension_unit,
            config.get("width"),
            key.width,
            unit_scale,
            default=default_size,
        ),
    )
    height = max(
        0.0,
        measure(
            dimension_unit,
            config.get("height"),
            key.height,
            unit_scale,
            default=default_size,
        ),
    )
    x, y = resolve_anchored_position(key, width, height, config, unit_scale)

    border_enabled = bool(config.get("borderEnabled", False))
    return RenderSpec(
        kind="rect",
        x=x,
        y=y,
        width=width,
        height=height,
        color=config.get("backgroundColor")
        or config.get("color")
        or DEFAULT_FILL,
        border_color=config.get("borderColor", "#ffffff"),
        # A width of 0 is what says "no border" to `DisplayManager`, so the
        # group being off comes down to exactly that.
        border_width=float(config.get("borderWidth", 1)) if border_enabled else 0.0,
        border_style=str(config.get("borderStyle", "solid")),
    )
