import type { UnitCardRendererDeps } from '../card-renderer-deps';
import { createUnitCardRendererAdapter } from './unit-card-renderer-adapter';

describe('createUnitCardRendererAdapter function', () => {
  it('exposes renderUnitCard on the returned port', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // Only the dependency's shape is needed: the adapter keeps it until a
    // render is requested.
    const deps = {
      allowedMediaOrigin: 'https://cdn.example',
      assetsDir: '/tmp/assets',
    } as UnitCardRendererDeps; // adapter only stores deps for later render
    const adapter = createUnitCardRendererAdapter(deps);

    // The returned port offers the render the card routes call.
    expect(adapter.renderUnitCard).toBeTypeOf('function');
  });
});
