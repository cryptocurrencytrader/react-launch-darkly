import LaunchDarkly from "ldclient-js";
import React from "react";
import shortid from "shortid";

import { Provider, ProviderValue } from "../context";

export interface LaunchDarklyProps {
  sdkKey: string;
  user?: LaunchDarkly.LDUser;
}

interface State extends Pick<LaunchDarklyProps, "user"> {
  providerValue: ProviderValue;
}

class LaunchDarklyProvider extends React.Component<LaunchDarklyProps, State> {
  private componentMounted: boolean = false;

  private componentMountPromise: Promise<void>;

  private componentMountResolver?: () => void;

  constructor(...args: any[]) {
    // @ts-ignore
    super(...args);
    const { sdkKey, user = { key: shortid(), anonymous: true } } = this.props;

    const client = LaunchDarkly.initialize(sdkKey, user);
    client.on("ready", this.clientReadyHandler);

    this.componentMountPromise = new Promise((resolveFn) => {
      this.componentMountResolver = resolveFn;

      if (this.componentMounted) {
        this.componentMountResolver();
      }
    });

    this.state = {
      providerValue: { client, clientReady: false },
      user,
    };
  }

  public componentDidUpdate(prevProps: LaunchDarklyProps) {
    if (this.props.user && this.props.user !== prevProps.user) {
       const { client } = this.state.providerValue;
       client.identify(this.props.user);
    }
  }

  public componentDidMount() {
    this.componentMounted = true;

    if (this.componentMountResolver) {
      this.componentMountResolver();
    }
  }

  private clientReadyHandler = async (): Promise<void> => {
    await this.componentMountPromise;

    this.setState({
      providerValue: {
        ...this.state.providerValue,
        clientReady: true,
      },
    });
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
