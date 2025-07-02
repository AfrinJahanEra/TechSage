<h1 align="center" font-style="bold">
  $\Huge\textnormal{\color{#2196F3}TechSage}$
</h1>

> A blogging platform for academics & researchers, which supports Markdown, LaTeX and collaborative writing—perfect for sharing papers, tutorials, and academic journals and insights.
>
> <img src="https://github.com/user-attachments/assets/0eae2112-58da-4f03-883b-06e1ac956e72" align="right" width="100px"/>

<br>

![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![WebSocket](https://img.shields.io/badge/Real--Time-WebSocket-6A1B9A?style=for-the-badge)
![REST API](https://img.shields.io/badge/API-REST--Ful-orange?style=for-the-badge)
![JWT](https://img.shields.io/badge/Auth-JWT-blueviolet?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-Backend%20Secured-red?style=for-the-badge)
![Admin Panel](https://img.shields.io/badge/Admin-Panel-228B22?style=for-the-badge)
![CKEditor](https://img.shields.io/badge/Editor-CKEditor-7952B3?style=for-the-badge)

<details>
  <summary>
    <h1>FILE STRUCTURE</h1><br>
  </summary>
  
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
</details>

<details>
  <summary>
    <h1>$\textnormal{\color{#2196F3}{INSTALLATION}}$</h1><br>
  </summary>

  To install python dependencies
```
pip install -r requirements.txt
```


Download Redis from `https://github.com/tporadowski/redis/releases` (use the latest zip version)
then run `redis-server.exe`

</details>


<details>
  <summary>
    <h1>$\textnormal{\color{#2196F3}{HOW TO RUN}}$</h1><br>
  </summary>
  
```
daphne techsage.asgi:application
```
</details>
