import React from "react";

export { default as LaunchDarklyProvider } from "./Provider";
export * from "./Provider";
import { launchDarklyHOC, ProviderValue } from "./context";

export interface LaunchDarklyFlagProps {
  defaultValue?: any;
  featureName: string;
}

type InnerProps = LaunchDarklyFlagProps & Record<"context", ProviderValue>;

interface State {
  showFeature: boolean;
}

class LaunchDarklyFlag extends React.Component<InnerProps, State> {
  public state: State = {
    showFeature: false,
  };

  public componentDidMount() {
    const { client, clientReady } = this.props.context;

    if (clientReady) {
      this.setVariation();
    }

    client.on("change", this.clientChangeHandler);
  }

  public componentDidUpdate(prevProps: InnerProps) {
    if (
      this.props.context.clientReady !== prevProps.context.clientReady ||
      this.props.featureName !== prevProps.featureName ||
      this.props.defaultValue !== prevProps.defaultValue
    ) {
      this.setVariation();
    }
  }

  public componentWillUnmount() {
    const { client } = this.props.context;
    client.off("change", this.clientChangeHandler);
  }

  private clientChangeHandler = (): void => {
    this.setVariation();
  }

  private setVariation(): void {
    const { context: { client }, defaultValue = false } = this.props;
    const showFeature = client.variation(this.props.featureName, defaultValue);
    this.setState({ showFeature: !!showFeature });
  }

  public render() {
    return (
      <>
        {this.state.showFeature ? this.props.children : null}
      </>
    );
  }
}

const LaunchDarklyFlagWithConsumer: any = launchDarklyHOC()(LaunchDarklyFlag);
export default LaunchDarklyFlagWithConsumer as React.ComponentClass<LaunchDarklyFlagProps>;
