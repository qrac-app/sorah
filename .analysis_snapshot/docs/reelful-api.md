# Reelful API Usage Guide

## Overview

The Reelful API is an AI-powered content generation service that creates professional social media content. Given a prompt and optional images, it automatically:

1. **Generates a professional script** optimized for 15-second reels
2. **Creates animated videos** from your images (3 seconds each)
3. **Produces voiceover audio** from the script
4. **Generates background music** matching the voiceover duration

Perfect for creating content for Instagram Reels, TikTok, and YouTube Shorts.

## Base URL

```
https://reelful-production.up.railway.app
```

Replace `your-deployment-url.com` with your actual API deployment URL.

## API Endpoints

### 1. POST `/chat` - Generate Content

Send a message with optional images to generate a complete social media package: script, videos, voiceover, and background music.

**Request Body:**
```json
{
  "message": "Create a social media reel about our new product launch",
  "model": "openai/gpt-5",
  "image_urls": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

**Response:**
```json
{
  "script": "Generated script text...",
  "audio_path": "/media/audio_12345.mp3",
  "music_path": "/media/music_67890.mp3",
  "video_paths": [
    "/media/video_abc123.mp4",
    "/media/video_def456.mp4"
  ],
  "error": null
}
```

**How it Works:**
1. The agent receives your message and image URLs
2. It generates a 15-second script optimized for IG/TikTok/YouTube Shorts
3. The agent automatically calls tools to:
   - Generate 3-second animated videos from each image (using fal AI)
   - Generate voiceover audio from the script (using ElevenLabs)
   - Generate background music matching the voiceover duration (using ElevenLabs Music)
4. Returns the script and paths to generated media files

### 2. POST `/upload-media` - Upload Local Files

Upload your local images to the API and receive URLs that can be used in the `/chat` endpoint.

**Request:**
```bash
curl -X POST "https://your-deployment-url.com/upload-media" \
  -F "files=@image1.jpg" \
  -F "files=@image2.png"
```

**Response:**
```json
{
  "urls": [
    "/media/abc123.jpg",
    "/media/def456.png"
  ],
  "count": 2
}
```

### 3. GET `/media/{filename}` - Download Generated Media

Download your generated videos, audio, and music files.

**Example:**
```
GET https://your-deployment-url.com/media/video_abc123.mp4
GET https://your-deployment-url.com/media/audio_xyz789.mp3
GET https://your-deployment-url.com/media/music_12345.mp3
```

## Quick Start Example

### Complete Workflow (with curl)

**Step 1: Upload Images**

```bash
curl -X POST "https://your-deployment-url.com/upload-media" \
  -F "files=@product_photo.jpg" \
  -F "files=@team_photo.jpg"
```

Response:
```json
{
  "urls": ["/media/abc123.jpg", "/media/def456.jpg"],
  "count": 2
}
```

**Step 2: Generate Content**

```bash
curl -X POST "https://your-deployment-url.com/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create an engaging reel about our AI product that automates workflows. Target tech entrepreneurs.",
    "model": "openai/gpt-5",
    "image_urls": [
      "https://your-deployment-url.com/media/abc123.jpg",
      "https://your-deployment-url.com/media/def456.jpg"
    ]
  }'
```

Response:
```json
{
  "script": "Ever wonder how top businesses save 10 hours a week? Meet FlowAI...",
  "audio_path": "/media/audio_xyz789.mp3",
  "music_path": "/media/music_12345.mp3",
  "video_paths": [
    "/media/video_v1.mp4",
    "/media/video_v2.mp4"
  ],
  "error": null
}
```

**Step 3: Download Your Media**

```bash
# Download voiceover
curl -O "https://your-deployment-url.com/media/audio_xyz789.mp3"

# Download background music
curl -O "https://your-deployment-url.com/media/music_12345.mp3"

# Download videos
curl -O "https://your-deployment-url.com/media/video_v1.mp4"
curl -O "https://your-deployment-url.com/media/video_v2.mp4"
```

### Using Python

```python
import requests

API_URL = "https://your-deployment-url.com"

# Upload images
with open("product.jpg", "rb") as f:
    files = {"files": ("product.jpg", f, "image/jpeg")}
    upload_response = requests.post(f"{API_URL}/upload-media", files=files)
    image_urls = [f"{API_URL}{url}" for url in upload_response.json()["urls"]]

