import React, { useRef } from 'react';
import { Download, Award, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';

interface CertificateProps {
  studentName: string;
  courseName: string;
  instructorName: string;
  completionDate: string;
  certificateId: string;
}

export function Certificate({ 
  studentName, 
  courseName, 
  instructorName, 
  completionDate, 
  certificateId 
}: CertificateProps) {
  const { language } = useLanguage();
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${courseName}</title>
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
            
            .certificate::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 8px;
              background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
            }
            
            .certificate::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 8px;
              background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
            }
            
            .header {
              text-align: center;
              margin-bottom: 40px;
            }
            
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
            
            .content {
              text-align: center;
              margin: 50px 0;
            }
            
            .presented {
              font-size: 14px;
              color: #666;
              margin-bottom: 15px;
            }
            
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
            
            .course-name {
              font-weight: 600;
              color: #667eea;
            }
            
            .footer {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 60px;
              padding-top: 30px;
              border-top: 1px solid #eee;
            }
            
            .footer-item {
              text-align: center;
            }
            
            .footer-item .line {
              width: 150px;
              height: 1px;
              background: #333;
              margin-bottom: 10px;
            }
            
            .footer-item .label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .footer-item .value {
              font-size: 14px;
              font-weight: 500;
              color: #333;
              margin-bottom: 5px;
            }
            
            .certificate-id {
              text-align: center;
              margin-top: 30px;
              font-size: 11px;
              color: #999;
            }
            
            @media print {
              body { background: white; padding: 0; }
              .certificate { box-shadow: none; }
            }
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
                <span class="course-name">"${courseName}"</span><br>
                demonstrating dedication and commitment to professional development.
              </p>
            </div>
            
            <div class="footer">
              <div class="footer-item">
                <p class="value">${format(new Date(completionDate), 'MMMM d, yyyy')}</p>
                <div class="line"></div>
                <p class="label">Date of Completion</p>
              </div>
              <div class="footer-item">
                <p class="value">${instructorName}</p>
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
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-accent h-2" />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{courseName}</h3>
              <p className="text-sm text-muted-foreground">{language === 'en' ? 'Certificate of Completion' : 'Shahaadada Dhammaystirka'}</p>
            </div>
          </div>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" />
            {language === 'en' ? 'Download' : 'Soo Degso'}
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{language === 'en' ? 'Instructor:' : 'Macalin:'}</span>
            <span className="font-medium">{instructorName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{language === 'en' ? 'Completed:' : 'Dhammaystay:'}</span>
            <span className="font-medium">{format(new Date(completionDate), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
