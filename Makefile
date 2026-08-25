TARGET := kbrd
REMOTE_DIR := /usr/share/kbrd/plugins
.PHONY: deploy
deploy:
	rsync -av --delete src/ $(TARGET):$(REMOTE_DIR)/
