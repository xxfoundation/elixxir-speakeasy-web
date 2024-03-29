import { FC, useCallback, useEffect, useState } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import { useUI } from 'src/contexts/ui-context';
import * as channels from 'src/store/channels';
import { useAppSelector } from 'src/store/hooks';

import s from './ChannelSettingsView.module.scss';
import Keys from '@components/icons/Keys';
import LockOpen from '@components/icons/LockOpen';
import CommentSlash from '@components/icons/CommentSlash';
import RightFromBracket from '@components/icons/RightFromBracket';
import { useNetworkClient } from '@contexts/network-client-context';
import CheckboxToggle from '@components/common/CheckboxToggle';
import { Spinner } from '@components/common';

const ChannelSettingsView: FC = () => {
  const { t } = useTranslation();
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const { openModal, setModalView } = useUI();
  const { channelManager } = useNetworkClient();
  const [dmsEnabled, setDmsEnabled] = useState<boolean | null>(null);
  useEffect(() => {
    if (currentChannel) {
      setDmsEnabled(channelManager?.AreDMsEnabled(Buffer.from(currentChannel?.id, 'base64')) ?? null);
    }
    }, [channelManager, currentChannel]);

  const toggleDms = useCallback(() => {
    if (!currentChannel) {
      return;
    }
    
    if (dmsEnabled) {
      channelManager?.DisableDirectMessages(Buffer.from(currentChannel.id, 'base64'));
      setDmsEnabled(channelManager?.AreDMsEnabled(Buffer.from(currentChannel?.id, 'base64')) ?? null);
    } else {
      channelManager?.EnableDirectMessages(Buffer.from(currentChannel.id, 'base64'));
      setDmsEnabled(channelManager?.AreDMsEnabled(Buffer.from(currentChannel?.id, 'base64')) ?? null);
    }
  }, [channelManager, currentChannel, dmsEnabled])

  return (
    <>
      <div
        className={cn(s.root, 'w-full flex flex-col justify-center items-center')}
      >
        <h2 className='mt-9 mb-8'>
          {t('Channel Settings')}</h2>
        <div className={s.wrapper}>

          <div>
            <h3 className='headline--sm'>
              {t('Enable Direct Messages')}
            </h3>
            {dmsEnabled === null ? <Spinner className='m-0 mr-1' /> : (
              <CheckboxToggle checked={dmsEnabled} onChange={toggleDms} />
            )}
          </div>
          {currentChannel?.isAdmin ? (
            <div>
              <h3 className='headline--sm'>
                {t('Export Admin Keys')}
              </h3>
              <Keys
                onClick={() => {
                  setModalView('EXPORT_ADMIN_KEYS');
                  openModal();
                }}
              />
            </div>
          ) : (
            <div>
              <h3 className='headline--sm'>
                {t('Claim Admin Keys')}</h3>
              <LockOpen onClick={() => {
                setModalView('CLAIM_ADMIN_KEYS');
                openModal();
              }} />
            </div>
          )}
          <div>
            <h3 className='headline--sm'>
              {t('View Muted Users')}
            </h3>
            <CommentSlash
              onClick={() => {
                setModalView('VIEW_MUTED_USERS');
                openModal();
              }}
            />
          </div>
          <div>
            <h3 className='headline--sm'>
              {t('Leave Channel')}
            </h3>
            <RightFromBracket
              onClick={() => {
                if (currentChannel) {
                  setModalView('LEAVE_CHANNEL_CONFIRMATION');
                  openModal();
                }
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChannelSettingsView;
