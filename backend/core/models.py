from django.db import models

class User(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, null=False, default='Default Name')
    email = models.EmailField(unique=True, null=False)
    password = models.CharField(max_length=255, null=False)
    score = models.IntegerField(default=0, null=False)

    def __str__(self):
        return self.name

class Problem(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255, null=False)
    description = models.TextField(null=False)
    difficulty = models.CharField(max_length=50, null=False)
    categories = models.JSONField(null=False)
    time_limit = models.IntegerField(null=False, default=2)  # Time limit in seconds

    def __str__(self):
        return self.title

class TestCase(models.Model):
    id = models.AutoField(primary_key=True)
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    input = models.TextField(null=False)
    expected_output = models.TextField(null=False)

    def __str__(self):
        return f"TestCase for {self.problem.title}"

class Submission(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    status = models.CharField(max_length=50, null=False)
    runtime = models.CharField(max_length=50, null=False)
    language = models.CharField(max_length=50, null=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.problem}"
