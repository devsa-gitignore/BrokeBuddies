import { motion } from 'motion/react';
import { Calendar, MapPin, Trophy } from 'lucide-react';

interface HackathonCardData {
  id: string;
  name: string;
  hostedBy: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  status: 'upcoming' | 'open' | 'ongoing' | 'closed';
  bannerImage?: string;
}

interface HackathonCardProps {
  hackathon: HackathonCardData;
  onClick: () => void;
}

export function HackathonCard({ hackathon, onClick }: HackathonCardProps) {
  const status = hackathon.status;

  const statusColors = {
    open: 'bg-green-500/20 text-green-400 border-green-500/30',
    upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    ongoing: 'bg-[#FFB703]/20 text-[#FFB703] border-[#FFB703]/30',
    closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(255, 183, 3, 0.15)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-[#1A1A1A] rounded-xl overflow-hidden border border-[#FFB703]/10 cursor-pointer transition-all duration-200 group"
    >
      {hackathon.bannerImage && (
        <div className="h-48 overflow-hidden relative">
          <img
            src={hackathon.bannerImage}
            alt={hackathon.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent" />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-white group-hover:text-[#FFB703] transition-colors">
            {hackathon.name}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs border ${statusColors[status]}`}>
            {status.toUpperCase()}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>{hackathon.hostedBy}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}</span>
          </div>
        </div>

        <p className="text-gray-400 text-sm line-clamp-2 mb-4">
          {hackathon.description}
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-[#FFB703] to-[#FB8500] text-[#0F0F0F] rounded-lg font-medium hover:shadow-lg hover:shadow-[#FFB703]/30 transition-all duration-200"
        >
          View Details
        </motion.button>
      </div>
    </motion.div>
  );
}
