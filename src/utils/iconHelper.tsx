import React from 'react';
import {
  Activity,
  Apple,
  Archive,
  BookOpen,
  Briefcase,
  Brush,
  Calendar,
  CalendarDays,
  CheckSquare,
  Coffee,
  DollarSign,
  Dumbbell,
  FileText,
  Film,
  FolderArchive,
  GraduationCap,
  Hammer,
  Heart,
  Home,
  LayoutGrid,
  Lightbulb,
  Music,
  PenTool,
  Plane,
  Settings,
  ShoppingBag,
  Sparkles,
  Sprout,
  Star,
  StickyNote,
  Sun,
  Users,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
}

export const DynamicIcon: React.FC<IconProps> = ({ name, className = 'w-4 h-4' }) => {
  switch (name.toLowerCase()) {
    case 'today':
    case 'calendardays':
      return <CalendarDays className={className} />;
    case 'planner':
    case 'calendar':
      return <Calendar className={className} />;
    case 'kanban':
    case 'layoutgrid':
      return <LayoutGrid className={className} />;
    case 'habits':
    case 'heart':
      return <Heart className={className} />;
    case 'finance':
    case 'wallet':
      return <Wallet className={className} />;
    case 'cleaning':
    case 'brush':
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'wellness':
    case 'activity':
      return <Activity className={className} />;
    case 'meals':
    case 'utensilscrossed':
    case 'apple':
      return <UtensilsCrossed className={className} />;
    case 'projects':
    case 'home':
    case 'hammer':
      return <Hammer className={className} />;
    case 'watchlist':
    case 'film':
      return <Film className={className} />;
    case 'contacts':
    case 'users':
      return <Users className={className} />;
    case 'notes':
    case 'stickynote':
    case 'pentool':
      return <StickyNote className={className} />;
    case 'documents':
    case 'folderarchive':
    case 'archive':
      return <FolderArchive className={className} />;
    case 'setup':
    case 'settings':
      return <Settings className={className} />;
    case 'sprout':
      return <Sprout className={className} />;
    case 'star':
      return <Star className={className} />;
    case 'coffee':
      return <Coffee className={className} />;
    case 'briefcase':
      return <Briefcase className={className} />;
    case 'dumbbell':
      return <Dumbbell className={className} />;
    case 'plane':
      return <Plane className={className} />;
    case 'music':
      return <Music className={className} />;
    case 'book':
    case 'bookopen':
      return <BookOpen className={className} />;
    case 'shopping':
    case 'shoppingbag':
      return <ShoppingBag className={className} />;
    case 'lightbulb':
      return <Lightbulb className={className} />;
    case 'graduationcap':
      return <GraduationCap className={className} />;
    default:
      return <FileText className={className} />;
  }
};
