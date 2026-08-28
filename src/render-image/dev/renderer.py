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

MEDIA_DIR = Path("/data/media")

_HIDDEN = RenderSpec(kind="image", x=0, y=0, width=0, height=0, visible=False)


def render(key, config):
    filename = config.get("media", "")
    if not filename or Path(filename).name != filename:
        return _HIDDEN

    full_size = config.get("fullSize", True)
    ratio = 1 if full_size else max(0.1, float(config.get("size", 75)) / 100)
    width = key.width * ratio
    height = key.height * ratio
    # When `fullSize` the image exactly fills the key, so every alignment
    # produces `(key.x, key.y)` anyway — `resolve_position` only needs to
    # run for the (rarer) non-full-size case.
    x, y = (key.x, key.y) if full_size else resolve_position(key, width, height, config)

    return RenderSpec(
        kind="image",
        x=x,
        y=y,
        width=width,
        height=height,
        source=str(MEDIA_DIR / filename),
    )
