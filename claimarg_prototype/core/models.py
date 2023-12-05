from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User

# Create your models here.


class Message(models.Model):
    MESSAGE_TYPES = (
        ('claim', 'Claim'),
        ('argument', 'Argument'),
        ('question', 'Question'),
    )
    type = models.CharField(max_length=20, choices=MESSAGE_TYPES)
    content = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)



class Link(models.Model):
    LINK_TYPES = (
        ('proves', 'Proves'),
        ('disproves', 'Disproves'),
        ('is_premise_of', 'Is Premise Of'),
    )

    source_message = models.ForeignKey(Message, related_name='source_links', on_delete=models.CASCADE)
    target_message = models.ForeignKey(Message, related_name='target_links', on_delete=models.CASCADE, null=True, blank=True)
    target_link = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    link_type = models.CharField(max_length=20, choices=LINK_TYPES)

    # Ensure that either target_message or target_link is set, but not both.
    def clean(self):
        if (self.target_message and self.target_link) or (not self.target_message and not self.target_link):
            raise ValidationError("Either target_message or target_link must be set, but not both.")

