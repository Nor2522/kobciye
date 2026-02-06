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
import { format } from 'date-fns';

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
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchCertificates();
      fetchProfile();
    }
  }, [isOpen, user]);

  async function fetchProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user!.id)
      .single();
    setProfile(data);
  }

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

  const handleDownloadCertificate = (cert: CompletedCourse) => {
    const studentName = profile?.full_name || user?.email?.split('@')[0] || 'Student';
    const certificateId = `KOBC-${cert.id.slice(0, 8).toUpperCase()}`;
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${cert.course.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Inter', sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 40px;
            }
            .certificate {
              background: white;
              width: 900px;
              padding: 60px;
              border-radius: 20px;
              box-shadow: 0 25px 80px rgba(0,0,0,0.2);
              position: relative;
              overflow: hidden;
            }
            .certificate::before, .certificate::after {
              content: '';
              position: absolute;
              left: 0;
              right: 0;
              height: 8px;
              background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
            }
            .certificate::before { top: 0; }
            .certificate::after { bottom: 0; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #667eea, #764ba2);
              border-radius: 20px;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: 'Playfair Display', serif;
              font-size: 36px;
              font-weight: bold;
              color: white;
            }
            .title {
              font-family: 'Playfair Display', serif;
              font-size: 42px;
              color: #1a1a2e;
              margin-bottom: 10px;
            }
            .subtitle {
              font-size: 14px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 3px;
            }
            .content { text-align: center; margin: 50px 0; }
            .presented { font-size: 14px; color: #666; margin-bottom: 15px; }
            .student-name {
              font-family: 'Playfair Display', serif;
              font-size: 48px;
              color: #1a1a2e;
              margin-bottom: 30px;
              border-bottom: 3px solid #667eea;
              display: inline-block;
              padding-bottom: 10px;
            }
            .completion-text {
              font-size: 16px;
              color: #444;
              line-height: 1.8;
              max-width: 600px;
              margin: 0 auto;
            }
            .course-name { font-weight: 600; color: #667eea; }
            .footer {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 60px;
              padding-top: 30px;
              border-top: 1px solid #eee;
            }
            .footer-item { text-align: center; }
            .footer-item .line { width: 150px; height: 1px; background: #333; margin-bottom: 10px; }
            .footer-item .label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
            .footer-item .value { font-size: 14px; font-weight: 500; color: #333; margin-bottom: 5px; }
            .certificate-id { text-align: center; margin-top: 30px; font-size: 11px; color: #999; }
            @media print { body { background: white; padding: 0; } .certificate { box-shadow: none; } }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="header">
              <div class="logo">K</div>
              <h1 class="title">Certificate of Completion</h1>
              <p class="subtitle">Kobciye Learning Platform</p>
            </div>
            <div class="content">
              <p class="presented">This is to certify that</p>
              <h2 class="student-name">${studentName}</h2>
              <p class="completion-text">
                has successfully completed the course<br>
                <span class="course-name">"${cert.course.title}"</span><br>
                demonstrating dedication and commitment to professional development.
              </p>
            </div>
            <div class="footer">
              <div class="footer-item">
                <p class="value">${format(new Date(cert.completed_at), 'MMMM d, yyyy')}</p>
                <div class="line"></div>
                <p class="label">Date of Completion</p>
              </div>
              <div class="footer-item">
                <p class="value">${cert.course.instructor_name}</p>
                <div class="line"></div>
                <p class="label">Instructor</p>
              </div>
            </div>
            <p class="certificate-id">Certificate ID: ${certificateId}</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => printWindow.print();
    }
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
                            {language === 'en' ? 'Completed' : 'La dhammeeyey'}: {format(new Date(cert.completed_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDownloadCertificate(cert)}
                      >
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
