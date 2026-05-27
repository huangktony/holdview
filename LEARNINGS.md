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