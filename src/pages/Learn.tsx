import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Play, Check, Lock, 
  Menu, X, BookOpen, List, CreditCard, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useCourseAccess } from '@/hooks/useCourseAccess';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CourseVideoPlayer } from '@/components/courses/CourseVideoPlayer';
import type { Course } from '@/lib/courses';
import type { Playlist, Video, UserProgress, CourseProgress } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PlaylistWithVideos extends Playlist {
  videos: (Video & { progress?: UserProgress })[];
}

export default function Learn() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { checkAccess, accessResult, loading: accessLoading } = useCourseAccess();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [playlists, setPlaylists] = useState<PlaylistWithVideos[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedPlaylists, setExpandedPlaylists] = useState<Set<string>>(new Set());

  // Check access when component mounts
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (courseId && user) {
      checkAccess(courseId);
    }
  }, [courseId, user, authLoading, checkAccess]);

  // Fetch course data only if access is granted
  useEffect(() => {
    if (accessResult?.allowed && courseId && user) {
      fetchCourseData();
    }
  }, [accessResult, courseId, user]);

  async function fetchCourseData() {
    try {
      setLoading(true);

      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch playlists with videos
      const { data: playlistsData, error: playlistsError } = await supabase
        .from('playlists')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (playlistsError) throw playlistsError;

      // Fetch videos and user progress
      const playlistsWithVideos = await Promise.all(
        (playlistsData || []).map(async (playlist) => {
          const { data: videos } = await supabase
            .from('videos')
            .select('*')
            .eq('playlist_id', playlist.id)
            .order('order_index');

          // Get progress for each video
          const videosWithProgress = await Promise.all(
            (videos || []).map(async (video) => {
              const { data: progress } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', user!.id)
                .eq('video_id', video.id)
                .maybeSingle();
              return { ...video, progress: progress || undefined };
            })
          );

          return { ...playlist, videos: videosWithProgress } as PlaylistWithVideos;
        })
      );

      setPlaylists(playlistsWithVideos);

      // Expand first playlist and set first video
      if (playlistsWithVideos.length > 0) {
        setExpandedPlaylists(new Set([playlistsWithVideos[0].id]));
        if (playlistsWithVideos[0].videos.length > 0) {
          // Find first unwatched video or first video
          const allVideos = playlistsWithVideos.flatMap(p => p.videos);
          const firstUnwatched = allVideos.find(v => !v.progress?.is_completed);
          setCurrentVideo(firstUnwatched || allVideos[0]);
        }
      }

      // Fetch course progress
      const { data: progressData } = await supabase.rpc('get_course_progress', {
        _user_id: user!.id,
        _course_id: courseId!,
      });
      if (progressData) {
        setCourseProgress(progressData as unknown as CourseProgress);
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: language === 'en' ? 'Failed to load course' : 'Waa lagu guul daraystay',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const togglePlaylist = (playlistId: string) => {
    const newExpanded = new Set(expandedPlaylists);
    if (newExpanded.has(playlistId)) {
      newExpanded.delete(playlistId);
    } else {
      newExpanded.add(playlistId);
    }
    setExpandedPlaylists(newExpanded);
  };

  const handleVideoSelect = (video: Video) => {
    setCurrentVideo(video);
  };

  const handleVideoComplete = useCallback(() => {
    fetchCourseData(); // Refresh progress
  }, []);

  const navigateVideo = (direction: 'prev' | 'next') => {
    const allVideos = playlists.flatMap(p => p.videos);
    const currentIndex = allVideos.findIndex(v => v.id === currentVideo?.id);
    
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentVideo(allVideos[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < allVideos.length - 1) {
      setCurrentVideo(allVideos[currentIndex + 1]);
    }
  };

  const currentVideoIndex = playlists.flatMap(p => p.videos).findIndex(v => v.id === currentVideo?.id);
  const totalVideos = playlists.reduce((sum, p) => sum + p.videos.length, 0);

  // Loading state
  if (loading || authLoading || accessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{language === 'en' ? 'Loading course...' : 'Waxaa la soo gelayaa...'}</p>
        </div>
      </div>
    );
  }

  // Access denied - show buy credits CTA
  if (accessResult && !accessResult.allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              {accessResult.reason === 'not_enrolled' ? (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                    <Lock className="w-10 h-10 text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">
                    {language === 'en' ? 'Course Locked' : 'Koorsada Waa La Xidhay'}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {language === 'en' 
                      ? `You need ${accessResult.required_credits} credits to access this course.`
                      : `Waxaad u baahan tahay ${accessResult.required_credits} credits si aad u hesho koorsadan.`}
                  </p>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => navigate('/buy-credits')} 
                      className="w-full gap-2 bg-accent hover:bg-accent/90"
                    >
                      <CreditCard className="w-4 h-4" />
                      {language === 'en' ? 'Buy Credits' : 'Iibso Credits'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/dashboard')}
                      className="w-full"
                    >
                      {language === 'en' ? 'Go to Dashboard' : 'Tag Dashboard'}
                    </Button>
                  </div>
                </>
              ) : accessResult.reason === 'course_not_found' ? (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-destructive" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">
                    {language === 'en' ? 'Course Not Found' : 'Koorso Lama Helin'}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {language === 'en' 
                      ? 'This course may have been removed or is not available.'
                      : 'Koorsadan waxaa laga yaabaa in la tirtiray ama aan la heli karin.'}
                  </p>
                  <Button onClick={() => navigate('/courses')} className="w-full">
                    {language === 'en' ? 'Browse Courses' : 'Raadi Koorsooyin'}
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-orange-500" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">
                    {language === 'en' ? 'Access Denied' : 'Mamnuuc'}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {language === 'en' 
                      ? 'You do not have permission to access this course.'
                      : 'Ma haysatid ogolaanshaha koorsadan.'}
                  </p>
                  <Button onClick={() => navigate('/dashboard')} className="w-full">
                    {language === 'en' ? 'Go to Dashboard' : 'Tag Dashboard'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">{language === 'en' ? 'Course not found' : 'Koorso lama helin'}</h2>
          <Button onClick={() => navigate('/dashboard')}>{language === 'en' ? 'Go to Dashboard' : 'Tag Dashboard'}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-80 bg-card border-r transform transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="gap-1">
                <ChevronLeft className="w-4 h-4" />
                {language === 'en' ? 'Back' : 'Dib'}
              </Button>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <h2 className="font-semibold line-clamp-2">{language === 'so' && course.title_so ? course.title_so : course.title}</h2>
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">{language === 'en' ? 'Progress' : 'Horumar'}</span>
                <span className="font-medium">{courseProgress?.progress_percentage || 0}%</span>
              </div>
              <Progress value={courseProgress?.progress_percentage || 0} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {courseProgress?.completed_videos || 0} / {courseProgress?.total_videos || 0} {language === 'en' ? 'completed' : 'dhammaystay'}
              </p>
            </div>
          </div>

          {/* Playlist Content */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {playlists.map((playlist, pIndex) => (
                <div key={playlist.id} className="mb-2">
                  <button
                    onClick={() => togglePlaylist(playlist.id)}
                    className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {pIndex + 1}
                    </div>
                    <span className="flex-1 font-medium text-sm">{playlist.title}</span>
                    <ChevronRight className={cn(
                      "w-4 h-4 transition-transform",
                      expandedPlaylists.has(playlist.id) && "rotate-90"
                    )} />
                  </button>
                  
                  {expandedPlaylists.has(playlist.id) && (
                    <div className="ml-4 pl-4 border-l space-y-1">
                      {playlist.videos.map((video, vIndex) => (
                        <button
                          key={video.id}
                          onClick={() => handleVideoSelect(video)}
                          className={cn(
                            "w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors",
                            currentVideo?.id === video.id 
                              ? "bg-primary/10 text-primary" 
                              : "hover:bg-secondary/50"
                          )}
                        >
                          <div className="w-5 h-5 flex items-center justify-center">
                            {video.progress?.is_completed ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <span className="text-xs text-muted-foreground">{vIndex + 1}</span>
                            )}
                          </div>
                          <span className="flex-1 line-clamp-2">{video.title}</span>
                          {video.is_free && (
                            <Badge variant="outline" className="text-xs">Free</Badge>
                          )}
                          {video.progress && !video.progress.is_completed && video.progress.watched_percentage > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {video.progress.watched_percentage}%
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="w-5 h-5 lg:hidden" /> : <Menu className="w-5 h-5" />}
              <List className="w-5 h-5 hidden lg:block" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentVideoIndex + 1} / {totalVideos}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateVideo('prev')}
              disabled={currentVideoIndex <= 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {language === 'en' ? 'Previous' : 'Hore'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateVideo('next')}
              disabled={currentVideoIndex >= totalVideos - 1}
            >
              {language === 'en' ? 'Next' : 'Xiga'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </header>

        {/* Video Player */}
        <div className="flex-1 bg-black flex items-center justify-center">
          {currentVideo ? (
            <div className="w-full max-w-6xl mx-auto">
              <CourseVideoPlayer
                videoUrl={currentVideo.video_url}
                videoSource={currentVideo.video_source as 'youtube' | 'upload'}
                thumbnailUrl={currentVideo.thumbnail_url || undefined}
                onComplete={handleVideoComplete}
                videoId={currentVideo.id}
              />
            </div>
          ) : (
            <div className="text-center text-white">
              <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>{language === 'en' ? 'Select a video to start learning' : 'Dooro fiidiyow si aad u bilowdo'}</p>
            </div>
          )}
        </div>

        {/* Video Info */}
        {currentVideo && (
          <div className="p-6 border-t bg-card">
            <h1 className="text-xl font-semibold mb-2">{currentVideo.title}</h1>
            {currentVideo.description && (
              <p className="text-muted-foreground">{currentVideo.description}</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
