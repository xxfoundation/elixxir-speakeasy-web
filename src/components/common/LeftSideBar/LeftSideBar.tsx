import { FC, useCallback, useMemo, useState } from 'react';
import cn from 'classnames';
import { Collapse } from 'src/components/common';

import { SpeakEasy, Plus, MissedMessagesIcon, NetworkStatusIcon  } from 'src/components/icons';
import { useUI } from 'src/contexts/ui-context';
import { useNetworkClient } from 'src/contexts/network-client-context';

import s from './LeftSideBar.module.scss';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import * as channels from 'src/store/channels';
import * as app from 'src/store/app';
import * as dms from 'src/store/dms';
import Dropdown from '../Dropdown';
import Identity from '../Identity';

type ChannelListItemProps = {
  currentId: string | null,
  id: string,
  name: React.ReactNode,
  onClick: (id: string) => void,
  notification: boolean;
}
const ChannelListItem: FC<ChannelListItemProps> = ({ currentId, id, name, notification, onClick }) => {
  return(
    <div className='flex justify-between items-center' key={id}>
      <span
        className={cn(s.channelPill, 'headline--xs', {
          [s.channelPill__active]:  id === currentId
        })}
        onClick={() => onClick(id)}
      >
        {name}
      </span>
      {notification && (
        <span className='mr-2'>
          <MissedMessagesIcon></MissedMessagesIcon>
        </span>
      )}
    </div>
  )
}

const LeftSideBar: FC<{ cssClasses?: string; }> = ({ cssClasses }) => {
  const dispatch = useAppDispatch();
  const { openModal, setModalView } = useUI();

  const {
    getClientVersion,
    getVersion,
  } = useNetworkClient();

  const allChannels = useAppSelector(channels.selectors.channels);
  const currentChannelId = useAppSelector(app.selectors.currentChannelId);
  const currentConversationId = useAppSelector(app.selectors.currentConversationId);
  const newDmsNotification = useAppSelector(dms.selectors.newDmsNotifications);

  const selectChannel = useCallback((chId: string) => () => {
    dispatch(app.actions.selectChannel(chId));
    dispatch(channels.actions.dismissNewMessagesNotification(chId))
  }, [dispatch]);

  const selectDm = useCallback((pubkey: string) => () => {
    dispatch(app.actions.selectConversation(pubkey));
    dispatch(dms.actions.dismissNewMessages(pubkey));
  }, [dispatch]);

  const allConversations = useAppSelector(dms.selectors.conversations);

  const [showCreateNewChannel, setShowCreateNewChannel] = useState(false);

  const channelsTitle = useMemo(() => (
    <div className={cn('flex justify-between uppercase')}>
      <span>Joined</span>
      <div className='flex items-center'>
        <Plus
          className={cn('mr-1', s.plus, {})}
          onClick={(e) => {
            if (e && e.stopPropagation) {
              e.stopPropagation();
            }

            setShowCreateNewChannel((v) => !v);
          }}
        />
        
      </div>
    </div>
  ), []);

  const dmsTitle = useMemo(() => (
    <div className={cn('flex justify-between uppercase')}>
      <span>Direct Messages</span>
    </div>
  ), []);

  return (
    <div className={cn(s.root, cssClasses)}>
      <div className={s.header}>
        <div className={s.logo}>
          <SpeakEasy />
        </div>
        <NetworkStatusIcon />
      </div>
      <div className={cn(s.content, 'relative')}>
        {showCreateNewChannel && (
          <Dropdown isOpen={showCreateNewChannel} onChange={setShowCreateNewChannel}>
            <ul style={{ backgroundColor: 'var(--dark-2)', zIndex: 2 }} className='text-right w-full rounded-lg p-2 bold'>
              <li className='px-2 py-1'>
                <button className='underline' onClick={() => {
                  setModalView('CREATE_CHANNEL');
                  openModal();
                  setShowCreateNewChannel(false);
                }}>
                  Create new
                </button>
              </li>
              <li className='px-2 py-1'>
                <button className='underline' onClick={() => {
                  setModalView('JOIN_CHANNEL');
                  openModal();
                  setShowCreateNewChannel(false);
                }}>
                  Join existing by url
                </button>
              </li>
            </ul>
          </Dropdown>
        )}
        <Collapse className='mb-3' title={channelsTitle} defaultActive>
          <div className='flex flex-col'>
            {allChannels.map((ch) => (
              <ChannelListItem
                key={ch.id}
                {...ch}
                currentId={currentChannelId}
                onClick={selectChannel(ch.id)}
                notification={!!ch.hasMissedMessages}
              />
            )
          )}
          </div>
        </Collapse>
        <Collapse title={dmsTitle} defaultActive>
          {allConversations.map((c) => (
            <ChannelListItem
              key={c.pubkey}
              id={c.pubkey}
              currentId={currentConversationId}
              onClick={selectDm(c.pubkey)}
              name={<Identity pubkey={c.pubkey} codeset={c.codeset} />}
              notification={newDmsNotification[c.pubkey]}
            />
          ))}
        </Collapse>
      </div>
      <div className={s.footer}>
        <div className={cn(s.version)}>
          {getClientVersion() && <span>XXDK version {getClientVersion()}</span>}
          {getVersion() && <span>Wasm version {getVersion()}</span>}
          <span>App version 0.3.0</span>
        </div>
      </div>
    </div>
  );
};

export default LeftSideBar;
