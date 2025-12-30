# 🎵 Quick Guide: Adding a New Song

## Steps:

1. **Create folder** in `songs/` directory:
   ```
   songs/my-song-name/
   ```

2. **Add audio file** named `audio.mp3`:
   ```
   songs/my-song-name/audio.mp3
   ```

3. **Create map.json** with this template:
   ```json
   {
     "title": "🎵 Song Title",
     "artist": "Artist Name",
     "difficulty": "Medium",
     "bpm": 140,
     "notes": [
       { "time": 1000, "lane": 0, "type": "tap" },
       { "time": 2000, "lane": 1, "type": "hold", "duration": 1000 }
     ]
   }
   ```

4. **Update songs-list.json** - add your folder name:
   ```json
   [
     "cherry-blossom",
     "neon-nights",
     "digital-dream",
     "my-song-name"
   ]
   ```

5. **Refresh the game** - your song will appear automatically!

## Note Format:
- `time` - milliseconds from start (1000 = 1 second)
- `lane` - 0, 1, 2, or 3 (left to right)
- `type` - "tap" or "hold"
- `duration` - for holds only (in milliseconds)

## Difficulty Options:
- Easy
- Medium
- Hard
- Expert

That's it! No code changes needed! 🎉
