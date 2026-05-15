// src/utils/campPricing.js
// Week prices must stay in sync with supabase/012_registration_rpc.sql (create_camp_registration).

/**
 * @param {boolean} isClubMember
 * @param {{ pricePerKidPerWeek: number, priceMemberPerKidPerWeek: number }} camp
 */
export function pricePerWeekForKid(isClubMember, camp) {
  return isClubMember
    ? Number(camp.priceMemberPerKidPerWeek)
    : Number(camp.pricePerKidPerWeek);
}

/**
 * @param {Array<{ weeks?: string[], isClubMember?: boolean }>} kids
 * @param {object} camp campData
 */
export function totalCampRegistrationAmount(kids, camp) {
  if (!Array.isArray(kids)) return 0;
  return kids.reduce((sum, kid) => {
    const weeks = Array.isArray(kid.weeks) ? kid.weeks.length : 0;
    return sum + weeks * pricePerWeekForKid(Boolean(kid.isClubMember), camp);
  }, 0);
}
