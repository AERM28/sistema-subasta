import { useEffect } from 'react';
import PusherService from '../services/PusherService';

export const useAuctionRealtime = (auctionId, listeners = {}) => {
    useEffect(() => {
        if (!auctionId) return;

        PusherService.initialize();

        const channel = `auction-${auctionId}`;
        PusherService.subscribe(channel);

        // Bind event listeners
        if (listeners.onBidCreated) {
            PusherService.bind(channel, 'bid-created', listeners.onBidCreated);
        }

        if (listeners.onAuctionClosed) {
            PusherService.bind(channel, 'auction-closed', listeners.onAuctionClosed);
        }

        if (listeners.onWinnerDetermined) {
            PusherService.bind(channel, 'winner-determined', listeners.onWinnerDetermined);
        }

        if (listeners.onBidSurpassed) {
            PusherService.bind(channel, 'bid-surpassed', listeners.onBidSurpassed);
        }

        return () => {
            PusherService.unsubscribe(channel);
        };
    }, [auctionId, listeners]);
};