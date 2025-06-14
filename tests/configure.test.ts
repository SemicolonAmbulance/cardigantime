import { describe, expect, beforeEach, test, vi } from 'vitest';
import type { Command } from 'commander';
import { z } from 'zod';
import { Options } from '../src/types';

// --- Mock Dependencies ---

// Mock commander
const mockOption = vi.fn<Command['option']>();
const mockCommand = {
    option: mockOption,
} as unknown as Command; // Use type assertion for simplicity

// We don't need to mock Command itself, just the instance passed in and its methods

// --- Dynamically Import Module Under Test ---
// Needs to be imported *after* mocks are set up
const { configure } = await import('../src/configure');


// --- Test Suite ---

describe('configure', () => {
    let baseOptions: Options<any>; // Use 'any' for the Zod schema shape for simplicity

    beforeEach(() => {
        vi.clearAllMocks(); // Clear mocks before each test

        // Reset base options
        baseOptions = {
            logger: { // Provide a mock logger
                debug: vi.fn(),
                info: vi.fn(),
                warn: vi.fn(),
                error: vi.fn(),
                verbose: vi.fn(),
                silly: vi.fn(),
            },
            defaults: {
                configDirectory: '.',
                configFile: 'config.yaml',
                isRequired: false,
                encoding: 'utf8',
            }, // Explicitly set defaults if testing them
            features: [], // Add required features array (can be empty)
            configShape: z.object({}), // Add required empty Zod object shape
        };

        // Reset the mockCommand behavior for each test if needed
        // For example, make `option` return the command instance for chaining
        mockOption.mockImplementation(() => mockCommand);
    });

    test('should add configDirectory option with default path when no defaults provided', async () => {
        const result = await configure(mockCommand, baseOptions);

        expect(mockOption).toHaveBeenCalledTimes(1);
        expect(mockOption).toHaveBeenCalledWith(
            '-c, --config-directory <configDirectory>',
            'Config Directory',
            baseOptions.defaults.configDirectory
        );
        expect(result).toBe(mockCommand); // Should return the command instance
    });

    test('should add configDirectory option using path from options.defaults', async () => {
        const customDefaultsDir = '/custom/config/dir';
        const optionsWithDefaults = {
            ...baseOptions,
            defaults: { ...baseOptions.defaults, configDirectory: customDefaultsDir },
        };

        const result = await configure(mockCommand, optionsWithDefaults);

        expect(mockOption).toHaveBeenCalledTimes(1);
        expect(mockOption).toHaveBeenCalledWith(
            '-c, --config-directory <configDirectory>',
            'Config Directory',
            customDefaultsDir // Should use the default from options
        );
        expect(result).toBe(mockCommand); // Should return the command instance
    });

    test('should return the command object passed in', async () => {
        const result = await configure(mockCommand, baseOptions);
        expect(result).toBe(mockCommand);
    });

});
