import React from "react";

import { launchDarklyHOC, ProviderValue } from "./context";
import LaunchDarklyObserver from "./Observer";

export { default as LaunchDarklyProvider } from "./Provider";
export * from "./Provider";

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
    const { clientReady } = this.props.context;

    if (clientReady) {
      this.setVariation();
    }
  }

  public componentDidUpdate(prevProps: InnerProps) {
    if (
      this.props.context.clientReady &&
      (
        this.props.context.clientReady !== prevProps.context.clientReady ||
        this.props.featureName !== prevProps.featureName ||
        this.props.defaultValue !== prevProps.defaultValue
      )
    ) {
      this.setVariation();
    }
  }

  private clientChangeHandler = (): void => {
    this.setVariation();
  }

  private setVariation(): void {
    const { defaultValue = false, expectedValue = true, context: { client } } = this.props;
    const value = client!.variation(this.props.featureName, defaultValue);

    this.setState({ showFeature: value === expectedValue });
  }

  public render() {
    return (
      <>
        {this.state.showFeature ? this.props.children : null}

        <LaunchDarklyObserver
          featureName={this.props.featureName}
          onChange={this.clientChangeHandler}
        />
      </>
    );
  }
}

const LaunchDarklyFlagWithConsumer: React.ComponentClass<LaunchDarklyFlagProps> = launchDarklyHOC()(LaunchDarklyFlag);
export default LaunchDarklyFlagWithConsumer;
