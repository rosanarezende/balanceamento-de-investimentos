import { formatCurrency, cn } from "@/lib/utils"

describe("Utils", () => {
  describe("formatCurrency", () => {
    it("should format positive numbers correctly", () => {
      expect(formatCurrency(1234.56)).toBe("R$ 1.234,56")
      expect(formatCurrency(0)).toBe("R$ 0,00")
      expect(formatCurrency(1000000)).toBe("R$ 1.000.000,00")
    })

    it("should format negative numbers correctly", () => {
      expect(formatCurrency(-1234.56)).toBe("-R$ 1.234,56")
      expect(formatCurrency(-0.5)).toBe("-R$ 0,50")
    })

    it("should handle decimal places correctly", () => {
      expect(formatCurrency(1234.5678)).toBe("R$ 1.234,57") // Arredondamento
      expect(formatCurrency(1234)).toBe("R$ 1.234,00") // Sem casas decimais
      expect(formatCurrency(1234.5)).toBe("R$ 1.234,50") // Uma casa decimal
    })

    // New tests for edge cases and error handling
    it("should handle very large numbers", () => {
      expect(formatCurrency(123456789012345)).toBe("R$ 123.456.789.012.345,00")
    })

    it("should handle very small numbers", () => {
      expect(formatCurrency(0.0001)).toBe("R$ 0,00")
    })

    it("should handle NaN", () => {
      expect(formatCurrency(NaN)).toBe("R$ NaN")
    })

    it("should handle Infinity", () => {
      expect(formatCurrency(Infinity)).toBe("R$ Infinity")
    })

    it("should handle -Infinity", () => {
      expect(formatCurrency(-Infinity)).toBe("R$ -Infinity")
    })
  })

  describe("cn", () => {
    it("should merge class names correctly", () => {
      expect(cn("class1", "class2")).toBe("class1 class2")
      expect(cn("class1", undefined, "class2")).toBe("class1 class2")
      expect(cn("class1", false && "class2", true && "class3")).toBe("class1 class3")
      expect(cn("class1", { class2: true, class3: false })).toBe("class1 class2")
    })

    it("should handle conditional classes", () => {
      const isActive = true
      const isDisabled = false

      expect(cn("base", isActive && "active", isDisabled && "disabled")).toBe("base active")
      expect(cn("base", { active: isActive, disabled: isDisabled })).toBe("base active")
    })

    it("should handle empty or falsy values", () => {
      expect(cn()).toBe("")
      expect(cn("", null, undefined, false, 0)).toBe("")
      expect(cn("class1", "", null)).toBe("class1")
    })

    // New tests for edge cases and error handling
    it("should handle arrays of class names", () => {
      expect(cn(["class1", "class2"])).toBe("class1 class2")
      expect(cn(["class1", undefined, "class2"])).toBe("class1 class2")
    })

    it("should handle nested arrays of class names", () => {
      expect(cn(["class1", ["class2", "class3"]])).toBe("class1 class2 class3")
    })

    it("should handle objects with conditional class names", () => {
      expect(cn({ class1: true, class2: false })).toBe("class1")
      expect(cn({ class1: true, class2: true })).toBe("class1 class2")
    })

    it("should handle mixed arrays and objects", () => {
      expect(cn(["class1", { class2: true, class3: false }])).toBe("class1 class2")
    })
  })
})
