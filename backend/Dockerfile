# Use the official Python image from the Docker Hub with the slim variant
FROM python:3.11-slim

# Install system dependencies for Python, Java, and C++ compilers
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    openjdk-17-jdk-headless \
    && apt-get clean
    
# Set the working directory
WORKDIR /backend

# Copy the requirements file into the image
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port that the app runs on
EXPOSE 8000

# Run the application
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
