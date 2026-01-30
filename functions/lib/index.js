"use strict";
/**
 * Cloud Functions Entry Point
 *
 * Exports all Cloud Functions for Aurum Sanctuary.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInsight = exports.updateDerivedMemory = exports.onEntryCreate = exports.onUserCreate = void 0;
var onUserCreate_1 = require("./onUserCreate");
Object.defineProperty(exports, "onUserCreate", { enumerable: true, get: function () { return onUserCreate_1.onUserCreate; } });
var onEntryCreate_1 = require("./onEntryCreate");
Object.defineProperty(exports, "onEntryCreate", { enumerable: true, get: function () { return onEntryCreate_1.onEntryCreate; } });
var updateDerivedMemory_1 = require("./updateDerivedMemory");
Object.defineProperty(exports, "updateDerivedMemory", { enumerable: true, get: function () { return updateDerivedMemory_1.updateDerivedMemory; } });
var generateInsight_1 = require("./generateInsight");
Object.defineProperty(exports, "generateInsight", { enumerable: true, get: function () { return generateInsight_1.generateInsight; } });
// Future functions will be exported here:
// export { getContentKey } from './getContentKey';
// export { deleteUserAccount } from './deleteUserAccount';
//# sourceMappingURL=index.js.map