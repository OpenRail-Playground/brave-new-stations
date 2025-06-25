
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Clock, AlertTriangle, Train } from "lucide-react";

interface Alarm {
  id: string;
  title: string;
  station: string;
  severity: "high" | "medium" | "low";
  personCount: number;
  time: string;
  description: string;
}

interface AlarmDetailModalProps {
  alarm: Alarm | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AlarmDetailModal = ({ alarm, isOpen, onClose }: AlarmDetailModalProps) => {
  if (!alarm) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "default";
      default: return "default";
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "high": return "Hoch";
      case "medium": return "Mittel";
      case "low": return "Niedrig";
      default: return "Unbekannt";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Alarm Details
          </DialogTitle>
          <DialogDescription>
            Detaillierte Informationen zum Sicherheitsalarm
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{alarm.title}</h3>
            <Badge variant={getSeverityColor(alarm.severity)}>
              {getSeverityText(alarm.severity)}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Bahnhof:</span>
              <span>{alarm.station}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Personenanzahl:</span>
              <span>{alarm.personCount}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Zeit:</span>
              <span>{alarm.time}</span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">{alarm.description}</p>
          </div>
          
          {/* Train Schedule Section */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Train className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-blue-700">Fahrplan Schwetzingen</span>
            </div>
            <div className="space-y-1 text-sm text-blue-600">
              <div>Letzter Zug: 22:05 → Frankfurt</div>
              <div>Nächster Zug: 05:22 → Mannheim</div>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button className="flex-1">
              Security Team entsenden
            </Button>
            <Button variant="outline" onClick={onClose}>
              Schließen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
