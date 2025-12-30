// Song loader - automatically loads songs from the songs/ folder
// No need to manually update this file anymore!

class SongLoader {
  constructor() {
    this.songs = [];
  }
  
  async loadSongList() {
    try {
      // Fetch the list of available songs from the songs directory
      const response = await fetch('songs/songs-list.json');
      if (!response.ok) {
        throw new Error('Could not load songs list');
      }
      
      const songFolders = await response.json();
      
      // Load each song's map.json
      const songPromises = songFolders.map(folder => this.loadSong(folder));
      this.songs = await Promise.all(songPromises);
      
      // Filter out any failed loads
      this.songs = this.songs.filter(song => song !== null);
      
      return this.songs;
    } catch (error) {
      console.error('Error loading songs:', error);
      // Return empty array if loading fails
      return [];
    }
  }
  
  async loadSong(folderName) {
    try {
      const mapPath = `songs/${folderName}/map.json`;
      const response = await fetch(mapPath);
      
      if (!response.ok) {
        console.error(`Could not load map for ${folderName}`);
        return null;
      }
      
      const mapData = await response.json();
      
      // Add the folder name and audio path
      return {
        ...mapData,
        id: folderName,
        audioFile: `songs/${folderName}/audio.mp3`,
        folder: folderName
      };
    } catch (error) {
      console.error(`Error loading song ${folderName}:`, error);
      return null;
    }
  }
  
  getSongs() {
    return this.songs;
  }
}

// Global instance
const songLoader = new SongLoader();