# Generate content
response = requests.post(f"{API_URL}/chat", json={
    "message": "Create a fun reel about our new AI product",
    "model": "openai/gpt-5",
    "image_urls": image_urls
})

result = response.json()
print(f"Script: {result['script']}")
print(f"Audio: {API_URL}{result['audio_path']}")
print(f"Music: {API_URL}{result['music_path']}")
print(f"Videos: {[f'{API_URL}{v}' for v in result['video_paths']]}")
```

### Using JavaScript/Node.js

```javascript
const API_URL = "https://your-deployment-url.com";

// Generate content with publicly accessible images
const response = await fetch(`${API_URL}/chat`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "Create a reel about AI innovation",
    model: "openai/gpt-5",
    image_urls: ["https://example.com/image.jpg"]
  })
});

const result = await response.json();
console.log("Script:", result.script);
console.log("Audio:", `${API_URL}${result.audio_path}`);
console.log("Music:", `${API_URL}${result.music_path}`);
console.log("Videos:", result.video_paths.map(v => `${API_URL}${v}`));
```

## What the API Generates

When you send a request, the AI agent automatically:

### 1. **Script Generation**
- Creates a professional 15-second script optimized for social media
- Includes a hook at the beginning and call-to-action at the end
- Maintains a professional yet engaging tone
- Considers the content of provided images

### 2. **Video Animation** (if images provided)
- Converts each static image into a 3-second animated video
- Uses fal AI's Kling Video technology
- Automatically trims 5-second outputs to 3 seconds
- Returns multiple video files (one per image)

### 3. **Voiceover Audio**
- Generates professional narration from the script
- Uses ElevenLabs text-to-speech
- Optimized voice for social media content
- Returns duration for music matching

### 4. **Background Music**
- Creates AI-generated music matching voiceover length
- Randomly selects from 5 professional styles:
  - **Funky**: Modern jazz with improv elements
  - **Electronic**: Upbeat synthwave and energetic grooves
  - **Lo-fi**: Chill hip-hop with mellow vibes
  - **Cinematic**: Orchestral scores with inspiring builds
  - **Acoustic**: Indie pop with warm guitar tones

## Response Format

All successful responses follow this structure:

```json
{
  "script": "Your generated 15-second script...",
  "audio_path": "/media/audio_[id].mp3",
  "music_path": "/media/music_[id].mp3",
  "video_paths": [
    "/media/video_[id1].mp4",
    "/media/video_[id2].mp4"
  ],
  "error": null
}
```

If an error occurs:
```json
{
  "script": "",
  "audio_path": null,
  "music_path": null,
  "video_paths": null,
  "error": "Error description..."
}
```

## Request Parameters

### POST `/chat`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | string | Yes | Your prompt describing the desired content |
| `model` | string | No | AI model to use (default: "openai/gpt-5") |
| `image_urls` | array | No | List of publicly accessible image URLs |

**Note:** Image URLs must be publicly accessible on the internet or uploaded via `/upload-media` endpoint.

## Important Notes

- **Processing Time**: Video generation can take 30-60 seconds per image
- **File Expiration**: Generated files may be automatically deleted after a period (check with your deployment)
- **Image Requirements**: Images must be JPEG, PNG, or similar formats
- **Concurrent Requests**: The API processes requests sequentially per session
- **Rate Limits**: May apply depending on deployment configuration

## Common Use Cases

### 1. Product Launch Announcement
```json
{
  "message": "Announce our new eco-friendly water bottle. Highlight sustainability and design.",
  "image_urls": ["https://example.com/product.jpg"]
}
```

### 2. Tutorial or How-To Content
```json
{
  "message": "Create a tutorial on using our mobile app for beginners. Make it friendly and simple.",
  "image_urls": ["https://example.com/app-screenshot1.jpg", "https://example.com/app-screenshot2.jpg"]
}
```

### 3. Behind-the-Scenes Content
```json
{
  "message": "Show our team working on the product. Focus on innovation and collaboration.",
  "image_urls": ["https://example.com/team1.jpg", "https://example.com/office.jpg"]
}
```

### 4. Event Promotion
```json
{
  "message": "Promote our upcoming webinar on AI in business. Create excitement and urgency.",
  "image_urls": ["https://example.com/event-banner.jpg"]
}
```

## Support

For technical issues or questions about the API:
- Check response `error` field for specific error messages
- Ensure image URLs are publicly accessible
- Verify your request format matches the examples above
- For deployment-specific issues, contact your API administrator
