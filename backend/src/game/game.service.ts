import { Injectable } from '@nestjs/common';
import { Player, Room, RiskCard, MitigationCard, Mitigation } from './game.types';

@Injectable()
export class GameService {
  private rooms: Map<string, Room> = new Map();

  // Mock data for MVP
  private readonly MOCK_MITIGATIONS: Mitigation[] = [
    { id: 'm1', description: 'Ter um representante da equipe no local do cliente.' },
    { id: 'm2', description: 'Envolva a equipe de testes no projeto desde o início.' },
    { id: 'm3', description: 'Realizar workshops de levantamento com stakeholders.' },
    { id: 'm4', description: 'Estimativa detalhada de custo e cronograma.' }
  ];

  private readonly MOCK_RISK_CARDS: RiskCard[] = [
    {
      id: 'r1',
      category: '1. Tarefa',
      description: 'Indisponibilidade de documentos de requisitos para testes',
      mitigations: [this.MOCK_MITIGATIONS[0], this.MOCK_MITIGATIONS[1]]
    },
    {
      id: 'r2',
      category: '1. Tarefa',
      description: 'Requisitos ambíguos ou conflitantes',
      mitigations: [this.MOCK_MITIGATIONS[2]]
    },
    {
      id: 'r3',
      category: '2. Estrutura',
      description: 'Horários e cronogramas irreais',
      mitigations: [this.MOCK_MITIGATIONS[3]]
    },
    {
      id: 'r4',
      category: '3. Ator',
      description: 'Alta rotatividade na equipe',
      mitigations: [{ id: 'm5', description: 'Plano de retenção e reconhecimento' }]
    },
    {
      id: 'r5',
      category: '4. Tecnologia',
      description: 'Ferramentas de build instáveis',
      mitigations: [{ id: 'm6', description: 'Automatizar pipelines' }]
    }
  ];

  private readonly MOCK_MITIGATION_CARDS: MitigationCard[] = [
    { id: 'mc1', category: '1. Tarefa', mitigations: [this.MOCK_MITIGATIONS[0], this.MOCK_MITIGATIONS[1], this.MOCK_MITIGATIONS[2]] },
    { id: 'mc2', category: '2. Estrutura', mitigations: [this.MOCK_MITIGATIONS[3]] },
    { id: 'mc3', category: '3. Ator', mitigations: [{ id: 'm5', description: 'Plano de retenção e reconhecimento' }] },
    { id: 'mc4', category: '4. Tecnologia', mitigations: [{ id: 'm6', description: 'Automatizar pipelines' }] },
    { id: 'mc5', category: '1. Tarefa', mitigations: [this.MOCK_MITIGATIONS[2]] }
  ];

  createRoom(): string {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.rooms.set(roomId, {
      id: roomId,
      players: [],
      status: 'waiting',
      currentRound: 0,
      currentPlayerIndex: 0
    });
    return roomId;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  joinRoom(roomId: string, player: Omit<Player, 'money' | 'riskCards' | 'mitigationCards'>): Room {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Sala não encontrada');
    if (room.status !== 'waiting') throw new Error('Jogo já começou');
    if (room.players.length >= 5) throw new Error('Sala cheia');
    
    // Check if player already exists, if so update socket, else push
    const existing = room.players.find(p => p.nickname === player.nickname);
    if (existing) {
      existing.id = player.id; // update socket id
    } else {
      room.players.push({
        ...player,
        money: 0,
        riskCards: [],
        mitigationCards: []
      });
    }

    return room;
  }

  leaveRoom(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.players = room.players.filter(p => p.id !== playerId);
      if (room.players.length === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  startGame(roomId: string): Room {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Sala não encontrada');
    if (room.players.length < 2) throw new Error('Mínimo 2 jogadores');

    room.status = 'playing';
    room.currentRound = 1;
    room.currentPlayerIndex = 0; // The MVP could randomize, but we will pick the first (creator) for simplicity

    // Deal cards and money
    room.players.forEach(p => {
      p.money = 30; // 4 notes of 5, 1 note of 10. Just an integer for MVP.
      p.riskCards = this.getRandomCards(this.MOCK_RISK_CARDS, 3);
      p.mitigationCards = this.getRandomCards(this.MOCK_MITIGATION_CARDS, 2);
    });

    return room;
  }

  attack(roomId: string, attackerId: string, targetId: string, riskCardId: string): Room {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Sala não encontrada');
    if (room.status !== 'playing') throw new Error('Jogo não está em andamento');

    const attacker = room.players.find(p => p.id === attackerId);
    const riskCardIndex = attacker?.riskCards.findIndex(c => c.id === riskCardId);
    
    if (!attacker || riskCardIndex === undefined || riskCardIndex === -1) {
       throw new Error('Carta ou atacante inválido');
    }

    const riskCard = attacker.riskCards.splice(riskCardIndex, 1)[0];
    
    room.currentAttack = {
      attackerId,
      targetId,
      riskCard
    };

    return room;
  }

  defend(roomId: string, targetId: string, success: boolean, mitigationCardId?: string): Room {
    const room = this.rooms.get(roomId);
    if (!room || !room.currentAttack || room.currentAttack.targetId !== targetId) {
      throw new Error('Nenhum ataque contra este jogador');
    }

    const target = room.players.find(p => p.id === targetId);
    const attacker = room.players.find(p => p.id === room.currentAttack!.attackerId);

    if (!target || !attacker) throw new Error('Jogadores inválidos');

    if (mitigationCardId) {
      // Automatic defense by discarding a mitigation card of same category
      const mcIndex = target.mitigationCards.findIndex(c => c.id === mitigationCardId);
      if (mcIndex !== -1) {
        const mc = target.mitigationCards[mcIndex];
        if (mc.category === room.currentAttack.riskCard.category) {
          target.mitigationCards.splice(mcIndex, 1);
          success = true;
        } else {
          success = false; // Invalid category used
        }
      }
    }

    if (success) {
      // Attack failed (good defense) -> Attacker pays 5 to defender
      attacker.money -= 5;
      target.money += 5;
    } else {
      // Attack successful -> Defender pays 5 to attacker
      target.money -= 5;
      attacker.money += 5;
    }

    delete room.currentAttack;

    // Next player turn
    room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;

    // If a full circle happened, deal a new card to everyone? 
    // Spec says "no começo de cada rodada, todos recebem 1 carta de risco".
    // For MVP, if currentPlayerIndex goes back to 0, increment round.
    if (room.currentPlayerIndex === 0) {
      room.currentRound++;
      if (room.currentRound > 4) {
        room.status = 'finished';
      } else {
        room.players.forEach(p => {
          p.riskCards.push(...this.getRandomCards(this.MOCK_RISK_CARDS, 1));
        });
      }
    }

    return room;
  }

  private getRandomCards<T>(deck: T[], amount: number): T[] {
    // Very simple randomizer for MVP
    const shuffled = [...deck].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, amount);
  }
}
