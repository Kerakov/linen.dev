import type { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from 'pages/api/auth/[...nextauth]';
import prisma from '../client';

export async function getSession(
  request: NextApiRequest,
  response: NextApiResponse
) {
  return await unstable_getServerSession(request, response, authOptions);
}

export async function getAuthFromSession(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const session = await getSession(request, response);
  if (!session || !session?.user?.email) {
    throw 'missing session';
  }

  const auth = await prisma.auths.findFirst({
    where: {
      email: session.user.email,
    },
    include: { account: true, users: true },
  });
  if (!auth) {
    throw 'auth not found';
  }

  const { account } = auth;
  if (!account) {
    throw 'missing account from auth';
  }

  const user = auth.users.find((user) => user.accountsId === auth.accountId);
  if (!user) {
    throw 'missing user from auth';
  }

  return {
    accountId: account.id,
    userId: user.id,
    role: user.role,
    authId: auth.id,
    email: auth.email,
  };
}