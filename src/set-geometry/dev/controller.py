from threading import Thread
from urllib.error import URLError
from urllib.request import Request, urlopen

from kivy.clock import Clock
from kbrd_dev.config import API_URL


class Controller:
    def __init__(self, config):
        self.geometry_id = config.get("geometryId")
        self.workspace_id = config.get("workspaceId")
        self.event = "up" if config.get("event") == "up" else "down"

    def _activate(self, key):
        try:
            geometry_id = int(self.geometry_id)
        except (TypeError, ValueError):
            return
        try:
            workspace_id = int(self.workspace_id)
        except (TypeError, ValueError):
            workspace_id = None

        target = (
            f"workspace/{workspace_id}" if workspace_id is not None
            else f"geometry/{geometry_id}"
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
                refresh = getattr(getattr(key, "parent", None), "_refresh_geometry", None)
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
