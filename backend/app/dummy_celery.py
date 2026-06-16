import importlib
import threading
import uuid

class DummyTask:
    def __init__(self):
        self.id = str(uuid.uuid4())

class DummyCeleryApp:
    def send_task(self, name, args=None, kwargs=None, **options):
        args = args or []
        kwargs = kwargs or {}
        try:
            module_name, func_name = name.rsplit('.', 1)
            module = importlib.import_module(module_name)
            func = getattr(module, func_name)
            thread = threading.Thread(target=func, args=args, kwargs=kwargs)
            thread.start()
            return DummyTask()
        except Exception as e:
            print(f"Failed to dispatch dummy celery task {name}: {e}")
            return DummyTask()

celery_app = DummyCeleryApp()
