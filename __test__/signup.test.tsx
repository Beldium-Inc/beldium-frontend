import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Onboard } from "@/src/features/onboarding/Onboard";
import { signup } from "@/src/features/onboarding/api";
import { showToast } from "@/src/store/toast.store";

jest.mock("@/src/features/onboarding/api", () => ({
  signup: jest.fn(),
}));

jest.mock("@/src/store/toast.store", () => ({
  showToast: jest.fn(),
}));

const mockedSignup = signup as jest.MockedFunction<typeof signup>;

const baseData = { name: "", email: "", preferences: [], role: "miner" as const };

describe("Onboard (signup)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("shows validation errors when submitted empty", async () => {
    const onNext = jest.fn();
    render(<Onboard data={baseData} onNext={onNext} />);

    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/company name is required/i)).toBeInTheDocument();
    expect(mockedSignup).not.toHaveBeenCalled();
    expect(onNext).not.toHaveBeenCalled();
  });

  it("rejects a weak password without calling signup", async () => {
    const onNext = jest.fn();
    render(<Onboard data={baseData} onNext={onNext} />);

    await userEvent.type(screen.getByPlaceholderText("Acme Corporation"), "Acme Ltd");
    await userEvent.type(screen.getByPlaceholderText("08012345678"), "08012345678");
    await userEvent.type(screen.getByPlaceholderText("company@email.com"), "new@yopmail.com");
    await userEvent.type(screen.getByPlaceholderText("Enter password"), "weak");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/minimum 8 characters/i)).toBeInTheDocument();
    expect(mockedSignup).not.toHaveBeenCalled();
  });

  it("submits a valid signup, marks the user as registered, and advances the wizard", async () => {
    mockedSignup.mockResolvedValue({ status: "success" });
    const onNext = jest.fn();
    render(<Onboard data={{ ...baseData, role: "miner" }} onNext={onNext} />);

    await userEvent.type(screen.getByPlaceholderText("Acme Corporation"), "Acme Ltd");
    await userEvent.type(screen.getByPlaceholderText("08012345678"), "08012345678");
    await userEvent.type(screen.getByPlaceholderText("company@email.com"), "new@yopmail.com");
    await userEvent.type(screen.getByPlaceholderText("Enter password"), "Password1!");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockedSignup).toHaveBeenCalledWith({
        email: "new@yopmail.com",
        password: "Password1!",
        company_name: "Acme Ltd",
        phone_number: "08012345678",
        device_token: "string",
        device_type: "web",
        role: "Miner",
      });
    });

    await waitFor(() => expect(onNext).toHaveBeenCalled());
    expect(localStorage.getItem("hasRegistered")).toBe("true");
    expect(showToast).toHaveBeenCalledWith(
      "Sign up successful. Check your email for the 6-digit code.",
      "success",
    );
  });

  it("shows an error toast and does not advance when signup fails", async () => {
    mockedSignup.mockRejectedValue({
      response: { data: { message: "Email already registered" } },
    });
    const onNext = jest.fn();
    render(<Onboard data={baseData} onNext={onNext} />);

    await userEvent.type(screen.getByPlaceholderText("Acme Corporation"), "Acme Ltd");
    await userEvent.type(screen.getByPlaceholderText("08012345678"), "08012345678");
    await userEvent.type(screen.getByPlaceholderText("company@email.com"), "dup@yopmail.com");
    await userEvent.type(screen.getByPlaceholderText("Enter password"), "Password1!");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith("Email already registered", "error");
    });
    expect(onNext).not.toHaveBeenCalled();
  });
});
