<h1 align="center" font-style="bold">
  $\Huge\textbf{\color{#2196F3}TECHSAGE}$
</h1>

$${\color{lightblue}An \space \color{#5EEAD4}Academic \space \color{#FBF3D4}Bloggin \space \color{#D4D4FF}Platform}$$

> Specially made for academics & researchers, which supports Markdown, LaTeX and collaborative writing—perfect for sharing papers, tutorials, and academic journals and insights.
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

<br>

| $\large\text{\color{#2196F3}{Tech Stack}}$            | $\large\text{\color{red}{Technology}}$      | $\large\text{\color{#EEC900}{Version}}$  |
|----------------------|--------------------|----------|
| **Frontend Library**         | React.js           | 18.2.0   |
| **Backend Framework**          | Django             | 5.2.1    |
|                      | Django Channels    | 4.1.0    |
|                      | Daphne             | 4.0.0    |
|                      | ASGI               | 3.0+     |
| **Database**         | MongoDB            | 8.0.9    |
|                      | mongoengine        | 0.27.0   |
| **Real-Time**        | WebSockets         | via Channels |
|                      | Redis              | 7.x      |
| **Tools & Languages**            | Python             | 3.13.1   |
|                      | OS                 | Windows  |


> [!IMPORTANT]  
> The binds system has changed. Instead of doing the name of the key, there are scancodes assigned per key.
        
> [!NOTE]  
> The crosshair is designed for a 1920x1080 resolution; in other case, the experience may vary.

<br>

<details>
  <summary>
    <h1>$\large\textbf{\color{#2196F3}{File Strucure}}$</h1><br>
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

<h1>$\large\textnormal{\color{#2196F3}{Installation}}$</h1><br>

  To install python dependencies
```
pip install -r requirements.txt
```
<br>

Download Redis from [tporadowski/redis/release](https://github.com/tporadowski/redis/releases) (use the latest zip version)
<br>

then run `redis-server.exe`

<br><br>


<h1>$\large\textnormal{\color{#2196F3}{How To Run}}$</h1><br>

```
daphne techsage.asgi:application
```
