# Beats Backend (Node + Express + SQLite)
## Quick start
1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Start server:
   ```bash
   JWT_SECRET=uma_chave_segura node index.js
   ```
3. Server runs on http://localhost:4000
- Uploads are stored in `backend/uploads`
- DB file: `backend/data.db`

This simple backend implements:
- /api/register {email,password}
- /api/login {email,password}
- /api/upload (multipart form-data: field `beat` file, field `name`) with Authorization: Bearer <token>
- /api/my-beats (list)
- /uploads/:file  (serve uploaded audio)
