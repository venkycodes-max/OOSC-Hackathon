# Trailhead Doubt Solver

## API

`POST /api/doubts/solve`

Authenticated with the existing Trailhead bearer token. Send `multipart/form-data` with:

- `subject`: Mathematics | Physics | Chemistry | Biology | Computer Science | English
- `question`: optional typed question
- `file`: optional JPG/JPEG/PNG/WEBP/GIF/PDF/TXT file (max 10 MB)

The endpoint returns a structured teaching response with `answer`, `steps`, `misconception`, `topic`, `practiceQuestion`, and `hint`.

## AI configuration

Keep your existing credentials in `backend/.env` (do not commit them):

```env
GROQ_API_KEY=...
GROQ_MODEL=openai/gpt-oss-120b
GROQ_VISION_MODEL=qwen/qwen3.6-27b
```

The primary reasoning model is OpenAI GPT-OSS 120B. Images are first read by the vision model configured in `GROQ_VISION_MODEL` (default `qwen/qwen3.6-27b`), then the extracted problem is sent to GPT-OSS 120B for the final structured teaching response. The backend also falls back to Llama 4 Scout if the configured vision model rejects a request.

## PDF behavior

Text-based PDFs are parsed with `pdf-parse` and sent to the text model. Scanned/image-only PDFs cannot be OCR'd by this backend; upload the page as JPG/PNG instead.
