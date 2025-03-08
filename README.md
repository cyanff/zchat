# Overview 
Demo is a deployed live @ https://zchat.abyssal.me/
![image](https://github.com/user-attachments/assets/108f6fc4-d4ae-43b8-94d8-87804d9163d5)

Made with Zero, Sveltekit, Supabase, and SST.

# Implemented:
- Auth
- Chat sharing
- Chat search (ILIKE)
- Markdown support

Zero handles all data sync and search using ILIKE.

Streaming response flow, no SSE!
- Client sends request to /api/generate
- Server receives request and send inference request to Groq
- Chunks are streamed back via UPDATEs to the row in Postgres, Zero handles syncing for free.


