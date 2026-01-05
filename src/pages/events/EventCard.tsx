import { MapPin, Calendar, Heart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface EventCardProps {
  id: number;
  title: string;
  category: string;
  image_url: string;
  location: string;
  price: number;
  event_date: string;
  start_time?: string;
}

const formatDate = (date?: string, time?: string) => {
  if (!date) return "Date TBA";
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Date TBA";

  const dateStr = d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  if (time) {
    const [hours, minutes] = time.split(':');
    const timeDate = new Date();
    timeDate.setHours(parseInt(hours), parseInt(minutes));
    const timeStr = timeDate.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${dateStr}, ${timeStr}`;
  }

  return dateStr;
};

const EventCard = ({ 
  id, 
  title, 
  category, 
  image_url, 
  location, 
  price, 
  event_date, 
  start_time 
}: EventCardProps) => {
  const navigate = useNavigate();  
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div
      onClick={() => navigate(`/events/${id}`)}
      className="group cursor-pointer rounded-xl overflow-hidden bg-card card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <img
          src={image_url}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Category Badge */}
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm text-xs font-medium text-foreground">
          {category}
        </span>

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-card"
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${isLiked ? 'fill-accent text-accent' : 'text-foreground'}`} 
          />
        </button>

        {/* Price Badge */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-card/95 backdrop-blur-sm">
          <span className="text-sm font-bold text-foreground">₹{price}</span>
          <span className="text-xs text-muted-foreground ml-1">onwards</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-lg leading-snug text-foreground line-clamp-2 group-hover:text-accent transition-colors">
          {title}
        </h3>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{location}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>{formatDate(event_date, start_time)}</span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;