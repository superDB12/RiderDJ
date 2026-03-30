"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
var axios_1 = require("axios");
exports.api = axios_1.default.create({
    baseURL: "http://192.168.86.130:3000",
});
