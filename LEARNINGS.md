# 2026-05-22

## What I did today
- Used Claude to format an overview of the workflow of my application
- Broke it down into 5 stages:
    1. Frontend
    2. Backend
    3. Database
    4. Worker
    5. Queue

## What I didn't know before
- Workers are used as a way for slow jobs to be done by another program instead of blocking up backend
    - PDF processing may take long, don't want to block backend
- Queue (Redis) is a way for us to leave small messages in RAM to worker to know what tasks need to be done and where to find the files
    - Communication between backend and worker
- localhost addresses are hardcoded in the OS

## What still needs work
- Understanding JWT tokens in cookies for login vs local storage
- How Request/Response cycles work in HTTP when communicating between frontend and backend
- What does worker do with the message left in queue? How does it work in general?

# 2026-05-26

## What I did today
- Installed uv, initialized it and added FastAPI and uvicorn as dependencies onto the venv.
- Wrote my first FastAPI endpoint at the root that returns Hello from Holdview
- Used Claude to mental map on how an HTTP request flows from start (URL) to end

## What I didn't know before
- Program binds to a port, here we're using Uvicorn, listening to incoming HTTP requests
- An application, FastAPI, defines the endpoints
- We create Python venv because we don't want to have dependency conflict problems
    - Only one slot for one version of the library. Some programs may require a specific version, so we just use the venv instead of polluting our system.
    - Makes your program reproducible and easily to clean up
- uv is a package manager. A newer counterpart to pip. 
    - faster, contains workflow tools in one place
- uvicorn is program that runs on the server. Binds to a port, listening for requests. Also serves as a way to send data back to client.
- FastAPI is an app in server memory. Once a request comes in uvicorn hands it over for FastAPI to handle

## What still needs work
- Need to be able to explain how decorators work mechanically and what they are conceptually
- Async/await in Python
- Learn what CORS is
- Be able write my own endpoints and learn how to write them well

# 2026-06-04

## What I did today
- Synced up my local Git with Github repo using SSH token
- Scaffolded my frontend using Vite + React
- Wrote a working FastAPI backend with one endpoint, CORS configured
- Full stack wired end-to-end (React Dev Server to FastAPI + uvicorn), rendering data from API in browser

## What I didn't know before
- CORS allows legit requests/reponses made by JavaScript to safely pass by the browser's safety measure (Same-Origin Policy)
- Browsers only understands HTML/CSS/JS so we need a builder (Vite) that compiles our React (JSX) and TypeScript into JS
- Since the CORS middleware is written on the server side, the browser notes the request from localhost:5173 is cross-origin. Then the request hits uvicorn->FastAPI and goes through the CORS middleware and attaches the CORS header if localhost:5173 is in its allow_origins list.
- Scaffolding means setting up the boilerplate code. In our frontend we used npm create vite@latest to scaffold our Vite project. Then in our backend I used uv init to scaffold our Python project.

## What still needs work
- Async/await in Python
- Be able to understand and speak on every stage that happens in the full stack wiring from frontend to backend.
- Become very proficient in explaining the code in React and Python
- Writing endpoints and React components

# 2026-06-13

## What I did today
- I installed Postgres, setup SQLAlchemy and Alembic.
- Added Users table and User/Email columns as the first changes to our schema in SQLAlchemy. Then used Alembic to autogenerate migration file and reviewed it. Then made our first migration.

## What I didn't know before
- We use a connection string so that our libraries know where to talk to PostgreSQL and not the other way around. 
- SQLAlchemy talks to Postgres through a driver called psycopg, which handles the actual network protocol.
- Understood that the conneciton pool are preopened connections that sessions use to make changes/complete their tasks. Sessions group changes into transactions, which commit atomically or roll back entirely.
- Alembic is able to generate migration files by following through the SQLAlchemy models via Base

## What still needs work
- Locking in the Alembic loop mentally mapped. 
- Database read Path from end to end (SQLAlchemy to psycopg to Postgres and back)
- Process vs Library distinction