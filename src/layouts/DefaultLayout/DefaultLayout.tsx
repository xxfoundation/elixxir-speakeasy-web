import type { WithChildren } from 'src/types';

import cn from 'classnames';
import React, { FC, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';

import { LeftSideBar, RightSideBar } from 'src/components/common';
import Modal from 'src/components/modals/Modal';
import { ModalViews, useUI } from 'src/contexts/ui-context';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useAuthentication } from 'src/contexts/authentication-context';
import { PrivacyLevel, useUtils } from 'src/contexts/utils-context';
import AuthenticationUI from './AuthenticationUI';
import NotificationBanner from 'src/components/common/NotificationBanner';

import {
  CreateChannelView,
  ClaimAdminKeys,
  LoadingView,
  JoinChannelView,
  ShareChannelView,
  LeaveChannelConfirmationView,
  NickNameSetView,
  ChannelSettingsView,
  SettingsView,
  ExportCodenameView,
  NetworkNotReadyView,
  JoinChannelSuccessView,
  LogoutView,
  UserWasMuted,
  ViewPinnedMessages,
  ExportAdminKeys
} from 'src/components/modals';

import s from './DefaultLayout.module.scss';
import ViewMutedUsers from '@components/modals/ViewMutedUsers';
import UpdatesModal from './UpdatesModal';
import SecretModal from './SecretModal';
import useToggle from 'src/hooks/useToggle';
import ConnectingDimmer from './ConnectingDimmer';
import UserInfoDrawer from '@components/common/UserInfoDrawer';

type ModalMap = Omit<Record<ModalViews, React.ReactNode>, 'IMPORT_CODENAME'>;

const AuthenticatedUserModals: FC = () => {
  const { closeModal, displayModal, modalView = '' } = useUI();
  const modalClass = modalView?.toLowerCase().replace(/_/g, '-');

  const modals = useMemo<ModalMap>(() => ({
    CLAIM_ADMIN_KEYS: <ClaimAdminKeys />,
    EXPORT_CODENAME:  <ExportCodenameView />,
    EXPORT_ADMIN_KEYS: <ExportAdminKeys />,
    SHARE_CHANNEL: <ShareChannelView />,
    CREATE_CHANNEL: <CreateChannelView />,
    JOIN_CHANNEL: <JoinChannelView />,
    LOGOUT: <LogoutView />,
    LOADING: <LoadingView />,
    LEAVE_CHANNEL_CONFIRMATION: <LeaveChannelConfirmationView />,
    SET_NICK_NAME: <NickNameSetView />,
    CHANNEL_SETTINGS: <ChannelSettingsView />,
    SETTINGS: <SettingsView />,
    NETWORK_NOT_READY: <NetworkNotReadyView />,
    JOIN_CHANNEL_SUCCESS: <JoinChannelSuccessView />,
    USER_WAS_MUTED: <UserWasMuted />,
    VIEW_MUTED_USERS: <ViewMutedUsers />,
    VIEW_PINNED_MESSAGES: <ViewPinnedMessages />
  }), []);

  return displayModal && modalView && modalView !== 'IMPORT_CODENAME' ? (
    <Modal className={s[modalClass]} onClose={closeModal}>
      {modals[modalView]}
    </Modal>
  ) : null;
};

const DefaultLayout: FC<WithChildren> = ({
  children,
}) => {
  const router = useRouter();
  const { isAuthenticated, storageTag } = useAuthentication();
  const { utilsLoaded } = useUtils();
  const {
    cmix,
    getShareUrlType,
    isNetworkHealthy
  } = useNetworkClient();
  const { openModal, setChannelInviteLink, setModalView } = useUI();
  const [rightSideCollapsed, { set: setRightSideCollapsed, toggle }] = useToggle(false);

  useEffect(() => {
    const privacyLevel = getShareUrlType(window.location.href);
    if (
      privacyLevel !== null &&
      cmix &&
      isNetworkHealthy &&
      isAuthenticated &&
      storageTag &&
      window.location.search &&
      [
        PrivacyLevel.Private,
        PrivacyLevel.Secret
      ].includes(privacyLevel)
    ) {
      setChannelInviteLink(window.location.href);
      setModalView('JOIN_CHANNEL');
      openModal();
      router.replace(window.location.pathname);
    }
  }, [
    cmix,
    isAuthenticated,
    isNetworkHealthy,
    storageTag,
    getShareUrlType,
    setChannelInviteLink,
    setModalView,
    openModal,
    router
  ]);

  useEffect(() => {
    const adjustActiveState = () => {
      if (window?.innerWidth <= 760) {
        setRightSideCollapsed(false);
      }
    };

    adjustActiveState();
    window?.addEventListener('resize', adjustActiveState);
    return () => window?.removeEventListener('resize', adjustActiveState);
  }, [setRightSideCollapsed]);

  return (
    <>
      <NotificationBanner />
      <UpdatesModal />
      <SecretModal />
      <div className={cn(s.root, { [s.collapsed]: rightSideCollapsed } )}>
        {utilsLoaded ? (
          isAuthenticated ? (
            <>
              <ConnectingDimmer />
              <UserInfoDrawer />
              <LeftSideBar cssClasses={s.leftSideBar} />
              <main>{children}</main>
              <RightSideBar
                collapsed={rightSideCollapsed}
                onToggle={toggle}
                cssClasses={s.rightSideBar} />
              <AuthenticatedUserModals />
            </>
          ) : (
            <AuthenticationUI />
          )
        ) : (
          null
        )}
      </div>
    </>
    
  );
};

export default DefaultLayout;
