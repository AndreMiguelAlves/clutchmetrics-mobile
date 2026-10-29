
import { authenticatedFetch } from './api';

export type SubscriptionPlanCode = 'FREE' | 'PREMIUM';

export interface SubscriptionResponse {
    id: number;
    planCode: SubscriptionPlanCode;
    planName: string;
    monthlyPrice: number;
    unlimitedAnalytics: boolean;
    export4k: boolean;
    watermarkEnabled: boolean;
    startedAt: string | null;
    endsAt: string | null;
    autoRenew: boolean;
    active: boolean;
}

export async function getMySubscription():
    Promise<SubscriptionResponse> {

    const response = await authenticatedFetch(
        '/api/subscription/me',
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        }
    );

    if (!response.ok) {
        throw new Error(
            'Could not load your subscription.'
        );
    }

    return response.json() as Promise<SubscriptionResponse>;
}

export async function changeSubscriptionPlan(
    planCode: SubscriptionPlanCode
): Promise<SubscriptionResponse> {

    const response = await authenticatedFetch(
        '/api/subscription/change-plan',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ planCode }),
        }
    );

    if (!response.ok) {
        const errorData = await response
            .json()
            .catch(() => null);

        throw new Error(
            errorData?.message ??
            'Could not change subscription plan.'
        );
    }

    return response.json() as Promise<SubscriptionResponse>;
}
