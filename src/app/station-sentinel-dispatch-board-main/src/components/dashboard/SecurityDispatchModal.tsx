
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

interface SecurityTeam {
  id: string;
  name: string;
  position: { x: number; y: number };
  status: "available" | "dispatched" | "busy";
}

interface SecurityDispatchModalProps {
  team: SecurityTeam | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityDispatchModal = ({ team, isOpen, onClose }: SecurityDispatchModalProps) => {
  if (!team) return null;

  const handleDispatch = () => {
    toast.success(`${team.name} wurde nach Schwetzingen entsandt!`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Security Team Disposition
          </DialogTitle>
          <DialogDescription>
            Security Team zum Alarm in Schwetzingen entsenden
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{team.name}</h3>
            <Badge variant="secondary">Verfügbar</Badge>
          </div>
          
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-red-500" />
              <span className="font-medium text-red-700">Zielort:</span>
            </div>
            <p className="text-sm text-red-600">
              Bahnhof Schwetzingen - Unüblich hohes Personenaufkommen (15 Personen)
            </p>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Geschätzte Ankunftszeit:</span>
              <span>12-15 Minuten</span>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button onClick={handleDispatch} className="flex-1">
              Team entsenden
            </Button>
            <Button variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
