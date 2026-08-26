from kivy.graphics import Color, Rectangle
from kivy.uix.widget import Widget
from kivy.utils import get_color_from_hex


def render(key, config):
    current_config = [config]
    widget = Widget(size_hint=(None, None))
    with widget.canvas:
        color = Color(1, 1, 1, 1)
        rectangle = Rectangle(pos=widget.pos, size=widget.size)

    def sync(*args):
        state = current_config[0]
        width_ratio = max(0.05, min(1, float(state.get("width", 50)) / 100))
        height_ratio = max(0.05, min(1, float(state.get("height", 50)) / 100))
        widget.size = (key.width * width_ratio, key.height * height_ratio)

        if state.get("precisePlacement", False):
            precise_x = max(0, min(100, float(state.get("x", 50)))) / 100
            rectangle_x = key.x + (key.width - widget.width) * precise_x
        elif state.get("horizontalPosition", "center") == "left":
            rectangle_x = key.x
        elif state.get("horizontalPosition", "center") == "right":
            rectangle_x = key.right - widget.width
        else:
            rectangle_x = key.x + (key.width - widget.width) / 2

        if state.get("precisePlacement", False):
            precise_y = max(0, min(100, float(state.get("y", 50)))) / 100
            rectangle_y = key.y + (key.height - widget.height) * (1 - precise_y)
        elif state.get("verticalPosition", "middle") == "top":
            rectangle_y = key.top - widget.height
        elif state.get("verticalPosition", "middle") == "bottom":
            rectangle_y = key.y
        else:
            rectangle_y = key.y + (key.height - widget.height) / 2

        widget.pos = (rectangle_x, rectangle_y)
        rectangle.pos = widget.pos
        rectangle.size = widget.size

    def update(state):
        current_config[0] = state
        color.rgba = get_color_from_hex(state.get("color", "#ffffff"))
        sync()

    key.bind(pos=sync, size=sync)
    widget.kbrd_update = update
    update(config)
    key.add_widget(widget)
    return widget
