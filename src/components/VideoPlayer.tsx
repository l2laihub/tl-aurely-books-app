import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

interface VideoPlayerProps {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ title, description, videoUrl, thumbnailUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Determine video type
  const isYoutube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const isVimeo = videoUrl.includes('vimeo.com');
  const isEmbedded = isYoutube || isVimeo;
  
  // Format YouTube URL for embedding
  const getYoutubeEmbedUrl = (url: string) => {
    // Extract video ID from YouTube URL
    let videoId = '';
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      videoId = urlParams.get('v') || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/shorts/')) {
      videoId = url.split('/shorts/')[1].split('?')[0];
    }
    
    // Add autoplay=0 to prevent autoplay by default
    // Add origin parameter for better compatibility, especially on localhost
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&origin=${encodeURIComponent(origin)}`;
  };
  
  // Format Vimeo URL for embedding
  const getVimeoEmbedUrl = (url: string) => {
    // Extract video ID from Vimeo URL
    const vimeoRegex = /vimeo\.com\/(?:video\/)?([0-9]+)/;
    const match = url.match(vimeoRegex);
    const videoId = match ? match[1] : '';
    return `https://player.vimeo.com/video/${videoId}`;
  };
  
  // Get the appropriate embed URL based on the video type
  const getEmbedUrl = () => {
    if (isYoutube) {
      return getYoutubeEmbedUrl(videoUrl);
    } else if (isVimeo) {
      return getVimeoEmbedUrl(videoUrl);
    }
    return videoUrl;
  };

  const togglePlay = () => {
    if (isEmbedded) {
      // For embedded videos like YouTube/Vimeo, control through the embedded player's own UI
      setIsPlaying(!isPlaying);
      
      if (iframeRef.current) {
        // This would normally use the YouTube/Vimeo API, but for our demo
        // we'll just update the UI state
        console.log(`${isPlaying ? 'Pausing' : 'Playing'} embedded video`);
      }
    } else if (videoRef.current) {
      // For direct video files
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(error => {
          console.error("Error attempting to play video:", error);
          // Show a more user-friendly error message
          alert("Unable to play video. Please check if the video file exists and is in a supported format.");
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (isEmbedded) {
      // For embedded videos, this would use their APIs
      setIsMuted(!isMuted);
    } else if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Optional: Add event listeners for video state changes
    if (videoRef.current && !isEmbedded) {
      const video = videoRef.current;
      
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => setIsPlaying(false);
      const handleVolumeChange = () => setIsMuted(video.muted);
      
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('ended', handleEnded);
      video.addEventListener('volumechange', handleVolumeChange);
      
      return () => {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('volumechange', handleVolumeChange);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
      };
    }
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isEmbedded]);

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden border-4 border-primary-200 hover:border-primary-300 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl relative">
      {/* Decorative bubbles */}
      <div className="absolute -top-6 -right-6 w-12 h-12 bg-primary-100 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-primary-100 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      
      <div ref={containerRef} className="relative">
        {isEmbedded ? (
          /* Embedded video (YouTube, Vimeo, etc.) */
          <div className="relative pt-[56.25%]"> {/* 16:9 aspect ratio */}
            <iframe
              ref={iframeRef}
              src={getEmbedUrl()}
              className="absolute inset-0 w-full h-full rounded-t-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={title}
            ></iframe>
          </div>
        ) : (
          /* Direct video file */
          <>
            <video
              ref={videoRef}
              className="w-full h-auto"
              poster={thumbnailUrl}
              src={videoUrl}
              onEnded={() => setIsPlaying(false)}
              onClick={togglePlay}
              playsInline
              preload="metadata"
              controls={true} // Added native controls as backup
            >
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 transition-opacity duration-300 hover:bg-opacity-20">
              <button
                onClick={togglePlay}
                className="w-16 h-16 bg-primary-500 hover:bg-primary-400 text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
              >
                {isPlaying ? (
                  <Pause size={32} />
                ) : (
                  <Play className="ml-1" size={32} />
                )}
              </button>
            </div>
          </>
        )}
        
        {/* Controls overlay - only shown for direct video files */}
        {!isEmbedded && (
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <button
              onClick={toggleMute}
              className="w-10 h-10 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full flex items-center justify-center transition-colors hover:shadow-md"
            >
              {isMuted ? (
                <VolumeX className="text-primary-800" size={20} />
              ) : (
                <Volume2 className="text-primary-800" size={20} />
              )}
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="w-10 h-10 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full flex items-center justify-center transition-colors hover:shadow-md"
            >
              {isFullscreen ? (
                <Minimize className="text-primary-800" size={20} />
              ) : (
                <Maximize className="text-primary-800" size={20} />
              )}
            </button>
          </div>
        )}
      </div>
      <div className="p-6 bg-gradient-to-b from-white to-primary-50">
        <h3 className="text-xl font-bold font-display text-primary-800 mb-2">{title}</h3>
        <p className="text-charcoal-700 font-body">{description}</p>
      </div>
    </div>
  );
};

export default VideoPlayer;