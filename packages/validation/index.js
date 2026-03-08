"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRideSchema = void 0;
var zod_1 = require("zod");
exports.CreateRideSchema = zod_1.z.object({
    maxQueueSize: zod_1.z.number().min(1).max(20),
    explicitFilter: zod_1.z.boolean()
});
