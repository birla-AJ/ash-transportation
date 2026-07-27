export type RootStackParamList = {
  Tabs: undefined;
  AddChallan: undefined;
  ChallanDetail: { challanId: string };
  Receipt: { challanId: string; copies?: number };
  AuditLogs: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Challans: undefined;
  Reports: undefined;
  Settings: undefined;
};
