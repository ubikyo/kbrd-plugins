from threading import Thread
from urllib.error import URLError
from urllib.request import Request, urlopen

from kivy.clock import Clock
from kbrd_dev.config import API_URL


class Controller:
    def __init__(self, config):
        self.layout_id = config.get("layoutId")
        self.layer_id = config.get("layerId")
        self.event = "up" if config.get("event") == "up" else "down"

    def _activate(self, key):
        try:
            layout_id = int(self.layout_id)
        except (TypeError, ValueError):
            return
        try:
            layer_id = int(self.layer_id)
        except (TypeError, ValueError):
            layer_id = None

        target = (
            f"layer/{layer_id}" if layer_id is not None
            else f"layout/{layout_id}"
        )

        def request():
            try:
                urlopen(
                    Request(
                        f"{API_URL}/api/{target}/activate",
                        method="PUT",
                    ),
                    timeout=2,
                ).close()
                refresh = getattr(getattr(key, "parent", None), "_refresh_layout", None)
                if callable(refresh):
                    Clock.schedule_once(refresh)
            except (OSError, URLError):
                pass

        Thread(target=request, daemon=True).start()

    def on_press(self, key):
        if self.event == "down":
            self._activate(key)

    def on_release(self, key):
        if self.event == "up":
            self._activate(key)
