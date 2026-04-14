import { useEffect, useRef } from 'react';
import PusherService from '../services/PusherService';

export const useAuctionRealtime = (auctionId, listeners = {}) => {
    const listenersRef = useRef(listeners);
    useEffect(() => {
        listenersRef.current = listeners;
    });

    useEffect(() => {
        if (!auctionId) return;

        PusherService.initialize();
        const channel = `auction-${auctionId}`;
        PusherService.subscribe(channel);

        const handleBidCreated = (data) => listenersRef.current.onBidCreated?.(data);
        const handleAuctionClosed = (data) => listenersRef.current.onAuctionClosed?.(data);
        const handleWinnerDetermined = (data) => listenersRef.current.onWinnerDetermined?.(data);
        const handleBidSurpassed = (data) => listenersRef.current.onBidSurpassed?.(data);

        PusherService.bind(channel, 'bid-created', handleBidCreated);
        PusherService.bind(channel, 'auction-closed', handleAuctionClosed);
        PusherService.bind(channel, 'winner-determined', handleWinnerDetermined);
        PusherService.bind(channel, 'bid-surpassed', handleBidSurpassed);

        return () => {
            PusherService.unbind(channel, 'bid-created', handleBidCreated);
            PusherService.unbind(channel, 'auction-closed', handleAuctionClosed);
            PusherService.unbind(channel, 'winner-determined', handleWinnerDetermined);
            PusherService.unbind(channel, 'bid-surpassed', handleBidSurpassed);
            PusherService.unsubscribe(channel);
        };
    }, [auctionId]); 
};