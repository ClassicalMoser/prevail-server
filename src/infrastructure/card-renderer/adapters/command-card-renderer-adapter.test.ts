import type { CommandCardRendererDeps } from '../card-renderer-deps';
import { createCommandCardRendererAdapter } from './command-card-renderer-adapter';

describe('createCommandCardRendererAdapter function', () => {
  it(
    'exposes renderCommandCard on the returned port',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const deps = { assetsDir: '/tmp/assets' } as CommandCardRendererDeps; // adapter only stores deps for later render
      const adapter = createCommandCardRendererAdapter(deps);

      expect(adapter.renderCommandCard).toBeTypeOf('function');
    },
  );
});
