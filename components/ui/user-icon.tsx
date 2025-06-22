import { divIcon } from "leaflet";
import { Xuesheng } from "../people/xuesheng";
import { Gongren } from "../people/gongren";
import { Zhiyuan } from "../people/zhiyuan";
import { Jiaoshi } from "../people/jiaoshi";
import { renderToString } from "react-dom/server";

const occupationIconMapping: Record<string, React.ReactNode> = {
  "1": <Xuesheng className="w-4 h-4" />,
  "2": <Gongren className="w-4 h-4" />,
  "3": <Zhiyuan className="w-4 h-4" />,
  "4": <Jiaoshi className="w-4 h-4" />,
  "5": <Gongren className="w-4 h-4" />,
};

export const createPersonIcon = (gender: string, occupationCode: string) => {
  const isFemale = gender === "女";
  const iconElement = occupationIconMapping[occupationCode] || (
    <Xuesheng className="w-4 h-4" />
  );

  return divIcon({
    html: renderToString(iconElement),
    className: "custom-person-icon",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};
