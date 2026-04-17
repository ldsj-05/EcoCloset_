import { render } from "@testing-library/react-native";
import PurchaseAdviceScreen from "../app/purchaseAdvice";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("PurchaseAdviceScreen", () => {
  test("renders screen title", () => {
    const { getByText } = render(<PurchaseAdviceScreen />);
    expect(getByText("Purchase Advice")).toBeTruthy();
  });

  test("renders subtitle text", () => {
    const { getByText } = render(<PurchaseAdviceScreen />);
    expect(
      getByText(
        "Enter a potential item and see how well it fits your current wardrobe.",
      ),
    ).toBeTruthy();
  });

  test("renders item name input", () => {
    const { getByPlaceholderText } = render(<PurchaseAdviceScreen />);
    expect(getByPlaceholderText("Enter item name")).toBeTruthy();
  });

  test("renders get purchase advice button", () => {
    const { getByText } = render(<PurchaseAdviceScreen />);
    expect(getByText("Get Purchase Advice")).toBeTruthy();
  });
});
