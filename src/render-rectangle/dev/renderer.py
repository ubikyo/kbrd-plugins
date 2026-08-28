import importlib.util
from pathlib import Path

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
resolve_position = _MODULE.resolve_position


def render(key, config):
    width_ratio = max(0.05, min(1, float(config.get("width", 50)) / 100))
    height_ratio = max(0.05, min(1, float(config.get("height", 50)) / 100))
    width = key.width * width_ratio
    height = key.height * height_ratio
    x, y = resolve_position(key, width, height, config)
    return RenderSpec(
        kind="rect",
        x=x,
        y=y,
        width=width,
        height=height,
        color=config.get("color", "#ffffff"),
    )
