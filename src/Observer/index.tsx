import React from "react";

import { launchDarklyHOC, ProviderValue } from "../context";

export type ChangeHandler = (settingsOrValue: any, prevValue?: any) => void;

export interface LaunchDarklyObserverProps {
  featureName?: string;
  onChange: ChangeHandler;
}

type InnerProps = LaunchDarklyObserverProps & Record<"context", ProviderValue>;

class LaunchDarklyObserver extends React.PureComponent<InnerProps> {
  public componentDidMount() {
    const { client } = this.props.context;

    if (client) {
      client.on(this.getEventName(), this.clientChangeHandler);
    }
  }

  public componentDidUpdate(prevProps: InnerProps) {
    if (this.props.context.client) {
      let shouldSetListener = this.props.context.client !== prevProps.context.client;

      if (this.props.featureName !== prevProps.featureName) {
        shouldSetListener = true;
        this.props.context.client.off(this.getEventName(prevProps.featureName), this.clientChangeHandler);
      }

      if (shouldSetListener) {
        this.props.context.client.on(this.getEventName(), this.clientChangeHandler);
      }
    }
  }

  public componentWillUnmount() {
    const { client } = this.props.context;

    if (client) {
      client.off(this.getEventName(), this.clientChangeHandler);
    }
  }

  private getEventName(featureName = this.props.featureName) {
    return ("change" + (featureName ? `:${featureName}` : "")) as "change";
  }

  private clientChangeHandler: ChangeHandler = (...args: any[]) => {
    (this.props.onChange as any)(...args);
  }

  public render() {
    return null;
  }
}

const LaunchDarklyObserverWithConsumer: React.ComponentClass<LaunchDarklyObserverProps> = launchDarklyHOC()(
  LaunchDarklyObserver,
);

export default LaunchDarklyObserverWithConsumer;
