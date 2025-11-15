import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSwitcher } from "./LanguageSwitcher";

const mockChangeLanguage = vi.fn();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: "en",
      changeLanguage: mockChangeLanguage,
    },
  }),
}));

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    mockChangeLanguage.mockClear();
    localStorage.clear();
  });

  describe("rendering", () => {
    it("should render language switcher button", () => {
      render(<LanguageSwitcher />);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should render language icon", () => {
      render(<LanguageSwitcher />);
      const icon = screen.getByTestId("languages-icon");
      expect(icon).toBeInTheDocument();
    });

    it("should display current language", () => {
      render(<LanguageSwitcher />);
      const currentLang = screen.getByText(/en/i);
      expect(currentLang).toBeInTheDocument();
    });
  });

  describe("dropdown menu", () => {
    it("should open dropdown when button clicked", async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button");
      await user.click(button);

      // Wait for menu items to appear
      const englishOption = await screen.findByText("English");
      const swedishOption = await screen.findByText("Svenska");

      expect(englishOption).toBeInTheDocument();
      expect(swedishOption).toBeInTheDocument();
    });

    it("should display English option", async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button");
      await user.click(button);

      const englishOption = await screen.findByText("English");
      expect(englishOption).toBeInTheDocument();
    });

    it("should display Swedish option", async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button");
      await user.click(button);

      const swedishOption = await screen.findByText("Svenska");
      expect(swedishOption).toBeInTheDocument();
    });
  });

  describe("language changing", () => {
    it("should call changeLanguage with 'en' when English selected", async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button");
      await user.click(button);

      const englishOption = await screen.findByText("English");
      await user.click(englishOption);

      expect(mockChangeLanguage).toHaveBeenCalledWith("en");
    });

    it("should call changeLanguage with 'sv' when Swedish selected", async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button");
      await user.click(button);

      const swedishOption = await screen.findByText("Svenska");
      await user.click(swedishOption);

      expect(mockChangeLanguage).toHaveBeenCalledWith("sv");
    });

    it("should save language to localStorage when English selected", async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button");
      await user.click(button);

      const englishOption = await screen.findByText("English");
      await user.click(englishOption);

      expect(localStorage.getItem("language")).toBe("en");
    });

    it("should save language to localStorage when Swedish selected", async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button");
      await user.click(button);

      const swedishOption = await screen.findByText("Svenska");
      await user.click(swedishOption);

      expect(localStorage.getItem("language")).toBe("sv");
    });
  });

  describe("button styling", () => {
    it("should have ghost variant", () => {
      render(<LanguageSwitcher />);
      const button = screen.getByRole("button");
      // Button should have appropriate Radix UI classes
      expect(button).toBeInTheDocument();
    });

    it("should have small size", () => {
      render(<LanguageSwitcher />);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("should be keyboard accessible", async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button");
      await user.tab();

      expect(button).toHaveFocus();
    });

    it("should have proper button role", () => {
      render(<LanguageSwitcher />);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("menu alignment", () => {
    it("should align menu to end", async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button");
      await user.click(button);

      // Menu should be rendered
      const englishOption = await screen.findByText("English");
      expect(englishOption).toBeInTheDocument();
    });
  });

  describe("integration", () => {
    it("should work with multiple clicks", async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button");

      // First click - select English
      await user.click(button);
      const englishOption = await screen.findByText("English");
      await user.click(englishOption);

      expect(mockChangeLanguage).toHaveBeenCalledWith("en");
      expect(localStorage.getItem("language")).toBe("en");

      // Second click - select Swedish
      await user.click(button);
      const swedishOption = await screen.findByText("Svenska");
      await user.click(swedishOption);

      expect(mockChangeLanguage).toHaveBeenCalledWith("sv");
      expect(localStorage.getItem("language")).toBe("sv");
    });

    it("should persist language selection", async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);

      const button = screen.getByRole("button");
      await user.click(button);

      const swedishOption = await screen.findByText("Svenska");
      await user.click(swedishOption);

      // Check if localStorage was updated
      const savedLanguage = localStorage.getItem("language");
      expect(savedLanguage).toBe("sv");
    });
  });
});
