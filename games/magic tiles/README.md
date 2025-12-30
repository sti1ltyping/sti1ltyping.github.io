# 🎹 Magic Tiles Game 🌸

A beautiful rhythm game with cherry blossom theme featuring multiple songs, note types, and a scoring system!

## 🎵 Folder Structure

The game automatically loads songs from the `songs/` folder. Each song has its own subfolder:

```
magic-tiles/
├── index.html
├── game.js
├── songs.js
└── songs/
    ├── songs-list.json          # List of all song folders
    ├── cherry-blossom/
    │   ├── audio.mp3            # Song audio file
    │   └── map.json             # Beatmap and metadata
    ├── neon-nights/
    │   ├── audio.mp3
    │   └── map.json
    └── digital-dream/
        ├── audio.mp3
        └── map.json
```

## 🆕 Adding New Songs

**No need to edit HTML or JavaScript files!** Just follow these steps:

### Step 1: Create a Song Folder

Create a new folder in the `songs/` directory with your song name (use lowercase and hyphens):

```
songs/
└── my-awesome-song/
```

### Step 2: Add Audio File

Place your MP3 file in the folder and name it `audio.mp3`:

```
songs/
└── my-awesome-song/
    └── audio.mp3
```

### Step 3: Create map.json

Create a `map.json` file with the following structure:

```json
{
  "title": "🎵 My Awesome Song",
  "artist": "Artist Name",
  "difficulty": "Medium",
  "bpm": 140,
  "notes": [
    { "time": 1000, "lane": 0, "type": "tap" },
    { "time": 1500, "lane": 2, "type": "hold", "duration": 1000 },
    { "time": 2000, "lane": 1, "type": "tap" }
  ]
}
```

**Fields:**
- `title` - Song title (can include emojis!)
- `artist` - Artist name
- `difficulty` - Easy, Medium, Hard, or Expert
- `bpm` - Beats per minute
- `notes` - Array of note objects

**Note format:**
- `time` - Milliseconds from song start
- `lane` - 0, 1, 2, or 3 (left to right)
- `type` - "tap" or "hold"
- `duration` - Required for hold notes (milliseconds)

### Step 4: Update songs-list.json

Add your song folder name to `songs/songs-list.json`:

```json
[
  "cherry-blossom",
  "neon-nights",
  "digital-dream",
  "my-awesome-song"
]
```

**That's it!** The game will automatically detect and display your new song! 🎉

## 🎮 Controls

- **Keyboard**: D, F, J, K (lanes 0-3 from left to right)
- **Touch**: Tap on each lane (mobile)
- **Mouse**: Click on lanes (fallback)

## ⚡ Scoring

- **Perfect** (+3): Within 50ms of hit line - Cyan
- **Great** (+2): Within 100ms of hit line - Green
- **Good** (+1): Within 150ms of hit line - Yellow
- **Miss** (0): Too late or missed - Red
- **Combo Multiplier**: Score increases with consecutive hits!

## 🎨 Features

- ✨ Scrollable song table with automatic loading
- 🎵 Music synchronization
- 🎹 Single tap and hold notes
- 📊 Real-time score and combo tracking
- 🏆 Detailed end-game statistics
- ⏸️ Pause/resume functionality
- 📱 Mobile-friendly touch controls
- 🌸 Beautiful cherry blossom theme
- 🔄 Automatic song discovery - no code changes needed!

## 🔧 Supported Audio Formats

- MP3 (recommended)
- WAV
- OGG
- M4A

Just name your file `audio.mp3` regardless of the actual format.

## 📝 Tips for Creating Beatmaps

1. **Listen to your song** and identify the beats
2. **Use a DAW or audio editor** (like Audacity) to find exact timestamps in milliseconds
3. **Start simple** with one note per beat
4. **Test frequently** as you add notes
5. **Use holds** for sustained notes in the music
6. **Vary lanes** to make it more interesting and challenging

### Example Workflow:

1. Open your audio file in Audacity
2. Find the timestamp of each beat (View → Show Timeline)
3. Convert timestamps to milliseconds
4. Add notes to your map.json at those times
5. Test in-game and adjust timing as needed

## 🎯 Difficulty Guidelines

- **Easy**: 60-90 notes, mostly single taps, 100-130 BPM
- **Medium**: 90-150 notes, mix of taps and holds, 130-150 BPM
- **Hard**: 150-250 notes, complex patterns, 150-180 BPM
- **Expert**: 250+ notes, rapid fire patterns, 180+ BPM

## 🐛 Troubleshooting

**Songs not loading?**
1. Check that `songs-list.json` includes your folder name
2. Verify `map.json` is valid JSON (use a JSON validator)
3. Check browser console for error messages
4. Ensure folder names match exactly (case-sensitive)

**Music not playing?**
1. Make sure the audio file is named `audio.mp3`
2. Verify the file is in the correct song folder
3. Check browser console for loading errors
4. Try converting your audio to MP3 format

**Notes not synced with music?**
- Adjust the `time` values in your beatmap
- Audio may have a delay on some browsers
- Consider adding a small offset (50-100ms) if consistently off

## 📜 License

Free to use and modify. Created with 💖 and lots of energy drinks!

Enjoy creating and playing! 🌸✨

