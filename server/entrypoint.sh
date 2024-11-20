#!/bin/sh

# Set superuser credentials (hardcoded)
DJANGO_SUPERUSER_USERNAME="admin"
DJANGO_SUPERUSER_PASSWORD="admin123"
DJANGO_SUPERUSER_EMAIL="admin@example.com"

# Make migrations and migrate the database.
echo "Making migrations and migrating the database. "
python manage.py makemigrations --noinput
python manage.py migrate --noinput

# Create superuser if it does not exist
if python3 manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='$DJANGO_SUPERUSER_USERNAME').exists()" ; then
    echo "Superuser already exists."
else
    echo "Creating superuser..."
    python3 manage.py createsuperuser --noinput \
        --username "$DJANGO_SUPERUSER_USERNAME" \
        --email "$DJANGO_SUPERUSER_EMAIL"
    
    # Set the password for the superuser
    python3 manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); user = User.objects.get(username='$DJANGO_SUPERUSER_USERNAME'); user.set_password('$DJANGO_SUPERUSER_PASSWORD'); user.save()"
fi

# Collect static files
python manage.py collectstatic --noinput

exec "$@"