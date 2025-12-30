# 📁 Folder Structure

```
magic-tiles/
│
├── 📄 index.html              # Main game page
├── 📄 game.js                 # Game logic
├── 📄 songs.js                # Song loader
├── 📄 README.md               # Full documentation
├── 📄 ADDING-SONGS.md         # Quick guide
│
└── 📁 songs/                  # Songs directory
    │
    ├── 📄 songs-list.json     # List of song folders (UPDATE THIS!)
    │
    ├── 📁 cherry-blossom/     # Song folder 1
    │   ├── 🎵 audio.mp3       # Audio file
    │   └── 📄 map.json        # Beatmap + metadata
    │
    ├── 📁 neon-nights/        # Song folder 2
    │   ├── 🎵 audio.mp3
    │   └── 📄 map.json
    │
    ├── 📁 digital-dream/      # Song folder 3
    │   ├── 🎵 audio.mp3
    │   └── 📄 map.json
    │
    └── 📁 your-song/          # Your new song!
        ├── 🎵 audio.mp3       # Your audio file
        └── 📄 map.json        # Your beatmap
```

## 🎯 To Add a Song:

1. Create a new folder in `songs/`
2. Add `audio.mp3` to the folder
3. Create `map.json` with song data
4. Add folder name to `songs-list.json`
5. Done! 🎉

## ✅ Checklist:

- [ ] Song folder created in `songs/`
- [ ] `audio.mp3` file added
- [ ] `map.json` created with title, artist, difficulty, bpm, notes
- [ ] Folder name added to `songs/songs-list.json`
- [ ] Tested in browser

## 💡 Tips:

- Use lowercase with hyphens for folder names (e.g., `my-song-name`)
- Keep audio files under 10MB for faster loading
- Start with 30-50 notes for your first beatmap
- Test frequently as you add notes

Happy mapping! 🌸
