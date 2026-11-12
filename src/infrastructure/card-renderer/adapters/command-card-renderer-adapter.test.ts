import type { CommandCardRendererDeps } from '../card-renderer-deps';
import { createCommandCardRendererAdapter } from './command-card-renderer-adapter';

describe('createCommandCardRendererAdapter function', () => {
  it(
    'exposes renderCommandCard on the returned port',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // Only the dependency's shape is needed: the adapter keeps it until a
      // render is requested.
      const deps = { assetsDir: '/tmp/assets' } as CommandCardRendererDeps; // adapter only stores deps for later render
      const adapter = createCommandCardRendererAdapter(deps);

      // The returned port offers the render the card routes call.
      expect(adapter.renderCommandCard).toBeTypeOf('function');
    },
  );
});
