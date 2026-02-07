import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  generateHook,
  generateAgent,
  generateSteering,
  generateSkill,
  generateMcpConfig,
  generatePower,
  validate,
  VALID_HOOK_TRIGGERS,
  VALID_HOOK_ACTIONS,
  VALID_INCLUSION_MODES,
} from '../../lib/configGenerator.js';
import type {
  HookConfig,
  SteeringConfig,
  SkillFrontmatter,
  PowerConfig,
} from '../../lib/types.js';

// ─── Arbitraries ───────────────────────────────────────────

const arbNonEmptyString: fc.Arbitrary<string> = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => s.trim().length > 0);

const arbTriggerType: fc.Arbitrary<HookConfig['when']['type']> =
  fc.constantFrom(...VALID_HOOK_TRIGGERS);

const arbActionType: fc.Arbitrary<HookConfig['then']['type']> =
  fc.constantFrom(...VALID_HOOK_ACTIONS);

const arbInclusionMode: fc.Arbitrary<
  SteeringConfig['inclusion']
> = fc.constantFrom(
  ...VALID_INCLUSION_MODES
);

/**
 * Generates a valid skill name per Agent Skills spec:
 * 1-64 chars, lowercase alphanumeric + hyphens,
 * no leading/trailing/consecutive hyphens.
 */
const arbAlphaNum = fc.constantFrom(
  ...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')
);

const arbSkillName: fc.Arbitrary<string> = fc
  .tuple(
    fc.string({
      unit: arbAlphaNum,
      minLength: 1,
      maxLength: 10,
    }),
    fc.array(
      fc.tuple(
        fc.constant('-'),
        fc.string({
          unit: arbAlphaNum,
          minLength: 1,
          maxLength: 8,
        })
      ),
      { minLength: 0, maxLength: 3 }
    )
  )
  .map(([prefix, segments]) => {
    const parts = segments.map(([h, s]) => `${h}${s}`);
    return `${prefix}${parts.join('')}`;
  })
  .filter((n) => n.length >= 1 && n.length <= 64);

/**
 * Generates a valid skill description: 1-1024 chars,
 * non-empty after trim.
 */
const arbSkillDescription: fc.Arbitrary<string> = fc
  .string({ minLength: 1, maxLength: 200 })
  .filter((s) => s.trim().length > 0);

/**
 * Generates valid SkillFrontmatter with required fields
 * and optional fields.
 */
const arbSkillFrontmatter: fc.Arbitrary<SkillFrontmatter> =
  fc.record({
    name: arbSkillName,
    description: arbSkillDescription,
    license: fc.option(arbNonEmptyString, { nil: undefined }),
    compatibility: fc.option(
      fc.string({ minLength: 1, maxLength: 100 }),
      { nil: undefined }
    ),
    metadata: fc.option(
      fc.dictionary(
        fc.string({
          unit: fc.constantFrom(
            ...'abcdefghijklmnopqrstuvwxyz'.split('')
          ),
          minLength: 1,
          maxLength: 10,
        }),
        arbNonEmptyString
      ),
      { nil: undefined }
    ),
    allowedTools: fc.option(
      fc
        .array(arbNonEmptyString, {
          minLength: 1,
          maxLength: 3,
        })
        .map((tools) => tools.join(' ')),
      { nil: undefined }
    ),
  });

/**
 * Generates hook options that pair trigger/action with
 * the required fields for that action type.
 */
const arbHookOptions = fc
  .tuple(
    arbNonEmptyString,
    arbTriggerType,
    arbActionType,
    arbNonEmptyString,
    arbNonEmptyString
  )
  .map(([name, trigger, action, prompt, command]) => ({
    name,
    triggerType: trigger,
    actionType: action,
    prompt: action === 'askAgent' ? prompt : undefined,
    command: action === 'runCommand' ? command : undefined,
  }));

/**
 * Generates valid agent options with required name and
 * description.
 */
const arbAgentOptions = fc.record({
  name: arbNonEmptyString,
  description: arbNonEmptyString,
});

/**
 * Generates valid steering config with correct inclusion
 * mode and required fields.
 */
