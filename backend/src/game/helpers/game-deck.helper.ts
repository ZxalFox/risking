import { PlayerEntity } from "../../database/entities/player.entity";
import {
  MOCK_RISK_CARDS,
  MOCK_MITIGATION_CARDS,
} from "../constants/game-cards.constants";

export function drawRandomCards<T>(deck: T[], amount: number): T[] {
  // eslint-disable-next-line sonarjs/pseudo-random
  const shuffled = [...deck].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, amount);
}

export function dealInitialPlayerHands(players: PlayerEntity[]): void {
  for (const p of players) {
    p.money = 30;
    p.riskCards = drawRandomCards(MOCK_RISK_CARDS, 3);
    p.mitigationCards = drawRandomCards(MOCK_MITIGATION_CARDS, 2);
  }
}
