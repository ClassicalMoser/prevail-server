import type { UnitCardRendererDeps } from '../card-renderer-deps';
import { createUnitCardRendererAdapter } from './unit-card-renderer-adapter';

describe('createUnitCardRendererAdapter function', () => {
  it('exposes renderUnitCard on the returned port', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const deps = {
      allowedMediaOrigin: 'https://cdn.example',
      assetsDir: '/tmp/assets',
    } as UnitCardRendererDeps; // adapter only stores deps for later render
    const adapter = createUnitCardRendererAdapter(deps);

    expect(adapter.renderUnitCard).toBeTypeOf('function');
  });
});
