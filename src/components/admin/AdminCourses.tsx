import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, MoreHorizontal, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Course } from '@/lib/courses';

interface CourseFormData {
  title: string;
  title_so: string;
  description: string;
  description_so: string;
  category: string;
  category_so: string;
  instructor_name: string;
  duration: string;
  level: string;
  level_so: string;
  price: number;
  image_url: string;
  video_url: string;
  video_source: string;
  video_thumbnail: string;
  is_online: boolean;
  is_published: boolean;
}

const initialFormData: CourseFormData = {
  title: '',
  title_so: '',
  description: '',
  description_so: '',
  category: 'Technology',
  category_so: 'Tignoolajiyada',
  instructor_name: '',
  duration: '',
  level: 'Beginner',
  level_so: 'Bilowga',
  price: 0,
  image_url: '',
  video_url: '',
  video_source: 'none',
  video_thumbnail: '',
  is_online: true,
  is_published: false,
};

// Helper to extract YouTube video ID from various URL formats
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function AdminCourses() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>(initialFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      const courseData = course as any; // Handle potential new fields
      setFormData({
        title: course.title,
        title_so: course.title_so || '',
        description: course.description || '',
        description_so: course.description_so || '',
        category: course.category,
        category_so: course.category_so || '',
        instructor_name: course.instructor_name,
        duration: course.duration || '',
        level: course.level || 'Beginner',
        level_so: course.level_so || 'Bilowga',
        price: course.price,
        image_url: course.image_url || '',
        video_url: courseData.video_url || '',
        video_source: courseData.video_source || 'none',
        video_thumbnail: courseData.video_thumbnail || '',
        is_online: course.is_online,
        is_published: course.is_published,
      });
    } else {
      setEditingCourse(null);
      setFormData(initialFormData);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.instructor_name) {
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: language === 'en' 
          ? 'Please fill in required fields' 
          : 'Fadlan buuxi meelaha loo baahan yahay',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (editingCourse) {
        const { error } = await supabase
          .from('courses')
          .update(formData)
          .eq('id', editingCourse.id);
        if (error) throw error;
        toast({
          title: language === 'en' ? 'Course Updated' : 'Koorso La Cusbooneysiiyey',
          description: language === 'en' 
            ? 'The course has been updated successfully.' 
            : 'Koorsada si guul leh ayaa loo cusbooneysiiyey.',
        });
      } else {
        const { error } = await supabase.from('courses').insert({
          ...formData,
          rating: 0,
          students_count: 0,
        });
        if (error) throw error;
        toast({
          title: language === 'en' ? 'Course Created' : 'Koorso La Sameeyey',
          description: language === 'en' 
            ? 'The course has been created successfully.' 
            : 'Koorsada si guul leh ayaa loo sameeyey.',
        });
      }
      setDialogOpen(false);
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: language === 'en' 
          ? 'Failed to save course. Please try again.' 
          : 'Keydintu way fashilantay. Fadlan isku day mar kale.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_published: !course.is_published })
        .eq('id', course.id);
      if (error) throw error;
      fetchCourses();
      toast({
        title: course.is_published 
          ? (language === 'en' ? 'Course Unpublished' : 'Koorso La Qaaday')
          : (language === 'en' ? 'Course Published' : 'Koorso La Daabacay'),
      });
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm(language === 'en' ? 'Are you sure you want to delete this course?' : 'Ma hubtaa inaad tirtirto koorsadan?')) {
      return;
    }
    try {
      const { error } = await supabase.from('courses').delete().eq('id', courseId);
      if (error) throw error;
      fetchCourses();
      toast({
        title: language === 'en' ? 'Course Deleted' : 'Koorso La Tirtiray',
      });
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={language === 'en' ? 'Search courses...' : 'Raadi koorsooyin...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          {language === 'en' ? 'Add Course' : 'Koorso Cusub'}
        </Button>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'en' ? 'Course' : 'Koorso'}</TableHead>
                <TableHead>{language === 'en' ? 'Instructor' : 'Macalin'}</TableHead>
                <TableHead>{language === 'en' ? 'Category' : 'Qaybta'}</TableHead>
                <TableHead>{language === 'en' ? 'Price' : 'Qiimaha'}</TableHead>
                <TableHead>{language === 'en' ? 'Students' : 'Arday'}</TableHead>
                <TableHead>{language === 'en' ? 'Status' : 'Xaalad'}</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    {language === 'en' ? 'No courses found' : 'Koorso lama helin'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={course.image_url || '/placeholder.svg'}
                          alt={course.title}
                          className="w-12 h-8 rounded object-cover"
                        />
                        <div>
                          <p className="font-medium line-clamp-1">{course.title}</p>
                          <p className="text-xs text-muted-foreground">{course.level}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{course.instructor_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{course.category}</Badge>
                    </TableCell>
                    <TableCell>{course.price} credits</TableCell>
                    <TableCell>{course.students_count}</TableCell>
                    <TableCell>
                      <Badge variant={course.is_published ? 'default' : 'outline'}>
                        {course.is_published 
                          ? (language === 'en' ? 'Published' : 'La daabacay') 
                          : (language === 'en' ? 'Draft' : 'Qoraalka')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(course)}>
                            <Edit className="w-4 h-4 mr-2" />
                            {language === 'en' ? 'Edit' : 'Tafatir'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTogglePublish(course)}>
                            {course.is_published ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-2" />
                                {language === 'en' ? 'Unpublish' : 'Qari'}
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-2" />
                                {language === 'en' ? 'Publish' : 'Daabac'}
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(course.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {language === 'en' ? 'Delete' : 'Tirtir'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Course Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCourse 
                ? (language === 'en' ? 'Edit Course' : 'Tafatir Koorso')
                : (language === 'en' ? 'Add New Course' : 'Koorso Cusub')}
            </DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? 'Fill in the course details below.' 
                : 'Buuxi faahfaahinta koorsada hoos.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Title (English)' : 'Magaca (Ingiriis)'} *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Title (Somali)' : 'Magaca (Soomaali)'}</Label>
                <Input
                  value={formData.title_so}
                  onChange={(e) => setFormData(prev => ({ ...prev, title_so: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Description (English)' : 'Sharaxaad (Ingiriis)'}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Description (Somali)' : 'Sharaxaad (Soomaali)'}</Label>
                <Textarea
                  value={formData.description_so}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_so: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Instructor Name' : 'Magaca Macalinka'} *</Label>
                <Input
                  value={formData.instructor_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructor_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Duration' : 'Muddo'}</Label>
                <Input
                  placeholder="e.g., 8 weeks"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Category' : 'Qaybta'}</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Health Science">Health Science</SelectItem>
                    <SelectItem value="Language">Language</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Level' : 'Heerka'}</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Price (Credits)' : 'Qiimaha (Credits)'}</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{language === 'en' ? 'Thumbnail Image URL' : 'URL Sawirka Thumbnail'}</Label>
              <Input
                placeholder="https://..."
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              />
            </div>

            {/* Video Source Selection */}
            <div className="space-y-3 p-4 border border-border rounded-lg">
              <Label className="text-base font-semibold">
                {language === 'en' ? 'Course Video' : 'Fiidiyowga Koorsada'}
              </Label>
              
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Video Source' : 'Isha Fiidiyowga'}</Label>
                <Select
                  value={formData.video_source}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, video_source: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{language === 'en' ? 'No Video' : 'Fiidiyow ma jiro'}</SelectItem>
                    <SelectItem value="youtube">{language === 'en' ? 'YouTube Video' : 'Fiidiyow YouTube'}</SelectItem>
                    <SelectItem value="upload">{language === 'en' ? 'Direct Video URL' : 'URL Toos ah'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.video_source !== 'none' && (
                <>
                  <div className="space-y-2">
                    <Label>
                      {formData.video_source === 'youtube' 
                        ? (language === 'en' ? 'YouTube Video URL' : 'URL Fiidiyowga YouTube')
                        : (language === 'en' ? 'Video File URL' : 'URL Faylka Fiidiyowga')}
                    </Label>
                    <Input
                      placeholder={formData.video_source === 'youtube' 
                        ? "https://www.youtube.com/watch?v=..." 
                        : "https://example.com/video.mp4"}
                      value={formData.video_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                    />
                    {formData.video_source === 'youtube' && formData.video_url && (
                      <p className="text-xs text-muted-foreground">
                        {extractYouTubeId(formData.video_url) 
                          ? `✓ ${language === 'en' ? 'Valid YouTube URL detected' : 'URL YouTube sax ah la helay'}`
                          : `✗ ${language === 'en' ? 'Invalid YouTube URL' : 'URL YouTube aan saxnayn'}`}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>{language === 'en' ? 'Video Thumbnail URL (Optional)' : 'URL Sawirka Fiidiyowga (Ikhtiyaari)'}</Label>
                    <Input
                      placeholder="https://..."
                      value={formData.video_thumbnail}
                      onChange={(e) => setFormData(prev => ({ ...prev, video_thumbnail: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      {language === 'en' 
                        ? 'Custom thumbnail for the video. For YouTube, auto-generated if left empty.'
                        : 'Sawir gaar ah ee fiidiyowga. YouTube, auto-generated haddii madhan.'}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_online}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_online: checked }))}
                />
                <Label>{language === 'en' ? 'Online Course' : 'Koorso Online'}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                />
                <Label>{language === 'en' ? 'Published' : 'La Daabacay'}</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {language === 'en' ? 'Cancel' : 'Jooji'}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving 
                ? (language === 'en' ? 'Saving...' : 'Waa la keydiyaa...')
                : (language === 'en' ? 'Save Course' : 'Kaydi Koorso')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
