import { PlayerEntity } from "../../database/entities/player.entity";
import { RoomEntity } from "../../database/entities/room.entity";
import { MitigationCard } from "../game.types";
import { MOCK_RISK_CARDS } from "../constants/game-cards.constants";
import { drawRandomCards } from "./game-deck.helper";

export const DEFENSE_TRANSFER_AMOUNT = 5;
export const MAX_ROUNDS = 4;

export function resolveMitigationCardMatch(
  target: PlayerEntity,
  mitigationCardId?: string,
  attackCategoryId?: string,
): boolean {
  if (!mitigationCardId) return false;
  const mcIndex = target.mitigationCards.findIndex(
    (c: MitigationCard) => c.id === mitigationCardId,
  );
  if (
    mcIndex !== -1 &&
    target.mitigationCards[mcIndex].categoryId === attackCategoryId
  ) {
    target.mitigationCards.splice(mcIndex, 1);
    return true;
  }
  return false;
}

export function applyDefenseFinancialConsequences(
  attacker: PlayerEntity,
  target: PlayerEntity,
  success: boolean,
): void {
  if (success) {
    attacker.money -= DEFENSE_TRANSFER_AMOUNT;
    target.money += DEFENSE_TRANSFER_AMOUNT;
  } else {
    target.money -= DEFENSE_TRANSFER_AMOUNT;
    attacker.money += DEFENSE_TRANSFER_AMOUNT;
  }
}

export function advanceRoomTurn(room: RoomEntity): void {
  room.currentAttack = null;
  room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;

  if (room.currentPlayerIndex === 0) {
    room.currentRound++;
    if (room.currentRound > MAX_ROUNDS) {
      room.status = "finished";
    } else {
      for (const p of room.players) {
        p.riskCards.push(...drawRandomCards(MOCK_RISK_CARDS, 1));
      }
    }
  }
}
