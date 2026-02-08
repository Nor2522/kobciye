import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Clock, User, Star, Users, BookOpen, Lock, Play, 
  ChevronDown, ChevronUp, Video, Timer, TrendingUp, CreditCard 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { Course, getCategoryColor } from '@/lib/courses';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

interface Playlist {
  id: string;
  title: string;
  title_so?: string;
  order_index: number;
  videos: VideoItem[];
}

interface VideoItem {
  id: string;
  title: string;
  title_so?: string;
  duration_seconds: number | null;
  order_index: number;
  is_free: boolean;
}

interface CourseDetailModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (course: Course) => void;
  isEnrolled?: boolean;
}

export function CourseDetailModal({ course, isOpen, onClose, onEnroll, isEnrolled = false }: CourseDetailModalProps) {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Fetch playlists and videos when modal opens
  useEffect(() => {
    if (isOpen && course) {
      fetchCurriculum();
    }
  }, [isOpen, course?.id]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  async function fetchCurriculum() {
    if (!course) return;
    setLoading(true);
    try {
      // Fetch playlists
      const { data: playlistsData, error: playlistsError } = await supabase
        .from('playlists')
        .select('id, title, title_so, order_index')
        .eq('course_id', course.id)
        .order('order_index');

      if (playlistsError) throw playlistsError;

      // Fetch videos for each playlist
      const playlistsWithVideos = await Promise.all(
        (playlistsData || []).map(async (playlist) => {
          const { data: videos } = await supabase
            .from('videos')
            .select('id, title, title_so, duration_seconds, order_index, is_free')
            .eq('playlist_id', playlist.id)
            .order('order_index');
          
          return { ...playlist, videos: videos || [] };
        })
      );

      setPlaylists(playlistsWithVideos);
      
      // Auto-expand first section
      if (playlistsWithVideos.length > 0) {
        setExpandedSections(new Set([playlistsWithVideos[0].id]));
      }
    } catch (error) {
      console.error('Error fetching curriculum:', error);
    } finally {
      setLoading(false);
    }
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const expandAll = () => {
    setExpandedSections(new Set(playlists.map(p => p.id)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = (): string => {
    const totalSeconds = playlists.reduce((acc, p) => 
      acc + p.videos.reduce((vacc, v) => vacc + (v.duration_seconds || 0), 0), 0
    );
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getTotalLessons = (): number => {
    return playlists.reduce((acc, p) => acc + p.videos.length, 0);
  };

  const handleStartLearning = () => {
    if (course) {
      onClose();
      navigate(`/learn/${course.id}`);
    }
  };

  if (!course) return null;

  const title = language === 'en' ? course.title : (course.title_so || course.title);
  const description = language === 'en' ? course.description : (course.description_so || course.description);
  const category = language === 'en' ? course.category : (course.category_so || course.category);
  const level = language === 'en' ? course.level : (course.level_so || course.level);

  const totalLessons = getTotalLessons();
  const totalDuration = getTotalDuration();
  const hasPlaylists = playlists.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0 overflow-hidden bg-card">
        <ScrollArea className="max-h-[90vh]">
          {/* Hero Header with Course Image */}
          <div className="relative h-56 sm:h-72 overflow-hidden">
            <img
              src={course.image_url || '/placeholder.svg'}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
            
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 bg-background/80 hover:bg-background rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Course info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary" className="bg-accent text-accent-foreground border-0">
                  {level}
                </Badge>
                {course.price && course.price > 0 && (
                  <Badge variant="outline" className="bg-background/80 border-accent text-accent">
                    {course.price} {language === 'en' ? 'Credits' : 'Credits'}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {title}
              </h1>
              <p className="text-muted-foreground text-sm line-clamp-2">
                {description}
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 border-b border-border">
            <div className="flex flex-col items-center justify-center py-4 border-r border-border">
              <Timer className="w-5 h-5 text-accent mb-1" />
              <span className="text-lg font-bold">{totalDuration || course.duration}</span>
              <span className="text-xs text-muted-foreground">
                {language === 'en' ? 'Total Duration' : 'Waqtiga'}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center py-4 border-r border-border">
              <Video className="w-5 h-5 text-accent mb-1" />
              <span className="text-lg font-bold">{totalLessons || '1'}</span>
              <span className="text-xs text-muted-foreground">
                {language === 'en' ? 'Video Lessons' : 'Casharrada'}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center py-4">
              <TrendingUp className="w-5 h-5 text-accent mb-1" />
              <span className="text-lg font-bold">{level}</span>
              <span className="text-xs text-muted-foreground">
                {language === 'en' ? 'Skill Level' : 'Heerka'}
              </span>
            </div>
          </div>

          {/* Course Curriculum */}
          <div className="p-6">
            {hasPlaylists ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-accent" />
                    <h2 className="text-lg font-semibold">
                      {language === 'en' 
                        ? `Course Curriculum (${playlists.length} Sections)` 
                        : `Qeybaha Koorsada (${playlists.length})`}
                    </h2>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <button 
                      onClick={expandAll}
                      className="text-accent hover:underline"
                    >
                      {language === 'en' ? 'Expand All' : 'Fur Dhammaan'}
                    </button>
                    <span className="text-muted-foreground">|</span>
                    <button 
                      onClick={collapseAll}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {language === 'en' ? 'Collapse All' : 'Xidh Dhammaan'}
                    </button>
                  </div>
                </div>

                {/* Sections */}
                <div className="space-y-3">
                  {playlists.map((playlist, index) => {
                    const sectionTitle = language === 'so' && playlist.title_so 
                      ? playlist.title_so 
                      : playlist.title;
                    const isExpanded = expandedSections.has(playlist.id);
                    const sectionDuration = playlist.videos.reduce(
                      (acc, v) => acc + (v.duration_seconds || 0), 0
                    );
                    const sectionMins = Math.floor(sectionDuration / 60);

                    return (
                      <div key={playlist.id} className="border border-border rounded-xl overflow-hidden">
                        {/* Section Header */}
                        <button
                          onClick={() => toggleSection(playlist.id)}
                          className="w-full flex items-center gap-3 p-4 bg-secondary/30 hover:bg-secondary/50 transition-colors"
                        >
                          <div className="section-badge">
                            {index + 1}
                          </div>
                          <div className="flex-1 text-left">
                            <h3 className="font-semibold text-foreground">{sectionTitle}</h3>
                            <p className="text-sm text-muted-foreground">
                              {playlist.videos.length} {language === 'en' ? 'lessons' : 'casharo'} • {sectionMins}:{(sectionDuration % 60).toString().padStart(2, '0')}
                            </p>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </button>

                        {/* Videos List */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="p-2 space-y-1 bg-background">
                                {playlist.videos.map((video) => {
                                  const videoTitle = language === 'so' && video.title_so
                                    ? video.title_so
                                    : video.title;
                                  const canPlay = isEnrolled || video.is_free;

                                  return (
                                    <div
                                      key={video.id}
                                      className={canPlay ? 'video-item-playable' : 'video-item-locked'}
                                      onClick={canPlay ? handleStartLearning : undefined}
                                    >
                                      {canPlay ? (
                                        <Play className="w-4 h-4 text-accent flex-shrink-0" />
                                      ) : (
                                        <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                      )}
                                      <span className={`flex-1 text-sm ${canPlay ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {videoTitle}
                                      </span>
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDuration(video.duration_seconds)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Single video course */
              <div className="text-center py-8">
                <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {language === 'en' 
                    ? 'This course contains video content ready for you to start learning.'
                    : 'Koorsadan waxay ka kooban tahay fiidiyow diyaar kuu ah.'}
                </p>
              </div>
            )}
          </div>

          {/* Sticky Footer - Enroll CTA */}
          <div className="sticky bottom-0 p-4 bg-card border-t border-border">
            <div className="flex items-center justify-between gap-4">
              <div>
                {course.price && course.price > 0 ? (
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-accent" />
                    <span className="text-2xl font-bold text-foreground">{course.price}</span>
                    <span className="text-sm text-muted-foreground">
                      {language === 'en' ? 'credits' : 'credits'}
                    </span>
                  </div>
                ) : (
                  <Badge variant="secondary" className="bg-accent/10 text-accent border-0">
                    {language === 'en' ? 'Free' : 'Lacag La\'aan'}
                  </Badge>
                )}
              </div>
              
              {isEnrolled ? (
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                  onClick={handleStartLearning}
                >
                  <Play className="w-4 h-4" />
                  {language === 'en' ? 'Continue Learning' : 'Sii Wad Barashada'}
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                  onClick={() => onEnroll(course)}
                >
                  <CreditCard className="w-4 h-4" />
                  {language === 'en' ? 'Enroll Now' : 'Iska Qor Hadda'}
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
