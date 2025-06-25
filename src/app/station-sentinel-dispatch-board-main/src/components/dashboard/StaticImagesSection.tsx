
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, Calendar } from "lucide-react";

export const StaticImagesSection = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageUpload = (type: "capacity" | "schedule") => {
    // Hier würde normalerweise ein File Upload Handler implementiert werden
    console.log(`Upload ${type} image`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-purple-500" />
          Auslastung & Fahrplan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auslastungsbild */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Bahnhof Auslastung</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleImageUpload("capacity")}
              className="flex items-center gap-1"
            >
              <Upload className="h-4 w-4" />
              Bild hochladen
            </Button>
          </div>
          
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <img
              src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&h=200&fit=crop"
              alt="Bahnhof Auslastung"
              className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setSelectedImage("capacity")}
            />
            <p className="text-sm text-gray-500 mt-2">
              Aktuelle Auslastung: Schwetzingen Bahnhof
            </p>
          </div>
        </div>

        {/* Fahrplan */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Fahrplan</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleImageUpload("schedule")}
              className="flex items-center gap-1"
            >
              <Upload className="h-4 w-4" />
              Bild hochladen
            </Button>
          </div>
          
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <img
              src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=200&fit=crop"
              alt="Fahrplan"
              className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setSelectedImage("schedule")}
            />
            <p className="text-sm text-gray-500 mt-2">
              Aktueller Fahrplan - Schwetzingen
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-700">Information</span>
          </div>
          <p className="text-xs text-blue-600">
            Klicken Sie auf die Bilder für eine vergrößerte Ansicht. 
            Verwenden Sie die Upload-Buttons um aktuelle Bilder hochzuladen.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
