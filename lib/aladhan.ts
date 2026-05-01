import type { PrayerTimes } from "@/lib/types";

const fallbackPrayerTimes: PrayerTimes = {
  Fajr: "05:05 AM",
  Sunrise: "06:25 AM",
  Dhuhr: "12:20 PM",
  Asr: "03:45 PM",
  Maghrib: "06:12 PM",
  Isha: "07:45 PM",
  Jumuah: "01:15 PM",
};

export async function getPrayerTimes(lat: number, lng: number) {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=2`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      throw new Error("Unable to load prayer times");
    }

    const payload = (await response.json()) as { data?: { timings?: PrayerTimes } };
    const timings = payload.data?.timings;

    if (!timings) {
      return fallbackPrayerTimes;
    }

    return timings;
  } catch {
    return fallbackPrayerTimes;
  }
}