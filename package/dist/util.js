"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.versionGteLt = exports.once = exports.getBasePathForProjectLocalDependencyResolution = exports.createProjectLocalResolveHelper = exports.attemptRequireWithV8CompileCache = exports.cachedLookup = exports.hasOwnProperty = exports.normalizeSlashes = exports.parse = exports.split = exports.assign = exports.yn = void 0;
const path_1 = require("path");
/**
 * @internal
 * Copied from https://unpkg.com/yn@3.1.1/index.js
 * Because people get weird when they see you have dependencies. /jk
 * This is a lazy way to make the dep number go down, we haven't touched this
 * dep in ages, and we didn't use all its features, so we stripped them.
 */
function yn(input) {
    input = String(input).trim();
    if (/^(?:y|yes|true|1)$/i.test(input)) {
        return true;
    }
    if (/^(?:n|no|false|0)$/i.test(input)) {
        return false;
    }
}
exports.yn = yn;
/**
 * Like `Object.assign`, but ignores `undefined` properties.
 *
 * @internal
 */
function assign(initialValue, ...sources) {
    for (const source of sources) {
        for (const key of Object.keys(source)) {
            const value = source[key];
            if (value !== undefined)
                initialValue[key] = value;
        }
    }
    return initialValue;
}
exports.assign = assign;
/**
 * Split a string array of values
 * and remove empty strings from the resulting array.
 * @internal
 */
function split(value) {
    return typeof value === 'string' ? value.split(/ *, */g).filter((v) => v !== '') : undefined;
}
exports.split = split;
/**
 * Parse a string as JSON.
 * @internal
 */
function parse(value) {
    return typeof value === 'string' ? JSON.parse(value) : undefined;
}
exports.parse = parse;
const directorySeparator = '/';
const backslashRegExp = /\\/g;
/**
 * Replace backslashes with forward slashes.
 * @internal
 */
function normalizeSlashes(value) {
    return value.replace(backslashRegExp, directorySeparator);
}
exports.normalizeSlashes = normalizeSlashes;
/**
 * Safe `hasOwnProperty`
 * @internal
 */
function hasOwnProperty(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
}
exports.hasOwnProperty = hasOwnProperty;
/**
 * Cached fs operation wrapper.
 */
function cachedLookup(fn) {
    const cache = new Map();
    return (arg) => {
        if (!cache.has(arg)) {
            const v = fn(arg);
            cache.set(arg, v);
            return v;
        }
        return cache.get(arg);
    };
}
exports.cachedLookup = cachedLookup;
/**
 * @internal
 * Require something with v8-compile-cache, which should make subsequent requires faster.
 * Do lots of error-handling so that, worst case, we require without the cache, and users are not blocked.
 */
function attemptRequireWithV8CompileCache(requireFn, specifier) {
    try {
        const v8CC = require('v8-compile-cache-lib').install();
        try {
            return requireFn(specifier);
        }
        finally {
            v8CC?.uninstall();
        }
    }
    catch (e) {
        return requireFn(specifier);
    }
}
exports.attemptRequireWithV8CompileCache = attemptRequireWithV8CompileCache;
/**
 * Helper to discover dependencies relative to a user's project, optionally
 * falling back to relative to ts-node.  This supports global installations of
 * ts-node, for example where someone does `#!/usr/bin/env -S ts-node --swc` and
 * we need to fallback to a global install of @swc/core
 * @internal
 */
function createProjectLocalResolveHelper(localDirectory) {
    return function projectLocalResolveHelper(specifier, fallbackToTsNodeRelative) {
        return require.resolve(specifier, {
            paths: fallbackToTsNodeRelative ? [localDirectory, __dirname] : [localDirectory],
        });
    };
}
exports.createProjectLocalResolveHelper = createProjectLocalResolveHelper;
/**
 * Used as a reminder of all the factors we must consider when finding project-local dependencies and when a config file
 * on disk may or may not exist.
 * @internal
 */
function getBasePathForProjectLocalDependencyResolution(configFilePath, projectSearchDirOption, projectOption, cwdOption) {
    if (configFilePath != null)
        return (0, path_1.dirname)(configFilePath);
    return projectSearchDirOption ?? projectOption ?? cwdOption;
    // TODO technically breaks if projectOption is path to a file, not a directory,
    // and we attempt to resolve relative specifiers.  By the time we resolve relative specifiers,
    // should have configFilePath, so not reach this codepath.
}
exports.getBasePathForProjectLocalDependencyResolution = getBasePathForProjectLocalDependencyResolution;
/** @internal */
function once(fn) {
    let value;
    let ran = false;
    function onceFn(...args) {
        if (ran)
            return value;
        value = fn(...args);
        ran = true;
        return value;
    }
    return onceFn;
}
exports.once = once;
/** @internal */
function versionGteLt(version, gteRequirement, ltRequirement) {
    const [major, minor, patch, extra] = parse(version);
    const [gteMajor, gteMinor, gtePatch] = parse(gteRequirement);
    const isGte = major > gteMajor || (major === gteMajor && (minor > gteMinor || (minor === gteMinor && patch >= gtePatch)));
    let isLt = true;
    if (ltRequirement) {
        const [ltMajor, ltMinor, ltPatch] = parse(ltRequirement);
        isLt = major < ltMajor || (major === ltMajor && (minor < ltMinor || (minor === ltMinor && patch < ltPatch)));
    }
    return isGte && isLt;
    function parse(requirement) {
        return requirement.split(/[\.-]/).map((s) => parseInt(s, 10));
    }
}
exports.versionGteLt = versionGteLt;
//# sourceMappingURL=util.js.map