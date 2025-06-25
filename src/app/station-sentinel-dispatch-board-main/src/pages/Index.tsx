
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlarmSection } from "@/components/dashboard/AlarmSection";
import { MapSection } from "@/components/dashboard/MapSection";
import { AlertTriangle, Map } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-2rem)]">
          {/* Alarms Section */}
          <div className="flex flex-col">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Aktuelle Alarme
                </CardTitle>
              </CardHeader>
              <AlarmSection />
            </Card>
          </div>

          {/* Map Section */}
          <div className="flex flex-col">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Map className="h-5 w-5 text-blue-500" />
                  Kartenansicht Rhein-Neckar-Region
                </CardTitle>
              </CardHeader>
              <MapSection />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
