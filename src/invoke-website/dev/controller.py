import json
from threading import Thread
from urllib.error import URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

from kbrd_dev.config import API_URL


class Controller:
    def __init__(self, config):
        url = config.get("url")
        self.url = url.strip() if isinstance(url, str) else ""
        browser_id = config.get("browserId")
        self.browser_id = (
            browser_id.strip() if isinstance(browser_id, str) else ""
        )

    def on_press(self, key):
        if not self.url or not self.browser_id:
            return
        browser_id = quote(self.browser_id, safe="")
        body = json.dumps({"url": self.url}).encode()

        def send():
            try:
                urlopen(
                    Request(
                        f"{API_URL}/api/browsers/{browser_id}/open",
                        data=body,
                        method="POST",
                        headers={"Content-Type": "application/json"},
                    ),
                    timeout=3,
                ).close()
            except (OSError, URLError):
                pass

        Thread(target=send, daemon=True).start()

    def on_release(self, key):
        pass
