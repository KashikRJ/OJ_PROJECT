
from django.urls import path
from .views import register, login, logout, index, problem_list, profile, leaderboard, latest_submissions, problem_detail, run_code, submit_code,test_file_operations,test_command_execution,get_code_suggestions

urlpatterns = [
    path('', index, name='index'),
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('problems/', problem_list, name='problem_list'),
    path('profile/<int:user_id>/', profile, name='profile'),
    path('leaderboard/', leaderboard, name='leaderboard'),
    path('latest_submissions/', latest_submissions, name='latest_submissions'),
    path('problem/<int:problem_id>/', problem_detail, name='problem_detail'),
    path('run_code/', run_code, name='run_code'),
    path('submit_code/', submit_code, name='submit_code'),
    path('test_file_operations/', test_file_operations, name='test_file_operations'),
    path('test_command_execution/', test_command_execution, name='test_command_execution'),
    path('get_code_suggestions/', get_code_suggestions, name='get_code_suggestions'),
]

