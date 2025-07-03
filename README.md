<a name="top"></a>

<h1 align="center" font-style="bold">
  $\Huge\textbf{\color{#2196F3}TECHSAGE}$
</h1>

$${\color{lightblue}Create, \space \color{#5EEAD4}manage \space \color{#FBF3D4}and \space \color{#D4D4FF}publish \space \color{#5EEAD4}scholarly \space \color{lightblue}blogs \space \color{#FBF3D4}with \space \color{#D4D4FF}real-time \space \color{#FBF3D4}interactions}$$

> <img src="https://github.com/user-attachments/assets/393bcacd-269e-45ca-9a99-bca904d71d98" align="right" width="80px"/>
> An academic blogging platform specially made for academics & researchers, which supports Markdown, LaTeX and collaborative writing—perfect for sharing papers, tutorials, academic journals and insights.

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
  
  | $\large\text{\color{#76DCF1}{Layer}}$            | $\large\text{\color{#FD8FAB}{Technology}}$      | $\large\text{\color{#52CCF6}{Version}}$  |
|----------------------|--------------------|----------|
| **Frontend Library**         | Vite+React.js           | `18.2.0`   |
| **Backend Framework**          | Django             | `5.2.1`    |
| **Database**         | MongoDB          | `8.0.9`    |
| **Real-Time**                 | Redis              | `5.0.14.1`      |
| **Tools & Languages**            | Python             | `3.13.1`   |

</div>

<br>

<details>
  <summary>
    <h1>$\large\textbf{\color{#2196F3}{File Structure}}$</h1><br>
  </summary>
  
  ```console
techsage/
├── backend/
│   ├── manage.py
│   └── ...
├── frontend/
│   ├── index.html
│   └── ...
├── .gitignore
├── README.md
└── requirements.txt 
```
</details>

<h1>$\large\textnormal{\color{#2196F3}{Installation}}$</h1><br>

Clone the repository
```console
https://github.com/AfrinJahanEra/TechSage.git
```
Install `Python` and `React.js` and `Mongodb`. Then create a virtual environment. (Optional but recommended)

For `Linux/MacOS`
```console
python -m venv env
source env/bin/activate
```
For `Windows`
```console
python -m venv env
.\\env\\Scripts\\activate
```

Then install python dependencies
```console
pip install -r requirements.txt
```

Then download Redis from [`redis-release`](https://github.com/tporadowski/redis/releases) (use the latest zip version)

<h1>$\large\textnormal{\color{#2196F3}{How To Run}}$</h1><br>

Extract the files from `redis-release` zip file. Then click on `redis-server.exe`. To check the server is running or not

Open the command prompt, write
```console
cd "path\to\extracted folder"
redis-cli
ping
```

Or directly open `redis-cli.exe`. Then write `ping`. If it result's `PONG`, then the redis server is connected successfully.

Successful connection example :
```console
127.0.0.1:6379> ping
PONG
127.0.0.1:6379>
```
<img src="https://github.com/user-attachments/assets/46b4e6f2-4a4d-4d82-927f-116c85f78511" width=100px align="right">

> [!TIP]  
> If the `redis-server.exe` isn't running then go to task manager (Run as administrator). Search for something like `redis`. If it's on, click on `end task`.

If it still doesn't work, try checking that `port 6379` is already running or not :
- Open command prompt.
- run
```console
netstat -aon | findstr :6379
```
If you see something like this, means this port is already in use.

  <div align="center"> 

  | $\large\text{\color{#76DCF1}{Proto}}$ | $\large\text{\color{#76DCF1}{Local Address}}$ | $\large\text{\color{#76DCF1}{Foreign Address}}$ | $\large\text{\color{#76DCF1}{State}}$ | $\large\text{\color{#76DCF1}{PID}}$ |
  |------|------------------|----------------------|--------------------|-----------|
  | TCP  |  0.0.0.0:6379    |       0.0.0.0:0      |        LISTENING   |    14220  |
  | TCP  |  [::]:6379       |       [::]:0         |        LISTENING   |    14220  |
  
  </div>

- Kill this port. run (Change the PID according to)
```console
taskkill /PID 14220 /F
```
- Then try refreshing the pc and run the `redis-server.exe` again.

Then open this project. In backend project directory, Open terminal and run
```console
daphne techsage.asgi:application
```
 In frontend directory, Open terminal and run
 ```console
npm install
npm run build
```
and serve it with Django or a production web server. Don’t deploy with `npm run dev`.

> [!IMPORTANT]  
> This project uses `ASGI` (not `WSGI`), and runs via Daphne instead of `python manage.py runserver`.
> `Redis` & `MongoDB` must be running before you start the app.

> [!NOTE]  
> The app runs on `http://localhost:8000` by default. If port is taken, use `daphne -b 127.0.0.1 -p 8080 techsage.asgi:application`.

$${\color{#2196F3}You \space can \space change \space the \space port \space (-p) \space or \space host \space (-b) \space as \space needed.}$$

<h1>$\large\textnormal{\color{#2196F3}{Things To Consider}}$</h1>

> [!WARNING]  
> Browsers block WebSocket connections on `HTTP` if the main site is `HTTPS`.
- Use WSS (`wss://`) with SSL in production
- Run `Daphne` behind an HTTPS reverse proxy (like `Nginx`)

<h1>$\large\textnormal{\color{#2196F3}{License}}$</h1>

> <img src="https://github.com/user-attachments/assets/780a54a1-6b15-45e6-82a2-f6c36f75faea" align = "right" width = "60px">

> $${\color{lightblue}This \space \color{#5EEAD4}project \space \color{#FBF3D4}is \space \color{#D4D4FF}under}$$ [MIT License](https://github.com/AfrinJahanEra/TechSage?tab=MIT-1-ov-file)


<a href="#top">Back to top</a>
