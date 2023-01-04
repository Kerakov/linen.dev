import CommunityButton from 'components/CommunityButton';
import { capitalize } from '@linen/utilities/string';
import { integrationAuthorizer } from 'utilities/communityAuthorizers';
import { SerializedAccount } from '@linen/types';
import { Toast } from '@linen/ui';
import { GoCheck, GoAlert, GoInfo } from 'react-icons/go';
import { onSubmitType, RightPanel } from './CustomDiscordBot';
import { useState } from 'react';
import { setDiscordIntegrationCustomBot } from 'utilities/requests';

const statusMap: any = {
  NOT_STARTED: (
    <>
      <GoInfo className="h-5 w-5 mr-1 inline" /> In progress
    </>
  ),
  IN_PROGRESS: (
    <>
      <GoInfo className="h-5 w-5 mr-1 inline" /> In progress
    </>
  ),
  DONE: (
    <>
      <GoCheck color="green" className="h-5 w-5 mr-1 inline" />
      Done
    </>
  ),
  ERROR: (
    <>
      <GoAlert className="h-5 w-5 mr-1 inline" color="red" /> Error
    </>
  ),
};

export default function CommunityIntegration({
  account,
}: {
  account?: SerializedAccount;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const newOnboarding = !account || !account.communityType;
  const communityType =
    account && account.communityType ? account.communityType : 'Slack/Discord';

  const onClick = async (community: string) => {
    try {
      const { id } = account ? account : await createAccount();
      community && integrationAuthorizer(community, id);
    } catch (error) {
      return Toast.error('Something went wrong, please sign in again');
    }
  };

  const onSubmit = async ({ discordServerId, botToken }: onSubmitType) => {
    try {
      const { id } = account ? account : await createAccount();
      setLoading(true);
      await setDiscordIntegrationCustomBot({
        discordServerId,
        botToken,
        accountId: id,
      });
      setOpen(false);
      window.location.reload();
    } catch (error) {
      return Toast.error('Something went wrong, please sign in again');
    } finally {
      setLoading(false);
    }
  };

  const syncStatus =
    !!account?.hasAuth &&
    !!account?.syncStatus &&
    statusMap[account.syncStatus];

  function onReconnectClick(community: string): void {
    if (community === 'slack') {
      integrationAuthorizer(community, account?.id!);
    } else {
      setOpen(true);
    }
  }

  return (
    <div className="bg-white">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex">
          <div className="grow">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {capitalize(communityType)} integration
              {syncStatus && (
                <>
                  <span className="text-gray-300"> | </span>
                  {syncStatus}
                </>
              )}
            </h3>
            <div className="mt-2 sm:flex sm:items-start sm:justify-between">
              <div className="max-w-xl text-sm text-gray-500">
                <p>
                  Connect to {capitalize(communityType)} to fetch conversations.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            {newOnboarding ? (
              <div className="grid grid-cols-1 gap-4">
                <CommunityButton
                  communityType={'slack'}
                  label="Connect to"
                  onClick={onClick}
                  iconSize="20"
                />
                <CommunityButton
                  communityType={'discord'}
                  label="Connect to"
                  onClick={() => setOpen(true)}
                  iconSize="20"
                />
              </div>
            ) : (
              <CommunityButton
                communityType={communityType}
                label="Reconnect to"
                onClick={onReconnectClick}
                iconSize="20"
              />
            )}
          </div>
        </div>
      </div>
      <RightPanel
        {...{
          open,
          setOpen,
          loading,
          onSubmit,
          discordServerId: account?.discordServerId,
        }}
      />
    </div>
  );
}
async function createAccount() {
  const accountCreateRequest = await fetch('/api/accounts', {
    method: 'POST',
  });
  if (!accountCreateRequest.ok) {
    throw 'create account failed';
  }
  return await accountCreateRequest.json();
}
