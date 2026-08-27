from pathlib import Path

from kivy.uix.image import Image


MEDIA_DIR = Path("/data/media")


def render(key, config):
    current_config = [config]
    image = Image(
        allow_stretch=True,
        keep_ratio=True,
    )

    def sync(*args):
        state = current_config[0]
        if not state.get("media"):
            image.size = (0, 0)
            image.opacity = 0
            return
        image.opacity = 1
        ratio = 1 if state.get("fullSize", True) else max(
            0.1,
            float(state.get("size", 75)) / 100,
        )
        image.size = (key.width * ratio, key.height * ratio)
        if not state.get("fullSize", True) and state.get("precisePlacement", False):
            precise_x = max(0, min(100, float(state.get("x", 50)))) / 100
            precise_y = max(0, min(100, float(state.get("y", 50)))) / 100
            image_x = key.x + (key.width - image.width) * precise_x
            image_y = key.y + (key.height - image.height) * (1 - precise_y)
        else:
            horizontal = state.get("horizontalPosition", "center")
            image_x = (
                key.x
                if horizontal == "left"
                else key.right - image.width
                if horizontal == "right"
                else key.x + (key.width - image.width) / 2
            )
            vertical = state.get("verticalPosition", "middle")
            image_y = (
                key.top - image.height
                if vertical == "top"
                else key.y
                if vertical == "bottom"
                else key.y + (key.height - image.height) / 2
            )
        image.pos = (image_x, image_y)

    def update(state):
        current_config[0] = state
        filename = state.get("media", "")
        source = (
            str(MEDIA_DIR / filename)
            if filename and Path(filename).name == filename
            else ""
        )
        if image.source != source:
            image.source = source
            image.reload()
        sync()

    key.bind(pos=sync, size=sync)
    image.kbrd_update = update
    update(config)
    key.add_widget(image)
    return image
