import { FC, useCallback } from 'react';

import React, { useMemo } from 'react';
import cn from 'classnames';

import { Elixxir } from 'src/components/icons';
import classes from './Identity.module.scss';
import { useNetworkClient } from '@contexts/network-client-context';
import { useAppDispatch } from 'src/store/hooks';
import * as app from 'src/store/app';
import { useUtils } from '@contexts/utils-context';

type Props = {
  disableMuteStyles?: boolean;
  nickname?: string;
  muted?: boolean;
  pubkey: string;
  codeset: number;
  clickable?: boolean;
}

const Identity: FC<Props> = ({ clickable = false, codeset, disableMuteStyles, nickname, pubkey }) => {
  const { getCodeNameAndColor } = useUtils();
  const { userIsMuted } = useNetworkClient();
  const dispatch = useAppDispatch();
  const isMuted = useMemo(
    () => !disableMuteStyles && userIsMuted(pubkey),
    [disableMuteStyles, pubkey, userIsMuted]
  );
  
  const { codename, color } = useMemo(
    () => getCodeNameAndColor(pubkey, codeset),
    [codeset, getCodeNameAndColor, pubkey]
  )
  const colorHex = isMuted ? 'var(--dark-2)' : color.replace('0x', '#');
  const codenameColor = isMuted
    ? 'var(--dark-2)'
    : (nickname
      ? '#73767C'
      : colorHex);

  const onClick = useCallback(() => {
    if (clickable) {
      dispatch(app.actions.selectUser(pubkey));
    }
  }, [clickable, dispatch, pubkey])
  

  return (
    <span onClick={onClick} title={`${nickname ? `${nickname} – ` : ''}${codename}`} className={cn(classes.root, { [classes.clickable]: clickable })}>
      {nickname && (
        <>
          <span className='nickname' style={{ color: colorHex }}>
            {nickname}
          </span>
          &nbsp;
        </>
      )}
      <span style={{ whiteSpace: 'nowrap' }}>
        <Elixxir style={{ fill: codenameColor }} />
        <span className='codename' style={{ color: codenameColor }}>
          {codename}
        </span>
      </span>
      {isMuted && (
        <>
          &nbsp;
          <span style={{ color: 'var(--red)'}}>(muted)</span>
        </>
      )}
    </span>
  );
}

export default Identity;
