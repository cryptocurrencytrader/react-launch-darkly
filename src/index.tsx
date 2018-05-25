import React from "react";

export { default as LaunchDarklyProvider } from "./Provider";
export * from "./Provider";
import { launchDarklyHOC, ProviderValue } from "./context";

export interface LaunchDarklyFlagProps {
  defaultValue?: any;
  expectedValue?: any;
  featureName: string;
}

type InnerProps = LaunchDarklyFlagProps & Record<"context", ProviderValue>;

interface State {
  showFeature: boolean;
}

class LaunchDarklyFlag extends React.Component<InnerProps> {
  public state: State = {
    showFeature: false,
  };

  public componentDidMount() {
    const { client, clientReady } = this.props.context;

    if (clientReady) {
      this.setVariation(this.props.context.client!);
      client!.on("change", this.clientChangeHandler);
    }
  }

  public componentDidUpdate(prevProps: InnerProps) {
    if (this.props.context.client && this.props.context.client !== prevProps.context.client) {
      this.props.context.client.on("change", this.clientChangeHandler);
    }

    if (
      this.props.context.clientReady &&
      (
        this.props.context.clientReady !== prevProps.context.clientReady ||
        this.props.featureName !== prevProps.featureName ||
        this.props.defaultValue !== prevProps.defaultValue
      )
    ) {
      this.setVariation(this.props.context.client!);
    }
  }

  public componentWillUnmount() {
    const { client } = this.props.context;

    if (client) {
      client.off("change", this.clientChangeHandler);
    }
  }

  private clientChangeHandler = (): void => {
    this.setVariation(this.props.context.client!);
  }

  private setVariation(client: Pick<ProviderValue, "client">["client"] & {}): void {
    const { defaultValue = false, expectedValue = true } = this.props;
    const value = client.variation(this.props.featureName, defaultValue);
    this.setState({ showFeature: value === expectedValue });
  }

  public render() {
    return (
      <>
        {this.state.showFeature ? this.props.children : null}
      </>
    );
  }
}

const LaunchDarklyFlagWithConsumer: React.ComponentClass<LaunchDarklyFlagProps> = launchDarklyHOC()(LaunchDarklyFlag);
export default LaunchDarklyFlagWithConsumer;
