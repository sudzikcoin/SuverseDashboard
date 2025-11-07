export type CalcInput = {
  taxLiability: number;
  creditPrice: number;
  platformFeePct: number;
  brokerFeePct: number;
  feeBase: "face" | "subtotal";
};

export function compute({
  taxLiability,
  creditPrice,
  platformFeePct,
  brokerFeePct,
  feeBase,
}: CalcInput) {
  const face = taxLiability;
  const costBeforeFees = face * creditPrice;

  const baseForFees = feeBase === "face" ? face : costBeforeFees;
  const platformFee = baseForFees * (platformFeePct / 100);
  const brokerFee = baseForFees * (brokerFeePct / 100);

  const totalCost = costBeforeFees + platformFee + brokerFee;
  const savings = face - totalCost;
  const effectiveDiscountPct = (savings / face) * 100;

  return {
    face,
    creditPrice,
    costBeforeFees,
    platformFee,
    brokerFee,
    totalCost,
    savings,
    effectiveDiscountPct,
  };
}
