# sorah

video creation platform using convex and reelful api

## setup

1. install dependencies:
```bash
bun install
```

2. configure environment variables in `.env.local`:
```bash
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_REELFUL_API_URL=http://localhost:8000
```

3. run the reelful api (see `docs/reelful-api.md` for setup instructions)

4. start the dev server:
```bash
bun dev
```

## features

- upload 5-10 videos or photos
- describe your video idea
- reelful api generates:
  - script (15 second social media reel)
  - voiceover audio
  - background music
  - animated videos from images
- all intermediate values stored in convex

## architecture

- **frontend**: next.js 15 with react 19
- **backend**: convex for database and storage
- **video generation**: reelful api (dedalus ai + fal + elevenlabs)
- **schema**: projects table stores:
  - prompt and uploaded files
  - generated script
  - audio/music/video urls
  - processing status and errors
