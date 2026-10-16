import { cleanup, render, screen } from "@testing-library/svelte";
import { afterEach, describe, expect, it } from "vitest";
import AiUsageBars from "../src/lib/admin/AiUsageBars.svelte";

afterEach(cleanup);
describe("one chart with host-owned precision and presentation", () => {
  it("retains exact decimals, localized axis wording, keyboard meters and native titles", () => {
    const formatter = new Intl.NumberFormat("fr-CA", {
      maximumFractionDigits: 2,
    });
    const format = (value: number) => formatter.format(value);
    const { container } = render(AiUsageBars, {
      props: {
        rows: [
          { day: "2026-01-01", value: 0 },
          { day: "2026-01-02", value: 1234.56 },
        ],
        unit: "units",
        legendText: "Units consumed",
        height: 260,
        ariaLabel: "Daily units",
        dayLabel: (day: string) => day.slice(5),
        dayTitle: (day: string) => `Recorded ${day}`,
        formatValue: format,
        formatAxisValue: format,
        valueTitle: (day: string, value: number) =>
          `${day}: ${format(value)} units consumed`,
        nativeTitles: true,
        style:
          "--ai-usage-axis-width:2.75rem;--ai-usage-caption-font-size:0.75rem",
      },
    });
    const meters = screen.getAllByRole("meter");
    expect(meters[1]?.getAttribute("aria-valuenow")).toBe("1234.56");
    expect(meters[1]?.getAttribute("aria-valuetext")).toBe(
      `${format(1234.56)} units`,
    );
    expect(meters[1]?.getAttribute("aria-label")).toBe(
      "Units consumed on Recorded 2026-01-02",
    );
    expect(meters[1]?.getAttribute("title")).toBe(
      `2026-01-02: ${format(1234.56)} units consumed`,
    );
    expect(meters[1]?.hasAttribute("data-tooltip")).toBe(false);
    const figure = screen.getByRole("group");
    expect(figure.getAttribute("aria-label")).toBe("Daily units");
    expect(figure.style.height).toBe("260px");
    expect(figure.style.getPropertyValue("--ai-usage-axis-width")).toBe(
      "2.75rem",
    );
    expect(container.querySelectorAll("figure")).toHaveLength(1);
    expect(container.querySelector("canvas, table")).toBeNull();
  });
  it("samples a long window while keeping every day as a meter and zero values honest", () => {
    const rows = Array.from({ length: 30 }, (_, n) => ({
      day: `2026-01-${String(n + 1).padStart(2, "0")}`,
      value: 0,
    }));
    const { container } = render(AiUsageBars, { props: { rows } });
    expect(screen.getAllByRole("meter")).toHaveLength(30);
    expect(
      container.querySelectorAll(".ai-usage-chart__x-axis span"),
    ).toHaveLength(5);
    expect(screen.getAllByRole("meter")[0]?.getAttribute("aria-valuemax")).toBe(
      "1",
    );
    expect(
      screen.getAllByRole("meter")[0]?.getAttribute("aria-valuetext"),
    ).toBe("0 tokens");
  });
});
