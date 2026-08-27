import importlib.util
from pathlib import Path


LABEL_RENDERER = (
    Path(__file__).resolve().parents[2] / "render-label" / "dev" / "renderer.py"
)
SPEC = importlib.util.spec_from_file_location(
    "kbrd_key_symbol_label_renderer",
    LABEL_RENDERER,
)
if SPEC is None or SPEC.loader is None:
    raise ImportError(f"Unable to load label renderer from {LABEL_RENDERER}")
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)

render = MODULE.render
