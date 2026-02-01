export interface Course {
  id: string;
  title: string;
  title_so: string | null;
  description: string | null;
  description_so: string | null;
  category: string;
  category_so: string | null;
  instructor_name: string;
  instructor_avatar: string | null;
  duration: string | null;
  level: string | null;
  level_so: string | null;
  price: number;
  image_url: string | null;
  is_online: boolean;
  is_published: boolean;
  rating: number;
  students_count: number;
  created_at: string;
  updated_at: string;
}

export const categoryColors: Record<string, string> = {
  'Health Science': 'bg-red-500',
  'Sayniska Caafimaadka': 'bg-red-500',
  'Technology': 'bg-blue-500',
  'Tignoolajiyada': 'bg-blue-500',
  'Language': 'bg-green-500',
  'Luqadaha': 'bg-green-500',
  'Business': 'bg-purple-500',
  'Ganacsi': 'bg-purple-500',
};

export function getCategoryColor(category: string): string {
  return categoryColors[category] || 'bg-gray-500';
}
