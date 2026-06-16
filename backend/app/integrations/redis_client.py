"""Centralized Redis client for the application."""

from functools import lru_cache

class DummyRedis:
    def __init__(self):
        self._data = {}
    def get(self, key):
        return self._data.get(key)
    def set(self, key, value, *args, **kwargs):
        self._data[key] = value
    def setex(self, key, time, value):
        self._data[key] = value
    def delete(self, *keys):
        for key in keys:
            self._data.pop(key, None)
    def exists(self, key):
        return key in self._data

@lru_cache()
def get_redis_client():
    return DummyRedis()
