from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password, check_password
from django.db.models import Count, Case, When,F
from .models import User, Problem, TestCase, Submission
import time,os,platform,logging,subprocess,json
logging.basicConfig(level=logging.DEBUG)

@csrf_exempt
def problem_list(request):
    if request.method == 'GET':
        problems = Problem.objects.annotate(
            total_submissions=Count('submission'),
            correct_submissions=Count(Case(When(submission__status='Accepted', then=1)))
        ).values('id', 'title', 'description', 'difficulty', 'categories', 'total_submissions', 'correct_submissions')

        for problem in problems:
            if problem['total_submissions'] > 0:
                problem['acceptance'] = "{:.2f}%".format((problem['correct_submissions'] / problem['total_submissions']) * 100)
            else:
                problem['acceptance'] = "N/A"
            del problem['total_submissions']
            del problem['correct_submissions']

        return JsonResponse(list(problems), safe=False)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def register(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        if User.objects.filter(email=email).exists():
            return JsonResponse({'message': 'Email already exists'}, status=400)

        hashed_password = make_password(password)
        user = User.objects.create(email=email, password=hashed_password)
        return JsonResponse({'message': 'User registered successfully', 'user_id': user.id}, status=201)

    return JsonResponse({'message': 'Invalid request method'}, status=405)

@csrf_exempt
def login(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        try:
            user = User.objects.get(email=email)
            if check_password(password, user.password):
                response = JsonResponse({'message': 'Login successful', 'user_id': user.id, 'name': user.name}, status=200)
                response.set_cookie('user_id', user.id)
                return response
            else:
                return JsonResponse({'message': 'Invalid password'}, status=400)
        except User.DoesNotExist:
            return JsonResponse({'message': 'User not found'}, status=404)

    return JsonResponse({'message': 'Invalid request method'}, status=405)

@csrf_exempt
def logout(request):
    response = JsonResponse({'message': 'Logout successful'}, status=200)
    response.delete_cookie('user_id')
    return response

def index(request):
    return HttpResponse("Welcome to the Online Judge Home Page")


@csrf_exempt
def profile(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        if request.method == 'GET':
            solved_problems = Submission.objects.filter(user=user, status='Accepted').values_list('problem__title', flat=True).distinct()
            response_data = {
                'name': user.name,
                'email': user.email,
                'problemsSolved': list(solved_problems),
                'totalScore': user.score,
            }
            return JsonResponse(response_data, status=200)
        elif request.method == 'POST':
            data = json.loads(request.body)
            new_name = data.get('name')
            user.name = new_name
            user.save()
            return JsonResponse({'message': 'Name updated successfully'}, status=200)
    except User.DoesNotExist:
        return JsonResponse({'message': 'User not found'}, status=404)
    return JsonResponse({'message': 'Invalid request method'}, status=405)

@csrf_exempt
def leaderboard(request):
    if request.method == 'GET':
        leaderboard_data = User.objects.order_by('-score').values('name', 'score')[:10]  # Top 10 users
        return JsonResponse(list(leaderboard_data), safe=False)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def latest_submissions(request):
    if request.method == 'GET':
        submissions = Submission.objects.order_by('-timestamp')[:10]
        submissions_data = [
            {
                "user": submission.user.name,
                "problem": submission.problem.title,
                "result": submission.status,
                "runtime": submission.runtime,
                "language": submission.language,
                "status": "success" if submission.status == "Accepted" else "failed"
            }
            for submission in submissions
        ]
        return JsonResponse(submissions_data, safe=False)
    return JsonResponse({'error': 'Invalid request method'}, status=405)



