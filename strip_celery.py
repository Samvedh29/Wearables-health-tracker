import os
import re

def strip_celery(root_dir):
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.py'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Remove from celery import ...
                content = re.sub(r'^from celery import .*$', '', content, flags=re.MULTILINE)
                content = re.sub(r'^from celery\.exceptions import .*$', '', content, flags=re.MULTILINE)
                
                # Remove @shared_task(...)
                content = re.sub(r'@shared_task\([^)]*\)', '', content)
                # Remove @shared_task
                content = re.sub(r'@shared_task', '', content)
                
                # Replace .delay(...) with direct call
                # Note: this is a bit crude but we'll try to find any function call ending in .delay(
                # and replace it with just the function call.
                content = re.sub(r'([a-zA-Z0-9_]+)\.delay\(', r'\1(', content)

                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)

if __name__ == "__main__":
    strip_celery("backend/app")
    print("Done")
