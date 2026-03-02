import { eachDayOfInterval, format, addDays, parseISO, isBefore, isPast, isSameDay, isWithinInterval } from "date-fns";

// Mock variables that represent the state
let checkIn = null;
let checkOut = null;
const room = {
    id: 3,
    title: "Homestay 3",
    price: 3000,
    basic_price: 1500,
    full_price: 3000
};

const discounts = {
    "2026-03-01_3": { roomId: 3, percentage: 10 },
    "2026-03-02_3": { roomId: 3, percentage: 10 }
};

let unitsCount = 1;
let selectedPackage = "Basic Package"; // RM 1500
let addOnsPrice = 0;
let totalLateFee = 0;

function getDiscountForDate(day, roomId) {
    const y = day.getFullYear();
    const m = String(day.getMonth() + 1).padStart(2, "0");
    const d = String(day.getDate()).padStart(2, "0");
    const dateKey = `${y}-${m}-${d}`;
    const compositeKey = `${dateKey}_${roomId}`;
    const discount = discounts[compositeKey];
    return discount ? discount.percentage : 0;
}

function calculateTotalDiscount(checkIn, checkOut, roomId) {
    if (!checkIn || !checkOut || !roomId) return 0;
    const interval = eachDayOfInterval({ start: checkIn, end: checkOut });
    if (interval.length > 1) {
        interval.pop();
    }
    const discountPercentages = interval.map(d => getDiscountForDate(d, roomId)).filter(p => p > 0);
    return discountPercentages.length > 0 ? Math.max(...discountPercentages) : 0;
}

function calculateTotalPrice() {
    let subtotal = 0;
    let basePrice = room.price;
    if (selectedPackage === "Basic Package" && room.basic_price) {
        basePrice = room.basic_price;
    } else if (selectedPackage === "Full Package" && room.full_price) {
        basePrice = room.full_price;
    }
    subtotal = basePrice * unitsCount;

    let nights = 0;
    if (checkIn && checkOut) {
        const diff = checkOut.getTime() - checkIn.getTime();
        nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    const computedPrice = ((nights || 1) * subtotal) + addOnsPrice + totalLateFee;

    let finalPrice = computedPrice;
    if (checkIn && checkOut && room.id) {
        const totalDiscountPercentage = calculateTotalDiscount(checkIn, checkOut, room.id);
        const discountAmount = (computedPrice * totalDiscountPercentage) / 100;
        finalPrice = Math.max(0, computedPrice - discountAmount);
    }

    return { nights, computedPrice, finalPrice, unitsCount, subtotal };
}

// simulate clicks
function clickDate(dayStr) {
    const day = parseISO(dayStr);

    if (!checkIn || (checkIn && checkOut)) {
        checkIn = day;
        checkOut = null;
    } else if (checkIn && !checkOut) {
        if (isBefore(day, checkIn)) {
            checkIn = day;
            checkOut = null;
        } else {
            checkOut = day;
        }
    }
    console.log(`State after clicking ${dayStr}: checkIn=${checkIn ? format(checkIn, 'yyyy-MM-dd') : null}, checkOut=${checkOut ? format(checkOut, 'yyyy-MM-dd') : null}`);
    console.log("Price:", calculateTotalPrice());
}

clickDate("2026-03-01");
clickDate("2026-03-02");
console.log("--- SPAM ---");
clickDate("2026-03-01");
clickDate("2026-03-02");
console.log("--- SPAM ---");
clickDate("2026-03-01");
clickDate("2026-03-02");
