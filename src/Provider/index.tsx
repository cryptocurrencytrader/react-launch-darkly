import LaunchDarkly from "ldclient-js";
import React from "react";

import { Provider, ProviderValue } from "../context";

export interface LaunchDarklyProps {
  sdkKey: string;
  user?: LaunchDarkly.LDUser;
}

interface State {
  providerValue: ProviderValue;
}

class LaunchDarklyProvider extends React.Component<LaunchDarklyProps, State> {
  // tslint:disable-next-line:variable-name
  private _providerValueRef: ProviderValue;

  constructor(...args: any[]) {
    // @ts-ignore
    super(...args);

    this._providerValueRef = { client: undefined, clientReady: false };

    this.state = {
      providerValue: { ...this._providerValueRef },
    };
  }

  public componentDidMount() {
    if (this.props.user) {
      this.init(this.props.user);
    }
  }

  public componentDidUpdate(prevProps: LaunchDarklyProps) {
    if (this.props.user && this.props.user !== prevProps.user) {
      const { client } = this._providerValueRef;

      if (!client) {
        this.init(this.props.user);
      } else {
        client.identify(this.props.user);
      }
    }
  }

  private init(user: LaunchDarkly.LDUser): LaunchDarkly.LDClient {
    const { sdkKey } = this.props;

    const client = LaunchDarkly.initialize(sdkKey, user!);
    this._providerValueRef.client = client;

    client.on("ready", this.clientReadyHandler);
    this.setState({ providerValue: { ...this._providerValueRef } });

    return client;
  }

  private clientReadyHandler = async (): Promise<void> => {
    this._providerValueRef.clientReady = true;
    this.setState({ providerValue: { ...this._providerValueRef } });
  }

  public render() {
    return (
      <Provider value={this.state.providerValue}>
        {this.props.children}
      </Provider>
    );
  }
}

export default LaunchDarklyProvider as React.ComponentClass<LaunchDarklyProps>;
