# Overview 
Demo is a deployed live @ https://zchat.abyssal.me/

Made with Zero, Sveltekit, Supabase, and SST.

Zero handles all data sync and search using ILIKE.

Streaming response flow, no SSE!
- Client sends request to /api/generate
- Server receives request and send inference request to Groq
- Chunks are streamed back via UPDATEs to the row in Postgres, Zero handles syncing for free.
