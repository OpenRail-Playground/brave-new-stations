
import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { SecurityDispatchModal } from "./SecurityDispatchModal";
import { StationDetailModal } from "./StationDetailModal";

interface SecurityTeam {
  id: string;
  name: string;
  position: { x: number; y: number };
  status: "available" | "dispatched" | "busy";
}

interface Station {
  name: string;
  position: { x: number; y: number };
  status: "normal" | "alarm";
  passengerCount: number;
  lastTrain: string;
  nextTrain: string;
}

export const MapSection = () => {
  const [selectedTeam, setSelectedTeam] = useState<SecurityTeam | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showStationModal, setShowStationModal] = useState(false);

  // Security Teams basierend auf der echten Karte positioniert
  const securityTeams: SecurityTeam[] = [
    // Verfügbare Teams (gelb)
    { id: "1", name: "Team Alpha", position: { x: 25, y: 45 }, status: "available" },
    { id: "2", name: "Team Beta", position: { x: 65, y: 35 }, status: "available" },
    { id: "3", name: "Team Gamma", position: { x: 45, y: 65 }, status: "available" },
    // Nicht verfügbare Teams (schwarz)
    { id: "4", name: "Team Delta", position: { x: 35, y: 25 }, status: "busy" },
    { id: "5", name: "Team Echo", position: { x: 75, y: 55 }, status: "busy" },
    { id: "6", name: "Team Foxtrot", position: { x: 20, y: 70 }, status: "busy" },
  ];

  // Bahnhöfe basierend auf der echten Karte positioniert
  const stations: Station[] = [
    { 
      name: "Mannheim Hbf", 
      position: { x: 35, y: 42 }, 
      status: "normal",
      passengerCount: 42,
      lastTrain: "23:58 nach Frankfurt",
      nextTrain: "05:12 nach Stuttgart"
    },
    { 
      name: "Heidelberg Hbf", 
      position: { x: 62, y: 52 }, 
      status: "normal",
      passengerCount: 18,
      lastTrain: "23:45 nach Karlsruhe",
      nextTrain: "05:28 nach Frankfurt"
    },
    { 
      name: "Schwetzingen", 
      position: { x: 48, y: 62 }, 
      status: "alarm",
      passengerCount: 15,
      lastTrain: "22:05 nach Frankfurt",
      nextTrain: "05:22 nach Mannheim"
    },
    { 
      name: "Weinheim", 
      position: { x: 55, y: 20 }, 
      status: "normal",
      passengerCount: 8,
      lastTrain: "23:32 nach Mannheim",
      nextTrain: "05:15 nach Heidelberg"
    },
    { 
      name: "Hockenheim", 
      position: { x: 60, y: 78 }, 
      status: "normal",
      passengerCount: 3,
      lastTrain: "22:48 nach Karlsruhe",
      nextTrain: "05:45 nach Mannheim"
    },
    { 
      name: "Wiesloch-Walldorf", 
      position: { x: 75, y: 85 }, 
      status: "normal",
      passengerCount: 12,
      lastTrain: "23:15 nach Heidelberg",
      nextTrain: "05:38 nach Karlsruhe"
    }
  ];

  const handleTeamClick = (team: SecurityTeam) => {
    if (team.status === "available") {
      setSelectedTeam(team);
      setShowDispatchModal(true);
    }
  };

  const handleStationClick = (station: Station) => {
    setSelectedStation(station);
    setShowStationModal(true);
  };

  const getTeamStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-yellow-500";
      case "dispatched": return "bg-blue-500";
      case "busy": return "bg-black";
      default: return "bg-gray-500";
    }
  };

  return (
    <>
      <CardContent className="p-4">
        <div className="relative rounded-lg h-[calc(100vh-12rem)] overflow-hidden">
          {/* Neue Karte als Hintergrund */}
          <img 
            src="/lovable-uploads/7a2c3925-eaf6-44c7-9061-f6b0e8722db6.png" 
            alt="Rhein-Neckar Region Karte"
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
          />

          {/* Bahnhöfe */}
          {stations.map((station, index) => (
            <div
              key={index}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
                station.status === "alarm" ? "z-20" : "z-10"
              }`}
              style={{
                left: `${station.position.x}%`,
                top: `${station.position.y}%`
              }}
              onClick={() => handleStationClick(station)}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform ${
                  station.status === "alarm" ? "bg-red-500 animate-pulse" : "bg-green-500"
                }`}
                title={station.name}
              />
              <span className="absolute top-5 left-1/2 transform -translate-x-1/2 text-xs font-medium bg-white px-2 py-1 rounded shadow whitespace-nowrap">
                {station.name}
              </span>
            </div>
          ))}

          {/* Security Teams */}
          {securityTeams.map((team) => (
            <div
              key={team.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30"
              style={{
                left: `${team.position.x}%`,
                top: `${team.position.y}%`
              }}
            >
              <button
                className={`w-3 h-3 rounded-full border-2 border-white shadow-lg ${getTeamStatusColor(team.status)} ${
                  team.status === "available" ? "cursor-pointer hover:scale-110" : "cursor-default"
                } transition-transform`}
                onClick={() => handleTeamClick(team)}
                title={`${team.name} - ${team.status}`}
                disabled={team.status !== "available"}
              />
            </div>
          ))}
        </div>
      </CardContent>

      <SecurityDispatchModal
        team={selectedTeam}
        isOpen={showDispatchModal}
        onClose={() => setShowDispatchModal(false)}
      />

      <StationDetailModal
        station={selectedStation}
        isOpen={showStationModal}
        onClose={() => setShowStationModal(false)}
      />
    </>
  );
};
