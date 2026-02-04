import React, { useEffect, useState } from 'react';
import { Award, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface CompletedCourse {
  id: string;
  completed_at: string;
  course: {
    id: string;
    title: string;
    title_so: string | null;
    category: string;
    instructor_name: string;
    image_url: string | null;
  };
}

interface CertificatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CertificatesModal({ isOpen, onClose }: CertificatesModalProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<CompletedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      fetchCertificates();
    }
  }, [isOpen, user]);

  async function fetchCertificates() {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          completed_at,
          course:courses(
            id,
            title,
            title_so,
            category,
            instructor_name,
            image_url
          )
        `)
        .eq('user_id', user!.id)
        .eq('progress', 100)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion
      const typedData = (data || []).map(item => ({
        ...item,
        course: item.course as unknown as CompletedCourse['course']
      }));
      
      setCertificates(typedData);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            {language === 'en' ? 'My Certificates' : 'Shahaadooyinkayga'}
          </DialogTitle>
          <DialogDescription>
            {language === 'en' 
              ? 'Certificates for courses you have completed'
              : 'Shahaadooyinka koorsadaha aad dhameysay'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-8">
              <Award className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                {language === 'en' ? 'No Certificates Yet' : 'Weli Shahaado ma jirto'}
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                {language === 'en' 
                  ? 'Complete courses to earn certificates. They will appear here once you finish a course.'
                  : 'Dhamaystir koorsooyin si aad u hesho shahaadooyin. Halkan ayey ka muuqan doonaan markaad dhameysid koorso.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {certificates.map((cert) => (
                <Card key={cert.id} className="overflow-hidden border-0 shadow-md bg-gradient-to-r from-yellow-500/5 via-transparent to-transparent">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={cert.course.image_url || '/placeholder.svg'}
                          alt={cert.course.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-md">
                          <Award className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm line-clamp-1">
                          {language === 'en' ? cert.course.title : (cert.course.title_so || cert.course.title)}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {cert.course.instructor_name}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {cert.course.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {language === 'en' ? 'Completed' : 'La dhammeeyey'}: {formatDate(cert.completed_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1" disabled>
                        <Download className="w-3 h-3 mr-1" />
                        {language === 'en' ? 'Download PDF' : 'Soo Degso PDF'}
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" disabled>
                        <ExternalLink className="w-3 h-3 mr-1" />
                        {language === 'en' ? 'Share' : 'La Wadaag'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
