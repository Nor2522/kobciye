import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, MoreHorizontal, GripVertical, Video, ChevronDown, ChevronRight, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Course } from '@/lib/courses';
import type { Playlist, Video as VideoType } from '@/lib/types';

interface PlaylistFormData {
  title: string;
  title_so: string;
  description: string;
  description_so: string;
  order_index: number;
}

interface VideoFormData {
  title: string;
  title_so: string;
  description: string;
  description_so: string;
  video_url: string;
  video_source: string;
  thumbnail_url: string;
  duration_seconds: number;
  order_index: number;
  is_free: boolean;
}

const initialPlaylistForm: PlaylistFormData = {
  title: '',
  title_so: '',
  description: '',
  description_so: '',
  order_index: 0,
};

const initialVideoForm: VideoFormData = {
  title: '',
  title_so: '',
  description: '',
  description_so: '',
  video_url: '',
  video_source: 'youtube',
  thumbnail_url: '',
  duration_seconds: 0,
  order_index: 0,
  is_free: false,
};

export function AdminPlaylists() {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [playlists, setPlaylists] = useState<(Playlist & { videos: VideoType[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlaylists, setExpandedPlaylists] = useState<Set<string>>(new Set());
  
  // Playlist dialog
  const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [playlistForm, setPlaylistForm] = useState<PlaylistFormData>(initialPlaylistForm);
  
  // Video dialog
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoType | null>(null);
  const [videoForm, setVideoForm] = useState<VideoFormData>(initialVideoForm);
  const [targetPlaylistId, setTargetPlaylistId] = useState<string>('');
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchPlaylists();
    }
  }, [selectedCourseId]);

  async function fetchCourses() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('title');
      if (error) throw error;
      setCourses(data || []);
      if (data && data.length > 0) {
        setSelectedCourseId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPlaylists() {
    try {
      setLoading(true);
      const { data: playlistsData, error: playlistsError } = await supabase
        .from('playlists')
        .select('*')
        .eq('course_id', selectedCourseId)
        .order('order_index');
      
      if (playlistsError) throw playlistsError;

      // Fetch videos for each playlist
      const playlistsWithVideos = await Promise.all(
        (playlistsData || []).map(async (playlist) => {
          const { data: videos } = await supabase
            .from('videos')
            .select('*')
            .eq('playlist_id', playlist.id)
            .order('order_index');
          return { 
            ...playlist, 
            videos: (videos || []) as VideoType[] 
          };
        })
      );

      setPlaylists(playlistsWithVideos as (Playlist & { videos: VideoType[] })[]);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  }

  const togglePlaylistExpand = (playlistId: string) => {
    const newExpanded = new Set(expandedPlaylists);
    if (newExpanded.has(playlistId)) {
      newExpanded.delete(playlistId);
    } else {
      newExpanded.add(playlistId);
    }
    setExpandedPlaylists(newExpanded);
  };

  // Playlist CRUD
  const handleOpenPlaylistDialog = (playlist?: Playlist) => {
    if (playlist) {
      setEditingPlaylist(playlist);
      setPlaylistForm({
        title: playlist.title,
        title_so: playlist.title_so || '',
        description: playlist.description || '',
        description_so: playlist.description_so || '',
        order_index: playlist.order_index,
      });
    } else {
      setEditingPlaylist(null);
      setPlaylistForm({
        ...initialPlaylistForm,
        order_index: playlists.length,
      });
    }
    setPlaylistDialogOpen(true);
  };

  const handleSavePlaylist = async () => {
    if (!playlistForm.title) {
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: language === 'en' ? 'Title is required' : 'Magaca waa loo baahan yahay',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (editingPlaylist) {
        const { error } = await supabase
          .from('playlists')
          .update(playlistForm)
          .eq('id', editingPlaylist.id);
        if (error) throw error;
        toast({ title: language === 'en' ? 'Playlist Updated' : 'Playlist La Cusbooneysiiyey' });
      } else {
        const { error } = await supabase.from('playlists').insert({
          ...playlistForm,
          course_id: selectedCourseId,
        });
        if (error) throw error;
        toast({ title: language === 'en' ? 'Playlist Created' : 'Playlist La Sameeyey' });
      }
      setPlaylistDialogOpen(false);
      fetchPlaylists();
    } catch (error) {
      console.error('Error saving playlist:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: language === 'en' ? 'Failed to save playlist' : 'Keydintu way fashilantay',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!confirm(language === 'en' ? 'Delete this playlist and all its videos?' : 'Ma tirtirtaa playlist-kan iyo fiidiyowyahiisa?')) {
      return;
    }
    try {
      const { error } = await supabase.from('playlists').delete().eq('id', playlistId);
      if (error) throw error;
      toast({ title: language === 'en' ? 'Playlist Deleted' : 'Playlist La Tirtiray' });
      fetchPlaylists();
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  // Video CRUD
  const handleOpenVideoDialog = (playlistId: string, video?: VideoType) => {
    setTargetPlaylistId(playlistId);
    if (video) {
      setEditingVideo(video);
      setVideoForm({
        title: video.title,
        title_so: video.title_so || '',
        description: video.description || '',
        description_so: video.description_so || '',
        video_url: video.video_url,
        video_source: video.video_source,
        thumbnail_url: video.thumbnail_url || '',
        duration_seconds: video.duration_seconds || 0,
        order_index: video.order_index,
        is_free: video.is_free,
      });
    } else {
      setEditingVideo(null);
      const playlist = playlists.find(p => p.id === playlistId);
      setVideoForm({
        ...initialVideoForm,
        order_index: playlist?.videos.length || 0,
      });
    }
    setVideoDialogOpen(true);
  };

  const handleSaveVideo = async () => {
    if (!videoForm.title || !videoForm.video_url) {
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: language === 'en' ? 'Title and video URL are required' : 'Magaca iyo URL-ka waa loo baahan yahay',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (editingVideo) {
        const { error } = await supabase
          .from('videos')
          .update(videoForm)
          .eq('id', editingVideo.id);
        if (error) throw error;
        toast({ title: language === 'en' ? 'Video Updated' : 'Fiidiyow La Cusbooneysiiyey' });
      } else {
        const { error } = await supabase.from('videos').insert({
          ...videoForm,
          playlist_id: targetPlaylistId,
        });
        if (error) throw error;
        toast({ title: language === 'en' ? 'Video Added' : 'Fiidiyow La Daray' });
      }
      setVideoDialogOpen(false);
      fetchPlaylists();
    } catch (error) {
      console.error('Error saving video:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: language === 'en' ? 'Failed to save video' : 'Keydintu way fashilantay',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm(language === 'en' ? 'Delete this video?' : 'Ma tirtirtaa fiidiyokan?')) {
      return;
    }
    try {
      const { error } = await supabase.from('videos').delete().eq('id', videoId);
      if (error) throw error;
      toast({ title: language === 'en' ? 'Video Deleted' : 'Fiidiyow La Tirtiray' });
      fetchPlaylists();
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  const getTotalVideos = () => playlists.reduce((sum, p) => sum + p.videos.length, 0);

  return (
    <div className="space-y-6">
      {/* Course Selector */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-sm">
          <Label className="mb-2 block">{language === 'en' ? 'Select Course' : 'Dooro Koorso'}</Label>
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger>
              <SelectValue placeholder={language === 'en' ? 'Select a course' : 'Dooro koorso'} />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => handleOpenPlaylistDialog()} disabled={!selectedCourseId} className="gap-2">
          <Plus className="w-4 h-4" />
          {language === 'en' ? 'Add Playlist' : 'Playlist Cusub'}
        </Button>
      </div>

      {/* Stats */}
      {selectedCourseId && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{playlists.length}</p>
              <p className="text-sm text-muted-foreground">{language === 'en' ? 'Playlists' : 'Playlists'}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{getTotalVideos()}</p>
              <p className="text-sm text-muted-foreground">{language === 'en' ? 'Videos' : 'Fiidiyowyada'}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Playlists */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'No playlists yet. Create one to start adding videos.'
                : 'Playlist ma jiro. Samee mid si aad fiidiyow u darto.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {playlists.map((playlist) => (
            <Card key={playlist.id} className="border-0 shadow-md">
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-3 cursor-pointer flex-1"
                    onClick={() => togglePlaylistExpand(playlist.id)}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    {expandedPlaylists.has(playlist.id) ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                    <div>
                      <CardTitle className="text-base">{playlist.title}</CardTitle>
                      <CardDescription>
                        {playlist.videos.length} {language === 'en' ? 'videos' : 'fiidiyow'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleOpenVideoDialog(playlist.id)}>
                      <Plus className="w-4 h-4 mr-1" />
                      {language === 'en' ? 'Add Video' : 'Fiidiyow'}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenPlaylistDialog(playlist)}>
                          <Edit className="w-4 h-4 mr-2" />
                          {language === 'en' ? 'Edit' : 'Tafatir'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeletePlaylist(playlist.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          {language === 'en' ? 'Delete' : 'Tirtir'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              
              {expandedPlaylists.has(playlist.id) && (
                <CardContent className="pt-0">
                  {playlist.videos.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {language === 'en' ? 'No videos in this playlist' : 'Fiidiyow ma jiro playlist-kan'}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {playlist.videos.map((video, index) => (
                        <div 
                          key={video.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium w-6">{index + 1}</span>
                          <div className="w-16 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                            {video.thumbnail_url ? (
                              <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <PlayCircle className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{video.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {video.video_source} • {video.duration_seconds ? `${Math.floor(video.duration_seconds / 60)}:${(video.duration_seconds % 60).toString().padStart(2, '0')}` : '--:--'}
                            </p>
                          </div>
                          {video.is_free && (
                            <Badge variant="secondary" className="text-xs">
                              {language === 'en' ? 'Free' : 'Bilaash'}
                            </Badge>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenVideoDialog(playlist.id, video)}>
                                <Edit className="w-4 h-4 mr-2" />
                                {language === 'en' ? 'Edit' : 'Tafatir'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteVideo(video.id)} className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                {language === 'en' ? 'Delete' : 'Tirtir'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Playlist Dialog */}
      <Dialog open={playlistDialogOpen} onOpenChange={setPlaylistDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPlaylist 
                ? (language === 'en' ? 'Edit Playlist' : 'Tafatir Playlist')
                : (language === 'en' ? 'Add Playlist' : 'Playlist Cusub')}
            </DialogTitle>
            <DialogDescription>
              {language === 'en' ? 'Organize your course content into sections.' : 'Habayn koorsadaada.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Title (English)' : 'Magaca (Ingiriisi)'} *</Label>
                <Input
                  value={playlistForm.title}
                  onChange={(e) => setPlaylistForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Title (Somali)' : 'Magaca (Soomaali)'}</Label>
                <Input
                  value={playlistForm.title_so}
                  onChange={(e) => setPlaylistForm(prev => ({ ...prev, title_so: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Description' : 'Sharaxaad'}</Label>
              <Textarea
                value={playlistForm.description}
                onChange={(e) => setPlaylistForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlaylistDialogOpen(false)}>
              {language === 'en' ? 'Cancel' : 'Jooji'}
            </Button>
            <Button onClick={handleSavePlaylist} disabled={saving}>
              {saving ? (language === 'en' ? 'Saving...' : 'Waa la keydiyaa...') : (language === 'en' ? 'Save' : 'Kaydi')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Dialog */}
      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVideo 
                ? (language === 'en' ? 'Edit Video' : 'Tafatir Fiidiyow')
                : (language === 'en' ? 'Add Video' : 'Fiidiyow Cusub')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Title (English)' : 'Magaca (Ingiriisi)'} *</Label>
                <Input
                  value={videoForm.title}
                  onChange={(e) => setVideoForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Title (Somali)' : 'Magaca (Soomaali)'}</Label>
                <Input
                  value={videoForm.title_so}
                  onChange={(e) => setVideoForm(prev => ({ ...prev, title_so: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Description' : 'Sharaxaad'}</Label>
              <Textarea
                value={videoForm.description}
                onChange={(e) => setVideoForm(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Video Source' : 'Isha Fiidiyowga'}</Label>
                <Select
                  value={videoForm.video_source}
                  onValueChange={(value) => setVideoForm(prev => ({ ...prev, video_source: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="upload">{language === 'en' ? 'Direct URL' : 'URL Toos'}</SelectItem>
                    <SelectItem value="external">{language === 'en' ? 'External' : 'Dibadda'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Duration (seconds)' : 'Dhererka (seconds)'}</Label>
                <Input
                  type="number"
                  min="0"
                  value={videoForm.duration_seconds}
                  onChange={(e) => setVideoForm(prev => ({ ...prev, duration_seconds: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{language === 'en' ? 'Video URL' : 'URL Fiidiyowga'} *</Label>
              <Input
                placeholder={videoForm.video_source === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://...'}
                value={videoForm.video_url}
                onChange={(e) => setVideoForm(prev => ({ ...prev, video_url: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>{language === 'en' ? 'Thumbnail URL' : 'URL Sawirka'}</Label>
              <Input
                placeholder="https://..."
                value={videoForm.thumbnail_url}
                onChange={(e) => setVideoForm(prev => ({ ...prev, thumbnail_url: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={videoForm.is_free}
                onCheckedChange={(checked) => setVideoForm(prev => ({ ...prev, is_free: checked }))}
              />
              <Label>{language === 'en' ? 'Free preview (visible without enrollment)' : 'Bilaash (la arki karo iyaga oo aan diwaangelin)'}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVideoDialogOpen(false)}>
              {language === 'en' ? 'Cancel' : 'Jooji'}
            </Button>
            <Button onClick={handleSaveVideo} disabled={saving}>
              {saving ? (language === 'en' ? 'Saving...' : 'Waa la keydiyaa...') : (language === 'en' ? 'Save' : 'Kaydi')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
