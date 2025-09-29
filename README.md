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


<h1>$\large\textbf{\color{#2196F3}{User Roles}}$</h1><br>

| $\large\text{\color{#76DCF1}{Role}}$ | $\large\text{\color{#FD8FAB}{Description}}$ |
| ------------- | --------------------------------------------------------------------------- |
| **User**      | Can write, co-author, comment, upvote, and view academic profiles           |
| **Moderator** | Reviews content, flags issues, and manages roles           |
| **Admin**     | Manages the entire platform, validates badges and user governance |

<br>


<br>

<h1>$\large\textbf{\color{#2196F3}{Features}}$</h1>

<h3>$\large\textbf{\color{#98FB98}{Collaborative Writing}}$</h3>
<ul>
<li>Co-author academic blogs.</li>
<li>Seamless online drafting and synchronized edits</li>
<li>Track edits per author with version history and contribution logs</li>
<br>
</ul>

<h3>$\large\textbf{\color{#AFF4E1}{Academic-Focused Editor}}$</h3>
<ul>
<li>Supports LaTeX, Markdown, code blocks, and diagrams in a unified editor</li>
<li>Designed specifically for academic content creators and researchers</li>
</ul>

<br>
<h3>$\large\textbf{\color{#919DF3}{Serialized and Topic-wise Blogging}}$</h3>
<ul>
<li>Organize academic writing by topics or serialized series</li>
<li>Easy navigation and categorization for readers</li>
</ul>

<h3>$\large\textbf{\color{#00F8FF}{Academic Profiles and Recognition}}$</h3>
<ul>
<li>Link ORCID, Google Scholar, or other academic IDs</li>
<li>Earn badges for contributions like reviews, citations, and collaborations</li>
<li>Personal dashboard showing user impact and progress</li>
<br>
</ul>

<h3>$\large\textbf{\color{#FFFFA0}{Reader Engagement Tools}}$</h3>
<ul>
<li>Support for comments, upvotes, and discussion threads</li>
<li>Build a community around academic writing and reviews</li>
<br>
</ul>

<h3>$\large\textbf{\color{#00E0FF}{Moderation and Admin Capabilities}}$</h3>
<ul>
<li>Admin can manage categories, moderators, assing badges</li>
<li>Moderators can flag spam, review citations, and handle plagiarism reports</li>
<br>
</ul>



<h1>$\large\textbf{\color{#2196F3}{Target Users}}$</h1><br>


| <img width="100px" src="https://github.com/user-attachments/assets/2fc4e105-0636-4cd7-995f-915a667df071" /> | <img width="100px" src="https://github.com/user-attachments/assets/f417534a-6029-44d0-b8bf-c0a3b2033d99" /> | <img width="100px" src="https://github.com/user-attachments/assets/cf05c304-1529-457f-925d-e9ab096a93ab" /> | <img width="100px" src="https://github.com/user-attachments/assets/871fb38f-b86b-4bdd-a676-eaa3ad58d09b" /> |
|:--:|:--:|:--:|:--:|
| University students | Academic researchers | Educators and teachers | Content reviewers |


<details>
  <summary>
    <h1>$\large\textbf{\color{#2196F3}{File Structure}}$</h1><br>
  </summary>
  
  ```console
techsage/
├── frontend/
│   ├── index.html
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── constants.js
│   │   ├── firebase.js
│   │   ├── index.css
│   │   ├── index.jsx
│   │   ├── main.jsx
│   │   ├── styles.css
│   │   └── .env.local
│   ├── .eslintrc.js
│   ├── .gitignore
│   ├── index.html
│   ├── package-lock.json
│   └── vite.config.js
├── backend/
│   ├── manage.py
│   ├── .env
│   ├── .gitignore
│   ├── auth/
│   ├── auth.log
│   ├── badges/
│   ├── blogs/
│   ├── checker/
│   ├── collab/
│   ├── comments/
│   ├── reports/
│   ├── techsage/
│   ├── templates/
│   ├── users/
│   ├── version_control/
│   ├── db.sqlite3
│   ├── debug.log
│   ├── manage.py
│   ├── pytest.ini
│   ├── requirements.txt
│   └── secret_key.py
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
Or download the `zip` file, then extract it in a folder.

<h1>$\large\textnormal{\color{#2196F3}{How To Run}}$</h1><br>

## Prerequisites

- Install `Python` and `React.js` and `Mongodb`(optional).
- Open an account at [`MongoDB Atlas`](https://www.mongodb.com/products/platform/atlas-database) and collect the credentials.
- Open account in [`Cloudinary`](https://cloudinary.com/) and collect credentials from there.
- Then download Redis from [`redis-release`](https://github.com/tporadowski/redis/releases) (use the latest zip version). Extract the files from `redis-release` zip file. Then click on `redis-server.exe`. To check the server is running or not:

  Open the command prompt, write:
  ```console
  cd "path\to\extracted folder"
  redis-cli
  ping
  ```
  Or directly open `redis-cli.exe`. Then write `ping`. If it results in `PONG`, then the Redis server is connected successfully.

  Successful connection example:
  ```console
  127.0.0.1:6379> ping
  PONG
  127.0.0.1:6379>
  ```
  <img src="https://github.com/user-attachments/assets/46b4e6f2-4a4d-4d82-927f-116c85f78511" width=100px align="right">

  > [!TIP]  
  > If the `redis-server.exe` isn't running, go to Task Manager (Run as administrator).
  > - Search for something like `redis`.
  > - If it's on, click on `end task`.

  If it still doesn't work, try checking that port `6379` is already running or not:
  - Open command prompt.
  - Run:
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
    - Kill this port (change the PID according to the output):
      ```console
      taskkill /PID 14220 /F
      ```
    - Then try refreshing the PC and run the `redis-server.exe` again.

<h1>$\large\textnormal{\color{#2196F3}{Server Directory}}$</h1><br>

Then go to the directory path (where the code is):
```console
cd "path\to\directory"
```
Then open right-click and click `open in Terminal`. Then in terminal run:
```console
code .
```
This will directly take you to the VS Code interface. In `Server` directory, open terminal and run:

For `Linux/MacOS`:
```console
python -m venv env
source env/bin/activate
```
For `Windows`:
```console
python -m venv env
.\\env\\Scripts\\activate
```

Which will create the environment. Inside this, install the dependencies:
```console
pip install -r requirements.txt
```
This will install all the `pip` dependencies required to run this code. If it doesn't work, run this in `Command Prompt` or in `VS Code Terminal`:
```console
pip install Django python-dotenv djangorestframework django-cors-headers channels pytz pymongo dnspython certify daphne cloudinary requests pytest pytest-django
```

Then run in `Server` directory:
```console
daphne techsage.asgi:application
```

If it's missing the `static directory` it will give this error:
```python
django.core.exceptions.ImproperlyConfigured: 
You're using the staticfiles app without having set the required STATIC_URL setting.
```

This happens when:
- `django.contrib.staticfiles` is in `INSTALLED_APPS`
- But forgot to define `STATIC_URL` (and optionally `STATICFILES_DIRS`)

Add this to `settings.py`:
```python
import os

# Required
STATIC_URL = '/static/'

# Optional (for development)
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# Optional (for production use)
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
```

Create the static directory (if needed):
```console
mkdir static
```

<h1>$\large\textnormal{\color{#2196F3}{Client Directory}}$</h1><br>

In `Client` directory, open terminal and run:
```console
npm install
npm run dev
```

Make sure `Vite` is installed as a dev dependency in your project. Check `package.json` inside `Client/`. If something like this is present:
```json
"devDependencies": {
  "vite": "^5.0.0",  // or another version
  ...
}
```
It means `Vite` is present. If it's missing, install it:
```console
npm install vite --save-dev
```
> [!TIP]
> To fix vulnerabilities, run this:
> ```console
> npm audit fix
> ```

Or to fix all issues automatically (including breaking changes):
```console
npm audit fix --force
```

> [!CAUTION] 
> Be cautious with `--force`. It may upgrade packages that break the project.

and serve it with Django or a production web server. Don’t deploy with `npm run build`.

> [!IMPORTANT]  
> - This project uses `ASGI` (not `WSGI`), and runs via Daphne instead of `python manage.py runserver`.
> - `Redis` & `MongoDB` must be running before you start the app.

> [!NOTE]  
> The app runs on `http://localhost:8000` by default. If port is taken, use `daphne -b 127.0.0.1 -p 8080 techsage.asgi:application`.

You can change the port (-p) or host (-b) as needed.

$${\color{#2196F3}You \space can \space change \space the \space port \space (-p) \space or \space host \space (-b) \space as \space needed.}$$

<h1>$\large\textnormal{\color{#EE4B2B}{‼ Things To Consider}}$</h1>

List this in `.env.example` file do not commit this `.env` in github

```console
MONGO_DB_NAME=techsage_db
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/techsage_db
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SECRET_KEY=your_django_secret_key
PLAGIARISM_CHECKER_API_KEY=your_plagiarism_api_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_email_password
DEFAULT_FROM_EMAIL=your_email@gmail.com
OTP_VALIDITY_MINUTES=2
ALLOWED_HOSTS=localhost,127.0.0.1
```

> Commit a `.env.example` file instead, which shows others what keys they need to set (but with no real values)

Check port conflicts

<img src="https://github.com/user-attachments/assets/3a3e6527-24d8-4f28-958f-9f17563a9dcb" width=100px align="right">

<div align="center">

| $\large\text{\color{#76DCF1}{Service}}$ | $\large\text{\color{#76DCF1}{Default Port}}$ |
|-----------------------------------------|----------------------------------------------|
| Redis              | `6379`       |
| Daphne / Django    | `8000`       |
| React dev server   | `5173`       |

</div>


> [!WARNING]  
> Browsers block WebSocket connections on `HTTP` if the main site is `HTTPS`.
> - Use WSS (`wss://`) with SSL in production
> - Run `Daphne` behind an HTTPS reverse proxy (like `Nginx`)


<h1>$\large\textnormal{\color{#EE4B2B}{‼ External Dependencies}}$</h1>

Below is a list of key dependencies used in the frontend, along with references to their official documentation for installation, usage, and examples:


| Library/Tool            | Purpose                              | Official Documentation/Reference                              |
|--------------------------|--------------------------------------|--------------------------------------------------------------|
| **Tiptap**              | Rich text editor for collaborative editing and testing. | [Tiptap Documentation](https://tiptap.dev/docs/editor/getting-started/install/react) - Install via `npm install @tiptap/react @tiptap/starter-kit`. |
| **KaTeX**               | Rendering LaTeX equations and mathematical notations. | [KaTeX Documentation](https://katex.org/docs/getting_started.html) - Integrate with React using `react-katex` or directly in components. |
| **Mermaid.js**          | Generating diagrams and flowcharts from text.          | [Mermaid Documentation](https://mermaid.js.org/intro/getting-started.html) - Diagram and chart library. Use `mermaid` package in React for rendering. |
| **React Toast (react-toastify)** | Displaying popup notifications and toasts. | [react-toastify Documentation](https://fkhadra.github.io/react-toastify/introduction/) - Install via `npm install react-toastify`. |
| **React Chart (react-chartjs-2)** | Creating graphs and charts for dashboards and metrics. | [react-chartjs-2 Documentation](https://react-chartjs-2.js.org/) - Install via `npm install react-chartjs-2 chart.js`. |
| **jsPDF**               | Exporting content to PDF format.                     | [jsPDF Documentation](https://parall.ax/products/jspdf) - Install via `npm install jspdf`. |


Note: SMTP for email OTP/verification is handled on the backend (e.g., via Django's email backend or libraries like `smtplib`). Refer to [Django Email Documentation](https://docs.djangoproject.com/en/5.1/topics/email/) for setup.

These libraries were selected based on the project report's requirements for multi-format editing, real-time interactions, and user engagement features. Ensure to check `package.json` for exact versions used in the project.

Make sure none of these ports are already in use.


<h1>$\large\textnormal{\color{#2196F3}{Team Members}}$</h1>

<div align="center">
  
| $\large\text{\color{#DAA5A4}{Name}}$ | $\large\text{\color{#D6C8FF}{Github Profile}}$ | 
|--------------------------------------|------------------------------------------------|
| Afrin Jahan Era | [github](https://github.com/AfrinJahanEra) | 
| Ramisa Anan Rahman | [github](https://github.com/Ramisa105) |
| Ridika Naznin | [github](https://github.com/ridika-2004) |

</div>

<h1>$\large\textnormal{\color{#2196F3}{License}}$</h1>

> <img src="https://github.com/user-attachments/assets/da1a44dc-a69d-4b37-8330-30214c6e768f" align = "right" width = "60px">


> $${\color{lightblue}This \space \color{#5EEAD4}project \space \color{#FBF3D4}is \space \color{#D4D4FF}under}$$ [MIT License](https://github.com/AfrinJahanEra/TechSage?tab=MIT-1-ov-file)


<a href="#top">Back to top</a>