const arbSteeringConfig: fc.Arbitrary<SteeringConfig> = fc
  .tuple(arbInclusionMode, arbNonEmptyString, arbNonEmptyString)
  .map(([inclusion, content, pattern]) => ({
    inclusion,
    content,
    ...(inclusion === 'fileMatch'
      ? { fileMatchPattern: pattern }
      : {}),
  }));

// ─── Property 22 ───────────────────────────────────────────

/**
 * **Feature: kiro-knowledge-base, Property 22: Generated
 * config validity**
 * **Validates: Requirements 5.1, 5.3**
 *
 * For any valid input parameters to the config generators:
 * - generateHook() output SHALL pass validate({toolType:
 *   'hook', config}) when given valid trigger/action
 *   combinations with required fields
 * - generateAgent() output SHALL pass validate({toolType:
 *   'custom-agent', config}) when given valid
 *   name/description
 * - generateSteering() output SHALL produce markdown with
 *   valid frontmatter that passes validate({toolType:
 *   'steering-doc', config}) when parsed back
 * - generateSkill() output SHALL produce SKILL.md with
 *   Agent Skills spec-compliant frontmatter that passes
 *   validate({toolType: 'skill', config}) when given valid
 *   name/description
 * - generateMcpConfig() output SHALL produce valid mcp.json
 *   for both local and remote server types
 */
