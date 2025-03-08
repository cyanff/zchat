# Overview 
Demo is a deployed live @ https://zchat.abyssal.me/
![image](https://github.com/user-attachments/assets/108f6fc4-d4ae-43b8-94d8-87804d9163d5)

![image](https://github.com/user-attachments/assets/6b2d57c2-256e-4de2-bd30-abda9e20cda8)


Made with Zero, Sveltekit, Supabase, and SST.

# Implemented:
- Auth
- Chat sharing
  - Example shared chat link: https://zchat.abyssal.me/share/uSUfDuxFVFD_IQc8DufVZ
- Chat search (ILIKE)
- Markdown support

Zero handles all data sync and search using ILIKE.

Streaming response flow, no SSE!
- Client sends request to /api/generate
- Server receives request and send inference request to Groq
- Chunks are streamed back via UPDATEs to the row in Postgres, Zero handles syncing for free.


