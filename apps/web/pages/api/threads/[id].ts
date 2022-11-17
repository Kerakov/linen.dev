import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../../client';
import { findThreadById } from 'lib/threads';
import serializeThread from 'serializers/thread';
import PermissionsService from 'services/permissions';
import { Permissions } from 'types/shared';
import { ThreadState } from '@prisma/client';

interface UpdateProps {
  permissions: Permissions;
  params: {
    threadId: string;
    state: ThreadState;
    title: string;
    pinned: boolean;
  };
}

export async function update({ permissions, params }: UpdateProps) {
  const { threadId, state, title, pinned } = params;
  if (permissions.manage) {
    return await updateThread({ threadId, state, title, pinned });
  }
  const thread = await findThreadById(threadId);
  if (!thread) {
    return { status: 404, data: {} };
  }
  // ideally we could keep the creator info on the thread
  const creator = thread.messages[0].author;

  if (!creator || !permissions.user) {
    return { status: 403, data: {} };
  }

  if (creator.id === permissions.user.id) {
    return await updateThread({ threadId, state, title });
  }

  return { status: 403, data: {} };
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const threadId = request.query.id as string;
  const permissions = await PermissionsService.getAccessThread({
    request,
    response,
    threadId,
  });
  if (!permissions.access) {
    return response.status(403).json({});
  }
  if (!permissions.can_access_thread) {
    return response.status(403).json({});
  }

  if (request.method === 'GET') {
    const thread = await findThreadById(threadId);
    if (!thread) {
      return response.status(404).json({});
    }
    return response.status(200).json(serializeThread(thread));
  }
  if (request.method === 'PUT') {
    const { status, data } = await update({
      permissions,
      params: {
        threadId,
        ...JSON.parse(request.body),
      },
    });
    return response.status(status).json(data || {});
  }
  return response.status(405).json({});
}

export default handler;

async function updateThread({
  threadId,
  state,
  title,
  pinned,
}: {
  threadId: string;
  state: ThreadState;
  title: string;
  pinned?: boolean;
}) {
  const thread = await prisma.threads.update({
    where: { id: threadId },
    data: {
      state,
      title,
      pinned,
      closeAt: state === ThreadState.CLOSE ? new Date().getTime() : null,
    },
  });
  return { status: 200, data: serializeThread(thread) };
}