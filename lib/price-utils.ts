import { eachDayOfInterval } from 'date-fns';

export interface RoomDetails {
    id: number;
    title: string;
    price: number;
    basic_price?: number;
    full_price?: number;
}

export interface Discount {
    room_id: number;
    discount_date: string;
    percentage: number;
}

export interface PriceCalculationParams {
    room: RoomDetails;
    checkIn: string; // ISO format or YYYY-MM-DD
    checkOut: string; // ISO format or YYYY-MM-DD
    selectedUnit?: string;
    selectedPackage?: string;
    unitsCount?: number;
    checkInTime?: string;
    checkOutTime?: string;
    addOns?: {
        bbq?: boolean;
        cradle?: boolean;
        karaoke?: 'none' | 'hour' | 'day';
        karaokeHours?: number;
        karaokeDays?: number;
    };
    discounts: Discount[];
}

export function calculatePrice({
    room,
    checkIn,
    checkOut,
    selectedUnit = "",
    selectedPackage = "",
    unitsCount = 1,
    checkInTime = "15:00",
    checkOutTime = "12:00",
    addOns,
    discounts
}: PriceCalculationParams): number {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;

    const diff = endDate.getTime() - startDate.getTime();
    const nights = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));

    const isHomestay2 = room.title.toLowerCase().includes("homestay 2");

    let subtotal = 0;
    if (isHomestay2) {
        const selected = (selectedUnit || "").split(", ").filter(Boolean);
        selected.forEach(u => {
            if (u.includes("1") || u.includes("2")) subtotal += 350;
            else subtotal += 300;
        });
    } else {
        let basePrice = room.price;
        if (selectedPackage === "Basic Package" && room.basic_price) {
            basePrice = room.basic_price;
        } else if (selectedPackage === "Full Package" && room.full_price) {
            basePrice = room.full_price;
        }
        subtotal = basePrice * (unitsCount || 1);
    }

    // Extra hours fee
    let extraHours = 0;
    if (checkOutTime) {
        const [hours, mins] = checkOutTime.split(":").map(Number);
        if (hours > 12 || (hours === 12 && mins > 0)) {
            extraHours = hours - 12 + (mins > 0 ? 1 : 0);
        }
    }

    const isHomestay3or5 = room.title.toLowerCase().includes("homestay 3") || room.title.toLowerCase().includes("homestay 5");
    const lateFeeRate = isHomestay3or5 ? 20 : 10;
    const totalLateFee = Math.max(0, extraHours * lateFeeRate);

    // Add-ons for Homestay 2
    let addOnsPrice = 0;
    if (isHomestay2 && addOns) {
        if (addOns.bbq) addOnsPrice += 30;
        if (addOns.cradle) addOnsPrice += 10;
        if (addOns.karaoke === "hour") addOnsPrice += (25 * (addOns.karaokeHours || 0));
        if (addOns.karaoke === "day") addOnsPrice += (150 * (addOns.karaokeDays || 0));
    }

    const computedPrice = (nights * subtotal) + addOnsPrice + totalLateFee;

    // Apply discount
    let maxDiscount = 0;
    if (discounts && discounts.length > 0) {
        const interval = eachDayOfInterval({ start: startDate, end: endDate });
        const relevantDiscounts = discounts.filter(d =>
            d.room_id === room.id &&
            interval.some(day => {
                const dStr = day.toISOString().split('T')[0];
                return d.discount_date === dStr;
            })
        );

        if (relevantDiscounts.length > 0) {
            maxDiscount = Math.max(...relevantDiscounts.map(d => d.percentage));
        }
    }

    const discountAmount = (computedPrice * maxDiscount) / 100;
    return Math.max(0, computedPrice - discountAmount);
}
