
import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Users, Clock, MapPin } from "lucide-react";
import { AlarmDetailModal } from "./AlarmDetailModal";

interface Alarm {
  id: string;
  title: string;
  station: string;
  severity: "high" | "medium" | "low";
  personCount: number;
  time: string;
  description: string;
}

export const AlarmSection = () => {
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);

  const alarms: Alarm[] = [
    {
      id: "1",
      title: "Unüblich hohes Personenaufkommen",
      station: "Schwetzingen",
      severity: "high",
      personCount: 15,
      time: "23:45",
      description: "Außerhalb der Betriebszeiten wurden 15 Personen am Bahnhof Schwetzingen erkannt. Normale Personenzahl zu dieser Zeit: 0-2 Personen."
    },
    {
      id: "2", 
      title: "Verdächtige Aktivität erkannt",
      station: "Weinheim",
      severity: "medium",
      personCount: 5,
      time: "02:15",
      description: "Gruppe von 5 Personen hält sich seit über 30 Minuten im Wartebereich auf."
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
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
    <>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alarms.map((alarm) => (
            <div 
              key={alarm.id}
              className="cursor-pointer hover:shadow-lg transition-shadow border border-gray-200 rounded-lg p-4 border-l-4 border-l-red-500 bg-white"
              onClick={() => setSelectedAlarm(alarm)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getSeverityColor(alarm.severity)}`} />
                  <span className="text-sm font-medium text-gray-600">
                    {getSeverityText(alarm.severity)}
                  </span>
                </div>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {alarm.time}
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">
                {alarm.title}
              </h3>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {alarm.station}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {alarm.personCount} Personen
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <AlarmDetailModal 
        alarm={selectedAlarm}
        isOpen={!!selectedAlarm}
        onClose={() => setSelectedAlarm(null)}
      />
    </>
  );
};
