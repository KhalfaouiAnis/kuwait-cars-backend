"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
var prisma_1 = require("../generated/prisma");
var globalForPrisma = global;
exports.prisma = globalForPrisma.prisma || new prisma_1.PrismaClient({ log: ['query'] });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
