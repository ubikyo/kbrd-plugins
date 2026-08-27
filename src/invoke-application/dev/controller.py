from threading import Lock, Thread, Timer
from urllib.error import URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

from kbrd_dev.config import API_URL


class Controller:
    LONG_PRESS_SECONDS = 0.8

    def __init__(self, config):
        application_id = config.get("applicationId")
        self.application_id = (
            application_id.strip() if isinstance(application_id, str) else ""
        )
        self.quit_on_long_press = config.get("quitOnLongPress") is True
        self._lock = Lock()
        self._timer = None
        self._generation = 0
        self._long_press_triggered = False

    def on_press(self, key):
        if not self.application_id:
            return
        with self._lock:
            self._generation += 1
            generation = self._generation
            self._long_press_triggered = False
            if self._timer is not None:
                self._timer.cancel()
                self._timer = None
            if self.quit_on_long_press:
                self._timer = Timer(
                    self.LONG_PRESS_SECONDS,
                    self._long_press,
                    args=(generation,),
                )
                self._timer.daemon = True
                self._timer.start()
                return
        self._request("launch")

    def on_release(self, key):
        if not self.application_id or not self.quit_on_long_press:
            return
        with self._lock:
            self._generation += 1
            if self._timer is not None:
                self._timer.cancel()
                self._timer = None
            launch = not self._long_press_triggered
        if launch:
            self._request("launch")

    def dispose(self):
        with self._lock:
            self._generation += 1
            if self._timer is not None:
                self._timer.cancel()
                self._timer = None

    def _long_press(self, generation):
        with self._lock:
            if generation != self._generation:
                return
            self._timer = None
            self._long_press_triggered = True
        self._request("quit")

    def _request(self, action):
        application_id = quote(self.application_id, safe="")

        def send():
            try:
                urlopen(
                    Request(
                        f"{API_URL}/api/applications/{application_id}/{action}",
                        method="POST",
                    ),
                    timeout=3,
                ).close()
            except (OSError, URLError):
                pass

        Thread(target=send, daemon=True).start()
