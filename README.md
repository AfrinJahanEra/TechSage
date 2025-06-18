# TechSage

Sample Project Structure

```
project-root/
│
├── backend/                  # Django backend
│   ├── project/              # Main Django project folder
│   │   ├── __init__.py
│   │   ├── settings.py       # Django settings
│   │   ├── urls.py           # Main URLs
│   │   └── wsgi.py
│   ├── app/                  # Your Django app(s)
│   │   ├── __init__.py
│   │   ├── models.py        # MongoDB models (using Djongo or similar)
│   │   ├── views.py         # API views
│   │   ├── serializers.py   # DRF serializers
│   │   └── urls.py          # App-specific URLs
│   ├── manage.py
│   ├── requirements.txt      # Python dependencies
│   └── .env                  # Environment variables
│
├── frontend/                 # React frontend
│   ├── public/               # Static files
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── assets/           # Images, fonts, etc.
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service calls
│   │   ├── store/           # State management (Redux, etc.)
│   │   ├── utils/           # Utility functions
│   │   ├── App.js
│   │   ├── index.js
│   │   └── styles/          # Global styles
│   ├── package.json
│   ├── package-lock.json
│   └── .env                  # Frontend environment variables
│
├── .gitignore
├── README.md
├── docker-compose.yml        # If using Docker
└── requirements.txt         # Top-level Python requirements (optional)
```

# Use WebSocket in Frontend
Connect from frontend using JavaScript like:
```
const socket = new WebSocket("ws://127.0.0.1:8000/ws/comments/BLOG_ID/");

socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    console.log("New comment received", data);
    // Append to comment thread dynamically
};

function sendComment(content, author_id, parent_id=null) {
    socket.send(JSON.stringify({
        content: content,
        author_id: author_id,
        parent_id: parent_id
    }));
}
```
