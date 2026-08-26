from threading import Lock, Timer

from kbrd_dev.hid import keyboard


class Controller:
    def __init__(self, config):
        raw_keys = config.get("keys", [])
        if isinstance(raw_keys, str):
            raw_keys = raw_keys.split("+")
        self.keys = raw_keys if isinstance(raw_keys, list) else []
        self.behavior = "tap" if config.get("behavior") == "tap" else "hold"
        try:
            duration = float(config.get("durationMs", 50)) / 1000
        except (TypeError, ValueError):
            duration = 0.05
        self.duration = min(5, max(0.01, duration))
        self._timer = None
        self._lock = Lock()
        self._generation = 0

    def on_press(self, key):
        if not self.keys:
            return
        with self._lock:
            self._generation += 1
            generation = self._generation
            if self._timer is not None:
                self._timer.cancel()
                self._timer = None
        keyboard.release(self)
        try:
            keyboard.press(self, self.keys)
        except ValueError:
            return
        if self.behavior == "tap":
            timer = Timer(self.duration, self._expire, args=(generation,))
            timer.daemon = True
            with self._lock:
                self._timer = timer
            timer.start()

    def on_release(self, key):
        if self.behavior == "hold":
            self._release()

    def dispose(self):
        self._release()

    def _expire(self, generation):
        with self._lock:
            if generation != self._generation:
                return
            self._timer = None
        keyboard.release(self)

    def _release(self):
        with self._lock:
            self._generation += 1
            if self._timer is not None:
                self._timer.cancel()
            self._timer = None
        keyboard.release(self)
