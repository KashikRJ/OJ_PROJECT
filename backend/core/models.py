from django.db import models

class User(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, null=False,default='Default Name')
    email = models.EmailField(unique=True, null=False)
    password = models.CharField(max_length=255, null=False)
    score = models.IntegerField(default=0, null=False)

    def __str__(self):
        return self.name
