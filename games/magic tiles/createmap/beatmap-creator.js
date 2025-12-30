// Beatmap Creator
class BeatmapCreator {
  constructor() {
    this.audio = new Audio();
    this.canvas = document.getElementById('editorCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.songData = {
      title: '',
      artist: '',
      difficulty: 'Medium',
      bpm: 120,
      approachRate: 5000,
      notes: []
    };
    
    this.isPlaying = false;
    this.currentTime = 0;
    this.noteType = 'tap'; // 'tap' or 'hold'
    this.isDrawingHold = false;
    this.holdStartTime = 0;
    this.holdStartLane = 0;
    
    this.LANES = 4;
    this.noteHeight = 28; // px, adjustable
    this.approachRate = 5000; // ms
    this.setupCanvas();
    this.setupEventListeners();
  }
  
  setupCanvas() {
    this.canvas.width = 800;
    this.canvas.height = 600;
  }
  
  setupEventListeners() {
    // Setup screen
    const audioFile = document.getElementById('audioFile');
    const startBtn = document.getElementById('startMappingBtn');
    
    audioFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        document.getElementById('fileName').textContent = file.name;
        startBtn.disabled = false;
        
        // Load audio
        const url = URL.createObjectURL(file);
        this.audio.src = url;
        this.audioFileName = file.name;
      }
    });
    
    startBtn.addEventListener('click', () => this.startMapping());
    
    // Editor controls
    document.getElementById('playPauseBtn').addEventListener('click', () => this.togglePlayPause());
    document.getElementById('stopBtn').addEventListener('click', () => this.stop());
    document.getElementById('exportBtn').addEventListener('click', () => this.exportJSON());
    document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAll());
    
    document.getElementById('volumeSlider').addEventListener('input', (e) => {
      this.audio.volume = e.target.value / 100;
    });
    
    document.getElementById('playbackSpeed').addEventListener('change', (e) => {
      this.audio.playbackRate = parseFloat(e.target.value);
    });
    
    // Note type selector
    document.querySelectorAll('.note-type-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.note-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.noteType = btn.dataset.type;
      });
    });
    
    // Canvas interactions
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    
    // Audio time update
    this.audio.addEventListener('timeupdate', () => {
      this.currentTime = this.audio.currentTime * 1000; // Convert to ms
      this.updateStats();
    });
    
    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
      document.getElementById('playPauseBtn').textContent = '▶ Play';
    });
    
    // Modal
    document.getElementById('closeModalBtn').addEventListener('click', () => {
      document.getElementById('exportModal').classList.remove('active');
    });
    
    document.getElementById('copyJsonBtn').addEventListener('click', () => this.copyToClipboard());
    document.getElementById('downloadJsonBtn').addEventListener('click', () => this.downloadJSON());
    
    // Start render loop
    this.render();
  }
  
  startMapping() {
    // Get song info
    this.songData.title = document.getElementById('songTitle').value || 'Untitled';
    this.songData.artist = document.getElementById('artistName').value || 'Unknown';
    this.songData.difficulty = document.getElementById('difficulty').value;
    this.songData.bpm = parseInt(document.getElementById('bpm').value) || 120;
    // Read approach rate (in ms) and store
    this.approachRate = parseInt(document.getElementById('approachRate').value) || 5000;
    this.songData.approachRate = this.approachRate;
    
    // Update sidebar info
    document.getElementById('infoTitle').textContent = this.songData.title;
    document.getElementById('infoArtist').textContent = this.songData.artist;
    document.getElementById('infoBpm').textContent = this.songData.bpm;
    document.getElementById('infoDifficulty').textContent = this.songData.difficulty;
    
    // Switch screens
    document.getElementById('setupScreen').classList.remove('active');
    document.getElementById('editorScreen').classList.add('active');
    
    // Set initial volume
    const volSlider = document.getElementById('volumeSlider');
    this.audio.volume = volSlider ? (volSlider.value / 100) : 0.7;

    // Reset playback to start and begin playing so mapping can begin immediately
    try {
      this.audio.currentTime = 0;
      const playPromise = this.audio.play();
      if (playPromise && playPromise.then) {
        playPromise.then(() => {
          this.isPlaying = true;
          const pb = document.getElementById('playPauseBtn');
          if (pb) pb.textContent = '⏸ Pause';
        }).catch(() => {
          // Autoplay blocked or playback failed; leave UI ready for user to press Play
        });
      } else {
        this.isPlaying = true;
        const pb = document.getElementById('playPauseBtn');
        if (pb) pb.textContent = '⏸ Pause';
      }
    } catch (e) {
      // ignore errors
    }
  }
  
  togglePlayPause() {
    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
      document.getElementById('playPauseBtn').textContent = '▶ Play';
    } else {
      this.audio.play();
      this.isPlaying = true;
      document.getElementById('playPauseBtn').textContent = '⏸ Pause';
    }
  }
  
  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.currentTime = 0;
    this.isPlaying = false;
    document.getElementById('playPauseBtn').textContent = '▶ Play';
    this.updateStats();
  }
  
  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const lane = this.getLane(x);
    
    if (this.noteType === 'tap') {
      this.addTapNote(lane);
    } else if (this.noteType === 'hold') {
      this.isDrawingHold = true;
      this.holdStartTime = this.currentTime;
      this.holdStartLane = lane;
    }
  }
  
  handleMouseMove(e) {
    if (this.isDrawingHold && this.noteType === 'hold') {
      // Visual feedback could be added here
    }
  }
  
  handleMouseUp(e) {
    if (this.isDrawingHold && this.noteType === 'hold') {
      const duration = this.currentTime - this.holdStartTime;
      
      // Minimum hold duration of 200ms
      if (duration >= 200) {
        this.addHoldNote(this.holdStartLane, this.holdStartTime, duration);
      } else {
        // Too short, convert to tap
        this.addTapNote(this.holdStartLane, this.holdStartTime);
      }
      
      this.isDrawingHold = false;
    }
  }
  
  getLane(x) {
    const laneWidth = this.canvas.width / this.LANES;
    return Math.floor(x / laneWidth);
  }
  
  addTapNote(lane, time = null) {
    const noteTime = time !== null ? time : this.currentTime;
    
    const note = {
      time: Math.round(noteTime),
      lane: lane,
      type: 'tap'
    };
    
    this.songData.notes.push(note);
    this.sortNotes();
    this.updateNoteList();
    this.updateStats();
  }
  
  addHoldNote(lane, startTime, duration) {
    const note = {
      time: Math.round(startTime),
      lane: lane,
      type: 'hold',
      duration: Math.round(duration)
    };
    
    this.songData.notes.push(note);
    this.sortNotes();
    this.updateNoteList();
    this.updateStats();
  }
  
  sortNotes() {
    this.songData.notes.sort((a, b) => a.time - b.time);
  }
  
  deleteNote(index) {
    this.songData.notes.splice(index, 1);
    this.updateNoteList();
    this.updateStats();
  }
  
  clearAll() {
    if (confirm('Are you sure you want to delete all notes? This cannot be undone.')) {
      this.songData.notes = [];
      this.updateNoteList();
      this.updateStats();
    }
  }
  
  updateNoteList() {
    const noteList = document.getElementById('noteList');
    
    if (this.songData.notes.length === 0) {
      noteList.innerHTML = `
        <div style="text-align: center; color: var(--light-blue); padding: 2rem;">
          No notes yet. Start clicking on the canvas!
        </div>
      `;
      return;
    }
    
    noteList.innerHTML = '';
    
    this.songData.notes.forEach((note, index) => {
      const noteItem = document.createElement('div');
      noteItem.className = 'note-item';
      
      const timeStr = (note.time / 1000).toFixed(2) + 's';
      const laneStr = 'Lane ' + (note.lane + 1);
      const typeStr = note.type === 'hold' ? `Hold (${(note.duration / 1000).toFixed(2)}s)` : 'Tap';
      
      noteItem.innerHTML = `
        <div class="note-info">
          <strong>${timeStr}</strong> | ${laneStr} | ${typeStr}
        </div>
        <button class="delete-note" data-index="${index}">✖</button>
      `;
      
      noteList.appendChild(noteItem);
    });
    
    // Add delete handlers
    noteList.querySelectorAll('.delete-note').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        this.deleteNote(index);
      });
    });
  }
  
  updateStats() {
    // Time
    const minutes = Math.floor(this.currentTime / 60000);
    const seconds = Math.floor((this.currentTime % 60000) / 1000);
    document.getElementById('currentTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Counts
    const tapCount = this.songData.notes.filter(n => n.type === 'tap').length;
    const holdCount = this.songData.notes.filter(n => n.type === 'hold').length;
    
    document.getElementById('totalNotes').textContent = this.songData.notes.length;
    document.getElementById('tapNotes').textContent = tapCount;
    document.getElementById('holdNotes').textContent = holdCount;
  }
  
  render() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const laneWidth = canvas.width / this.LANES;
    
    // Draw lanes
    for (let i = 0; i < this.LANES; i++) {
      const x = i * laneWidth;
      
      // Lane background
      ctx.fillStyle = 'rgba(255, 110, 199, 0.05)';
      ctx.fillRect(x, 0, laneWidth, canvas.height);
      
      // Lane dividers
      ctx.strokeStyle = 'rgba(255, 110, 199, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Draw timeline (current time indicator)
    ctx.strokeStyle = '#ff6ec7';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#ff6ec7';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 50);
    ctx.lineTo(canvas.width, canvas.height - 50);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Draw notes
    const timeWindow = this.approachRate || 5000; // ms: how early notes appear
    const pixelsPerMs = (canvas.height - 100) / timeWindow;
    
    this.songData.notes.forEach(note => {
      const timeDiff = note.time - this.currentTime;
      
      // Only draw notes within the visible window
      if (timeDiff > -1000 && timeDiff < timeWindow) {
        const y = canvas.height - 50 - (timeDiff * pixelsPerMs);
        const x = note.lane * laneWidth;
        const noteWidth = laneWidth - 10;
        const noteHeight = this.noteHeight;
        
        if (note.type === 'tap') {
          // Draw tap note
          const gradient = ctx.createLinearGradient(x + 5, y, x + 5, y + noteHeight);
          gradient.addColorStop(0, '#ff6ec7');
          gradient.addColorStop(1, '#6eb5ff');
          
          ctx.fillStyle = gradient;
          ctx.shadowColor = '#ff6ec7';
          ctx.shadowBlur = 10;
          ctx.fillRect(x + 5, y, noteWidth, noteHeight);
          ctx.shadowBlur = 0;
          
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 5, y, noteWidth, noteHeight);
          
        } else if (note.type === 'hold') {
          // Draw hold note
          const holdLength = note.duration * pixelsPerMs;
          
          // Hold body
          const gradient = ctx.createLinearGradient(x + 5, y, x + 5, y + holdLength);
          gradient.addColorStop(0, 'rgba(110, 181, 255, 0.8)');
          gradient.addColorStop(1, 'rgba(110, 181, 255, 0.3)');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x + 5, y, noteWidth, holdLength);
          
          ctx.strokeStyle = '#6eb5ff';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 5, y, noteWidth, holdLength);
          
          // Hold head
          const headGradient = ctx.createLinearGradient(x + 5, y, x + 5, y + noteHeight);
          headGradient.addColorStop(0, '#6eb5ff');
          headGradient.addColorStop(1, '#ff6ec7');
          
          ctx.fillStyle = headGradient;
          ctx.shadowColor = '#6eb5ff';
          ctx.shadowBlur = 10;
          ctx.fillRect(x + 5, y, noteWidth, noteHeight);
          ctx.shadowBlur = 0;
          
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 5, y, noteWidth, noteHeight);
        }
      }
    });
    
    // Draw lane labels at bottom
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'bold 14px Outfit';
    ctx.textAlign = 'center';
    for (let i = 0; i < this.LANES; i++) {
      const x = (i * laneWidth) + (laneWidth / 2);
      ctx.fillText(`Lane ${i + 1}`, x, canvas.height - 20);
      ctx.fillText(`(${['D', 'F', 'J', 'K'][i]})`, x, canvas.height - 5);
    }
    
    // Continue render loop
    requestAnimationFrame(() => this.render());
  }
  
  exportJSON() {
    const json = JSON.stringify(this.songData, null, 2);
    document.getElementById('jsonOutput').textContent = json;
    document.getElementById('exportModal').classList.add('active');
  }
  
  copyToClipboard() {
    const json = document.getElementById('jsonOutput').textContent;
    navigator.clipboard.writeText(json).then(() => {
      const notification = document.getElementById('copyNotification');
      notification.classList.add('show');
      setTimeout(() => {
        notification.classList.remove('show');
      }, 2000);
    });
  }
  
  downloadJSON() {
    const json = JSON.stringify(this.songData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'map.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Initialize when page loads
window.addEventListener('load', () => {
  new BeatmapCreator();
});
