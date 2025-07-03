<h1 align="center" font-style="bold">
  $\Huge\textbf{\color{#2196F3}TECHSAGE}$
</h1>

$${\color{lightblue}An \space \color{#5EEAD4}Academic \space \color{#FBF3D4}Bloggin \space \color{#D4D4FF}Platform}$$

> <img src="https://github.com/user-attachments/assets/393bcacd-269e-45ca-9a99-bca904d71d98" align="right" width="80px"/>
> Specially made for academics & researchers, which supports Markdown, LaTeX and collaborative writing—perfect for sharing papers, tutorials, academic journals and insights.

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

<br><br>
<div align="center">
  <img src="https://github.com/user-attachments/assets/7db7c258-5ec2-4cd9-9c65-db868e95e9b7" width="500px"/>
</div>


<br>

<div align="center">
  
  | $\large\text{\color{#76DCF1}{Tech Stack}}$            | $\large\text{\color{#FD8FAB}{Technology}}$      | $\large\text{\color{#52CCF6}{Version}}$  |
|----------------------|--------------------|----------|
| **Frontend Library**         | Vite+React.js           | `18.2.0`   |
| **Backend Framework**          | Django             | `5.2.1`    |
| **Database**         | MongoDB          | `8.0.9`    |
| **Real-Time**                 | Redis              | `5.0.14.1`      |
| **Tools & Languages**            | Python             | `3.13.1`   |

</div>


> [!IMPORTANT]  
> The binds system has changed. Instead of doing the name of the key, there are scancodes assigned per key.
        
> [!NOTE]  
> The crosshair is designed for a 1920x1080 resolution; in other case, the experience may vary.

<br>

<details>
  <summary>
    <h1>$\large\textbf{\color{#2196F3}{File Strucure}}$</h1><br>
  </summary>
  
  ```console
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

Clone the repository
```console
https://github.com/AfrinJahanEra/TechSage.git
```

To install python dependencies
```console
pip install -r requirements.txt
```

Download Redis from [redis-release](https://github.com/tporadowski/redis/releases) (use the latest zip version)

<h1>$\large\textnormal{\color{#2196F3}{How To Run}}$</h1><br>

Extract the files from `redis-release` zip file. Then click on `redis-server.exe`. To check the server is running or not

Open the command prompt, write
```console
redis-cli
ping
```

Or directly open `redis-cli.exe`
then write `ping`. If it result's `PONG`, then the redis server is connected successfully.

If the `redis-server.exe` isn't running
- Go to task manager (Run as administrator)
- Search for `redis-server`
- If it's on, click on `end task`

Then try running the `redis-server.exe` again.

Then in backend project directory, run
```console
daphne techsage.asgi:application
```


<h1>$\large\textnormal{\color{#2196F3}{License}}$</h1>

> <img src="https://github.com/user-attachments/assets/780a54a1-6b15-45e6-82a2-f6c36f75faea" align = "right" width = "60px">

$${\color{lightblue}This \space \color{#5EEAD4}project \space \color{#FBF3D4}is \space \color{#D4D4FF}under}$$ [MIT License](https://github.com/AfrinJahanEra/TechSage?tab=MIT-1-ov-file)
