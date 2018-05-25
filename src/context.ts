import { LDClient } from "ldclient-js";
import React from "react";

import createConsumerHOC from "@bitcointrade/react-helpers/createConsumerHOC";

export interface ProviderValue {
  client: LDClient | undefined;
  clientReady: boolean;
}

const { Consumer, Provider } = React.createContext<ProviderValue>({
  client: undefined,
  clientReady: false,
});

export { Provider };
export const launchDarklyHOC = createConsumerHOC<ProviderValue>(Consumer, "LaunchDarkly");
