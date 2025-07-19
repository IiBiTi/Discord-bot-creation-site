import { UserActivity } from '../types';

const MAX_ACTIVITIES = 20;

const getActivityKey = (userId: string) => `dbg_activities_${userId}`;

export const logActivity = (userId: string, type: UserActivity['type'], details: Record<string, any>) => {
    try {
        const key = getActivityKey(userId);
        const storedActivities = localStorage.getItem(key);
        const activities: UserActivity[] = storedActivities ? JSON.parse(storedActivities) : [];

        const newActivity: UserActivity = {
            id: `activity_${Date.now()}`,
            userId,
            type,
            details,
            timestamp: new Date().toISOString(),
        };

        activities.unshift(newActivity); // Add to the beginning

        // Keep the list trimmed to the max size
        const trimmedActivities = activities.slice(0, MAX_ACTIVITIES);

        localStorage.setItem(key, JSON.stringify(trimmedActivities));
    } catch (error) {
        console.error("Failed to log user activity to localStorage:", error);
    }
};

export const getActivitiesForUser = (userId: string): UserActivity[] => {
    try {
        const key = getActivityKey(userId);
        const storedActivities = localStorage.getItem(key);
        if (storedActivities) {
            return JSON.parse(storedActivities);
        }
        return [];
    } catch (error) {
        console.error("Failed to retrieve user activities from localStorage:", error);
        return [];
    }
};
