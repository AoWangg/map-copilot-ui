import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { useEffect, useState, useRef, useCallback } from "react";
import { Map, divIcon } from "leaflet";
import { cn } from "@/lib/utils";
import { PlaceCard } from "@/components/PlaceCard";
import type { GeoJsonObject } from "geojson";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { useChatContext } from "@copilotkit/react-ui";
import buslineData from "@/data/busline.json";
// import busStateData from "@/data/bus_state.json";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";

export type MapCanvasProps = {
  className?: string;
};

type BusLineData = {
  features: {
    properties: {
      BusName: string;
      Layer: string;
      Dir_Name: string;
    };
    geometry: GeoJsonObject;
  }[];
};

export function MapCanvas({ className }: MapCanvasProps) {
  const [map, setMap] = useState<Map | null>(null);
  const { setOpen } = useChatContext();
  const isDesktop = useMediaQuery("(min-width: 900px)");
  const prevIsDesktop = useRef(isDesktop);
  const [highlightedLineName, setHighlightedLineName] = useState<
    string | null
  >();
  const [selectedLineInfo, setSelectedLineInfo] = useState(null);

  const onLineClick = useCallback(
    (event) => {
      const lineId = event.target.feature.properties.Layer;
      setHighlightedLineName(lineId);
      setSelectedLineInfo(event.target.feature.properties);
    },
    [map]
  );

  const geoJsonStyle = (feature) => {
    const isHighlighted = feature.properties.Layer === highlightedLineName;
    return {
      color: isHighlighted ? "red" : "blue",
      weight: isHighlighted ? 10 : 2,
      opacity: isHighlighted ? 1 : 0.5,
    };
  };

  useEffect(() => {
    if (prevIsDesktop.current !== isDesktop) {
      setOpen(isDesktop);
    }
    prevIsDesktop.current = isDesktop;
  }, [isDesktop, setOpen]);

  useCopilotAction({
    name: "选择线路",
    description: "根据用户的问题选择线路",
    parameters: [
      {
        name: "busName",
        type: "string",
        description: "线路的名称",
        required: true,
      },
    ],
    handler: async ({ busName }) => {
      const line = (buslineData as BusLineData).features.find(
        (feature) => feature.properties.BusName === busName
      );
      if (line) {
        setHighlightedLineName(line.properties.Layer);
        setSelectedLineInfo(line.properties);
      }
    },
  });

  useCopilotReadable({
    description: "这是用户当前选择的线路的信息，你要根据此信息来回答用户的问题",
    value: selectedLineInfo,
  });

  return (
    <div className="relative">
      {selectedLineInfo && (
        <div className="absolute top-12 left-12 z-10">
          <PlaceCard
            className="border-none overflow-y-auto shadow-none cursor-pointer hover:shadow-lg"
            selectedLineInfo={selectedLineInfo}
          />
        </div>
      )}
      <MapContainer
        className={cn("w-screen h-screen", className)}
        style={{ zIndex: 0 }}
        center={[31.2304, 121.4737]}
        zoom={10}
        zoomAnimationThreshold={100}
        zoomControl={false}
        ref={setMap}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <GeoJSON
          data={buslineData as any}
          style={geoJsonStyle}
          onEachFeature={(feature, layer) => {
            layer.on({
              click: onLineClick,
            });
          }}
        />
      </MapContainer>
    </div>
  );
}
