from pathlib import Path

from kivy.uix.video import Video


MEDIA_DIR = Path("/data/media")


def render(key, config):
    current_config = [config]
    current_source = [None]
    completed_plays = [0]
    video = Video(
        state="stop",
        volume=0,
        fit_mode="contain",
        size_hint=(None, None),
    )

    def play_count(state):
        try:
            return max(1, int(state.get("playCount", 1)))
        except (TypeError, ValueError):
            return 1

    def on_eos(instance, value):
        state = current_config[0]
        if not value or state.get("loop", False):
            return
        completed_plays[0] += 1
        if completed_plays[0] < play_count(state):
            video.state = "play"

    video.bind(eos=on_eos)

    def sync(*args):
        state = current_config[0]
        if not state.get("media"):
            video.size = (0, 0)
            video.opacity = 0
            return

        video.opacity = 1
        ratio = 1 if state.get("fullSize", True) else max(
            0.1,
            min(1, float(state.get("size", 75)) / 100),
        )
        video.size = (key.width * ratio, key.height * ratio)
        if not state.get("fullSize", True) and state.get(
            "precisePlacement",
            False,
        ):
            precise_x = max(0, min(100, float(state.get("x", 50)))) / 100
            precise_y = max(0, min(100, float(state.get("y", 50)))) / 100
            video_x = key.x + (key.width - video.width) * precise_x
            video_y = key.y + (key.height - video.height) * (1 - precise_y)
        else:
            horizontal = state.get("horizontalPosition", "center")
            video_x = (
                key.x
                if horizontal == "left"
                else key.right - video.width
                if horizontal == "right"
                else key.x + (key.width - video.width) / 2
            )
            vertical = state.get("verticalPosition", "middle")
            video_y = (
                key.top - video.height
                if vertical == "top"
                else key.y
                if vertical == "bottom"
                else key.y + (key.height - video.height) / 2
            )
        video.pos = (video_x, video_y)

    def update(state):
        current_config[0] = state
        filename = state.get("media", "")
        source = (
            str(MEDIA_DIR / filename)
            if filename and Path(filename).name == filename
            else ""
        )
        loop = bool(state.get("loop", False))
        count = play_count(state)
        playback = (source, loop, count)
        video.fit_mode = (
            "cover" if state.get("fit") == "cover" else "contain"
        )

        if playback != current_source[0]:
            current_source[0] = playback
            completed_plays[0] = 0
            video.state = "stop"
            video.unload()
            video.source = ""
            video.options = {"eos": "loop" if loop else "stop"}
            video.source = source
            video.state = "play" if source else "stop"
        sync()

    def dispose():
        video.state = "stop"
        video.unload()
        video.source = ""

    key.bind(pos=sync, size=sync)
    video.kbrd_update = update
    video.kbrd_dispose = dispose
    update(config)
    key.add_widget(video)
    return video
