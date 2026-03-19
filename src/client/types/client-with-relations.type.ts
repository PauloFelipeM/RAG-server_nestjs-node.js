import { Prisma } from "@prisma/client";

export type ClientWithRelations = Prisma.ClientGetPayload<{
  include: {
    address: true;
    companies: { include: { company: true } };
  };
}>;
