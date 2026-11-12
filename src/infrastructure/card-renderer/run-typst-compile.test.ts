import { templatePathInWorkspace } from './run-typst-compile';

describe('templatePathInWorkspace function', () => {
  it(
    'joins the workspace templates folder with the named template',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // Typst is run on the workspace copy of the template, not the shared
      // assets.
      const path = templatePathInWorkspace('/tmp/ws', 'command.typ');

      expect(path).toBe('/tmp/ws/templates/command.typ');
    },
  );
});
