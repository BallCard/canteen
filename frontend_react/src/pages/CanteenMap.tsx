import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Navigation, MapPin, Compass, Search, Info } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";

// Fix leaflet icon issue with more modern custom style if possible
const markerIcon = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const markerShadow = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Canteen {
  id: number;
  name: string;
  distance: string;
  status: string;
  lat?: number;
  lng?: number;
}

function RecenterMap({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 16);
  }, [coords, map]);
  return null;
}

function MapControls() {
  const map = useMap();
  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-[1000] pointer-events-none">
      <div className="flex flex-col bg-white/80 backdrop-blur-xl rounded-2xl shadow-premium border border-white pointer-events-auto overflow-hidden">
        <button 
          onClick={() => map.setZoom(map.getZoom() + 1)}
          className="w-12 h-12 flex items-center justify-center active:bg-gray-100 transition-colors text-[#1A1A1A] font-black text-xl"
        >
          +
        </button>
        <div className="h-[1px] bg-gray-100 mx-2" />
        <button 
          onClick={() => map.setZoom(map.getZoom() - 1)}
          className="w-12 h-12 flex items-center justify-center active:bg-gray-100 transition-colors text-[#1A1A1A] font-black text-xl"
        >
          −
        </button>
      </div>
      
      <button 
        onClick={() => map.setView([30.302, 120.085], 15)}
        className="w-12 h-12 bg-white/80 backdrop-blur-xl rounded-2xl shadow-premium border border-white flex items-center justify-center pointer-events-auto active:scale-90 transition-all text-zju-green"
      >
        <Compass className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function CanteenMap() {
  const navigate = useNavigate();
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCanteen, setSelectedCanteen] = useState<Canteen | null>(null);

  useEffect(() => {
    fetch("/api/canteens")
      .then((res) => res.json())
      .then((data) => {
        setCanteens(data);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-10 h-10 border-4 border-zju-green border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F7F8FA]">
      {/* Premium Search/Header Bar */}
      <div className="absolute top-10 left-6 right-6 z-[1000] flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="w-12 h-12 bg-white/80 backdrop-blur-xl rounded-[1.2rem] shadow-premium flex items-center justify-center active:scale-90 transition-all border border-white"
          >
            <ChevronLeft className="w-6 h-6 text-[#1A1A1A]" />
          </button>
          <div className="flex-1 h-12 bg-white/80 backdrop-blur-xl rounded-[1.2rem] shadow-premium border border-white flex items-center px-4 gap-3">
            <Search className="w-4 h-4 text-gray-300" />
            <input 
              type="text" 
              placeholder="搜索食堂..." 
              className="bg-transparent flex-1 text-sm font-bold focus:outline-none placeholder:text-gray-300 text-[#1A1A1A]"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {["全部食堂", "附近的", "热门的"].map((label) => (
             <button 
               key={label}
               className="px-4 py-2 bg-white/80 backdrop-blur-xl rounded-xl text-[10px] font-black uppercase tracking-widest text-zju-green shadow-premium border border-white whitespace-nowrap active:scale-95 transition-all"
             >
               {label}
             </button>
          ))}
        </div>
      </div>

      <div className="flex-1">
        <MapContainer 
          center={[30.302, 120.085]}
          zoom={15} 
          scrollWheelZoom={true} 
          className="w-full h-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapControls />
          {canteens.map((canteen, index) => {
            const lat = canteen.lat ?? 30.302 + index * 0.003;
            const lng = canteen.lng ?? 120.085 + index * 0.003;
            return (
            <Marker 
              key={canteen.id} 
              position={[lat, lng]}
              eventHandlers={{
                click: () => setSelectedCanteen(canteen),
              }}
            >
              <Popup className="premium-popup">
                <div className="p-2 flex flex-col gap-2 min-w-[120px]">
                  <h4 className="font-black text-sm text-[#1A1A1A] tracking-tight">{canteen.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg",
                      canteen.status === "营业中" ? "bg-zju-green-light text-zju-green" : "bg-gray-100 text-gray-400"
                    )}>
                      {canteen.status}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          )})}
          {selectedCanteen && <RecenterMap coords={[selectedCanteen.lat ?? 30.302, selectedCanteen.lng ?? 120.085]} />}
        </MapContainer>
      </div>

      {/* Canteen Info Card at Bottom */}
      <AnimatePresence>
        {selectedCanteen && (
          <motion.div 
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-12 left-8 right-8 z-[1000] bg-white rounded-[3rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white flex flex-col gap-8"
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zju-green/60">选定位置</span>
                <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tight">{selectedCanteen.name}</h3>
                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold">
                  <MapPin className="w-3 h-3" />
                  <span className="uppercase tracking-widest">校园核心餐饮区</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCanteen(null)}
                className="w-10 h-10 bg-[#F7F8FA] rounded-2xl flex items-center justify-center text-gray-300"
              >
                <ChevronLeft className="w-5 h-5 rotate-270" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F7F8FA] rounded-2xl p-5 flex flex-col gap-1 border border-gray-50">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">当前状态</span>
                <span className={cn("text-[11px] font-black uppercase tracking-widest", selectedCanteen.status === "营业中" ? "text-zju-green" : "text-gray-400")}>{selectedCanteen.status}</span>
              </div>
              <div className="bg-[#F7F8FA] rounded-2xl p-5 flex flex-col gap-1 border border-gray-50">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">步行距离</span>
                <span className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-widest">{selectedCanteen.distance}</span>
              </div>
            </div>

            <div className="flex gap-4">
               <button 
                 onClick={() => navigate(`/menu/${selectedCanteen.id}`)}
                 className="flex-1 h-14 bg-[#F7F8FA] text-[#1A1A1A] rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all border border-gray-100"
               >
                 查看菜单
               </button>
               <button className="flex-[1.5] h-14 bg-zju-green text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-zju-green/30 active:scale-95 transition-all">
                  <Navigation className="w-4 h-4" /> 开始导航
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
