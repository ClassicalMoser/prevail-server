import { templatePathInWorkspace } from './run-typst-compile';

describe('templatePathInWorkspace function', () => {
  it(
    'joins the workspace templates folder with the named template',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const path = templatePathInWorkspace('/tmp/ws', 'command.typ');

      expect(path).toBe('/tmp/ws/templates/command.typ');
    },
  );
});
