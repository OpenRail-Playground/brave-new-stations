
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Clock, Train, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Station {
  name: string;
  position: { x: number; y: number };
  status: "normal" | "alarm";
  passengerCount: number;
  lastTrain: string;
  nextTrain: string;
}

interface StationDetailModalProps {
  station: Station | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StationDetailModal = ({ station, isOpen, onClose }: StationDetailModalProps) => {
  if (!station) return null;

  const handleDispatchSecurity = () => {
    toast.success(`Security Team wird zu ${station.name} entsandt!`);
    onClose();
  };

  // Simulierte Zeitreihen-Daten für Personenanzahl (letzte 24 Stunden)
  const timelineData = [
    { time: "00:00", count: 2 },
    { time: "02:00", count: 1 },
    { time: "04:00", count: 0 },
    { time: "06:00", count: 12 },
    { time: "08:00", count: 45 },
    { time: "10:00", count: 38 },
    { time: "12:00", count: 52 },
    { time: "14:00", count: 41 },
    { time: "16:00", count: 48 },
    { time: "18:00", count: 55 },
    { time: "20:00", count: 32 },
    { time: "22:00", count: 18 },
    { time: "Jetzt", count: station.passengerCount }
  ];

  // Simulierte Live-Abfahrtstabelle
  const departures = [
    { time: "05:22", destination: "Mannheim Hbf", platform: "2", delay: 0 },
    { time: "05:45", destination: "Frankfurt (Main) Hbf", platform: "1", delay: 3 },
    { time: "06:12", destination: "Heidelberg Hbf", platform: "2", delay: 0 },
    { time: "06:35", destination: "Karlsruhe Hbf", platform: "1", delay: 0 },
    { time: "07:02", destination: "Stuttgart Hbf", platform: "2", delay: 5 }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Train className="h-5 w-5 text-blue-500" />
            Bahnhof {station.name}
          </DialogTitle>
          <DialogDescription>
            Aktuelle Übersicht und Live-Daten
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Grunddaten */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{station.passengerCount}</div>
              <div className="text-sm text-gray-600">Aktuelle Personen</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Badge variant={station.status === "alarm" ? "destructive" : "secondary"}>
                {station.status === "alarm" ? "Alarm aktiv" : "Normal"}
              </Badge>
              <div className="text-sm text-gray-600 mt-2">Status</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-sm font-medium">Letzter Zug:</div>
              <div className="text-xs text-gray-600">{station.lastTrain}</div>
            </div>
          </div>

          {/* Personenanzahl Zeitreihe */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Personenanzahl (24h)
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-end h-32 space-x-1">
                {timelineData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className={`w-full rounded-t ${
                        data.time === "Jetzt" && station.status === "alarm" 
                          ? "bg-red-500" 
                          : "bg-blue-400"
                      }`}
                      style={{ 
                        height: `${Math.max(data.count * 2, 4)}px`,
                        maxHeight: "100px"
                      }}
                    />
                    <span className="text-xs mt-1 text-gray-600 transform -rotate-45 origin-top-left">
                      {data.time}
                    </span>
                    <span className="text-xs font-medium">{data.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Abfahrtstabelle */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Train className="h-4 w-4" />
              Live Abfahrtstabelle
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">Zeit</th>
                    <th className="text-left p-3">Ziel</th>
                    <th className="text-left p-3">Gleis</th>
                    <th className="text-left p-3">Verspätung</th>
                  </tr>
                </thead>
                <tbody>
                  {departures.map((departure, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3 font-medium">{departure.time}</td>
                      <td className="p-3">{departure.destination}</td>
                      <td className="p-3">{departure.platform}</td>
                      <td className="p-3">
                        {departure.delay > 0 ? (
                          <Badge variant="destructive">+{departure.delay} min</Badge>
                        ) : (
                          <Badge variant="secondary">pünktlich</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Nächster Zug Info */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Train className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-blue-700">Nächster Zug:</span>
            </div>
            <p className="text-sm text-blue-600">{station.nextTrain}</p>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button onClick={handleDispatchSecurity} className="flex-1">
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
