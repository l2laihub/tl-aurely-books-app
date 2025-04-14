import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Rewind, FastForward } from 'lucide-react';

interface AudioPlayerProps {
  title: string;
  description: string;
  audioUrl: string;
  imageUrl: string;
  lyrics?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ title, description, audioUrl, imageUrl, lyrics }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showLyrics, setShowLyrics] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  // Check if this is an embedded audio from various platforms
  const isSpotify = audioUrl.includes('spotify.com');
  const isSoundCloud = audioUrl.includes('soundcloud.com');
  const isSuno = audioUrl.includes('suno.com');
  const isEmbedded = isSpotify || isSoundCloud || isSuno;
  
  // Format embedded audio URLs for iframes
  const getEmbedUrl = () => {
    if (isSpotify) {
      // Convert spotify URL to embedded format
      // Handle different Spotify URL formats
      if (audioUrl.includes('spotify.com/track/')) {
        const trackId = audioUrl.split('track/')[1].split('?')[0];
        return `https://open.spotify.com/embed/track/${trackId}`;
      } else if (audioUrl.includes('spotify.com/album/')) {
        const albumId = audioUrl.split('album/')[1].split('?')[0];
        return `https://open.spotify.com/embed/album/${albumId}`;
      } else if (audioUrl.includes('spotify.com/playlist/')) {
        const playlistId = audioUrl.split('playlist/')[1].split('?')[0];
        return `https://open.spotify.com/embed/playlist/${playlistId}`;
      }
      return audioUrl.replace('/track/', '/embed/track/');
    } else if (isSoundCloud) {
      // For SoundCloud, create embed URL
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(audioUrl)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
    } else if (isSuno) {
      // For Suno.ai, extract the song ID and create embed URL
      const sunoId = audioUrl.split('song/')[1]?.split('?')[0];
      if (sunoId) {
        return `https://suno.com/embed/song/${sunoId}`;
      }
      return audioUrl;
    }
    return audioUrl;
  };

  useEffect(() => {
    // Only set up audio events for direct audio files, not embedded ones
    if (isEmbedded) return;
    
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleVolumeChange = () => setIsMuted(audio.muted);

    // Events
    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('volumechange', handleVolumeChange);

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [isEmbedded]);

  const togglePlay = () => {
    if (isEmbedded) {
      // For embedded audio services, just update the UI state
      // Actual control would be handled by the iframe's own controls
      console.log(`${isPlaying ? 'Pausing' : 'Playing'} embedded audio`);
      setIsPlaying(!isPlaying);
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error("Error attempting to play audio:", error);
          // Show a more user-friendly error message
          alert("Unable to play audio. Please check if the audio file exists and is in a supported format.");
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (isEmbedded) {
      // Simulated control for embedded audio
      console.log(`Audio ${isMuted ? 'unmuted' : 'muted'}`);
      setIsMuted(!isMuted);
    } else if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skipForward = () => {
    if (isEmbedded) {
      // Not applicable for embedded audio
      return;
    } else if (audioRef.current) {
      audioRef.current.currentTime += 10;
    }
  };

  const skipBackward = () => {
    if (isEmbedded) {
      // Not applicable for embedded audio
      return;
    } else if (audioRef.current) {
      audioRef.current.currentTime -= 10;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isEmbedded) {
      // Not applicable for embedded audio
      return;
    }
    
    if (!progressRef.current || !audioRef.current) return;
    
    const progressRect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - progressRect.left) / progressRect.width;
    audioRef.current.currentTime = percent * duration;
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden border-4 border-secondary-200 hover:border-secondary-300 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl relative">
      {/* Decorative bubbles */}
      <div className="absolute -top-6 -left-6 w-12 h-12 bg-secondary-100 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-secondary-100 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-64 object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-secondary-900 to-transparent">
          <h3 className="text-xl font-bold font-display text-white drop-shadow-md">{title}</h3>
        </div>
      </div>
      <div className="p-6 bg-gradient-to-b from-white to-secondary-50">
        {/* Description shown once at the top for all audio types */}
        <p className="text-charcoal-700 mb-4 font-body whitespace-pre-line">{description}</p>
        
        {isEmbedded ? (
          // Embedded audio player (Spotify, SoundCloud, Suno)
          <div className="mb-4 overflow-hidden" style={{ height: isSuno ? '180px' : '152px' }}>
            <iframe 
              src={getEmbedUrl()} 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
              loading="lazy"
              title={title}
              className="rounded-xl shadow-md"
            ></iframe>
          </div>
        ) : (
          // Direct audio file
          <>
            <audio 
              ref={audioRef} 
              src={audioUrl} 
              preload="metadata"
              controls={true} // Added native controls as a backup
              className="w-full mt-2 mb-4 hidden" // Hide the default controls but keep them as fallback
            />
            
            <div className="mb-4">
              <div 
                ref={progressRef}
                className="h-2 bg-secondary-100 rounded-full cursor-pointer mb-2"
                onClick={handleProgressClick}
              >
                <div 
                  className="h-full bg-secondary-500 rounded-full"
                  style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm text-secondary-700 font-body">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button 
                onClick={skipBackward}
                className="w-10 h-10 bg-secondary-100 hover:bg-secondary-200 rounded-full flex items-center justify-center transition-colors"
              >
                <Rewind className="text-secondary-800" size={20} />
              </button>
              <button 
                onClick={togglePlay}
                className="w-12 h-12 bg-secondary-500 hover:bg-secondary-400 text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-md"
              >
                {isPlaying ? (
                  <Pause size={24} />
                ) : (
                  <Play className="ml-1" size={24} />
                )}
              </button>
              <button 
                onClick={skipForward}
                className="w-10 h-10 bg-secondary-100 hover:bg-secondary-200 rounded-full flex items-center justify-center transition-colors"
              >
                <FastForward className="text-secondary-800" size={20} />
              </button>
              <button 
                onClick={toggleMute}
                className="w-10 h-10 bg-secondary-100 hover:bg-secondary-200 rounded-full flex items-center justify-center transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="text-secondary-800" size={20} />
                ) : (
                  <Volume2 className="text-secondary-800" size={20} />
                )}
              </button>
            </div>
          </>
        )}
        
        {/* Description is now shown once at the top for all audio types */}
        
        {/* Display lyrics if available with collapsible toggle */}
        {lyrics && (
          <div className="mt-6">
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className="flex items-center justify-between w-full p-3 bg-secondary-50 rounded-t-lg border border-secondary-200 hover:bg-secondary-100 transition-colors"
            >
              <h3 className="text-lg font-semibold font-display text-secondary-800">Lyrics</h3>
              <span className="text-secondary-600">
                {showLyrics ? '▲ Hide' : '▼ Show'}
              </span>
            </button>
            {showLyrics && (
              <div className="p-4 bg-secondary-50 rounded-b-lg border border-secondary-200 border-t-0">
                <div className="whitespace-pre-line font-body text-charcoal-700 max-h-60 overflow-y-auto">
                  {lyrics}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioPlayer;