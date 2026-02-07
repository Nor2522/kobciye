import React from 'react';
import { Video, ListVideo, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';

interface CourseTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (isPlaylist: boolean) => void;
}

export function CourseTypeModal({ isOpen, onClose, onSelect }: CourseTypeModalProps) {
  const { language } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {language === 'en' ? 'Create New Course' : 'Samee Koorso Cusub'}
          </DialogTitle>
          <DialogDescription>
            {language === 'en' 
              ? 'Choose the type of course you want to create'
              : 'Dooro nooca koorso ee aad rabto inaad sameyso'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-6">
          {/* Single Video Option */}
          <button
            onClick={() => onSelect(false)}
            className="group relative flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-200"
          >
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Video className="w-8 h-8 text-muted-foreground group-hover:text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-foreground mb-1">
                {language === 'en' ? 'Single Video' : 'Fiidiyow Keli ah'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'en' 
                  ? 'One video per course'
                  : 'Hal fiidiyow koorso kasta'}
              </p>
            </div>
          </button>

          {/* Playlist Option */}
          <button
            onClick={() => onSelect(true)}
            className="group relative flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-border hover:border-accent hover:bg-accent/5 transition-all duration-200"
          >
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center group-hover:bg-accent/10 transition-colors">
              <ListVideo className="w-8 h-8 text-muted-foreground group-hover:text-accent" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-foreground mb-1">
                {language === 'en' ? 'Playlist' : 'Liiska Fiidiyowyada'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'en' 
                  ? 'Multiple videos & sections'
                  : 'Fiidiyowyada badan & qaybaha'}
              </p>
            </div>
          </button>
        </div>

        <div className="flex justify-center">
          <Button variant="ghost" onClick={onClose}>
            {language === 'en' ? 'Cancel' : 'Jooji'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
