# Lintara

**Offline AI-Powered Code Analysis Platform**

Lintara is an offline full-stack application that uses local LLMs to analyze your code for bugs, security vulnerabilities, and best practices.

![Lintara Dashboard](./docs/dashboard.png)

## Features

-  **User Authentication** — Secure JWT-based login/register
-  **AI Code Analysis** — Local LLM-powered code review
-  **Multiple Languages** — Python, JavaScript, TypeScript, Java, C++, Go, Rust etc.
-  **Real-time Updates** — Auto-refresh during analysis
-  **Analysis History** — View, re-analyze, or delete past submissions
-  **Clean UI** — Modern React + Tailwind interface

## Tech Stack

**Backend:**
- FastAPI (Python)
- PostgreSQL
- SQLAlchemy ORM
- Alembic (migrations)
- JWT Authentication
- Ollama (Local LLM)

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- Vite
- React Router
- Axios

## Prerequisites

Before running Lintara, ensure you have:

- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **PostgreSQL 14+** — [Download](https://www.postgresql.org/download/)
- **Ollama** — [Download](https://ollama.com/)

## Operating Systems Note
Lintara works on all major operating systems. The core technologies (Python, Node.js, PostgreSQL, and Ollama) are all cross-platform. For Linux and macOS users, the setup instructions above will work as is.

For Windows users, there are a few differences to note. Instead of using `source venv/bin/activate` to activate the Python virtual environment, use `venv\Scripts\activate`. PostgreSQL can be installed using the Windows installer from the official website, and you'll manage the service through the Windows Services panel or pgAdmin instead of systemctl.

Ollama has a native Windows installer available at ollama.com that works just like the Linux version. All the Python and Node.js commands remain exactly the same across all platforms. If you're on Windows and prefer a Linux-like environment, you can also use WSL2 (Windows Subsystem for Linux) to follow the Linux instructions exactly.

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/n-dlms/lintara.git
cd lintara
```

### 2. Set up the database
```bash

sudo systemctl start postgresql

sudo -u postgres psql -c "CREATE DATABASE lintara;"

sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

### 3. Set up the backend
```bash
cd backend

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt

cat > .env << 'ENVEOF'
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lintara
SECRET_KEY=your-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVEOF

# Run the database migrations using alembic
alembic upgrade head
```

### 4. Set up the frontend
```bash
cd ../frontend

npm install
```

### 5. Set up Ollama
```bash
curl -fsSL https://ollama.com/install.sh | sh

ollama pull codellama
```

## Running the Application

You'll need **3 terminal windows**:

### Terminal 1 — Ollama
```bash
ollama serve
```

### Terminal 2 — Backend
```bash
cd lintara/backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Terminal 3 — Frontend
```bash
cd lintara/frontend
npm run dev
```

Open your browser at **http://localhost:5173**

## API Documentation

Once the backend is running, view the interactive API docs at:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Project Structure
```
lintara/
├── backend/
│   ├── app/
│   │   ├── routers/       # API endpoints
│   │   ├── services/      # Business logic (LLM integration)
│   │   ├── auth.py        # JWT authentication
│   │   ├── database.py    # Database connection
│   │   ├── models.py      # SQLAlchemy models
│   │   ├── schemas.py     # Pydantic schemas
│   │   └── main.py        # FastAPI app
│   ├── alembic/           # Database migrations
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── utils/         # Helper functions
│   │   └── App.tsx        # Main app component
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Screenshots

### Login Page
![Login](./docs/login.png)

### Dashboard
![Dashboard](./docs/dashboard.png)

### Code Analysis
![Analysis](./docs/analysis1.png)
![Analysis](./docs/analysis2.png)
![Analysis](./docs/analysis3.png)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Author

 Ntokozo Dlamini
[@n-dlms](https://github.com/n-dlms)

## Important Note (Take your time)
Once you have the application running, here's how to get started. 

First, navigate to http://localhost:5173 in your browser and you'll see the login page. Since you're a new user, click on the "Register" link to create an account. Fill in your email, choose a username, and create a password (minimum 6 characters).

After registering, you'll be redirected to the login page where you can sign in with your new credentials. Once logged in, you'll land on the dashboard where you can immediately start submitting code for analysis. Simply give your submission a title, select the programming language, paste your code, and click "Analyze Code". Your analysis history will appear on the right side, and you can click any previous analysis to view its results.

### Lintara runs completely offline !

This is one of the key advantages of using Ollama for AI-powered analysis. Once you've installed all the dependencies and pulled the CodeLlama model, you don't need an internet connection to use the application. Your code never leaves your machine all analysis happens locally using the LLM running on your own hardware.

This makes Lintara perfect for analyzing sensitive or proprietary code that you wouldn't want to send to cloud-based AI services. The only time you need internet is during the initial setup to download the dependencies and the Ollama model. After that, feel free to disconnect and analyze code anywhere anytime without worrying about internet connectivity.

This application uses Ollama to run large language models locally on your machine. The analysis speed depends entirely on your hardware specifications. If you have a dedicated GPU (NVIDIA with CUDA support), the code analysis will complete in seconds. However, if you're running on CPU only (like an Intel i3 or similar), expect the analysis to take anywhere from 2-5 (even more than 8) minutes per submission, this is completely normal and not a bug. The application handles this gracefully by showing a "Processing your code, please be patient" message and automatically refreshing when the analysis completes.

However, for the best experience, I recommend having at least 8GB of RAM and a modern processor. If you're just testing the application and don't want to wait for the full analysis, you can use the smaller `tinyllama` model instead of `codellama` by running `ollama pull tinyllama` and updating the model name in `backend/app/services/llm.py`. This significantly reduces wait times but may provide less detailed code analysis.

Enjoy : )