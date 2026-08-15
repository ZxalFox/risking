import { useState, useEffect, FormEvent } from "react";
import { Room } from "../../../types/game.types";

interface UseMitigationFormProps {
  room: Room;
  onProposeMitigation?: (description: string) => void;
}

export function useMitigationForm({
  room,
  onProposeMitigation,
}: UseMitigationFormProps) {
  const [isDescribing, setIsDescribing] = useState(false);
  const [mitigationText, setMitigationText] = useState("");

  const currentAttackKey = room.currentAttack
    ? `${room.currentAttack.attackerId}-${room.currentAttack.targetId}-${room.currentAttack.riskCard.id}`
    : null;

  useEffect(() => {
    setIsDescribing(false);
    setMitigationText("");
  }, [currentAttackKey]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = mitigationText.trim();
    if (trimmed && onProposeMitigation) {
      onProposeMitigation(trimmed);
    }
  };

  const cancelDescription = () => {
    setIsDescribing(false);
    setMitigationText("");
  };

  const startDescription = () => {
    setIsDescribing(true);
  };

  return {
    isDescribing,
    mitigationText,
    setMitigationText,
    handleSubmit,
    startDescription,
    cancelDescription,
  };
}
