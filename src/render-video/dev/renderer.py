from pathlib import Path

from kivy.uix.video import Video


MEDIA_DIR = Path("/data/media")


def render(key, config):
    current_config = [config]
    current_source = [None]
    video = Video(
        state="stop",
        volume=0,
        fit_mode="cover",
        size_hint=(None, None),
    )

    def sync(*args):
        state = current_config[0]
        if not state.get("media"):
            video.size = (0, 0)
            video.opacity = 0
            return

        video.opacity = 1
        unconstrained = state.get("unconstrained", False)
        source_width, source_height = video.texture_size
        if unconstrained and source_width > 0 and source_height > 0:
            scale = max(key.width / source_width, key.height / source_height)
            video.size = (source_width * scale, source_height * scale)
            video.fit_mode = "contain"
        else:
            video.size = key.size
            video.fit_mode = "cover"
        video.pos = (
            key.x + (key.width - video.width) / 2,
            key.y + (key.height - video.height) / 2,
        )

    def update(state):
        current_config[0] = state
        filename = state.get("media", "")
        source = (
            str(MEDIA_DIR / filename)
            if filename and Path(filename).name == filename
            else ""
        )
        playback = source

        if playback != current_source[0]:
            current_source[0] = playback
            video.state = "stop"
            video.unload()
            video.source = ""
            video.options = {"eos": "loop"}
            video.source = source
            video.state = "play" if source else "stop"
        sync()

    def dispose():
        video.state = "stop"
        video.unload()
        video.source = ""

    key.bind(pos=sync, size=sync)
    video.bind(texture_size=sync)
    video.kbrd_update = update
    video.kbrd_dispose = dispose
    update(config)
    key.add_widget(video)
    return video
