import { ForbiddenException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../prisma/prisma.service";
import { PropertiesService } from "./properties.service";

describe("PropertiesService ownership", () => {
  let service: PropertiesService;

  const prisma = {
    property: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(PropertiesService);
    jest.clearAllMocks();
  });

  it("denies update when owner mismatches", async () => {
    prisma.property.findFirst.mockResolvedValue({
      id: "p1",
      ownerId: "owner-a",
    });

    await expect(
      service.update("p1", "owner-b", { title: "Hack" }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
