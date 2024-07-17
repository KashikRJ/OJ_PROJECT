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


@csrf_exempt
def problem_detail(request, problem_id):
    if request.method == 'GET':
        try:
            problem = Problem.objects.get(pk=problem_id)
            test_cases = TestCase.objects.filter(problem=problem)
            problem_data = {
                'id': problem.id,
                'title': problem.title,
                'description': problem.description,
                'difficulty': problem.difficulty,
                'categories': problem.categories,
                'test_cases': [{'input': tc.input, 'expected_output': tc.expected_output} for tc in test_cases]
            }
            return JsonResponse(problem_data, safe=False)
        except Problem.DoesNotExist:
            return JsonResponse({'error': 'Problem not found'}, status=404)
    return JsonResponse({'error': 'Invalid request method'}, status=405)



@csrf_exempt
def run_code(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            code = data['code']
            language = data['language']
            input_data = data['input']

            if not code or not language:
                return JsonResponse({'error': 'Missing required fields'}, status=400)

            # Define temp file paths with appropriate extensions
            if language == 'Python':
                code_file = 'main.py'
                command = f'python {code_file}'
            elif language == 'C++':
                code_file = 'main.cpp'
                if platform.system() == "Windows":
                    command = f'g++ {code_file} -o main.exe && main.exe'
                else:
                    command = f'g++ {code_file} -o main && ./main'
            elif language == 'Java':
                code_file = 'main.java'
                command = f'javac {code_file} && java main'
            else:
                return JsonResponse({'error': 'Unsupported language'}, status=400)

            input_file = 'main_input.txt'
            output_file = 'main_output.txt'

            # Clean up any existing temp files
            for temp_file in [code_file, input_file, output_file, 'main', 'main.exe', 'main.class']:
                if os.path.exists(temp_file):
                    os.remove(temp_file)

            # Write the code to a file
            with open(code_file, 'w') as f:
                f.write(code)

            # Write the input to a file
            with open(input_file, 'w') as f:
                f.write(input_data)

            # Execute the command
            process = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
            stdout, stderr = process.communicate(input=input_data.encode())
            runtime = process.returncode

            # Check for errors and return appropriate response
            if process.returncode != 0:
                verdict = 'Error'
                output = stderr.decode('utf-8')
            else:
                verdict = 'Success'
                output = stdout.decode('utf-8')

            # Clean up temporary files
            for temp_file in [code_file, input_file, output_file, 'main', 'main.exe', 'main.class']:
                if os.path.exists(temp_file):
                    os.remove(temp_file)

            return JsonResponse({'output': output, 'verdict': verdict}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except KeyError:
            return JsonResponse({'error': 'Missing required fields'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)



@csrf_exempt
def submit_code(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            problem_id = data.get('problem_id')
            code = data.get('code')
            language = data.get('language')

            if not user_id or not problem_id or not code or not language:
                return JsonResponse({'error': 'Missing required fields'}, status=400)

            user = User.objects.get(pk=user_id)
            problem = Problem.objects.get(pk=problem_id)
            test_cases = TestCase.objects.filter(problem=problem)

            total_score = 0
            difficulty_scores = {"Easy": 5, "Medium": 10, "Hard": 20}
            passed_all = True
            verdict = "Accepted"

            file_extension = ""
            compile_command = ""
            run_command = ""

            if language == "Python":
                file_extension = "py"
                run_command = f"python main.{file_extension}"
            elif language == "Java":
                file_extension = "java"
                compile_command = f"javac main.{file_extension}"
                run_command = f"java main"
            elif language == "C++":
                file_extension = "cpp"
                compile_command = f"g++ main.{file_extension} -o main"
                run_command = f"main.exe" if platform.system() == "Windows" else f"./main"

            # Ensure no leftover files from previous runs
            for file in [f"main.{file_extension}", "main.exe", "main.class", "temp_input.txt", "temp_output.txt"]:
                if os.path.exists(file):
                    os.remove(file)

            code_file = f"main.{file_extension}"
            with open(code_file, 'w') as f:
                f.write(code)

            if compile_command:
                compile_process = subprocess.run(compile_command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                if compile_process.returncode != 0:
                    return JsonResponse({'verdict': 'Compilation Error', 'error': compile_process.stderr.decode('utf-8'), 'status': 'failed'}, status=200)

            for index, test_case in enumerate(test_cases, start=1):
                input_file = 'temp_input.txt'
                output_file = 'temp_output.txt'

                with open(input_file, 'w') as f:
                    f.write(test_case.input)

                command = f"{run_command} < {input_file} > {output_file}"

                start_time = time.time()
                try:
                    process = subprocess.run(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=problem.time_limit)
                except subprocess.TimeoutExpired:
                    passed_all = False
                    verdict = f'TLE at test case {index}'
                    break
                end_time = time.time()

                runtime = int((end_time - start_time) * 1000)
                runtime_str = f"{runtime}ms"

                with open(output_file, 'r') as f:
                    output = f.read()

                if process.returncode != 0 or output.strip() != test_case.expected_output.strip():
                    passed_all = False
                    verdict = f'Failed at test case {index}'
                    break

            # Clean up files after execution
            for file in [code_file, input_file, output_file, "main.exe", "main.class", "main"]:
                if os.path.exists(file):
                    os.remove(file)

            if passed_all:
                # Check if the user has already solved this problem
                if not Submission.objects.filter(user=user, problem=problem, status='Accepted').exists():
                    total_score = difficulty_scores[problem.difficulty]
                    user.score = F('score') + total_score
                    user.save()

                Submission.objects.create(
                    user=user,
                    problem=problem,
                    status='Accepted',
                    runtime=runtime_str,
                    language=language
                )

                return JsonResponse({'verdict': 'Accepted', 'runtime': runtime_str, 'status': 'success', 'score_awarded': total_score}, status=200)
            else:
                Submission.objects.create(
                    user=user,
                    problem=problem,
                    status=verdict,
                    runtime=runtime_str,
                    language=language
                )
                return JsonResponse({'verdict': verdict, 'runtime': runtime_str, 'status': 'failed'}, status=200)

        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Problem.DoesNotExist:
            return JsonResponse({'error': 'Problem not found'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except KeyError:
            return JsonResponse({'error': 'Missing required fields'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)



import requests
import json
import logging
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

GEMINI_API_KEY = 'AIzaSyA-jotJxyqlXpBhAK-ilZzIHgsK1w3QSH8'
GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent'
@csrf_exempt
def get_code_suggestions(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            code = data.get('code')

            if not code:
                logging.error("Missing required fields in the request.")
                return JsonResponse({'error': 'Missing required fields'}, status=400)

            headers = {
                'Content-Type': 'application/json',
                'x-goog-api-key': GEMINI_API_KEY
            }

            payload = {
                'contents': [
                    {
                        'role': 'user',
                        'parts': [{'text': f"The following code has an error. Provide a brief explanation of the error with the title 'Explanation:' followed by the corrected code with the title 'Corrected Code:'. Do not include any additional headings or language tags. The output should only contain these two parts in this exact format:\n\nExplanation:\n<brief explanation of the error>\n\nCorrected Code:\n<corrected code>\n\nHere is the code:\n\n{code}"}]
                    }
                ]
            }

            logging.debug(f"Sending request to Gemini API with payload: {payload}")

            response = requests.post(GEMINI_API_URL, headers=headers, json=payload)
            logging.debug(f"Gemini API response status code: {response.status_code}")
            logging.debug(f"Gemini API response data: {response.json()}")

            response_data = response.json()

            if 'candidates' in response_data:
                suggestion = response_data['candidates'][0]['content']['parts'][0]['text']
                return JsonResponse({'suggestion': suggestion}, status=200)
            else:
                logging.error("No suggestions found in Gemini API response.")
                return JsonResponse({'error': 'No suggestions found'}, status=500)
        except Exception as e:
            logging.error(f"Error in get_code_suggestions: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)





@csrf_exempt
def test_file_operations(request):
    filename = "test_file.txt"
    content = "This is a test file."

    try:
        # Create a file
        with open(filename, "w") as f:
            f.write(content)
        
        # Read the file
        with open(filename, "r") as f:
            file_content = f.read()
        
        # Delete the file
        os.remove(filename)

        return JsonResponse({'message': 'File operations successful', 'content': file_content}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@csrf_exempt
def test_command_execution(request):
    try:
        # Create a simple Java file
        with open("Test.java", "w") as f:
            f.write("public class Test { public static void main(String[] args) { System.out.println(\"Hello, World!\"); } }")
        
        # Compile the Java file
        compile_process = subprocess.Popen("javac Test.java", shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        compile_stdout, compile_stderr = compile_process.communicate()
        
        if compile_stderr:
            return JsonResponse({'error': compile_stderr.decode()}, status=500)
        
        # Run the compiled Java file
        run_process = subprocess.Popen("java Test", shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        run_stdout, run_stderr = run_process.communicate()
        
        if run_stderr:
            return JsonResponse({'error': run_stderr.decode()}, status=500)
        
        # Clean up
        os.remove("Test.java")
        os.remove("Test.class")
        
        return JsonResponse({'message': 'Command execution successful', 'output': run_stdout.decode()}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


