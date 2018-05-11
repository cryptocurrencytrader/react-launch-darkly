import { LDClient } from "ldclient-js";
import React from "react";

import createConsumerHOC from "@bitcointrade/react-helpers/createConsumerHOC";

const { Consumer, Provider } = React.createContext({});

export interface ProviderValue {
  client: LDClient;
  clientReady: boolean;
}

export { Provider };
export const launchDarklyHOC = createConsumerHOC<ProviderValue>(Consumer);
