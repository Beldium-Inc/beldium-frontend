import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Login } from "@/src/features/login/Login";
import { login, getUser } from "@/src/features/onboarding/api";
import { showToast } from "@/src/store/toast.store";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("@/src/features/onboarding/api", () => ({
  login: jest.fn(),
  getUser: jest.fn(),
}));

jest.mock("@/src/store/toast.store", () => ({
  showToast: jest.fn(),
}));

const mockedLogin = login as jest.MockedFunction<typeof login>;
const mockedGetUser = getUser as jest.MockedFunction<typeof getUser>;

describe("Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  it("shows validation errors when submitted empty", async () => {
    render(<Login />);
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText(/email address is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it("logs in successfully, stores tokens, and routes miners to /dashboard", async () => {
    mockedLogin.mockResolvedValue({
      data: { access: "access-token", refresh: "refresh-token" },
    });
    mockedGetUser.mockResolvedValue({
      data: { has_completed_onboarding: true, role: "Miner" },
    });

    render(<Login />);
    await userEvent.type(screen.getByPlaceholderText("company@email.com"), "miner@yopmail.com");
    await userEvent.type(screen.getByPlaceholderText("Enter password"), "Password1!");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith({
        email: "miner@yopmail.com",
        password: "Password1!",
      });
    });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });

    expect(sessionStorage.getItem("accessToken")).toBe("access-token");
    expect(sessionStorage.getItem("refreshToken")).toBe("refresh-token");
    expect(showToast).toHaveBeenCalledWith("Login successful", "success");
  });

  it("routes compliance users who have not completed onboarding to /complianceonboarding", async () => {
    mockedLogin.mockResolvedValue({ data: { access: "tok", refresh: "ref" } });
    mockedGetUser.mockResolvedValue({
      data: { has_completed_onboarding: false, role: "Compliance" },
    });

    render(<Login />);
    await userEvent.type(screen.getByPlaceholderText("company@email.com"), "compliance@yopmail.com");
    await userEvent.type(screen.getByPlaceholderText("Enter password"), "Password1!");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/complianceonboarding");
    });
  });

  it("shows an error toast and does not navigate when login fails", async () => {
    mockedLogin.mockRejectedValue({
      response: { data: { message: "Invalid credentials" } },
    });

    render(<Login />);
    await userEvent.type(screen.getByPlaceholderText("company@email.com"), "miner@yopmail.com");
    await userEvent.type(screen.getByPlaceholderText("Enter password"), "wrongpass");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith("Invalid credentials", "error");
    });
    expect(pushMock).not.toHaveBeenCalled();
  });
});
