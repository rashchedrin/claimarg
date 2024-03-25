# claimarg

`claimarg` is a Django-based web application designed for structured argumentation. It allows users to post messages categorized as claims, arguments, or questions, and displays all posted messages on a single page.

## Installation

1. **Clone the Repository**:
   ```
   git clone https://github.com/rashchedrin/claimarg-prototype.git
   cd claimarg-prototype
   ```

2. **Create and Activate a Virtual Environment**:
   ```
   python -m venv venv-claimarg-prototype
   # On Windows
   . venv-claimarg-prototype/Scripts/activate
   # On Unix or MacOS
   source venv-claimarg-prototype/bin/activate
   ```

3. **Install Dependencies**:
   ```
   python -m pip install -r requirements.txt
   ```

4. **Apply Migrations**:
   ```
   cd claimarg_prototype
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Enable google auth**:
   5.1. Create admin account: python manage.py createsuperuser
   5.2. in http://127.0.0.1:8000/admin/ add sites: localhost:8000 and 127.0.0.1:8000
   5.3. in social accounts add social application
      Provider: google
      name: ClaimArg google login (any will work)
      Client ID: client ID from console.cloud.google.com -> APIs and services -> credentials
      Secret key:  Client secret  from that page
      Sites: all

## Usage 

To run the server, execute the following command:

```
. venv-claimarg-prototype/Scripts/activate
cd claimarg_prototype
python manage.py runserver
```

Then, open your web browser and visit `http://127.0.0.1:8000/core/post_message/` to view and post messages. All messages are posted as the default user.

## Features

- Post messages with types: Claim, Argument, or Question.
- View a list of all posted messages on the same page.

## Contributing

Contributions to `claimarg` are welcome. This project is a part of humanity's superintelligence movement. Joint our movement, and build superintelligent humanity with us!

Our discord server: https://discord.gg/QQADxSD5

We are on Reddit: https://www.reddit.com/r/humanitysuperint/