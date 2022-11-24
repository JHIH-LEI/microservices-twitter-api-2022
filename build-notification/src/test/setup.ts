import { redis } from "../index";

jest.mock("../publishers/notification-created");

beforeAll(() => {});

beforeEach(async () => {
  jest.clearAllMocks();
  await redis.flushall();
});

afterEach(async () => {
  jest.clearAllMocks();
  await redis.flushall();
});
