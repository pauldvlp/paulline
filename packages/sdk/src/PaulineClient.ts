import type { MachinePlaceholder, TunnelPlaceholder } from '@paulline/types';
import type { PaulineClientConfig } from './PaulineClientConfig';
import { ResourceClient } from './ResourceClient';

const MACHINES_RESOURCE_PATH = 'machines' as const;
const TUNNELS_RESOURCE_PATH = 'tunnels' as const;

export class PaulineClient {
  private readonly baseUrl: string;

  constructor(config: PaulineClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
  }

  machines(): ResourceClient<MachinePlaceholder, MachinePlaceholder, MachinePlaceholder> {
    return new ResourceClient(this.baseUrl, MACHINES_RESOURCE_PATH);
  }

  tunnels(): ResourceClient<TunnelPlaceholder, TunnelPlaceholder, TunnelPlaceholder> {
    return new ResourceClient(this.baseUrl, TUNNELS_RESOURCE_PATH);
  }
}
