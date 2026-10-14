import { ConflictException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;
  const prisma: {
    user: { findUnique: jest.Mock; create: jest.Mock };
    $transaction: jest.Mock;
  } = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  prisma.$transaction.mockImplementation((fn: (tx: typeof prisma) => unknown) =>
    fn(prisma),
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: { signAsync: jest.fn() } },
        {
          provide: ConfigService,
          useValue: { get: jest.fn(), getOrThrow: jest.fn().mockReturnValue("secret") },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  it("rejects duplicate registration", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: "1" });

    await expect(
      service.register({
        email: "a@example.com",
        password: "Password1!",
        role: UserRole.TENANT,
        firstName: "A",
        lastName: "B",
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
