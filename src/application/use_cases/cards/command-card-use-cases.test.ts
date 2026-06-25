import { tempCommandCards } from '@classicalmoser/prevail-rules/domain';
import type { Card } from '@classicalmoser/prevail-rules/domain';
import type {
  CommandCardCertificationStatus,
  CommandCardRendererPort,
  CommandCardStorage,
} from '@ports';
import { createCommandCardUseCases } from './command-card-use-cases';

// Indices 4/5 have unitSupport.count >= 1, satisfying the domain schema.
const validCardA = tempCommandCards[4];
const validCardB = tempCommandCards[5];

// Drop a required nested field so the domain schema rejects it.
const invalidCard = {
  ...tempCommandCards[2],
  command: undefined as unknown as Card['command'],
};

const status = (
  card: Card,
  certified: boolean,
): CommandCardCertificationStatus => ({ card, certified });

const buildStorage = (
  overrides: Partial<CommandCardStorage> = {},
): CommandCardStorage => ({
  getCurrentCommandCards: vi.fn<CommandCardStorage['getCurrentCommandCards']>(),
  getAllCommandCards: vi.fn<CommandCardStorage['getAllCommandCards']>(),
  getCommandCardById: vi.fn<CommandCardStorage['getCommandCardById']>(),
  getCommandCardsByIds: vi.fn<CommandCardStorage['getCommandCardsByIds']>(),
  createEmptyCommandCard: vi.fn<CommandCardStorage['createEmptyCommandCard']>(),
  createCommandCardVersion:
    vi.fn<CommandCardStorage['createCommandCardVersion']>(),
  deleteEmptyCommandCards:
    vi.fn<CommandCardStorage['deleteEmptyCommandCards']>(),
  getLatestCommandCardCertifications:
    vi.fn<CommandCardStorage['getLatestCommandCardCertifications']>(),
  certifyCommandCardVersions:
    vi.fn<CommandCardStorage['certifyCommandCardVersions']>(),
  ...overrides,
});

const stubRenderer: CommandCardRendererPort = {
  renderCommandCard: vi.fn<CommandCardRendererPort['renderCommandCard']>(),
};

describe('updateCommandCardCertifications', () => {
  it(
    'certifies valid latest versions and returns the post-write state by entity id',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const certify = vi
        .fn<CommandCardStorage['certifyCommandCardVersions']>()
        .mockResolvedValue({
          success: true,
          data: undefined,
        });
      const getStatuses = vi
        .fn<CommandCardStorage['getLatestCommandCardCertifications']>()
        .mockResolvedValueOnce({
          success: true,
          data: [status(validCardA, false), status(validCardB, false)],
        })
        .mockResolvedValueOnce({
          success: true,
          data: [status(validCardA, true), status(validCardB, true)],
        });

      const useCases = createCommandCardUseCases(
        buildStorage({
          getLatestCommandCardCertifications: getStatuses,
          certifyCommandCardVersions: certify,
        }),
        stubRenderer,
      );

      const result = await useCases.updateCommandCardCertifications();

      expect(certify).toHaveBeenCalledWith([validCardA.id, validCardB.id]);
      expect(getStatuses).toHaveBeenCalledTimes(2);
      expect(result).toStrictEqual({
        success: true,
        data: { certified: [validCardA.id, validCardB.id], uncertified: [] },
      });
    },
  );

  it(
    'excludes schema-invalid cards from the write and reports them uncertified',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const certify = vi
        .fn<CommandCardStorage['certifyCommandCardVersions']>()
        .mockResolvedValue({
          success: true,
          data: undefined,
        });
      const getStatuses = vi
        .fn<CommandCardStorage['getLatestCommandCardCertifications']>()
        .mockResolvedValueOnce({
          success: true,
          data: [status(validCardA, false), status(invalidCard, false)],
        })
        .mockResolvedValueOnce({
          success: true,
          data: [status(validCardA, true), status(invalidCard, false)],
        });

      const useCases = createCommandCardUseCases(
        buildStorage({
          getLatestCommandCardCertifications: getStatuses,
          certifyCommandCardVersions: certify,
        }),
        stubRenderer,
      );

      const result = await useCases.updateCommandCardCertifications();

      expect(certify).toHaveBeenCalledWith([validCardA.id]);
      expect(result).toStrictEqual({
        success: true,
        data: { certified: [validCardA.id], uncertified: [invalidCard.id] },
      });
    },
  );

  it(
    'propagates a failure from the initial read without writing',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const certify = vi.fn<CommandCardStorage['certifyCommandCardVersions']>();
      const useCases = createCommandCardUseCases(
        buildStorage({
          getLatestCommandCardCertifications: vi
            .fn<CommandCardStorage['getLatestCommandCardCertifications']>()
            .mockResolvedValue({
              success: false,
              message: 'boom',
              status: 500,
            }),
          certifyCommandCardVersions: certify,
        }),
        stubRenderer,
      );

      const result = await useCases.updateCommandCardCertifications();

      expect(certify).not.toHaveBeenCalled();
      expect(result).toStrictEqual({
        success: false,
        message: 'boom',
        status: 500,
      });
    },
  );

  it(
    'propagates a failure from the write without re-reading',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const getStatuses = vi
        .fn<CommandCardStorage['getLatestCommandCardCertifications']>()
        .mockResolvedValue({
          success: true,
          data: [status(validCardA, false)],
        });
      const useCases = createCommandCardUseCases(
        buildStorage({
          getLatestCommandCardCertifications: getStatuses,
          certifyCommandCardVersions: vi
            .fn<CommandCardStorage['certifyCommandCardVersions']>()
            .mockResolvedValue({
              success: false,
              message: 'no rules',
              status: 500,
            }),
        }),
        stubRenderer,
      );

      const result = await useCases.updateCommandCardCertifications();

      expect(getStatuses).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        success: false,
        message: 'no rules',
        status: 500,
      });
    },
  );

  it(
    'propagates a failure from the post-write read',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const useCases = createCommandCardUseCases(
        buildStorage({
          getLatestCommandCardCertifications: vi
            .fn<CommandCardStorage['getLatestCommandCardCertifications']>()
            .mockResolvedValueOnce({
              success: true,
              data: [status(validCardA, false)],
            })
            .mockResolvedValueOnce({
              success: false,
              message: 'read failed',
              status: 500,
            }),
          certifyCommandCardVersions: vi
            .fn<CommandCardStorage['certifyCommandCardVersions']>()
            .mockResolvedValue({ success: true, data: undefined }),
        }),
        stubRenderer,
      );

      const result = await useCases.updateCommandCardCertifications();

      expect(result).toStrictEqual({
        success: false,
        message: 'read failed',
        status: 500,
      });
    },
  );
});
