import logger from "./utils/logger";
import { generateAccessToken, verifyRefreshToken } from "./utils/jwt";

const token = generateAccessToken('test-user-id');
logger.info(`Generated token: ${token}`);

const result = verifyRefreshToken(token);
logger.info(`Verified: ${result}`);

const badResult = verifyRefreshToken('invalid-token');
logger.info(`Bad token result: ${badResult}`);
