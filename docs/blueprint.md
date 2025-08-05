# **App Name**: Drive Butler

## Core Features:

- WhatsApp Command Listener: Receives commands from WhatsApp via Twilio. Uses the Twilio Sandbox for WhatsApp as the entry point.
- Command Parser: Parses commands such as LIST, DELETE, MOVE and SUMMARY with Google Drive paths to operate on, e.g. 'LIST /ProjectX'.
- Google Drive Integrator: Connects to Google Drive via OAuth2. Supports listing, deleting, and moving files/folders.
- AI Document Summarizer: Generates bullet-point summaries of documents using OpenAI's tool or Claude for supported file types (PDF, Docx, TXT).
- Action Logger and Safeguard: Logs all actions performed, maintaining an audit trail for tracking operations and implements safeguards, such as requiring a confirmation keyword before executing delete commands.
- Status Reporter: Sends message to WhatsApp reporting success, failure, or requesting additional information, when necessary.

## Style Guidelines:

- Primary color: Deep indigo (#4B0082), representing the focused operation of a helpful tool.
- Background color: Very light lavender (#F0F8FF), a calming and unobtrusive background.
- Accent color: Soft violet (#8A2BE2), used sparingly for highlighting active elements and key actions.
- Font: 'Inter', a sans-serif font with a neutral and objective feel; for both headlines and body text.
- Use simple, clear icons to represent file actions (list, delete, move, summarize).
- Clean and functional layout with a focus on readability, making the operation status very prominent.