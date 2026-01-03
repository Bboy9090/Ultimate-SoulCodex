import { storage } from '../storage.js';
import { sendToUser, sendToSession, type PushNotificationPayload } from './push-notifications.js';

const EMA_MESSAGES = {
  morning: [
    {
      title: "Good Morning, Seeker",
      body: "How is your frequency in this present moment?",
      tag: "ema-morning"
    },
    {
      title: "The Day Awakens",
      body: "Take a moment to sense your energetic state right now.",
      tag: "ema-morning"
    },
    {
      title: "Morning Light",
      body: "What emotional frequency are you experiencing as you begin this day?",
      tag: "ema-morning"
    }
  ],
  midday: [
    {
      title: "Present Moment Check",
      body: "Pause. How does your soul feel in this very moment?",
      tag: "ema-midday"
    },
    {
      title: "Midday Anchor",
      body: "Check in with yourself. What's your current emotional state?",
      tag: "ema-midday"
    },
    {
      title: "The Eternal Now",
      body: "Ground yourself. What frequency are you holding right now?",
      tag: "ema-midday"
    }
  ],
  evening: [
    {
      title: "Evening Reflection",
      body: "Before the day closes, how are you feeling in this moment?",
      tag: "ema-evening"
    },
    {
      title: "Twilight Check-In",
      body: "As day transforms to night, sense your current emotional state.",
      tag: "ema-evening"
    },
    {
      title: "The Day's Close",
      body: "Reflect on your present frequency. How is your soul right now?",
      tag: "ema-evening"
    }
  ],
  transition: [
    {
      title: "Moment of Transition",
      body: "You're shifting between states. Notice your emotional frequency.",
      tag: "ema-transition"
    },
    {
      title: "Energy Shift",
      body: "A transition moment. How does your frequency feel right now?",
      tag: "ema-transition"
    },
    {
      title: "Between States",
      body: "In this liminal space, what is your emotional truth?",
      tag: "ema-transition"
    }
  ]
};

function getRandomMessage(category: 'morning' | 'midday' | 'evening' | 'transition'): PushNotificationPayload {
  const messages = EMA_MESSAGES[category];
  const selected = messages[Math.floor(Math.random() * messages.length)];
  return {
    ...selected,
    url: '/life-current',
    data: {
      type: 'ema',
      category,
      timestamp: Date.now()
    }
  };
}

export async function sendEMANotification(
  userId: string,
  category: 'morning' | 'midday' | 'evening' | 'transition'
): Promise<number> {
  const payload = getRandomMessage(category);
  return await sendToUser(userId, payload);
}

export async function sendEMANotificationToSession(
  sessionId: string,
  category: 'morning' | 'midday' | 'evening' | 'transition'
): Promise<number> {
  const payload = getRandomMessage(category);
  return await sendToSession(sessionId, payload);
}

interface ScheduleConfig {
  morning: string;
  midday: string;
  evening: string;
  transition1: string;
  transition2: string;
}

const DEFAULT_SCHEDULE: ScheduleConfig = {
  morning: '09:00',
  midday: '13:00',
  evening: '19:00',
  transition1: '11:30',
  transition2: '16:30'
};

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

function scheduleNotification(
  timeStr: string,
  category: 'morning' | 'midday' | 'evening' | 'transition',
  callback: () => void
): NodeJS.Timeout | null {
  const now = new Date();
  const { hours, minutes } = parseTime(timeStr);
  
  const scheduled = new Date();
  scheduled.setHours(hours, minutes, 0, 0);
  
  if (scheduled <= now) {
    scheduled.setDate(scheduled.getDate() + 1);
  }
  
  const delay = scheduled.getTime() - now.getTime();
  
  if (delay < 0) return null;
  
  return setTimeout(() => {
    callback();
    scheduleNotification(timeStr, category, callback);
  }, delay);
}

let activeSchedules: NodeJS.Timeout[] = [];

export function startEMAScheduler(config: Partial<ScheduleConfig> = {}): void {
  stopEMAScheduler();
  
  const schedule = { ...DEFAULT_SCHEDULE, ...config };
  
  console.log('[EMAScheduler] Starting with schedule:', schedule);
  
  const sendToAllUsers = async (category: 'morning' | 'midday' | 'evening' | 'transition') => {
    console.log(`[EMAScheduler] Sending ${category} notifications`);
    
    const allProfiles = await storage.getAllProfiles();
    
    for (const profile of allProfiles) {
      if (profile.userId) {
        try {
          await sendEMANotification(profile.userId, category);
        } catch (error) {
          console.error(`[EMAScheduler] Error sending to user ${profile.userId}:`, error);
        }
      }
    }
  };
  
  const timers = [
    scheduleNotification(schedule.morning, 'morning', () => sendToAllUsers('morning')),
    scheduleNotification(schedule.midday, 'midday', () => sendToAllUsers('midday')),
    scheduleNotification(schedule.evening, 'evening', () => sendToAllUsers('evening')),
    scheduleNotification(schedule.transition1, 'transition', () => sendToAllUsers('transition')),
    scheduleNotification(schedule.transition2, 'transition', () => sendToAllUsers('transition')),
  ];
  
  activeSchedules = timers.filter((t): t is NodeJS.Timeout => t !== null);
  
  console.log(`[EMAScheduler] ${activeSchedules.length} notifications scheduled`);
}

export function stopEMAScheduler(): void {
  console.log('[EMAScheduler] Stopping scheduler');
  activeSchedules.forEach(timer => clearTimeout(timer));
  activeSchedules = [];
}

export function getScheduleConfig(): ScheduleConfig {
  return DEFAULT_SCHEDULE;
}
