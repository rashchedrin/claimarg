# Launching the Django Server in Production

This document provides step-by-step instructions for setting up and launching the Django server in a production environment. Follow these steps carefully to ensure a secure and efficient deployment.

## Prerequisites

- Ensure you have Python installed on your server.
- Install a virtual environment tool, such as `venv`.
- Have access to a production-ready database (e.g., PostgreSQL, MySQL).

## Step 1: Set Up the Environment

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/rashchedrin/claimarg-prototype.git
   cd claimarg-prototype
   ```

2. **Create and Activate a Virtual Environment:**

   ```bash
   python -m venv venv-claimarg-prototype
   source venv-claimarg-prototype/bin/activate  # On Unix or MacOS
   # . venv-claimarg-prototype/Scripts/activate  # On Windows
   ```

## Step 2: Install Dependencies

- Install the required Python packages:

  ```bash
  python -m pip install -r requirements.txt
  ```

## Step 3: Configure Django Settings

1. **Open the `settings.py` file:**

   ```bash
   nano claimarg_prototype/claimarg_prototype/settings.py
   ```

2. **Set `DEBUG` to `False`:**

   ```python
   DEBUG = False
   ```

3. **Configure `ALLOWED_HOSTS`:**

   Add your domain or server IP address to the `ALLOWED_HOSTS` list:

   ```python
   ALLOWED_HOSTS = ['yourdomain.com', 'your.server.ip']
   ```

4. **Secure the `SECRET_KEY`:**

   - Generate a new secret key using a tool like [Django Secret Key Generator](https://djecrety.ir/).
   - Replace the existing `SECRET_KEY` with the new one.

5. **Configure the Database:**

   Update the `DATABASES` setting to use your production database. For example, for PostgreSQL:

   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': 'your_db_name',
           'USER': 'your_db_user',
           'PASSWORD': 'your_db_password',
           'HOST': 'localhost',
           'PORT': '5432',
       }
   }
   ```

## Step 4: Collect Static Files

- Run the following command to collect static files:

  ```bash
  python manage.py collectstatic
  ```

## Step 5: Apply Migrations

- Apply any pending migrations to the database:

  ```bash
  python manage.py migrate
  ```

## Step 6: Set Up a Web Server

1. **Install Gunicorn:**

   ```bash
   python -m pip install gunicorn
   ```

2. **Run Gunicorn:**

   ```bash
   gunicorn claimarg_prototype.wsgi:application --bind 0.0.0.0:8000
   ```

## Step 7: Configure a Reverse Proxy

- Set up a reverse proxy using Nginx or Apache to forward requests to Gunicorn.
- Ensure your web server is configured to handle static files and proxy requests to Gunicorn.

## Step 8: Secure Your Application

- Use HTTPS to secure your application. Obtain an SSL certificate and configure your web server to use it.

## Step 9: Monitor and Maintain

- Set up monitoring and logging to keep track of your application's performance and errors.
- Regularly update your dependencies and apply security patches.

By following these steps, you can deploy and run your Django application in a production environment securely and efficiently.
