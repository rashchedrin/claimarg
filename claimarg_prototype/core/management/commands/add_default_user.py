from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Creates a default user'

    def handle(self, *args, **kwargs):
        if not User.objects.filter(username='default').exists():
            User.objects.create_user('default', password='defaultpassword')
            self.stdout.write(self.style.SUCCESS('Successfully created user "default"'))
        else:
            self.stdout.write(self.style.WARNING('User "default" already exists'))
