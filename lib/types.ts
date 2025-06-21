export type LineInfo = {
  BusName: string;
  Dir_Name: string;
  S_Station: string;
  E_Station: string;
  length: number;
  Layer: string;
};

export const defaultLineInfo: LineInfo = {
  BusName: "浦东59路",
  Dir_Name: "浦东59路(宣夏路宣兰路--大川公路拱乐路)",
  S_Station: "宣夏路宣兰路",
  E_Station: "大川公路拱乐路",
  length: 16135.387947233279,
  Layer: "浦东59路(宣夏路宣兰路--大川公路拱乐路)",
};

export type SearchProgress = {
  query: string;
  done: boolean;
};

export type AgentState = {
  line_info?: LineInfo;
  Line_name?: string;
  search_progress?: SearchProgress[];
};
