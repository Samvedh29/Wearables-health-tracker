import os
import re

def rewrite_celery_imports(root_dir):
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.py'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Replace "from celery import current_app as celery_app"
                new_content = re.sub(
                    r'^from celery import current_app as celery_app',
                    'from app.dummy_celery import celery_app',
                    content,
                    flags=re.MULTILINE
                )
                
                # Replace "from celery import Task, shared_task" or similar leftover celery imports
                new_content = re.sub(r'^from celery import .*$', '', new_content, flags=re.MULTILINE)

                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)

if __name__ == "__main__":
    rewrite_celery_imports("backend/app")
    print("Done rewriting imports")
