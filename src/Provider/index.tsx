import { initialize, LDUser } from "ldclient-js";
import React from "react";
import shallowEqual from "shallowequal";

import { Provider, ProviderValue } from "../context";

export interface LaunchDarklyProps {
  sdkKey: string;
  user?: LDUser;
}

interface State {
  providerValue: ProviderValue;
}

class LaunchDarklyProvider extends React.Component<LaunchDarklyProps, State> {
  // tslint:disable-next-line:variable-name
  private _providerValueClone: ProviderValue;

  constructor(...args: any[]) {
    // @ts-ignore
    super(...args);

    this._providerValueClone = { client: undefined, clientReady: false };

    this.state = {
      providerValue: { ...this._providerValueClone },
    };
  }

  public componentDidMount() {
    if (this.props.user) {
      this.init(this.props.user);
    }
  }

  public componentDidUpdate(prevProps: LaunchDarklyProps) {
    if (this.props.user && !shallowEqual(this.props.user, prevProps.user)) {
      const { client } = this._providerValueClone;

      if (!client) {
        this.init(this.props.user);
      } else {
        client.identify(this.props.user);
      }
    }
  }

  private init(user: LDUser): void {
    const { sdkKey } = this.props;

    const client = initialize(sdkKey, user!);
    this._providerValueClone.client = client;

    client.on("ready", this.clientReadyHandler);

    this.setState({ providerValue: { ...this._providerValueClone } });
  }

  private clientReadyHandler = async (): Promise<void> => {
    this._providerValueClone.clientReady = true;
    this.setState({ providerValue: { ...this._providerValueClone } });
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
