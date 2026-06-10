import { IUser } from "../models/User";

export interface MatchResult {
  score: number;
  reasons: string[];
}

export const calculateMatchScore = (
  currentUser: IUser,
  targetUser: IUser
): MatchResult => {
  let score = 0;

  const reasons: string[] = [];

  /* ==========================
     OFFERS SKILL I WANT
  ========================== */

  const wantedSkills =
    currentUser.skillsWanted.map(
      (s: any) => s.skill.toString()
    );

  const targetOffers =
    targetUser.skillsOffered.map(
      (s: any) => s.skill.toString()
    );

  const offerMatch =
    targetOffers.find(skill =>
      wantedSkills.includes(skill)
    );

  if (offerMatch) {
    score += 50;

    reasons.push(
      "Offers a skill you want"
    );
  }

  /* ==========================
     WANTS SKILL I OFFER
  ========================== */

  const currentOffers =
    currentUser.skillsOffered.map(
      (s: any) => s.skill.toString()
    );

  const targetWants =
    targetUser.skillsWanted.map(
      (s: any) => s.skill.toString()
    );

  const reverseMatch =
    targetWants.find(skill =>
      currentOffers.includes(skill)
    );

  if (reverseMatch) {
    score += 50;

    reasons.push(
      "Interested in a skill you teach"
    );
  }

  /* ==========================
     LANGUAGE MATCH
  ========================== */

  const commonLanguage =
    currentUser.languages.find(
      lang =>
        targetUser.languages.includes(
          lang
        )
    );

  if (commonLanguage) {
    score += 20;

    reasons.push(
      `Speaks ${commonLanguage}`
    );
  }

  /* ==========================
     REPUTATION
  ========================== */

  if (targetUser.rating >= 4) {
    score += 20;

    reasons.push(
      "Highly rated"
    );
  }

  /* ==========================
     EXPERIENCE
  ========================== */

  if (
    targetUser.completedSessions >= 10
  ) {
    score += 10;

    reasons.push(
      "Experienced mentor"
    );
  }

  return {
    score,
    reasons,
  };
};