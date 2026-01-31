# Novelia - Full-Stack Book Platform

A Django + Vanilla JavaScript platform for Nigerian literature with user authentication, protected book downloads, and admin dashboard.

## Features

✅ **User Authentication**
- Email-based signup and login
- Token-based authentication
- localStorage persistence for user sessions

✅ **Protected Book Downloads**
- 8 Nigerian books available
- PDF downloads only for authenticated users
- Automatic redirect to signup for guests

✅ **Admin Dashboard**
- View all registered users
- User statistics (total users, recent signups)
- Admin-only access

✅ **Dynamic Book Catalog**
- Books stored in database
- Search and filter functionality
- Book details pages

## Tech Stack

**Backend:**
- Django 6.0
- Django REST Framework
- Token Authentication
- SQLite Database

**Frontend:**
- Vanilla HTML/CSS/JavaScript
- No frameworks required
- Responsive design

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Run migrations (if not already done)
python manage.py migrate

# Seed database with books (if not already done)
python manage.py seed_books

# Create admin user
python manage.py createsuperuser
# Enter email, username, and password when prompted

# Start Django server
python manage.py runserver
```

The backend will run at `http://127.0.0.1:8000`

### 2. Frontend Setup

```bash
# Navigate to BOOK STORE directory
cd "BOOK STORE"

# Open with Live Server (VS Code extension)
# Or use any local server
# Python: python -m http.server 5500
# Node: npx serve -p 5500
```

The frontend should run at `http://127.0.0.1:5500` or `http://localhost:5500`

## API Endpoints

### Authentication
- `POST /api/auth/signup/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/logout/` - Logout user
- `GET /api/auth/user/` - Get current user
- `GET /api/auth/users/` - Get all users (admin only)

### Books
- `GET /api/books/` - List all books
- `GET /api/books/<id>/` - Get book details
- `GET /api/books/download/<id>/` - Download PDF (authenticated)

## Usage

### For Regular Users

1. **Sign Up**: Go to `/HTML/sign-up.html` and create an account
2. **Login**: Go to `/HTML/login.html` and sign in
3. **Browse Books**: View books on homepage or `/HTML/books.html`
4. **Download**: Click "Download PDF" on any book detail page (requires login)

### For Admins

1. **Create Admin**: Run `python manage.py createsuperuser` in backend
2. **Access Dashboard**: Go to `/HTML/admin-dashboard.html`
3. **View Users**: See all registered users and statistics

## Project Structure

```
montero/
├── backend/                    # Django backend
│   ├── novelia_project/        # Main project
│   ├── accounts/               # User authentication
│   ├── books/                  # Books management
│   ├── db.sqlite3              # Database
│   └── manage.py
│
├── BOOK STORE/                 # Frontend
│   ├── HTML/                   # All pages
│   ├── CSS/                    # Stylesheets
│   ├── JS/                     # JavaScript
│   └── index.html              # Homepage
│
└── IT NOVEL PDF/               # Book PDF files
```

## Testing

### Test Signup Flow
1. Open `/HTML/sign-up.html`
2. Fill in all fields
3. Submit form
4. Check localStorage for `noveliaToken` and `noveliaUserEmail`
5. Should redirect to homepage

### Test Login Flow
1. Open `/HTML/login.html`
2. Enter email and password
3. Submit form
4. Check localStorage for auth data
5. Should redirect to homepage

### Test Download Protection
1. Logout (clear localStorage)
2. Go to any book detail page (e.g., `/HTML/about-lazy.html`)
3. Click "Download PDF"
4. Should redirect to signup page
5. Login and try again - should download PDF

### Test Admin Dashboard
1. Create superuser: `python manage.py createsuperuser`
2. Login with admin credentials
3. Go to `/HTML/admin-dashboard.html`
4. Should see list of all users

## Notes

- **CORS**: Backend allows requests from `localhost:5500` and `127.0.0.1:5500`
- **Authentication**: Uses Token-based auth (stored in localStorage)
- **Email Persistence**: User email stored in localStorage as requested
- **Admin Access**: Admin dashboard requires superuser privileges

## Troubleshooting

**CORS Errors**: Make sure backend is running on port 8000 and frontend on port 5500

**Download Not Working**: Check that:
- User is logged in (check localStorage)
- PDF file exists in `IT NOVEL PDF/` directory
- Backend server is running

**Admin Dashboard Empty**: Make sure you're logged in as a superuser (created with `createsuperuser`)

## Future Enhancements

- Password reset functionality
- Email verification
- Book reviews and ratings
- User reading history
- Book recommendations
- Payment integration
