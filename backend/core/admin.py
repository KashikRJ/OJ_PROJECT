from django.contrib import admin
from .models import User, Problem, TestCase, Submission

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'score')
    search_fields = ('name', 'email')

@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'difficulty')
    search_fields = ('title', 'difficulty')
    list_filter = ('difficulty', 'categories')

@admin.register(TestCase)
class TestCaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'problem', 'input', 'expected_output')
    search_fields = ('problem__title',)
    list_filter = ('problem',)

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'problem', 'status', 'runtime', 'language', 'timestamp')
    search_fields = ('user__name', 'problem__title', 'status', 'language')
    list_filter = ('status', 'language', 'timestamp')
