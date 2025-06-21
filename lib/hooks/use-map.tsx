import { SearchProgress } from "@/components/SearchProgress";
import {
  useCoAgent,
  useCoAgentStateRender,
  useCopilotAction,
} from "@copilotkit/react-core";
import { useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { createContext, useContext, ReactNode, useMemo } from "react";
import { AgentState, defaultLineInfo } from "@/lib/types";

type MapContextType = {
  slectedLine: any;
  selectedLineInfo: any;
};

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider = ({ children }: { children: ReactNode }) => {
  const { state, setState } = useCoAgent<AgentState>({
    name: "map",
    initialState: {
      line_info: defaultLineInfo,
      Line_name: defaultLineInfo.BusName,
    },
  });

  useCoAgentStateRender<AgentState>({
    name: "map",
    render: ({ state }) => {
      if (state.search_progress && state.search_progress.length > 0) {
        return <SearchProgress progress={state.search_progress} />;
      }
      return null;
    },
  });

  useCopilotChatSuggestions(
    {
      instructions: `根据用户的问题，提供公交信息查询，展示等服务.\n ${
        state.Line_name
      } \n ${JSON.stringify(state.line_info)}`,
      minSuggestions: 1,
      maxSuggestions: 2,
    },
    [state.line_info]
  );

  return (
    <MapContext.Provider
      value={{
        slectedLine: state.Line_name,
        selectedLineInfo: state.line_info,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error("useMap must be used within a TripsProvider");
  }
  return context;
};
