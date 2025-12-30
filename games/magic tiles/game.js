// Game configuration - Default values
const DEFAULT_CONFIG = {
  LANES: 4,
  NOTE_SPEED: 4, // Default pixels per frame
  NOTE_SIZE: 40, // Default note height in pixels
  HIT_LINE_Y: 0.85, // Default 85% down the screen
  PERFECT_WINDOW: 50, // milliseconds
  GREAT_WINDOW: 100,
  GOOD_WINDOW: 150,
  SCORE_PERFECT: 3,
  SCORE_GREAT: 2,
  SCORE_GOOD: 1,
};

// Difficulty presets - can be overridden by song config
const DIFFICULTY_PRESETS = {
  'Easy': {
    NOTE_SPEED: 3,
    NOTE_SIZE: 40, // Larger notes, easier to hit
    HIT_LINE_Y: 0.88,
    PERFECT_WINDOW: 80,
    GREAT_WINDOW: 150,
    GOOD_WINDOW: 250,
  },
  'Medium': {
    NOTE_SPEED: 4,
    NOTE_SIZE: 30, // Standard note size
    HIT_LINE_Y: 0.85,
    PERFECT_WINDOW: 60,
    GREAT_WINDOW: 120,
    GOOD_WINDOW: 200,
  },
  'Hard': {
    NOTE_SPEED: 5,
    NOTE_SIZE: 25, // Smaller notes, harder to hit
    HIT_LINE_Y: 0.82,
    PERFECT_WINDOW: 45,
    GREAT_WINDOW: 90,
    GOOD_WINDOW: 150,
  },
  'Expert': {
    NOTE_SPEED: 6,
    NOTE_SIZE: 20, // Very small notes, precise timing needed
    HIT_LINE_Y: 0.80,
    PERFECT_WINDOW: 30,
    GREAT_WINDOW: 70,
    GOOD_WINDOW: 120,
  }
};

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.setupCanvas();
    
    this.currentSong = null;
    this.audio = new Audio(); // Audio element for playing music
    this.audio.volume = 0.7; // Set default volume
    
    // Active game config (will be set per song)
    this.config = { ...DEFAULT_CONFIG };
    
    this.notes = [];
    this.activeHolds = [];
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.stats = {
      perfect: 0,
      great: 0,
      good: 0,
      miss: 0
    };
    
    this.isPlaying = false;
    this.isPaused = false;
    this.startTime = 0;
    this.pauseTime = 0;
    this.gameTime = 0;
    
    this.keyStates = {};
    this.lanePressed = [false, false, false, false];
    
    this.setupEventListeners();
    this.displaySongList();
    
    // Animation
    this.animationId = null;
  }
  
  setupCanvas() {
    const container = this.canvas.parentElement;
    this.canvas.width = 600;
    this.canvas.height = window.innerHeight;
    
    window.addEventListener('resize', () => {
      this.canvas.height = window.innerHeight;
    });
  }
  
  setupEventListeners() {
    // Keyboard controls - DFJK keys for lanes 0-3
    const keyMap = {
      'd': 0,
      'f': 1,
      'j': 2,
      'k': 3,
      'D': 0,
      'F': 1,
      'J': 2,
      'K': 3
    };
    
    document.addEventListener('keydown', (e) => {
      if (!this.isPlaying || this.isPaused) return;
      
      const lane = keyMap[e.key];
      if (lane !== undefined && !this.keyStates[e.key]) {
        this.keyStates[e.key] = true;
        this.lanePressed[lane] = true;
        this.handleLanePress(lane);
      }
    });
    
    document.addEventListener('keyup', (e) => {
      const lane = keyMap[e.key];
      if (lane !== undefined) {
        this.keyStates[e.key] = false;
        this.lanePressed[lane] = false;
        this.handleLaneRelease(lane);
      }
    });
    
    // Touch controls for mobile
    this.canvas.addEventListener('touchstart', (e) => {
      if (!this.isPlaying || this.isPaused) return;
      e.preventDefault();
      
      for (let touch of e.changedTouches) {
        const lane = this.getTouchLane(touch.clientX);
        if (lane !== -1) {
          this.lanePressed[lane] = true;
          this.handleLanePress(lane);
        }
      }
    });
    
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      
      for (let touch of e.changedTouches) {
        const lane = this.getTouchLane(touch.clientX);
        if (lane !== -1) {
          this.lanePressed[lane] = false;
          this.handleLaneRelease(lane);
        }
      }
    });
    
    // Mouse controls as fallback
    this.canvas.addEventListener('mousedown', (e) => {
      if (!this.isPlaying || this.isPaused) return;
      const lane = this.getMouseLane(e.clientX);
      if (lane !== -1) {
        this.lanePressed[lane] = true;
        this.handleLanePress(lane);
      }
    });
    
    this.canvas.addEventListener('mouseup', (e) => {
      const lane = this.getMouseLane(e.clientX);
      if (lane !== -1) {
        this.lanePressed[lane] = false;
        this.handleLaneRelease(lane);
      }
    });
    
    // UI buttons
    document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
    document.getElementById('backBtn').addEventListener('click', () => this.backToMenu());
    document.getElementById('retryBtn').addEventListener('click', () => this.retrySong());
    document.getElementById('menuBtn').addEventListener('click', () => this.backToMenu());
  }
  
  getTouchLane(clientX) {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const laneWidth = this.canvas.width / this.config.LANES;
    return Math.floor(x / laneWidth);
  }
  
  getMouseLane(clientX) {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const laneWidth = this.canvas.width / this.config.LANES;
    const lane = Math.floor(x / laneWidth);
    return lane >= 0 && lane < this.config.LANES ? lane : -1;
  }
  
  async displaySongList() {
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');
    const songTable = document.getElementById('songTable');
    const songTableBody = document.getElementById('songTableBody');
    
    try {
      // Load songs from the songs folder
      const songs = await songLoader.loadSongList();
      
      loadingMessage.style.display = 'none';
      
      if (songs.length === 0) {
        errorMessage.style.display = 'block';
        return;
      }
      
      // Display the table
      songTable.style.display = 'table';
      songTableBody.innerHTML = '';
      
      // Add each song to the table
      songs.forEach((song, index) => {
        const row = document.createElement('tr');
        row.style.animationDelay = `${0.3 + index * 0.1}s`;
        
        // Get difficulty class for styling
        const difficultyClass = song.difficulty.toLowerCase();
        
        row.innerHTML = `
          <td>${song.title}</td>
          <td>${song.artist}</td>
          <td><span class="difficulty-badge ${difficultyClass}">${song.difficulty}</span></td>
          <td>${song.bpm} BPM</td>
          <td style="text-align: center;">
            <button class="play-btn" data-song-id="${song.id}">
              ▶ Play
            </button>
          </td>
        `;
        
        // Add click handler to the play button
        const playBtn = row.querySelector('.play-btn');
        playBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.startSong(song);
        });
        
        // Also make the whole row clickable
        row.addEventListener('click', () => {
          this.startSong(song);
        });
        
        songTableBody.appendChild(row);
      });
      
    } catch (error) {
      console.error('Error displaying songs:', error);
      loadingMessage.style.display = 'none';
      errorMessage.style.display = 'block';
      errorMessage.textContent = 'Error loading songs. Please check the console for details.';
    }
  }
  
  startSong(song) {
    this.currentSong = song;
    
    // Load song-specific config or use difficulty preset
    this.config = { ...DEFAULT_CONFIG };
    
    // First apply difficulty preset if it exists
    if (song.difficulty && DIFFICULTY_PRESETS[song.difficulty]) {
      Object.assign(this.config, DIFFICULTY_PRESETS[song.difficulty]);
    }
    
    // Then apply any song-specific overrides from the map.json
    if (song.config) {
      Object.assign(this.config, song.config);
    }
    
    console.log('Loaded config for', song.title, ':', this.config);
    
    this.notes = song.notes.map(note => ({
      ...note,
      y: -100,
      hit: false,
      missed: false,
      holdActive: note.type === 'hold',
      holdProgress: 0
    }));
    
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.stats = { perfect: 0, great: 0, good: 0, miss: 0 };
    this.activeHolds = [];
    
    // Load and play the audio file
    this.audio.src = song.audioFile;
    this.audio.currentTime = 0;
    
    // Handle audio loading errors
    this.audio.onerror = () => {
      console.error(`Failed to load audio file: ${song.audioFile}`);
      alert(`Could not load music file. Please ensure ${song.audioFile} exists.`);
    };
    
    // Start the game when audio is ready
    this.audio.onloadeddata = () => {
      this.audio.play().catch(err => {
        console.error('Failed to play audio:', err);
        // Game will still work without audio
      });
    };
    
    document.getElementById('menuScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.add('active');
    
    this.isPlaying = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.gameTime = 0;
    
    this.updateUI();
    this.gameLoop();
  }
  
  togglePause() {
    if (!this.isPlaying) return;
    
    this.isPaused = !this.isPaused;
    
    if (this.isPaused) {
      this.pauseTime = Date.now();
      this.audio.pause(); // Pause the music
      document.getElementById('pauseBtn').textContent = '▶ Resume';
    } else {
      const pauseDuration = Date.now() - this.pauseTime;
      this.startTime += pauseDuration;
      this.audio.play(); // Resume the music
      document.getElementById('pauseBtn').textContent = '⏸ Pause';
      this.gameLoop();
    }
  }
  
  backToMenu() {
    this.isPlaying = false;
    this.isPaused = false;
    
    // Stop the audio
    this.audio.pause();
    this.audio.currentTime = 0;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    document.getElementById('gameScreen').classList.remove('active');
    document.getElementById('gameOverScreen').classList.remove('active');
    document.getElementById('menuScreen').classList.remove('hidden');
    document.getElementById('pauseBtn').textContent = '⏸ Pause';
  }
  
  retrySong() {
    document.getElementById('gameOverScreen').classList.remove('active');
    this.startSong(this.currentSong);
  }
  
  handleLanePress(lane) {
    const hitLineY = this.canvas.height * this.config.HIT_LINE_Y;
    const laneWidth = this.canvas.width / this.config.LANES;
    const noteHeight = this.config.NOTE_SIZE;
    
    // Find the closest unhit note in this lane
    let closestNote = null;
    let closestDistance = Infinity;
    
    for (let note of this.notes) {
      if (note.lane === lane && !note.hit && !note.missed) {
        // Calculate distance considering note height
        // Check if the note's body overlaps with the hit line
        const noteTop = note.y;
        const noteBottom = note.y + noteHeight;
        
        // Distance to hit line (considering note size)
        let distance;
        if (hitLineY >= noteTop && hitLineY <= noteBottom) {
          // Hit line is within the note - perfect range
          distance = 0;
        } else if (hitLineY < noteTop) {
          // Hit line is above note
          distance = noteTop - hitLineY;
        } else {
          // Hit line is below note
          distance = hitLineY - noteBottom;
        }
        
        if (distance < closestDistance && distance < 100) {
          closestDistance = distance;
          closestNote = note;
        }
      }
    }
    
    if (closestNote) {
      if (closestNote.type === 'tap') {
        this.hitNote(closestNote, closestDistance);
      } else if (closestNote.type === 'hold' && closestNote.holdActive) {
        // Start holding
        closestNote.holdStartTime = this.gameTime;
        this.activeHolds.push(closestNote);
      }
    }
  }
  
  handleLaneRelease(lane) {
    // Check if we released a hold note
    for (let i = this.activeHolds.length - 1; i >= 0; i--) {
      const hold = this.activeHolds[i];
      if (hold.lane === lane) {
        this.completeHold(hold);
        this.activeHolds.splice(i, 1);
      }
    }
  }
  
  hitNote(note, distance) {
    note.hit = true;
    
    let judgment = 'miss';
    let points = 0;
    
    if (distance <= this.config.PERFECT_WINDOW) {
      judgment = 'perfect';
      points = this.config.SCORE_PERFECT;
      this.stats.perfect++;
      this.combo++;
    } else if (distance <= this.config.GREAT_WINDOW) {
      judgment = 'great';
      points = this.config.SCORE_GREAT;
      this.stats.great++;
      this.combo++;
    } else if (distance <= this.config.GOOD_WINDOW) {
      judgment = 'good';
      points = this.config.SCORE_GOOD;
      this.stats.good++;
      this.combo++;
    } else {
      this.stats.miss++;
      this.combo = 0;
    }
    
    this.score += points * (1 + this.combo * 0.1); // Combo multiplier
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.updateUI();
    this.showFeedback(judgment);
  }
  
  completeHold(hold) {
    const hitLineY = this.canvas.height * this.config.HIT_LINE_Y;
    const expectedDuration = hold.duration;
    const actualDuration = this.gameTime - hold.holdStartTime;
    
    // Calculate how well they held
    const accuracy = Math.min(actualDuration / expectedDuration, 1);
    
    let judgment = 'miss';
    let points = 0;
    
    if (accuracy >= 0.9) {
      judgment = 'perfect';
      points = this.config.SCORE_PERFECT * 2; // Holds worth more
      this.stats.perfect++;
      this.combo++;
    } else if (accuracy >= 0.7) {
      judgment = 'great';
      points = this.config.SCORE_GREAT * 2;
      this.stats.great++;
      this.combo++;
    } else if (accuracy >= 0.5) {
      judgment = 'good';
      points = this.config.SCORE_GOOD * 2;
      this.stats.good++;
      this.combo++;
    } else {
      this.stats.miss++;
      this.combo = 0;
    }
    
    hold.hit = true;
    this.score += points * (1 + this.combo * 0.1);
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.updateUI();
    this.showFeedback(judgment);
  }
  
  showFeedback(judgment) {
    const feedback = document.createElement('div');
    feedback.className = `hit-feedback ${judgment}`;
    feedback.textContent = judgment.toUpperCase();
    document.body.appendChild(feedback);
    
    setTimeout(() => feedback.remove(), 600);
  }
  
  updateUI() {
    document.getElementById('scoreDisplay').textContent = Math.floor(this.score);
    document.getElementById('comboDisplay').textContent = `COMBO: ${this.combo}`;
  }
  
  gameLoop() {
    if (!this.isPlaying || this.isPaused) return;
    
    this.gameTime = Date.now() - this.startTime;
    
    // Update notes
    const hitLineY = this.canvas.height * this.config.HIT_LINE_Y;
    let allNotesFinished = true;
    
    for (let note of this.notes) {
      if (!note.hit && !note.missed) {
        // Calculate note position based on time
        const timeUntilHit = note.time - this.gameTime;
        note.y = hitLineY - (timeUntilHit / 1000) * this.config.NOTE_SPEED * 60;
        
        // Check if note was missed
        if (note.y > hitLineY + 100) {
          if (note.type === 'tap') {
            note.missed = true;
            this.stats.miss++;
            this.combo = 0;
            this.updateUI();
          } else if (note.type === 'hold' && note.holdActive) {
            note.missed = true;
            note.holdActive = false;
            this.stats.miss++;
            this.combo = 0;
            this.updateUI();
          }
        }
        
        if (!note.missed) {
          allNotesFinished = false;
        }
      }
    }
    
    // Update active holds
    for (let hold of this.activeHolds) {
      hold.holdProgress = (this.gameTime - hold.holdStartTime) / hold.duration;
    }
    
    // Check if song is finished
    if (allNotesFinished && this.gameTime > this.notes[this.notes.length - 1].time + 2000) {
      this.endGame();
      return;
    }
    
    this.render();
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }
  
  render() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const laneWidth = canvas.width / this.config.LANES;
    const hitLineY = canvas.height * this.config.HIT_LINE_Y;
    
    // Draw lanes
    for (let i = 0; i < this.config.LANES; i++) {
      const x = i * laneWidth;
      
      // Lane background - highlight if pressed
      if (this.lanePressed[i]) {
        ctx.fillStyle = 'rgba(255, 110, 199, 0.2)';
        ctx.fillRect(x, 0, laneWidth, canvas.height);
      }
      
      // Lane dividers
      ctx.strokeStyle = 'rgba(255, 110, 199, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Draw hit line
    ctx.strokeStyle = '#ff6ec7';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#ff6ec7';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(0, hitLineY);
    ctx.lineTo(canvas.width, hitLineY);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Draw notes
    for (let note of this.notes) {
      if (note.hit || note.missed || note.y < -100) continue;
      
      const x = note.lane * laneWidth;
      const noteWidth = laneWidth - 20;
      const noteHeight = this.config.NOTE_SIZE; // Use configurable note size
      
      if (note.type === 'tap') {
        // Draw tap note
        const gradient = ctx.createLinearGradient(x + 10, note.y, x + 10, note.y + noteHeight);
        gradient.addColorStop(0, '#ff6ec7');
        gradient.addColorStop(1, '#6eb5ff');
        
        ctx.fillStyle = gradient;
        ctx.shadowColor = '#ff6ec7';
        ctx.shadowBlur = 15;
        ctx.fillRect(x + 10, note.y, noteWidth, noteHeight);
        ctx.shadowBlur = 0;
        
        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 10, note.y, noteWidth, noteHeight);
        
      } else if (note.type === 'hold') {
        // Draw hold note
        const holdEndY = note.y + (note.duration / 1000) * this.config.NOTE_SPEED * 60;
        const currentHoldEndY = Math.min(holdEndY, canvas.height);
        
        // Hold body
        const gradient = ctx.createLinearGradient(x + 10, note.y, x + 10, currentHoldEndY);
        gradient.addColorStop(0, 'rgba(110, 181, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(110, 181, 255, 0.3)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x + 10, note.y, noteWidth, currentHoldEndY - note.y);
        
        // Hold borders
        ctx.strokeStyle = '#6eb5ff';
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 10, note.y, noteWidth, currentHoldEndY - note.y);
        
        // Hold head
        const headGradient = ctx.createLinearGradient(x + 10, note.y, x + 10, note.y + noteHeight);
        headGradient.addColorStop(0, '#6eb5ff');
        headGradient.addColorStop(1, '#ff6ec7');
        
        ctx.fillStyle = headGradient;
        ctx.shadowColor = '#6eb5ff';
        ctx.shadowBlur = 15;
        ctx.fillRect(x + 10, note.y, noteWidth, noteHeight);
        ctx.shadowBlur = 0;
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 10, note.y, noteWidth, noteHeight);
        
        // Progress indicator for active holds
        if (this.activeHolds.includes(note) && note.holdProgress < 1) {
          const progressHeight = (currentHoldEndY - note.y) * note.holdProgress;
          ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
          ctx.fillRect(x + 10, note.y, noteWidth, progressHeight);
        }
      }
    }
  }
  
  endGame() {
    this.isPlaying = false;
    
    // Stop the audio
    this.audio.pause();
    this.audio.currentTime = 0;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    // Show game over screen
    document.getElementById('finalScore').textContent = Math.floor(this.score);
    document.getElementById('perfectCount').textContent = this.stats.perfect;
    document.getElementById('greatCount').textContent = this.stats.great;
    document.getElementById('goodCount').textContent = this.stats.good;
    document.getElementById('missCount').textContent = this.stats.miss;
    
    document.getElementById('gameOverScreen').classList.add('active');
  }
}

// Initialize game when page loads
window.addEventListener('load', () => {
  new Game();
});