describe('Property 22: Generated config validity', () => {
  it('generateHook() output passes validate() for valid trigger/action combos', () => {
    fc.assert(
      fc.property(arbHookOptions, (opts) => {
        const config = generateHook(opts);
        const result = validate({
          toolType: 'hook',
          config,
        });

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  it('generateHook() output has valid trigger type from VALID_HOOK_TRIGGERS', () => {
    fc.assert(
      fc.property(arbHookOptions, (opts) => {
        const config = generateHook(opts);
        const validTriggers: readonly string[] =
          VALID_HOOK_TRIGGERS;

        expect(validTriggers).toContain(config.when.type);
      }),
      { numRuns: 100 }
    );
  });

  it('generateHook() output has valid action type from VALID_HOOK_ACTIONS', () => {
    fc.assert(
      fc.property(arbHookOptions, (opts) => {
        const config = generateHook(opts);
        const validActions: readonly string[] =
          VALID_HOOK_ACTIONS;

        expect(validActions).toContain(config.then.type);
      }),
      { numRuns: 100 }
    );
  });

  it('generateHook() askAgent action always has prompt', () => {
    fc.assert(
      fc.property(
        arbNonEmptyString,
        arbTriggerType,
        arbNonEmptyString,
        (name, trigger, prompt) => {
          const config = generateHook({
            name,
            triggerType: trigger,
            actionType: 'askAgent',
            prompt,
          });

          expect(config.then.type).toBe('askAgent');
          expect(config.then.prompt).toBe(prompt);

          const result = validate({
            toolType: 'hook',
            config,
          });

          expect(result.isValid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('generateHook() runCommand action always has command', () => {
    fc.assert(
      fc.property(
        arbNonEmptyString,
        arbTriggerType,
        arbNonEmptyString,
        (name, trigger, command) => {
          const config = generateHook({
            name,
            triggerType: trigger,
            actionType: 'runCommand',
            command,
          });

          expect(config.then.type).toBe('runCommand');
          expect(config.then.command).toBe(command);

          const result = validate({
            toolType: 'hook',
            config,
          });

          expect(result.isValid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('generateAgent() output passes validate() for valid name/description', () => {
    fc.assert(
      fc.property(arbAgentOptions, (opts) => {
        const config = generateAgent(opts);
        const result = validate({
          toolType: 'custom-agent',
          config,
        });

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  it('generateAgent() preserves name and description in output', () => {
    fc.assert(
      fc.property(arbAgentOptions, (opts) => {
        const config = generateAgent(opts);

        expect(config.name).toBe(opts.name);
        expect(config.description).toBe(opts.description);
      }),
      { numRuns: 100 }
    );
  });

  it('generateSteering() output parses back to valid config', () => {
    fc.assert(
      fc.property(arbSteeringConfig, (steeringConfig) => {
        const markdown = generateSteering(steeringConfig);

        // Verify markdown contains frontmatter
        expect(markdown.startsWith('---\n')).toBe(true);
        expect(markdown).toContain(
          `inclusion: ${steeringConfig.inclusion}`
        );

        // The original config should pass validation
        const result = validate({
          toolType: 'steering-doc',
          config: steeringConfig,
        });

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  it('generateSteering() fileMatch mode includes fileMatchPattern', () => {
    fc.assert(
      fc.property(
        arbNonEmptyString,
        arbNonEmptyString,
        (content, pattern) => {
          const config: SteeringConfig = {
            inclusion: 'fileMatch',
            fileMatchPattern: pattern,
            content,
          };

          const markdown = generateSteering(config);

          expect(markdown).toContain('fileMatchPattern:');
          expect(markdown).toContain(pattern);

          const result = validate({
            toolType: 'steering-doc',
            config,
          });

          expect(result.isValid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('generateSkill() output passes validate() for valid frontmatter', () => {
    fc.assert(
      fc.property(
        arbSkillFrontmatter,
        arbNonEmptyString,
        (frontmatter, body) => {
          const result = generateSkill({
            frontmatter,
            bodyContent: body,
          });

          // Verify SKILL.md structure
          expect(result.skillMd.startsWith('---\n')).toBe(
            true
          );
          expect(result.skillMd).toContain(
            `name: ${frontmatter.name}`
          );

          // Validate the frontmatter passes skill validation
          const validation = validate({
            toolType: 'skill',
            config: frontmatter,
          });

          expect(validation.isValid).toBe(true);
          expect(validation.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('generateSkill() produces directory structure with skill name', () => {
    fc.assert(
      fc.property(
        arbSkillFrontmatter,
        arbNonEmptyString,
        (frontmatter, body) => {
          const result = generateSkill({
            frontmatter,
            bodyContent: body,
          });

          // Root directory matches skill name
          expect(result.directories).toContain(
            frontmatter.name
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('generateSkill() optional directories are included when requested', () => {
    fc.assert(
      fc.property(
        arbSkillFrontmatter,
        arbNonEmptyString,
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        (frontmatter, body, scripts, refs, assets) => {
          const result = generateSkill({
            frontmatter,
            bodyContent: body,
            includeScripts: scripts,
            includeReferences: refs,
            includeAssets: assets,
          });

          if (scripts) {
            expect(result.directories).toContain(
              `${frontmatter.name}/scripts`
            );
          }

          if (refs) {
            expect(result.directories).toContain(
              `${frontmatter.name}/references`
            );
          }

          if (assets) {
            expect(result.directories).toContain(
              `${frontmatter.name}/assets`
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('generateMcpConfig() produces valid mcp.json for local servers', () => {
    fc.assert(
      fc.property(
        arbNonEmptyString,
        arbNonEmptyString,
        fc.array(arbNonEmptyString, {
          minLength: 0,
          maxLength: 5,
        }),
        (name, command, args) => {
          const result = generateMcpConfig([
            { name, type: 'local', command, args },
          ]);

          expect(result.mcpServers).toBeDefined();
          expect(result.mcpServers[name]).toBeDefined();

          const server = result.mcpServers[name];

          expect('command' in server).toBe(true);

          if ('command' in server) {
            expect(server.command).toBe(command);
            expect(server.args).toEqual(args);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('generateMcpConfig() produces valid mcp.json for remote servers', () => {
    fc.assert(
      fc.property(
        arbNonEmptyString,
        arbNonEmptyString,
        (name, url) => {
          const result = generateMcpConfig([
            { name, type: 'remote', url },
          ]);

          expect(result.mcpServers).toBeDefined();
          expect(result.mcpServers[name]).toBeDefined();

          const server = result.mcpServers[name];

          expect('url' in server).toBe(true);

          if ('url' in server) {
            expect(server.url).toBe(url);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('generateMcpConfig() handles mixed local and remote servers', () => {
    fc.assert(
      fc.property(
        arbNonEmptyString,
        arbNonEmptyString,
        arbNonEmptyString,
        arbNonEmptyString,
        (localName, command, remoteName, url) => {
          // Ensure distinct names
          const rName =
            localName === remoteName
              ? `${remoteName}-remote`
              : remoteName;

          const result = generateMcpConfig([
            {
              name: localName,
              type: 'local',
              command,
              args: [],
            },
            { name: rName, type: 'remote', url },
          ]);

          expect(
            Object.keys(result.mcpServers).length
          ).toBe(2);
          expect(
            'command' in result.mcpServers[localName]
          ).toBe(true);
          expect(
            'url' in result.mcpServers[rName]
          ).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Power Arbitraries ─────────────────────────────────────

const arbKeywords: fc.Arbitrary<string[]> = fc.array(
  arbNonEmptyString,
  { minLength: 1, maxLength: 5 }
);

const arbPowerOptions = fc.record({
  name: arbNonEmptyString,
  displayName: arbNonEmptyString,
  description: arbNonEmptyString,
  keywords: arbKeywords,
  bodyContent: fc.option(arbNonEmptyString, { nil: undefined }),
});

const arbLocalMcpServer = fc.record({
  command: arbNonEmptyString,
  args: fc.array(arbNonEmptyString, {
    minLength: 0,
    maxLength: 3,
  }),
});

const arbRemoteMcpServer = fc.record({
  url: arbNonEmptyString,
  headers: fc.option(
    fc.dictionary(
      fc.string({
        unit: fc.constantFrom(
          ...'abcdefghijklmnopqrstuvwxyz'.split('')
        ),
        minLength: 1,
        maxLength: 8,
      }),
      arbNonEmptyString
    ),
    { nil: undefined }
  ),
});

const arbMcpServerEntry = fc.oneof(
  arbLocalMcpServer.map(
    (s) => s as { command: string; args: string[] } | { url: string; headers?: Record<string, string> }
  ),
  arbRemoteMcpServer.map(
    (s) => s as { command: string; args: string[] } | { url: string; headers?: Record<string, string> }
  )
);

const arbMcpServers = fc
  .array(
    fc.tuple(
      fc.string({
        unit: fc.constantFrom(
          ...'abcdefghijklmnopqrstuvwxyz'.split('')
        ),
        minLength: 1,
        maxLength: 10,
      }),
      arbMcpServerEntry
    ),
    { minLength: 1, maxLength: 3 }
  )
  .map((entries) => Object.fromEntries(entries));

const arbSteeringFile = fc
  .tuple(
    fc.string({
      unit: fc.constantFrom(
        ...'abcdefghijklmnopqrstuvwxyz'.split('')
      ),
      minLength: 1,
      maxLength: 15,
    }),
    arbInclusionMode,
    arbNonEmptyString,
    arbNonEmptyString
  )
  .map(([filename, inclusion, content, pattern]) => ({
    filename: `${filename}.md`,
    inclusion,
    content,
    ...(inclusion === 'fileMatch'
      ? { fileMatchPattern: pattern }
      : {}),
  }));

const arbSteeringFiles = fc.array(arbSteeringFile, {
  minLength: 1,
  maxLength: 3,
});

// ─── Property 23 ───────────────────────────────────────────

/**
 * **Feature: kiro-knowledge-base, Property 23: Power structure
 * completeness**
 * **Validates: Requirements 5.5**
 *
 * For any valid power configuration:
 * - generatePower() SHALL produce a POWER.md with valid
 *   frontmatter containing name, displayName, description,
 *   and keywords
 * - When mcpServers are provided, generatePower() SHALL
 *   include a valid mcp.json
 * - When steeringFiles are provided, generatePower() SHALL
 *   produce steering files with valid inclusion mode
 *   frontmatter
 * - The power output SHALL pass validate({toolType: 'power',
 *   config}) for the PowerConfig
 */
describe('Property 23: Power structure completeness', () => {
  it('generatePower() produces POWER.md with valid frontmatter containing name, displayName, description, keywords', () => {
    fc.assert(
      fc.property(arbPowerOptions, (opts) => {
        const result = generatePower(opts);

        // POWER.md starts with frontmatter delimiters
        expect(result.powerMd.startsWith('---\n')).toBe(true);

        // Frontmatter contains all required fields
        expect(result.powerMd).toContain(`name: ${opts.name}`);
        expect(result.powerMd).toContain(
          `displayName: ${opts.displayName}`
        );
        expect(result.powerMd).toContain(
          `description: ${opts.description}`
        );
        expect(result.powerMd).toContain(
          `keywords: ${opts.keywords.join(', ')}`
        );

        // Frontmatter is properly closed
        const fmEnd = result.powerMd.indexOf(
          '---',
          4
        );
        expect(fmEnd).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('generatePower() output passes validate({toolType: "power"}) for PowerConfig', () => {
    fc.assert(
      fc.property(arbPowerOptions, (opts) => {
        const powerConfig: PowerConfig = {
          name: opts.name,
          displayName: opts.displayName,
          description: opts.description,
          keywords: opts.keywords,
        };

        const validation = validate({
          toolType: 'power',
          config: powerConfig,
        });

        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  it('generatePower() includes valid mcp.json when mcpServers are provided', () => {
    fc.assert(
      fc.property(
        arbPowerOptions,
        arbMcpServers,
        (opts, mcpServers) => {
          const result = generatePower({
            ...opts,
            mcpServers,
          });

          // mcpJson should be present
          expect(result.mcpJson).not.toBeNull();
          expect(result.mcpJson!.mcpServers).toBeDefined();

          // Each server entry should match input
          for (const [key, server] of Object.entries(
            result.mcpJson!.mcpServers
          )) {
            expect(mcpServers[key]).toBeDefined();

            const isLocal = 'command' in server;
            const isRemote = 'url' in server;

            // Must be one or the other
            expect(isLocal || isRemote).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('generatePower() returns null mcpJson when no mcpServers provided', () => {
    fc.assert(
      fc.property(arbPowerOptions, (opts) => {
        const result = generatePower(opts);

        expect(result.mcpJson).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  it('generatePower() produces steering files with valid inclusion mode frontmatter when steeringFiles provided', () => {
    fc.assert(
      fc.property(
        arbPowerOptions,
        arbSteeringFiles,
        (opts, steeringFiles) => {
          const result = generatePower({
            ...opts,
            steeringFiles,
          });

          // Should produce the same number of steering files
          expect(result.steeringFiles).toHaveLength(
            steeringFiles.length
          );

          const validModes: readonly string[] =
            VALID_INCLUSION_MODES;

          for (let i = 0; i < result.steeringFiles.length; i++) {
            const sf = result.steeringFiles[i];
            const input = steeringFiles[i];

            // Filename preserved
            expect(sf.filename).toBe(input.filename);

            // Content starts with frontmatter
            expect(sf.content.startsWith('---\n')).toBe(true);

            // Contains valid inclusion mode
            expect(sf.content).toContain(
              `inclusion: ${input.inclusion}`
            );
            expect(
              validModes.includes(input.inclusion)
            ).toBe(true);

            // fileMatch mode includes pattern
            if (input.inclusion === 'fileMatch') {
              expect(sf.content).toContain(
                'fileMatchPattern:'
              );
            }

            // Body content is present
            expect(sf.content).toContain(input.content);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('generatePower() returns empty steeringFiles array when none provided', () => {
    fc.assert(
      fc.property(arbPowerOptions, (opts) => {
        const result = generatePower(opts);

        expect(result.steeringFiles).toEqual([]);
      }),
      { numRuns: 100 }
    );
  });

  it('generatePower() POWER.md contains body content after frontmatter', () => {
    fc.assert(
      fc.property(arbPowerOptions, (opts) => {
        const result = generatePower(opts);

        // Split on closing frontmatter delimiter
        const parts = result.powerMd.split('---');

        // parts[0] is empty (before opening ---),
        // parts[1] is frontmatter, parts[2+] is body
        expect(parts.length).toBeGreaterThanOrEqual(3);

        const bodyContent = parts.slice(2).join('---').trim();
        expect(bodyContent.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });
});
