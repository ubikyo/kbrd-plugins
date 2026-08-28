"""Placement math shared by the KBRD-DEV renderers, mirroring
`shared/web/Placement.tsx`. Every renderer using precise/aligned placement
(rectangle, label, image) resolved the same "x/y of a `width`x`height` box
inside `key`" formula independently — this centralizes it so they can't
silently drift apart.
"""


def resolve_position(key, width, height, state, inset=0, clamp_offset=False):
    """Resolve the top-left position of a `width`x`height` box inside
    `key`, honouring the plugin config's placement fields:

    - `precisePlacement` + `x`/`y` (0-100 %): exact percentage placement.
    - otherwise, `horizontalPosition`/`verticalPosition` alignment, with
      `inset` pixels kept from the key's edges.

    `clamp_offset` reproduces render-label's original behaviour of never
    letting the precise-placement offset go negative when the box is
    bigger than the key; rectangle/image never clamped it, so they pass
    the default `False` to keep their exact prior output.
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
