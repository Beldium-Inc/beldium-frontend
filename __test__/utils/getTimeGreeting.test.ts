import { getTimeGreeting } from "@/src/utils"
import { DatePicker } from "antd"


describe('getTimeGreeting', ()=> {

    it("returns 'Good morning' for hours before 12", () => {
        const morningDate = new Date(2026, 0, 1, 8); // 8 AM
        expect(getTimeGreeting(morningDate)).toBe("Good morning");
    });

    it("returns 'Good afternoon' for hours from 12 to 17", () => {
        const afternoonDate = new Date(2026, 0, 1, 14); // 2 PM
        expect(getTimeGreeting(afternoonDate)).toBe("Good afternoon");
    });

    it("returns 'Good evening' for hours 18 and above", () => {
        const eveningDate = new Date(2026, 0, 1, 20); // 8 PM
        expect(getTimeGreeting(eveningDate)).toBe("Good evening");
    });

    it("returns greeting for current time when no date is provided", () => {
        const result = getTimeGreeting(); // uses new Date()
        const hour = new Date().getHours();

        if (hour < 12) {
        expect(result).toBe("Good morning");
        } else if (hour < 18) {
        expect(result).toBe("Good afternoon");
        } else {
        expect(result).toBe("Good evening");
        }
    });
})