export interface IPayload {
  message: {
    ts: number;
  };
  channel: {
    id: string;
  };
  response_url: string;
  actions: IAction[];
  callbackId: string;
  user: {
    id: string;
  };
}

export interface IAction {
  value: string;
}
