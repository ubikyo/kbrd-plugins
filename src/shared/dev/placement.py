"""Placement math shared by the KBRD-DEV renderers, mirroring
`shared/web/geometry.ts` and `shared/web/Placement.tsx`. Every renderer
using precise/aligned placement (rectangle, label, image) resolved the
same "x/y of a `width`x`height` box inside `key`" formula independently —
this centralizes it so they can't silently drift apart.
"""

# How far along its own size a box is pushed back from the point it is
# anchored on: 0 leaves the point at its leading edge, 1 at its trailing
# one. Mirrors `ANCHOR_FACTORS` in the web `AnchorGrid`, and the two have
# to agree — the same config drives both renderers.
ANCHOR_FACTORS = {
    "top": 0.0,
    "middle": 0.5,
    "bottom": 1.0,
    "left": 0.0,
    "center": 0.5,
    "right": 1.0,
}

# What the Position/Dimension blocks default their unit to, and what every
# coordinate stored before that unit existed was written as.
DEFAULT_UNIT = "%"

# Where a coordinate starts from in each unit, when the config carries
# none: the middle of the cell as a percentage, its leading edge in
# millimetres.
_ORIGIN = {"%": 50.0, "mm": 0.0}

# The anchor a precise coordinate uses when the config names none — the
# same middle-center every manifest defaults to, so an element with x/y
# but no anchor stays centred on its coordinate.
DEFAULT_ANCHOR = "middle-center"


def measure(unit, value, extent, unit_scale, default=None):
    """One `%`/`mm` number as pixels.

    A percentage is that share of `extent` (itself already in pixels); a
    millimetre value is scaled by `unit_scale`, the pixels one unit of the
    display is worth (`mm(1)`, or 1 for a pixel-measured display — see the
    renderers' own `key.unit` check).
    """
    resolved = unit if unit in _ORIGIN else DEFAULT_UNIT
    if value is None:
        value = _ORIGIN[resolved] if default is None else default
    number = float(value)
    if resolved == "mm":
        return number * unit_scale
    # A share of the cell is only ever a share of it: the editor's own
    # fields stop at 0 and 100, and a stored value from anywhere else
    # (an older config, a hand-edited one) is held to the same range.
    return extent * max(0.0, min(100.0, number)) / 100


def anchored_corner(anchor, point_x, point_y, width, height):
    """The bottom-left corner Kivy wants for a `width`x`height` box whose
    `anchor` point sits at (`point_x`, `point_y`), with `point_y` measured
    the way Kivy measures y — upward from the widget's bottom.
    """
    vertical, _, horizontal = str(anchor or DEFAULT_ANCHOR).partition("-")
    return (
        point_x - width * ANCHOR_FACTORS.get(horizontal, 0.0),
        # A "top" anchor is the one that needs the full height subtracted,
        # not none of it: y grows upward here, the opposite of the web's.
        point_y - height * (1 - ANCHOR_FACTORS.get(vertical, 0.0)),
    )


def resolve_anchored_position(key, width, height, state, unit_scale=1.0, inset=0):
    """Resolve the position of a `width`x`height` box inside `key`, the way
    the Position block describes it:

    - `precisePlacement` + `positionUnit` + `x`/`y` + `anchor`: the
      coordinate is measured from the cell's top-left corner, in percent of
      the cell or in display units, and the box's own `anchor` point is
      what lands on it.
    - otherwise, `horizontalPosition`/`verticalPosition` alignment, with
      `inset` pixels kept from the key's edges.
    """
    if state.get("precisePlacement", False):
        unit = state.get("positionUnit", DEFAULT_UNIT)
        point_x = key.x + measure(unit, state.get("x"), key.width, unit_scale)
        # Measured downward from the cell's top edge, as the editor and the
        # web renderer both read it.
        point_y = key.top - measure(
            unit, state.get("y"), key.height, unit_scale
        )
        return anchored_corner(
            state.get("anchor"), point_x, point_y, width, height
        )
    return _aligned_position(key, width, height, state, inset)


def resolve_position(key, width, height, state, inset=0, clamp_offset=False):
    """The pre-anchor precise placement: `x`/`y` as a share of the *free*
    space around the box rather than of the cell, so 100 % means "flush
    with the far edge" whatever the box's own size.

    Kept for the renderers that still describe placement that way (image);
    anything on the Position block goes through
    `resolve_anchored_position` instead. `clamp_offset` reproduces
    render-label's original behaviour of never letting the offset go
    negative when the box is bigger than the key.
    """
    if state.get("precisePlacement", False):
        precise_x = max(0, min(100, float(state.get("x", 50)))) / 100
        precise_y = max(0, min(100, float(state.get("y", 50)))) / 100
        available_x = key.width - width
        available_y = key.height - height
        if clamp_offset:
            available_x = max(0, available_x)
            available_y = max(0, available_y)
        return (
            key.x + available_x * precise_x,
            key.y + available_y * (1 - precise_y),
        )
    return _aligned_position(key, width, height, state, inset)


def _aligned_position(key, width, height, state, inset):
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
